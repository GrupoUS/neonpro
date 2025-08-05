// NeonPro - Offline Layout
// VIBECODE V1.0 - Healthcare PWA Pattern

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline - NeonPro",
  description: "You are currently offline. Some features may be limited.",
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
