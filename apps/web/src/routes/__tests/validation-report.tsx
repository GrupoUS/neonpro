import { createFileRoute } from '@tanstack/react-router';
import React, { lazy, Suspense } from 'react';

// Lazy-load ONLY in dev to avoid top-level await in prod bundles
const LazyReport: React.ComponentType = (import.meta as any).env?.DEV
  ? lazy(async () => {
    try {
      const mod = await import('@/test-results/advanced-animation-production-validation-report');
      return { default: mod.default } as any;
    } catch {
      return { default: () => null } as any;
    }
  })
  : (() => null);

function ValidationReportRoute() {
  if (!(import.meta as any).env?.DEV) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <LazyReport />
    </Suspense>
  );
}

export const Route = createFileRoute('/validation-report')({
  component: ValidationReportRoute,
});
