import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/molecules/table';
import { Progress } from '@/components/ui/progress';
import { getGovernanceService } from '@/lib/governance-service';
import type { PolicySummary } from '@/lib/governance-service';
import { Badge } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';

type PolicyStatus = 'active' | 'draft' | 'inactive' | 'archived';

function PolicySummaryCard({
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

function getStatusBadge(status: PolicyStatus) {
  const variants = {
    active: { variant: 'default' as const, text: 'Active' },
    draft: { variant: 'secondary' as const, text: 'Draft' },
    inactive: { variant: 'outline' as const, text: 'Inactive' },
    archived: { variant: 'outline' as const, text: 'Archived' },
  };
  return variants[status];
}

export function PolicyManagementPanel() {
  // TODO: Get actual clinic ID from auth context
  const clinicId = 'default-clinic-id'; // Placeholder

  const { data: policyData, isLoading } = useQuery<PolicySummary>({
    queryKey: ['policy-management',_clinicId],
    queryFn: async () => {
      const governanceService = getGovernanceService();
      return await governanceService.getPolicyManagementData(clinicId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Policy Management</h2>
        <div className='flex items-center justify-center p-8'>
          <span className='text-muted-foreground'>Loading policy data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Policy Management</h2>
        <div className='text-sm text-muted-foreground'>
          {policyData?.summary.totalPolicies || 0} total policies
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4'>
        <PolicySummaryCard
          title='Total Policies'
          value={policyData?.summary.totalPolicies || 0}
          subtitle='All policies'
          badgeText='Overview'
          badgeVariant='outline'
        />

        <PolicySummaryCard
          title='Active Policies'
          value={policyData?.summary.activePolicies || 0}
          subtitle='Currently enforced'
          badgeText='Enforced'
          badgeVariant='default'
        />

        <PolicySummaryCard
          title='Draft Policies'
          value={policyData?.summary.draftPolicies || 0}
          subtitle='Under review'
          badgeText='Pending'
          badgeVariant='secondary'
        />

        <PolicySummaryCard
          title='Average Enforcement'
          value={`${policyData?.summary.averageEnforcement || 0}%`}
          subtitle='Policy compliance'
          progressValue={policyData?.summary.averageEnforcement}
          badgeText='Strong'
          badgeVariant='default'
        />

        <PolicySummaryCard
          title='Upcoming Reviews'
          value={policyData?.summary.upcomingReviews || 0}
          subtitle='This month'
          badgeText='Due'
          badgeVariant='secondary'
        />
      </div>

      {/* Additional Summary Card for Violations */}
      <div className='grid grid-cols-1'>
        <PolicySummaryCard
          title='Total Violations'
          value={policyData?.summary.totalViolations || 0}
          subtitle='Policy violations detected'
          badgeText={policyData && policyData.summary.totalViolations > 0
            ? 'Action Required'
            : 'Clean'}
          badgeVariant={policyData && policyData.summary.totalViolations > 0
            ? 'destructive'
            : 'default'}
        />
      </div>

      {/* Policy Table */}
      <div className='space-y-3'>
        <h3 className='text-md font-semibold'>Policy Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Enforcement Rate</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Next Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policyData?.policies.map((_policy: any) => {
              const statusBadge = getStatusBadge(policy.status);

              return (
                <TableRow key={policy.id}>
                  <TableCell className='font-medium'>{policy.id}</TableCell>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.category}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{policy.compliance}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {policy.enforcementRate ?? 0}%
                      </span>
                      {(policy.enforcementRate ?? 0) > 0 && (
                        <div className='w-16'>
                          <Progress
                            value={policy.enforcementRate}
                            className='h-1'
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{policy.owner}</TableCell>
                  <TableCell>
                    {policy.nextReview
                      ? new Date(policy.nextReview).toLocaleDateString()
                      : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {policyData && policyData.policies.length === 0 && (
          <div className='text-center p-8 text-muted-foreground'>
            No policies found. Create your first policy to get started.
          </div>
        )}
      </div>
    </div>
  );
}
