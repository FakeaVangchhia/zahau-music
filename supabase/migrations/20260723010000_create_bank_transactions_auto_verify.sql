-- KYC-free auto-verification of UPI payments.
--
-- A plain UPI QR gives no server-side payment callback, so we reconcile against
-- the bank's own credit SMS: an Android SMS-forwarding app POSTs each incoming
-- bank message to /api/upi-sms (secret-protected), we parse the amount + UPI
-- reference (UTR), record it here, and auto-approve any pending
-- payment_submission whose student-entered UTR AND amount both match. A credit
-- can only be recorded via the secret webhook, and approval requires the UTR to
-- match a real credit — so nobody can self-approve.

CREATE TABLE public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utr TEXT NOT NULL UNIQUE,                 -- 12-digit UPI reference / RRN
  amount INTEGER NOT NULL,                  -- rupees
  sender TEXT,                              -- payer VPA/name if parseable
  raw_message TEXT,                         -- original SMS, for audit
  matched_submission_id UUID REFERENCES public.payment_submissions(id) ON DELETE SET NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX bank_transactions_matched_idx ON public.bank_transactions (matched_submission_id);
GRANT SELECT ON public.bank_transactions TO authenticated;
GRANT ALL ON public.bank_transactions TO service_role;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
-- Admin-read only; all writes happen service-role-side in the webhook.
CREATE POLICY "BankTxn: admin read" ON public.bank_transactions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS verified_via TEXT,     -- 'auto' | 'manual' | NULL
  ADD COLUMN IF NOT EXISTS bank_txn_id UUID
    REFERENCES public.bank_transactions(id) ON DELETE SET NULL;
