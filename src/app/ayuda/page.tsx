import type { Metadata } from "next";
import { HelpCenter } from "@/components/help-center";

export const metadata: Metadata = { title: "Centro de ayuda | Listoficios", description: "Respuestas y soporte para clientes y profesionales de Listoficios." };
export default function HelpPage() { return <main><HelpCenter /></main>; }
