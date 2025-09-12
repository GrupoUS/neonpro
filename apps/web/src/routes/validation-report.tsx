import AdvancedAnimationProductionValidationReport from '@/test-results/advanced-animation-production-validation-report';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/validation-report')({
  component: AdvancedAnimationProductionValidationReport,
});
