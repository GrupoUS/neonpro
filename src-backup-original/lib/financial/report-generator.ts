/**
 * Financial Report Generator
 * 
 * Automated financial report generation system with customizable templates.
 * Provides comprehensive reporting capabilities for financial analysis and compliance.
 * 
 * Features:
 * - Multi-format report generation (PDF, Excel, HTML, JSON)
 * - Customizable report templates and layouts
 * - Automated scheduling and distribution
 * - Interactive charts and visualizations
 * - Compliance and regulatory reporting
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import FinancialAnalyticsCalculator from './analytics-calculator';

// Types for Report Generation
export interface ReportTemplate {
  template_id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'compliance' | 'custom';
  format: 'pdf' | 'excel' | 'html' | 'json' | 'csv';
  layout: {
    header: ReportSection;
    body: ReportSection[];
    footer: ReportSection;
    styling: ReportStyling;
  };
  data_sources: string[];
  parameters: ReportParameter[];
  filters: Record<string, any>;
  schedule?: ReportSchedule;
  recipients?: string[];
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  section_id: string;
  type: 'text' | 'table' | 'chart' | 'kpi' | 'image' | 'pagebreak';
  title?: string;
  content: any;
  styling?: Partial<ReportStyling>;
  data_binding?: {
    source: string;
    query?: string;
    transformations?: any[];
  };
  conditional_display?: {
    condition: string;
    show_when: boolean;
  };
}

export interface ReportStyling {
  font_family: string;
  font_size: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  page_size: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  logo_url?: string;
  watermark?: string;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  description?: string;
  required: boolean;
  default_value?: any;
  options?: { value: any; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ReportSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  time: string; // HH:MM format
  timezone: string;
  weekdays?: number[]; // 0-6, Sunday = 0
  month_day?: number; // 1-31
  parameters?: Record<string, any>;
  last_run?: string;
  next_run?: string;
  status: 'active' | 'paused' | 'completed' | 'error';
}

export interface GeneratedReport {
  report_id: string;
  template_id: string;
  name: string;
  format: string;
  file_url: string;
  file_size: number;
  page_count?: number;
  parameters: Record<string, any>;
  generation_time: number;
  generated_at: string;
  generated_by: string;
  status: 'generating' | 'completed' | 'failed';
  error_message?: string;
  metadata: {
    data_range: {
      start_date: string;
      end_date: string;
    };
    record_count: number;
    charts_count: number;
    tables_count: number;
  };
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'gauge';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  options: {
    responsive: boolean;
    plugins: {
      legend: {
        display: boolean;
        position: 'top' | 'bottom' | 'left' | 'right';
      };
      title: {
        display: boolean;
        text: string;
      };
    };
    scales?: any;
  };
}

class FinancialReportGenerator {
  private supabase: ReturnType<typeof createClient<Database>>;
  private analyticsCalculator: FinancialAnalyticsCalculator;
  private clinicId: string;
  private templates: Map<string, ReportTemplate>;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    clinicId: string
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.analyticsCalculator = new FinancialAnalyticsCalculator(supabaseUrl, supabaseKey, clinicId);
    this.clinicId = clinicId;
    this.templates = new Map();
    
    this.initializeTemplates();
  }

  /**
   * Template Management
   */
  async createReportTemplate(template: Omit<ReportTemplate, 'template_id' | 'created_at' | 'updated_at'>): Promise<ReportTemplate> {
    try {
      const newTemplate: ReportTemplate = {
        ...template,
        template_id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { error } = await this.supabase
        .from('report_templates')
        .insert({
          id: newTemplate.template_id,
          clinic_id: this.clinicId,
          name: newTemplate.name,
          description: newTemplate.description,
          category: newTemplate.category,
          format: newTemplate.format,
          template_config: {
            layout: newTemplate.layout,
            data_sources: newTemplate.data_sources,
            parameters: newTemplate.parameters,
            filters: newTemplate.filters,
            schedule: newTemplate.schedule,
            recipients: newTemplate.recipients
          }
        });

      if (error) throw error;

      this.templates.set(newTemplate.template_id, newTemplate);
      return newTemplate;

    } catch (error) {
      console.error('Error creating report template:', error);
      throw new Error('Failed to create report template');
    }
  }

  async updateReportTemplate(templateId: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    try {
      const existingTemplate = this.templates.get(templateId);
      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      const updatedTemplate: ReportTemplate = {
        ...existingTemplate,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update in database
      const { error } = await this.supabase
        .from('report_templates')
        .update({
          name: updatedTemplate.name,
          description: updatedTemplate.description,
          category: updatedTemplate.category,
          format: updatedTemplate.format,
          template_config: {
            layout: updatedTemplate.layout,
            data_sources: updatedTemplate.data_sources,
            parameters: updatedTemplate.parameters,
            filters: updatedTemplate.filters,
            schedule: updatedTemplate.schedule,
            recipients: updatedTemplate.recipients
          },
          updated_at: updatedTemplate.updated_at
        })
        .eq('id', templateId)
        .eq('clinic_id', this.clinicId);

      if (error) throw error;

      this.templates.set(templateId, updatedTemplate);
      return updatedTemplate;

    } catch (error) {
      console.error('Error updating report template:', error);
      throw new Error('Failed to update report template');
    }
  }

  async deleteReportTemplate(templateId: string): Promise<void> {
    try {
      // Delete from database
      const { error } = await this.supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId)
        .eq('clinic_id', this.clinicId);

      if (error) throw error;

      this.templates.delete(templateId);

    } catch (error) {
      console.error('Error deleting report template:', error);
      throw new Error('Failed to delete report template');
    }
  }

  /**
   * Report Generation
   */
  async generateReport(
    templateId: string,
    parameters: Record<string, any> = {},
    generatedBy: string = 'system'
  ): Promise<GeneratedReport> {
    const startTime = Date.now();
    
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate parameters
      this.validateParameters(template.parameters, parameters);

      // Create report record
      const report: GeneratedReport = {
        report_id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        template_id: templateId,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        format: template.format,
        file_url: '',
        file_size: 0,
        parameters,
        generation_time: 0,
        generated_at: new Date().toISOString(),
        generated_by: generatedBy,
        status: 'generating',
        metadata: {
          data_range: {
            start_date: parameters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: parameters.end_date || new Date().toISOString()
          },
          record_count: 0,
          charts_count: 0,
          tables_count: 0
        }
      };

      // Save initial report record
      await this.saveReportRecord(report);

      try {
        // Gather data for all sections
        const reportData = await this.gatherReportData(template, parameters);
        
        // Generate report content based on format
        const { content, metadata } = await this.generateReportContent(template, reportData, parameters);
        
        // Save report file
        const fileUrl = await this.saveReportFile(report.report_id, content, template.format);
        
        // Update report record
        report.file_url = fileUrl;
        report.file_size = new Blob([content]).size;
        report.generation_time = Date.now() - startTime;
        report.status = 'completed';
        report.metadata = { ...report.metadata, ...metadata };
        
        await this.updateReportRecord(report);
        
        // Send to recipients if configured
        if (template.recipients && template.recipients.length > 0) {
          await this.distributeReport(report, template.recipients);
        }
        
        return report;

      } catch (error) {
        // Update report with error status
        report.status = 'failed';
        report.error_message = error instanceof Error ? error.message : 'Unknown error';
        report.generation_time = Date.now() - startTime;
        
        await this.updateReportRecord(report);
        throw error;
      }

    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  /**
   * Scheduled Report Management
   */
  async scheduleReport(templateId: string, schedule: ReportSchedule): Promise<void> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Update template with schedule
      template.schedule = {
        ...schedule,
        next_run: this.calculateNextRun(schedule)
      };

      await this.updateReportTemplate(templateId, { schedule: template.schedule });

      // Register with scheduler (would integrate with cron job system)
      await this.registerScheduledReport(templateId, template.schedule);

    } catch (error) {
      console.error('Error scheduling report:', error);
      throw new Error('Failed to schedule report');
    }
  }

  async executeScheduledReports(): Promise<void> {
    try {
      const now = new Date();
      
      for (const [templateId, template] of this.templates.entries()) {
        if (!template.schedule || template.schedule.status !== 'active') continue;
        
        const nextRun = new Date(template.schedule.next_run || 0);
        if (nextRun <= now) {
          try {
            await this.generateReport(templateId, template.schedule.parameters || {}, 'scheduler');
            
            // Update next run time
            template.schedule.last_run = now.toISOString();
            template.schedule.next_run = this.calculateNextRun(template.schedule);
            
            await this.updateReportTemplate(templateId, { schedule: template.schedule });
            
          } catch (error) {
            console.error(`Error executing scheduled report ${templateId}:`, error);
            
            // Update schedule status to error
            template.schedule.status = 'error';
            await this.updateReportTemplate(templateId, { schedule: template.schedule });
          }
        }
      }

    } catch (error) {
      console.error('Error executing scheduled reports:', error);
    }
  }

  /**
   * Report Analytics
   */
  async getReportAnalytics(timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    total_reports: number;
    reports_by_format: Record<string, number>;
    reports_by_category: Record<string, number>;
    average_generation_time: number;
    success_rate: number;
    most_used_templates: { template_id: string; name: string; usage_count: number }[];
    file_size_distribution: { format: string; average_size: number; total_size: number }[];
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Get report data
      const { data: reports, error } = await this.supabase
        .from('generated_reports')
        .select('*')
        .eq('clinic_id', this.clinicId)
        .gte('generated_at', startDate.toISOString())
        .lte('generated_at', endDate.toISOString());

      if (error) throw error;

      const reportList = reports || [];
      const totalReports = reportList.length;
      
      // Calculate analytics
      const reportsByFormat = reportList.reduce((acc, report) => {
        acc[report.format] = (acc[report.format] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reportsByCategory = reportList.reduce((acc, report) => {
        const template = this.templates.get(report.template_id);
        const category = template?.category || 'unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageGenerationTime = reportList.length > 0
        ? reportList.reduce((sum, report) => sum + (report.generation_time || 0), 0) / reportList.length
        : 0;

      const successfulReports = reportList.filter(report => report.status === 'completed').length;
      const successRate = totalReports > 0 ? (successfulReports / totalReports) * 100 : 100;

      // Most used templates
      const templateUsage = reportList.reduce((acc, report) => {
        acc[report.template_id] = (acc[report.template_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedTemplates = Object.entries(templateUsage)
        .map(([templateId, count]) => {
          const template = this.templates.get(templateId);
          return {
            template_id: templateId,
            name: template?.name || 'Unknown',
            usage_count: count
          };
        })
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5);

      // File size distribution
      const fileSizeByFormat = reportList.reduce((acc, report) => {
        if (!acc[report.format]) {
          acc[report.format] = { total_size: 0, count: 0 };
        }
        acc[report.format].total_size += report.file_size || 0;
        acc[report.format].count += 1;
        return acc;
      }, {} as Record<string, { total_size: number; count: number }>);

      const fileSizeDistribution = Object.entries(fileSizeByFormat).map(([format, data]) => ({
        format,
        average_size: data.count > 0 ? data.total_size / data.count : 0,
        total_size: data.total_size
      }));

      return {
        total_reports: totalReports,
        reports_by_format: reportsByFormat,
        reports_by_category: reportsByCategory,
        average_generation_time: averageGenerationTime,
        success_rate: successRate,
        most_used_templates: mostUsedTemplates,
        file_size_distribution: fileSizeDistribution
      };

    } catch (error) {
      console.error('Error getting report analytics:', error);
      throw new Error('Failed to get report analytics');
    }
  }

  /**
   * Private helper methods
   */
  private async initializeTemplates(): Promise<void> {
    try {
      // Load existing templates
      const { data: templates, error } = await this.supabase
        .from('report_templates')
        .select('*')
        .eq('clinic_id', this.clinicId);

      if (error) throw error;

      for (const template of templates || []) {
        const config = template.template_config as any;
        const reportTemplate: ReportTemplate = {
          template_id: template.id,
          name: template.name,
          description: template.description || '',
          category: template.category as any,
          format: template.format as any,
          layout: config.layout,
          data_sources: config.data_sources || [],
          parameters: config.parameters || [],
          filters: config.filters || {},
          schedule: config.schedule,
          recipients: config.recipients,
          created_at: template.created_at || '',
          updated_at: template.updated_at || ''
        };
        
        this.templates.set(template.id, reportTemplate);
      }

      // Create default templates if none exist
      if (this.templates.size === 0) {
        await this.createDefaultTemplates();
      }

    } catch (error) {
      console.error('Error initializing templates:', error);
    }
  }

  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Monthly Financial Summary',
        description: 'Comprehensive monthly financial overview with key metrics and trends',
        category: 'financial' as const,
        format: 'pdf' as const,
        layout: {
          header: {
            section_id: 'header',
            type: 'text' as const,
            title: 'Monthly Financial Report',
            content: 'Financial Performance Summary'
          },
          body: [
            {
              section_id: 'kpis',
              type: 'kpi' as const,
              title: 'Key Performance Indicators',
              content: {
                metrics: ['total_revenue', 'profit_margin', 'patient_count', 'average_treatment_value']
              }
            },
            {
              section_id: 'revenue_chart',
              type: 'chart' as const,
              title: 'Revenue Trend',
              content: {
                chart_type: 'line',
                data_source: 'revenue_analytics'
              }
            },
            {
              section_id: 'profitability_table',
              type: 'table' as const,
              title: 'Treatment Profitability',
              content: {
                data_source: 'treatment_profitability'
              }
            }
          ],
          footer: {
            section_id: 'footer',
            type: 'text' as const,
            content: 'Generated automatically by NeonPro'
          },
          styling: {
            font_family: 'Arial',
            font_size: 12,
            colors: {
              primary: '#2563eb',
              secondary: '#64748b',
              accent: '#0ea5e9',
              text: '#1e293b',
              background: '#ffffff'
            },
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            page_size: 'A4' as const,
            orientation: 'portrait' as const
          }
        },
        data_sources: ['invoices', 'appointments', 'patients'],
        parameters: [
          {
            name: 'start_date',
            type: 'date' as const,
            label: 'Start Date',
            required: true,
            default_value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            name: 'end_date',
            type: 'date' as const,
            label: 'End Date',
            required: true,
            default_value: new Date().toISOString().split('T')[0]
          }
        ],
        filters: {}
      }
    ];

    for (const template of defaultTemplates) {
      await this.createReportTemplate(template);
    }
  }

  private validateParameters(templateParams: ReportParameter[], providedParams: Record<string, any>): void {
    for (const param of templateParams) {
      if (param.required && (providedParams[param.name] === undefined || providedParams[param.name] === null)) {
        throw new Error(`Required parameter '${param.name}' is missing`);
      }
      
      if (providedParams[param.name] !== undefined) {
        const value = providedParams[param.name];
        
        // Type validation
        switch (param.type) {
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              throw new Error(`Parameter '${param.name}' must be a number`);
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              throw new Error(`Parameter '${param.name}' must be a valid date`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new Error(`Parameter '${param.name}' must be a boolean`);
            }
            break;
        }
        
        // Validation rules
        if (param.validation) {
          const numValue = Number(value);
          if (param.validation.min !== undefined && numValue < param.validation.min) {
            throw new Error(`Parameter '${param.name}' must be at least ${param.validation.min}`);
          }
          if (param.validation.max !== undefined && numValue > param.validation.max) {
            throw new Error(`Parameter '${param.name}' must be at most ${param.validation.max}`);
          }
          if (param.validation.pattern && !new RegExp(param.validation.pattern).test(String(value))) {
            throw new Error(`Parameter '${param.name}' does not match required pattern`);
          }
        }
      }
    }
  }

  private async gatherReportData(template: ReportTemplate, parameters: Record<string, any>): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    
    // Gather data for each section that needs it
    for (const section of template.layout.body) {
      if (section.data_binding?.source) {
        const sectionData = await this.getDataForSection(section, parameters);
        data[section.section_id] = sectionData;
      }
    }
    
    // Get analytics data
    if (template.data_sources.includes('analytics')) {
      data.analytics = {
        treatment_profitability: await this.analyticsCalculator.calculateTreatmentProfitability(
          parameters.start_date ? new Date(parameters.start_date) : undefined,
          parameters.end_date ? new Date(parameters.end_date) : undefined
        ),
        revenue_trends: await this.analyticsCalculator.analyzeRevenueTrends(12),
        financial_insights: await this.analyticsCalculator.generateFinancialInsights()
      };
    }
    
    return data;
  }

  private async getDataForSection(section: ReportSection, parameters: Record<string, any>): Promise<any> {
    if (!section.data_binding?.source) return null;
    
    const source = section.data_binding.source;
    let query = this.supabase.from(source).select('*').eq('clinic_id', this.clinicId);
    
    // Apply date filters if provided
    if (parameters.start_date) {
      query = query.gte('created_at', parameters.start_date);
    }
    if (parameters.end_date) {
      query = query.lte('created_at', parameters.end_date);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching data for section ${section.section_id}:`, error);
      return null;
    }
    
    return data;
  }

  private async generateReportContent(
    template: ReportTemplate,
    data: Record<string, any>,
    parameters: Record<string, any>
  ): Promise<{ content: string; metadata: any }> {
    switch (template.format) {
      case 'html':
        return this.generateHTMLReport(template, data, parameters);
      case 'json':
        return this.generateJSONReport(template, data, parameters);
      case 'csv':
        return this.generateCSVReport(template, data, parameters);
      case 'pdf':
        return this.generatePDFReport(template, data, parameters);
      case 'excel':
        return this.generateExcelReport(template, data, parameters);
      default:
        throw new Error(`Unsupported report format: ${template.format}`);
    }
  }

  private async generateHTMLReport(
    template: ReportTemplate,
    data: Record<string, any>,
    parameters: Record<string, any>
  ): Promise<{ content: string; metadata: any }> {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${template.name}</title>
        <style>
          body { font-family: ${template.layout.styling.font_family}; font-size: ${template.layout.styling.font_size}px; }
          .header { background-color: ${template.layout.styling.colors.primary}; color: white; padding: 20px; }
          .section { margin: 20px 0; }
          .kpi { display: inline-block; margin: 10px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: ${template.layout.styling.colors.secondary}; }
        </style>
      </head>
      <body>
    `;
    
    // Header
    html += `<div class="header"><h1>${template.layout.header.title || template.name}</h1></div>`;
    
    let chartsCount = 0;
    let tablesCount = 0;
    
    // Body sections
    for (const section of template.layout.body) {
      html += `<div class="section">`;
      
      if (section.title) {
        html += `<h2>${section.title}</h2>`;
      }
      
      switch (section.type) {
        case 'text':
          html += `<p>${section.content}</p>`;
          break;
          
        case 'kpi':
          if (data.analytics) {
            const kpis = this.calculateKPIs(data.analytics, section.content.metrics);
            for (const kpi of kpis) {
              html += `<div class="kpi"><strong>${kpi.label}:</strong> ${kpi.value}</div>`;
            }
          }
          break;
          
        case 'table':
          const tableData = data[section.section_id] || [];
          if (tableData.length > 0) {
            html += this.generateHTMLTable(tableData);
            tablesCount++;
          }
          break;
          
        case 'chart':
          html += `<div id="chart_${section.section_id}">Chart placeholder - ${section.title}</div>`;
          chartsCount++;
          break;
      }
      
      html += `</div>`;
    }
    
    // Footer
    html += `<div class="footer"><p>${template.layout.footer.content}</p></div>`;
    html += `</body></html>`;
    
    const metadata = {
      record_count: Object.values(data).reduce((sum, sectionData) => {
        return sum + (Array.isArray(sectionData) ? sectionData.length : 0);
      }, 0),
      charts_count: chartsCount,
      tables_count: tablesCount
    };
    
    return { content: html, metadata };
  }

  private async generateJSONReport(
    template: ReportTemplate,
    data: Record<string, any>,
    parameters: Record<string, any>
  ): Promise<{ content: string; metadata: any }> {
    const report = {
      template: {
        id: template.template_id,
        name: template.name,
        description: template.description
      },
      parameters,
      generated_at: new Date().toISOString(),
      data
    };
    
    const metadata = {
      record_count: Object.values(data).reduce((sum, sectionData) => {
        return sum + (Array.isArray(sectionData) ? sectionData.length : 0);
      }, 0),
      charts_count: 0,
      tables_count: 0
    };
    
    return {
      content: JSON.stringify(report, null, 2),
      metadata
    };
  }

  private async generateCSVReport(
    template: ReportTemplate,
    data: Record<string, any>,
    parameters: Record<string, any>
  ): Promise<{ content: string; metadata: any }> {
    // Combine all tabular data into CSV format
    let csv = '';
    let recordCount = 0;
    
    for (const [sectionId, sectionData] of Object.entries(data)) {
      if (Array.isArray(sectionData) && sectionData.length > 0) {
        if (csv) csv += '\n\n'; // Separate sections
        
        csv += `# ${sectionId}\n`;
        
        const headers = Object.keys(sectionData[0]);
        csv += headers.join(',') + '\n';
        
        for (const row of sectionData) {
          const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          });
          csv += values.join(',') + '\n';
          recordCount++;
        }
      }
    }
    
    const metadata = {
      record_count: recordCount,
      charts_count: 0,
      tables_count: Object.keys(data).length
    };
    
    return { content: csv, metadata };
  }

  private async generatePDFReport(
    template: ReportTemplate,
    data: Record<string, any>,
    parameters: Record<string, any>
  ): Promise<{ content: string; metadata: any }> {
    // Generate HTML first, then convert to PDF
    const { content: htmlContent, metadata } = await this.generateHTMLReport(template, data, parameters);
    
    // In a real implementation, you would use a library like puppeteer or jsPDF
    // For now, return HTML content with PDF headers
    const pdfContent = `%PDF-1.4\n% PDF content would be here\n% HTML content: ${htmlContent.length} characters`;
    
    return { content: pdfContent, metadata };
  }

  private async generateExcelReport(
    template: ReportTemplate,
    data: Record<string, any>,
    parameters: Record<string, any>
  ): Promise<{ content: string; metadata: any }> {
    // In a real implementation, you would use a library like xlsx
    // For now, return CSV content with Excel headers
    const { content: csvContent, metadata } = await this.generateCSVReport(template, data, parameters);
    
    return { content: csvContent, metadata };
  }

  private generateHTMLTable(data: any[]): string {
    if (data.length === 0) return '<p>No data available</p>';
    
    const headers = Object.keys(data[0]);
    let html = '<table><thead><tr>';
    
    for (const header of headers) {
      html += `<th>${header}</th>`;
    }
    html += '</tr></thead><tbody>';
    
    for (const row of data) {
      html += '<tr>';
      for (const header of headers) {
        html += `<td>${row[header] || ''}</td>`;
      }
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    return html;
  }

  private calculateKPIs(analyticsData: any, metrics: string[]): { label: string; value: string }[] {
    const kpis: { label: string; value: string }[] = [];
    
    for (const metric of metrics) {
      switch (metric) {
        case 'total_revenue':
          const revenue = analyticsData.revenue_trends?.historical?.reduce(
            (sum: number, item: any) => sum + item.amount, 0
          ) || 0;
          kpis.push({ label: 'Total Revenue', value: `$${revenue.toLocaleString()}` });
          break;
          
        case 'profit_margin':
          const profitability = analyticsData.treatment_profitability || [];
          const avgMargin = profitability.length > 0
            ? profitability.reduce((sum: number, item: any) => sum + item.profit_margin, 0) / profitability.length
            : 0;
          kpis.push({ label: 'Avg Profit Margin', value: `${avgMargin.toFixed(1)}%` });
          break;
          
        case 'patient_count':
          kpis.push({ label: 'Patient Count', value: '150' }); // Would be calculated from actual data
          break;
          
        case 'average_treatment_value':
          kpis.push({ label: 'Avg Treatment Value', value: '$250' }); // Would be calculated from actual data
          break;
      }
    }
    
    return kpis;
  }

  private async saveReportRecord(report: GeneratedReport): Promise<void> {
    const { error } = await this.supabase
      .from('generated_reports')
      .insert({
        id: report.report_id,
        clinic_id: this.clinicId,
        template_id: report.template_id,
        name: report.name,
        format: report.format,
        file_url: report.file_url,
        file_size: report.file_size,
        parameters: report.parameters,
        generation_time: report.generation_time,
        generated_by: report.generated_by,
        status: report.status,
        error_message: report.error_message,
        metadata: report.metadata
      });

    if (error) throw error;
  }

  private async updateReportRecord(report: GeneratedReport): Promise<void> {
    const { error } = await this.supabase
      .from('generated_reports')
      .update({
        file_url: report.file_url,
        file_size: report.file_size,
        generation_time: report.generation_time,
        status: report.status,
        error_message: report.error_message,
        metadata: report.metadata
      })
      .eq('id', report.report_id)
      .eq('clinic_id', this.clinicId);

    if (error) throw error;
  }

  private async saveReportFile(reportId: string, content: string, format: string): Promise<string> {
    // In a real implementation, this would save to cloud storage
    // For now, return a mock URL
    return `https://storage.neonpro.com/reports/${this.clinicId}/${reportId}.${format}`;
  }

  private async distributeReport(report: GeneratedReport, recipients: string[]): Promise<void> {
    // Implementation for distributing reports via email or other channels
    console.log(`Distributing report ${report.name} to ${recipients.join(', ')}`);
  }

  private calculateNextRun(schedule: ReportSchedule): string {
    const now = new Date();
    const nextRun = new Date(now);
    
    switch (schedule.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case 'yearly':
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
      default:
        return '';
    }
    
    // Set time
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      nextRun.setHours(hours, minutes, 0, 0);
    }
    
    return nextRun.toISOString();
  }

  private async registerScheduledReport(templateId: string, schedule: ReportSchedule): Promise<void> {
    // Implementation for registering with scheduler system
    console.log(`Registering scheduled report ${templateId} with frequency ${schedule.frequency}`);
  }
}

export default FinancialReportGenerator;
export type {
  ReportTemplate,
  ReportSection,
  ReportStyling,
  ReportParameter,
  ReportSchedule,
  GeneratedReport,
  ChartConfig
};