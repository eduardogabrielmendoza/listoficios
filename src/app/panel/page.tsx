import type { Metadata } from "next"; import { Suspense } from "react"; import { UserPanel } from "@/components/user-panel";
export const metadata: Metadata = { title: "Mi panel | Listoficios" };
export default function PanelPage() { return <Suspense><UserPanel/></Suspense>; }
