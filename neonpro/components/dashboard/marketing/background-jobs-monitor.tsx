'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Eye,
  Filter,
  Calendar,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Background Jobs Monitor Component - Research-Backed Implementation
 * 
 * Features:
 * - Real-time job status monitoring
 * - Job queue visualization
 * - Failed job retry management
 * - Performance metrics and analytics
 * - Job scheduling and configuration
 * 
 * Based on modern job queue monitoring patterns and admin dashboard UX
 */

interface BackgroundJob {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  data: any;
  result?: any;
  error?: string;
  attempts: number;
  max_attempts: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  run_time_ms?: number;
  platform?: string;
  profile_id?: string;
}

interface JobStats {
  total_jobs: number;
  pending_jobs: number;
  running_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  avg_run_time_ms: number;
  success_rate: number;
}

interface JobQueueHealth {
  queue_size: number;
  oldest_pending_job?: string;
  processing_rate: number;
  error_rate: number;
  status: 'healthy' | 'warning' | 'critical';
}

const JOB_TYPE_CONFIGS = {
  'social_media_sync': {
    name: 'Social Media Sync',
    description: 'Synchronize posts and engagement data',
    icon: Activity,
    color: 'bg-blue-500',
  },
  'marketing_automation': {
    name: 'Marketing Automation',
    description: 'Execute automated marketing campaigns',
    icon: RefreshCw,
    color: 'bg-purple-500',
  },
  'data_export': {
    name: 'Data Export',
    description: 'Generate and export reports',
    icon: Eye,
    color: 'bg-green-500',
  },
  'webhook_processing': {
    name: 'Webhook Processing',
    description: 'Process incoming webhook events',
    icon: Timer,
    color: 'bg-orange-500',
  },
  'cleanup': {
    name: 'System Cleanup',
    description: 'Clean up temporary data and logs',
    icon: Trash2,
    color: 'bg-gray-500',
  },
};

export function BackgroundJobsMonitor() {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [queueHealth, setQueueHealth] = useState<JobQueueHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<BackgroundJob | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    loadJobs();
    loadStats();
    loadQueueHealth();
    
    let interval: NodeJS.Timeout | null = null;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        loadJobs();
        loadStats();
        loadQueueHealth();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedStatus, selectedType, isAutoRefresh]);

  const loadJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedType !== 'all') params.append('type', selectedType);
      params.append('limit', '50');
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/jobs?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadQueueHealth = async () => {
    try {
      const response = await fetch('/api/jobs?health=true');
      if (response.ok) {
        const data = await response.json();
        setQueueHealth(data.health);
      }
    } catch (error) {
      console.error('Failed to load queue health:', error);
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Job queued for retry');
        loadJobs();
        loadStats();
      } else {
        throw new Error('Failed to retry job');
      }
    } catch (error) {
      console.error('Retry job failed:', error);
      toast.error('Failed to retry job');
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Job cancelled');
        loadJobs();
        loadStats();
      } else {
        throw new Error('Failed to cancel job');
      }
    } catch (error) {
      console.error('Cancel job failed:', error);
      toast.error('Failed to cancel job');
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Job deleted');
        loadJobs();
        loadStats();
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Delete job failed:', error);
      toast.error('Failed to delete job');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 text-xs">High</Badge>;
      case 'normal':
        return <Badge variant="secondary" className="text-xs">Normal</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  const getQueueHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms / 60000)}m`;
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    
    if (diffMs < 60000) return 'Just now';
    if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.round(diffMs / 3600000)}h ago`;
    return `${Math.round(diffMs / 86400000)}d ago`;
  };

  const getJobTypeConfig = (type: string) => {
    return JOB_TYPE_CONFIGS[type as keyof typeof JOB_TYPE_CONFIGS] || {
      name: type,
      description: 'Unknown job type',
      icon: Activity,
      color: 'bg-gray-500',
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.total_jobs}</p>
                </div>
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending_jobs}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.running_jobs}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed_jobs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed_jobs}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{Math.round(stats.success_rate)}%</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <Progress value={stats.success_rate} className="w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Queue Health Status */}
      {queueHealth && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Queue Health</CardTitle>
              {getQueueHealthBadge(queueHealth.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{queueHealth.queue_size}</p>
                <p className="text-sm text-gray-600">Queue Size</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{queueHealth.processing_rate.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Jobs/min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{(queueHealth.error_rate * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Error Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">
                  {queueHealth.oldest_pending_job ? formatRelativeTime(queueHealth.oldest_pending_job) : 'None'}
                </p>
                <p className="text-sm text-gray-600">Oldest Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Background Jobs</CardTitle>
              <CardDescription>Monitor and manage background job execution</CardDescription>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={isAutoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                >
                  {isAutoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  Auto Refresh
                </Button>
                
                <Button variant="outline" size="sm" onClick={loadJobs}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(JOB_TYPE_CONFIGS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const config = getJobTypeConfig(job.type);
                const Icon = config.icon;
                
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded ${config.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{config.name}</p>
                          {job.platform && (
                            <p className="text-xs text-gray-500">Platform: {job.platform}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                    <TableCell className="text-sm">{formatRelativeTime(job.created_at)}</TableCell>
                    
                    <TableCell className="text-sm">
                      {job.run_time_ms ? formatDuration(job.run_time_ms) : '-'}
                    </TableCell>
                    
                    <TableCell className="text-sm">
                      {job.attempts}/{job.max_attempts}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Job Details</DialogTitle>
                              <DialogDescription>
                                Detailed information for job {job.id}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedJob && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <p className="text-sm">{getJobTypeConfig(selectedJob.type).name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <div className="mt-1">{getPriorityBadge(selectedJob.priority)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Attempts</label>
                                    <p className="text-sm">{selectedJob.attempts}/{selectedJob.max_attempts}</p>
                                  </div>
                                </div>
                                
                                {selectedJob.error && (
                                  <div>
                                    <label className="text-sm font-medium text-red-600">Error</label>
                                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded text-sm">
                                      {selectedJob.error}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-sm font-medium">Job Data</label>
                                  <pre className="mt-1 p-3 bg-gray-50 border rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(selectedJob.data, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {job.status === 'failed' && job.attempts < job.max_attempts && (
                          <Button variant="ghost" size="sm" onClick={() => retryJob(job.id)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {(job.status === 'pending' || job.status === 'running') && (
                          <Button variant="ghost" size="sm" onClick={() => cancelJob(job.id)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                          <Button variant="ghost" size="sm" onClick={() => deleteJob(job.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {jobs.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No jobs found</p>
              <p className="text-sm text-gray-500">Jobs will appear here as they are created</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}