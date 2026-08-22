import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportRow, ReviewRow, SupportRow } from "@/lib/supabase/rows";

async function count(table: string, status?: string) {
  let query = createAdminClient().from(table).select("id", { count: "exact", head: true });
  if (status) query = query.eq("status", status);
  const { count: value, error } = await query;
  if (error) throw error;
  return value ?? 0;
}

export async function adminOverview() {
  const supabase = createAdminClient();
  const [users, profiles, pendingReviews, openReports, openSupport, reviewsResult, reportsResult, supportResult] = await Promise.all([
    count("user_profiles"),
    count("professional_profiles"),
    count("reviews", "pending"),
    count("reports", "open"),
    count("support_tickets", "open"),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(10),
  ]);
  if (reviewsResult.error) throw reviewsResult.error;
  if (reportsResult.error) throw reportsResult.error;
  if (supportResult.error) throw supportResult.error;
  return {
    counts: { users, profiles, pendingReviews, openReports, openSupport },
    reviews: (reviewsResult.data ?? []) as unknown as ReviewRow[],
    reports: (reportsResult.data ?? []) as unknown as ReportRow[],
    support: (supportResult.data ?? []) as unknown as SupportRow[],
  };
}

export async function moderate(adminUserId: string, input: { targetType: "review" | "report" | "profile" | "support" | "user"; targetId: string; action: string; reason: string }) {
  const { error } = await createAdminClient().rpc("moderate_content", {
    p_admin_user_id: adminUserId,
    p_target_type: input.targetType,
    p_target_id: input.targetId,
    p_action: input.action,
    p_reason: input.reason,
  });
  if (error) {
    if (error.message.includes("INVALID_ACTION")) throw new Error("INVALID_ACTION");
    throw error;
  }
  return { updated: true };
}
