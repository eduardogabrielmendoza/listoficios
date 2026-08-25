import type { StaffRole } from "@/lib/admin-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveOwnProfile, saveService } from "@/data/me";
import { profileInputSchema, serviceInputSchema } from "@/lib/server/validation";

export async function auditChange(input: { actorId: string; actorRole: StaffRole; targetType: string; targetId: string; action: string; reason: string; requestId: string; before?: unknown; after?: unknown }) {
  const { error } = await createAdminClient().from("moderation_actions").insert({
    admin_user_id: input.actorId, actor_role: input.actorRole, target_type: input.targetType,
    target_id: input.targetId, action: input.action, reason: input.reason,
    request_id: input.requestId, before_data: input.before ?? {}, after_data: input.after ?? {},
  });
  if (error) throw error;
}

export async function decideModerationCase(input: { caseId: string; decision: "approved" | "rejected" | "changes_requested" | "dismissed"; reason: string; internalNote?: string; actorId: string; actorRole: StaffRole; requestId: string }) {
  const supabase = createAdminClient();
  const current = await supabase.from("moderation_cases").select("*").eq("id", input.caseId).maybeSingle();
  if (current.error || !current.data) throw new Error("NOT_FOUND");
  const status = input.decision === "dismissed" ? "dismissed" : "resolved";
  const result = await supabase.from("moderation_cases").update({ status, decision: input.decision === "dismissed" ? "pending" : input.decision, public_reason: input.reason, internal_note: input.internalNote ?? "", resolved_by: input.actorId, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", input.caseId).select().single();
  if (result.error) throw result.error;
  const row = current.data as Record<string, unknown>;
  const targetType = String(row.target_type ?? "content"); let targetId = typeof row.target_id === "string" ? row.target_id : null;
  if (input.decision === "approved" && row.user_id && targetType === "profile") {
    const payload = profileInputSchema.safeParse(row.payload_snapshot);
    if (!payload.success) throw new Error("INVALID_PAYLOAD");
    const saved = await saveOwnProfile(String(row.user_id), payload.data); targetId = saved.profileId;
    await supabase.from("moderation_cases").update({ target_id: targetId }).eq("id", input.caseId);
  }
  if (input.decision === "approved" && row.user_id && targetType === "service") {
    const payload = serviceInputSchema.safeParse(row.payload_snapshot);
    if (!payload.success) throw new Error("INVALID_PAYLOAD");
    const saved = await saveService(String(row.user_id), payload.data); targetId = saved.id;
    await supabase.from("moderation_cases").update({ target_id: targetId }).eq("id", input.caseId);
  }
  if (targetId && targetType === "profile") await supabase.from("professional_profiles").update({ moderation_status: input.decision === "approved" ? "approved" : input.decision, moderation_note: input.reason }).eq("id", targetId);
  if (targetId && targetType === "service") await supabase.from("services").update({ moderation_status: input.decision === "approved" ? "approved" : input.decision, moderation_note: input.reason }).eq("id", targetId);
  if (targetId && targetType === "review") await supabase.from("reviews").update({ status: input.decision === "approved" ? "published" : "rejected", moderation_note: input.reason }).eq("id", targetId);
  if (row.user_id) await supabase.from("notifications").insert({ user_id: row.user_id, kind: "moderation", title: input.decision === "approved" ? "Contenido aprobado" : "Revisión de tu contenido", body: input.reason || "El equipo revisó tu publicación.", href: "/panel" });
  await auditChange({ actorId: input.actorId, actorRole: input.actorRole, targetType: "moderation_case", targetId: input.caseId, action: input.decision, reason: input.reason, requestId: input.requestId, before: current.data, after: result.data });
  return result.data;
}

export async function patchUser(input: { id: string; role?: StaffRole; banned?: boolean; reason: string; actorId: string; actorRole: StaffRole; requestId: string }) {
  const supabase = createAdminClient(); const before = await supabase.from("user_profiles").select("*").eq("id", input.id).maybeSingle();
  if (before.error || !before.data) throw new Error("NOT_FOUND");
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.role) updates.role = input.role;
  if (typeof input.banned === "boolean") { updates.banned = input.banned; updates.ban_reason = input.banned ? input.reason : null; }
  const after = await supabase.from("user_profiles").update(updates).eq("id", input.id).select().single(); if (after.error) throw after.error;
  await auditChange({ actorId: input.actorId, actorRole: input.actorRole, targetType: "user", targetId: input.id, action: input.role ? "role_changed" : input.banned ? "banned" : "unbanned", reason: input.reason, requestId: input.requestId, before: before.data, after: after.data });
  return after.data;
}

export async function patchProfile(input: { id: string; values: Record<string, unknown>; reason: string; actorId: string; actorRole: StaffRole; requestId: string }) {
  const allowed = ["display_name", "headline", "bio", "experience_years", "service_mode", "status", "moderation_status"];
  const values = Object.fromEntries(Object.entries(input.values).filter(([key]) => allowed.includes(key)));
  const supabase = createAdminClient(); const before = await supabase.from("professional_profiles").select("*").eq("id", input.id).maybeSingle();
  if (before.error || !before.data) throw new Error("NOT_FOUND");
  const after = await supabase.from("professional_profiles").update({ ...values, updated_at: new Date().toISOString() }).eq("id", input.id).select().single(); if (after.error) throw after.error;
  await auditChange({ actorId: input.actorId, actorRole: input.actorRole, targetType: "profile", targetId: input.id, action: "admin_correction", reason: input.reason, requestId: input.requestId, before: before.data, after: after.data });
  return after.data;
}
