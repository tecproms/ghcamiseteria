import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ghcamiseteria.techproms.com.br"),
  title: "GH Camiseteria | Catálogo Online & Uniformes em Geral",
  description:
    "Catálogo online oficial da GH Camiseteria. Polos corporativas, camisas sociais, uniformes de times, jalecos médicos, scrubs e camisetas promocionais sob medida.",
  keywords: [
    "camiseteria",
    "uniformes personalizados",
    "camisas polo",
    "jalecos",
    "scrubs",
    "uniforme de futebol",
    "sublimação total",
    "bordado computadorizado",
    "uniformes campo grande",
    "gh camiseteria",
  ],
  authors: [{ name: "GH Camiseteria" }],
  openGraph: {
    title: "GH Camiseteria | Catálogo Online de Uniformes",
    description: "Sua ideia, do seu jeito. Conheça nossos modelos e faça seu orçamento rápido.",
    url: "https://ghcamiseteria.techproms.com.br",
    siteName: "GH Camiseteria",
    images: [
      {
        url: "/images/brand/hero-catalog.png",
        width: 1200,
        height: 800,
        alt: "GH Camiseteria Catálogo Oficial",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/thumbnail.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#090A0F] text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
