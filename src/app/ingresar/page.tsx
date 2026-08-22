import type { Metadata } from "next"; import { Suspense } from "react"; import { AuthScreen } from "@/components/auth-screen";
export const metadata: Metadata = { title: "Ingresar | Listoficios" };
export default function LoginPage() { return <Suspense><AuthScreen mode="login" /></Suspense>; }
