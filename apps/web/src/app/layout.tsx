import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { ApiProvider } from "@/contexts/api-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeonPro - Plataforma Healthcare AI",
  description: "Plataforma de gestão para clínicas de estética com IA integrada e compliance LGPD",
  keywords: [
    "healthcare",
    "estética",
    "LGPD",
    "gestão clínica",
    "inteligência artificial",
    "agendamento",
    "pacientes",
  ],
  authors: [{ name: "NeonPro Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "NeonPro - Healthcare AI Platform",
    description: "Gestão inteligente para clínicas de estética",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ApiProvider>
              <div className="min-h-screen bg-background">
                {children}
              </div>
              <Toaster />
            </ApiProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
