const buildUrl = "https://build-placeholder.supabase.co";
const buildPublishableKey = "sb_publishable_build_placeholder";

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? buildUrl;
}

export function supabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? buildPublishableKey;
}

export function supabaseSecretKey() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY_NO_CONFIGURADA");
  return key;
}

export function supabasePublicIsConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
    && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function supabaseIsConfigured() {
  return Boolean(
    supabasePublicIsConfigured()
    && process.env.SUPABASE_SECRET_KEY,
  );
}
