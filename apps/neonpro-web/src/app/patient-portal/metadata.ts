// NeonPro - Patient Portal Metadata
// VIBECODE V1.0 - Healthcare PWA Pattern

import type { Metadata } from "next";

export const patientPortalMetadata: Metadata = {
  title: "Portal do Paciente | NeonPro",
  description:
    "Acesse seu histórico médico, agende consultas e gerencie seus dados de forma segura.",
  keywords: [
    "portal paciente",
    "agendamento online",
    "histórico médico",
    "clínica estética",
    "LGPD",
    "telemedicina",
  ],
  openGraph: {
    title: "Portal do Paciente - NeonPro",
    description: "Gerencie sua saúde e beleza de forma digital e segura",
    type: "website",
  },
  robots: {
    index: false, // Portal do paciente não deve ser indexado
    follow: false,
  },
};
