import { supabase } from '@/lib/supabase';
import { CacheService } from './cache';

export interface FinancialReport {
  id: string;
  title: string;
  description: string;
  type: 'revenue' | 'expenses' | 'profit' | 'patients' | 'comprehensive';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  data: ReportData;
  generatedAt: Date;
  generatedBy: string;
  status: 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'excel' | 'csv';
  downloadUrl?: string;
}

export interface ReportData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    patientCount: number;
    appointmentCount: number;
  };
  details: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  charts: Array<{
    type: 'line' | 'bar' | 'pie';
    title: string;
    data: any[];
  }>;
}

export interface ReportSchedule {
  id: string;
  reportType: FinancialReport['type'];
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  nextRun: Date;
  lastRun?: Date;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
  customBranding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

export class FinancialReportsService {
  private static readonly CACHE_PREFIX = 'financial_reports';
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Generate a financial report
   */
  static async generateReport(
    type: FinancialReport['type'],
    period: FinancialReport['period'],
    startDate: Date,
    endDate: Date,
    _userId: string,
  ): Promise<FinancialReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create initial report record
      const report: FinancialReport = {
        id: reportId,
        title: this.generateReportTitle(type, period),
        description: this.generateReportDescription(type, period, startDate, endDate),
        type,
        period,
        startDate,
        endDate,
        data: {
          summary: {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            patientCount: 0,
            appointmentCount: 0,
          },
          details: [],
          charts: [],
        },
        generatedAt: new Date(),
        generatedBy: userId,
        status: 'generating',
        format: 'pdf',
      };

      // Save to database
      const { error: insertError } = await supabase
        .from('financial_reports')
        .insert({
          id: reportId,
          title: report.title,
          description: report.description,
          type: report.type,
          period: report.period,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          generated_by: userId,
          status: report.status,
          format: report.format,
        });

      if (insertError) throw insertError;

      // Generate report data asynchronously
      setTimeout(_() => this.processReportGeneration(reportId, type, startDate, endDate), 0);

      return report;
    } catch (_error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate financial report');
    }
  }

  /**
   * Get report by ID
   */
  static async getReport(reportId: string): Promise<FinancialReport | null> {
    const cacheKey = `${this.CACHE_PREFIX}_${reportId}`;

    // Try cache first
    const cached = await CacheService.get<FinancialReport>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const report = this.mapDatabaseToReport(data);

      // Cache the result
      await CacheService.set(cacheKey, report, this.CACHE_TTL);

      return report;
    } catch (_error) {
      console.error('Error getting report:', error);
      return null;
    }
  }

  /**
   * List reports with filtering
   */
  static async listReports(
    filters?: {
      type?: FinancialReport['type'];
      period?: FinancialReport['period'];
      status?: FinancialReport['status'];
      _userId?: string;
      limit?: number;
    },
  ): Promise<FinancialReport[]> {
    try {
      let query = supabase
        .from('financial_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.period) {
        query = query.eq('period', filters.period);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?._userId) {
        query = query.eq('generated_by', filters._userId);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapDatabaseToReport);
    } catch (_error) {
      console.error('Error listing reports:', error);
      return [];
    }
  }

  /**
   * Export report in specified format
   */
  static async exportReport(
    reportId: string,
    options: ReportExportOptions,
  ): Promise<Blob> {
    const report = await this.getReport(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    switch (options.format) {
      case 'pdf':
        return this.exportToPdf(report, options);
      case 'excel':
        return this.exportToExcel(report, options);
      case 'csv':
        return this.exportToCsv(report, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Schedule recurring reports
   */
  static async scheduleReport(
    schedule: Omit<ReportSchedule, 'id' | 'nextRun' | 'lastRun'>,
  ): Promise<ReportSchedule> {
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nextRun = this.calculateNextRun(schedule.frequency);

    try {
      const { error } = await supabase
        .from('report_schedules')
        .insert({
          id: scheduleId,
          report_type: schedule.reportType,
          frequency: schedule.frequency,
          recipients: schedule.recipients,
          format: schedule.format,
          is_active: schedule.isActive,
          next_run: nextRun.toISOString(),
        });

      if (error) throw error;

      return {
        id: scheduleId,
        ...schedule,
        nextRun,
      };
    } catch (_error) {
      console.error('Error scheduling report:', error);
      throw new Error('Failed to schedule report');
    }
  }

  /**
   * Process report generation (async)
   */
  private static async processReportGeneration(
    reportId: string,
    type: FinancialReport['type'],
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    try {
      // Fetch data based on report type
      const reportData = await this.fetchReportData(type, startDate, endDate);

      // Update report with generated data
      const { error } = await supabase
        .from('financial_reports')
        .update({
          data: reportData,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      // Invalidate cache
      await CacheService.invalidate(`${this.CACHE_PREFIX}_${reportId}`);
    } catch (_error) {
      console.error('Error processing report generation:', error);

      // Mark report as failed
      await supabase
        .from('financial_reports')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);
    }
  }

  /**
   * Fetch report data based on type
   */
  private static async fetchReportData(
    _type: FinancialReport['type'],
    _startDate: Date,
    _endDate: Date,
  ): Promise<ReportData> {
    // This would typically fetch from your financial data sources
    // For now, returning mock data
    return {
      summary: {
        totalRevenue: 150000,
        totalExpenses: 80000,
        netProfit: 70000,
        patientCount: 245,
        appointmentCount: 520,
      },
      details: [
        {
          category: 'Consultations',
          amount: 120000,
          percentage: 80,
          trend: 'up',
        },
        {
          category: 'Procedures',
          amount: 30000,
          percentage: 20,
          trend: 'stable',
        },
      ],
      charts: [
        {
          type: 'line',
          title: 'Revenue Trend',
          data: [
            { month: 'Jan', value: 25000 },
            { month: 'Feb', value: 28000 },
            { month: 'Mar', value: 32000 },
          ],
        },
      ],
    };
  }

  /**
   * Generate report title
   */
  private static generateReportTitle(
    type: FinancialReport['type'],
    period: FinancialReport['period'],
  ): string {
    const typeMap = {
      revenue: 'Revenue',
      expenses: 'Expenses',
      profit: 'Profit',
      patients: 'Patient',
      comprehensive: 'Comprehensive Financial',
    };

    const periodMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Annual',
    };

    return `${periodMap[period]} ${typeMap[type]} Report`;
  }

  /**
   * Generate report description
   */
  private static generateReportDescription(
    type: FinancialReport['type'],
    period: FinancialReport['period'],
    startDate: Date,
    endDate: Date,
  ): string {
    const start = startDate.toLocaleDateString('pt-BR');
    const end = endDate.toLocaleDateString('pt-BR');
    return `Financial ${type} analysis for the period from ${start} to ${end}`;
  }

  /**
   * Map database record to FinancialReport
   */
  private static mapDatabaseToReport(data: any): FinancialReport {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      period: data.period,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      data: data.data
        || {
          summary: {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            patientCount: 0,
            appointmentCount: 0,
          },
          details: [],
          charts: [],
        },
      generatedAt: new Date(data.generated_at),
      generatedBy: data.generated_by,
      status: data.status,
      format: data.format,
      downloadUrl: data.download_url,
    };
  }

  /**
   * Calculate next run date for scheduled reports
   */
  private static calculateNextRun(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const _now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Export to PDF
   */
  private static exportToPdf(report: FinancialReport, _options: ReportExportOptions): Blob {
    // Simplified PDF export - in production, use a proper PDF library
    const content = `
Financial Report: ${report.title}
Generated: ${report.generatedAt.toLocaleDateString('pt-BR')}
Period: ${report.startDate.toLocaleDateString('pt-BR')} - ${
      report.endDate.toLocaleDateString('pt-BR')
    }

Summary:
- Total Revenue: ${
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        report.data.summary.totalRevenue,
      )
    }
- Total Expenses: ${
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        report.data.summary.totalExpenses,
      )
    }
- Net Profit: ${
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        report.data.summary.netProfit,
      )
    }
- Patient Count: ${report.data.summary.patientCount}
- Appointment Count: ${report.data.summary.appointmentCount}
    `;

    return new Blob([content], { type: 'application/pdf' });
  }

  /**
   * Export to Excel
   */
  private static exportToExcel(report: FinancialReport, options: ReportExportOptions): Blob {
    // Simplified Excel export - in production, use a proper Excel library
    const content = this.exportToCsv(report, options);
    return new Blob([content], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  /**
   * Export to CSV
   */
  private static exportToCsv(report: FinancialReport, _options: ReportExportOptions): Blob {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', report.data.summary.totalRevenue.toString()],
      ['Total Expenses', report.data.summary.totalExpenses.toString()],
      ['Net Profit', report.data.summary.netProfit.toString()],
      ['Patient Count', report.data.summary.patientCount.toString()],
      ['Appointment Count', report.data.summary.appointmentCount.toString()],
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}
