"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AmbientGlow } from "@/components/ambient-glow";
import { useAuth } from "@/components/auth-provider";

type Mode = "login" | "register" | "reset";
export function AuthScreen({ mode }: { mode: Mode }) {
  const { login, register, resetPassword } = useAuth();
  const router = useRouter(); const params = useSearchParams();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false); const [legal, setLegal] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const copy = mode === "login" ? ["Qué bueno verte", "Ingresá para guardar favoritos y administrar tu publicación.", "Ingresar"] : mode === "register" ? ["Creá tu cuenta", "Una sola cuenta para buscar, guardar y publicar tus servicios.", "Crear cuenta"] : ["Recuperá tu acceso", "En esta demo podés reemplazar la clave guardada en este navegador.", "Cambiar contraseña"];
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (mode !== "login" && password !== confirm) return setError("Las contraseñas no coinciden.");
    if (mode === "register" && (!name.trim() || !legal)) return setError("Completá tu nombre y aceptá los términos.");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password, remember);
      if (mode === "register") await register(name, email, password);
      if (mode === "reset") { await resetPassword(email, password); setDone(true); return; }
      router.push(params.get("next") || "/panel");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos completar la acción."); } finally { setBusy(false); }
  }
  return <main className="relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-20"><AmbientGlow /><div className="mx-auto grid max-w-[980px] overflow-hidden rounded-[32px] border border-[var(--line)] bg-white shadow-[0_24px_80px_rgba(12,42,36,.10)] lg:grid-cols-[.9fr_1.1fr]">
    <section className="hidden bg-[var(--ink)] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div><span className="eyebrow !text-[#9de8d2]">Listoficios local</span><h2 className="mt-5 text-4xl font-semibold leading-[1.05]">Todo lo que necesitás, cerca tuyo.</h2><p className="mt-5 text-base leading-7 text-[#c7d7d2]">Encontrá personas que trabajan en Bella Vista y hablá directamente por WhatsApp.</p></div><p className="text-xs leading-5 text-[#8ea59e]">Demo local · Los datos de acceso viven únicamente en este navegador.</p></section>
    <section className="p-6 sm:p-10 lg:p-12"><span className="eyebrow">Acceso simple</span><h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">{copy[0]}</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy[1]}</p>
      {done ? <div className="mt-8 rounded-2xl bg-[#e9f8f2] p-5 text-sm text-[var(--ink)]"><p className="font-semibold">Contraseña actualizada en este navegador.</p><Link className="mt-4 inline-flex font-semibold text-[var(--brand)]" href="/ingresar">Ir a ingresar →</Link></div> : <form onSubmit={submit} className="mt-8 grid gap-4">
        {mode === "register" && <label className="field-label">Nombre y apellido<input className="field-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>}
        <label className="field-label">Correo electrónico<input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
        <label className="field-label">{mode === "reset" ? "Nueva contraseña" : "Contraseña"}<input className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
        {mode !== "login" && <label className="field-label">Confirmar contraseña<input className="field-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" autoComplete="new-password" required /></label>}
        {mode === "login" && <div className="flex items-center justify-between gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Mantener mi sesión</label><Link href="/recuperar-clave" className="font-medium text-[var(--brand)]">Olvidé mi clave</Link></div>}
        {mode === "register" && <label className="flex items-start gap-2 text-sm leading-5 text-[var(--muted)]"><input className="mt-1" type="checkbox" checked={legal} onChange={(e) => setLegal(e.target.checked)} /> Acepto los <Link href="/terminos" className="font-medium text-[var(--brand)]">términos</Link> y la <Link href="/privacidad" className="font-medium text-[var(--brand)]">privacidad</Link>.</label>}
        {error && <p role="alert" className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#9b392d]">{error}</p>}
        <button disabled={busy} className="primary-button mt-2 w-full disabled:opacity-60">{busy ? "Procesando…" : copy[2]}</button>
      </form>}
      <p className="mt-6 text-center text-sm text-[var(--muted)]">{mode === "login" ? <>¿No tenés cuenta? <Link className="font-semibold text-[var(--ink)]" href="/crear-cuenta">Creala gratis</Link></> : mode === "register" ? <>¿Ya tenés cuenta? <Link className="font-semibold text-[var(--ink)]" href="/ingresar">Ingresá</Link></> : <Link className="font-semibold text-[var(--ink)]" href="/ingresar">Volver a ingresar</Link>}</p>
      <p className="mt-5 text-center text-[11px] leading-5 text-[#87938f]">Autenticación demostrativa local. No reemplaza un sistema de seguridad de producción.</p>
    </section>
  </div></main>;
}
