import { redirect } from "next/navigation";
import { adminEmails } from "@/lib/server/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";

export type ServerSession = {
  user: { id: string; email: string; name: string; role: "user" | "admin" };
};

export function authIsConfigured() {
  return supabaseIsConfigured();
}

export async function getServerSession(): Promise<ServerSession | null> {
  if (!authIsConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  const email = data.user.email.toLowerCase();
  const { data: profile, error: profileError } = await createAdminClient()
    .from("user_profiles")
    .select("name, banned")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError || profile?.banned) return null;
  return {
    user: {
      id: data.user.id,
      email,
      name: String(profile?.name ?? data.user.user_metadata?.name ?? email.split("@")[0]),
      role: adminEmails().includes(email) ? "admin" : "user",
    },
  };
}

export async function requireServerSession() {
  const current = await getServerSession();
  if (!current) redirect("/ingresar");
  return current;
}

export async function requireAdminSession() {
  const current = await requireServerSession();
  if (current.user.role !== "admin") throw new Error("FORBIDDEN");
  return current;
}

export async function requirePageSession(next = "/panel") {
  const current = await getServerSession();
  if (!current) redirect(`/ingresar?next=${encodeURIComponent(next)}`);
  return current;
}
