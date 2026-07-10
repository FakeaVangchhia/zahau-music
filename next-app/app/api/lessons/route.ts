import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch lessons";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
