'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileText,
  HardDrive,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Upload,
  Users,
  XCircle,
} from 'lucide-react';
import BackupDashboard from '@/components/backup/backup-dashboard';
import BackupConfigForm from '@/components/backup/backup-config-form';
import BackupHistory from '@/components/backup/backup-history';
import RecoveryWizard from '@/components/backup/recovery-wizard';
import BackupScheduler from '@/components/backup/backup-scheduler';
import StorageMonitor from '@/components/backup/storage-monitor';
import ComplianceReports from '@/components/backup/compliance-reports';
import { useBackupSystem } from '@/hooks/use-backup-system';
import type { BackupConfig } from '@/lib/backup/types';

const BackupPage: React.FC = () => {
  const {
    // State
    isInitialized,
    isLoading,
    error,
    configs,
    activeConfigs,
    backups,
    recentBackups,
    recoveries,
    activeRecoveries,
    metrics,
    alerts,
    systemHealth,
    
    // Actions
    refreshData,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    runManualBackup,
    runQuickBackup,
    cancelBackup,
    createRecovery,
    cancelRecovery,
    acknowledgeAlert,
    dismissAlert,
    testStorageConnection,
    validateBackup,
  } = useBackupSystem();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BackupConfig | null>(null);
  const [showQuickBackup, setShowQuickBackup] = useState(false);

  // Handle config form submission
  const handleConfigSubmit = async (data: any) => {
    try {
      if (editingConfig) {
        await updateConfig(editingConfig.id, data);
      } else {
        await createConfig(data);
      }
      setShowConfigForm(false);
      setEditingConfig(null);
      await refreshData();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  // Handle config form cancel
  const handleConfigCancel = () => {
    setShowConfigForm(false);
    setEditingConfig(null);
  };

  // Handle edit config
  const handleEditConfig = (config: BackupConfig) => {
    setEditingConfig(config);
    setShowConfigForm(true);
  };

  // Handle delete config
  const handleDeleteConfig = async (configId: string) => {
    if (confirm('Are you sure you want to delete this backup configuration?')) {
      try {
        await deleteConfig(configId);
        await refreshData();
      } catch (error) {
        console.error('Error deleting config:', error);
      }
    }
  };

  // Handle run manual backup
  const handleRunBackup = async (configId: string) => {
    try {
      await runManualBackup(configId);
      await refreshData();
    } catch (error) {
      console.error('Error running backup:', error);
    }
  };

  // Handle quick backup
  const handleQuickBackup = async (type: 'FULL' | 'INCREMENTAL', source: string) => {
    try {
      await runQuickBackup(type, source);
      setShowQuickBackup(false);
      await refreshData();
    } catch (error) {
      console.error('Error running quick backup:', error);
    }
  };

  // Get system health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default';
      case 'RUNNING': return 'secondary';
      case 'FAILED': return 'destructive';
      case 'CANCELLED': return 'outline';
      default: return 'secondary';
    }
  };

  if (!isInitialized && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Initializing backup system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error initializing backup system: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Recovery</h1>
          <p className="text-muted-foreground">
            Manage your backup configurations and monitor system health
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showQuickBackup} onOpenChange={setShowQuickBackup}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Quick Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Backup</DialogTitle>
                <DialogDescription>
                  Create a one-time backup without saving a configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button
                  onClick={() => handleQuickBackup('FULL', '/app/data')}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Full Database Backup
                </Button>
                <Button
                  onClick={() => handleQuickBackup('INCREMENTAL', '/app/uploads')}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Files Backup
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setShowConfigForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Configuration
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className={`h-4 w-4 ${getHealthColor(systemHealth.overall)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealth.overall}</div>
            <p className="text-xs text-muted-foreground">
              Last check: {systemHealth.lastCheck?.toLocaleTimeString() || 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Configs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConfigs.length}</div>
            <p className="text-xs text-muted-foreground">
              {configs.length} total configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Backups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentBackups.length}</div>
            <p className="text-xs text-muted-foreground">
              {recentBackups.filter(b => b.status === 'COMPLETED').length} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? `${(metrics.storage_usage_bytes / (1024 ** 3)).toFixed(1)} GB` : '0 GB'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics ? `${(metrics.compressed_size_bytes / metrics.total_size_bytes * 100).toFixed(1)}% compression` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'HIGH' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>{alert.title}</strong>
                  <p className="text-sm">{alert.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="history">Backup History</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
          <TabsTrigger value="storage">Storage Monitor</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <BackupDashboard />
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configurations" className="space-y-4">
          <div className="grid gap-4">
            {configs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{config.name}</span>
                        <Badge variant={config.enabled ? 'default' : 'secondary'}>
                          {config.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                        <Badge variant="outline">{config.type}</Badge>
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRunBackup(config.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditConfig(config)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleConfig(config.id, !config.enabled)}>
                          {config.enabled ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enable
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Schedule</p>
                      <p className="font-medium">{config.schedule_frequency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Storage</p>
                      <p className="font-medium">{config.storage_provider}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Source</p>
                      <p className="font-medium">{config.source_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{config.updated_at.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler">
          <BackupScheduler />
        </TabsContent>

        {/* Backup History Tab */}
        <TabsContent value="history">
          <BackupHistory />
        </TabsContent>

        {/* Recovery Tab */}
        <TabsContent value="recovery">
          <RecoveryWizard />
        </TabsContent>

        {/* Storage Monitor Tab */}
        <TabsContent value="storage">
          <StorageMonitor />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <ComplianceReports />
        </TabsContent>
      </Tabs>

      {/* Config Form Dialog */}
      <Dialog open={showConfigForm} onOpenChange={setShowConfigForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <BackupConfigForm
            initialData={editingConfig || undefined}
            onSubmit={handleConfigSubmit}
            onCancel={handleConfigCancel}
            isEditing={!!editingConfig}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupPage;
