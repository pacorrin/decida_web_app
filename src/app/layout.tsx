import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Decida | ¿Tu idea vale el tiempo y el dinero que le vas a poner?",
  description:
    "Evalúa tu idea de negocio contra tu tiempo, tu presupuesto y tu riesgo. Tu primera evaluación es gratis: fortalezas, riesgos y qué validar antes de invertir.",
  openGraph: {
    title: "Decida | ¿Tu idea vale el tiempo y el dinero que le vas a poner?",
    description:
      "Diagnóstico de viabilidad para tu idea de negocio: fortalezas, riesgos y qué validar antes de invertir. Tu primera evaluación es gratis.",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Decida: diagnóstico de viabilidad de tu idea de negocio",
      },
    ],
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
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
