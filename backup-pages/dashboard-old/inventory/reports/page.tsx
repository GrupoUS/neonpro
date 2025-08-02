// app/dashboard/inventory/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Filter, RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { InventoryReportsDashboard } from '@/app/components/inventory/reports/InventoryReportsDashboard';
import { ReportFiltersForm, QuickFilters } from '@/app/components/inventory/reports/ReportFiltersForm';
import { ReportList } from '@/app/components/inventory/reports/ReportList';
import { ReportViewer } from '@/app/components/inventory/reports/ReportViewer';
import { useInventoryReports } from '@/app/hooks/use-inventory-reports';
import type { ReportType, ReportFilters, ReportDefinition } from '@/app/lib/types/inventory-reports';

export default function InventoryReportsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'reports' | 'viewer'>('dashboard');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('stock_movement');
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [customReportName, setCustomReportName] = useState('');
  const [customReportDescription, setCustomReportDescription] = useState('');

  const {
    // Reports
    reports,
    reportsLoading,
    reportsError,
    generateReport,
    exportReport,
    // Report definitions
    reportDefinitions,
    definitionsLoading,
    // Dashboard stats
    dashboardStats,
    statsLoading,
    // Real-time data
    realTimeData,
    // Refetch functions
    refetchReports,
    refetchDashboard,
  } = useInventoryReports();

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        refetchDashboard();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, refetchDashboard]);

  // Handle report generation
  const handleGenerateReport = async () => {
    try {
      const reportData = {
        type: selectedReportType,
        name: customReportName || undefined,
        description: customReportDescription || undefined,
        filters: reportFilters,
      };

      await generateReport(reportData);
      
      toast.success('Report generation started successfully');
      setShowGenerateDialog(false);
      setCustomReportName('');
      setCustomReportDescription('');
      setReportFilters({});
      
      // Switch to reports tab to see the new report
      setActiveTab('reports');
      
      // Refresh reports list
      refetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to start report generation');
    }
  };

  // Handle quick filter selection
  const handleQuickFilterSelect = (filters: ReportFilters) => {
    setReportFilters(filters);
    toast.success('Quick filter applied');
  };

  // Handle report viewing
  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('viewer');
  };

  // Handle report download
  const handleDownloadReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportReport(reportId, format);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(`Failed to export report as ${format.toUpperCase()}`);
    }
  };

  // Handle report printing
  const handlePrintReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Failed to open print window');
      return;
    }

    // Generate print-friendly HTML
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.name || 'Inventory Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .summary { margin: 20px 0; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .data-table th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.name || 'Inventory Report'}</h1>
            <p>Generated: ${new Date(report.created_at).toLocaleString()}</p>
            ${report.description ? `<p>${report.description}</p>` : ''}
          </div>
          ${report.summary ? `
            <div class="summary">
              <h2>Summary</h2>
              ${report.summary.total_items !== undefined ? `<p>Total Items: ${report.summary.total_items}</p>` : ''}
              ${report.summary.total_value !== undefined ? `<p>Total Value: R$ ${report.summary.total_value.toLocaleString()}</p>` : ''}
              ${report.summary.low_stock_count !== undefined ? `<p>Low Stock Items: ${report.summary.low_stock_count}</p>` : ''}
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();

    toast.success('Print dialog opened');
  };

  // Get current report for viewer
  const currentReport = selectedReportId ? reports.find(r => r.id === selectedReportId) : null;

  // Get report type options
  const reportTypeOptions: Array<{ value: ReportType; label: string }> = [
    { value: 'stock_movement', label: 'Stock Movement' },
    { value: 'stock_valuation', label: 'Stock Valuation' },
    { value: 'low_stock', label: 'Low Stock Alert' },
    { value: 'expiring_items', label: 'Expiring Items' },
    { value: 'transfers', label: 'Stock Transfers' },
    { value: 'location_performance', label: 'Location Performance' },
    { value: 'abc_analysis', label: 'ABC Analysis' },
    { value: 'demand_forecast', label: 'Demand Forecast' },
    { value: 'cost_analysis', label: 'Cost Analysis' },
    { value: 'supplier_performance', label: 'Supplier Performance' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage inventory reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchReports();
              refetchDashboard();
            }}
            disabled={reportsLoading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(reportsLoading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Configure and generate a new inventory report
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Report Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={selectedReportType} onValueChange={(value) => setSelectedReportType(value as ReportType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Name and Description */}
                <div className="space-y-2">
                  <Label htmlFor="report-name">Report Name (Optional)</Label>
                  <Input
                    id="report-name"
                    value={customReportName}
                    onChange={(e) => setCustomReportName(e.target.value)}
                    placeholder="Enter custom report name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-description">Description (Optional)</Label>
                  <Input
                    id="report-description"
                    value={customReportDescription}
                    onChange={(e) => setCustomReportDescription(e.target.value)}
                    placeholder="Enter report description"
                  />
                </div>

                {/* Quick Filters */}
                <div className="space-y-2">
                  <Label>Quick Date Filters</Label>
                  <QuickFilters onFilterSelect={handleQuickFilterSelect} />
                </div>

                {/* Advanced Filters */}
                <ReportFiltersForm
                  reportType={selectedReportType}
                  initialFilters={reportFilters}
                  onFiltersChange={setReportFilters}
                  clinics={[]} // TODO: Load from API
                  rooms={[]} // TODO: Load from API
                  categories={[]} // TODO: Load from API
                  items={[]} // TODO: Load from API
                />

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateReport}>
                    Generate Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-4 border-b">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard</span>
        </Button>
        <Button
          variant={activeTab === 'reports' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('reports')}
        >
          Reports History
        </Button>
        {currentReport && (
          <Button
            variant={activeTab === 'viewer' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('viewer')}
          >
            Report Viewer
          </Button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && (
          <InventoryReportsDashboard
            stats={dashboardStats}
            loading={statsLoading}
            realTimeData={realTimeData}
            onGenerateReport={(type, filters) => {
              setSelectedReportType(type);
              setReportFilters(filters);
              setShowGenerateDialog(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {reportsError && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">
                    Error loading reports: {reportsError.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {reportsLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  <span className="ml-3">Loading reports...</span>
                </CardContent>
              </Card>
            ) : (
              <ReportList
                reports={reports}
                onViewReport={handleViewReport}
                onDownloadReport={handleDownloadReport}
                onPrintReport={handlePrintReport}
              />
            )}
          </div>
        )}

        {activeTab === 'viewer' && currentReport && (
          <ReportViewer report={currentReport} />
        )}

        {activeTab === 'viewer' && !currentReport && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Report Selected</h3>
              <p className="text-muted-foreground text-center">
                Select a report from the Reports History tab to view it here.
              </p>
              <Button
                className="mt-4"
                onClick={() => setActiveTab('reports')}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}