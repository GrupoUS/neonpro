import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter, Libre_Baskerville, Lora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Configure Inter as the main sans-serif font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Configure Lora as the serif font
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Configure Libre Baskerville as the monospace font (artistic choice)
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeonPro - Professional Business Dashboard",
  description:
    "Advanced business management platform with modern glass morphism design",
  generator: "Next.js 15 + shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${lora.variable} ${libreBaskerville.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
