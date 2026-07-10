import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("fees")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch fees";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
