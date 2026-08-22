import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PwaRegister } from "@/components/pwa-register";

const generalSans = localFont({
  variable: "--font-general-sans", display: "swap",
  src: [
    { path: "./fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "Listoficios | Profesionales en Bella Vista",
  description: "Encontrá, compará y contactá profesionales de Bella Vista, Tucumán.",
  applicationName: "Listoficios", keywords: ["oficios", "profesionales", "Bella Vista", "Tucumán", "servicios"],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: { title: "Listoficios", description: "Profesionales y servicios de Bella Vista.", type: "website", locale: "es_AR" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="es-AR" data-scroll-behavior="smooth" className={`${generalSans.variable} h-full antialiased`}><body className="flex min-h-full flex-col"><AuthProvider><SiteHeader /><div className="flex-1">{children}</div><SiteFooter /><PwaRegister/></AuthProvider></body></html>;
}
