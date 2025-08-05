'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  Filter
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// Types
interface PerformanceMetric {
  id: string;
  name: string;
  category: 'financial' | 'operational' | 'clinical' | 'satisfaction' | 'efficiency';
  value: number;
  target: number;
  previousValue: number;
  unit: 'currency' | 'percentage' | 'number' | 'duration' | 'ratio';
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: Date;
  benchmark?: number;
  goal?: number;
}

interface PerformanceSummary {
  totalMetrics: number;
  excellentCount: number;
  goodCount: number;
  warningCount: number;
  criticalCount: number;
  overallScore: number;
  improvementAreas: string[];
  achievements: string[];
}

interface PerformanceMetricsProps {
  clinicId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
  showTargets?: boolean;
  showBenchmarks?: boolean;
  showTrends?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const METRIC_CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: BarChart3 },
  { value: 'financial', label: 'Financial', icon: DollarSign },
  { value: 'operational', label: 'Operational', icon: Activity },
  { value: 'clinical', label: 'Clinical', icon: Users },
  { value: 'satisfaction', label: 'Satisfaction', icon: Target },
  { value: 'efficiency', label: 'Efficiency', icon: Clock }
];

const STATUS_CONFIG = {
  excellent: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'Excellent'
  },
  good: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: CheckCircle,
    label: 'Good'
  },
  warning: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle,
    label: 'Warning'
  },
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
    label: 'Critical'
  }
};

export function PerformanceMetrics({
  clinicId,
  dateRange,
  className = '',
  showTargets = true,
  showBenchmarks = true,
  showTrends = true,
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
}: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'summary'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'target' | 'status'>('status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load performance metrics
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      try {
        // Simulate API call - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockMetrics = generateMockMetrics(clinicId, dateRange);
        const mockSummary = calculatePerformanceSummary(mockMetrics);
        
        setMetrics(mockMetrics);
        setSummary(mockSummary);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Failed to load performance metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [clinicId, dateRange]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh metrics
      const refreshMetrics = async () => {
        try {
          const mockMetrics = generateMockMetrics(clinicId, dateRange);
          const mockSummary = calculatePerformanceSummary(mockMetrics);
          setMetrics(mockMetrics);
          setSummary(mockSummary);
          setLastRefresh(new Date());
        } catch (err) {
          console.error('Failed to refresh metrics:', err);
        }
      };
      
      refreshMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, clinicId, dateRange]);

  // Filter and sort metrics
  const filteredMetrics = metrics
    .filter(metric => selectedCategory === 'all' || metric.category === selectedCategory)
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'target':
          aValue = a.target;
          bValue = b.target;
          break;
        case 'status':
          const statusOrder = { critical: 0, warning: 1, good: 2, excellent: 3 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Format value based on unit
  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes}m`;
      case 'ratio':
        return `${value.toFixed(2)}:1`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  // Calculate progress percentage
  const calculateProgress = (value: number, target: number): number => {
    return Math.min((value / target) * 100, 100);
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockMetrics = generateMockMetrics(clinicId, dateRange);
      const mockSummary = calculatePerformanceSummary(mockMetrics);
      setMetrics(mockMetrics);
      setSummary(mockSummary);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to refresh metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export metrics
  const handleExport = () => {
    const exportData = {
      summary,
      metrics: filteredMetrics,
      dateRange,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !metrics.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading performance metrics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {summary && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Last updated: {format(lastRefresh, 'HH:mm:ss')}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Overall Score: {summary.overallScore.toFixed(1)}/10</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{summary.totalMetrics} metrics tracked</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="target">Target</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
          
          <TabsContent value="summary">
            {summary && (
              <div className="space-y-6">
                {/* Overall Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Excellent</p>
                          <p className="text-2xl font-bold text-green-900">{summary.excellentCount}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Good</p>
                          <p className="text-2xl font-bold text-blue-900">{summary.goodCount}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Warning</p>
                          <p className="text-2xl font-bold text-yellow-900">{summary.warningCount}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Critical</p>
                          <p className="text-2xl font-bold text-red-900">{summary.criticalCount}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Overall Score */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Overall Performance Score</h3>
                      <div className="text-4xl font-bold mb-4">
                        {summary.overallScore.toFixed(1)}/10
                      </div>
                      <Progress value={summary.overallScore * 10} className="w-full max-w-md mx-auto" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Achievements and Improvement Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {summary.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-600 rounded-full" />
                            {achievement}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Improvement Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {summary.improvementAreas.map((area, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                            {area}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric) => {
                const statusConfig = STATUS_CONFIG[metric.status];
                const StatusIcon = statusConfig.icon;
                const progress = calculateProgress(metric.value, metric.target);
                
                return (
                  <Card key={metric.id} className={`${statusConfig.borderColor} ${statusConfig.bgColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{metric.name}</h4>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {showTrends && getTrendIcon(metric.trend)}
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            {formatValue(metric.value, metric.unit)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {statusConfig.label}
                          </Badge>
                        </div>
                        
                        {showTargets && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Target: {formatValue(metric.target, metric.unit)}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        
                        {showBenchmarks && metric.benchmark && (
                          <div className="text-xs text-muted-foreground">
                            Benchmark: {formatValue(metric.benchmark, metric.unit)}
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Updated: {format(metric.lastUpdated, 'HH:mm')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-2">
              {filteredMetrics.map((metric) => {
                const statusConfig = STATUS_CONFIG[metric.status];
                const StatusIcon = statusConfig.icon;
                const progress = calculateProgress(metric.value, metric.target);
                
                return (
                  <Card key={metric.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                          <Badge variant="secondary" className="text-xs">
                            {statusConfig.label}
                          </Badge>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{metric.name}</h4>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatValue(metric.value, metric.unit)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Target: {formatValue(metric.target, metric.unit)}
                          </div>
                        </div>
                        
                        <div className="w-24">
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-center mt-1">
                            {progress.toFixed(0)}%
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {showTrends && getTrendIcon(metric.trend)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper function to generate mock metrics
function generateMockMetrics(clinicId: string, dateRange: { from: Date; to: Date }): PerformanceMetric[] {
  return [
    {
      id: 'revenue-growth',
      name: 'Revenue Growth',
      category: 'financial',
      value: 15.2,
      target: 12.0,
      previousValue: 11.8,
      unit: 'percentage',
      trend: 'up',
      status: 'excellent',
      description: 'Monthly revenue growth rate',
      lastUpdated: new Date(),
      benchmark: 10.0,
      goal: 15.0
    },
    {
      id: 'patient-satisfaction',
      name: 'Patient Satisfaction',
      category: 'satisfaction',
      value: 4.7,
      target: 4.5,
      previousValue: 4.6,
      unit: 'number',
      trend: 'up',
      status: 'excellent',
      description: 'Average patient satisfaction score (1-5)',
      lastUpdated: new Date(),
      benchmark: 4.2
    },
    {
      id: 'appointment-utilization',
      name: 'Appointment Utilization',
      category: 'operational',
      value: 87.3,
      target: 85.0,
      previousValue: 84.1,
      unit: 'percentage',
      trend: 'up',
      status: 'good',
      description: 'Percentage of available appointment slots filled',
      lastUpdated: new Date(),
      benchmark: 80.0
    },
    {
      id: 'average-wait-time',
      name: 'Average Wait Time',
      category: 'efficiency',
      value: 18,
      target: 15,
      previousValue: 22,
      unit: 'duration',
      trend: 'down',
      status: 'warning',
      description: 'Average patient wait time in minutes',
      lastUpdated: new Date(),
      benchmark: 12
    },
    {
      id: 'staff-productivity',
      name: 'Staff Productivity',
      category: 'operational',
      value: 92.1,
      target: 90.0,
      previousValue: 89.5,
      unit: 'percentage',
      trend: 'up',
      status: 'excellent',
      description: 'Staff productivity index',
      lastUpdated: new Date(),
      benchmark: 85.0
    },
    {
      id: 'cost-per-patient',
      name: 'Cost per Patient',
      category: 'financial',
      value: 145.50,
      target: 150.00,
      previousValue: 152.30,
      unit: 'currency',
      trend: 'down',
      status: 'good',
      description: 'Average cost per patient visit',
      lastUpdated: new Date(),
      benchmark: 160.00
    },
    {
      id: 'no-show-rate',
      name: 'No-Show Rate',
      category: 'operational',
      value: 12.3,
      target: 10.0,
      previousValue: 11.8,
      unit: 'percentage',
      trend: 'up',
      status: 'warning',
      description: 'Percentage of patients who miss appointments',
      lastUpdated: new Date(),
      benchmark: 8.0
    },
    {
      id: 'treatment-success-rate',
      name: 'Treatment Success Rate',
      category: 'clinical',
      value: 94.2,
      target: 95.0,
      previousValue: 93.8,
      unit: 'percentage',
      trend: 'up',
      status: 'good',
      description: 'Percentage of successful treatment outcomes',
      lastUpdated: new Date(),
      benchmark: 92.0
    }
  ];
}

// Helper function to calculate performance summary
function calculatePerformanceSummary(metrics: PerformanceMetric[]): PerformanceSummary {
  const excellentCount = metrics.filter(m => m.status === 'excellent').length;
  const goodCount = metrics.filter(m => m.status === 'good').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const criticalCount = metrics.filter(m => m.status === 'critical').length;
  
  const statusScores = {
    excellent: 10,
    good: 7,
    warning: 4,
    critical: 1
  };
  
  const totalScore = metrics.reduce((sum, metric) => sum + statusScores[metric.status], 0);
  const overallScore = totalScore / metrics.length;
  
  const achievements = [
    'Revenue growth exceeded target by 3.2%',
    'Patient satisfaction above benchmark',
    'Staff productivity at all-time high'
  ];
  
  const improvementAreas = [
    'Reduce average wait time by 3 minutes',
    'Decrease no-show rate to target level',
    'Optimize appointment scheduling efficiency'
  ];
  
  return {
    totalMetrics: metrics.length,
    excellentCount,
    goodCount,
    warningCount,
    criticalCount,
    overallScore,
    achievements,
    improvementAreas
  };
}
