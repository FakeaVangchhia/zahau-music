import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendDemoConfirmationEmail } from "@/lib/email.server";
import { z } from "zod";

const demoBookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  course_interest: z.string().trim().max(80).optional().or(z.literal("")),
  day: z.string().trim().min(1).max(20),
  slot: z.string().trim().min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = demoBookingSchema.parse(body);
    const supabase = getSupabaseAdmin();

    // 1. Save lead to database
    const { error } = await supabase.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      course_interest: data.course_interest || null,
      message: `Demo booking — Day: ${data.day}, Time: ${data.slot}`,
      source: "book_demo",
    });
    if (error) throw new Error(error.message);

    // 2. Send confirmation email (non-blocking)
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
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
