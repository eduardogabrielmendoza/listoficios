import type { ZodType } from "zod";
export const STORAGE_KEYS = { profile: "listoficios:professional-draft:v2", legacyProfile: "listoficios:professional-draft:v1", legacyAgenda: "listoficios:agenda:v1" } as const;
export function loadStored<T>(key: string, schema: ZodType<T>, fallback: T): T { if (typeof window === "undefined") return fallback; try { const raw = window.localStorage.getItem(key); if (!raw) return fallback; const parsed = schema.safeParse(JSON.parse(raw)); return parsed.success ? parsed.data : fallback; } catch { return fallback; } }
export function saveStored<T>(key: string, value: T) { if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value)); }
export function removeStored(key: string) { if (typeof window !== "undefined") window.localStorage.removeItem(key); }
