import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsDashboard } from '@/components/analytics';

function AnalyticsDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <AnalyticsDashboard />
    </div>
  );
}

export const Route = createFileRoute('/dashboard/analytics')({
  component: AnalyticsDashboardPage,
});