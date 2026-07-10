import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

// Singleton for client-side usage
let _client: ReturnType<typeof createClient> | undefined;
export function getSupabaseClient() {
  if (!_client) _client = createClient();
  return _client;
}
