// Optional dev artifact: fallback to empty component in tests/CI
let AdvancedAnimationProductionValidationReport: any = () => null;
try {
  AdvancedAnimationProductionValidationReport = (await import('@/test-results/advanced-animation-production-validation-report')).default;
} catch {}

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/validation-report')({
  component: AdvancedAnimationProductionValidationReport,
});
