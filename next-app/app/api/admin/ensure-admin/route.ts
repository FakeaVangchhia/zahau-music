import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = schema.parse(body);
    const supabase = getSupabaseAdmin();
    const allowedAdminEmails = ["henrysui7@gmail.com", "fakeavangchhia@gmail.com"];

    if (allowedAdminEmails.includes(email.toLowerCase())) {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
      return NextResponse.json({ isAdmin: true });
    }
    return NextResponse.json({ isAdmin: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
