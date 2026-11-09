"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endSessionBackend = exports.startSession = exports.receivePaymentNotification = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();
const db = admin.database();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "the-listener-secure-secret-2026";
const DEFAULT_RATE_PAISE_PER_MIN = 250; // ₹2.50 per min (₹5 per 2 min)
const MIN_WITHDRAWAL_PAISE = 20000; // ₹200.00
/**
 * 1. Webhook endpoint receiving parsed payment notifications from the Python MacroDroid Gateway
 */
exports.receivePaymentNotification = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    // Validate HMAC signature if provided
    const signature = req.headers["x-listener-signature"];
    if (signature) {
        const computedSig = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (signature !== computedSig) {
            res.status(401).json({ error: "Invalid HMAC signature" });
            return;
        }
    }
    const { timestamp, client_ip, app_source, amount_rupees, amount_paise, utr_ref, order_id, sender, raw_text, destination_vpa } = req.body;
    try {
        // 1. Log notification in admin private notifications
        const notifRef = db.ref("admin/notifications").push();
        await notifRef.set({
            title: `Potential Payment: ₹${amount_rupees}`,
            message: `Received ₹${amount_rupees} via ${app_source}. ${utr_ref ? `UTR: ${utr_ref}` : ""}`,
            type: "payment",
            data: {
                amount_rupees,
                amount_paise,
                utr_ref,
                order_id,
                sender,
                raw_text,
                destination_vpa,
                client_ip,
                timestamp
            },
            read: false,
            timestamp: Date.now()
        });
        // 2. If order_id or exact matching pending topup exists, match it
        let matchedOrder = null;
        if (order_id) {
            const orderSnap = await db.ref(`topups/${order_id}`).get();
            if (orderSnap.exists() && orderSnap.val().status === "pending") {
                matchedOrder = orderSnap.val();
            }
        }
        // Auto-credit if strict match (order matches and amount matches)
        if (matchedOrder && matchedOrder.amountPaise === amount_paise && utr_ref) {
            await db.ref(`topups/${matchedOrder.id}`).update({
                status: "credited",
                utrRef: utr_ref,
                rawNotificationText: raw_text,
                confirmedAt: Date.now(),
                confirmedBy: "MacroDroid-AutoWebhook",
                updatedAt: Date.now()
            });
            // Credit wallet
            const walletRef = db.ref(`wallets/${matchedOrder.uid}`);
            await walletRef.transaction((current) => {
                if (!current) {
                    return {
                        uid: matchedOrder.uid,
                        balancePaise: amount_paise,
                        totalSpentPaise: 0,
                        totalEarnedPaise: 0,
                        withdrawablePaise: 0,
                        reservedPaise: 0,
                        updatedAt: Date.now()
                    };
                }
                return {
                    ...current,
                    balancePaise: (current.balancePaise || 0) + amount_paise,
                    updatedAt: Date.now()
                };
            });
            // Notify Talker
            await db.ref(`notifications/${matchedOrder.uid}`).push().set({
                title: "Wallet Top-up Successful!",
                message: `₹${amount_rupees} has been credited to your wallet balance.`,
                type: "success",
                read: false,
                timestamp: Date.now()
            });
            res.status(200).json({ status: "matched_and_credited", orderId: matchedOrder.id });
            return;
        }
        res.status(200).json({ status: "received_for_admin_reconciliation" });
    }
    catch (err) {
        console.error("Payment notification processing error:", err);
        res.status(500).json({ error: err.message });
    }
});
/**
 * 2. Start Conversation Session with Balance Check
 */
exports.startSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    }
    const { talkerId, listenerId, type } = data;
    const talkerWalletSnap = await db.ref(`wallets/${talkerId}`).get();
    const wallet = talkerWalletSnap.val();
    if (!wallet || (wallet.balancePaise || 0) < 500) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient wallet balance. Please add at least ₹5 to start.");
    }
    const newRef = db.ref("sessions").push();
    const sessionId = newRef.key;
    await newRef.set({
        id: sessionId,
        type: type || "chat",
        talkerId,
        listenerId,
        status: "active",
        startedAt: Date.now(),
        ratePaisePerMin: DEFAULT_RATE_PAISE_PER_MIN
    });
    return { sessionId };
});
/**
 * 3. End Session & Atomic Wallet Settlement
 */
exports.endSessionBackend = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    }
    const { sessionId } = data;
    const sessionSnap = await db.ref(`sessions/${sessionId}`).get();
    if (!sessionSnap.exists()) {
        throw new functions.https.HttpsError("not-found", "Session not found");
    }
    const session = sessionSnap.val();
    const now = Date.now();
    const startedAt = session.startedAt || now;
    const billableSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
    // Charge: ratePaisePerMin / 60 * billableSeconds
    const rate = session.ratePaisePerMin || DEFAULT_RATE_PAISE_PER_MIN;
    const totalChargePaise = Math.round((billableSeconds * rate) / 60);
    const listenerEarningsPaise = totalChargePaise; // 0% commission initially
    await db.ref(`sessions/${sessionId}`).update({
        status: "ended",
        endedAt: now,
        billableSeconds,
        totalChargePaise,
        listenerEarningsPaise
    });
    // Atomic debit talker
    if (totalChargePaise > 0) {
        await db.ref(`wallets/${session.talkerId}`).transaction((curr) => {
            if (!curr)
                return null;
            return {
                ...curr,
                balancePaise: Math.max(0, (curr.balancePaise || 0) - totalChargePaise),
                totalSpentPaise: (curr.totalSpentPaise || 0) + totalChargePaise,
                updatedAt: Date.now()
            };
        });
        // Atomic credit listener
        await db.ref(`wallets/${session.listenerId}`).transaction((curr) => {
            if (!curr)
                return null;
            return {
                ...curr,
                withdrawablePaise: (curr.withdrawablePaise || 0) + listenerEarningsPaise,
                totalEarnedPaise: (curr.totalEarnedPaise || 0) + listenerEarningsPaise,
                updatedAt: Date.now()
            };
        });
    }
    return { success: true, billableSeconds, totalChargePaise };
});
//# sourceMappingURL=index.js.map