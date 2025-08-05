// NeonPro - Offline Layout
// VIBECODE V1.0 - Healthcare PWA Pattern

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline - NeonPro',
  description: 'You are currently offline. Some features may be limited.',
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}