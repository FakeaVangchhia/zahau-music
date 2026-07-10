import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const email = z.string().email().parse(req.nextUrl.searchParams.get("email"));
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("email", email)
      .eq("source", "book_demo")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
