'use client';

// Financial KPI Dashboard Component
// Description: Real-time financial KPI dashboard with drill-down capabilities
// Author: Dev Agent
// Date: 2025-01-26

import {
  AlertTriangle,
  BarChart3,
  Edit,
  Eye,
  PieChart,
  RefreshCw,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type {
  DashboardFilters,
  DashboardLayout,
  DrillDownResult,
  FinancialKPI,
  KPIAlert,
} from '@/lib/types/kpi-types';

type KPIDashboardProps = {
  userId: string;
  dashboardId?: string;
  isEditable?: boolean;
  refreshInterval?: number;
};

type KPICardProps = {
  kpi: FinancialKPI;
  isEditing?: boolean;
  onDrillDown?: (kpiId: string, dimension: string) => void;
  onEdit?: () => void;
  onRemove?: () => void;
};

type DrillDownModalProps = {
  kpi: FinancialKPI | null;
  dimension: string;
  results: DrillDownResult[];
  isOpen: boolean;
  onClose: () => void;
  onDrillDeeper?: (dimension: string, value: string) => void;
};

type AlertsPanelProps = {
  alerts: KPIAlert[];
  onAcknowledge: (alertId: string) => void;
  onViewDetails: (alert: KPIAlert) => void;
};

const KPICard: React.FC<KPICardProps> = ({
  kpi,
  isEditing,
  onDrillDown,
  onEdit,
  onRemove,
}) => {
  const formatValue = (value: number, category: string): string => {
    if (category === 'revenue' || category === 'profitability') {
      if (kpi.kpi_name.includes('Margin') || kpi.kpi_name.includes('Rate')) {
        return `${value.toFixed(1)}%`;
      }
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    if (kpi.kpi_name.includes('Rate') || kpi.kpi_name.includes('Utilization')) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString('pt-BR');
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return 'text-green-500';
      case 'decreasing':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getVarianceDisplay = (variance?: number) => {
    if (variance === undefined || variance === null) {
      return null;
    }
    const sign = variance >= 0 ? '+' : '';
    return `${sign}${variance.toFixed(1)}%`;
  };

  return (
    <Card className="relative transition-shadow hover:shadow-md">
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button onClick={onEdit} size="sm" variant="ghost">
            <Edit className="h-3 w-3" />
          </Button>
          <Button onClick={onRemove} size="sm" variant="ghost">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-gray-600 text-sm">
            {kpi.kpi_name}
          </CardTitle>
          <Badge className="text-xs" variant="outline">
            {kpi.kpi_category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-2xl">
              {formatValue(kpi.current_value, kpi.kpi_category)}
            </div>
            {kpi.target_value && (
              <div className="text-gray-500 text-sm">
                Target: {formatValue(kpi.target_value, kpi.kpi_category)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {getTrendIcon(kpi.trend_direction)}
            {kpi.variance_percent !== undefined && (
              <span
                className={`font-medium text-sm ${getTrendColor(kpi.trend_direction)}`}
              >
                {getVarianceDisplay(kpi.variance_percent)}
              </span>
            )}
          </div>
        </div>

        {!isEditing && onDrillDown && (
          <div className="mt-3 flex gap-1">
            <Button
              className="text-xs"
              onClick={() => onDrillDown(kpi.id, 'time')}
              size="sm"
              variant="outline"
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              Trend
            </Button>
            <Button
              className="text-xs"
              onClick={() => onDrillDown(kpi.id, 'service_type')}
              size="sm"
              variant="outline"
            >
              <PieChart className="mr-1 h-3 w-3" />
              Breakdown
            </Button>
          </div>
        )}

        <div className="mt-2 text-gray-400 text-xs">
          Updated: {new Date(kpi.last_updated).toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
};

const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAcknowledge,
  onViewDetails,
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (!alerts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-gray-500">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p>No active alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          Alerts
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert) => (
          <div
            className={`rounded-lg border p-3 ${getAlertColor(alert.alert_type)}`}
            key={alert.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getAlertIcon(alert.alert_type)}
                <div>
                  <div className="font-medium text-sm">
                    {alert.alert_message}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => onViewDetails(alert)}
                  size="sm"
                  variant="ghost"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                {!alert.is_acknowledged && (
                  <Button
                    onClick={() => onAcknowledge(alert.id)}
                    size="sm"
                    variant="outline"
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {alerts.length > 5 && (
          <Button className="w-full" size="sm" variant="ghost">
            View {alerts.length - 5} more alerts
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const DrillDownModal: React.FC<DrillDownModalProps> = ({
  kpi,
  dimension,
  results,
  isOpen,
  onClose,
  onDrillDeeper,
}) => {
  if (!kpi) {
    return null;
  }

  const formatValue = (value: number): string => {
    if (
      kpi.kpi_category === 'revenue' ||
      kpi.kpi_category === 'profitability'
    ) {
      if (kpi.kpi_name.includes('Margin') || kpi.kpi_name.includes('Rate')) {
        return `${value.toFixed(1)}%`;
      }
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    if (kpi.kpi_name.includes('Rate') || kpi.kpi_name.includes('Utilization')) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString('pt-BR');
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {kpi.kpi_name} - {dimension.replace('_', ' ').toUpperCase()}{' '}
            Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of {kpi.kpi_name} by{' '}
            {dimension.replace('_', ' ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No data available for this breakdown
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  key={index}
                >
                  <div className="flex-1">
                    <div className="font-medium">{result.dimension_value}</div>
                    <div className="text-gray-500 text-sm">
                      {result.percentage_of_total.toFixed(1)}% of total
                      {result.transaction_count && (
                        <span className="ml-2">
                          ({result.transaction_count} transactions)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">{formatValue(result.value)}</div>
                    {result.variance_from_previous !== undefined && (
                      <div
                        className={`text-sm ${
                          result.variance_from_previous >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {result.variance_from_previous >= 0 ? '+' : ''}
                        {result.variance_from_previous.toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {onDrillDeeper && (
                    <Button
                      className="ml-2"
                      onClick={() =>
                        onDrillDeeper('service_type', result.dimension_value)
                      }
                      size="sm"
                      variant="ghost"
                    >
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  userId,
  dashboardId,
  isEditable = false,
  refreshInterval = 30_000,
}) => {
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [alerts, setAlerts] = useState<KPIAlert[]>([]);
  const [_dashboard, setDashboard] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<FinancialKPI | null>(null);
  const [drillDownResults, setDrillDownResults] = useState<DrillDownResult[]>(
    []
  );
  const [drillDownDimension, setDrillDownDimension] = useState<string>('');
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    time_period: {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      preset: 'month',
    },
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(() => {
      loadKPIData();
      loadAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, loadAlerts, loadKPIData]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKPIData(),
        loadAlerts(),
        dashboardId ? loadDashboard() : Promise.resolve(),
      ]);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const loadKPIData = async () => {
    try {
      const response = await fetch('/api/analytics/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_period: filters.time_period,
          filters,
          include_variance: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setKpis(data.data);
      }
    } catch (_error) {}
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch(
        '/api/analytics/alerts?is_acknowledged=false'
      );
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (_error) {}
  };

  const loadDashboard = async () => {
    if (!dashboardId) {
      return;
    }

    try {
      const response = await fetch(`/api/analytics/dashboards/${dashboardId}`);
      const data = await response.json();
      if (data.success) {
        setDashboard(data.data);
        setFilters(data.data.filters);
      }
    } catch (_error) {}
  };

  const handleDrillDown = async (kpiId: string, dimension: string) => {
    const kpi = kpis.find((k) => k.id === kpiId);
    if (!kpi) {
      return;
    }

    try {
      const response = await fetch('/api/analytics/drill-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpi_id: kpiId,
          dimension,
          filters,
          aggregation_level: dimension === 'time' ? 'month' : undefined,
          limit: 20,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedKpi(kpi);
        setDrillDownDimension(dimension);
        setDrillDownResults(data.data.results || []);
        setShowDrillDown(true);
      }
    } catch (_error) {}
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(
        `/api/analytics/alerts/${alertId}/acknowledge`,
        {
          method: 'PATCH',
        }
      );

      if (response.ok) {
        setAlerts(alerts.filter((alert) => alert.id !== alertId));
      }
    } catch (_error) {}
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const groupedKpis = useMemo(() => {
    return kpis.reduce(
      (groups, kpi) => {
        const category = kpi.kpi_category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(kpi);
        return groups;
      },
      {} as Record<string, FinancialKPI[]>
    );
  }, [kpis]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Financial KPI Dashboard</h1>
          <p className="text-gray-600">
            Real-time financial metrics and performance indicators
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {isEditable && (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'default' : 'outline'}
            >
              {isEditing ? 'Done' : 'Edit'}
            </Button>
          )}
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Select
              onValueChange={(value) => {
                if (value !== 'custom') {
                  const now = new Date();
                  let startDate: Date;

                  switch (value) {
                    case 'today':
                      startDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                      );
                      break;
                    case 'week':
                      startDate = new Date(
                        now.getTime() - 7 * 24 * 60 * 60 * 1000
                      );
                      break;
                    case 'month':
                      startDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                      );
                      break;
                    case 'quarter':
                      startDate = new Date(
                        now.getFullYear(),
                        Math.floor(now.getMonth() / 3) * 3,
                        1
                      );
                      break;
                    case 'year':
                      startDate = new Date(now.getFullYear(), 0, 1);
                      break;
                    default:
                      return;
                  }

                  handleFilterChange({
                    time_period: {
                      start_date: startDate.toISOString().split('T')[0],
                      end_date: now.toISOString().split('T')[0],
                      preset: value as any,
                    },
                  });
                }
              }}
              value={filters.time_period?.preset || 'custom'}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Input
              className="w-40"
              onChange={(e) =>
                handleFilterChange({
                  time_period: {
                    ...filters.time_period!,
                    start_date: e.target.value,
                    preset: 'custom',
                  },
                })
              }
              type="date"
              value={filters.time_period?.start_date || ''}
            />

            <Input
              className="w-40"
              onChange={(e) =>
                handleFilterChange({
                  time_period: {
                    ...filters.time_period!,
                    end_date: e.target.value,
                    preset: 'custom',
                  },
                })
              }
              type="date"
              value={filters.time_period?.end_date || ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* KPI Cards */}
        <div className="lg:col-span-3">
          <Tabs className="space-y-4" defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="profitability">Profitability</TabsTrigger>
              <TabsTrigger value="operational">Operational</TabsTrigger>
              <TabsTrigger value="financial_health">
                Financial Health
              </TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="overview">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kpis.slice(0, 6).map((kpi) => (
                  <KPICard
                    isEditing={isEditing}
                    key={kpi.id}
                    kpi={kpi}
                    onDrillDown={handleDrillDown}
                  />
                ))}
              </div>
            </TabsContent>

            {Object.entries(groupedKpis).map(([category, categoryKpis]) => (
              <TabsContent
                className="space-y-4"
                key={category}
                value={category}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryKpis.map((kpi) => (
                    <KPICard
                      isEditing={isEditing}
                      key={kpi.id}
                      kpi={kpi}
                      onDrillDown={handleDrillDown}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <AlertsPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onViewDetails={(_alert) => {}}
          />
        </div>
      </div>

      {/* Drill-down Modal */}
      <DrillDownModal
        dimension={drillDownDimension}
        isOpen={showDrillDown}
        kpi={selectedKpi}
        onClose={() => setShowDrillDown(false)}
        onDrillDeeper={(_dimension, _value) => {}}
        results={drillDownResults}
      />
    </div>
  );
};

export default KPIDashboard;
