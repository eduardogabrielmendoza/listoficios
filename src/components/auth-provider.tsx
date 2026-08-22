"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createAuthClient } from "@/lib/auth-client";
import { supabasePublicIsConfigured } from "@/lib/supabase/config";

export type AppSession = { accountId: string; name: string; email: string; role: string };
type AuthContextValue = {
  session: AppSession | null;
  ready: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string, persistent: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function appSession(user: User, previous?: AppSession | null): AppSession {
  const email = user.email ?? "";
  return {
    accountId: user.id,
    name: String(user.user_metadata?.name ?? email.split("@")[0] ?? "Usuario"),
    email,
    role: previous?.accountId === user.id ? previous.role : "user",
  };
}

function authError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (normalized.includes("already registered") || normalized.includes("already been registered")) return "Ya existe una cuenta con ese correo.";
  if (normalized.includes("rate limit")) return "Hiciste demasiados intentos. Esperá un momento.";
  if (normalized.includes("email not confirmed")) return "Confirmá tu correo antes de ingresar.";
  return message || "No pudimos completar la acción.";
}

export function AuthProvider({ children, initialSession = null }: { children: React.ReactNode; initialSession?: AppSession | null }) {
  const supabase = useMemo(() => createAuthClient(), []);
  const [session, setSession] = useState<AppSession | null>(initialSession);
  const [ready, setReady] = useState(Boolean(initialSession) || !supabasePublicIsConfigured());

  useEffect(() => {
    if (!supabasePublicIsConfigured()) {
      return;
    }
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setSession((current) => data.user ? appSession(data.user, current) : null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession((current) => next?.user ? appSession(next.user, current) : null);
      setReady(true);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    ready,
    register: async (name, email, password) => {
      if (!supabasePublicIsConfigured()) throw new Error("Supabase todavía no está configurado.");
      const result = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (result.error) throw new Error(authError(result.error.message));
      if (!result.data.session) throw new Error("Cuenta creada. Revisá tu correo para confirmarla antes de ingresar.");
      if (result.data.user) setSession(appSession(result.data.user));
    },
    login: async (email, password) => {
      if (!supabasePublicIsConfigured()) throw new Error("Supabase todavía no está configurado.");
      const result = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (result.error) throw new Error(authError(result.error.message));
      setSession(result.data.user ? appSession(result.data.user) : null);
    },
    logout: async () => {
      if (!supabasePublicIsConfigured()) {
        setSession(null);
        return;
      }
      const result = await supabase.auth.signOut();
      if (result.error) throw new Error(authError(result.error.message));
      setSession(null);
    },
    updateName: async (name) => {
      if (!supabasePublicIsConfigured()) throw new Error("Supabase todavía no está configurado.");
      const result = await supabase.auth.updateUser({ data: { name: name.trim() } });
      if (result.error) throw new Error(authError(result.error.message));
      setSession((current) => result.data.user ? appSession(result.data.user, current) : current);
    },
    changePassword: async (currentPassword, newPassword) => {
      if (!supabasePublicIsConfigured()) throw new Error("Supabase todavía no está configurado.");
      if (!session?.email) throw new Error("La sesión no está disponible.");
      const verified = await supabase.auth.signInWithPassword({ email: session.email, password: currentPassword });
      if (verified.error) throw new Error("La contraseña actual no es correcta.");
      const result = await supabase.auth.updateUser({ password: newPassword });
      if (result.error) throw new Error(authError(result.error.message));
    },
  }), [ready, session, supabase]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
