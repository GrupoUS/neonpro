import { ptBR } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider, Toaster } from '@neonpro/ui';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TwentyFirstToolbar } from '@21st-extension/toolbar-next';
import { ReactPlugin } from '@21st-extension/react';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeonPro',
  description: 'Sistema de gestão empresarial moderno',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            {children}
            <Toaster />
            <TwentyFirstToolbar 
              config={{
                plugins: [ReactPlugin],
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
