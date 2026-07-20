import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
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

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("email", user.email)
      .eq("source", "book_demo")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
