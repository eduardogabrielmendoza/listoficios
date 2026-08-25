"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { defaultSiteConfig, normalizeSiteConfig, type SiteConfig } from "@/lib/site-config";

type DraftResponse = { data?: { config?: SiteConfig; change_note?: string }; error?: { message?: string } };

export function SiteConfigEditor() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "saving" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/v1/admin/site-config/draft").then((response) => response.json()).then((payload: DraftResponse) => {
      if (payload.data?.config) { setConfig(normalizeSiteConfig(payload.data.config)); setNote(payload.data.change_note ?? ""); setState("ready"); }
      else { setMessage(payload.error?.message ?? "No pudimos abrir el borrador."); setState("error"); }
    }).catch(() => { setMessage("No pudimos abrir el borrador."); setState("error"); });
  }, []);

  function home<Key extends keyof SiteConfig["home"]>(key: Key, value: SiteConfig["home"][Key]) { setConfig((current) => ({ ...current, home: { ...current.home, [key]: value } })); }
  function brand<Key extends keyof SiteConfig["brand"]>(key: Key, value: SiteConfig["brand"][Key]) { setConfig((current) => ({ ...current, brand: { ...current.brand, [key]: value } })); }
  function motion<Key extends keyof SiteConfig["motion"]>(key: Key, value: SiteConfig["motion"][Key]) { setConfig((current) => ({ ...current, motion: { ...current.motion, [key]: value } })); }

  async function save() {
    setState("saving");
    const response = await fetch("/api/v1/admin/site-config/draft", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ config, note }) });
    const payload = await response.json(); setMessage(response.ok ? "Borrador guardado." : payload.error?.message ?? "No pudimos guardar."); setState(response.ok ? "success" : "error");
  }

  async function publish() {
    if (!confirm("¿Publicar este borrador para todos los visitantes?")) return;
    setState("saving");
    const response = await fetch("/api/v1/admin/site-config/publish", { method: "POST" });
    const payload = await response.json(); setMessage(response.ok ? "La nueva versión ya está publicada." : payload.error?.message ?? "No pudimos publicar."); setState(response.ok ? "success" : "error");
  }

  if (state === "loading") return <div className="mt-8 h-72 animate-pulse rounded-[24px] bg-white" />;
  return <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
    <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" value={config.brand.name} onChange={(value) => brand("name", value)} /><Field label="Nombre corto" value={config.brand.shortName} onChange={(value) => brand("shortName", value)} />
        <div className="sm:col-span-2"><Field label="Descripción de marca" value={config.brand.description} onChange={(value) => brand("description", value)} /></div>
        <UploadAsset label="Logo principal" kind="logo" onUploaded={(id) => brand("logoAssetId", id)} /><UploadAsset label="Logo compacto" kind="logo_compact" onUploaded={(id) => brand("compactLogoAssetId", id)} />
        <UploadAsset label="Favicon" kind="favicon" onUploaded={(id) => brand("faviconAssetId", id)} /><UploadAsset label="Imagen Open Graph" kind="open_graph" onUploaded={(id) => brand("openGraphAssetId", id)} />
        <Field label="Etiqueta del hero" value={config.home.eyebrow} onChange={(value) => home("eyebrow", value)} /><Field label="Fragmento destacado" value={config.home.highlight} onChange={(value) => home("highlight", value)} />
        <div className="sm:col-span-2"><Field label="Título principal" value={config.home.title} onChange={(value) => home("title", value)} /></div>
        <div className="sm:col-span-2"><label className="field-label">Descripción<textarea value={config.home.description} onChange={(event) => home("description", event.target.value)} rows={4} className="field-input resize-y" /></label></div>
        <Field label="CTA principal" value={config.home.primaryCtaLabel} onChange={(value) => home("primaryCtaLabel", value)} /><Field label="Destino del CTA" value={config.home.primaryCtaHref} onChange={(value) => home("primaryCtaHref", value)} />
        <div className="sm:col-span-2 mt-3 border-t border-[var(--line)] pt-6"><label className="flex items-start justify-between gap-4 rounded-[18px] bg-[var(--paper)] p-4"><span><strong className="block text-sm">Narrativa premium del home</strong><small className="mt-1 block text-xs leading-5 text-[var(--muted)]">Interruptor de emergencia. Al desactivarla, todo permanece visible y funcional.</small></span><input type="checkbox" checked={config.motion.enabled} onChange={(event) => motion("enabled", event.target.checked)} className="mt-1 size-5 accent-[var(--brand)]" /></label></div>
        <Field label="Etiqueta de la historia" value={config.motion.storyEyebrow} onChange={(value) => motion("storyEyebrow", value)} /><Field label="Frase de necesidad" value={config.motion.needText} onChange={(value) => motion("needText", value)} />
        <div className="sm:col-span-2"><Field label="Consulta de ejemplo" value={config.motion.searchText} onChange={(value) => motion("searchText", value)} /></div>
        <Field label="Texto de comparación" value={config.motion.compareText} onChange={(value) => motion("compareText", value)} /><Field label="Mensaje de contacto" value={config.motion.contactText} onChange={(value) => motion("contactText", value)} />
        <div className="sm:col-span-2"><Field label="Cierre de la narrativa" value={config.motion.finalText} onChange={(value) => motion("finalText", value)} /></div>
        <div className="sm:col-span-2"><Field label="Nota de esta versión" value={note} onChange={setNote} /></div>
      </div>
      <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => void save()} disabled={state === "saving"} className="secondary-button"><Icon name="check" className="size-4" /> Guardar borrador</button><button onClick={() => void publish()} disabled={state === "saving"} className="primary-button">Publicar versión</button></div>
      {message ? <p role="status" className={`mt-4 text-sm ${state === "error" ? "text-red-700" : "text-[var(--brand)]"}`}>{message}</p> : null}
    </div>
    <aside className="rounded-[26px] bg-[var(--ink)] p-6 text-white xl:sticky xl:top-24 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-[.13em] text-[var(--lime)]">Vista previa</p><p className="mt-5 text-sm text-white/65">{config.home.eyebrow}</p><h2 className="mt-3 text-4xl font-semibold leading-[.98] tracking-[-.05em]">{config.home.title} <span className="text-[var(--lime)]">{config.home.highlight}</span></h2><p className="mt-4 text-sm leading-6 text-white/65">{config.home.description}</p><span className="mt-6 inline-flex rounded-full bg-[var(--lime)] px-5 py-3 text-sm font-semibold text-[var(--ink)]">{config.home.primaryCtaLabel}</span>
      <div className="mt-7 border-t border-white/10 pt-6"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--lime)]">Narrativa {config.motion.enabled ? "activa" : "desactivada"}</p><p className="mt-3 text-lg font-semibold">{config.motion.needText}</p><p className="mt-2 text-sm text-white/55">“{config.motion.searchText}”</p><p className="mt-3 text-xs leading-5 text-white/45">{config.motion.finalText}</p></div>
    </aside>
  </div>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="field-label">{label}<input className="field-input" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }

function UploadAsset({ label, kind, onUploaded }: { label: string; kind: string; onUploaded: (id: string) => void }) {
  const [status, setStatus] = useState("");
  async function upload(file: File) { setStatus("Subiendo…"); const form = new FormData(); form.set("file", file); form.set("kind", kind); form.set("alt", label); const response = await fetch("/api/v1/admin/site-assets", { method: "POST", body: form }); const payload = await response.json(); if (response.ok) { onUploaded(payload.data.id); setStatus("Listo"); } else setStatus(payload.error?.message ?? "Error"); }
  return <label className="field-label">{label}<span className="flex min-h-[46px] items-center justify-between gap-3 rounded-[14px] border border-dashed border-[var(--line)] bg-[#fafcfb] px-3 text-xs"><input type="file" accept="image/png,image/jpeg,image/webp" className="min-w-0 text-xs" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /><span className="shrink-0 text-[var(--brand)]">{status}</span></span></label>;
}
