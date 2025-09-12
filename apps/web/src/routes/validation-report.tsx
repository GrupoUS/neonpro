import { createFileRoute } from '@tanstack/react-router'
import AdvancedAnimationProductionValidationReport from '@/test-results/advanced-animation-production-validation-report'

export const Route = createFileRoute('/validation-report')({
  component: AdvancedAnimationProductionValidationReport,
})