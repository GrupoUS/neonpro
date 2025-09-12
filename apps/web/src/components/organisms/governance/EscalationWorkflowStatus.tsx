import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/molecules/table';
import { getGovernanceService } from '@/lib/governance-service';
import type { Escalations } from '@/lib/governance-service';
import { useQuery } from '@tanstack/react-query';

type EscalationPriority = 'low' | 'medium' | 'high' | 'critical';
type EscalationStatus = 'new' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

function EscalationSummaryCard({
  title,
  value,
  subtitle,
  badgeVariant = 'default',
  badgeText,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
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
        <div className='space-y-1'>
          <span className='text-2xl font-bold'>{value}</span>
          {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function getPriorityBadge(priority: EscalationPriority) {
  const variants = {
    low: { variant: 'outline' as const, text: 'Low' },
    medium: { variant: 'secondary' as const, text: 'Medium' },
    high: { variant: 'default' as const, text: 'High' },
    critical: { variant: 'destructive' as const, text: 'Critical' },
  };
  return variants[priority];
}

function getStatusBadge(status: EscalationStatus) {
  const variants = {
    new: { variant: 'outline' as const, text: 'New' },
    in_progress: { variant: 'secondary' as const, text: 'In Progress' },
    escalated: { variant: 'destructive' as const, text: 'Escalated' },
    resolved: { variant: 'default' as const, text: 'Resolved' },
    closed: { variant: 'outline' as const, text: 'Closed' },
  };
  return variants[status];
}

export function EscalationWorkflowStatus() {
  // TODO: Get actual clinic ID from auth context
  const clinicId = 'default-clinic-id'; // Placeholder

  const { data: escalationData, isLoading } = useQuery<Escalations>({
    queryKey: ['escalation-workflow', clinicId],
    queryFn: async () => {
      const governanceService = getGovernanceService();
      return await governanceService.getEscalationWorkflowData(clinicId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Escalation Workflow</h2>
        <div className='flex items-center justify-center p-8'>
          <span className='text-muted-foreground'>Loading escalation data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Escalation Workflow</h2>
        <div className='text-sm text-muted-foreground'>
          {escalationData?.summary.totalActive || 0} active escalations
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4'>
        <EscalationSummaryCard
          title='Total Active'
          value={escalationData?.summary.totalActive || 0}
          subtitle='Active escalations'
          badgeText='Overview'
          badgeVariant='outline'
        />

        <EscalationSummaryCard
          title='Critical Count'
          value={escalationData?.summary.criticalCount || 0}
          subtitle='Urgent attention'
          badgeText='Critical'
          badgeVariant='destructive'
        />

        <EscalationSummaryCard
          title='High Priority'
          value={escalationData?.summary.highCount || 0}
          subtitle='High priority items'
          badgeText='High'
          badgeVariant='default'
        />

        <EscalationSummaryCard
          title='Overdue'
          value={escalationData?.summary.overdue || 0}
          subtitle='Past deadline'
          badgeText={escalationData && escalationData.summary.overdue > 0
            ? 'Action Required'
            : 'On Time'}
          badgeVariant={escalationData && escalationData.summary.overdue > 0
            ? 'destructive'
            : 'default'}
        />

        <EscalationSummaryCard
          title='Avg Response Time'
          value={`${escalationData?.summary.avgResponseTime || 0}h`}
          subtitle='Response efficiency'
          badgeText='Good'
          badgeVariant='default'
        />

        <EscalationSummaryCard
          title='Completed Today'
          value={escalationData?.summary.completedToday || 0}
          subtitle='Resolved today'
          badgeText='Progress'
          badgeVariant='secondary'
        />
      </div>

      {/* Active Escalations Table */}
      <div className='space-y-3'>
        <h3 className='text-md font-semibold'>Active Escalations</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escalationData?.activeEscalations.map(escalation => {
              const priorityBadge = getPriorityBadge(
                (escalation.priority ?? 'low') as EscalationPriority,
              );
              const statusBadge = getStatusBadge((escalation.status ?? 'new') as EscalationStatus);

              return (
                <TableRow key={escalation.id}>
                  <TableCell className='font-medium'>{escalation.id}</TableCell>
                  <TableCell>{escalation.title}</TableCell>
                  <TableCell>
                    <Badge variant={priorityBadge.variant}>
                      {priorityBadge.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.text}
                    </Badge>
                  </TableCell>
                  <TableCell>{escalation.category}</TableCell>
                  <TableCell>{escalation.assignedTo}</TableCell>
                  <TableCell>
                    {escalation.deadline ? new Date(escalation.deadline).toLocaleString() : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {escalationData && escalationData.activeEscalations.length === 0 && (
          <div className='text-center p-8 text-muted-foreground'>
            No active escalations. All issues are under control.
          </div>
        )}
      </div>
    </div>
  );
}
