import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  .validator((email: unknown) => z.string().email().parse(email))
  .handler(async ({ data: email }) => {
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
  .validator((d: { userId: string; email: string }) => ({
    userId: z.string().uuid().parse(d.userId),
    email: z.string().email().parse(d.email),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const allowedAdminEmails = ["henrysui7@gmail.com"];

    if (allowedAdminEmails.includes(data.email.toLowerCase())) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
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
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TCGjSQkih6IER5";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "HMXziSst8nJp0wXQbcZvnwn1";

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
            })
            .optional()
            .nullable(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const crypto = await import("crypto");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "HMXziSst8nJp0wXQbcZvnwn1";
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== data.razorpay_signature) {
      throw new Error("Invalid payment signature. Verification failed.");
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

      const { data: userRows, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      const user = userRows?.users.find(
        (u) => u.email?.toLowerCase() === data.enrollment_details!.email.toLowerCase(),
      );

      if (!user) {
        throw new Error(
          `User account not found for email: ${data.enrollment_details.email}. Please register or log in first.`,
        );
      }

      const { error: enrollError } = await supabaseAdmin.from("enrollments").insert({
        user_id: user.id,
        course_id: courseRow.id,
        level: "Beginner",
        status: "active",
        progress: 0,
      });

      if (enrollError && !enrollError.message.includes("duplicate")) {
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
