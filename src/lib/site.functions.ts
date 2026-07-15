import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FALLBACK_PACKAGES } from "@/lib/fee-packages";
import { DEMO_BOOKING_FEE_PAISE } from "@/lib/razorpay";

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

export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Identity comes from the verified session token — trusting a
    // client-supplied userId/email here would let anyone grant themselves admin.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const allowedAdminEmails = ["henrysui7@gmail.com"];
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

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .validator((d: { amount: number; currency: string; receipt: string }) =>
    z
      .object({
        amount: z.number().int().positive(),
        currency: z.string().min(3).max(3),
        receipt: z.string().min(1).max(80),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error(
        "Payment gateway is not configured. Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET environment variables.",
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay Order creation failed: ${errorText}`);
    }

    const order = await response.json();
    return order;
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .validator(
    (d: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      booking_details?: {
        name: string;
        email: string;
        phone?: string;
        course_interest?: string;
        day: string;
        slot: string;
      } | null;
      enrollment_details?: {
        email: string;
        course_slug: string;
        package_title: string;
        amount_paid: number;
        instrument?: string;
      } | null;
    }) =>
      z
        .object({
          razorpay_payment_id: z.string().min(1),
          razorpay_order_id: z.string().min(1),
          razorpay_signature: z.string().min(1),
          booking_details: z
            .object({
              name: z.string(),
              email: z.string().email(),
              phone: z.string().optional().nullable(),
              course_interest: z.string().optional().nullable(),
              day: z.string(),
              slot: z.string(),
            })
            .optional()
            .nullable(),
          enrollment_details: z
            .object({
              email: z.string().email(),
              course_slug: z.string(),
              package_title: z.string(),
              amount_paid: z.number(),
              instrument: z.string().max(80).optional(),
            })
            .optional()
            .nullable(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const crypto = await import("crypto");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error(
        "Payment gateway is not configured. Missing RAZORPAY_KEY_SECRET environment variable.",
      );
    }
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== data.razorpay_signature) {
      throw new Error("Invalid payment signature. Verification failed.");
    }

    // Fetch the order from Razorpay to learn how much was ACTUALLY paid — the
    // client controls order creation, so the claimed package/amount must be
    // validated server-side or a Rs. 1 order could "buy" any package.
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      throw new Error(
        "Payment gateway is not configured. Missing RAZORPAY_KEY_ID environment variable.",
      );
    }
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const orderRes = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(data.razorpay_order_id)}`,
      { headers: { Authorization: `Basic ${basicAuth}` } },
    );
    if (!orderRes.ok) {
      throw new Error("Unable to verify the payment order with Razorpay.");
    }
    const paidOrder = (await orderRes.json()) as { amount: number; currency: string };

    if (data.booking_details && paidOrder.amount !== DEMO_BOOKING_FEE_PAISE) {
      throw new Error("Paid amount does not match the demo booking fee.");
    }

    if (data.enrollment_details) {
      const packageTitle = data.enrollment_details.package_title;
      const { data: feeRow, error: feeError } = await supabaseAdmin
        .from("fees")
        .select("raw_fees")
        .eq("title", packageTitle)
        .maybeSingle();
      if (feeError) throw new Error(feeError.message);
      const expectedRupees =
        feeRow?.raw_fees ?? FALLBACK_PACKAGES.find((pkg) => pkg.title === packageTitle)?.rawFees;
      if (expectedRupees === undefined) {
        throw new Error(`Unknown package: ${packageTitle}`);
      }
      if (paidOrder.amount !== expectedRupees * 100) {
        throw new Error("Paid amount does not match the selected package price.");
      }
      // Record the verified amount, not the client's claim
      data.enrollment_details.amount_paid = expectedRupees;
    }

    // Save details to database
    if (data.booking_details) {
      const { error } = await supabaseAdmin.from("leads").insert({
        name: data.booking_details.name,
        email: data.booking_details.email,
        phone: data.booking_details.phone || null,
        course_interest: data.booking_details.course_interest || null,
        message: `Paid Demo booking — Day: ${data.booking_details.day}, Time: ${data.booking_details.slot}. Payment ID: ${data.razorpay_payment_id}`,
        source: "book_demo",
      });
      if (error) throw new Error(error.message);

      try {
        const { sendDemoConfirmationEmail } = await import("@/lib/email.server");
        await sendDemoConfirmationEmail({
          to: data.booking_details.email,
          name: data.booking_details.name,
          day: data.booking_details.day,
          slot: data.booking_details.slot,
          courseInterest: data.booking_details.course_interest || undefined,
        });
      } catch (emailErr) {
        console.error("[BookDemo] Email send failed:", emailErr);
      }
    }

    if (data.enrollment_details) {
      const { data: courseRow } = await supabaseAdmin
        .from("courses")
        .select("id")
        .eq("slug", data.enrollment_details.course_slug)
        .maybeSingle();

      if (!courseRow) {
        throw new Error(`Course not found for slug: ${data.enrollment_details.course_slug}`);
      }

      // listUsers is paginated — walk pages until the email is found
      const targetEmail = data.enrollment_details.email.toLowerCase();
      let user: User | undefined;
      for (let page = 1; page <= 20 && !user; page++) {
        const { data: userRows, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        if (listError) throw new Error(listError.message);
        user = userRows.users.find((u) => u.email?.toLowerCase() === targetEmail);
        if (userRows.users.length < 1000) break;
      }

      if (!user) {
        throw new Error(
          `User account not found for email: ${data.enrollment_details.email}. Please register or log in first.`,
        );
      }

      // Re-purchasing the same instrument updates the enrollment with the new
      // package (UNIQUE (user_id, course_id) forbids a second row) while
      // preserving the student's progress and level.
      const purchaseDetails = {
        status: "active",
        package_title: data.enrollment_details.package_title,
        instrument: data.enrollment_details.instrument ?? null,
        amount_paid: data.enrollment_details.amount_paid,
        payment_id: data.razorpay_payment_id,
      };

      const { data: existingEnrollment, error: existingError } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseRow.id)
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);

      const { error: enrollError } = existingEnrollment
        ? await supabaseAdmin
            .from("enrollments")
            .update({ ...purchaseDetails, enrolled_at: new Date().toISOString() })
            .eq("id", existingEnrollment.id)
        : await supabaseAdmin.from("enrollments").insert({
            user_id: user.id,
            course_id: courseRow.id,
            level: "Beginner",
            progress: 0,
            ...purchaseDetails,
          });

      if (enrollError) {
        throw new Error(enrollError.message);
      }

      await supabaseAdmin.from("leads").insert({
        name: user.user_metadata?.full_name || user.email!.split("@")[0],
        email: user.email!,
        phone: user.phone || null,
        course_interest: data.enrollment_details.package_title,
        message: `Course Enrollment Purchase — Package: ${data.enrollment_details.package_title}, Amount: Rs. ${data.enrollment_details.amount_paid}. Payment ID: ${data.razorpay_payment_id}`,
        source: "course_purchase",
      });
    }

    return { ok: true, paymentId: data.razorpay_payment_id };
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
