"use client";

import { createContext, useContext, useMemo } from "react";
import { authClient } from "@/lib/auth-client";

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

function authError(error: { message?: string; code?: string } | null) {
  if (!error) return "No pudimos completar la acción.";
  if (error.code === "INVALID_EMAIL_OR_PASSWORD") return "Correo o contraseña incorrectos.";
  if (error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") return "Ya existe una cuenta con ese correo.";
  if (error.code === "TOO_MANY_REQUESTS") return "Hiciste demasiados intentos. Esperá un momento.";
  return error.message || "No pudimos completar la acción.";
}

export function AuthProvider({ children, initialSession }: { children: React.ReactNode; initialSession?: AppSession | null }) {
  const current = authClient.useSession();
  const remoteSession = current.data?.user ? {
    accountId: current.data.user.id,
    name: current.data.user.name,
    email: current.data.user.email,
    role: current.data.user.role ?? "user",
  } : null;
  const session = initialSession === undefined ? remoteSession : initialSession;

  const value = useMemo<AuthContextValue>(() => ({
    session,
    ready: initialSession !== undefined || !current.isPending,
    register: async (name, email, password) => {
      const result = await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password });
      if (result.error) throw new Error(authError(result.error));
      await current.refetch();
    },
    login: async (email, password, persistent) => {
      const result = await authClient.signIn.email({ email: email.trim().toLowerCase(), password, rememberMe: persistent });
      if (result.error) throw new Error(authError(result.error));
      await current.refetch();
    },
    logout: async () => {
      await authClient.signOut();
      await current.refetch();
    },
    updateName: async (name) => {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) throw new Error(authError(result.error));
      await current.refetch();
    },
    changePassword: async (currentPassword, newPassword) => {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (result.error) throw new Error(authError(result.error));
      await current.refetch();
    },
  }), [current, initialSession, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
