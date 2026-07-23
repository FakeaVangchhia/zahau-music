-- Manual UPI QR payment flow (replaces Razorpay).
--
-- The admin configures a UPI ID once; students scan a QR that already carries
-- the exact package amount, pay in their own UPI app, then submit the UPI
-- transaction reference (UTR) + optional screenshot. An admin verifies the
-- payment against their bank statement and approves it, which activates the
-- enrollment (or confirms the demo booking).
--
-- Security model mirrors 20260719000000_lock_down_enrollments_writes.sql:
-- students may NOT write these rows directly. All inserts/approvals happen in
-- service-role server functions that derive identity from the verified session
-- token — so nobody can self-approve a payment. Students only get SELECT on
-- their own rows for the dashboard "under review" state.

-- ── payment_settings — single-row admin config for the QR ──
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_vpa TEXT NOT NULL DEFAULT '',
  payee_name TEXT NOT NULL DEFAULT 'Zahau Music School',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
-- The VPA is a public payment address; students (and anon on /book-demo) need
-- to read it to render the QR.
CREATE POLICY "PaySettings: public read" ON public.payment_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "PaySettings: admin write" ON public.payment_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed the single settings row (fill in the real UPI ID from the admin console).
INSERT INTO public.payment_settings (upi_vpa, payee_name) VALUES ('', 'Zahau Music School');

-- ── payment_submissions — one row per student payment awaiting approval ──
CREATE TABLE public.payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'enrollment',        -- 'enrollment' | 'demo'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  package_title TEXT,
  instrument TEXT,
  day TEXT,                                         -- demo bookings only
  slot TEXT,                                         -- demo bookings only
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount INTEGER NOT NULL,                           -- rupees, set server-side
  upi_reference TEXT NOT NULL,                       -- UTR / transaction id
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',            -- 'pending' | 'approved' | 'rejected'
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX payment_submissions_status_idx ON public.payment_submissions (status);
CREATE INDEX payment_submissions_user_idx ON public.payment_submissions (user_id);

-- Students never write these rows — inserts and approvals go through
-- service-role server functions only (see src/lib/site.functions.ts).
GRANT SELECT ON public.payment_submissions TO authenticated;
GRANT ALL ON public.payment_submissions TO service_role;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments: owner read" ON public.payment_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Payments: admin read" ON public.payment_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ── payment-proofs storage bucket (PRIVATE — screenshots are sensitive) ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Students upload into a folder named after their own user id (e.g. "<uid>/utr.png").
CREATE POLICY "Proofs: owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
-- Owners may re-read their own screenshot; admins may read all (also served via
-- service-role signed URLs in the admin console).
CREATE POLICY "Proofs: owner read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Proofs: admin read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
