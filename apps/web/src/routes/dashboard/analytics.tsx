import { AnalyticsDashboard } from '@/components/analytics';
import { createFileRoute } from '@tanstack/react-router';

function AnalyticsDashboardPage() {
  return (
    <div className='container mx-auto px-4 py-6'>
      <AnalyticsDashboard />
    </div>
  );
}

export const Route = createFileRoute('/dashboard/analytics')({
  component: AnalyticsDashboardPage,
});
