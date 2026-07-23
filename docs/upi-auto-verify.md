# UPI auto-verification (KYC-free)

Automatically approves a UPI payment the moment your bank confirms the credit —
no payment gateway, no KYC, no fees.

## How it works

1. A student pays your UPI ID via the QR and enters the 12-digit **UTR**
   (transaction reference) on the site.
2. Your **bank sends you an SMS** with the amount + the same UTR.
3. An Android **SMS-forwarding app** on the phone with your bank SIM POSTs that
   SMS to `POST /api/upi-sms` (secret-protected).
4. The server parses the amount + UTR, records it in `bank_transactions`, and
   **auto-approves** any pending submission whose UTR **and** amount both match —
   activating the enrollment (or confirming the demo + sending the email).

It works in both orders: if the bank SMS arrives before the student submits their
UTR, the match happens the instant they submit; if after, the webhook matches it.

### Why it's safe

- A bank credit can only be recorded by POSTing to the webhook **with the secret**
  (`UPI_WEBHOOK_SECRET`). Keep it private.
- A submission only auto-approves when the **student-entered UTR equals a real bank
  credit's UTR** and the amount matches. Students can't fake a bank SMS or guess
  their way in — the only path to auto-approval is real money actually landing in
  your account with that UTR.
- The amount owed is always computed server-side from the `fees` table, never from
  the client.
- Replays are idempotent (UTR is unique), and one credit can approve only one
  submission.

## One-time setup

### 1. Secret

`UPI_WEBHOOK_SECRET` is already set in `.env` for local dev. **Set the same
variable in your production/deploy environment.** To rotate it, generate a new
one:

```
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

### 2. Android SMS-forwarding app

Install any SMS-to-webhook forwarder on the phone that receives your bank's
transaction SMS. Free options: **"SMS to URL Forwarder"** (F-Droid) or
**MacroDroid**. Configure a rule:

- **Trigger:** incoming SMS (optionally only from your bank's sender IDs, e.g.
  `VM-SBIINB`, `AD-HDFCBK`, to cut noise).
- **Action:** HTTP **POST** to:

  ```
  https://<your-domain>/api/upi-sms?token=<UPI_WEBHOOK_SECRET>
  ```

- **Body:** send the message text as JSON `{"message": "%sms_body%", "from": "%sms_from%"}`
  (placeholder names vary by app — "SMS to URL Forwarder" uses `%text%` / `%from%`).
  Plain-text or form bodies also work; the endpoint accepts all three.

Keep that phone online. That's the whole dependency — no gateway account.

### 3. Test it

- Make a small real UPI payment to your ID (or ask a student to), enter the UTR in
  the site → it should flip to **Approved · ⚡ auto** in admin → Payments within
  seconds of your bank SMS.
- Payments that arrive but don't match (wrong UTR typed, wrong amount) show under
  **Unmatched Bank Credits** in the Payments tab for manual reconciliation — you
  can still Approve the submission manually.

## Files

- `src/routes/api/upi-sms.ts` — the webhook endpoint.
- `src/lib/payments.server.ts` — SMS parsing (`parseBankSms`), matching, and the
  shared `applyApproval` used by auto + manual approval.
- `supabase/migrations/20260723010000_create_bank_transactions_auto_verify.sql` —
  `bank_transactions` table + `verified_via`/`bank_txn_id` on `payment_submissions`.
