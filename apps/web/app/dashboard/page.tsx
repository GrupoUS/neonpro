"use client";

/**
 * Main Dashboard Page
 * FASE 4: Frontend Components - AI-Powered Dashboards
 * Compliance: LGPD/ANVISA/CFM + WCAG 2.1 AA
 */

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface DashboardPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <main
      className="min-h-screen bg-background p-4 md:p-6 lg:p-8"
      aria-labelledby="dashboard-heading"
    >
      <div className="container mx-auto">
        <div className="space-y-6">
          <div>
            <h1
              id="dashboard-heading"
              className="text-3xl font-bold tracking-tight"
            >
              Dashboard Principal
            </h1>
            <p className="text-muted-foreground">
              Dashboard inteligente com análise em tempo real e compliance LGPD/ANVISA/CFM
            </p>
          </div>

          <div
            role="region"
            aria-label="Painéis de controle da clínica"
            className="w-full"
          >
            <DashboardLayout
              defaultView="tabs"
              defaultDashboard="analytics"
              showSettings
              className="space-y-6"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
