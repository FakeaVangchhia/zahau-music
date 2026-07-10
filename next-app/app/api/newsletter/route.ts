import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";

const newsletterSchema = z.object({ email: z.string().trim().email().max(255) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = newsletterSchema.parse(body);
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: data.email });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
