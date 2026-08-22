import type { Metadata } from "next"; import { Suspense } from "react"; import { AuthScreen } from "@/components/auth-screen";
export const metadata: Metadata = { title: "Recuperar contraseña | Listoficios" };
export default function ResetPage() { return <Suspense><AuthScreen mode="reset" /></Suspense>; }
