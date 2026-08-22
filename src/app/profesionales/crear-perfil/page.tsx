import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProfileWizard } from "@/components/profile-wizard";
import { getServerSession } from "@/lib/auth-server";

export const metadata: Metadata = { title: "Crear perfil profesional | Listoficios", description: "Creá tu perfil profesional de Listoficios paso a paso." };
export const dynamic = "force-dynamic";
export default async function CreateProfilePage() { const session = await getServerSession(); if (!session) redirect("/crear-cuenta?next=/profesionales/crear-perfil"); return <main><PageHero kicker="Publicar servicio" title="Mostrá lo que hacés, de forma simple." copy="Creá una publicación clara para que las personas de Bella Vista puedan encontrarte y hablarte por WhatsApp." icon="user"/><section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto max-w-[980px]"><ProfileWizard /></div></section></main>; }
