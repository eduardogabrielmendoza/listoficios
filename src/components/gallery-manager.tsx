"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useScrollLock } from "@/components/global-scroll-provider";
import type { MediaKind, PortfolioItem } from "@/lib/api-contracts";

export function GalleryManager({ initial }: { initial: PortfolioItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);
  useScrollLock(Boolean(lightbox));
  const avatar = items.find((item) => item.kind === "avatar") ?? null;
  const cover = items.find((item) => item.kind === "cover") ?? null;
  const works = useMemo(() => items.filter((item) => item.kind === "work").sort((a, b) => a.sortOrder - b.sortOrder), [items]);

  function saveItem(item: PortfolioItem) {
    setItems((current) => [...current.filter((entry) => entry.id !== item.id && (item.kind === "work" || entry.kind !== item.kind)), item]);
    router.refresh();
  }

  async function remove(item: PortfolioItem) {
    if (!window.confirm(`¿Querés eliminar ${item.kind === "work" ? "este trabajo" : item.kind === "avatar" ? "la foto de perfil" : "la portada"}?`)) return;
    setBusyId(item.id);
    setError("");
    const response = await fetch("/api/v1/media", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    if (response.ok) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      router.refresh();
    } else {
      const body = await response.json().catch(() => null);
      setError(body?.error?.message ?? "No pudimos eliminar la imagen.");
    }
    setBusyId("");
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= works.length) return;
    const reordered = [...works];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const next = reordered.map((item, sortOrder) => ({ ...item, sortOrder }));
    setItems((current) => [...current.filter((item) => item.kind !== "work"), ...next]);
    setBusyId("order");
    const response = await fetch("/api/v1/media", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: next.map(({ id, sortOrder }) => ({ id, sortOrder })) }) });
    if (!response.ok) {
      setItems((current) => [...current.filter((item) => item.kind !== "work"), ...works]);
      setError("No pudimos guardar el nuevo orden.");
    } else router.refresh();
    setBusyId("");
  }

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="section-kicker">Tu identidad visual</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Fotos y trabajos</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Subí imágenes nítidas y reales. Las optimizamos para que se vean bien y carguen rápido en cada pantalla.</p></div>
      <span className="rounded-full bg-[var(--paper)] px-4 py-2 text-xs font-semibold text-[var(--muted)]">JPEG, PNG o WebP · 5 MB</span>
    </div>

    {error && <p role="alert" className="mt-5 rounded-2xl bg-[#fff0ed] p-4 text-sm text-[#9b392d]">{error}</p>}

    <section className="mt-8 grid gap-5 lg:grid-cols-2">
      <MediaUploader kind="avatar" title="Foto de perfil" copy="Usá una foto de frente, luminosa y fácil de reconocer." current={avatar} onSaved={saveItem} onError={setError}>
        <MediaPreview item={avatar} kind="avatar" />
      </MediaUploader>
      <MediaUploader kind="cover" title="Imagen de portada" copy="Mostrá tu espacio, herramientas o un trabajo representativo." current={cover} onSaved={saveItem} onError={setError}>
        <MediaPreview item={cover} kind="cover" />
      </MediaUploader>
    </section>

    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-2xl font-semibold">Galería de trabajos</h3><p className="mt-2 text-sm text-[var(--muted)]">Hasta seis imágenes. La primera tendrá más protagonismo en tu perfil.</p></div><span className="text-sm font-semibold text-[var(--brand)]">{works.length}/6</span></div>
      {works.length > 0 ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{works.map((item, index) => <article key={item.id} className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-white">
        <button type="button" onClick={() => setLightbox(item)} className="relative block aspect-[4/3] w-full overflow-hidden bg-[var(--paper)]" aria-label={`Ampliar ${item.alt || "trabajo"}`}>
          <Image unoptimized src={item.url} alt={item.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-300 hover:scale-[1.03]" style={{ objectPosition: `${item.focalX * 100}% ${item.focalY * 100}%` }} />
        </button>
        <div className="p-4"><p className="line-clamp-2 min-h-10 text-sm font-medium">{item.caption || item.alt || "Trabajo sin descripción"}</p><div className="mt-4 flex items-center justify-between gap-2"><div className="flex gap-1"><button type="button" disabled={index === 0 || busyId === "order"} onClick={() => move(index, -1)} className="grid size-9 place-items-center rounded-full border border-[var(--line)] disabled:opacity-30" aria-label="Mover antes">←</button><button type="button" disabled={index === works.length - 1 || busyId === "order"} onClick={() => move(index, 1)} className="grid size-9 place-items-center rounded-full border border-[var(--line)] disabled:opacity-30" aria-label="Mover después">→</button></div><button type="button" disabled={busyId === item.id} onClick={() => remove(item)} className="text-xs font-semibold text-[#9b392d] disabled:opacity-50">Eliminar</button></div></div>
      </article>)}</div> : <div className="mt-5 rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-center"><p className="font-semibold">Tu galería todavía está vacía</p><p className="mt-2 text-sm text-[var(--muted)]">Una buena foto del antes y después ayuda a entender cómo trabajás.</p></div>}
      <div className="mt-5"><MediaUploader kind="work" title="Agregar un trabajo" copy="Preferí fotos horizontales y evitá incluir datos personales." current={null} disabled={works.length >= 6} onSaved={saveItem} onError={setError} /></div>
    </section>

    {(avatar || cover) && <div className="mt-8 flex flex-wrap gap-3">{avatar && <button type="button" onClick={() => remove(avatar)} className="text-xs font-semibold text-[var(--muted)] hover:text-[#9b392d]">Eliminar foto de perfil</button>}{cover && <button type="button" onClick={() => remove(cover)} className="text-xs font-semibold text-[var(--muted)] hover:text-[#9b392d]">Eliminar portada</button>}</div>}

    {lightbox && <div data-scroll-native className="fixed inset-0 z-[110] grid place-items-center overscroll-contain bg-[rgba(5,22,19,.82)] p-4" role="dialog" aria-modal="true" aria-label="Vista ampliada"><button className="absolute inset-0" onClick={() => setLightbox(null)} aria-label="Cerrar vista ampliada"/><div className="relative w-full max-w-5xl overflow-hidden rounded-[24px] bg-white"><div className="relative max-h-[78vh] min-h-[300px] w-full"><Image unoptimized src={lightbox.url.replace("variant=gallery", "variant=full")} alt={lightbox.alt} fill sizes="100vw" className="object-contain" /></div><button onClick={() => setLightbox(null)} className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow">Cerrar</button>{lightbox.caption && <p className="p-4 text-sm text-[var(--muted)]">{lightbox.caption}</p>}</div></div>}
  </div>;
}

function MediaPreview({ item, kind }: { item: PortfolioItem | null; kind: MediaKind }) {
  return <div className={`relative overflow-hidden bg-[var(--paper)] ${kind === "avatar" ? "size-24 rounded-[28px]" : "aspect-[2.5/1] w-full rounded-[20px]"}`}>
    {item ? <Image unoptimized src={item.url} alt={item.alt} fill sizes={kind === "avatar" ? "96px" : "50vw"} className="object-cover" /> : <div className="grid h-full min-h-24 place-items-center text-xs font-semibold text-[var(--muted)]">Sin imagen</div>}
  </div>;
}

function MediaUploader({ kind, title, copy, current, disabled = false, onSaved, onError, children }: { kind: MediaKind; title: string; copy: string; current: PortfolioItem | null; disabled?: boolean; onSaved: (item: PortfolioItem) => void; onError: (message: string) => void; children?: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    onError("");
    const form = event.currentTarget;
    const response = await fetch("/api/v1/media", { method: "POST", body: new FormData(form) });
    const body = await response.json().catch(() => null);
    if (response.ok) {
      onSaved(body.data);
      form.reset();
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
    } else onError(body?.error?.message ?? "No pudimos subir la imagen.");
    setBusy(false);
  }

  return <form onSubmit={upload} className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-white p-5">
    <input type="hidden" name="kind" value={kind}/>
    <div className={children ? "grid items-center gap-4 sm:grid-cols-[auto_1fr]" : ""}>{children}<div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{copy}</p></div></div>
    {preview && <div className={`relative overflow-hidden rounded-2xl bg-[var(--paper)] ${kind === "avatar" ? "size-28" : "aspect-[16/7] w-full"}`}><Image unoptimized src={preview} alt="Vista previa de la imagen elegida" fill className="object-cover" /></div>}
    <label className="field-label">Elegir imagen<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required disabled={disabled || busy} className="field-input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--paper)] file:px-3 file:py-1.5 file:text-xs file:font-semibold" onChange={(event) => { const file = event.target.files?.[0]; if (preview) URL.revokeObjectURL(preview); setPreview(file ? URL.createObjectURL(file) : ""); }} /></label>
    {kind === "work" && <label className="field-label">Descripción breve<input name="caption" maxLength={180} className="field-input" placeholder="Ej. Cocina terminada después de la reforma" /></label>}
    <label className="field-label">Texto accesible<input name="alt" maxLength={160} className="field-input" placeholder={kind === "avatar" ? "Ej. Retrato de Juan" : "Ej. Instalación eléctrica terminada"} /></label>
    <button disabled={disabled || busy} className="primary-button w-fit disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Procesando…" : current ? "Reemplazar imagen" : kind === "work" ? "Agregar a la galería" : "Subir imagen"}</button>
  </form>;
}
