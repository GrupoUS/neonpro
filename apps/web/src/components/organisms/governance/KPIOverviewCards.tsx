import { Progress } from '@/components/ui/progress';
import { getGovernanceService } from '@/lib/governance-service';
import type { KPIOverview } from '@/lib/governance-service';
import { Badge } from '@neonpro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';

function KPIMetricCard({
  title,
  value,
  subtitle,
  trend,
  progressValue,
  badgeVariant = 'default',
  badgeText,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
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
          <div className='flex items-baseline justify-between'>
            <span className='text-2xl font-bold'>{value}</span>
            {trend && (
              <span
                className={`text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
              >
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
          {progressValue !== undefined && (
            <div className='space-y-1'>
              <Progress value={progressValue} className='h-1.5' />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function KPIOverviewCards() {
  const { data: kpiData, isLoading } = useQuery<KPIOverview>({
    queryKey: ['kpi-overview'],
    queryFn: async () => {
      const governanceService = getGovernanceService();
      return await governanceService.getKPIOverviewData();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>KPI Overview</h2>
        <div className='flex items-center justify-center p-8'>
          <span className='text-muted-foreground'>Loading KPI data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>KPI Overview</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <KPIMetricCard
          title='Total KPIs'
          value={kpiData?.totalKPIs || 0}
          subtitle='Tracked metrics'
          badgeText='Active'
          badgeVariant='default'
        />

        <KPIMetricCard
          title='Normalization Rate'
          value={`${kpiData?.normalizationRate || 0}%`}
          subtitle='Successfully normalized'
          trend={String(kpiData?.trends.normalizationTrend ?? '')}
          progressValue={kpiData?.normalizationRate}
          badgeText='Improving'
          badgeVariant='secondary'
        />

        <KPIMetricCard
          title='Data Quality'
          value={`${kpiData?.dataQualityScore || 0}%`}
          subtitle='Quality score'
          trend={String(kpiData?.trends.qualityTrend ?? '')}
          progressValue={kpiData?.dataQualityScore}
          badgeText='Excellent'
          badgeVariant='default'
        />

        <KPIMetricCard
          title='Critical KPIs'
          value={kpiData?.criticalKPIs || 0}
          subtitle='Require attention'
          trend={String((kpiData as any)?.trends?.criticalTrend ?? '')}
          badgeText='Alert'
          badgeVariant={kpiData && kpiData.criticalKPIs > 0 ? 'destructive' : 'secondary'}
        />
      </div>
    </div>
  );
}
