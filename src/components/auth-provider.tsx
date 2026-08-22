"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LocalAccount, LocalSession } from "@/lib/app-types";
import { clearSession, createPasswordRecord, readAccount, readSession, verifyPassword, writeAccount, writeSession } from "@/lib/auth";

type AuthContextValue = { session: LocalSession | null; ready: boolean; register: (name: string, email: string, password: string) => Promise<void>; login: (email: string, password: string, persistent: boolean) => Promise<void>; logout: () => void; resetPassword: (email: string, password: string) => Promise<void>; updateName: (name: string) => void };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setSession(readSession()); setReady(true); }, []);
  const value = useMemo<AuthContextValue>(() => ({
    session, ready,
    register: async (name, email, password) => {
      const existing = readAccount(); if (existing && existing.email.toLowerCase() === email.toLowerCase()) throw new Error("Ya existe una cuenta local con ese correo.");
      const record = await createPasswordRecord(password); const account: LocalAccount = { id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), ...record, createdAt: new Date().toISOString() }; writeAccount(account);
      const next = { accountId: account.id, name: account.name, email: account.email, createdAt: new Date().toISOString(), persistent: false }; writeSession(next); setSession(next);
    },
    login: async (email, password, persistent) => { const account = readAccount(); if (!account || account.email !== email.trim().toLowerCase() || !(await verifyPassword(password, account))) throw new Error("Correo o contraseña incorrectos."); const next = { accountId: account.id, name: account.name, email: account.email, createdAt: new Date().toISOString(), persistent }; writeSession(next); setSession(next); },
    logout: () => { clearSession(); setSession(null); },
    resetPassword: async (email, password) => { const account = readAccount(); if (!account || account.email !== email.trim().toLowerCase()) throw new Error("No encontramos esa cuenta en este navegador."); const record = await createPasswordRecord(password); writeAccount({ ...account, ...record }); clearSession(); setSession(null); },
    updateName: (name) => { const account = readAccount(); if (!account || !session) return; writeAccount({ ...account, name }); const next = { ...session, name }; writeSession(next); setSession(next); },
  }), [ready, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider"); return value; }
