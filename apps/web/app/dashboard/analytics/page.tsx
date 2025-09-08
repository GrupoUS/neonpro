'use client'

/**
 * Analytics Dashboard Page
 * FASE 4: Frontend Components - AI Analytics
 * Compliance: LGPD/ANVISA/CFM + WCAG 2.1 AA
 */

import { AIAnalyticsDashboard, } from '@/components/dashboard/ai-powered'

interface AnalyticsPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export default function AnalyticsPage({
  searchParams: _searchParams,
}: AnalyticsPageProps,) {
  return (
    <main
      className="min-h-screen bg-background p-4 md:p-6 lg:p-8"
      aria-labelledby="analytics-heading"
    >
      <div className="space-y-6">
        <div>
          <h1
            id="analytics-heading"
            className="text-3xl font-bold tracking-tight"
          >
            Analytics AI
          </h1>
          <p className="text-muted-foreground">
            Análise inteligente com insights em tempo real para sua clínica
          </p>
        </div>

        <div
          role="region"
          aria-label="Dashboard de analytics com inteligência artificial"
          className="w-full"
        >
          <AIAnalyticsDashboard />
        </div>
      </div>
    </main>
  )
}
