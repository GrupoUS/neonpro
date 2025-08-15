'use client';

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  HardDrive,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BackupSystem } from '@/lib/backup';
import { formatBytes, formatDate, formatDuration } from '@/lib/utils';

// Types
interface BackupConfig {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'DATABASE' | 'FILES';
  schedule_frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  last_backup?: Date;
  next_backup?: Date;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  storage_provider: 'LOCAL' | 'S3' | 'GCS' | 'AZURE';
  retention_daily: number;
}

interface BackupRecord {
  id: string;
  config_id: string;
  config_name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'DATABASE' | 'FILES';
  start_time: Date;
  end_time?: Date;
  duration?: number;
  size?: number;
  compressed_size?: number;
  file_count?: number;
  progress?: number;
  error_message?: string;
}

interface SystemMetrics {
  total_backups_today: number;
  successful_backups_today: number;
  failed_backups_today: number;
  success_rate: number;
  total_storage_used: number;
  active_configs: number;
  pending_recoveries: number;
  system_health: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
}

interface Alert {
  id: string;
  type: 'BACKUP_FAILURE' | 'BACKUP_SUCCESS' | 'STORAGE_FULL' | 'SYSTEM_ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

const BackupDashboard: React.FC = () => {
  // State
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [backupSystem] = useState(() => new BackupSystem());

  // Load data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30_000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [configsData, recordsData, metricsData, alertsData] =
        await Promise.all([
          loadBackupConfigs(),
          loadBackupRecords(),
          loadSystemMetrics(),
          loadAlerts(),
        ]);

      setConfigs(configsData);
      setRecords(recordsData);
      setMetrics(metricsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBackupConfigs = async (): Promise<BackupConfig[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        name: 'Database Backup',
        description: 'Daily backup of main database',
        enabled: true,
        type: 'DATABASE',
        schedule_frequency: 'DAILY',
        last_backup: new Date(Date.now() - 24 * 60 * 60 * 1000),
        next_backup: new Date(Date.now() + 60 * 60 * 1000),
        status: 'ACTIVE',
        storage_provider: 'S3',
        retention_daily: 7,
      },
      {
        id: '2',
        name: 'Files Backup',
        description: 'Weekly backup of application files',
        enabled: true,
        type: 'FILES',
        schedule_frequency: 'WEEKLY',
        last_backup: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        next_backup: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        storage_provider: 'LOCAL',
        retention_daily: 30,
      },
    ];
  };

  const loadBackupRecords = async (): Promise<BackupRecord[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        config_id: '1',
        config_name: 'Database Backup',
        status: 'COMPLETED',
        type: 'DATABASE',
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        end_time: new Date(Date.now() - 90 * 60 * 1000),
        duration: 30 * 60, // 30 minutes
        size: 1024 * 1024 * 500, // 500MB
        compressed_size: 1024 * 1024 * 150, // 150MB
        file_count: 1,
      },
      {
        id: '2',
        config_id: '1',
        config_name: 'Database Backup',
        status: 'RUNNING',
        type: 'DATABASE',
        start_time: new Date(Date.now() - 15 * 60 * 1000),
        progress: 65,
      },
    ];
  };

  const loadSystemMetrics = async (): Promise<SystemMetrics> => {
    // Mock data - replace with actual API call
    return {
      total_backups_today: 12,
      successful_backups_today: 11,
      failed_backups_today: 1,
      success_rate: 91.7,
      total_storage_used: 1024 * 1024 * 1024 * 50, // 50GB
      active_configs: 5,
      pending_recoveries: 0,
      system_health: 'HEALTHY',
    };
  };

  const loadAlerts = async (): Promise<Alert[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        type: 'BACKUP_FAILURE',
        severity: 'HIGH',
        message:
          'Backup "Files Backup" failed due to insufficient storage space',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false,
      },
    ];
  };

  // Actions
  const runBackup = async (configId: string) => {
    try {
      await backupSystem.runManualBackup(configId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error running backup:', error);
    }
  };

  const toggleConfig = async (configId: string, enabled: boolean) => {
    try {
      // Update config enabled status
      setConfigs((prev) =>
        prev.map((config) =>
          config.id === configId ? { ...config, enabled } : config
        )
      );
      await loadDashboardData();
    } catch (error) {
      console.error('Error toggling config:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'RUNNING':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      COMPLETED: 'default',
      RUNNING: 'secondary',
      FAILED: 'destructive',
      PENDING: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'HEALTHY':
        return 'text-green-500';
      case 'DEGRADED':
        return 'text-yellow-500';
      case 'UNHEALTHY':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading backup dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Backup & Recovery
          </h1>
          <p className="text-muted-foreground">
            Manage your backup configurations and monitor system health
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowRecoveryDialog(true)} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Recovery
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Backup
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.filter((alert) => !alert.acknowledged).length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((alert) => !alert.acknowledged)
            .map((alert) => (
              <Alert
                className={
                  alert.severity === 'CRITICAL' ? 'border-red-500' : ''
                }
                key={alert.id}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Backup Alert - {alert.severity}</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Button
                    onClick={() => acknowledgeAlert(alert.id)}
                    size="sm"
                    variant="outline"
                  >
                    Acknowledge
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                System Health
              </CardTitle>
              <Shield
                className={`h-4 w-4 ${getHealthColor(metrics.system_health)}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`font-bold text-2xl ${getHealthColor(metrics.system_health)}`}
              >
                {metrics.system_health}
              </div>
              <p className="text-muted-foreground text-xs">
                {metrics.active_configs} active configurations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {metrics.success_rate.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-xs">
                {metrics.successful_backups_today}/{metrics.total_backups_today}{' '}
                successful today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Storage Used
              </CardTitle>
              <HardDrive className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {formatBytes(metrics.total_storage_used)}
              </div>
              <p className="text-muted-foreground text-xs">
                Across all backup destinations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Pending Recoveries
              </CardTitle>
              <Download className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {metrics.pending_recoveries}
              </div>
              <p className="text-muted-foreground text-xs">
                Recovery requests in queue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs
        className="space-y-4"
        onValueChange={setSelectedTab}
        value={selectedTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="overview">
          {/* Recent Backups */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Backups</CardTitle>
              <CardDescription>
                Latest backup executions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Configuration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 5).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.config_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                        {record.status === 'RUNNING' && record.progress && (
                          <Progress
                            className="mt-1 w-20"
                            value={record.progress}
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatDate(record.start_time)}</TableCell>
                      <TableCell>
                        {record.duration
                          ? formatDuration(record.duration)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.size ? formatBytes(record.size) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="configurations">
          {/* Backup Configurations */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Configurations</CardTitle>
              <CardDescription>
                Manage your backup schedules and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Backup</TableHead>
                    <TableHead>Next Backup</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{config.name}</div>
                          {config.description && (
                            <div className="text-muted-foreground text-sm">
                              {config.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.type}</Badge>
                      </TableCell>
                      <TableCell>{config.schedule_frequency}</TableCell>
                      <TableCell>
                        {config.last_backup
                          ? formatDate(config.last_backup)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {config.next_backup
                          ? formatDate(config.next_backup)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(enabled) =>
                              toggleConfig(config.id, enabled)
                            }
                          />
                          <Badge
                            variant={
                              config.status === 'ACTIVE'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {config.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => runBackup(config.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="h-8 w-8 p-0" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Edit Configuration
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="history">
          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>
                Complete history of all backup executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Configuration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Compression</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.config_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(record.start_time)}</TableCell>
                      <TableCell>
                        {record.end_time ? formatDate(record.end_time) : '-'}
                      </TableCell>
                      <TableCell>
                        {record.duration
                          ? formatDuration(record.duration)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.size ? formatBytes(record.size) : '-'}
                      </TableCell>
                      <TableCell>
                        {record.size && record.compressed_size
                          ? `${((1 - record.compressed_size / record.size) * 100).toFixed(1)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Upload className="mr-2 h-4 w-4" />
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="monitoring">
          {/* System Monitoring */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>
                  Monitor backup storage consumption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Local Storage</span>
                    <span className="text-muted-foreground text-sm">
                      15.2 GB
                    </span>
                  </div>
                  <Progress value={45} />

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">AWS S3</span>
                    <span className="text-muted-foreground text-sm">
                      32.8 GB
                    </span>
                  </div>
                  <Progress value={78} />

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Google Cloud</span>
                    <span className="text-muted-foreground text-sm">
                      8.1 GB
                    </span>
                  </div>
                  <Progress value={23} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  System performance and health indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Average Backup Time
                    </span>
                    <span className="text-muted-foreground text-sm">
                      12m 34s
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Compression Ratio
                    </span>
                    <span className="text-muted-foreground text-sm">68.5%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Network Throughput
                    </span>
                    <span className="text-muted-foreground text-sm">
                      45.2 MB/s
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">CPU Usage</span>
                    <span className="text-muted-foreground text-sm">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Backup Dialog */}
      <Dialog onOpenChange={setShowCreateDialog} open={showCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Backup Configuration</DialogTitle>
            <DialogDescription>
              Set up a new backup schedule for your data
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="name">
                Name
              </Label>
              <Input className="col-span-3" id="name" placeholder="My Backup" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="description">
                Description
              </Label>
              <Textarea
                className="col-span-3"
                id="description"
                placeholder="Backup description..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="type">
                Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select backup type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Full Backup</SelectItem>
                  <SelectItem value="INCREMENTAL">Incremental</SelectItem>
                  <SelectItem value="DATABASE">Database Only</SelectItem>
                  <SelectItem value="FILES">Files Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="frequency">
                Frequency
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Backup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recovery Dialog */}
      <Dialog onOpenChange={setShowRecoveryDialog} open={showRecoveryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Data Recovery</DialogTitle>
            <DialogDescription>
              Restore data from a previous backup
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="backup">
                Backup
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select backup to restore" />
                </SelectTrigger>
                <SelectContent>
                  {records
                    .filter((record) => record.status === 'COMPLETED')
                    .map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record.config_name} - {formatDate(record.start_time)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="target">
                Target Path
              </Label>
              <Input
                className="col-span-3"
                id="target"
                placeholder="/path/to/restore"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="overwrite">
                Overwrite
              </Label>
              <div className="col-span-3">
                <Switch id="overwrite" />
                <Label
                  className="ml-2 text-muted-foreground text-sm"
                  htmlFor="overwrite"
                >
                  Overwrite existing files
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Start Recovery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupDashboard;
