// Shared "remember this on my account" helpers used by the enrollment
// checkout modal and the book-demo page, so a signed-in student only has to
// type their phone number once — every later purchase/booking prefills it
// from their account instead of asking again.
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AccountDefaults = { name: string; email: string; phone: string };

export function getAccountDefaults(session: Session | null): AccountDefaults {
  if (!session?.user) return { name: "", email: "", phone: "" };
  const meta = session.user.user_metadata ?? {};
  return {
    name: meta.full_name || session.user.email?.split("@")[0] || "",
    email: session.user.email ?? "",
    phone: meta.phone || "",
  };
}

// Best-effort — a failure here shouldn't interrupt a purchase/booking that
// already succeeded, so callers fire this without awaiting the result.
export async function rememberPhoneOnAccount(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return;
  try {
    await supabase.auth.updateUser({ data: { phone: trimmed } });
  } catch (err) {
    console.error("Failed to save phone to account:", err);
  }
}
