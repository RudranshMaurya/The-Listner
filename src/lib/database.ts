import {
  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue,
  onDisconnect,
  serverTimestamp,
  query,
  orderByChild,
  equalTo
} from "firebase/database";
import { db } from "./firebase";
import type {
  UserProfile,
  ListenerProfile,
  ListenerSchedule,
  ListenerStatus,
  Appointment,
  Session,
  ChatMessage,
  Wallet,
  WalletTransaction,
  TopupOrder,
  WithdrawalRequest,
  Review,
  AppNotification,
  AdminPlatformConfig,
  AuditLog
} from "../types";
import { DEFAULT_RATE_PAISE_PER_MIN, MIN_WITHDRAWAL_PAISE, calculateCharge, calculateEarningsSplit } from "./billing";

// ==========================================
// USER & LISTENER PROFILES
// ==========================================

/**
 * Recursively strips all undefined properties from an object or nested structure.
 * Firebase Realtime Database strictly rejects any payload containing `undefined`.
 */
export function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as any;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await get(ref(db, `profiles/${uid}`));
  return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
}

export async function saveUserProfile(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  const existing = await getUserProfile(profile.uid);
  const data: Partial<UserProfile> = {
    uid: profile.uid,
    email: profile.email || existing?.email || "",
    displayName: profile.displayName || existing?.displayName || "Anonymous",
    photoURL: profile.photoURL || existing?.photoURL || "",
    role: profile.role || existing?.role || "talker",
    location: profile.location ?? existing?.location ?? "India",
    timezone: profile.timezone ?? existing?.timezone ?? "Asia/Kolkata",
    preferredLanguage: profile.preferredLanguage ?? existing?.preferredLanguage ?? "English",
    bio: profile.bio ?? existing?.bio ?? "",
    topics: profile.topics ?? existing?.topics ?? [],
    termsAccepted: profile.termsAccepted ?? existing?.termsAccepted ?? true,
    onboardingCompleted: profile.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now()
  };

  const ageVal = profile.age !== undefined ? profile.age : existing?.age;
  if (ageVal !== undefined) {
    data.age = ageVal;
  }

  const genderVal = profile.gender !== undefined ? profile.gender : existing?.gender;
  if (genderVal !== undefined) {
    data.gender = genderVal;
  }

  const cleanedData = removeUndefined(data);
  await set(ref(db, `profiles/${profile.uid}`), cleanedData);
  await set(ref(db, `users/${profile.uid}`), removeUndefined({
    uid: cleanedData.uid,
    email: cleanedData.email,
    displayName: cleanedData.displayName,
    role: cleanedData.role,
    updatedAt: Date.now()
  }));
}

export async function getListenerProfile(uid: string): Promise<ListenerProfile | null> {
  const snapshot = await get(ref(db, `listenerProfiles/${uid}`));
  return snapshot.exists() ? (snapshot.val() as ListenerProfile) : null;
}

export async function saveListenerProfile(listener: Partial<ListenerProfile> & { uid: string }): Promise<void> {
  const existing = await getListenerProfile(listener.uid);
  const data: Partial<ListenerProfile> = {
    uid: listener.uid,
    displayName: listener.displayName || existing?.displayName || "Listener",
    photoURL: listener.photoURL || existing?.photoURL || "",
    bio: listener.bio || existing?.bio || "Here to listen with empathy and warmth.",
    yearsExperience: listener.yearsExperience ?? existing?.yearsExperience ?? 1,
    topics: listener.topics || existing?.topics || ["General conversations"],
    languages: listener.languages || existing?.languages || ["English", "Hindi"],
    pricingPaisePerMin: listener.pricingPaisePerMin ?? existing?.pricingPaisePerMin ?? DEFAULT_RATE_PAISE_PER_MIN,
    rating: existing?.rating || 5.0,
    totalReviews: existing?.totalReviews || 0,
    totalSessions: existing?.totalSessions || 0,
    totalListeningMinutes: existing?.totalListeningMinutes || 0,
    isVerified: existing?.isVerified || false,
    verificationScore: listener.verificationScore ?? existing?.verificationScore ?? 0,
    verificationStatus: listener.verificationStatus || existing?.verificationStatus || "unsubmitted",
    status: listener.status || existing?.status || "idle",
    lastActive: Date.now(),
    showAge: listener.showAge ?? existing?.showAge ?? true,
    showGender: listener.showGender ?? existing?.showGender ?? true
  };

  const ageVal = listener.age !== undefined ? listener.age : existing?.age;
  if (ageVal !== undefined) {
    data.age = ageVal;
  }

  const genderVal = listener.gender !== undefined ? listener.gender : existing?.gender;
  if (genderVal !== undefined) {
    data.gender = genderVal;
  }

  await set(ref(db, `listenerProfiles/${listener.uid}`), removeUndefined(data));
}

export const SEED_LISTENERS: ListenerProfile[] = [
  {
    uid: "listener-seed-1",
    displayName: "Ananya Sen",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Passionate about providing a calm, non-judgmental space. I listen with patience, warmth, and full attention.",
    age: 26,
    gender: "Female",
    yearsExperience: 4,
    topics: ["Personal growth", "Friendship", "Family", "Loneliness"],
    languages: ["English", "Hindi"],
    pricingPaisePerMin: 250,
    rating: 4.9,
    totalReviews: 24,
    totalSessions: 38,
    totalListeningMinutes: 420,
    isVerified: true,
    verificationScore: 95,
    verificationStatus: "passed",
    status: "idle",
    lastActive: Date.now(),
    showAge: true,
    showGender: true
  },
  {
    uid: "listener-seed-2",
    displayName: "Aarav Sharma",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Here to listen to whatever you are carrying. No advice, no judgment, just an empathetic ear whenever you need one.",
    age: 28,
    gender: "Male",
    yearsExperience: 3,
    topics: ["Career", "Work stress", "Relationships", "Motivation"],
    languages: ["English", "Hindi"],
    pricingPaisePerMin: 250,
    rating: 5.0,
    totalReviews: 31,
    totalSessions: 52,
    totalListeningMinutes: 590,
    isVerified: true,
    verificationScore: 100,
    verificationStatus: "passed",
    status: "idle",
    lastActive: Date.now(),
    showAge: true,
    showGender: true
  },
  {
    uid: "listener-seed-3",
    displayName: "Pooja Verma",
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    bio: "Life gets heavy sometimes. I am here to help you unpack your thoughts at your own pace.",
    age: 29,
    gender: "Female",
    yearsExperience: 5,
    topics: ["Daily life", "Life experiences", "Relationships", "Loneliness"],
    languages: ["English", "Hindi", "Marathi"],
    pricingPaisePerMin: 250,
    rating: 4.8,
    totalReviews: 19,
    totalSessions: 29,
    totalListeningMinutes: 340,
    isVerified: true,
    verificationScore: 90,
    verificationStatus: "passed",
    status: "busy",
    lastActive: Date.now(),
    showAge: true,
    showGender: true
  }
];

export async function seedInitialListenersIfEmpty(): Promise<void> {
  try {
    const snap = await get(ref(db, "listenerProfiles"));
    if (!snap.exists()) {
      for (const listener of SEED_LISTENERS) {
        await set(ref(db, `listenerProfiles/${listener.uid}`), listener);
      }
    }
  } catch (err) {
    // Ignore if permission denied in read-only environment
  }
}

export async function getAllListeners(): Promise<ListenerProfile[]> {
  await seedInitialListenersIfEmpty();
  const snapshot = await get(ref(db, "listenerProfiles"));
  if (!snapshot.exists()) return SEED_LISTENERS;
  const val = snapshot.val();
  return Object.values(val) as ListenerProfile[];
}

export function subscribeToListeners(callback: (listeners: ListenerProfile[]) => void) {
  seedInitialListenersIfEmpty().catch(() => {});
  return onValue(ref(db, "listenerProfiles"), (snapshot) => {
    if (snapshot.exists()) {
      callback(Object.values(snapshot.val()) as ListenerProfile[]);
    } else {
      callback(SEED_LISTENERS);
    }
  });
}

export function subscribeToListener(uid: string, callback: (listener: ListenerProfile | null) => void) {
  return onValue(ref(db, `listenerProfiles/${uid}`), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as ListenerProfile) : null);
  });
}

// ==========================================
// PRESENCE & STATUS SYSTEM
// ==========================================

export async function setListenerStatus(uid: string, status: ListenerStatus): Promise<void> {
  await update(ref(db, `listenerProfiles/${uid}`), {
    status,
    lastActive: Date.now()
  });
  await set(ref(db, `listenerAvailability/${uid}`), {
    status,
    updatedAt: Date.now()
  });
}

export function setupPresence(uid: string) {
  const userStatusRef = ref(db, `presence/${uid}`);
  const connectedRef = ref(db, ".info/connected");

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      onDisconnect(userStatusRef).set({
        state: "offline",
        lastChanged: serverTimestamp()
      });

      set(userStatusRef, {
        state: "online",
        lastChanged: serverTimestamp()
      });
    }
  });
}

// ==========================================
// SCHEDULES
// ==========================================

export const DEFAULT_WEEKLY_SCHEDULE: ListenerSchedule["weekly"] = {
  monday: { enabled: true, slots: [{ start: "10:00", end: "14:00" }, { start: "18:00", end: "22:00" }] },
  tuesday: { enabled: true, slots: [{ start: "10:00", end: "14:00" }, { start: "18:00", end: "22:00" }] },
  wednesday: { enabled: true, slots: [{ start: "10:00", end: "14:00" }, { start: "18:00", end: "22:00" }] },
  thursday: { enabled: true, slots: [{ start: "10:00", end: "14:00" }, { start: "18:00", end: "22:00" }] },
  friday: { enabled: true, slots: [{ start: "10:00", end: "14:00" }, { start: "18:00", end: "22:00" }] },
  saturday: { enabled: true, slots: [{ start: "11:00", end: "17:00" }] },
  sunday: { enabled: false, slots: [] }
};

export async function getListenerSchedule(uid: string): Promise<ListenerSchedule> {
  const snapshot = await get(ref(db, `listenerSchedules/${uid}`));
  if (snapshot.exists()) {
    return snapshot.val() as ListenerSchedule;
  }
  return {
    uid,
    weekly: DEFAULT_WEEKLY_SCHEDULE,
    acceptsImmediate: true,
    acceptsAppointments: true,
    timezone: "Asia/Kolkata",
    updatedAt: Date.now()
  };
}

export async function saveListenerSchedule(schedule: ListenerSchedule): Promise<void> {
  await set(ref(db, `listenerSchedules/${schedule.uid}`), schedule);
}

// ==========================================
// APPOINTMENTS
// ==========================================

export async function createAppointment(appointment: Omit<Appointment, "id" | "createdAt" | "status">): Promise<string> {
  const newRef = push(ref(db, "appointments"));
  const id = newRef.key!;
  const data: Appointment = {
    ...appointment,
    id,
    status: "confirmed",
    createdAt: Date.now()
  };
  await set(newRef, data);

  // Send notifications to both
  await createNotification(appointment.listenerId, {
    title: "New Appointment Booked",
    message: `${appointment.talkerName} booked a session for ${appointment.date} at ${appointment.timeSlot}.`,
    type: "info",
    link: "/listener/appointments"
  });

  await createNotification(appointment.talkerId, {
    title: "Appointment Confirmed",
    message: `Your session with ${appointment.listenerName} on ${appointment.date} at ${appointment.timeSlot} is confirmed.`,
    type: "success",
    link: "/talker/appointments"
  });

  return id;
}

export function subscribeToAppointments(
  userId: string,
  role: "talker" | "listener",
  callback: (appointments: Appointment[]) => void
) {
  const appointmentsRef = ref(db, "appointments");
  return onValue(appointmentsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const val = snapshot.val();
    const list = Object.values(val) as Appointment[];
    const filtered = list.filter((a) => (role === "talker" ? a.talkerId === userId : a.listenerId === userId));
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    callback(filtered);
  });
}

export async function updateAppointmentStatus(appointmentId: string, status: Appointment["status"]): Promise<void> {
  await update(ref(db, `appointments/${appointmentId}`), {
    status,
    updatedAt: Date.now()
  });
}

// ==========================================
// REAL-TIME CONVERSATION SESSIONS
// ==========================================

export async function requestSession(options: {
  talkerId: string;
  talkerName: string;
  talkerPhoto: string;
  listenerId: string;
  listenerName: string;
  listenerPhoto: string;
  type: "chat" | "audio";
}): Promise<string> {
  const newRef = push(ref(db, "sessions"));
  const id = newRef.key!;
  const session: Session = {
    id,
    type: options.type,
    talkerId: options.talkerId,
    talkerName: options.talkerName,
    talkerPhoto: options.talkerPhoto,
    listenerId: options.listenerId,
    listenerName: options.listenerName,
    listenerPhoto: options.listenerPhoto,
    status: "requested",
    requestedAt: Date.now(),
    durationSeconds: 0,
    billableSeconds: 0,
    ratePaisePerMin: DEFAULT_RATE_PAISE_PER_MIN,
    totalChargePaise: 0,
    listenerEarningsPaise: 0,
    platformFeePaise: 0
  };

  await set(newRef, session);

  // Notify listener of incoming conversation request
  await createNotification(options.listenerId, {
    title: options.type === "audio" ? "Incoming Audio Call" : "New Chat Request",
    message: `${options.talkerName} wants to connect with you now.`,
    type: "info",
    link: `/session/${id}`
  });

  return id;
}

export function subscribeToSession(sessionId: string, callback: (session: Session | null) => void) {
  return onValue(ref(db, `sessions/${sessionId}`), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as Session) : null);
  });
}

export async function acceptSession(sessionId: string): Promise<void> {
  const now = Date.now();
  await update(ref(db, `sessions/${sessionId}`), {
    status: "active",
    acceptedAt: now,
    startedAt: now
  });

  const snap = await get(ref(db, `sessions/${sessionId}`));
  if (snap.exists()) {
    const s = snap.val() as Session;
    await setListenerStatus(s.listenerId, "listening");
  }
}

export async function rejectSession(sessionId: string, reason?: string): Promise<void> {
  await update(ref(db, `sessions/${sessionId}`), {
    status: "rejected",
    endedAt: Date.now(),
    endReason: reason || "Listener declined"
  });
}

export async function endSession(sessionId: string, endedByUid: string, reason?: string): Promise<Session> {
  const snap = await get(ref(db, `sessions/${sessionId}`));
  if (!snap.exists()) throw new Error("Session not found");
  const session = snap.val() as Session;

  const now = Date.now();
  const startedAt = session.startedAt || session.acceptedAt || now;
  const rawDuration = Math.max(0, Math.floor((now - startedAt) / 1000));
  const billableSeconds = session.status === "active" ? rawDuration : 0;

  // Trusted billing calculation
  const totalChargePaise = calculateCharge(billableSeconds, session.ratePaisePerMin || DEFAULT_RATE_PAISE_PER_MIN);
  const { listenerEarningsPaise, platformFeePaise } = calculateEarningsSplit(totalChargePaise, 0);

  const updatedSession: Session = {
    ...session,
    status: "ended",
    endedAt: now,
    durationSeconds: rawDuration,
    billableSeconds,
    totalChargePaise,
    listenerEarningsPaise,
    platformFeePaise,
    endReason: reason || `Ended by user ${endedByUid}`
  };

  await set(ref(db, `sessions/${sessionId}`), updatedSession);

  // Return listener to idle
  await setListenerStatus(session.listenerId, "idle");

  // Reconcile wallets if there was a billable charge
  if (totalChargePaise > 0) {
    // Debit talker wallet
    await adjustWalletBalance(
      session.talkerId,
      -totalChargePaise,
      "session_debit",
      `Paid for ${session.type} conversation with ${session.listenerName}`,
      sessionId
    );

    // Credit listener wallet
    await adjustListenerEarnings(
      session.listenerId,
      listenerEarningsPaise,
      `Earnings from ${session.type} conversation with ${session.talkerName}`,
      sessionId
    );

    // Update listener statistics
    const listenerProfile = await getListenerProfile(session.listenerId);
    if (listenerProfile) {
      await update(ref(db, `listenerProfiles/${session.listenerId}`), {
        totalSessions: (listenerProfile.totalSessions || 0) + 1,
        totalListeningMinutes: (listenerProfile.totalListeningMinutes || 0) + Math.ceil(billableSeconds / 60)
      });
    }
  }

  // Create notifications
  await createNotification(session.talkerId, {
    title: "Conversation Completed",
    message: `Your conversation ended. Duration: ${Math.ceil(billableSeconds / 60)} min. Please share your rating!`,
    type: "info",
    link: `/session/${sessionId}`
  });

  await createNotification(session.listenerId, {
    title: "Session Completed",
    message: `Session completed. You earned ₹${(listenerEarningsPaise / 100).toFixed(2)}.`,
    type: "success",
    link: `/listener/earnings`
  });

  return updatedSession;
}

export function subscribeToUserSessions(
  userId: string,
  role: "talker" | "listener",
  callback: (sessions: Session[]) => void
) {
  return onValue(ref(db, "sessions"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const val = snapshot.val();
    const list = Object.values(val) as Session[];
    const filtered = list.filter((s) => (role === "talker" ? s.talkerId === userId : s.listenerId === userId));
    filtered.sort((a, b) => (b.startedAt || b.requestedAt) - (a.startedAt || a.requestedAt));
    callback(filtered);
  });
}

// ==========================================
// CHAT MESSAGES & TYPING
// ==========================================

export async function sendMessage(sessionId: string, message: Omit<ChatMessage, "id" | "timestamp">): Promise<string> {
  const newRef = push(ref(db, `sessionMessages/${sessionId}`));
  const id = newRef.key!;
  const data: ChatMessage = {
    ...message,
    id,
    timestamp: Date.now()
  };
  await set(newRef, data);
  return id;
}

export function subscribeToMessages(sessionId: string, callback: (messages: ChatMessage[]) => void) {
  return onValue(ref(db, `sessionMessages/${sessionId}`), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const val = snapshot.val();
    const list = Object.values(val) as ChatMessage[];
    list.sort((a, b) => a.timestamp - b.timestamp);
    callback(list);
  });
}

export function setTypingIndicator(sessionId: string, uid: string, isTyping: boolean) {
  set(ref(db, `typingIndicators/${sessionId}/${uid}`), {
    isTyping,
    timestamp: Date.now()
  });
}

export function subscribeToTyping(sessionId: string, callback: (typingMap: Record<string, boolean>) => void) {
  return onValue(ref(db, `typingIndicators/${sessionId}`), (snapshot) => {
    if (!snapshot.exists()) {
      callback({});
      return;
    }
    const val = snapshot.val();
    const result: Record<string, boolean> = {};
    for (const [uid, data] of Object.entries(val as Record<string, any>)) {
      result[uid] = !!data?.isTyping && Date.now() - (data.timestamp || 0) < 5000;
    }
    callback(result);
  });
}

// ==========================================
// WALLET & FINANCIAL ENGINE
// ==========================================

export async function getWallet(uid: string): Promise<Wallet> {
  const snapshot = await get(ref(db, `wallets/${uid}`));
  if (snapshot.exists()) {
    return snapshot.val() as Wallet;
  }
  const initialWallet: Wallet = {
    uid,
    balancePaise: 0,
    totalSpentPaise: 0,
    totalEarnedPaise: 0,
    withdrawablePaise: 0,
    reservedPaise: 0,
    updatedAt: Date.now()
  };
  await set(ref(db, `wallets/${uid}`), initialWallet);
  return initialWallet;
}

export function subscribeToWallet(uid: string, callback: (wallet: Wallet | null) => void) {
  return onValue(ref(db, `wallets/${uid}`), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as Wallet) : null);
  });
}

export async function adjustWalletBalance(
  uid: string,
  amountPaiseChange: number,
  type: WalletTransaction["type"],
  description: string,
  referenceId?: string
): Promise<Wallet> {
  const wallet = await getWallet(uid);
  const prevBalance = wallet.balancePaise;
  const newBalance = Math.max(0, prevBalance + amountPaiseChange);
  const totalSpent = amountPaiseChange < 0 ? wallet.totalSpentPaise + Math.abs(amountPaiseChange) : wallet.totalSpentPaise;

  const updatedWallet: Wallet = {
    ...wallet,
    balancePaise: newBalance,
    totalSpentPaise: totalSpent,
    updatedAt: Date.now()
  };

  await set(ref(db, `wallets/${uid}`), updatedWallet);

  // Add ledger entry
  const ledgerRef = push(ref(db, `walletLedger/${uid}`));
  const tx: WalletTransaction = {
    id: ledgerRef.key!,
    uid,
    type,
    amountPaise: amountPaiseChange,
    previousBalancePaise: prevBalance,
    newBalancePaise: newBalance,
    description,
    referenceId,
    timestamp: Date.now()
  };
  await set(ledgerRef, tx);

  return updatedWallet;
}

export async function adjustListenerEarnings(
  uid: string,
  earningsPaise: number,
  description: string,
  referenceId?: string
): Promise<Wallet> {
  const wallet = await getWallet(uid);
  const prevWithdrawable = wallet.withdrawablePaise;
  const newWithdrawable = prevWithdrawable + earningsPaise;
  const newTotalEarned = wallet.totalEarnedPaise + earningsPaise;

  const updatedWallet: Wallet = {
    ...wallet,
    withdrawablePaise: newWithdrawable,
    totalEarnedPaise: newTotalEarned,
    updatedAt: Date.now()
  };

  await set(ref(db, `wallets/${uid}`), updatedWallet);

  const ledgerRef = push(ref(db, `walletLedger/${uid}`));
  const tx: WalletTransaction = {
    id: ledgerRef.key!,
    uid,
    type: "session_credit",
    amountPaise: earningsPaise,
    previousBalancePaise: prevWithdrawable,
    newBalancePaise: newWithdrawable,
    description,
    referenceId,
    timestamp: Date.now()
  };
  await set(ledgerRef, tx);

  return updatedWallet;
}

export function subscribeToLedger(uid: string, callback: (txs: WalletTransaction[]) => void) {
  return onValue(ref(db, `walletLedger/${uid}`), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const val = snapshot.val();
    const list = Object.values(val) as WalletTransaction[];
    list.sort((a, b) => b.timestamp - a.timestamp);
    callback(list);
  });
}

// ==========================================
// TOPUPS & PAYMENTS
// ==========================================

export async function createTopupOrder(order: TopupOrder): Promise<void> {
  await set(ref(db, `topups/${order.id}`), order);
}

export function subscribeToTopup(orderId: string, callback: (order: TopupOrder | null) => void) {
  return onValue(ref(db, `topups/${orderId}`), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as TopupOrder) : null);
  });
}

export function subscribeToUserTopups(uid: string, callback: (orders: TopupOrder[]) => void) {
  return onValue(ref(db, "topups"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as TopupOrder[];
    const userOrders = list.filter((o) => o.uid === uid);
    userOrders.sort((a, b) => b.createdAt - a.createdAt);
    callback(userOrders);
  });
}

export async function cancelTopupOrder(orderId: string): Promise<void> {
  await remove(ref(db, `topups/${orderId}`));
}

export async function confirmTopupPayment(orderId: string, utrRef: string, adminIdentifier: string): Promise<void> {
  const snap = await get(ref(db, `topups/${orderId}`));
  if (!snap.exists()) throw new Error("Order not found");
  const order = snap.val() as TopupOrder;

  if (order.status === "credited") {
    return; // idempotent
  }

  // Update order status
  await update(ref(db, `topups/${orderId}`), {
    status: "credited",
    utrRef,
    confirmedAt: Date.now(),
    confirmedBy: adminIdentifier,
    updatedAt: Date.now()
  });

  // Credit Talker's wallet
  await adjustWalletBalance(
    order.uid,
    order.amountPaise,
    "topup",
    `UPI Wallet Topup verified (UTR: ${utrRef})`,
    orderId
  );

  // Notify Talker
  await createNotification(order.uid, {
    title: "Wallet Top-up Successful!",
    message: `₹${order.amountRupees.toFixed(2)} has been credited to your wallet. You are ready to connect.`,
    type: "success",
    link: "/talker/wallet"
  });
}

// ==========================================
// WITHDRAWALS
// ==========================================

export async function requestWithdrawal(uid: string, listenerName: string, amountRupees: number, upiId: string): Promise<string> {
  const amountPaise = Math.round(amountRupees * 100);
  if (amountPaise < MIN_WITHDRAWAL_PAISE) {
    throw new Error(`Minimum withdrawal amount is ₹${(MIN_WITHDRAWAL_PAISE / 100).toFixed(2)}.`);
  }

  const wallet = await getWallet(uid);
  if (wallet.withdrawablePaise < amountPaise) {
    throw new Error("Insufficient withdrawable earnings balance.");
  }

  // Reserve funds
  await set(ref(db, `wallets/${uid}`), {
    ...wallet,
    withdrawablePaise: wallet.withdrawablePaise - amountPaise,
    reservedPaise: (wallet.reservedPaise || 0) + amountPaise,
    updatedAt: Date.now()
  });

  const newRef = push(ref(db, "withdrawals"));
  const id = newRef.key!;
  const request: WithdrawalRequest = {
    id,
    uid,
    listenerName,
    amountRupees,
    amountPaise,
    upiId,
    status: "requested",
    requestedAt: Date.now()
  };

  await set(newRef, request);

  // Admin notification
  await push(ref(db, "admin/notifications"), {
    title: `New Withdrawal Request: ₹${amountRupees.toFixed(2)}`,
    message: `${listenerName} requested a payout of ₹${amountRupees.toFixed(2)} to UPI: ${upiId}`,
    type: "withdrawal",
    data: { withdrawalId: id, amountRupees, upiId, uid },
    read: false,
    timestamp: Date.now()
  });

  return id;
}

export function subscribeToUserWithdrawals(uid: string, callback: (requests: WithdrawalRequest[]) => void) {
  return onValue(ref(db, "withdrawals"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as WithdrawalRequest[];
    const userWithdrawals = list.filter((w) => w.uid === uid);
    userWithdrawals.sort((a, b) => b.requestedAt - a.requestedAt);
    callback(userWithdrawals);
  });
}

export async function processWithdrawalPayout(
  withdrawalId: string,
  newStatus: WithdrawalRequest["status"],
  utrRef?: string,
  adminNote?: string,
  adminIdentifier?: string
): Promise<void> {
  const snap = await get(ref(db, `withdrawals/${withdrawalId}`));
  if (!snap.exists()) throw new Error("Withdrawal request not found");
  const req = snap.val() as WithdrawalRequest;

  await update(ref(db, `withdrawals/${withdrawalId}`), {
    status: newStatus,
    utrRef: utrRef || req.utrRef,
    adminNote: adminNote || req.adminNote,
    processedAt: Date.now(),
    processedBy: adminIdentifier || "Admin"
  });

  const wallet = await getWallet(req.uid);

  if (newStatus === "paid") {
    // Release reserved funds permanently
    await set(ref(db, `wallets/${req.uid}`), {
      ...wallet,
      reservedPaise: Math.max(0, (wallet.reservedPaise || 0) - req.amountPaise),
      updatedAt: Date.now()
    });

    await createNotification(req.uid, {
      title: "Payout Sent!",
      message: `Your withdrawal of ₹${req.amountRupees.toFixed(2)} has been transferred to ${req.upiId}. Ref: ${utrRef || "UPI Transfer"}`,
      type: "success",
      link: "/listener/wallet"
    });
  } else if (newStatus === "rejected" || newStatus === "cancelled") {
    // Return reserved funds back to withdrawable
    await set(ref(db, `wallets/${req.uid}`), {
      ...wallet,
      withdrawablePaise: wallet.withdrawablePaise + req.amountPaise,
      reservedPaise: Math.max(0, (wallet.reservedPaise || 0) - req.amountPaise),
      updatedAt: Date.now()
    });

    await createNotification(req.uid, {
      title: "Withdrawal Request Update",
      message: `Your withdrawal request for ₹${req.amountRupees.toFixed(2)} was ${newStatus}. Note: ${adminNote || "Please contact support."}`,
      type: "warning",
      link: "/listener/wallet"
    });
  }
}

// ==========================================
// REVIEWS
// ==========================================

export async function submitReview(review: Omit<Review, "id" | "createdAt">): Promise<string> {
  const newRef = push(ref(db, `reviews/${review.listenerId}`));
  const id = newRef.key!;
  const reviewData: Review = {
    ...review,
    id,
    createdAt: Date.now()
  };
  await set(newRef, reviewData);

  // Mark session review submitted
  await update(ref(db, `sessions/${review.sessionId}`), { reviewSubmitted: true });

  // Recalculate listener's average rating
  const reviewsSnap = await get(ref(db, `reviews/${review.listenerId}`));
  if (reviewsSnap.exists()) {
    const all = Object.values(reviewsSnap.val()) as Review[];
    const total = all.reduce((sum, r) => sum + r.rating, 0);
    const avg = Number((total / all.length).toFixed(1));

    await update(ref(db, `listenerProfiles/${review.listenerId}`), {
      rating: avg,
      totalReviews: all.length
    });
  }

  await createNotification(review.listenerId, {
    title: "New Review Received",
    message: `${review.talkerName} left a ${review.rating}-star review: "${review.comment.slice(0, 50)}..."`,
    type: "success",
    link: "/listener/reviews"
  });

  return id;
}

export function subscribeToReviews(listenerId: string, callback: (reviews: Review[]) => void) {
  return onValue(ref(db, `reviews/${listenerId}`), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as Review[];
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function createNotification(uid: string, notif: Omit<AppNotification, "id" | "uid" | "read" | "timestamp">): Promise<void> {
  const newRef = push(ref(db, `notifications/${uid}`));
  const data: AppNotification = {
    ...notif,
    id: newRef.key!,
    uid,
    read: false,
    timestamp: Date.now()
  };
  await set(newRef, data);
}

export function subscribeToNotifications(uid: string, callback: (notifications: AppNotification[]) => void) {
  return onValue(ref(db, `notifications/${uid}`), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as AppNotification[];
    list.sort((a, b) => b.timestamp - a.timestamp);
    callback(list);
  });
}

export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  await update(ref(db, `notifications/${uid}/${notificationId}`), { read: true });
}

// ==========================================
// ADMIN DATA & AUDIT LOGS
// ==========================================

export function subscribeToAllTopups(callback: (orders: TopupOrder[]) => void) {
  return onValue(ref(db, "topups"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as TopupOrder[];
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });
}

export function subscribeToAllWithdrawals(callback: (requests: WithdrawalRequest[]) => void) {
  return onValue(ref(db, "withdrawals"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as WithdrawalRequest[];
    list.sort((a, b) => b.requestedAt - a.requestedAt);
    callback(list);
  });
}

export function subscribeToAllSessions(callback: (sessions: Session[]) => void) {
  return onValue(ref(db, "sessions"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as Session[];
    list.sort((a, b) => (b.startedAt || b.requestedAt) - (a.startedAt || a.requestedAt));
    callback(list);
  });
}

export function subscribeToAdminNotifications(callback: (notifs: any[]) => void) {
  return onValue(ref(db, "admin/notifications"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.entries(snapshot.val()).map(([id, val]) => ({
      id,
      ...(val as any)
    }));
    list.sort((a, b) => b.timestamp - a.timestamp);
    callback(list);
  });
}

export async function writeAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const newRef = push(ref(db, "admin/auditLogs"));
  await set(newRef, {
    ...log,
    id: newRef.key!,
    timestamp: Date.now()
  });
}

export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void) {
  return onValue(ref(db, "admin/auditLogs"), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const list = Object.values(snapshot.val()) as AuditLog[];
    list.sort((a, b) => b.timestamp - a.timestamp);
    callback(list);
  });
}

export async function getAdminConfig(): Promise<AdminPlatformConfig> {
  const snap = await get(ref(db, "admin/config"));
  if (snap.exists()) {
    return snap.val() as AdminPlatformConfig;
  }
  const initialConfig: AdminPlatformConfig = {
    defaultRatePaisePerMin: DEFAULT_RATE_PAISE_PER_MIN,
    platformCommissionPct: 0,
    minWithdrawalPaise: MIN_WITHDRAWAL_PAISE,
    verificationPassScore: 80,
    maintenanceMode: false,
    emergencyHelplineNumber: "9152987821" // Vandrevala Foundation or KIRAN 1800-599-0019
  };
  await set(ref(db, "admin/config"), initialConfig);
  return initialConfig;
}

export async function updateAdminConfig(config: Partial<AdminPlatformConfig>): Promise<void> {
  await update(ref(db, "admin/config"), config);
}
