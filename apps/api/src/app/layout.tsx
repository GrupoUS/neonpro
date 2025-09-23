import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeonPro API",
  description: "Healthcare management API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
