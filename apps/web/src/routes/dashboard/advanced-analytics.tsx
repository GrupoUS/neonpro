/**
 * Advanced Analytics Route
 *
 * Route for AI-powered predictive analytics dashboard
 */

import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/advanced-analytics')({
  component: AdvancedAnalyticsPage,
});

function AdvancedAnalyticsPage() {
  return (
    <div className='container mx-auto py-6'>
      <AdvancedAnalyticsDashboard />
    </div>
  );
}
