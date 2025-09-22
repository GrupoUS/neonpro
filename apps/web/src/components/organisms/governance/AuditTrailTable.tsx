import { Input } from '@/components/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/molecules/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getGovernanceService } from '@/lib/governance-service';
import type { AuditTrail } from '@/lib/governance-service';
import { Badge } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  _userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceType: ResourceType;
  ipAddress: string;
  userAgent: string;
  status: AuditStatus;
  riskLevel: RiskLevel;
  additionalInfo: string;
}

export type AuditAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'login'
  | 'logout';
export type ResourceType =
  | 'patient_record'
  | 'report'
  | 'system_config'
  | 'user_account';
export type AuditStatus = 'success' | 'failed' | 'blocked';
export type RiskLevel = 'low' | 'medium' | 'high';

// Helper functions for badge variants
function getActionBadge(action: AuditAction) {
  const variants = {
    view: { variant: 'secondary' as const, text: 'View' },
    create: { variant: 'default' as const, text: 'Create' },
    update: { variant: 'default' as const, text: 'Update' },
    delete: { variant: 'destructive' as const, text: 'Delete' },
    export: { variant: 'secondary' as const, text: 'Export' },
    login: { variant: 'outline' as const, text: 'Login' },
    logout: { variant: 'outline' as const, text: 'Logout' },
  };
  return variants[action];
}

function getStatusBadge(status: AuditStatus) {
  const variants = {
    success: { variant: 'default' as const, text: 'Success' },
    failed: { variant: 'destructive' as const, text: 'Failed' },
    blocked: { variant: 'destructive' as const, text: 'Blocked' },
  };
  return variants[status];
}

function getRiskLevelBadge(riskLevel: RiskLevel) {
  const variants = {
    low: { variant: 'secondary' as const, text: 'Low' },
    medium: { variant: 'default' as const, text: 'Medium' },
    high: { variant: 'destructive' as const, text: 'High' },
  };
  return variants[riskLevel];
}

function getResourceTypeLabel(resourceType: ResourceType) {
  const labels = {
    patient_record: 'Patient Record',
    report: 'Report',
    system_config: 'System Config',
    user_account: 'User Account',
  };
  return labels[resourceType];
}
export function AuditTrailTable() {
  // TODO: Get actual clinic ID from auth context
  const clinicId = 'default-clinic-id'; // Placeholder

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');

  const { data: auditData, isLoading } = useQuery<AuditTrail>({
    queryKey: [
      'audit-trail',
      clinicId,
      {
        searchTerm,
        actionFilter,
        statusFilter,
        riskLevelFilter,
      },
    ],
    queryFn: async () => {
      const governanceService = getGovernanceService();
      const filters = {
        search: searchTerm || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        riskLevel: riskLevelFilter !== 'all' ? riskLevelFilter : undefined,
      };
      return await governanceService.getAuditTrailData(clinicId, filters);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for audit data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatTimestamp = (_timestamp: any) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(timestamp);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-4'>Loading audit logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <div className='text-sm text-muted-foreground'>
          HIPAA/LGPD compliant access monitoring with comprehensive PHI tracking
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className='mb-6 space-y-4'>
          <Input
            placeholder='Search audit logs...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='max-w-sm'
          />

          <div className='flex gap-4 flex-wrap'>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='All Actions' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Actions</SelectItem>
                <SelectItem value='view'>View</SelectItem>
                <SelectItem value='create'>Create</SelectItem>
                <SelectItem value='update'>Update</SelectItem>
                <SelectItem value='delete'>Delete</SelectItem>
                <SelectItem value='export'>Export</SelectItem>
                <SelectItem value='login'>Login</SelectItem>
                <SelectItem value='logout'>Logout</SelectItem>
              </SelectContent>
            </Select>{' '}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[130px]'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='success'>Success</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='blocked'>Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='All Risk Levels' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Risk Levels</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Audit Trail Table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditData?.entries.map((_entry: any) => {
                const actionBadge = getActionBadge(entry.action);
                const statusBadge = getStatusBadge(entry.status);
                const riskLevelBadge = getRiskLevelBadge(entry.riskLevel);

                return (
                  <TableRow key={entry.id}>
                    <TableCell className='font-mono text-xs'>
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>{entry.userName}</div>
                      <div className='text-xs text-muted-foreground'>
                        {entry.userId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionBadge.variant}>
                        {actionBadge.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className='max-w-[200px] truncate'
                        title={entry.resource}
                      >
                        {entry.resource}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {getResourceTypeLabel(entry.resourceType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={riskLevelBadge.variant}>
                        {riskLevelBadge.text}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono text-xs'>
                      {entry.ipAddress}
                    </TableCell>{' '}
                    <TableCell>
                      <div
                        className='max-w-[250px] truncate text-sm text-muted-foreground'
                        title={entry.additionalInfo}
                      >
                        {entry.additionalInfo}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {(!auditData?.entries || auditData.entries.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className='text-center py-8 text-muted-foreground'
                  >
                    No audit logs found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className='mt-4 text-sm text-muted-foreground'>
          Showing {auditData?.filteredCount || 0} of {auditData?.totalCount || 0} audit entries
        </div>
      </CardContent>
    </Card>
  );
}
