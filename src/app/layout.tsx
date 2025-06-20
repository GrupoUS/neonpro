import { PWARegister } from "@/components/pwa-register";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { ThemeProvider } from "@/contexts/theme";
import { PWAInstallBanner } from "@/lib/pwa-register";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NEONPRO - Next Generation SaaS Platform",
  description:
    "Build faster, ship smarter with NEONPRO - The ultimate Next.js 15 boilerplate",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEONPRO",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "NEONPRO - Next Generation SaaS Platform",
    description: "Build faster, ship smarter with NEONPRO",
    url: "https://neonpro.app",
    siteName: "NEONPRO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEONPRO - Next Generation SaaS Platform",
    description: "Build faster, ship smarter with NEONPRO",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Preload critical CSS */}
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css"
          as="style"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-text">{children}</div>
          <PerformanceMonitor />
          <PWAInstallBanner />
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
