import { redirect } from "next/navigation";
import { adminEmails } from "@/lib/server/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";
import type { Permission, StaffRole } from "@/lib/admin-types";
import { hasPermission, isStaff } from "@/lib/permissions";

export type ServerSession = {
  user: { id: string; email: string; name: string; role: StaffRole };
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
    .select("name, banned, role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError || profile?.banned) return null;
  return {
    user: {
      id: data.user.id,
      email,
      name: String(profile?.name ?? data.user.user_metadata?.name ?? email.split("@")[0]),
      role: adminEmails().includes(email) ? "admin" : normalizeRole(profile?.role),
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

export async function requireStaffSession() {
  const current = await requireServerSession();
  if (!isStaff(current.user.role)) throw new Error("FORBIDDEN");
  return current;
}

export async function requirePermission(permission: Permission) {
  const current = await requireStaffSession();
  if (!hasPermission(current.user.role, permission)) throw new Error("FORBIDDEN");
  return current;
}

export async function requirePageSession(next = "/panel") {
  const current = await getServerSession();
  if (!current) redirect(`/ingresar?next=${encodeURIComponent(next)}`);
  return current;
}

function normalizeRole(value: unknown): StaffRole {
  return value === "moderator" || value === "admin" ? value : "user";
}
