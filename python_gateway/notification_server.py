#!/usr/bin/env python3
"""
The Listener — Real-Time Payment Gateway v4.5
=============================================
Endpoints:
  Local Wi-Fi : http://192.168.0.107:5050/notify?text={notification}
  Public Tunnel: https://thelistener-payment-gateway.loca.lt/notify?text={notification}
  Firebase Push: https://therapy-1e39d-default-rtdb.firebaseio.com/incoming_notifications.json

Features:
- Instant parsing for FamApp (e.g. 'You got #fampaid GULAB CHAND sent ₹10.0')
- Matches the user's latest pending top-up order in real time
- Credits Talker's wallet directly in Firebase Realtime Database
- No UTR required!
"""

import os, sys, json, re, time, socket, threading
import urllib.parse, urllib.request
from datetime import datetime
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("NOTIFIER_PORT", 5050))
DB = "https://therapy-1e39d-default-rtdb.firebaseio.com"
VPA = "rudransh-maurya@fam"

G = "\033[92m"; C = "\033[96m"; Y = "\033[93m"; M = "\033[95m"
R = "\033[91m"; D = "\033[2m"; B = "\033[1m"; X = "\033[0m"

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try: s.connect(("8.8.8.8", 80)); return s.getsockname()[0]
    except: return "127.0.0.1"
    finally: s.close()

def parse(text):
    d = {"amt": 0.0, "paise": 0, "sender": "Unknown Sender", "app": "FamApp / UPI"}
    if not text: return d
    t = text.replace(",", "")
    
    # 1. Amount Extraction
    for p in [
        r"(?:₹|Rs\.?|INR)\s*([\d]+(?:\.\d{1,2})?)",
        r"sent\s*(?:₹|Rs\.?|INR)?\s*([\d]+(?:\.\d{1,2})?)",
        r"(?:received|credited|added|got)\s*(?:₹|Rs\.?|INR)?\s*([\d]+(?:\.\d{1,2})?)",
        r"([\d]+(?:\.\d{1,2})?)\s*(?:₹|rupees|inr)"
    ]:
        m = re.search(p, t, re.I)
        if m:
            try:
                a = float(m.group(1))
                if a > 0:
                    d["amt"] = a
                    d["paise"] = int(round(a * 100))
                    break
            except ValueError:
                pass

    # 2. App Source Detection
    lo = text.lower()
    if "fampaid" in lo or "famapp" in lo or "fampay" in lo or "@fam" in lo: d["app"] = "FamApp"
    elif "google pay" in lo or "gpay" in lo: d["app"] = "Google Pay"
    elif "phonepe" in lo: d["app"] = "PhonePe"
    elif "paytm" in lo: d["app"] = "Paytm"
    elif "cred" in lo: d["app"] = "CRED"

    # 3. Sender Extraction
    sm = re.search(r"(?:#fampaid|\n|^)\s*([A-Za-z\s]{2,35}?)\s+sent\s+(?:₹|Rs\.?|INR|\d)", text, re.I)
    if sm:
        d["sender"] = sm.group(1).strip()
    else:
        sm2 = re.search(r"([A-Za-z\s]{3,30})\s+sent", text)
        if sm2:
            d["sender"] = sm2.group(1).strip()
        else:
            sm3 = re.search(r"(?:from|by)\s+([A-Za-z0-9\s.]{2,25}?)(?=\s+(?:on|via|\.|,|$))", text, re.I)
            if sm3:
                cand = sm3.group(1).strip()
                if cand.lower() not in ["google pay", "phonepe", "paytm", "fampay", "famapp", "upi"]:
                    d["sender"] = cand

    return d

def credit(parsed, raw):
    """Credit wallet in Firebase RTDB and update the latest pending top-up order."""
    paise = parsed["paise"]
    if paise <= 0: return "no_amount"
    ms = int(time.time() * 1000)

    try:
        # 1. Fetch pending top-ups from RTDB
        r = urllib.request.urlopen(f"{DB}/topups.json", timeout=5)
        topups = json.loads(r.read().decode()) or {}
        
        pending_list = []
        if isinstance(topups, dict):
            for k, v in topups.items():
                if isinstance(v, dict) and v.get("status") == "pending":
                    pending_list.append((k, v))
        
        # Sort pending orders newest first
        pending_list.sort(key=lambda x: x[1].get("createdAt", 0), reverse=True)

        oid = uid = None
        # Match by exact amount first among pending orders
        for k, v in pending_list:
            if v.get("amountPaise") == paise or v.get("amountRupees") == parsed["amt"]:
                oid, uid = k, v.get("uid")
                break

        # Fallback: Pick the newest pending order
        if not oid and pending_list:
            oid, uid = pending_list[0][0], pending_list[0][1].get("uid")

        # Fallback: Get active user from wallets
        if not uid:
            r = urllib.request.urlopen(f"{DB}/wallets.json", timeout=5)
            w = json.loads(r.read().decode()) or {}
            if w: uid = list(w.keys())[0]

        if not uid: return "no_user"

        # 2. Fetch current wallet balance
        r = urllib.request.urlopen(f"{DB}/wallets/{uid}.json", timeout=5)
        wallet = json.loads(r.read().decode()) or {}
        prev = wallet.get("balancePaise", 0)
        nb = prev + paise

        # 3. Update wallet balance
        req = urllib.request.Request(
            f"{DB}/wallets/{uid}.json",
            json.dumps({"balancePaise": nb, "updatedAt": ms}).encode(),
            {"Content-Type": "application/json"},
            method="PATCH"
        )
        urllib.request.urlopen(req, timeout=5)

        # 4. Mark pending top-up order as 'credited'
        if oid:
            order_patch = {
                "status": "credited",
                "confirmedAt": ms,
                "confirmedBy": f"Auto ({parsed['app']})",
                "senderName": parsed["sender"],
                "rawNotificationText": raw,
                "updatedAt": ms
            }
            req = urllib.request.Request(
                f"{DB}/topups/{oid}.json",
                json.dumps(order_patch).encode(),
                {"Content-Type": "application/json"},
                method="PATCH"
            )
            urllib.request.urlopen(req, timeout=5)
        else:
            # Create a completed topup record so it shows in history
            auto_id = f"TL-AUTO-{int(time.time())}"
            req = urllib.request.Request(
                f"{DB}/topups/{auto_id}.json",
                json.dumps({
                    "id": auto_id,
                    "uid": uid,
                    "userName": parsed["sender"],
                    "amountRupees": parsed["amt"],
                    "amountPaise": paise,
                    "status": "credited",
                    "destinationVpa": VPA,
                    "senderName": parsed["sender"],
                    "rawNotificationText": raw,
                    "createdAt": ms,
                    "confirmedAt": ms,
                    "confirmedBy": f"Auto ({parsed['app']})"
                }).encode(),
                {"Content-Type": "application/json"},
                method="PUT"
            )
            urllib.request.urlopen(req, timeout=5)

        # 5. Add ledger transaction
        le = {
            "id": f"tx_{ms}",
            "uid": uid,
            "type": "topup",
            "amountPaise": paise,
            "previousBalancePaise": prev,
            "newBalancePaise": nb,
            "description": f"UPI Topup from {parsed['sender']} via {parsed['app']}",
            "referenceId": oid or f"FAM-{ms}",
            "timestamp": ms
        }
        req = urllib.request.Request(
            f"{DB}/walletLedger/{uid}.json",
            json.dumps(le).encode(),
            {"Content-Type": "application/json"},
            method="POST"
        )
        urllib.request.urlopen(req, timeout=5)

        # 6. Add in-app notification
        n = {
            "uid": uid,
            "title": "Payment Credited! 🎉",
            "message": f"₹{parsed['amt']:.2f} received from {parsed['sender']} via {parsed['app']} has been credited.",
            "type": "success",
            "read": False,
            "timestamp": ms,
            "link": "/talker/wallet"
        }
        req = urllib.request.Request(
            f"{DB}/notifications/{uid}.json",
            json.dumps(n).encode(),
            {"Content-Type": "application/json"},
            method="POST"
        )
        urllib.request.urlopen(req, timeout=5)

        return "credited"

    except Exception as e:
        print(f"{R}[ERROR]{X} {e}")
        return "error"

def process_text(text, source="HTTP"):
    p = parse(text)
    res = credit(p, text)
    tag = f"{G}✅ CREDITED TO WALLET{X}" if res == "credited" else f"{Y}⚠ {res}{X}"
    print(
        f"\n{C}{'─'*50}{X}\n"
        f"  {B}🔔 {source} @ {datetime.now().strftime('%H:%M:%S')}{X}\n"
        f"  💰 ₹{p['amt']:.2f} ({p['paise']}p) from {B}{p['sender']}{X} via {p['app']}\n"
        f"  ⚡ {tag}\n"
        f"  📄 {text.strip()[:80]}\n"
        f"{C}{'─'*50}{X}",
        flush=True
    )
    return res

# ── Firebase RTDB Poller (Fallback mode) ──
def firebase_poller():
    while True:
        try:
            r = urllib.request.urlopen(f"{DB}/incoming_notifications.json", timeout=5)
            data = json.loads(r.read().decode()) or {}
            if isinstance(data, dict) and data:
                for key, val in list(data.items()):
                    text = val if isinstance(val, str) else (val.get("text", "") if isinstance(val, dict) else str(val))
                    if text:
                        process_text(text, "FIREBASE-POLL")
                    req = urllib.request.Request(f"{DB}/incoming_notifications/{key}.json", method="DELETE")
                    urllib.request.urlopen(req, timeout=5)
        except Exception:
            pass
        time.sleep(2)

# ── HTTP Server Handler ──
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _h(self, method):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        q = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(self.path).query))
        cl = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(cl).decode(errors="replace") if cl > 0 else ""
        bd = {}
        if body:
            try: bd = json.loads(body) if isinstance(json.loads(body), dict) else {"raw": body}
            except: bd = dict(urllib.parse.parse_qsl(body)) or {"raw": body}
        c = {**q, **bd}
        text = c.get("text", c.get("notification", c.get("raw", body or "")))
        if text: process_text(text, f"HTTP-{method}")
        
        r = json.dumps({"status": "received", "time": now}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(r)))
        self.end_headers()
        self.wfile.write(r)

    def do_GET(self): self._h("GET")
    def do_POST(self): self._h("POST")

class S(ThreadingHTTPServer):
    allow_reuse_address = True

if __name__ == "__main__":
    ip = get_ip()
    print(f"\n{G}{'='*55}{X}")
    print(f"{B}{G}  THE LISTENER — PAYMENT GATEWAY v4.5{X}")
    print(f"{G}{'='*55}{X}")
    print(f"  {C}Local Wi-Fi URL:{X}  {G}http://{ip}:{PORT}/notify?text={{notification}}{X}")
    print(f"  {C}Public Tunnel URL:{X} {B}{G}https://thelistener-payment-gateway.loca.lt/notify?text={{notification}}{X}")
    print(f"  {C}Target UPI:{X}        {Y}{VPA}{X}")
    print(f"{D}{'─'*55}{X}")

    t = threading.Thread(target=firebase_poller, daemon=True)
    t.start()

    httpd = S(("0.0.0.0", PORT), H)
    print(f"  {C}Server Status:{X}    {G}LISTENING on port {PORT}{X}\n", flush=True)
    try: httpd.serve_forever()
    except KeyboardInterrupt: sys.exit(0)
