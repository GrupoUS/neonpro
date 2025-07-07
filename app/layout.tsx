import type { Metadata } from "next";
import "./globals.css";
// Adicionando providers necessários para autenticação e tema
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "NEON PRO - Sistema de Gestão",
  description: "Sistema completo para gestão de clínicas e consultórios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Configurando providers de tema e autenticação */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
