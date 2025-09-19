/**
 * Advanced Analytics Route
 * 
 * Route for AI-powered predictive analytics dashboard
 */

import { createFileRoute } from '@tanstack/react-router';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';

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