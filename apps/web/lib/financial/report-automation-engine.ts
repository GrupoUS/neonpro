// Report Automation & Export Engine
// Epic 5, Story 5.1, Task 6: Report Automation & Export
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

import { createClient } from '@/app/utils/supabase/client';

export type ReportSchedule = {
  scheduleId: string;
  reportType: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  recipients: string[];
  parameters: any;
  nextRunDate: Date;
  lastRunDate?: Date;
  isActive: boolean;
  createdBy: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
};

export type ReportTemplate = {
  templateId: string;
  templateName: string;
  reportType: string;
  description: string;
  parameters: any;
  layout: any;
  styling: any;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
};

export type ExportOptions = {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
  compression: boolean;
  password?: string;
  watermark?: string;
  branding: boolean;
};

export type ReportDelivery = {
  deliveryId: string;
  reportType: string;
  recipients: string[];
  deliveryMethod: 'email' | 'download' | 'api' | 'ftp';
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  filePath?: string;
  fileSize?: number;
  deliveredAt?: Date;
  errorMessage?: string;
  retryCount: number;
};

export type ReportArchive = {
  archiveId: string;
  reportType: string;
  reportName: string;
  generatedDate: Date;
  filePath: string;
  fileSize: number;
  parameters: any;
  generatedBy: string;
  retentionPeriod: number;
  downloadCount: number;
  lastAccessedAt?: Date;
};

export class ReportAutomationEngine {
  private readonly supabase = createClient();

  // =====================================================================================
  // AUTOMATED REPORT SCHEDULING
  // =====================================================================================

  /**
   * Create automated report schedule
   */
  async createReportSchedule(
    clinicId: string,
    schedule: Omit<ReportSchedule, 'scheduleId'>
  ): Promise<string> {
    const { data: scheduleData, error } = await this.supabase
      .from('report_schedules')
      .insert({
        clinic_id: clinicId,
        report_type: schedule.reportType,
        report_name: schedule.reportName,
        frequency: schedule.frequency,
        recipients: schedule.recipients,
        parameters: schedule.parameters,
        next_run_date: schedule.nextRunDate.toISOString(),
        is_active: schedule.isActive,
        created_by: schedule.createdBy,
        format: schedule.format,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create report schedule: ${error.message}`);
    }

    return scheduleData.id;
  }

  /**
   * Get all report schedules for a clinic
   */
  async getReportSchedules(clinicId: string): Promise<ReportSchedule[]> {
    const { data: schedules, error } = await this.supabase
      .from('report_schedules')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('next_run_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch report schedules: ${error.message}`);
    }

    return schedules.map((schedule: any) => ({
      scheduleId: schedule.id,
      reportType: schedule.report_type,
      reportName: schedule.report_name,
      frequency: schedule.frequency,
      recipients: schedule.recipients,
      parameters: schedule.parameters,
      nextRunDate: new Date(schedule.next_run_date),
      lastRunDate: schedule.last_run_date
        ? new Date(schedule.last_run_date)
        : undefined,
      isActive: schedule.is_active,
      createdBy: schedule.created_by,
      format: schedule.format,
    }));
  }

  /**
   * Process scheduled reports (called by cron job)
   */
  async processScheduledReports(): Promise<{
    processed: number;
    failed: number;
  }> {
    const { data: dueReports, error } = await this.supabase
      .from('report_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_date', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to fetch due reports: ${error.message}`);
    }

    let processed = 0;
    let failed = 0;

    for (const schedule of dueReports) {
      try {
        await this.generateAndDeliverReport(schedule);
        await this.updateNextRunDate(schedule.id, schedule.frequency);
        processed++;
      } catch (_error) {
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * Generate and deliver scheduled report
   */
  private async generateAndDeliverReport(schedule: any): Promise<void> {
    // Generate report based on type and parameters
    const reportData = await this.generateReport(
      schedule.report_type,
      schedule.parameters
    );

    // Export to specified format
    const exportResult = await this.exportReport(reportData, {
      format: schedule.format,
      includeCharts: true,
      includeRawData: false,
      compression: true,
      branding: true,
    });

    // Deliver to recipients
    await this.deliverReport({
      reportType: schedule.report_type,
      recipients: schedule.recipients,
      deliveryMethod: 'email',
      filePath: exportResult.filePath,
      status: 'pending',
    });

    // Update last run date
    await this.supabase
      .from('report_schedules')
      .update({ last_run_date: new Date().toISOString() })
      .eq('id', schedule.id);
  }

  // =====================================================================================
  // REPORT TEMPLATES & CUSTOMIZATION
  // =====================================================================================

  /**
   * Create custom report template
   */
  async createReportTemplate(
    clinicId: string,
    template: Omit<ReportTemplate, 'templateId' | 'createdAt'>
  ): Promise<string> {
    const { data: templateData, error } = await this.supabase
      .from('report_templates')
      .insert({
        clinic_id: clinicId,
        template_name: template.templateName,
        report_type: template.reportType,
        description: template.description,
        parameters: template.parameters,
        layout: template.layout,
        styling: template.styling,
        is_default: template.isDefault,
        created_by: template.createdBy,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create report template: ${error.message}`);
    }

    return templateData.id;
  }

  /**
   * Get report templates
   */
  async getReportTemplates(
    clinicId: string,
    reportType?: string
  ): Promise<ReportTemplate[]> {
    let query = this.supabase
      .from('report_templates')
      .select('*')
      .eq('clinic_id', clinicId);

    if (reportType) {
      query = query.eq('report_type', reportType);
    }

    const { data: templates, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch report templates: ${error.message}`);
    }

    return templates.map((template: any) => ({
      templateId: template.id,
      templateName: template.template_name,
      reportType: template.report_type,
      description: template.description,
      parameters: template.parameters,
      layout: template.layout,
      styling: template.styling,
      isDefault: template.is_default,
      createdBy: template.created_by,
      createdAt: new Date(template.created_at),
    }));
  }

  // =====================================================================================
  // MULTI-FORMAT EXPORT ENGINE
  // =====================================================================================

  /**
   * Export report to multiple formats with professional formatting
   */
  async exportReport(
    reportData: any,
    options: ExportOptions
  ): Promise<{ filePath: string; fileSize: number; downloadUrl: string }> {
    try {
      let exportResult;

      switch (options.format) {
        case 'pdf':
          exportResult = await this.exportToPDF(reportData, options);
          break;
        case 'excel':
          exportResult = await this.exportToExcel(reportData, options);
          break;
        case 'csv':
          exportResult = await this.exportToCSV(reportData, options);
          break;
        case 'json':
          exportResult = await this.exportToJSON(reportData, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Apply compression if requested
      if (options.compression) {
        exportResult = await this.compressFile(exportResult);
      }

      // Apply password protection if specified
      if (options.password) {
        exportResult = await this.passwordProtectFile(
          exportResult,
          options.password
        );
      }

      return exportResult;
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Export to PDF with professional formatting
   */
  private async exportToPDF(
    reportData: any,
    options: ExportOptions
  ): Promise<{ filePath: string; fileSize: number; downloadUrl: string }> {
    // Use Puppeteer or similar for PDF generation
    const { data: pdfResult, error } = await this.supabase.rpc(
      'generate_pdf_report',
      {
        report_data: reportData,
        include_charts: options.includeCharts,
        watermark: options.watermark,
        branding: options.branding,
      }
    );

    if (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }

    return {
      filePath: pdfResult.file_path,
      fileSize: pdfResult.file_size,
      downloadUrl: pdfResult.download_url,
    };
  }

  /**
   * Export to Excel with multiple sheets and formatting
   */
  private async exportToExcel(
    reportData: any,
    options: ExportOptions
  ): Promise<{ filePath: string; fileSize: number; downloadUrl: string }> {
    const { data: excelResult, error } = await this.supabase.rpc(
      'generate_excel_report',
      {
        report_data: reportData,
        include_charts: options.includeCharts,
        include_raw_data: options.includeRawData,
        branding: options.branding,
      }
    );

    if (error) {
      throw new Error(`Excel generation failed: ${error.message}`);
    }

    return {
      filePath: excelResult.file_path,
      fileSize: excelResult.file_size,
      downloadUrl: excelResult.download_url,
    };
  }

  /**
   * Export to CSV with proper encoding
   */
  private async exportToCSV(
    reportData: any,
    options: ExportOptions
  ): Promise<{ filePath: string; fileSize: number; downloadUrl: string }> {
    const { data: csvResult, error } = await this.supabase.rpc(
      'generate_csv_report',
      {
        report_data: reportData,
        include_raw_data: options.includeRawData,
      }
    );

    if (error) {
      throw new Error(`CSV generation failed: ${error.message}`);
    }

    return {
      filePath: csvResult.file_path,
      fileSize: csvResult.file_size,
      downloadUrl: csvResult.download_url,
    };
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(
    reportData: any,
    _options: ExportOptions
  ): Promise<{ filePath: string; fileSize: number; downloadUrl: string }> {
    const { data: jsonResult, error } = await this.supabase.rpc(
      'generate_json_report',
      {
        report_data: reportData,
      }
    );

    if (error) {
      throw new Error(`JSON generation failed: ${error.message}`);
    }

    return {
      filePath: jsonResult.file_path,
      fileSize: jsonResult.file_size,
      downloadUrl: jsonResult.download_url,
    };
  }

  // =====================================================================================
  // REPORT DELIVERY & DISTRIBUTION
  // =====================================================================================

  /**
   * Deliver report to recipients via email
   */
  async deliverReport(
    delivery: Omit<ReportDelivery, 'deliveryId'>
  ): Promise<string> {
    const { data: deliveryData, error } = await this.supabase
      .from('report_deliveries')
      .insert({
        report_type: delivery.reportType,
        recipients: delivery.recipients,
        delivery_method: delivery.deliveryMethod,
        status: delivery.status,
        file_path: delivery.filePath,
        file_size: delivery.fileSize,
        retry_count: 0,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create report delivery: ${error.message}`);
    }

    // Send email with report attachment
    if (delivery.deliveryMethod === 'email') {
      await this.sendReportEmail(
        deliveryData.id,
        delivery.recipients,
        delivery.filePath!
      );
    }

    return deliveryData.id;
  }

  /**
   * Send report via email
   */
  private async sendReportEmail(
    deliveryId: string,
    recipients: string[],
    filePath: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('send_report_email', {
        delivery_id: deliveryId,
        recipients,
        file_path: filePath,
      });

      if (error) {
        throw error;
      }

      // Update delivery status
      await this.supabase
        .from('report_deliveries')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', deliveryId);
    } catch (error) {
      // Update delivery status with error
      await this.supabase
        .from('report_deliveries')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', deliveryId);

      throw error;
    }
  }

  // =====================================================================================
  // REPORT ARCHIVE & HISTORICAL ACCESS
  // =====================================================================================

  /**
   * Archive generated report
   */
  async archiveReport(
    clinicId: string,
    archive: Omit<
      ReportArchive,
      'archiveId' | 'downloadCount' | 'lastAccessedAt'
    >
  ): Promise<string> {
    const { data: archiveData, error } = await this.supabase
      .from('report_archives')
      .insert({
        clinic_id: clinicId,
        report_type: archive.reportType,
        report_name: archive.reportName,
        generated_date: archive.generatedDate.toISOString(),
        file_path: archive.filePath,
        file_size: archive.fileSize,
        parameters: archive.parameters,
        generated_by: archive.generatedBy,
        retention_period: archive.retentionPeriod,
        download_count: 0,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to archive report: ${error.message}`);
    }

    return archiveData.id;
  }

  /**
   * Get archived reports
   */
  async getArchivedReports(
    clinicId: string,
    reportType?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<ReportArchive[]> {
    let query = this.supabase
      .from('report_archives')
      .select('*')
      .eq('clinic_id', clinicId);

    if (reportType) {
      query = query.eq('report_type', reportType);
    }

    if (dateRange) {
      query = query
        .gte('generated_date', dateRange.start.toISOString())
        .lte('generated_date', dateRange.end.toISOString());
    }

    const { data: archives, error } = await query.order('generated_date', {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch archived reports: ${error.message}`);
    }

    return archives.map((archive: any) => ({
      archiveId: archive.id,
      reportType: archive.report_type,
      reportName: archive.report_name,
      generatedDate: new Date(archive.generated_date),
      filePath: archive.file_path,
      fileSize: archive.file_size,
      parameters: archive.parameters,
      generatedBy: archive.generated_by,
      retentionPeriod: archive.retention_period,
      downloadCount: archive.download_count,
      lastAccessedAt: archive.last_accessed_at
        ? new Date(archive.last_accessed_at)
        : undefined,
    }));
  }

  // =====================================================================================
  // UTILITY METHODS
  // =====================================================================================

  /**
   * Generate report based on type and parameters
   */
  private async generateReport(
    reportType: string,
    parameters: any
  ): Promise<any> {
    const { data: reportData, error } = await this.supabase.rpc(
      'generate_report_data',
      {
        report_type: reportType,
        parameters,
      }
    );

    if (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }

    return reportData;
  }

  /**
   * Update next run date for scheduled report
   */
  private async updateNextRunDate(
    scheduleId: string,
    frequency: string
  ): Promise<void> {
    const nextRunDate = this.calculateNextRunDate(new Date(), frequency);

    await this.supabase
      .from('report_schedules')
      .update({ next_run_date: nextRunDate.toISOString() })
      .eq('id', scheduleId);
  }

  /**
   * Calculate next run date based on frequency
   */
  private calculateNextRunDate(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  /**
   * Compress file for optimization
   */
  private async compressFile(fileResult: {
    filePath: string;
    fileSize: number;
    downloadUrl: string;
  }): Promise<{ filePath: string; fileSize: number; downloadUrl: string }> {
    const { data: compressedResult, error } = await this.supabase.rpc(
      'compress_file',
      {
        file_path: fileResult.filePath,
      }
    );

    if (error) {
      throw new Error(`File compression failed: ${error.message}`);
    }

    return compressedResult;
  }

  /**
   * Password protect file
   */
  private async passwordProtectFile(
    fileResult: { filePath: string; fileSize: number; downloadUrl: string },
    password: string
  ): Promise<{ filePath: string; fileSize: number; downloadUrl: string }> {
    const { data: protectedResult, error } = await this.supabase.rpc(
      'password_protect_file',
      {
        file_path: fileResult.filePath,
        password,
      }
    );

    if (error) {
      throw new Error(`Password protection failed: ${error.message}`);
    }

    return protectedResult;
  }
}
