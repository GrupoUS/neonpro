import React from 'react';
import { format } from 'date-fns';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Package,
  Download,
  Printer,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/lib/utils';
import type { 
  InventoryReport, 
  ReportStatus,
  ReportType 
} from '@/app/lib/types/inventory-reports';

interface ReportListProps {
  reports: InventoryReport[];
  onViewReport: (reportId: string) => void;
  onDownloadReport: (reportId: string, format: 'pdf' | 'excel' | 'csv') => void;
  onPrintReport: (reportId: string) => void;
  className?: string;
}

const getReportTypeLabel = (type: ReportType): string => {
  const labels: Record<ReportType, string> = {
    stock_movement: 'Stock Movement',
    stock_valuation: 'Stock Valuation',
    low_stock: 'Low Stock Alert',
    expiring_items: 'Expiring Items',
    transfers: 'Stock Transfers',
    location_performance: 'Location Performance',
    abc_analysis: 'ABC Analysis',
    demand_forecast: 'Demand Forecast',
    cost_analysis: 'Cost Analysis',
    supplier_performance: 'Supplier Performance',
    custom: 'Custom Report',
  };
  return labels[type] || type;
};

const getReportTypeIcon = (type: ReportType) => {
  const icons: Record<ReportType, React.ReactNode> = {
    stock_movement: <TrendingUp className="h-4 w-4" />,
    stock_valuation: <BarChart3 className="h-4 w-4" />,
    low_stock: <AlertTriangle className="h-4 w-4" />,
    expiring_items: <AlertTriangle className="h-4 w-4" />,
    transfers: <Package className="h-4 w-4" />,
    location_performance: <TrendingUp className="h-4 w-4" />,
    abc_analysis: <BarChart3 className="h-4 w-4" />,
    demand_forecast: <TrendingUp className="h-4 w-4" />,
    cost_analysis: <BarChart3 className="h-4 w-4" />,
    supplier_performance: <BarChart3 className="h-4 w-4" />,
    custom: <BarChart3 className="h-4 w-4" />,
  };
  return icons[type] || <BarChart3 className="h-4 w-4" />;
};

const getStatusBadge = (status: ReportStatus) => {
  const variants: Record<ReportStatus, { variant: string; className: string }> = {
    pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
    processing: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
    completed: { variant: 'secondary', className: 'bg-green-100 text-green-800' },
    failed: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
  };

  const config = variants[status];
  
  return (
    <Badge className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function ReportList({
  reports,
  onViewReport,
  onDownloadReport,
  onPrintReport,
  className,
}: ReportListProps) {
  if (reports.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports found</h3>
          <p className="text-muted-foreground text-center">
            Generate your first report to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  {getReportTypeIcon(report.type)}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {report.name || getReportTypeLabel(report.type)}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>Generated: {format(new Date(report.created_at), 'PPp')}</span>
                    {report.filters?.start_date && report.filters?.end_date && (
                      <span>
                        Period: {format(new Date(report.filters.start_date), 'PP')} - {format(new Date(report.filters.end_date), 'PP')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(report.status)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Report Description */}
            {report.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {report.description}
              </p>
            )}

            {/* Filters Summary */}
            {report.filters && Object.keys(report.filters).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Applied Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {report.filters.clinic_id && (
                    <Badge variant="outline" className="text-xs">
                      Clinic: {report.filters.clinic_id}
                    </Badge>
                  )}
                  {report.filters.room_id && (
                    <Badge variant="outline" className="text-xs">
                      Room: {report.filters.room_id}
                    </Badge>
                  )}
                  {report.filters.category && (
                    <Badge variant="outline" className="text-xs">
                      Category: {report.filters.category}
                    </Badge>
                  )}
                  {report.filters.movement_type && (
                    <Badge variant="outline" className="text-xs">
                      Movement: {report.filters.movement_type}
                    </Badge>
                  )}
                  {report.filters.include_zero_stock && (
                    <Badge variant="outline" className="text-xs">
                      Include Zero Stock
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Report Summary Stats */}
            {report.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                {report.summary.total_items !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {report.summary.total_items.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Items</div>
                  </div>
                )}
                {report.summary.total_value !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {report.summary.total_value.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Value</div>
                  </div>
                )}
                {report.summary.low_stock_count !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {report.summary.low_stock_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Low Stock</div>
                  </div>
                )}
                {report.summary.movement_count !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.summary.movement_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Movements</div>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {report.status === 'failed' && report.error_message && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Report Generation Failed</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {report.error_message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {report.status === 'completed' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onViewReport(report.id)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrintReport(report.id)}
                      className="flex items-center space-x-1"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print</span>
                    </Button>

                    {/* Download Options */}
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadReport(report.id, 'pdf')}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>PDF</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadReport(report.id, 'excel')}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Excel</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadReport(report.id, 'csv')}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>CSV</span>
                      </Button>
                    </div>
                  </>
                )}

                {report.status === 'processing' && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm">Processing...</span>
                  </div>
                )}

                {report.status === 'pending' && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Queued for processing</span>
                  </div>
                )}
              </div>

              {/* View Details Arrow */}
              {report.status === 'completed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewReport(report.id)}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm">View Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Processing Progress */}
            {report.status === 'processing' && (
              <div className="mt-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300 animate-pulse"
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Generating report data...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Report list with pagination
interface PaginatedReportListProps extends Omit<ReportListProps, 'reports'> {
  reports: InventoryReport[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginatedReportList({
  reports,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewReport,
  onDownloadReport,
  onPrintReport,
  className,
}: PaginatedReportListProps) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, reports.length);
  const paginatedReports = reports.slice(startIndex, endIndex);

  return (
    <div className={className}>
      <ReportList
        reports={paginatedReports}
        onViewReport={onViewReport}
        onDownloadReport={onDownloadReport}
        onPrintReport={onPrintReport}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{endIndex} of {reports.length} reports
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}