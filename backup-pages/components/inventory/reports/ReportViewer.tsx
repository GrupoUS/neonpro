import React from 'react';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/lib/utils';
import type { InventoryReport, ReportData } from '@/app/lib/types/inventory-reports';

interface ReportViewerProps {
  report: InventoryReport;
  className?: string;
}

// Color palette for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

// Chart component for different report types
function ReportChart({ data, type }: { data: ReportData; type: string }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No chart data available
      </div>
    );
  }

  switch (type) {
    case 'stock_movement':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => format(new Date(value), 'PPP')}
              formatter={(value: number) => [value.toLocaleString(), 'Quantity']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="in" 
              stackId="1" 
              stroke="#00C49F" 
              fill="#00C49F" 
              name="Stock In"
            />
            <Area 
              type="monotone" 
              dataKey="out" 
              stackId="1" 
              stroke="#FF8042" 
              fill="#FF8042" 
              name="Stock Out"
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'stock_valuation':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Value']}
            />
            <Legend />
            <Bar dataKey="value" fill="#0088FE" name="Stock Value" />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'low_stock':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="item_name" width={120} />
            <Tooltip />
            <Bar dataKey="current_stock" fill="#FF8042" name="Current Stock" />
            <Bar dataKey="min_stock" fill="#FFBB28" name="Minimum Stock" />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'location_performance':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Value']} />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'transfers':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => format(new Date(value), 'PPP')}
              formatter={(value: number) => [value, 'Transfers']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Transfer Count"
            />
          </LineChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      );
  }
}

// Data table component
function DataTable({ data }: { data: ReportData }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={column}
                className="text-left p-3 font-medium text-muted-foreground"
              >
                {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column} className="p-3">
                  {formatCellValue(row[column], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Format cell values based on column type
function formatCellValue(value: any, column: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Date formatting
  if (column.includes('date') || column.includes('created_at') || column.includes('updated_at')) {
    return format(new Date(value), 'PPp');
  }

  // Currency formatting
  if (column.includes('price') || column.includes('cost') || column.includes('value')) {
    return `R$ ${Number(value).toLocaleString()}`;
  }

  // Quantity formatting
  if (column.includes('quantity') || column.includes('stock') || column.includes('count')) {
    return Number(value).toLocaleString();
  }

  // Status badges
  if (column.includes('status')) {
    return (
      <Badge variant={value === 'low' ? 'destructive' : 'secondary'}>
        {value}
      </Badge>
    );
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? 'Yes' : 'No'}
      </Badge>
    );
  }

  return String(value);
}

export function ReportViewer({ report, className }: ReportViewerProps) {
  const showChart = report.status === 'completed' && report.data && Array.isArray(report.data);
  const showTable = report.status === 'completed' && report.data;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                {report.name || `${report.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <span>Generated: {format(new Date(report.created_at), 'PPp')}</span>
                {report.filters?.start_date && report.filters?.end_date && (
                  <span>
                    Period: {format(new Date(report.filters.start_date), 'PP')} - {format(new Date(report.filters.end_date), 'PP')}
                  </span>
                )}
              </div>
            </div>
            <Badge 
              className={
                report.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : report.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>

          {report.description && (
            <p className="text-muted-foreground mt-3">
              {report.description}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Applied Filters */}
      {report.filters && Object.keys(report.filters).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applied Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.filters.clinic_id && (
                <div>
                  <span className="text-sm font-medium">Clinic:</span>
                  <p className="text-sm text-muted-foreground">{report.filters.clinic_id}</p>
                </div>
              )}
              {report.filters.room_id && (
                <div>
                  <span className="text-sm font-medium">Room:</span>
                  <p className="text-sm text-muted-foreground">{report.filters.room_id}</p>
                </div>
              )}
              {report.filters.category && (
                <div>
                  <span className="text-sm font-medium">Category:</span>
                  <p className="text-sm text-muted-foreground">{report.filters.category}</p>
                </div>
              )}
              {report.filters.movement_type && (
                <div>
                  <span className="text-sm font-medium">Movement Type:</span>
                  <p className="text-sm text-muted-foreground">{report.filters.movement_type}</p>
                </div>
              )}
              {report.filters.include_zero_stock && (
                <div>
                  <span className="text-sm font-medium">Include Zero Stock:</span>
                  <p className="text-sm text-muted-foreground">Yes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Summary */}
      {report.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {report.summary.total_items !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {report.summary.total_items.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
              )}
              {report.summary.total_value !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    R$ {report.summary.total_value.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              )}
              {report.summary.low_stock_count !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {report.summary.low_stock_count}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Stock Items</div>
                </div>
              )}
              {report.summary.movement_count !== undefined && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {report.summary.movement_count}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Movements</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {report.status === 'failed' && report.error_message && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Report Generation Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{report.error_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Chart Visualization */}
      {showChart && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chart View</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportChart data={report.data} type={report.type} />
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {showTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={report.data} />
          </CardContent>
        </Card>
      )}

      {/* Processing State */}
      {report.status === 'processing' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Report</h3>
            <p className="text-muted-foreground text-center">
              Please wait while we process your report data...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending State */}
      {report.status === 'pending' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-3 w-3 bg-yellow-500 rounded-full mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Report Queued</h3>
            <p className="text-muted-foreground text-center">
              Your report is queued for processing and will be available shortly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}