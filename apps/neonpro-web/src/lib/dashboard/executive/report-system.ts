import type { z } from "zod";
import type { createClient } from "@/lib/supabase/client";
import type { logger } from "@/lib/logger";
import type { createkpiCalculationService } from "./kpi-calculation-service";
import type { widgetService } from "./widget-service";

// Report Types and Schemas
export const ReportTypeSchema = z.enum([
  "executive_summary",
  "financial_report",
  "operational_report",
  "patient_analytics",
  "staff_performance",
  "custom_report",
]);

export const ReportFormatSchema = z.enum(["pdf", "excel", "csv", "json"]);
export const ReportFrequencySchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "on_demand",
]);
export const ReportStatusSchema = z.enum([
  "pending",
  "generating",
  "completed",
  "failed",
  "cancelled",
]);

export const ReportTemplateSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: ReportTypeSchema,
  isActive: z.boolean().default(true),
  configuration: z.object({
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        type: z.enum(["kpi_summary", "chart", "table", "text", "image"]),
        dataSource: z.string(),
        parameters: z.record(z.any()).optional(),
        styling: z
          .object({
            fontSize: z.number().optional(),
            fontFamily: z.string().optional(),
            color: z.string().optional(),
            backgroundColor: z.string().optional(),
            padding: z.number().optional(),
            margin: z.number().optional(),
          })
          .optional(),
      }),
    ),
    layout: z.object({
      orientation: z.enum(["portrait", "landscape"]).default("portrait"),
      pageSize: z.enum(["A4", "A3", "Letter", "Legal"]).default("A4"),
      margins: z.object({
        top: z.number().default(20),
        right: z.number().default(20),
        bottom: z.number().default(20),
        left: z.number().default(20),
      }),
      header: z.object({
        enabled: z.boolean().default(true),
        content: z.string().optional(),
        height: z.number().default(50),
      }),
      footer: z.object({
        enabled: z.boolean().default(true),
        content: z.string().optional(),
        height: z.number().default(30),
      }),
    }),
    filters: z
      .object({
        dateRange: z.object({
          enabled: z.boolean().default(true),
          defaultPeriod: z
            .enum(["last_7_days", "last_30_days", "last_quarter", "last_year"])
            .default("last_30_days"),
        }),
        departments: z.array(z.string()).optional(),
        services: z.array(z.string()).optional(),
        staff: z.array(z.string()).optional(),
      })
      .optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ReportScheduleSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(255),
  frequency: ReportFrequencySchema,
  format: ReportFormatSchema,
  isActive: z.boolean().default(true),
  schedule: z.object({
    dayOfWeek: z.number().min(0).max(6).optional(), // For weekly reports
    dayOfMonth: z.number().min(1).max(31).optional(), // For monthly reports
    time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
    timezone: z.string().default("America/Sao_Paulo"),
  }),
  recipients: z.object({
    emails: z.array(z.string().email()),
    includeAttachment: z.boolean().default(true),
    includeLink: z.boolean().default(false),
  }),
  parameters: z.record(z.any()).optional(),
  lastRun: z.string().datetime().optional(),
  nextRun: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ReportInstanceSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  scheduleId: z.string().uuid().optional(),
  clinicId: z.string().uuid(),
  name: z.string(),
  type: ReportTypeSchema,
  format: ReportFormatSchema,
  status: ReportStatusSchema,
  parameters: z.record(z.any()),
  generatedBy: z.string().uuid().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  filePath: z.string().optional(),
  fileSize: z.number().optional(),
  downloadUrl: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  errorMessage: z.string().optional(),
  metadata: z
    .object({
      totalPages: z.number().optional(),
      totalRecords: z.number().optional(),
      generationTime: z.number().optional(), // milliseconds
      dataSourcesUsed: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ReportFormat = z.infer<typeof ReportFormatSchema>;
export type ReportFrequency = z.infer<typeof ReportFrequencySchema>;
export type ReportStatus = z.infer<typeof ReportStatusSchema>;
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;
export type ReportSchedule = z.infer<typeof ReportScheduleSchema>;
export type ReportInstance = z.infer<typeof ReportInstanceSchema>;

// Report System Service
export class ReportSystem {
  private supabase = createClient();
  private schedulerTimer: NodeJS.Timeout | null = null;
  private readonly SCHEDULER_INTERVAL = 60000; // 1 minute
  private isRunning = false;

  /**
   * Start the report system scheduler
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    logger.info("Starting Report System Scheduler...");

    this.schedulerTimer = setInterval(async () => {
      try {
        await this.processScheduledReports();
      } catch (error) {
        logger.error("Error processing scheduled reports:", error);
      }
    }, this.SCHEDULER_INTERVAL);

    logger.info("Report System Scheduler started");
  }

  /**
   * Stop the report system scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    logger.info("Report System Scheduler stopped");
  }

  /**
   * Create a new report template
   */
  async createReportTemplate(
    template: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReportTemplate | null> {
    try {
      const templateId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("report_templates")
        .insert({
          id: templateId,
          clinic_id: template.clinicId,
          name: template.name,
          description: template.description,
          type: template.type,
          is_active: template.isActive,
          configuration: template.configuration,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating report template:", error);
        return null;
      }

      return {
        id: data.id,
        clinicId: data.clinic_id,
        name: data.name,
        description: data.description,
        type: data.type,
        isActive: data.is_active,
        configuration: data.configuration,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      logger.error("Error creating report template:", error);
      return null;
    }
  }

  /**
   * Create a new report schedule
   */
  async createReportSchedule(
    schedule: Omit<ReportSchedule, "id" | "createdAt" | "updatedAt" | "nextRun">,
  ): Promise<ReportSchedule | null> {
    try {
      const scheduleId = crypto.randomUUID();
      const now = new Date().toISOString();
      const nextRun = this.calculateNextRun(schedule.frequency, schedule.schedule);

      const { data, error } = await this.supabase
        .from("report_schedules")
        .insert({
          id: scheduleId,
          template_id: schedule.templateId,
          clinic_id: schedule.clinicId,
          name: schedule.name,
          frequency: schedule.frequency,
          format: schedule.format,
          is_active: schedule.isActive,
          schedule: schedule.schedule,
          recipients: schedule.recipients,
          parameters: schedule.parameters,
          next_run: nextRun,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating report schedule:", error);
        return null;
      }

      return {
        id: data.id,
        templateId: data.template_id,
        clinicId: data.clinic_id,
        name: data.name,
        frequency: data.frequency,
        format: data.format,
        isActive: data.is_active,
        schedule: data.schedule,
        recipients: data.recipients,
        parameters: data.parameters,
        lastRun: data.last_run,
        nextRun: data.next_run,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      logger.error("Error creating report schedule:", error);
      return null;
    }
  }

  /**
   * Generate a report on demand
   */
  async generateReport(
    templateId: string,
    format: ReportFormat,
    parameters: Record<string, any> = {},
    userId?: string,
  ): Promise<ReportInstance | null> {
    try {
      // Get template
      const { data: templateData, error: templateError } = await this.supabase
        .from("report_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError || !templateData) {
        logger.error("Report template not found:", templateError);
        return null;
      }

      const template: ReportTemplate = {
        id: templateData.id,
        clinicId: templateData.clinic_id,
        name: templateData.name,
        description: templateData.description,
        type: templateData.type,
        isActive: templateData.is_active,
        configuration: templateData.configuration,
        createdAt: templateData.created_at,
        updatedAt: templateData.updated_at,
      };

      // Create report instance
      const reportId = crypto.randomUUID();
      const now = new Date().toISOString();

      const reportInstance: Omit<
        ReportInstance,
        | "completedAt"
        | "filePath"
        | "fileSize"
        | "downloadUrl"
        | "expiresAt"
        | "errorMessage"
        | "metadata"
      > = {
        id: reportId,
        templateId: template.id,
        clinicId: template.clinicId,
        name: `${template.name} - ${new Date().toLocaleDateString("pt-BR")}`,
        type: template.type,
        format,
        status: "pending",
        parameters,
        generatedBy: userId,
        startedAt: now,
      };

      // Save to database
      const { error: insertError } = await this.supabase.from("report_instances").insert({
        id: reportInstance.id,
        template_id: reportInstance.templateId,
        clinic_id: reportInstance.clinicId,
        name: reportInstance.name,
        type: reportInstance.type,
        format: reportInstance.format,
        status: reportInstance.status,
        parameters: reportInstance.parameters,
        generated_by: reportInstance.generatedBy,
        started_at: reportInstance.startedAt,
      });

      if (insertError) {
        logger.error("Error creating report instance:", insertError);
        return null;
      }

      // Generate report asynchronously
      this.generateReportAsync(reportInstance, template);

      return {
        ...reportInstance,
        completedAt: undefined,
        filePath: undefined,
        fileSize: undefined,
        downloadUrl: undefined,
        expiresAt: undefined,
        errorMessage: undefined,
        metadata: undefined,
      };
    } catch (error) {
      logger.error("Error generating report:", error);
      return null;
    }
  }

  /**
   * Get report instances for a clinic
   */
  async getReportInstances(clinicId: string, limit = 50): Promise<ReportInstance[]> {
    try {
      const { data, error } = await this.supabase
        .from("report_instances")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Error fetching report instances:", error);
        return [];
      }

      return data.map((report) => ({
        id: report.id,
        templateId: report.template_id,
        scheduleId: report.schedule_id,
        clinicId: report.clinic_id,
        name: report.name,
        type: report.type,
        format: report.format,
        status: report.status,
        parameters: report.parameters,
        generatedBy: report.generated_by,
        startedAt: report.started_at,
        completedAt: report.completed_at,
        filePath: report.file_path,
        fileSize: report.file_size,
        downloadUrl: report.download_url,
        expiresAt: report.expires_at,
        errorMessage: report.error_message,
        metadata: report.metadata,
      }));
    } catch (error) {
      logger.error("Error getting report instances:", error);
      return [];
    }
  }

  /**
   * Process scheduled reports
   */
  private async processScheduledReports(): Promise<void> {
    try {
      const now = new Date();

      const { data: schedules, error } = await this.supabase
        .from("report_schedules")
        .select("*")
        .eq("is_active", true)
        .lte("next_run", now.toISOString());

      if (error) {
        logger.error("Error fetching scheduled reports:", error);
        return;
      }

      for (const scheduleData of schedules) {
        const schedule: ReportSchedule = {
          id: scheduleData.id,
          templateId: scheduleData.template_id,
          clinicId: scheduleData.clinic_id,
          name: scheduleData.name,
          frequency: scheduleData.frequency,
          format: scheduleData.format,
          isActive: scheduleData.is_active,
          schedule: scheduleData.schedule,
          recipients: scheduleData.recipients,
          parameters: scheduleData.parameters,
          lastRun: scheduleData.last_run,
          nextRun: scheduleData.next_run,
          createdAt: scheduleData.created_at,
          updatedAt: scheduleData.updated_at,
        };

        await this.executeScheduledReport(schedule);
      }
    } catch (error) {
      logger.error("Error processing scheduled reports:", error);
    }
  }

  /**
   * Execute a scheduled report
   */
  private async executeScheduledReport(schedule: ReportSchedule): Promise<void> {
    try {
      logger.info(`Executing scheduled report: ${schedule.name}`);

      // Generate the report
      const reportInstance = await this.generateReport(
        schedule.templateId,
        schedule.format,
        schedule.parameters || {},
      );

      if (!reportInstance) {
        logger.error(`Failed to generate scheduled report: ${schedule.name}`);
        return;
      }

      // Update schedule
      const nextRun = this.calculateNextRun(schedule.frequency, schedule.schedule);

      await this.supabase
        .from("report_schedules")
        .update({
          last_run: new Date().toISOString(),
          next_run: nextRun,
        })
        .eq("id", schedule.id);

      // Update report instance with schedule ID
      await this.supabase
        .from("report_instances")
        .update({ schedule_id: schedule.id })
        .eq("id", reportInstance.id);

      logger.info(`Scheduled report executed successfully: ${schedule.name}`);
    } catch (error) {
      logger.error(`Error executing scheduled report ${schedule.name}:`, error);
    }
  }

  /**
   * Generate report asynchronously
   */
  private async generateReportAsync(reportInstance: any, template: ReportTemplate): Promise<void> {
    try {
      // Update status to generating
      await this.supabase
        .from("report_instances")
        .update({ status: "generating" })
        .eq("id", reportInstance.id);

      const startTime = Date.now();

      // Collect data for all sections
      const reportData = await this.collectReportData(template, reportInstance.parameters);

      // Generate the report file
      const filePath = await this.generateReportFile(reportInstance, template, reportData);

      const endTime = Date.now();
      const generationTime = endTime - startTime;

      // Calculate expiry (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Update report instance with completion data
      await this.supabase
        .from("report_instances")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          file_path: filePath,
          expires_at: expiresAt.toISOString(),
          metadata: {
            generationTime,
            totalRecords: this.countTotalRecords(reportData),
            dataSourcesUsed: this.getDataSourcesUsed(template),
          },
        })
        .eq("id", reportInstance.id);

      logger.info(`Report generated successfully: ${reportInstance.name}`);
    } catch (error) {
      logger.error(`Error generating report ${reportInstance.name}:`, error);

      // Update status to failed
      await this.supabase
        .from("report_instances")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", reportInstance.id);
    }
  }

  /**
   * Collect data for report sections
   */
  private async collectReportData(
    template: ReportTemplate,
    parameters: Record<string, any>,
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {};

    for (const section of template.configuration.sections) {
      try {
        switch (section.type) {
          case "kpi_summary":
            data[section.id] = await this.collectKPIData(
              template.clinicId,
              section.dataSource,
              parameters,
            );
            break;

          case "chart":
          case "table":
            data[section.id] = await this.collectChartTableData(
              template.clinicId,
              section.dataSource,
              parameters,
            );
            break;

          case "text":
            data[section.id] = await this.collectTextData(section.dataSource, parameters);
            break;

          default:
            data[section.id] = null;
        }
      } catch (error) {
        logger.error(`Error collecting data for section ${section.id}:`, error);
        data[section.id] = null;
      }
    }

    return data;
  }

  /**
   * Collect KPI data
   */
  private async collectKPIData(
    clinicId: string,
    dataSource: string,
    parameters: Record<string, any>,
  ): Promise<any> {
    const periodStart = parameters.periodStart ? new Date(parameters.periodStart) : undefined;
    const periodEnd = parameters.periodEnd ? new Date(parameters.periodEnd) : undefined;

    switch (dataSource) {
      case "all_kpis":
        return await createkpiCalculationService().calculateClinicKPIs(
          clinicId,
          periodStart,
          periodEnd,
        );

      case "financial_kpis":
        const allKPIs = await createkpiCalculationService().calculateClinicKPIs(
          clinicId,
          periodStart,
          periodEnd,
        );
        return allKPIs.filter((kpi) => kpi.kpi.category === "financial");

      default:
        return [];
    }
  }

  /**
   * Collect chart/table data
   */
  private async collectChartTableData(
    clinicId: string,
    dataSource: string,
    parameters: Record<string, any>,
  ): Promise<any> {
    // This would use the same data sources as widgets
    // For now, return mock data
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Revenue",
          data: [10000, 12000, 15000, 13000, 16000],
        },
      ],
    };
  }

  /**
   * Collect text data
   */
  private async collectTextData(
    dataSource: string,
    parameters: Record<string, any>,
  ): Promise<string> {
    // This would generate dynamic text content
    return `Report generated on ${new Date().toLocaleDateString("pt-BR")}`;
  }

  /**
   * Generate report file
   */
  private async generateReportFile(
    reportInstance: any,
    template: ReportTemplate,
    data: Record<string, any>,
  ): Promise<string> {
    const fileName = `${reportInstance.id}.${reportInstance.format}`;
    const filePath = `/reports/${reportInstance.clinicId}/${fileName}`;

    switch (reportInstance.format) {
      case "pdf":
        return await this.generatePDFReport(filePath, template, data);

      case "excel":
        return await this.generateExcelReport(filePath, template, data);

      case "csv":
        return await this.generateCSVReport(filePath, template, data);

      case "json":
        return await this.generateJSONReport(filePath, template, data);

      default:
        throw new Error(`Unsupported report format: ${reportInstance.format}`);
    }
  }

  /**
   * Generate PDF report
   */
  private async generatePDFReport(
    filePath: string,
    template: ReportTemplate,
    data: Record<string, any>,
  ): Promise<string> {
    // Implementation would use a PDF library like puppeteer, jsPDF, or PDFKit
    logger.info(`Generating PDF report: ${filePath}`);

    // Mock implementation
    return filePath;
  }

  /**
   * Generate Excel report
   */
  private async generateExcelReport(
    filePath: string,
    template: ReportTemplate,
    data: Record<string, any>,
  ): Promise<string> {
    // Implementation would use a library like ExcelJS
    logger.info(`Generating Excel report: ${filePath}`);

    // Mock implementation
    return filePath;
  }

  /**
   * Generate CSV report
   */
  private async generateCSVReport(
    filePath: string,
    template: ReportTemplate,
    data: Record<string, any>,
  ): Promise<string> {
    // Implementation would generate CSV content
    logger.info(`Generating CSV report: ${filePath}`);

    // Mock implementation
    return filePath;
  }

  /**
   * Generate JSON report
   */
  private async generateJSONReport(
    filePath: string,
    template: ReportTemplate,
    data: Record<string, any>,
  ): Promise<string> {
    // Implementation would serialize data to JSON
    logger.info(`Generating JSON report: ${filePath}`);

    // Mock implementation
    return filePath;
  }

  /**
   * Calculate next run time for scheduled report
   */
  private calculateNextRun(frequency: ReportFrequency, schedule: any): string {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(":").map(Number);

    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, move to next occurrence
    if (nextRun <= now) {
      switch (frequency) {
        case "daily":
          nextRun.setDate(nextRun.getDate() + 1);
          break;

        case "weekly":
          nextRun.setDate(nextRun.getDate() + 7);
          break;

        case "monthly":
          nextRun.setMonth(nextRun.getMonth() + 1);
          if (schedule.dayOfMonth) {
            nextRun.setDate(schedule.dayOfMonth);
          }
          break;

        case "quarterly":
          nextRun.setMonth(nextRun.getMonth() + 3);
          break;

        case "yearly":
          nextRun.setFullYear(nextRun.getFullYear() + 1);
          break;
      }
    }

    return nextRun.toISOString();
  }

  /**
   * Count total records in report data
   */
  private countTotalRecords(data: Record<string, any>): number {
    let total = 0;

    for (const value of Object.values(data)) {
      if (Array.isArray(value)) {
        total += value.length;
      }
    }

    return total;
  }

  /**
   * Get data sources used in template
   */
  private getDataSourcesUsed(template: ReportTemplate): string[] {
    return template.configuration.sections.map((section) => section.dataSource);
  }

  /**
   * Get default report templates
   */
  getDefaultTemplates(): Array<
    Omit<ReportTemplate, "id" | "clinicId" | "createdAt" | "updatedAt">
  > {
    return [
      {
        name: "Relatório Executivo Mensal",
        description: "Resumo executivo com principais KPIs e métricas do mês",
        type: "executive_summary",
        isActive: true,
        configuration: {
          sections: [
            {
              id: "financial_summary",
              title: "Resumo Financeiro",
              type: "kpi_summary",
              dataSource: "financial_kpis",
            },
            {
              id: "revenue_trend",
              title: "Tendência de Receita",
              type: "chart",
              dataSource: "monthly_revenue_trend",
            },
            {
              id: "operational_metrics",
              title: "Métricas Operacionais",
              type: "table",
              dataSource: "operational_summary",
            },
          ],
          layout: {
            orientation: "portrait",
            pageSize: "A4",
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            header: { enabled: true, content: "Relatório Executivo", height: 50 },
            footer: { enabled: true, content: "Confidencial", height: 30 },
          },
          filters: {
            dateRange: { enabled: true, defaultPeriod: "last_30_days" },
          },
        },
      },
      {
        name: "Relatório Financeiro Detalhado",
        description: "Análise financeira completa com receitas, custos e margens",
        type: "financial_report",
        isActive: true,
        configuration: {
          sections: [
            {
              id: "revenue_analysis",
              title: "Análise de Receita",
              type: "chart",
              dataSource: "revenue_breakdown",
            },
            {
              id: "cost_analysis",
              title: "Análise de Custos",
              type: "table",
              dataSource: "cost_breakdown",
            },
            {
              id: "profit_margins",
              title: "Margens de Lucro",
              type: "kpi_summary",
              dataSource: "profit_metrics",
            },
          ],
          layout: {
            orientation: "landscape",
            pageSize: "A4",
            margins: { top: 15, right: 15, bottom: 15, left: 15 },
            header: { enabled: true, content: "Relatório Financeiro", height: 40 },
            footer: { enabled: true, content: "Página {page}", height: 25 },
          },
          filters: {
            dateRange: { enabled: true, defaultPeriod: "last_quarter" },
          },
        },
      },
    ];
  }
}

// Export singleton instance
export const createreportSystem = () => new ReportSystem();
