import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FALLBACK_PACKAGES } from "@/lib/fee-packages";
import { DEMO_BOOKING_FEE_PAISE, isValidUtr, normalizeUtr } from "@/lib/payments";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  course_interest: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional().or(z.literal("")),
});

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      course_interest: data.course_interest || null,
      message: data.message || null,
      source: data.source || "website",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const demoBookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  course_interest: z.string().trim().max(80).optional().or(z.literal("")),
  day: z.string().trim().min(1).max(20),
  slot: z.string().trim().min(1).max(20),
});

export const submitDemoBooking = createServerFn({ method: "POST" })
  .validator((data: unknown) => demoBookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendDemoConfirmationEmail } = await import("@/lib/email.server");

    // 1. Save lead to database
    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      course_interest: data.course_interest || null,
      message: `Demo booking — Day: ${data.day}, Time: ${data.slot}`,
      source: "book_demo",
    });
    if (error) throw new Error(error.message);

    // 2. Send confirmation email (non-blocking failure — don't break the booking)
    try {
      await sendDemoConfirmationEmail({
        to: data.email,
        name: data.name,
        day: data.day,
        slot: data.slot,
        courseInterest: data.course_interest || undefined,
      });
    } catch (emailErr) {
      console.error("[BookDemo] Email send failed:", emailErr);
      // Booking is saved — swallow the email error so UX isn't broken
    }

    return { ok: true };
  });

const newsletterSchema = z.object({ email: z.string().trim().email().max(255) });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((d: unknown) => newsletterSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const getCourses = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("id, slug, name, tagline, summary, duration, levels, certification, display_order")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCourse = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => ({ slug: z.string().min(1).max(80).parse(d.slug) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getFees = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("fees")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getLessons = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("lessons")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("id, slug, title, excerpt, author, date, created_at")
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPost = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => ({ slug: z.string().min(1).max(80).parse(d.slug) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getUserDemoBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Email comes from the verified session token — never from client input,
    // otherwise anyone could read another person's bookings.
    const email = context.user.email;
    if (!email) return [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("email", email)
      .eq("source", "book_demo")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Emails that are always treated as admins, mirroring ensureAdminRole and the
// Next.js allowlist. Beyond these, admin status is whatever's in user_roles.
const ALLOWED_ADMIN_EMAILS = [
  "henrysui7@gmail.com",
  "henrysui@zahaumusic.com",
  "fakeavangchhia@gmail.com",
];

// Guard for admin-only server actions. supabaseAdmin bypasses RLS, so any
// mutation it performs on a caller's behalf MUST verify the caller is an admin
// here — there is no generic admin-mutation middleware. Identity comes from the
// verified session token in `context`, never from client input.
async function assertAdmin(context: { userId: string; user: User }): Promise<void> {
  const email = context.user.email?.toLowerCase() ?? "";
  if (ALLOWED_ADMIN_EMAILS.includes(email)) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required.");
}

export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Identity comes from the verified session token — trusting a
    // client-supplied userId/email here would let anyone grant themselves admin.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const allowedAdminEmails = ["henrysui7@gmail.com", "henrysui@zahaumusic.com"];
    const email = context.user.email?.toLowerCase() ?? "";

    if (allowedAdminEmails.includes(email)) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
      return { isAdmin: true };
    }
    return { isAdmin: false };
  });

// ── Manual UPI QR payments (replaces Razorpay) ──────────────────────────────

// Public: the UPI id + payee name used to render the payment QR. The VPA is a
// public payment address, so this is safe to read unauthenticated (needed on
// /book-demo where the visitor may not be signed in).
export const getPaymentSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("payment_settings")
    .select("upi_vpa, payee_name, is_active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? { upi_vpa: "", payee_name: "Zahau Music School", is_active: true };
});

const paymentProofSchema = z.object({
  course_slug: z.string().trim().max(80).optional().nullable(),
  package_title: z.string().trim().min(1).max(120),
  instrument: z.string().trim().max(80).optional().nullable(),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  // Optional — a student can just tap "I've Paid". When provided it enables
  // instant auto-verification against the bank credit.
  upi_reference: z.string().trim().max(60).optional().or(z.literal("")),
  screenshot_url: z.string().trim().max(500).optional().or(z.literal("")),
});

// Student submits proof of a UPI payment for a course enrollment. Identity and
// amount are derived server-side — the client never dictates who is paying or
// how much is owed, so a doctored request can't self-grant a paid enrollment
// (mirrors the enrollments write lock-down). Requires a signed-in student.
export const submitPaymentProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => paymentProofSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = context.user.email;
    if (!email) throw new Error("Your account has no email address on file.");

    const packageTitle = data.package_title.trim();
    // Server-authoritative price — look up the fee the student actually owes
    // rather than trusting any client-supplied amount.
    const { data: feeRow, error: feeError } = await supabaseAdmin
      .from("fees")
      .select("raw_fees")
      .eq("title", packageTitle)
      .maybeSingle();
    if (feeError) throw new Error(feeError.message);
    const expectedRupees =
      feeRow?.raw_fees ?? FALLBACK_PACKAGES.find((pkg) => pkg.title === packageTitle)?.rawFees;
    if (expectedRupees === undefined) throw new Error(`Unknown package: ${packageTitle}`);
    const amount = expectedRupees;

    const slug = data.course_slug?.trim() || "piano";
    const { data: courseRow, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (courseError) throw new Error(courseError.message);
    if (!courseRow) throw new Error(`Course not found for slug: ${slug}`);
    const courseId = courseRow.id;

    // UTR is optional, but when given it must be a real 12-digit UPI reference —
    // store the normalized form so auto-matching against bank credits is exact.
    const rawUtr = data.upi_reference?.trim() || "";
    if (rawUtr && !isValidUtr(rawUtr)) {
      throw new Error(
        "That doesn't look like a valid UPI reference (UTR) — it's the 12-digit number on your payment receipt. Leave it blank if you're not sure.",
      );
    }
    const utr = rawUtr ? normalizeUtr(rawUtr) : "";

    const { data: submission, error: insertError } = await supabaseAdmin
      .from("payment_submissions")
      .insert({
        kind: "enrollment",
        user_id: context.userId,
        course_id: courseId,
        package_title: packageTitle,
        instrument: data.instrument || null,
        name: data.name,
        email,
        phone: data.phone || null,
        amount,
        upi_reference: utr,
        screenshot_url: data.screenshot_url || null,
        status: "pending",
      })
      .select("*")
      .single();
    if (insertError) throw new Error(insertError.message);

    // The matching bank credit may already have arrived — if so, activate now.
    const { tryAutoVerifySubmission } = await import("@/lib/payments.server");
    const autoApproved = await tryAutoVerifySubmission(submission);

    if (!autoApproved) {
      // Surface a pending enrollment in the student's dashboard, but never
      // downgrade an already-active enrollment (e.g. a renewal payment) — that
      // would revoke access until an admin gets around to approving.
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", context.userId)
        .eq("course_id", courseId)
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);

      if (!existing) {
        const { error: enrollError } = await supabaseAdmin.from("enrollments").insert({
          user_id: context.userId,
          course_id: courseId,
          level: "Beginner",
          progress: 0,
          status: "pending",
          package_title: packageTitle,
          instrument: data.instrument || null,
          amount_paid: amount,
          payment_id: utr ? `UPI:${utr}` : "UPI",
        });
        if (enrollError) throw new Error(enrollError.message);
      }
    }

    return { ok: true, submissionId: submission.id, autoApproved };
  });

const demoPaymentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  course_interest: z.string().trim().max(80).optional().or(z.literal("")),
  day: z.string().trim().min(1).max(20),
  slot: z.string().trim().min(1).max(20),
  upi_reference: z.string().trim().max(60).optional().or(z.literal("")),
});

// Public: a Rs. 500 demo-deposit payment for admin verification. Unlike
// enrollment, /book-demo allows visitors who aren't signed in, so this has no
// auth middleware and no screenshot upload (the private bucket needs auth). The
// deposit amount is fixed and set server-side.
export const submitDemoPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => demoPaymentSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const amount = DEMO_BOOKING_FEE_PAISE / 100;
    // Same rule as enrollment: optional, but must be a real 12-digit UTR if given.
    const rawUtr = data.upi_reference?.trim() || "";
    if (rawUtr && !isValidUtr(rawUtr)) {
      throw new Error(
        "That doesn't look like a valid UPI reference (UTR) — it's the 12-digit number on your payment receipt. Leave it blank if you're not sure.",
      );
    }
    const utr = rawUtr ? normalizeUtr(rawUtr) : "";

    const { data: submission, error: insertError } = await supabaseAdmin
      .from("payment_submissions")
      .insert({
        kind: "demo",
        package_title: data.course_interest || null,
        day: data.day,
        slot: data.slot,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        amount,
        upi_reference: utr,
        status: "pending",
      })
      .select("*")
      .single();
    if (insertError) throw new Error(insertError.message);

    // Hold the slot immediately so it can't be double-booked while under review.
    // The "Day: … Time: …" phrasing is what getBookedSlots parses.
    const { error: leadError } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      course_interest: data.course_interest || null,
      message: `Demo booking (payment pending review) — Day: ${data.day}, Time: ${data.slot}. UTR: ${utr || "—"}`,
      source: "book_demo",
    });
    if (leadError) throw new Error(leadError.message);

    // The matching Rs. 500 credit may already have arrived — confirm instantly if so.
    const { tryAutoVerifySubmission } = await import("@/lib/payments.server");
    const autoApproved = await tryAutoVerifySubmission(submission);

    return { ok: true, autoApproved };
  });

// Student: own payment submissions, for the dashboard "under review" state.
export const getMyPaymentSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("payment_submissions")
      .select(
        "id, kind, package_title, instrument, day, slot, amount, upi_reference, status, created_at",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Admin: every submission, each with a short-lived signed URL for its private
// screenshot so the reviewer can eyeball the proof.
export const listPaymentSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("payment_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const withUrls = await Promise.all(
      rows.map(async (row) => {
        let screenshot_signed_url: string | null = null;
        if (row.screenshot_url) {
          const { data: signed } = await supabaseAdmin.storage
            .from("payment-proofs")
            .createSignedUrl(row.screenshot_url, 60 * 60);
          screenshot_signed_url = signed?.signedUrl ?? null;
        }
        return { ...row, screenshot_signed_url };
      }),
    );
    return withUrls;
  });

const reviewSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  admin_note: z.string().trim().max(500).optional().or(z.literal("")),
});

// Admin: approve or reject a submission. Approval is the only path that grants a
// paid enrollment / confirms a demo — gated by assertAdmin.
export const reviewPaymentSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => reviewSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: submission, error: fetchError } = await supabaseAdmin
      .from("payment_submissions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchError) throw new Error(fetchError.message);
    if (!submission) throw new Error("Payment submission not found.");

    if (data.action === "approve") {
      // Same activation path as automatic verification, tagged as a manual review.
      const { applyApproval } = await import("@/lib/payments.server");
      await applyApproval(submission, {
        via: "manual",
        reviewedBy: context.userId,
        adminNote: data.admin_note || null,
      });
      return { ok: true };
    }

    // Reject: clear away only a still-pending enrollment created by this
    // submission; never touch an already-active one from a prior purchase.
    if (submission.kind === "enrollment" && submission.course_id && submission.user_id) {
      await supabaseAdmin
        .from("enrollments")
        .update({ status: "rejected" })
        .eq("user_id", submission.user_id)
        .eq("course_id", submission.course_id)
        .eq("status", "pending");
    }

    const { error: updateError } = await supabaseAdmin
      .from("payment_submissions")
      .update({
        status: "rejected",
        admin_note: data.admin_note || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (updateError) throw new Error(updateError.message);

    return { ok: true };
  });

// Admin: the raw bank-credit ledger, for reconciling payments that arrived but
// didn't auto-match (e.g. the student typed the wrong UTR or paid the wrong
// amount).
export const listBankTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bank_transactions")
      .select("*")
      .order("received_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBookedSlots = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("message")
    .eq("source", "book_demo");

  if (error) throw new Error(error.message);

  const booked: Record<string, string[]> = {};

  (data || []).forEach((row) => {
    if (!row.message) return;
    const match = row.message.match(/Day:\s*([^,]+),\s*Time:\s*([^.]+)/i);
    if (match) {
      const dateStr = match[1].trim();
      let slotStr = match[2].trim();
      if (slotStr.includes("Payment ID:")) {
        slotStr = slotStr.split("Payment ID:")[0].replace(/\.$/, "").trim();
      }
      if (!booked[dateStr]) {
        booked[dateStr] = [];
      }
      if (!booked[dateStr].includes(slotStr)) {
        booked[dateStr].push(slotStr);
      }
    }
  });
  return booked;
});
