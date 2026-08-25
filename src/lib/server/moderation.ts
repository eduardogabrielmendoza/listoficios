import { createHash } from "node:crypto";
import type { ModerationAction, ModerationMatch, ModerationResult, ModerationScope } from "@/lib/admin-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";

type Rule = {
  id: string;
  normalized_term: string;
  match_type: "word" | "phrase";
  action: "review" | "block";
  scopes: string[];
  category: string;
};

const fallbackRules: Rule[] = [
  { id: "fallback-insult-1", normalized_term: "idiota", match_type: "word", action: "review", scopes: ["profile", "service", "review", "support", "report"], category: "abuse" },
  { id: "fallback-insult-2", normalized_term: "imbecil", match_type: "word", action: "review", scopes: ["profile", "service", "review", "support", "report"], category: "abuse" },
  { id: "fallback-spam-1", normalized_term: "dinero facil", match_type: "phrase", action: "review", scopes: ["profile", "service", "review"], category: "spam" },
  { id: "fallback-scam-1", normalized_term: "ganancia garantizada", match_type: "phrase", action: "review", scopes: ["profile", "service", "review"], category: "scam" },
  { id: "fallback-explicit-1", normalized_term: "contenido sexual explicito", match_type: "phrase", action: "block", scopes: ["profile", "service", "review", "support", "report"], category: "sexual" },
];

export function normalizeModerationText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1]/g, "i")
    .replace(/(?<=[a-z0-9])!(?=[a-z0-9])/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/[^a-z0-9ñ\s:/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function activeRules(scope: ModerationScope): Promise<Rule[]> {
  if (!supabaseIsConfigured()) return fallbackRules.filter((rule) => rule.scopes.includes(scope));
  const { data, error } = await createAdminClient()
    .from("moderation_rules")
    .select("id, normalized_term, match_type, action, scopes, category")
    .eq("active", true)
    .contains("scopes", [scope]);
  if (error) return fallbackRules.filter((rule) => rule.scopes.includes(scope));
  return (data ?? []) as Rule[];
}

function matchesRule(text: string, rule: Rule) {
  if (rule.match_type === "phrase") return text.includes(rule.normalized_term);
  return new RegExp(`(?:^|\\s)${escapeRegex(rule.normalized_term)}(?:$|\\s)`, "u").test(text);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function moderateFields(scope: ModerationScope, fields: Record<string, string>): Promise<ModerationResult> {
  const rules = await activeRules(scope);
  const matches: ModerationMatch[] = [];
  for (const [field, raw] of Object.entries(fields)) {
    const text = normalizeModerationText(raw);
    for (const rule of rules) {
      if (matchesRule(text, rule)) matches.push({ ruleId: rule.id, field, category: rule.category, action: rule.action });
    }
    const links = text.match(/https?:\/\//g)?.length ?? 0;
    if (links >= 3) matches.push({ ruleId: "heuristic-links", field, category: "spam", action: "review" });
    const tokens = text.split(" ").filter(Boolean);
    if (tokens.length >= 12 && new Set(tokens).size / tokens.length < 0.35) matches.push({ ruleId: "heuristic-repetition", field, category: "spam", action: "review" });
  }
  const action: ModerationAction = matches.some((match) => match.action === "block") ? "block" : matches.length ? "review" : "allow";
  const fieldErrors = Object.fromEntries([...new Set(matches.filter((match) => match.action === "block").map((match) => match.field))]
    .map((field) => [field, ["Este contenido infringe las reglas de publicación."]]));
  return { action, matches, fieldErrors };
}

export async function createModerationCase(input: {
  scope: ModerationScope;
  targetId?: string | null;
  userId?: string | null;
  payload: Record<string, unknown>;
  matches: ModerationMatch[];
}) {
  if (!supabaseIsConfigured()) return null;
  const { data, error } = await createAdminClient().from("moderation_cases").insert({
    target_type: input.scope,
    target_id: input.targetId ?? null,
    user_id: input.userId ?? null,
    payload_snapshot: input.payload,
    matches: input.matches,
    priority: input.matches.some((match) => match.action === "block") ? "high" : "medium",
  }).select("id").single();
  if (error) return null;
  return data.id as string;
}

export function rejectedContentHash(fields: Record<string, string>) {
  return createHash("sha256").update(Object.values(fields).join("\n")).digest("hex");
}
