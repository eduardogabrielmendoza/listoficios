import type { LocalAccount, LocalSession } from "@/lib/app-types";
import { STORAGE_KEYS } from "@/lib/local-storage";
import { accountSchema, sessionSchema } from "@/lib/schemas";

const encoder = new TextEncoder();
const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: 210000 }, key, 256);
  return toBase64(new Uint8Array(bits));
}

export async function createPasswordRecord(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: toBase64(salt), verifier: await derive(password, salt) };
}
export async function verifyPassword(password: string, account: LocalAccount) { return (await derive(password, fromBase64(account.salt))) === account.verifier; }
export function readAccount(): LocalAccount | null { try { const result = accountSchema.safeParse(JSON.parse(localStorage.getItem(STORAGE_KEYS.account) ?? "null")); return result.success ? result.data : null; } catch { return null; } }
export function writeAccount(account: LocalAccount) { localStorage.setItem(STORAGE_KEYS.account, JSON.stringify(account)); }
export function readSession(): LocalSession | null {
  for (const storage of [sessionStorage, localStorage]) { try { const result = sessionSchema.safeParse(JSON.parse(storage.getItem(STORAGE_KEYS.session) ?? "null")); if (result.success) return result.data; } catch {} }
  return null;
}
export function writeSession(session: LocalSession) { sessionStorage.removeItem(STORAGE_KEYS.session); localStorage.removeItem(STORAGE_KEYS.session); (session.persistent ? localStorage : sessionStorage).setItem(STORAGE_KEYS.session, JSON.stringify(session)); }
export function clearSession() { sessionStorage.removeItem(STORAGE_KEYS.session); localStorage.removeItem(STORAGE_KEYS.session); }
