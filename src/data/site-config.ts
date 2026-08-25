import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";
import { defaultSiteConfig, normalizeSiteConfig, siteConfigSchema, type SiteConfig } from "@/lib/site-config";

export const SITE_CONFIG_TAG = "site-config";

type ConfigRow = { id: string; version: number; status: string; config: unknown; change_note: string; created_at: string; published_at: string | null };

const loadPublishedConfig = unstable_cache(async (): Promise<SiteConfig> => {
  if (!supabaseIsConfigured()) return defaultSiteConfig;
  const { data, error } = await createAdminClient()
    .from("site_config_versions")
    .select("config")
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return defaultSiteConfig;
  return normalizeSiteConfig(data.config);
}, ["published-site-config"], { tags: [SITE_CONFIG_TAG], revalidate: 300 });

export async function getPublicSiteConfig() {
  return loadPublishedConfig();
}

export async function getSiteConfigVersions() {
  const { data, error } = await createAdminClient()
    .from("site_config_versions")
    .select("id, version, status, config, change_note, created_at, published_at")
    .order("version", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ConfigRow[];
}

export async function getOrCreateDraft(userId: string) {
  const supabase = createAdminClient();
  const draft = await supabase.from("site_config_versions").select("*").eq("status", "draft").maybeSingle();
  if (draft.error) throw draft.error;
  if (draft.data) return { ...draft.data, config: normalizeSiteConfig(draft.data.config) } as ConfigRow;
  const published = await supabase.from("site_config_versions").select("config, version").eq("status", "published").maybeSingle();
  if (published.error) throw published.error;
  const inserted = await supabase.from("site_config_versions").insert({
    version: Number(published.data?.version ?? 0) + 1,
    status: "draft",
    config: normalizeSiteConfig(published.data?.config),
    created_by: userId,
    change_note: "Borrador de configuración",
  }).select().single();
  if (inserted.error) throw inserted.error;
  return inserted.data as ConfigRow;
}

export async function saveSiteDraft(userId: string, config: SiteConfig, note: string) {
  const draft = await getOrCreateDraft(userId);
  const parsed = siteConfigSchema.parse(normalizeSiteConfig(config));
  const { data, error } = await createAdminClient().from("site_config_versions").update({
    config: parsed,
    change_note: note,
    updated_at: new Date().toISOString(),
  }).eq("id", draft.id).eq("status", "draft").select().single();
  if (error) throw error;
  return data as ConfigRow;
}

export async function publishSiteDraft(userId: string) {
  const supabase = createAdminClient();
  const draft = await supabase.from("site_config_versions").select("*").eq("status", "draft").maybeSingle();
  if (draft.error || !draft.data) throw draft.error ?? new Error("DRAFT_REQUIRED");
  const parsed = siteConfigSchema.parse(normalizeSiteConfig(draft.data.config));
  const current = await supabase.from("site_config_versions").select("id").eq("status", "published").maybeSingle();
  if (current.error) throw current.error;
  if (current.data) {
    const archived = await supabase.from("site_config_versions").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", current.data.id);
    if (archived.error) throw archived.error;
  }
  const published = await supabase.from("site_config_versions").update({
    status: "published",
    config: parsed,
    published_by: userId,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", draft.data.id).select().single();
  if (published.error) throw published.error;
  return published.data as ConfigRow;
}

export async function restoreSiteVersion(userId: string, versionId: string) {
  const supabase = createAdminClient();
  const source = await supabase.from("site_config_versions").select("config").eq("id", versionId).maybeSingle();
  if (source.error || !source.data) throw source.error ?? new Error("NOT_FOUND");
  const draft = await getOrCreateDraft(userId);
  const parsed = siteConfigSchema.parse(normalizeSiteConfig(source.data.config));
  const result = await supabase.from("site_config_versions").update({
    config: parsed,
    change_note: "Restaurado desde una versión anterior",
    updated_at: new Date().toISOString(),
  }).eq("id", draft.id).select().single();
  if (result.error) throw result.error;
  return result.data as ConfigRow;
}
