'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Bell,
  BellOff,
  Filter,
  Search,
  MoreVertical,
  RefreshCw,
  Settings,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

// Types
import { DashboardAlert, AlertSeverity, AlertStatus, AlertCategory } from '@/lib/dashboard/types';

interface AlertPanelProps {
  clinicId: string;
  userId: string;
  className?: string;
  maxHeight?: number;
  showFilters?: boolean;
  autoRefresh?: boolean;
  onAlertClick?: (alert: DashboardAlert) => void;
}

interface AlertFilters {
  severity: AlertSeverity[];
  status: AlertStatus[];
  category: AlertCategory[];
  dateRange: 'today' | 'week' | 'month' | 'all';
  search: string;
  assignedToMe: boolean;
}

interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  unread: number;
  resolved: number;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeVariant: 'destructive' as const,
    label: 'Critical',
    priority: 1
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeVariant: 'secondary' as const,
    label: 'Warning',
    priority: 2
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeVariant: 'outline' as const,
    label: 'Info',
    priority: 3
  }
};

const STATUS_CONFIG = {
  active: {
    icon: AlertCircle,
    color: 'text-orange-600',
    label: 'Active'
  },
  acknowledged: {
    icon: Eye,
    color: 'text-blue-600',
    label: 'Acknowledged'
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-600',
    label: 'Resolved'
  },
  dismissed: {
    icon: EyeOff,
    color: 'text-gray-600',
    label: 'Dismissed'
  }
};

const CATEGORY_CONFIG = {
  performance: {
    icon: TrendingUp,
    label: 'Performance',
    color: 'text-blue-600'
  },
  financial: {
    icon: Activity,
    label: 'Financial',
    color: 'text-green-600'
  },
  operational: {
    icon: Settings,
    label: 'Operational',
    color: 'text-purple-600'
  },
  system: {
    icon: AlertTriangle,
    label: 'System',
    color: 'text-red-600'
  },
  compliance: {
    icon: CheckCircle,
    label: 'Compliance',
    color: 'text-indigo-600'
  }
};

export function AlertPanel({ 
  clinicId, 
  userId, 
  className = '',
  maxHeight = 600,
  showFilters = true,
  autoRefresh = true,
  onAlertClick 
}: AlertPanelProps) {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical'>('all');
  
  const [filters, setFilters] = useState<AlertFilters>({
    severity: [],
    status: [],
    category: [],
    dateRange: 'week',
    search: '',
    assignedToMe: false
  });

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock alerts
        const mockAlerts = generateMockAlerts(clinicId, userId);
        setAlerts(mockAlerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(fetchAlerts, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [clinicId, userId, autoRefresh]);

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Apply tab filter
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(alert => !alert.isRead);
        break;
      case 'critical':
        filtered = filtered.filter(alert => alert.severity === 'critical');
        break;
    }

    // Apply filters
    if (filters.severity.length > 0) {
      filtered = filtered.filter(alert => filters.severity.includes(alert.severity));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(alert => filters.status.includes(alert.status));
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(alert => filters.category.includes(alert.category));
    }

    if (filters.assignedToMe) {
      filtered = filtered.filter(alert => alert.assignedTo === userId);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(searchLower) ||
        alert.message.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    const now = new Date();
    const dateThreshold = new Date();
    switch (filters.dateRange) {
      case 'today':
        dateThreshold.setHours(0, 0, 0, 0);
        break;
      case 'week':
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case 'month':
        dateThreshold.setMonth(now.getMonth() - 1);
        break;
      default:
        dateThreshold.setFullYear(2000); // Show all
    }
    
    if (filters.dateRange !== 'all') {
      filtered = filtered.filter(alert => new Date(alert.createdAt) >= dateThreshold);
    }

    // Sort by priority and date
    return filtered.sort((a, b) => {
      const aPriority = SEVERITY_CONFIG[a.severity].priority;
      const bPriority = SEVERITY_CONFIG[b.severity].priority;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Lower number = higher priority
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [alerts, activeTab, filters, userId]);

  // Calculate stats
  const stats: AlertStats = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      unread: alerts.filter(a => !a.isRead).length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };
  }, [alerts]);

  // Handle alert actions
  const handleAlertClick = (alert: DashboardAlert) => {
    // Mark as read
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, isRead: true } : a
    ));
    
    onAlertClick?.(alert);
  };

  const handleBulkAction = async (action: 'acknowledge' | 'resolve' | 'dismiss' | 'delete') => {
    const alertIds = Array.from(selectedAlerts);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAlerts(prev => prev.map(alert => {
        if (alertIds.includes(alert.id)) {
          switch (action) {
            case 'acknowledge':
              return { ...alert, status: 'acknowledged' as AlertStatus, isRead: true };
            case 'resolve':
              return { ...alert, status: 'resolved' as AlertStatus, isRead: true };
            case 'dismiss':
              return { ...alert, status: 'dismissed' as AlertStatus, isRead: true };
            case 'delete':
              return null; // Will be filtered out
            default:
              return alert;
          }
        }
        return alert;
      }).filter(Boolean) as DashboardAlert[]);
      
      setSelectedAlerts(new Set());
    } catch (err) {
      console.error('Failed to perform bulk action:', err);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Render alert item
  const renderAlertItem = (alert: DashboardAlert) => {
    const severityConfig = SEVERITY_CONFIG[alert.severity];
    const statusConfig = STATUS_CONFIG[alert.status];
    const categoryConfig = CATEGORY_CONFIG[alert.category];
    const SeverityIcon = severityConfig.icon;
    const StatusIcon = statusConfig.icon;
    const CategoryIcon = categoryConfig.icon;
    
    const isSelected = selectedAlerts.has(alert.id);
    const timeAgo = getTimeAgo(alert.createdAt);

    return (
      <div
        key={alert.id}
        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
          !alert.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
        } ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => handleAlertClick(alert)}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              const newSelected = new Set(selectedAlerts);
              if (checked) {
                newSelected.add(alert.id);
              } else {
                newSelected.delete(alert.id);
              }
              setSelectedAlerts(newSelected);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className={`p-1 rounded ${severityConfig.bgColor}`}>
            <SeverityIcon className={`h-4 w-4 ${severityConfig.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium text-sm truncate ${
                !alert.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {alert.title}
              </h4>
              
              <Badge variant={severityConfig.badgeVariant} className="text-xs">
                {severityConfig.label}
              </Badge>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CategoryIcon className="h-3 w-3" />
                <span>{categoryConfig.label}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {alert.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                <span>{statusConfig.label}</span>
                
                <span>•</span>
                
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
                
                {alert.assignedTo && (
                  <>
                    <span>•</span>
                    <User className="h-3 w-3" />
                    <span>Assigned</span>
                  </>
                )}
              </div>
              
              {!alert.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-red-200 bg-red-50`}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Error loading alerts</div>
            <div className="text-sm">{error}</div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts
            {stats.unread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.unread}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: {stats.total}</span>
          <span className="text-red-600">Critical: {stats.critical}</span>
          <span className="text-yellow-600">Warning: {stats.warning}</span>
          <span className="text-green-600">Resolved: {stats.resolved}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({stats.unread})
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              Critical ({stats.critical})
            </TabsTrigger>
          </TabsList>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-7 h-7 text-xs"
                  />
                </div>
                
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
                >
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="assigned-to-me"
                  checked={filters.assignedToMe}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, assignedToMe: !!checked }))
                  }
                />
                <label htmlFor="assigned-to-me" className="text-xs text-muted-foreground">
                  Assigned to me
                </label>
              </div>
            </div>
          )}
          
          {/* Bulk Actions */}
          {selectedAlerts.size > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedAlerts.size} alert(s) selected
                </span>
                
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleBulkAction('acknowledge')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Acknowledge
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleBulkAction('resolve')}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <TabsContent value={activeTab} className="mt-3">
            <ScrollArea className="h-full" style={{ maxHeight: maxHeight - 200 }}>
              <div className="space-y-2">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div>No alerts found</div>
                    <div className="text-sm">All clear! 🎉</div>
                  </div>
                ) : (
                  filteredAlerts.map(renderAlertItem)
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper functions
function generateMockAlerts(clinicId: string, userId: string): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const now = new Date();
  
  const mockData = [
    {
      title: 'High Patient Wait Time',
      message: 'Average wait time has exceeded 45 minutes in the last hour',
      severity: 'critical' as AlertSeverity,
      category: 'operational' as AlertCategory,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      title: 'Revenue Target Alert',
      message: 'Monthly revenue is 15% below target with 5 days remaining',
      severity: 'warning' as AlertSeverity,
      category: 'financial' as AlertCategory,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      title: 'System Backup Completed',
      message: 'Daily system backup completed successfully',
      severity: 'info' as AlertSeverity,
      category: 'system' as AlertCategory,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      title: 'Patient Satisfaction Score',
      message: 'Patient satisfaction has improved to 4.8/5.0 this week',
      severity: 'info' as AlertSeverity,
      category: 'performance' as AlertCategory,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      title: 'Compliance Audit Due',
      message: 'Annual compliance audit is due in 7 days',
      severity: 'warning' as AlertSeverity,
      category: 'compliance' as AlertCategory,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
    }
  ];
  
  mockData.forEach((data, index) => {
    alerts.push({
      id: `alert-${index + 1}`,
      clinicId,
      title: data.title,
      message: data.message,
      severity: data.severity,
      category: data.category,
      status: index === 0 ? 'active' : index === 1 ? 'acknowledged' : 'resolved',
      isRead: index > 1,
      createdAt: data.createdAt,
      updatedAt: data.createdAt,
      assignedTo: index % 2 === 0 ? userId : undefined,
      metadata: {
        source: 'dashboard',
        threshold: index === 0 ? 45 : undefined,
        value: index === 0 ? 52 : undefined
      }
    });
  });
  
  return alerts;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}