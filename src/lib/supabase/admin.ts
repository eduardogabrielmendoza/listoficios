import { createClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "@/lib/supabase/config";

export function createAdminClient() {
  return createClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
