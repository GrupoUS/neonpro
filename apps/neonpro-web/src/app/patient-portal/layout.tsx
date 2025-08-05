// NeonPro - Patient Portal Layout
// VIBECODE V1.0 - Healthcare PWA Pattern

"use client";

import type React from "react";
import type { PatientAuthProvider } from "@/lib/hooks/use-patient-auth";

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  return <PatientAuthProvider>{children}</PatientAuthProvider>;
}
