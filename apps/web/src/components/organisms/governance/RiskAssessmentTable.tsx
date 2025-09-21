import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/molecules/table';
import { getGovernanceService } from '@/lib/governance-service';
import { Badge } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';

type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
type RiskStatus = 'active' | 'mitigating' | 'resolved' | 'closed';

function getSeverityBadge(severity: RiskSeverity) {
  const variants = {
    low: { variant: 'secondary' as const, text: 'Low' },
    medium: { variant: 'default' as const, text: 'Medium' },
    high: { variant: 'destructive' as const, text: 'High' },
    critical: { variant: 'destructive' as const, text: 'Critical' },
  };
  return variants[severity];
}

function getStatusBadge(status: RiskStatus) {
  const variants = {
    active: { variant: 'destructive' as const, text: 'Active' },
    mitigating: { variant: 'secondary' as const, text: 'Mitigating' },
    resolved: { variant: 'default' as const, text: 'Resolved' },
    closed: { variant: 'outline' as const, text: 'Closed' },
  };
  return variants[status];
}

export function RiskAssessmentTable() {
  // TODO: Get actual clinic ID from auth context
  const clinicId = 'default-clinic-id'; // Placeholder

  const { data: riskData, isLoading } = useQuery<any[]>({
    queryKey: ['risk-assessment', clinicId],
    queryFn: async () => {
      const governanceService = getGovernanceService();
      return await governanceService.getRiskAssessmentData(clinicId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Risk Assessment</h2>
        <div className='flex items-center justify-center p-8'>
          <span className='text-muted-foreground'>Loading risk data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Risk Assessment</h2>
        <div className='text-sm text-muted-foreground'>
          {riskData?.length || 0} risk
          {riskData && riskData.length !== 1 ? 's' : ''} identified
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Risk ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {riskData?.map((_risk: any) => {
            const severityBadge = getSeverityBadge(risk.severity);
            const statusBadge = getStatusBadge(risk.status);

            return (
              <TableRow key={risk.id}>
                <TableCell className='font-medium'>{risk.id}</TableCell>
                <TableCell>{risk.title}</TableCell>
                <TableCell>{risk.category}</TableCell>
                <TableCell>
                  <Badge variant={severityBadge.variant}>
                    {severityBadge.text}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.text}
                  </Badge>
                </TableCell>
                <TableCell>{risk.assignee}</TableCell>
                <TableCell>
                  {new Date(risk.dueDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {riskData && riskData.length === 0 && (
        <div className='text-center p-8 text-muted-foreground'>
          No risks identified at this time.
        </div>
      )}
    </div>
  );
}
