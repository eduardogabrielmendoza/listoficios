"use client";

import { useState } from "react";
import type { AdminListRow } from "@/data/admin-console";
import type { StaffRole } from "@/lib/admin-types";

export function TeamManager({ initialRows }: { initialRows: AdminListRow[] }) {
  const [rows, setRows] = useState(initialRows); const [message, setMessage] = useState("");
  async function update(id: string, role: StaffRole) { if (!confirm(`¿Asignar el rol ${role} a esta cuenta?`)) return; const response = await fetch(`/api/v1/admin/users/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ role, reason: "Asignación desde el panel de equipo" }) }); const payload = await response.json(); if (response.ok) { setRows((current) => current.map((row) => row.id === id ? { ...row, role } : row)); setMessage("Rol actualizado y auditado."); } else setMessage(payload.error?.message ?? "No pudimos actualizar el rol."); }
  return <div className="mt-7 overflow-hidden rounded-[22px] border border-[var(--line)] bg-white"><div className="divide-y divide-[var(--line)]">{rows.map((row) => <div key={String(row.id)} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div className="min-w-0"><p className="truncate font-semibold">{String(row.name)}</p><p className="truncate text-sm text-[var(--muted)]">{String(row.email)}</p></div><label className="flex items-center gap-3 text-xs font-medium text-[var(--muted)]">Rol<select value={String(row.role)} onChange={(event) => void update(String(row.id), event.target.value as StaffRole)} className="field-input !min-h-10 !w-40"><option value="user">Usuario</option><option value="moderator">Moderador</option><option value="admin">Administrador</option></select></label></div>)}</div>{message ? <p role="status" className="border-t border-[var(--line)] px-5 py-4 text-sm text-[var(--brand)]">{message}</p> : null}</div>;
}
