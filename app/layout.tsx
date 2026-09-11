import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GH Camiseteria | Uniformes Personalizados de Alta Qualidade",
  description: "Plataforma de uniformes corporativos, esportivos e promocionais sob medida com acabamento profissional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
