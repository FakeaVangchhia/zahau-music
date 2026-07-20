-- The app never writes enrollments from the client: all inserts/updates go
-- through the service-role Razorpay verification path in site.functions.ts.
-- The prior INSERT/UPDATE grants + "owner" policies let any authenticated
-- student write their own row directly (e.g. via the browser Supabase
-- client), setting status/amount_paid/payment_id/package_title to anything
-- they want and self-granting a fully "paid" enrollment with no payment.
-- Lock enrollments down to owner-read only; writes are service_role-only.

DROP POLICY IF EXISTS "Enroll: owner W" ON public.enrollments;
DROP POLICY IF EXISTS "Enroll: owner U" ON public.enrollments;

REVOKE INSERT, UPDATE, DELETE ON public.enrollments FROM authenticated;
