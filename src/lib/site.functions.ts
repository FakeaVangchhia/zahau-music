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
    email: z.string().email().parse(d.email)
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const allowedAdminEmails = ["henrysui7@gmail.com", "fakeavangchhia@gmail.com"];
    
    if (allowedAdminEmails.includes(data.email.toLowerCase())) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
      return { isAdmin: true };
    }
    return { isAdmin: false };
  });


