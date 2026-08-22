import type { Metadata } from "next"; import { Suspense } from "react"; import { AuthScreen } from "@/components/auth-screen";
export const metadata: Metadata = { title: "Crear cuenta | Listoficios" };
export default function RegisterPage() { return <Suspense><AuthScreen mode="register" /></Suspense>; }
