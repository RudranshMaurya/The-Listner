#!/usr/bin/env python3
"""
The Listener - MacroDroid Real-Time Payment Auto-Credit Gateway
==============================================================
- Port: 5050
- MacroDroid URL: http://<LOCAL_IP>:5050/notify?text={notification}
- Exact JSON response: {"status": "received", "time": "YYYY-MM-DD HH:MM:SS"}

Features:
- Instant parsing for FamApp, Google Pay, PhonePe, Paytm, CRED, and BHIM
- Auto-extracts amount and sender (e.g. "GULAB CHAND sent ₹10.0")
- Skips manual UTR requirement completely!
- Direct real-time Firebase Realtime Database auto-credit into Talker wallet
- Real-time ledger recording and in-app success notification
- 100% backward compatible with MacroDroid HTTP GET/POST webhook format
"""

import os
import sys
import json
import re
import time
import socket
import urllib.parse
import urllib.request
from datetime import datetime
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("NOTIFIER_PORT", 5050))
FIREBASE_RTDB_URL = os.environ.get("FIREBASE_DATABASE_URL", "https://therapy-1e39d-default-rtdb.firebaseio.com")
DESTINATION_VPA = "rudransh-maurya@fam"

# Terminal styling
os.system("")
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
MAGENTA = "\033[95m"
RED = "\033[91m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def parse_notification_text(text: str):
    """
    Intelligently extracts financial metadata from notification text.
    Handles FamApp, Google Pay, PhonePe, Paytm, CRED, BHIM, and bank SMS patterns.
    """
    data = {
        "amount_rupees": 0.0,
        "amount_paise": 0,
        "utr_ref": None,
        "order_id": None,
        "sender": "Unknown Sender",
        "app_source": "UPI / Bank",
    }

    if not text:
        return data

    clean_text = text.replace(",", "")

    # 1. Amount Extraction (₹10.0, ₹10, Rs 10, INR 10, etc.)
    amt_patterns = [
        r"(?:₹|Rs\.?|INR)\s*([\d]+(?:\.\d{1,2})?)",
        r"sent\s*(?:₹|Rs\.?|INR)?\s*([\d]+(?:\.\d{1,2})?)",
        r"(?:received|credited|added|got)\s*(?:₹|Rs\.?|INR)?\s*([\d]+(?:\.\d{1,2})?)",
        r"([\d]+(?:\.\d{1,2})?)\s*(?:₹|rupees|inr)",
    ]
    for pattern in amt_patterns:
        match = re.search(pattern, clean_text, re.IGNORECASE)
        if match:
            try:
                amt = float(match.group(1))
                if amt > 0:
                    data["amount_rupees"] = amt
                    data["amount_paise"] = int(round(amt * 100))
                    break
            except ValueError:
                pass

    # 2. App Source Detection
    lower = text.lower()
    if "fampaid" in lower or "famapp" in lower or "fampay" in lower or "@fam" in lower:
        data["app_source"] = "FamApp"
    elif "google pay" in lower or "gpay" in lower:
        data["app_source"] = "Google Pay"
    elif "phonepe" in lower:
        data["app_source"] = "PhonePe"
    elif "paytm" in lower:
        data["app_source"] = "Paytm"
    elif "cred" in lower:
        data["app_source"] = "CRED"
    elif "bhim" in lower:
        data["app_source"] = "BHIM UPI"

    # 3. Sender Extraction (e.g. "GULAB CHAND sent ₹10.0", "from John", "by Rahul")
    sender_match = re.search(r"(?:#fampaid|\n|^)\s*([A-Za-z\s]{2,35}?)\s+sent\s+(?:₹|Rs\.?|INR)", text, re.IGNORECASE)
    if sender_match:
        data["sender"] = sender_match.group(1).strip()
    else:
        m2 = re.search(r"(?:from|by)\s+([A-Za-z0-9\s.@_-]{2,25}?)(?=\s+(?:on|via|\.|\,|$))", text, re.IGNORECASE)
        if m2:
            cand = m2.group(1).strip()
            if cand.lower() not in ["google pay", "phonepe", "paytm", "fampay", "famapp", "upi"]:
                data["sender"] = cand

    # 4. Optional Order ID or UTR (if present, but NOT required!)
    order_match = re.search(r"\b(TL-[A-Za-z0-9]{4,16})\b", text, re.IGNORECASE)
    if order_match:
        data["order_id"] = order_match.group(1).strip()

    utr_match = re.search(r"(?:UTR|Ref|Txn\s*ID)[:\s#]*([A-Za-z0-9]{8,22})|\b([0-9]{12})\b", text, re.IGNORECASE)
    if utr_match:
        data["utr_ref"] = (utr_match.group(1) or utr_match.group(2) or "").strip()

    return data


def auto_credit_firebase(parsed: dict, raw_text: str) -> dict:
    """
    Connects directly to Firebase Realtime Database via REST API.
    Finds matching pending top-up and immediately credits the user's wallet!
    No manual UTR entry needed!
    """
    amount_paise = parsed["amount_paise"]
    amount_rupees = parsed["amount_rupees"]
    sender = parsed["sender"]
    app_source = parsed["app_source"]
    auto_ref = parsed["utr_ref"] or f"AUTO-{int(time.time() * 1000)}"

    if amount_paise <= 0:
        return {"status": "skipped", "reason": "No positive amount detected in notification"}

    now_ms = int(time.time() * 1000)

    try:
        # 1. Fetch pending top-ups from Firebase RTDB
        req = urllib.request.Request(f"{FIREBASE_RTDB_URL}/topups.json")
        with urllib.request.urlopen(req, timeout=5) as resp:
            topups_data = json.loads(resp.read().decode("utf-8")) or {}

        target_order = None
        target_order_id = None

        if isinstance(topups_data, dict):
            # Try to match by explicit order_id if present in notification
            if parsed.get("order_id") and parsed["order_id"] in topups_data:
                cand = topups_data[parsed["order_id"]]
                if cand.get("status") == "pending":
                    target_order = cand
                    target_order_id = parsed["order_id"]

            # Otherwise match by amount among pending orders
            if not target_order:
                matching_orders = []
                for oid, ord_data in topups_data.items():
                    if isinstance(ord_data, dict) and ord_data.get("status") == "pending":
                        if ord_data.get("amountPaise") == amount_paise or ord_data.get("amountRupees") == amount_rupees:
                            matching_orders.append((oid, ord_data))

                if matching_orders:
                    # Pick most recent order
                    matching_orders.sort(key=lambda x: x[1].get("createdAt", 0), reverse=True)
                    target_order_id, target_order = matching_orders[0]

        # 2. Determine target user UID
        target_uid = None
        if target_order:
            target_uid = target_order.get("uid")
        else:
            # Fallback: Find the active user from wallets
            req = urllib.request.Request(f"{FIREBASE_RTDB_URL}/wallets.json")
            with urllib.request.urlopen(req, timeout=5) as resp:
                wallets_data = json.loads(resp.read().decode("utf-8")) or {}
            if isinstance(wallets_data, dict) and wallets_data:
                # Pick the most recently updated or first available wallet
                wallet_list = list(wallets_data.items())
                wallet_list.sort(key=lambda x: x[1].get("updatedAt", 0) if isinstance(x[1], dict) else 0, reverse=True)
                target_uid = wallet_list[0][0]

        if not target_uid:
            return {"status": "error", "reason": "No user wallet found to credit"}

        # 3. Credit the User's Wallet in Firebase RTDB
        req = urllib.request.Request(f"{FIREBASE_RTDB_URL}/wallets/{target_uid}.json")
        with urllib.request.urlopen(req, timeout=5) as resp:
            wallet = json.loads(resp.read().decode("utf-8")) or {}

        prev_balance = wallet.get("balancePaise", 0)
        new_balance = prev_balance + amount_paise

        wallet_patch = {
            "balancePaise": new_balance,
            "totalEarnedPaise": wallet.get("totalEarnedPaise", 0),
            "totalSpentPaise": wallet.get("totalSpentPaise", 0),
            "withdrawablePaise": wallet.get("withdrawablePaise", 0),
            "reservedPaise": wallet.get("reservedPaise", 0),
            "uid": target_uid,
            "updatedAt": now_ms
        }
        patch_bytes = json.dumps(wallet_patch).encode("utf-8")
        req = urllib.request.Request(
            f"{FIREBASE_RTDB_URL}/wallets/{target_uid}.json",
            data=patch_bytes,
            headers={"Content-Type": "application/json"},
            method="PATCH"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass

        # 4. If top-up order exists, mark it as 'credited'
        if target_order_id:
            order_patch = {
                "status": "credited",
                "confirmedAt": now_ms,
                "confirmedBy": f"MacroDroid Auto ({app_source})",
                "senderName": sender,
                "utrRef": auto_ref,
                "rawNotificationText": raw_text,
                "updatedAt": now_ms
            }
            order_bytes = json.dumps(order_patch).encode("utf-8")
            req = urllib.request.Request(
                f"{FIREBASE_RTDB_URL}/topups/{target_order_id}.json",
                data=order_bytes,
                headers={"Content-Type": "application/json"},
                method="PATCH"
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                pass
        else:
            # Create a completed top-up record so it shows up in history
            auto_order_id = f"TL-AUTO-{int(time.time())}"
            new_topup = {
                "id": auto_order_id,
                "uid": target_uid,
                "userName": sender,
                "userEmail": "",
                "amountRupees": amount_rupees,
                "amountPaise": amount_paise,
                "status": "credited",
                "upiUri": f"upi://pay?pa={DESTINATION_VPA}",
                "destinationVpa": DESTINATION_VPA,
                "senderName": sender,
                "utrRef": auto_ref,
                "rawNotificationText": raw_text,
                "createdAt": now_ms,
                "confirmedAt": now_ms,
                "confirmedBy": f"MacroDroid Auto ({app_source})"
            }
            req = urllib.request.Request(
                f"{FIREBASE_RTDB_URL}/topups/{auto_order_id}.json",
                data=json.dumps(new_topup).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="PUT"
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                pass

        # 5. Push Ledger Entry
        ledger_entry = {
            "id": f"tx_{now_ms}",
            "uid": target_uid,
            "type": "topup",
            "amountPaise": amount_paise,
            "previousBalancePaise": prev_balance,
            "newBalancePaise": new_balance,
            "description": f"UPI Topup - Received from {sender} via {app_source}",
            "referenceId": target_order_id or auto_ref,
            "timestamp": now_ms
        }
        req = urllib.request.Request(
            f"{FIREBASE_RTDB_URL}/walletLedger/{target_uid}.json",
            data=json.dumps(ledger_entry).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass

        # 6. Push Live In-App Notification to User
        app_notif = {
            "uid": target_uid,
            "title": "Payment Approved & Credited! 🎉",
            "message": f"₹{amount_rupees:.2f} received from {sender} via {app_source} has been credited to your wallet balance.",
            "type": "success",
            "read": False,
            "timestamp": now_ms,
            "link": "/talker/wallet"
        }
        req = urllib.request.Request(
            f"{FIREBASE_RTDB_URL}/notifications/{target_uid}.json",
            data=json.dumps(app_notif).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass

        return {
            "status": "success",
            "credited_paise": amount_paise,
            "credited_rupees": amount_rupees,
            "target_uid": target_uid,
            "order_id": target_order_id or auto_ref,
            "new_balance_paise": new_balance
        }

    except Exception as e:
        return {"status": "error", "error": str(e)}


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


class MacroDroidNotificationHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _handle_request(self, method):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        client_ip = self.client_address[0]

        # 1. Capture URL Query Parameters (?text={notification})
        parsed_url = urllib.parse.urlparse(self.path)
        query_params = dict(urllib.parse.parse_qsl(parsed_url.query))

        # 2. Capture Body Content (POST)
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length).decode("utf-8", errors="replace") if content_length > 0 else ""

        body_data = {}
        if raw_body:
            try:
                json_data = json.loads(raw_body)
                if isinstance(json_data, dict):
                    body_data.update(json_data)
                else:
                    body_data["raw_body"] = json_data
            except json.JSONDecodeError:
                form_data = dict(urllib.parse.parse_qsl(raw_body))
                if form_data:
                    body_data.update(form_data)
                else:
                    body_data["raw_text"] = raw_body

        combined = {**query_params, **body_data}
        notification_text = combined.get("text", combined.get("notification", combined.get("raw_text", "")))
        if not notification_text and raw_body:
            notification_text = raw_body

        # Parse financial data
        parsed = parse_notification_text(notification_text)
        amount_disp = f"₹{parsed['amount_rupees']:.2f} ({parsed['amount_paise']} paise)" if parsed["amount_rupees"] > 0 else "None found"

        # Auto-credit to Firebase Realtime Database
        credit_result = {}
        if parsed["amount_rupees"] > 0:
            credit_result = auto_credit_firebase(parsed, notification_text)

        # Print clean Apple-inspired console card
        is_credited = credit_result.get("status") == "success"
        status_label = f"{GREEN}✅ AUTO-CREDITED TO WALLET{RESET}" if is_credited else f"{YELLOW}⚠️ NOTIFICATION LOGGED{RESET}"

        print(
            f"\n{CYAN}┌────────────────────────────────────────────────────────────┐{RESET}\n"
            f"{CYAN}│ 🔔 NOTIFICATION RECEIVED AT {now}                 │{RESET}\n"
            f"{CYAN}└────────────────────────────────────────────────────────────┘{RESET}\n"
            f"  {DIM}From IP     :{RESET} {client_ip} ({method})\n"
            f"  {YELLOW}💰 Amount   :{RESET} {GREEN}{amount_disp}{RESET}\n"
            f"  {MAGENTA}🏷️  App Source:{RESET} {parsed['app_source']}\n"
            f"  {CYAN}👤 Sender   :{RESET} {BOLD}{parsed['sender']}{RESET}\n"
            f"  {CYAN}⚡ Action   :{RESET} {status_label}\n"
            f"  {DIM}📄 Raw Text :{RESET} {notification_text.strip()}\n"
            f"{DIM}{'─' * 60}{RESET}",
            flush=True
        )

        # EXACT COMPATIBLE MACRODROID RESPONSE
        response_data = json.dumps({"status": "received", "time": now}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_data)))
        self.end_headers()
        self.wfile.write(response_data)

    def do_GET(self):
        self._handle_request("GET")

    def do_POST(self):
        self._handle_request("POST")


if __name__ == "__main__":
    local_ip = get_local_ip()
    server_address = ("0.0.0.0", PORT)
    httpd = ReusableThreadingHTTPServer(server_address, MacroDroidNotificationHandler)

    print(f"\n{GREEN}============================================================{RESET}")
    print(f"{BOLD}{GREEN}  THE LISTENER — REAL-TIME UPI AUTO-CREDIT GATEWAY v3.0{RESET}")
    print(f"{GREEN}============================================================{RESET}")
    print(f"  {CYAN}Status       :{RESET} {GREEN}ACTIVE & READY FOR FAMAPP NOTIFICATIONS{RESET}")
    print(f"  {CYAN}Port         :{RESET} {PORT}")
    print(f"  {CYAN}Mac Wi-Fi IP :{RESET} {BOLD}{GREEN}{local_ip}{RESET}")
    print(f"  {CYAN}MacroDroid URL:{RESET} {BOLD}{GREEN}http://{local_ip}:{PORT}/notify?text={{notification}}{RESET}")
    print(f"  {CYAN}Target UPI   :{RESET} {YELLOW}{DESTINATION_VPA}{RESET}")
    print(f"  {CYAN}Firebase RTDB:{RESET} {FIREBASE_RTDB_URL}")
    print(f"{DIM}------------------------------------------------------------{RESET}")
    print(f"{BOLD}{YELLOW}NOTE: Make sure MacroDroid uses your Mac's current Wi-Fi IP: {local_ip}{RESET}")
    print(f"{DIM}Press Ctrl+C to stop.{RESET}\n", flush=True)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}🛑 Gateway server stopped cleanly.{RESET}")
        sys.exit(0)
