import type { Metadata } from "next"; import { Suspense } from "react"; import { ProfessionalsDirectory } from "@/components/professionals-directory";
export const metadata: Metadata = { title: "Profesionales en Bella Vista | Listoficios", description: "Buscá y compará servicios locales por oficio, zona y modalidad." };
export default function ProfessionalsPage() { return <Suspense fallback={<div className="mx-auto max-w-[1180px] p-10">Cargando profesionales…</div>}><ProfessionalsDirectory/></Suspense>; }
