import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeonPro Healthcare",
  description: "Healthcare SaaS Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
