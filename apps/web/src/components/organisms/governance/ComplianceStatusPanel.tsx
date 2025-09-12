import { Alert, AlertDescription, AlertTitle } from '@/components/molecules/alert';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Progress } from '@/components/ui/progress';
import { getGovernanceService } from '@/lib/governance-service';
import type { ComplianceData } from '@/lib/governance-service';
import { useQuery } from '@tanstack/react-query';

type ComplianceStatus = 'compliant' | 'warning' | 'violation';

function ComplianceCard({
  title,
  score,
  status,
  violations,
  lastAudit,
}: {
  title: string;
  score: number;
  status: ComplianceStatus;
  violations: number;
  lastAudit: string;
}) {
  const getStatusBadge = (status: ComplianceStatus) => {
    const variants = {
      compliant: { variant: 'default' as const, text: 'Compliant' },
      warning: { variant: 'secondary' as const, text: 'Warning' },
      violation: { variant: 'destructive' as const, text: 'Violation' },
    };
    return variants[status];
  };

  const statusBadge = getStatusBadge(status);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-medium'>{title}</CardTitle>
          <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='flex items-baseline justify-between'>
            <span className='text-2xl font-bold'>{score}%</span>
            <span className='text-sm text-muted-foreground'>
              {violations} violations
            </span>
          </div>
          <Progress value={score} className='h-2' />
          <p className='text-xs text-muted-foreground'>
            Last audit: {new Date(lastAudit).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ComplianceStatusPanel() {
  // TODO: Get actual clinic ID from auth context
  const clinicId = 'default-clinic-id'; // Placeholder

  const { data: complianceData, isLoading } = useQuery<ComplianceData>({
    queryKey: ['compliance-status', clinicId],
    queryFn: async () => {
      const governanceService = getGovernanceService();
      return await governanceService.getComplianceStatusData(clinicId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Compliance Status</h2>
        <div className='flex items-center justify-center p-8'>
          <span className='text-muted-foreground'>Loading compliance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Compliance Status</h2>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Overall Score:</span>
          <Badge variant='default' className='text-lg font-bold'>
            {complianceData?.overallScore}%
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <ComplianceCard
          title='HIPAA Compliance'
          score={complianceData?.hipaaCompliance.score || 0}
          status={(complianceData?.hipaaCompliance.status as ComplianceStatus) || 'compliant'}
          violations={complianceData?.hipaaCompliance.violations || 0}
          lastAudit={complianceData?.hipaaCompliance.lastAudit || ''}
        />

        <ComplianceCard
          title='LGPD Compliance'
          score={complianceData?.lgpdCompliance.score || 0}
          status={(complianceData?.lgpdCompliance.status as ComplianceStatus) || 'compliant'}
          violations={complianceData?.lgpdCompliance.violations || 0}
          lastAudit={complianceData?.lgpdCompliance.lastAudit || ''}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Critical Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <span className='text-2xl font-bold text-destructive'>
                {complianceData?.criticalViolations || 0}
              </span>
              <Badge variant='destructive'>Urgent</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <span className='text-2xl font-bold text-amber-600'>
                {complianceData?.upcomingDeadlines || 0}
              </span>
              <Badge variant='secondary'>This Week</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Audit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium capitalize'>
                {complianceData?.auditStatus || 'unknown'}
              </span>
              <Badge variant='default'>Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {complianceData && complianceData.criticalViolations > 0 && (
        <Alert variant='destructive'>
          <AlertTitle>Critical Compliance Issues Detected</AlertTitle>
          <AlertDescription>
            {complianceData.criticalViolations}{' '}
            critical violation{complianceData.criticalViolations > 1 ? 's' : ''}{' '}
            require immediate attention. Review and remediate to maintain compliance status.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
