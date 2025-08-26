import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeonPro Documentation',
  description: 'Comprehensive documentation for NeonPro Healthcare Platform',
  keywords: [
    'healthcare',
    'documentation',
    'API',
    'components',
    'HIPAA',
    'ANVISA',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
          {children}
        </div>
      </body>
    </html>
  );
}
