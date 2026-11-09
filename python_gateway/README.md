# The Listener — MacroDroid Payment Gateway v2.0

This Python microservice acts as a trusted bridge between your phone's banking/UPI SMS notifications (via MacroDroid) and The Listener platform.

## 🎯 100% Backward Compatibility Guarantee
Your existing MacroDroid macro and phone settings do **not** need any modification:
- **Port:** `5050` (or configurable via `NOTIFIER_PORT`)
- **Incoming Path:** `GET /notify?text={notification}` and `POST /notify`
- **Response Contract:**
  ```json
  {
    "status": "received",
    "time": "YYYY-MM-DD HH:MM:SS"
  }
  ```

---

## ⚡ Enhancements in v2.0
1. **Intelligent Financial Parser:**
   - Detects Rupee amounts (`₹100`, `Rs. 200.50`, `INR 500`) and converts them into precise integer paise.
   - Extracts 12-digit Indian banking UPI reference / UTR numbers (e.g., `431289123456`).
   - Identifies source apps: Google Pay, PhonePe, Paytm, FamPay, CRED, BHIM, and major Indian banks.
   - Extracts platform top-up order references (e.g. `TL-XXXXXX`).
2. **Cryptographic Deduplication:**
   - Hashes incoming notifications to prevent accidental double-processing.
3. **Local SQLite Audit Database (`notifications.db`):**
   - Stores raw notification text, extracted metadata, timestamp, and forwarding status locally.
4. **Secure Cloud Forwarding:**
   - Sends verified payment candidates to the Firebase Cloud Functions backend with an HMAC-SHA256 signature (`X-Listener-Signature`).

---

## 🚀 How to Run

### Step 1: Start the Gateway
```bash
# Make sure port 5050 is free
python3 python_gateway/notification_server.py
```

### Step 2: Configure MacroDroid on Your Android Phone
If not already configured, point MacroDroid to your local IP:
- **Trigger:** Notification Received (Select Google Pay, PhonePe, Paytm, FamPay, or SMS apps)
- **Action:** Open Website / HTTP Request:
  ```text
  http://<YOUR_LOCAL_IP>:5050/notify?text={notification}
  ```
- **Method:** `GET` or `POST`

---

## 🌐 Environment Variables (Optional)
| Variable | Default | Description |
|---|---|---|
| `NOTIFIER_PORT` | `5050` | Port to bind the server to |
| `BACKEND_WEBHOOK_URL` | `""` | Optional Firebase Cloud Function URL to forward events |
| `WEBHOOK_SECRET` | `the-listener-secure-secret-2026` | Shared HMAC secret for backend verification |
