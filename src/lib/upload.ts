import { supabase } from "@/integrations/supabase/client";

// Upload a payment screenshot to the private `payment-proofs` bucket. The object
// is namespaced under the student's own user id so the storage RLS policy
// (`(storage.foldername(name))[1] = auth.uid()`) permits the insert. Returns the
// object PATH (not a URL) — admins mint short-lived signed URLs from it, since
// the bucket is private.
export async function uploadPaymentProof(file: File, userId: string): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}
