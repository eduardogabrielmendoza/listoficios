import type { Metadata } from "next"; import { Suspense } from "react"; import { redirect } from "next/navigation"; import { UserPanel } from "@/components/user-panel"; import { getServerSession } from "@/lib/auth-server";
export const metadata: Metadata = { title: "Mi panel | Listoficios" };
export const dynamic = "force-dynamic";
export default async function PanelPage() { const session = await getServerSession(); if (!session) redirect("/ingresar?next=/panel"); return <Suspense><UserPanel/></Suspense>; }
