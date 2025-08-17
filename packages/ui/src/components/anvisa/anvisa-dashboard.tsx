import {
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  TrendingUpIcon,
  UserCheckIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Alert, AlertDescription } from '../Alert';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Card';
import { Progress } from '../Progress';

export interface AnvisaDashboardProps {
  stats: {
    activeRegistrations: number;
    pendingApprovals: number;
    complianceScore: number;
    recentAlerts: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'registration' | 'approval' | 'alert';
    title: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

export function AnvisaDashboard({
  stats,
  recentActivity,
  className,
}: AnvisaDashboardProps & { className?: string }) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h1 className="font-bold text-3xl">ANVISA Compliance Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor compliance status with ANVISA regulations for medical devices and software.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Registrations</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.activeRegistrations}</div>
            <p className="text-muted-foreground text-xs">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Pending Approvals</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.pendingApprovals}</div>
            <p className="text-muted-foreground text-xs">-5 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Compliance Score</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.complianceScore}%</div>
            <Progress className="mt-2" value={stats.complianceScore} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Recent Alerts</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.recentAlerts}</div>
            <p className="text-muted-foreground text-xs">2 high priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest ANVISA compliance activities and updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div className="flex items-center space-x-4" key={activity.id}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    {activity.type === 'registration' && <FileTextIcon className="h-4 w-4" />}
                    {activity.type === 'approval' && <CheckIcon className="h-4 w-4" />}
                    {activity.type === 'alert' && <AlertTriangleIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm leading-none">{activity.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.status === 'approved'
                        ? 'default'
                        : activity.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common ANVISA compliance tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start">
              <FileTextIcon className="mr-2 h-4 w-4" />
              New Registration
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <UserCheckIcon className="mr-2 h-4 w-4" />
              Professional Verification
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUpIcon className="mr-2 h-4 w-4" />
              Compliance Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {stats.recentAlerts > 0 && (
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            You have {stats.recentAlerts} compliance alerts that require attention.{' '}
            <Button className="h-auto p-0" variant="link">
              View details
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
