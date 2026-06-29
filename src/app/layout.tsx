import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: "Decida | ¿Vale la pena tu idea de negocio?",
  description:
    "Obtén un diagnóstico inmediato de viabilidad basado en tu capital, tiempo, perfil personal, riesgos y números básicos. Antes de invertir.",
  openGraph: {
    title: "Decida | Business Viability Assessment",
    description:
      "Analiza tu idea de negocio antes de invertir tiempo y dinero. Diagnóstico claro, directo y accionable.",
    type: "website",
    locale: "es_MX",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Decida" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body
        className={`${geistSans.className} min-h-full flex flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
