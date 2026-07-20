import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseSession = createClient(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabaseSession.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedAdminEmails = ["henrysui7@gmail.com", "fakeavangchhia@gmail.com"];

    if (allowedAdminEmails.includes(user.email.toLowerCase())) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
      return NextResponse.json({ isAdmin: true });
    }
    return NextResponse.json({ isAdmin: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
