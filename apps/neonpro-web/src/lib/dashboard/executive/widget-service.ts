import type { z } from "zod";
import type { createClient } from "@/lib/supabase/client";
import type { logger } from "@/lib/logger";
import type {
  createkpiCalculationService,
  type KPICalculationResult,
} from "./kpi-calculation-service";

// Widget Types and Schemas
export const WidgetTypeSchema = z.enum([
  "kpi_card",
  "line_chart",
  "bar_chart",
  "pie_chart",
  "area_chart",
  "gauge_chart",
  "table",
  "metric_comparison",
  "trend_indicator",
  "alert_list",
]);

export const WidgetDataSourceSchema = z.object({
  type: z.enum(["kpi", "query", "api", "static"]),
  source: z.string(),
  parameters: z.record(z.any()).optional(),
  refreshInterval: z.number().min(30).default(300), // seconds
  cacheEnabled: z.boolean().default(true),
});

export const WidgetConfigurationSchema = z.object({
  id: z.string().uuid(),
  dashboardId: z.string().uuid(),
  clinicId: z.string().uuid(),
  title: z.string().min(1).max(255),
  type: WidgetTypeSchema,
  dataSource: WidgetDataSourceSchema,
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1).max(12),
    height: z.number().min(1).max(12),
  }),
  styling: z
    .object({
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      borderColor: z.string().optional(),
      borderRadius: z.number().optional(),
      padding: z.number().optional(),
      fontSize: z.number().optional(),
    })
    .optional(),
  chartOptions: z
    .object({
      showLegend: z.boolean().default(true),
      showGrid: z.boolean().default(true),
      showTooltip: z.boolean().default(true),
      colors: z.array(z.string()).optional(),
      animation: z.boolean().default(true),
      responsive: z.boolean().default(true),
    })
    .optional(),
  isVisible: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const WidgetDataSchema = z.object({
  widgetId: z.string().uuid(),
  data: z.any(),
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    dataPoints: z.number(),
    status: z.enum(["success", "error", "loading"]),
    errorMessage: z.string().optional(),
  }),
  cacheExpiry: z.string().datetime().optional(),
});

export type WidgetType = z.infer<typeof WidgetTypeSchema>;
export type WidgetDataSource = z.infer<typeof WidgetDataSourceSchema>;
export type WidgetConfiguration = z.infer<typeof WidgetConfigurationSchema>;
export type WidgetData = z.infer<typeof WidgetDataSchema>;

// Widget Service
export class WidgetService {
  private supabase = createClient();
  private dataCache = new Map<string, WidgetData>();
  private refreshTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Get all widgets for a dashboard
   */
  async getDashboardWidgets(dashboardId: string): Promise<WidgetConfiguration[]> {
    try {
      const { data, error } = await this.supabase
        .from("dashboard_widgets")
        .select("*")
        .eq("dashboard_id", dashboardId)
        .eq("is_visible", true)
        .order("position->y", { ascending: true })
        .order("position->x", { ascending: true });

      if (error) {
        logger.error("Error fetching dashboard widgets:", error);
        return [];
      }

      return data.map((widget) => ({
        id: widget.id,
        dashboardId: widget.dashboard_id,
        clinicId: widget.clinic_id,
        title: widget.title,
        type: widget.type,
        dataSource: widget.data_source,
        position: widget.position,
        styling: widget.styling,
        chartOptions: widget.chart_options,
        isVisible: widget.is_visible,
        createdAt: widget.created_at,
        updatedAt: widget.updated_at,
      }));
    } catch (error) {
      logger.error("Error getting dashboard widgets:", error);
      return [];
    }
  }

  /**
   * Create a new widget
   */
  async createWidget(
    widget: Omit<WidgetConfiguration, "id" | "createdAt" | "updatedAt">,
  ): Promise<WidgetConfiguration | null> {
    try {
      const widgetId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("dashboard_widgets")
        .insert({
          id: widgetId,
          dashboard_id: widget.dashboardId,
          clinic_id: widget.clinicId,
          title: widget.title,
          type: widget.type,
          data_source: widget.dataSource,
          position: widget.position,
          styling: widget.styling,
          chart_options: widget.chartOptions,
          is_visible: widget.isVisible,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating widget:", error);
        return null;
      }

      const newWidget: WidgetConfiguration = {
        id: data.id,
        dashboardId: data.dashboard_id,
        clinicId: data.clinic_id,
        title: data.title,
        type: data.type,
        dataSource: data.data_source,
        position: data.position,
        styling: data.styling,
        chartOptions: data.chart_options,
        isVisible: data.is_visible,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Start data refresh for the new widget
      this.startWidgetDataRefresh(newWidget);

      return newWidget;
    } catch (error) {
      logger.error("Error creating widget:", error);
      return null;
    }
  }

  /**
   * Update widget configuration
   */
  async updateWidget(
    widgetId: string,
    updates: Partial<WidgetConfiguration>,
  ): Promise<WidgetConfiguration | null> {
    try {
      const { data, error } = await this.supabase
        .from("dashboard_widgets")
        .update({
          title: updates.title,
          type: updates.type,
          data_source: updates.dataSource,
          position: updates.position,
          styling: updates.styling,
          chart_options: updates.chartOptions,
          is_visible: updates.isVisible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", widgetId)
        .select()
        .single();

      if (error) {
        logger.error("Error updating widget:", error);
        return null;
      }

      const updatedWidget: WidgetConfiguration = {
        id: data.id,
        dashboardId: data.dashboard_id,
        clinicId: data.clinic_id,
        title: data.title,
        type: data.type,
        dataSource: data.data_source,
        position: data.position,
        styling: data.styling,
        chartOptions: data.chart_options,
        isVisible: data.is_visible,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Restart data refresh with new configuration
      this.stopWidgetDataRefresh(widgetId);
      this.startWidgetDataRefresh(updatedWidget);

      return updatedWidget;
    } catch (error) {
      logger.error("Error updating widget:", error);
      return null;
    }
  }

  /**
   * Delete a widget
   */
  async deleteWidget(widgetId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("dashboard_widgets").delete().eq("id", widgetId);

      if (error) {
        logger.error("Error deleting widget:", error);
        return false;
      }

      // Stop data refresh and clear cache
      this.stopWidgetDataRefresh(widgetId);
      this.dataCache.delete(widgetId);

      return true;
    } catch (error) {
      logger.error("Error deleting widget:", error);
      return false;
    }
  }

  /**
   * Get widget data
   */
  async getWidgetData(widgetId: string, forceRefresh = false): Promise<WidgetData | null> {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = this.dataCache.get(widgetId);
        if (cached && cached.cacheExpiry && new Date(cached.cacheExpiry) > new Date()) {
          return cached;
        }
      }

      // Get widget configuration
      const { data: widgetConfig, error } = await this.supabase
        .from("dashboard_widgets")
        .select("*")
        .eq("id", widgetId)
        .single();

      if (error) {
        logger.error("Error fetching widget configuration:", error);
        return null;
      }

      // Fetch data based on data source
      const data = await this.fetchWidgetData(widgetConfig);

      const widgetData: WidgetData = {
        widgetId,
        data,
        metadata: {
          lastUpdated: new Date().toISOString(),
          dataPoints: Array.isArray(data) ? data.length : 1,
          status: "success",
        },
        cacheExpiry: widgetConfig.data_source.cacheEnabled
          ? new Date(Date.now() + widgetConfig.data_source.refreshInterval * 1000).toISOString()
          : undefined,
      };

      // Cache the data
      if (widgetConfig.data_source.cacheEnabled) {
        this.dataCache.set(widgetId, widgetData);
      }

      return widgetData;
    } catch (error) {
      logger.error("Error getting widget data:", error);
      return {
        widgetId,
        data: null,
        metadata: {
          lastUpdated: new Date().toISOString(),
          dataPoints: 0,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Fetch data based on widget data source
   */
  private async fetchWidgetData(widgetConfig: any): Promise<any> {
    const { data_source: dataSource } = widgetConfig;

    switch (dataSource.type) {
      case "kpi":
        return await this.fetchKPIData(
          widgetConfig.clinic_id,
          dataSource.source,
          dataSource.parameters,
        );

      case "query":
        return await this.fetchQueryData(dataSource.source, dataSource.parameters);

      case "api":
        return await this.fetchAPIData(dataSource.source, dataSource.parameters);

      case "static":
        return this.fetchStaticData(dataSource.source);

      default:
        throw new Error(`Unknown data source type: ${dataSource.type}`);
    }
  }

  /**
   * Fetch KPI data
   */
  private async fetchKPIData(clinicId: string, kpiSource: string, parameters?: any): Promise<any> {
    switch (kpiSource) {
      case "all_kpis":
        return await createkpiCalculationService().calculateClinicKPIs(
          clinicId,
          parameters?.periodStart ? new Date(parameters.periodStart) : undefined,
          parameters?.periodEnd ? new Date(parameters.periodEnd) : undefined,
        );

      case "financial_summary":
        const allKPIs = await createkpiCalculationService().calculateClinicKPIs(clinicId);
        return allKPIs.filter((kpi) => kpi.kpi.category === "financial");

      case "operational_summary":
        const operationalKPIs = await createkpiCalculationService().calculateClinicKPIs(clinicId);
        return operationalKPIs.filter((kpi) => kpi.kpi.category === "operational");

      case "patient_summary":
        const patientKPIs = await createkpiCalculationService().calculateClinicKPIs(clinicId);
        return patientKPIs.filter((kpi) => kpi.kpi.category === "patient");

      case "staff_summary":
        const staffKPIs = await createkpiCalculationService().calculateClinicKPIs(clinicId);
        return staffKPIs.filter((kpi) => kpi.kpi.category === "staff");

      default:
        // Fetch specific KPI
        const specificKPIs = await createkpiCalculationService().calculateClinicKPIs(clinicId);
        return specificKPIs.find((kpi) => kpi.kpi.name === kpiSource) || null;
    }
  }

  /**
   * Fetch data using custom query
   */
  private async fetchQueryData(query: string, parameters?: any): Promise<any> {
    try {
      // This would execute a predefined query with parameters
      // For security, only allow predefined queries
      const predefinedQueries = {
        monthly_revenue_trend: `
          SELECT 
            DATE_TRUNC('month', created_at) as month,
            SUM(amount) as revenue
          FROM payments 
          WHERE clinic_id = $1 AND status = 'completed'
            AND created_at >= $2 AND created_at <= $3
          GROUP BY month
          ORDER BY month
        `,
        appointment_status_distribution: `
          SELECT 
            status,
            COUNT(*) as count
          FROM appointments 
          WHERE clinic_id = $1
            AND scheduled_at >= $2 AND scheduled_at <= $3
          GROUP BY status
        `,
        top_services: `
          SELECT 
            s.name,
            COUNT(a.id) as appointment_count,
            SUM(p.amount) as revenue
          FROM appointments a
          JOIN services s ON a.service_id = s.id
          LEFT JOIN payments p ON a.id = p.appointment_id
          WHERE a.clinic_id = $1
            AND a.scheduled_at >= $2 AND a.scheduled_at <= $3
          GROUP BY s.id, s.name
          ORDER BY appointment_count DESC
          LIMIT 10
        `,
      };

      if (!predefinedQueries[query as keyof typeof predefinedQueries]) {
        throw new Error(`Query '${query}' not found`);
      }

      const { data, error } = await this.supabase.rpc("execute_dashboard_query", {
        query_name: query,
        query_params: parameters || {},
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error("Error executing query:", error);
      throw error;
    }
  }

  /**
   * Fetch data from external API
   */
  private async fetchAPIData(apiEndpoint: string, parameters?: any): Promise<any> {
    try {
      // This would call external APIs for additional data
      // Implementation depends on specific API requirements
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters || {}),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Error fetching API data:", error);
      throw error;
    }
  }

  /**
   * Fetch static data
   */
  private fetchStaticData(dataSource: string): any {
    const staticData = {
      sample_chart_data: [
        { name: "Jan", value: 400 },
        { name: "Feb", value: 300 },
        { name: "Mar", value: 600 },
        { name: "Apr", value: 800 },
        { name: "May", value: 500 },
      ],
      sample_kpi_data: {
        revenue: 15000,
        patients: 120,
        appointments: 450,
        satisfaction: 4.8,
      },
    };

    return staticData[dataSource as keyof typeof staticData] || null;
  }

  /**
   * Start automatic data refresh for a widget
   */
  private startWidgetDataRefresh(widget: WidgetConfiguration): void {
    if (!widget.dataSource.refreshInterval || widget.dataSource.refreshInterval <= 0) {
      return;
    }

    const timer = setInterval(async () => {
      try {
        await this.getWidgetData(widget.id, true);
      } catch (error) {
        logger.error(`Error refreshing widget ${widget.id}:`, error);
      }
    }, widget.dataSource.refreshInterval * 1000);

    this.refreshTimers.set(widget.id, timer);
  }

  /**
   * Stop automatic data refresh for a widget
   */
  private stopWidgetDataRefresh(widgetId: string): void {
    const timer = this.refreshTimers.get(widgetId);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(widgetId);
    }
  }

  /**
   * Initialize widgets for a dashboard (start data refresh)
   */
  async initializeDashboardWidgets(dashboardId: string): Promise<void> {
    const widgets = await this.getDashboardWidgets(dashboardId);

    for (const widget of widgets) {
      this.startWidgetDataRefresh(widget);
      // Pre-load data
      await this.getWidgetData(widget.id);
    }
  }

  /**
   * Cleanup widgets (stop all timers)
   */
  cleanup(): void {
    for (const timer of this.refreshTimers.values()) {
      clearInterval(timer);
    }
    this.refreshTimers.clear();
    this.dataCache.clear();
  }

  /**
   * Get widget templates for quick setup
   */
  getWidgetTemplates(): Array<
    Omit<WidgetConfiguration, "id" | "dashboardId" | "clinicId" | "createdAt" | "updatedAt">
  > {
    return [
      {
        title: "Receita Mensal",
        type: "kpi_card",
        dataSource: {
          type: "kpi",
          source: "financial.monthly_revenue",
          refreshInterval: 300,
          cacheEnabled: true,
        },
        position: { x: 0, y: 0, width: 3, height: 2 },
        styling: {
          backgroundColor: "#10b981",
          textColor: "#ffffff",
        },
        isVisible: true,
      },
      {
        title: "Novos Pacientes",
        type: "kpi_card",
        dataSource: {
          type: "kpi",
          source: "patients.new_patients",
          refreshInterval: 300,
          cacheEnabled: true,
        },
        position: { x: 3, y: 0, width: 3, height: 2 },
        styling: {
          backgroundColor: "#3b82f6",
          textColor: "#ffffff",
        },
        isVisible: true,
      },
      {
        title: "Taxa de Ocupação",
        type: "gauge_chart",
        dataSource: {
          type: "kpi",
          source: "operations.occupancy_rate",
          refreshInterval: 300,
          cacheEnabled: true,
        },
        position: { x: 6, y: 0, width: 3, height: 4 },
        chartOptions: {
          showLegend: false,
          showGrid: false,
          colors: ["#10b981", "#f59e0b", "#ef4444"],
        },
        isVisible: true,
      },
      {
        title: "Tendência de Receita",
        type: "line_chart",
        dataSource: {
          type: "query",
          source: "monthly_revenue_trend",
          refreshInterval: 600,
          cacheEnabled: true,
        },
        position: { x: 0, y: 2, width: 6, height: 4 },
        chartOptions: {
          showLegend: true,
          showGrid: true,
          colors: ["#10b981"],
          animation: true,
        },
        isVisible: true,
      },
      {
        title: "Status dos Agendamentos",
        type: "pie_chart",
        dataSource: {
          type: "query",
          source: "appointment_status_distribution",
          refreshInterval: 300,
          cacheEnabled: true,
        },
        position: { x: 9, y: 0, width: 3, height: 4 },
        chartOptions: {
          showLegend: true,
          colors: ["#10b981", "#f59e0b", "#ef4444", "#6b7280"],
        },
        isVisible: true,
      },
    ];
  }
}

// Export singleton instance
export const createwidgetService = () => new WidgetService();
