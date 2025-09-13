import { createFileRoute } from '@tanstack/react-router';
import { ServiceAnalyticsDashboard } from '@/components/service-analytics/ServiceAnalyticsDashboard';

export const Route = createFileRoute('/service-analytics')({
  component: ServiceAnalyticsPage,
});

function ServiceAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics de Serviços</h1>
          <p className="text-muted-foreground">
            Análise detalhada de performance, receita e estatísticas de uso dos serviços
          </p>
        </div>
        
        <ServiceAnalyticsDashboard />
      </div>
    </div>
  );
}
