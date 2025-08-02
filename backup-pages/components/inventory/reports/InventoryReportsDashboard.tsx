import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  BarChart3,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from 'lucide-react';
import { useInventoryAnalytics, useReportFilters, useReportExport } from '@/app/hooks/use-inventory-reports';
import type { ReportFilters } from '@/app/lib/types/inventory-reports';
import { formatCurrency, formatNumber } from '@/app/lib/utils/formatters';
import { cn } from '@/app/lib/utils';

interface InventoryReportsDashboardProps {
  clinicId?: string;
  roomId?: string;
  className?: string;
}

const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
];

export function InventoryReportsDashboard({
  clinicId,
  roomId,
  className,
}: InventoryReportsDashboardProps) {
  const [timeRange, setTimeRange] = useState<string>('30');
  const { buildDateRangeFilter } = useReportFilters();
  const { exportToCSV } = useReportExport();

  // Build filters based on props and time range
  const filters: ReportFilters = useMemo(() => {
    const dateFilter = buildDateRangeFilter(parseInt(timeRange));
    return {
      ...dateFilter,
      ...(clinicId && { clinic_id: clinicId }),
      ...(roomId && { room_id: roomId }),
    };
  }, [timeRange, clinicId, roomId, buildDateRangeFilter]);

  const {
    analytics,
    isLoading,
    error,
    refetchAll,
    reports,
  } = useInventoryAnalytics(filters);

  const handleExport = async (reportType: string) => {
    try {
      await exportToCSV(reportType as any, filters, `${reportType}_report.csv`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load inventory reports: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive inventory analytics and reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refetchAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Inventory Value"
          value={analytics?.overview.totalValue}
          format="currency"
          icon={Package}
          isLoading={isLoading}
        />
        <OverviewCard
          title="Total Items"
          value={analytics?.overview.totalItems}
          format="number"
          icon={BarChart3}
          isLoading={isLoading}
        />
        <OverviewCard
          title="Low Stock Items"
          value={analytics?.overview.lowStockItems}
          format="number"
          icon={AlertTriangle}
          variant="warning"
          isLoading={isLoading}
        />
        <OverviewCard
          title="Total Movements"
          value={analytics?.overview.totalMovements}
          format="number"
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <PerformanceCard
          title="Average Turnover Rate"
          value={analytics?.performance.averageTurnover}
          unit="%"
          isLoading={isLoading}
        />
        <PerformanceCard
          title="System Efficiency"
          value={analytics?.performance.systemEfficiency}
          unit="%"
          isLoading={isLoading}
        />
        <PerformanceCard
          title="Best Performing Location"
          value={analytics?.performance.bestLocation}
          isTextValue
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock Movement Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">
                Stock Movement Trends
              </CardTitle>
              <CardDescription>
                Inbound vs outbound movements over time
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('stock_movement')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <StockMovementChart
              data={reports.stockMovement}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">
                Inventory by Category
              </CardTitle>
              <CardDescription>
                Value distribution across categories
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('stock_valuation')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart
              data={reports.stockValuation}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Reports Tables */}
      <div className="grid gap-4">
        {/* Low Stock Alert */}
        <LowStockTable
          data={reports.lowStock}
          isLoading={isLoading}
          onExport={() => handleExport('low_stock')}
        />

        {/* Expiring Items */}
        <ExpiringItemsTable
          data={reports.expiringItems}
          isLoading={isLoading}
          onExport={() => handleExport('expiring_items')}
        />

        {/* Recent Transfers */}
        <RecentTransfersTable
          data={reports.transfers}
          isLoading={isLoading}
          onExport={() => handleExport('transfers')}
        />
      </div>
    </div>
  );
}

// =============================================================================
// OVERVIEW CARD COMPONENT
// =============================================================================

interface OverviewCardProps {
  title: string;
  value?: number;
  format?: 'currency' | 'number';
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'warning';
  isLoading?: boolean;
}

function OverviewCard({
  title,
  value,
  format = 'number',
  icon: Icon,
  variant = 'default',
  isLoading,
}: OverviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={cn(
            'h-4 w-4',
            variant === 'warning' ? 'text-amber-500' : 'text-muted-foreground'
          )}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">
            {value !== undefined ? (
              format === 'currency' ? (
                formatCurrency(value)
              ) : (
                formatNumber(value)
              )
            ) : (
              '—'
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PERFORMANCE CARD COMPONENT
// =============================================================================

interface PerformanceCardProps {
  title: string;
  value?: number | string;
  unit?: string;
  isTextValue?: boolean;
  isLoading?: boolean;
}

function PerformanceCard({
  title,
  value,
  unit,
  isTextValue,
  isLoading,
}: PerformanceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-6 w-20" />
        ) : (
          <div className="text-lg font-semibold">
            {value !== undefined ? (
              isTextValue ? (
                value
              ) : (
                `${formatNumber(value as number)}${unit || ''}`
              )
            ) : (
              '—'
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// CHART COMPONENTS
// =============================================================================

function StockMovementChart({ data, isLoading }: { data?: any; isLoading: boolean }) {
  const chartData = useMemo(() => {
    if (!data?.summary.by_type) return [];

    return Object.entries(data.summary.by_type).map(([type, stats]: [string, any]) => ({
      type: type.replace('_', ' ').toUpperCase(),
      quantity: stats.quantity,
      value: stats.value,
    }));
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No movement data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'value' ? formatCurrency(value) : formatNumber(value),
            name === 'value' ? 'Total Value' : 'Quantity',
          ]}
        />
        <Legend />
        <Bar dataKey="quantity" fill={CHART_COLORS[0]} name="Quantity" />
        <Bar dataKey="value" fill={CHART_COLORS[1]} name="Value" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CategoryDistributionChart({ data, isLoading }: { data?: any; isLoading: boolean }) {
  const chartData = useMemo(() => {
    if (!data?.summary.by_category) return [];

    return Object.entries(data.summary.by_category).map(([category, stats]: [string, any]) => ({
      name: category,
      value: stats.value,
      percentage: stats.percentage,
    }));
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// TABLE COMPONENTS
// =============================================================================

function LowStockTable({ data, isLoading, onExport }: { data?: any; isLoading: boolean; onExport: () => void }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const lowStockItems = data?.data?.slice(0, 10) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>
            Items requiring immediate attention
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No low stock items found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.map((item: any) => (
                <TableRow key={item.item_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.item_name}</div>
                      <div className="text-sm text-muted-foreground">{item.item_sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.clinic_name}</TableCell>
                  <TableCell>{formatNumber(item.current_quantity)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.stock_status === 'critical'
                          ? 'destructive'
                          : item.stock_status === 'low'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {item.stock_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(item.total_value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ExpiringItemsTable({ data, isLoading, onExport }: { data?: any; isLoading: boolean; onExport: () => void }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const expiringItems = data?.data?.slice(0, 10) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Expiring Items</CardTitle>
          <CardDescription>
            Items expiring in the next 90 days
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {expiringItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expiring items found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days to Expiry</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Value at Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringItems.map((item: any) => (
                <TableRow key={`${item.item_id}-${item.batch_number}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.item_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Batch: {item.batch_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.clinic_name}</TableCell>
                  <TableCell>
                    {new Date(item.expiry_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{item.days_to_expiry}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.urgency_level === 'immediate'
                          ? 'destructive'
                          : item.urgency_level === 'urgent'
                          ? 'destructive'
                          : item.urgency_level === 'warning'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {item.urgency_level}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatNumber(item.current_quantity)}</TableCell>
                  <TableCell>{formatCurrency(item.total_value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RecentTransfersTable({ data, isLoading, onExport }: { data?: any; isLoading: boolean; onExport: () => void }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const recentTransfers = data?.data?.slice(0, 10) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Recent Transfers</CardTitle>
          <CardDescription>
            Latest stock transfers between locations
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransfers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent transfers found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransfers.map((transfer: any) => (
                <TableRow key={transfer.transfer_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transfer.item_name}</div>
                      <div className="text-sm text-muted-foreground">{transfer.item_sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>{transfer.from_clinic_name}</TableCell>
                  <TableCell>{transfer.to_clinic_name}</TableCell>
                  <TableCell>{formatNumber(transfer.quantity)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transfer.status === 'completed'
                          ? 'default'
                          : transfer.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(transfer.total_value)}</TableCell>
                  <TableCell>
                    {new Date(transfer.transfer_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}