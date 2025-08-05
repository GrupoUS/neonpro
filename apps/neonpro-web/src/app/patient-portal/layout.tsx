// NeonPro - Patient Portal Layout
// VIBECODE V1.0 - Healthcare PWA Pattern

'use client'

import React from 'react'
import { PatientAuthProvider } from '@/lib/hooks/use-patient-auth'

export default function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PatientAuthProvider>
      {children}
    </PatientAuthProvider>
  )
}