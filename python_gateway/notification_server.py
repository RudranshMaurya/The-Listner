#!/usr/bin/env python3
"""
The Listener - MacroDroid Payment Notification Gateway
======================================================
Preserves 100% backward compatibility with existing MacroDroid configuration:
- Endpoint: GET & POST /notify
- Port: 5050
- MacroDroid URL template: http://<LOCAL_IP>:5050/notify?text={notification}
- Exact JSON response: {"status": "received", "time": "YYYY-MM-DD HH:MM:SS"}

Enhancements:
- Structured parsing for Indian UPI & Banking SMS/App notifications (Google Pay, PhonePe, Paytm, FamPay, CRED, BHIM, Banks)
- Amount extraction with paise conversion
- UTR / UPI Reference / Order ID extraction
- Cryptographic deduplication to prevent double processing
- Persistent local SQLite & JSON audit log
- Secure forwarder to Firebase Cloud Functions / backend webhook with HMAC-SHA256 signature
"""

import os
import sys
import json
import re
import hmac
import hashlib
import sqlite3
import socket
import urllib.parse
import urllib.request
from datetime import datetime
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("NOTIFIER_PORT", 5050))
BACKEND_WEBHOOK_URL = os.environ.get("BACKEND_WEBHOOK_URL", "")  # e.g. https://us-central1-therapy-1e39d.cloudfunctions.net/receivePaymentNotification
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "the-listener-secure-secret-2026")
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "notifications.db")

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


def init_db():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payment_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hash TEXT UNIQUE,
                timestamp TEXT,
                client_ip TEXT,
                method TEXT,
                app_source TEXT,
                amount_rupees REAL,
                amount_paise INTEGER,
                utr_ref TEXT,
                order_id TEXT,
                sender TEXT,
                raw_text TEXT,
                forward_status TEXT,
                forward_response TEXT
            )
        """
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"{RED}[DB Init Error]{RESET} {e}")


def parse_notification_text(text: str):
    """
    Intelligently extracts financial and order metadata from notification text.
    Handles Google Pay, PhonePe, Paytm, FamPay, CRED, BHIM, and bank SMS patterns.
    """
    data = {
        "amount_rupees": 0.0,
        "amount_paise": 0,
        "utr_ref": None,
        "order_id": None,
        "sender": None,
        "app_source": "Unknown",
    }

    if not text:
        return data

    clean_text = text.replace(",", "")

    # 1. Amount Extraction
    # Matches: ₹100, Rs. 100, Rs 100.50, INR 100, "received ₹ 100", "credited with INR 100"
    amt_patterns = [
        r"(?:₹|Rs\.?|INR)\s*([\d]+(?:\.\d{1,2})?)",
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

    # 2. UTR / UPI Ref Extraction (Standard Indian banking 12-digit reference or alphanumeric ref)
    utr_patterns = [
        r"(?:UTR|Ref\s*(?:No|Num|Number)?|UPI\s*Ref(?:\s*No)?|Txn\s*ID)[:\s#]*([A-Za-z0-9]{8,22})",
        r"\b([0-9]{12})\b",  # Standard 12-digit numeric UPI RR / UTR
    ]
    for pattern in utr_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data["utr_ref"] = match.group(1).strip()
            break

    # 3. Platform Order ID extraction (e.g. TL-XXXXXX or TOPUP-XXXX)
    order_patterns = [
        r"\b(TL-[A-Za-z0-9]{4,16})\b",
        r"\b(TOPUP-[A-Za-z0-9]{4,16})\b",
        r"(?:order|order\s*id|order\s*ref)[:\s#]*([A-Za-z0-9_-]{6,18})",
    ]
    for pattern in order_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            matched_val = match.group(1).strip()
            if matched_val != data.get("utr_ref"):
                data["order_id"] = matched_val
                break

    # 4. App Source Detection
    lower = text.lower()
    if "fampay" in lower or "@fam" in lower:
        data["app_source"] = "FamPay"
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
    elif "hdfc" in lower:
        data["app_source"] = "HDFC Bank"
    elif "sbi" in lower:
        data["app_source"] = "SBI"
    elif "icici" in lower:
        data["app_source"] = "ICICI Bank"
    elif "axis" in lower:
        data["app_source"] = "Axis Bank"
    elif "upi" in lower:
        data["app_source"] = "UPI"

    # 5. Sender extraction (e.g. "from John Doe", "by user@upi")
    sender_match = re.search(r"(?:from|by)\s+([A-Za-z0-9\s.@_-]{2,25}?)(?=\s+(?:on|via|\.|\,|$))", text, re.IGNORECASE)
    if sender_match:
        cand = sender_match.group(1).strip()
        if cand.lower() not in ["google pay", "phonepe", "paytm", "fampay", "upi"]:
            data["sender"] = cand

    return data


def forward_to_backend(payload: dict) -> tuple:
    """
    Optionally forward candidate payment event to backend/Cloud Function webhook
    with HMAC authentication to prevent tampering.
    """
    if not BACKEND_WEBHOOK_URL:
        return ("skipped_no_url", "No BACKEND_WEBHOOK_URL configured")

    try:
        json_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
        signature = hmac.new(WEBHOOK_SECRET.encode('utf-8'), json_bytes, hashlib.sha256).hexdigest()

        req = urllib.request.Request(
            BACKEND_WEBHOOK_URL,
            data=json_bytes,
            headers={
                "Content-Type": "application/json",
                "X-Listener-Signature": signature,
                "User-Agent": "TheListener-NotificationGateway/1.0"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp_body = resp.read().decode('utf-8')
            return ("success", resp_body)
    except Exception as e:
        return ("error", str(e))


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


class MacroDroidNotificationHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Silence default BaseHTTPRequestHandler access log to keep console clean
        pass

    def _handle_request(self, method):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        client_ip = self.client_address[0]

        # 1. Capture URL Query Parameters (MacroDroid sends ?text={notification})
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

        combined_data = {**query_params, **body_data}

        # Notification text extraction
        notification_text = combined_data.get("text", combined_data.get("notification", combined_data.get("raw_text", "")))
        if not notification_text and raw_body:
            notification_text = raw_body
        if not notification_text and parsed_url.path and parsed_url.path != "/notify":
            notification_text = urllib.parse.unquote(parsed_url.path.lstrip("/"))

        # Deduplication hash: sha256 of text + date (minute precision)
        text_hash = hashlib.sha256(f"{notification_text}_{now[:16]}".encode("utf-8")).hexdigest()

        # Parse structured financial metadata
        parsed = parse_notification_text(notification_text)
        amount_disp = f"₹{parsed['amount_rupees']:.2f} ({parsed['amount_paise']} paise)" if parsed["amount_rupees"] > 0 else "None found"

        # Check for duplicates in SQLite
        is_duplicate = False
        try:
            conn = sqlite3.connect(DB_FILE)
            cur = conn.cursor()
            cur.execute("SELECT id FROM payment_notifications WHERE hash = ?", (text_hash,))
            if cur.fetchone():
                is_duplicate = True
            conn.close()
        except Exception:
            pass

        # Forward candidate to cloud backend if applicable
        fwd_status = "duplicate_ignored" if is_duplicate else "pending"
        fwd_resp = ""
        if not is_duplicate and notification_text:
            payload = {
                "timestamp": now,
                "client_ip": client_ip,
                "app_source": parsed["app_source"],
                "amount_rupees": parsed["amount_rupees"],
                "amount_paise": parsed["amount_paise"],
                "utr_ref": parsed["utr_ref"],
                "order_id": parsed["order_id"],
                "sender": parsed["sender"],
                "raw_text": notification_text,
                "destination_vpa": "rudransh-maurya@fam"
            }
            fwd_status, fwd_resp = forward_to_backend(payload)

            # Record in SQLite audit log
            try:
                conn = sqlite3.connect(DB_FILE)
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO payment_notifications
                    (hash, timestamp, client_ip, method, app_source, amount_rupees, amount_paise, utr_ref, order_id, sender, raw_text, forward_status, forward_response)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        text_hash,
                        now,
                        client_ip,
                        method,
                        parsed["app_source"],
                        parsed["amount_rupees"],
                        parsed["amount_paise"],
                        parsed["utr_ref"],
                        parsed["order_id"],
                        parsed["sender"],
                        notification_text,
                        fwd_status,
                        str(fwd_resp)[:200]
                    )
                )
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"{RED}[DB Insert Error]{RESET} {e}")

        # Console logging with Apple-inspired clean formatting
        status_tag = f"{YELLOW}[DUPLICATE]{RESET}" if is_duplicate else f"{GREEN}[NEW CANDIDATE]{RESET}"
        print(
            f"\n{CYAN}┌────────────────────────────────────────────────────────────┐{RESET}\n"
            f"{CYAN}│ 🔔 NOTIFICATION RECEIVED AT {now}  {status_tag}│{RESET}\n"
            f"{CYAN}└────────────────────────────────────────────────────────────┘{RESET}\n"
            f"  {DIM}From IP     :{RESET} {client_ip} ({method})\n"
            f"  {YELLOW}💰 Amount   :{RESET} {GREEN}{amount_disp}{RESET}\n"
            f"  {MAGENTA}🏷️  Source   :{RESET} {parsed['app_source']}\n"
            f"  {CYAN}🔍 UTR / Ref:{RESET} {parsed['utr_ref'] or '(Not detected)'}\n"
            f"  {CYAN}📦 Order ID :{RESET} {parsed['order_id'] or '(None in text)'}\n"
            f"  {CYAN}👤 Sender   :{RESET} {parsed['sender'] or '(Unknown)'}\n"
            f"  {DIM}🌐 Cloud Fwd:{RESET} {fwd_status}\n"
            f"  {DIM}📄 Raw Text :{RESET} {notification_text or '(Empty)'}\n"
            f"{DIM}{'─' * 60}{RESET}",
            flush=True
        )

        # EXACT COMPATIBLE MACRODROID RESPONSE (Do not modify!)
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
    init_db()
    local_ip = get_local_ip()
    server_address = ("0.0.0.0", PORT)
    httpd = ReusableThreadingHTTPServer(server_address, MacroDroidNotificationHandler)

    print(f"\n{GREEN}============================================================{RESET}")
    print(f"{BOLD}{GREEN}  THE LISTENER — MACRODROID PAYMENT GATEWAY v2.0{RESET}")
    print(f"{GREEN}============================================================{RESET}")
    print(f"  {CYAN}Status       :{RESET} {GREEN}ACTIVE & LISTENING{RESET}")
    print(f"  {CYAN}Port         :{RESET} {PORT}")
    print(f"  {CYAN}Local IP     :{RESET} {local_ip}")
    print(f"  {CYAN}MacroDroid URL:{RESET} {GREEN}http://{local_ip}:{PORT}/notify?text={{notification}}{RESET}")
    print(f"  {CYAN}Target UPI   :{RESET} {YELLOW}rudransh-maurya@fam{RESET}")
    print(f"  {CYAN}Backend Fwd  :{RESET} {BACKEND_WEBHOOK_URL or '(Running local logging & DB mode)'}")
    print(f"  {CYAN}Audit DB     :{RESET} {DB_FILE}")
    print(f"{DIM}------------------------------------------------------------{RESET}")
    print(f"{DIM}Keep your phone and this machine on the same Wi-Fi / Local Network.{RESET}")
    print(f"{DIM}Press Ctrl+C to stop.{RESET}\n", flush=True)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}🛑 Gateway server stopped cleanly.{RESET}")
        sys.exit(0)
