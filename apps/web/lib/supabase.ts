import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (typeof window === "undefined") {
    return createSupabaseClient(url, key);
  }

  if (!client) {
    client = createSupabaseClient(url, key);
  }
  return client;
}
