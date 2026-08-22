import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ProfileWizard } from "@/components/profile-wizard";

export const metadata: Metadata = { title: "Crear perfil profesional | Listoficios", description: "Creá tu perfil profesional de Listoficios paso a paso." };
export default function CreateProfilePage() { return <main><PageHero kicker="Publicar servicio" title="Mostrá lo que hacés, de forma simple." copy="Creá una publicación clara para que las personas de Bella Vista puedan encontrarte y hablarte por WhatsApp." icon="user"/><section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto max-w-[980px]"><ProfileWizard /></div></section></main>; }
