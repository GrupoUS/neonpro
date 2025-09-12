import { Progress } from '@/components/ui/progress';
import { getGovernanceService } from '@/lib/governance-service';
import type { AIMetrics } from '@/lib/governance-service';
import { Alert, AlertDescription, AlertTitle, Badge } from '@neonpro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';

type ModelStatus = 'active' | 'inactive' | 'maintenance';

function AIMetricCard({
  title,
  value,
  subtitle,
  progressValue,
  badgeVariant = 'default',
  badgeText,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  progressValue?: number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeText?: string;
}) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-medium'>{title}</CardTitle>
          {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <span className='text-2xl font-bold'>{value}</span>
          {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
          {progressValue !== undefined && (
            <div className='space-y-1'>
              <Progress value={progressValue} className='h-1.5' />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: ModelStatus) {
  const variants = {
    active: { variant: 'default' as const, text: 'Active' },
    inactive: { variant: 'secondary' as const, text: 'Inactive' },
    maintenance: { variant: 'secondary' as const, text: 'Maintenance' },
  };
  return variants[status];
}

export function AIGovernanceMetrics() {
  // TODO: Get actual clinic ID from auth context
  const clinicId = 'default-clinic-id'; // Placeholder

  const { data: aiData, isLoading } = useQuery<AIMetrics>({
    queryKey: ['ai-governance', clinicId],
    queryFn: async () => {
      const governanceService = getGovernanceService();
      return await governanceService.getAIGovernanceMetrics(clinicId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>AI Governance</h2>
        <div className='flex items-center justify-center p-8'>
          <span className='text-muted-foreground'>Loading AI governance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>AI Governance</h2>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Compliance Score:</span>
          <Badge variant='default' className='text-lg font-bold'>
            {aiData?.overallMetrics.complianceScore}%
          </Badge>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <AIMetricCard
          title='Average Accuracy'
          value={`${aiData?.overallMetrics.averageAccuracy}%`}
          subtitle='Model performance'
          progressValue={aiData?.overallMetrics.averageAccuracy}
          badgeText='Good'
          badgeVariant='default'
        />

        <AIMetricCard
          title='Hallucination Rate'
          value={`${aiData?.overallMetrics.averageHallucinationRate}%`}
          subtitle='AI safety metric'
          progressValue={aiData?.overallMetrics.averageHallucinationRate}
          badgeText='Monitor'
          badgeVariant='secondary'
        />

        <AIMetricCard
          title='Total Requests'
          value={aiData?.overallMetrics.totalRequests?.toLocaleString() ?? '0'}
          subtitle='Today'
          badgeText='Active'
          badgeVariant='default'
        />

        <AIMetricCard
          title='Error Rate'
          value={`${aiData?.overallMetrics.errorRate}%`}
          subtitle='System reliability'
          progressValue={aiData?.overallMetrics.errorRate}
          badgeText='Excellent'
          badgeVariant='default'
        />
      </div>

      {/* Model Details */}
      <div className='space-y-3'>
        <h3 className='text-md font-semibold'>Active Models</h3>
        <div className='grid gap-4'>
          {aiData?.models.map(model => {
            const statusBadge = getStatusBadge(model.status);

            return (
              <Card key={model.id}>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-lg'>{model.name}</CardTitle>
                      <p className='text-sm text-muted-foreground'>{model.type}</p>
                    </div>
                    <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Performance</h4>
                      <div className='space-y-1'>
                        <div className='flex justify-between text-xs'>
                          <span>Accuracy:</span>
                          <span className='font-medium'>{model.performance.accuracy}%</span>
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span>Latency:</span>
                          <span className='font-medium'>{model.performance.latency}ms</span>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Governance</h4>
                      <div className='space-y-1'>
                        <div className='flex justify-between text-xs'>
                          <span>Hallucination:</span>
                          <span className='font-medium'>{model.governance.hallucinationRate}%</span>
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span>Bias Score:</span>
                          <span className='font-medium'>{model.governance.biasScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium'>Usage Today</h4>
                      <div className='space-y-1'>
                        <div className='flex justify-between text-xs'>
                          <span>Requests:</span>
                          <span className='font-medium'>
                            {model.usage.requestsToday.toLocaleString()}
                          </span>
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span>Errors:</span>
                          <span className='font-medium'>{model.usage.errorsToday}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {aiData?.alerts && aiData.alerts.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-md font-semibold'>Governance Alerts</h3>
          {aiData.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
              <AlertTitle>AI Governance Alert</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
