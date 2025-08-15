import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';

// Types and Schemas
export const WidgetPositionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  w: z.number().min(1).max(12),
  h: z.number().min(1).max(12),
  minW: z.number().min(1).optional(),
  minH: z.number().min(1).optional(),
  maxW: z.number().max(12).optional(),
  maxH: z.number().max(12).optional(),
  static: z.boolean().default(false),
  isDraggable: z.boolean().default(true),
  isResizable: z.boolean().default(true),
});

export const WidgetConfigSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['kpi', 'chart', 'table', 'metric', 'alert', 'custom']),
  title: z.string().min(1).max(255),
  dataSource: z.string().min(1),
  refreshInterval: z.number().min(30).max(3600).default(300), // 30s to 1h
  config: z.record(z.any()),
  position: WidgetPositionSchema,
  permissions: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DashboardLayoutSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  layout: z.object({
    breakpoints: z.record(z.number()).default({
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0,
    }),
    cols: z.record(z.number()).default({
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2,
    }),
    rowHeight: z.number().min(30).default(60),
    margin: z.tuple([z.number(), z.number()]).default([10, 10]),
    containerPadding: z.tuple([z.number(), z.number()]).default([10, 10]),
    compactType: z.enum(['vertical', 'horizontal', null]).default('vertical'),
    preventCollision: z.boolean().default(false),
  }),
  widgets: z.array(WidgetConfigSchema),
  filters: z.record(z.any()).default({}),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type WidgetPosition = z.infer<typeof WidgetPositionSchema>;
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

// Dashboard Layout Engine Class
export class DashboardLayoutEngine {
  private readonly supabase = createClient();
  private readonly cache = new Map<string, DashboardLayout>();
  private readonly cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get dashboard layout by ID with caching
   */
  async getDashboardLayout(
    dashboardId: string
  ): Promise<DashboardLayout | null> {
    try {
      // Check cache first
      const cached = this.getCachedLayout(dashboardId);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('executive_dashboards')
        .select(
          `
          *,
          widgets:dashboard_widgets(*)
        `
        )
        .eq('id', dashboardId)
        .single();

      if (error) {
        logger.error('Error fetching dashboard layout:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      const layout = this.transformDatabaseToLayout(data);
      this.setCachedLayout(dashboardId, layout);

      return layout;
    } catch (error) {
      logger.error('Error in getDashboardLayout:', error);
      return null;
    }
  }

  /**
   * Get all dashboards for a clinic
   */
  async getClinicDashboards(clinicId: string): Promise<DashboardLayout[]> {
    try {
      const { data, error } = await this.supabase
        .from('executive_dashboards')
        .select(
          `
          *,
          widgets:dashboard_widgets(*)
        `
        )
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching clinic dashboards:', error);
        return [];
      }

      return data.map((item) => this.transformDatabaseToLayout(item));
    } catch (error) {
      logger.error('Error in getClinicDashboards:', error);
      return [];
    }
  }

  /**
   * Create new dashboard layout
   */
  async createDashboardLayout(
    layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DashboardLayout | null> {
    try {
      const now = new Date().toISOString();
      const dashboardId = crypto.randomUUID();

      // Create dashboard record
      const { data: dashboardData, error: dashboardError } = await this.supabase
        .from('executive_dashboards')
        .insert({
          id: dashboardId,
          clinic_id: layout.clinicId,
          name: layout.name,
          description: layout.description,
          layout: layout.layout,
          filters: layout.filters,
          is_default: layout.isDefault,
          is_public: layout.isPublic,
          created_by: layout.createdBy,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (dashboardError) {
        logger.error('Error creating dashboard:', dashboardError);
        return null;
      }

      // Create widget records
      if (layout.widgets.length > 0) {
        const widgetInserts = layout.widgets.map((widget) => ({
          id: widget.id,
          dashboard_id: dashboardId,
          widget_type: widget.type,
          title: widget.title,
          config: {
            ...widget.config,
            permissions: widget.permissions,
            isVisible: widget.isVisible,
          },
          position: widget.position,
          data_source: widget.dataSource,
          refresh_interval: widget.refreshInterval,
          created_at: now,
          updated_at: now,
        }));

        const { error: widgetsError } = await this.supabase
          .from('dashboard_widgets')
          .insert(widgetInserts);

        if (widgetsError) {
          logger.error('Error creating widgets:', widgetsError);
          // Rollback dashboard creation
          await this.supabase
            .from('executive_dashboards')
            .delete()
            .eq('id', dashboardId);
          return null;
        }
      }

      const newLayout: DashboardLayout = {
        ...layout,
        id: dashboardId,
        createdAt: now,
        updatedAt: now,
      };

      this.setCachedLayout(dashboardId, newLayout);
      return newLayout;
    } catch (error) {
      logger.error('Error in createDashboardLayout:', error);
      return null;
    }
  }

  /**
   * Update dashboard layout
   */
  async updateDashboardLayout(
    dashboardId: string,
    updates: Partial<Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<DashboardLayout | null> {
    try {
      const now = new Date().toISOString();

      // Update dashboard record
      const dashboardUpdates: any = {
        updated_at: now,
      };

      if (updates.name) {
        dashboardUpdates.name = updates.name;
      }
      if (updates.description !== undefined) {
        dashboardUpdates.description = updates.description;
      }
      if (updates.layout) {
        dashboardUpdates.layout = updates.layout;
      }
      if (updates.filters) {
        dashboardUpdates.filters = updates.filters;
      }
      if (updates.isDefault !== undefined) {
        dashboardUpdates.is_default = updates.isDefault;
      }
      if (updates.isPublic !== undefined) {
        dashboardUpdates.is_public = updates.isPublic;
      }

      const { error: dashboardError } = await this.supabase
        .from('executive_dashboards')
        .update(dashboardUpdates)
        .eq('id', dashboardId);

      if (dashboardError) {
        logger.error('Error updating dashboard:', dashboardError);
        return null;
      }

      // Update widgets if provided
      if (updates.widgets) {
        // Delete existing widgets
        await this.supabase
          .from('dashboard_widgets')
          .delete()
          .eq('dashboard_id', dashboardId);

        // Insert new widgets
        if (updates.widgets.length > 0) {
          const widgetInserts = updates.widgets.map((widget) => ({
            id: widget.id,
            dashboard_id: dashboardId,
            widget_type: widget.type,
            title: widget.title,
            config: {
              ...widget.config,
              permissions: widget.permissions,
              isVisible: widget.isVisible,
            },
            position: widget.position,
            data_source: widget.dataSource,
            refresh_interval: widget.refreshInterval,
            created_at: widget.createdAt,
            updated_at: now,
          }));

          const { error: widgetsError } = await this.supabase
            .from('dashboard_widgets')
            .insert(widgetInserts);

          if (widgetsError) {
            logger.error('Error updating widgets:', widgetsError);
            return null;
          }
        }
      }

      // Clear cache and fetch updated layout
      this.clearCachedLayout(dashboardId);
      return await this.getDashboardLayout(dashboardId);
    } catch (error) {
      logger.error('Error in updateDashboardLayout:', error);
      return null;
    }
  }

  /**
   * Delete dashboard layout
   */
  async deleteDashboardLayout(dashboardId: string): Promise<boolean> {
    try {
      // Delete widgets first (cascade should handle this, but being explicit)
      await this.supabase
        .from('dashboard_widgets')
        .delete()
        .eq('dashboard_id', dashboardId);

      // Delete dashboard
      const { error } = await this.supabase
        .from('executive_dashboards')
        .delete()
        .eq('id', dashboardId);

      if (error) {
        logger.error('Error deleting dashboard:', error);
        return false;
      }

      this.clearCachedLayout(dashboardId);
      return true;
    } catch (error) {
      logger.error('Error in deleteDashboardLayout:', error);
      return false;
    }
  }

  /**
   * Update widget position
   */
  async updateWidgetPosition(
    widgetId: string,
    position: WidgetPosition
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('dashboard_widgets')
        .update({
          position,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widgetId);

      if (error) {
        logger.error('Error updating widget position:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateWidgetPosition:', error);
      return false;
    }
  }

  /**
   * Validate layout configuration
   */
  validateLayout(layout: unknown): { isValid: boolean; errors: string[] } {
    try {
      DashboardLayoutSchema.parse(layout);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(
            (err) => `${err.path.join('.')}: ${err.message}`
          ),
        };
      }
      return {
        isValid: false,
        errors: ['Unknown validation error'],
      };
    }
  }

  /**
   * Generate default dashboard layout
   */
  generateDefaultLayout(
    clinicId: string,
    createdBy: string,
    name = 'Dashboard Executivo'
  ): Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date().toISOString();

    return {
      clinicId,
      name,
      description: 'Dashboard executivo padrão com KPIs principais',
      layout: {
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 60,
        margin: [10, 10],
        containerPadding: [10, 10],
        compactType: 'vertical',
        preventCollision: false,
      },
      widgets: [
        {
          id: crypto.randomUUID(),
          type: 'kpi',
          title: 'Receita Mensal',
          dataSource: 'financial.monthly_revenue',
          refreshInterval: 300,
          config: {
            kpiType: 'revenue',
            format: 'currency',
            comparison: 'previous_month',
          },
          position: { x: 0, y: 0, w: 3, h: 2 },
          permissions: ['admin', 'manager'],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: 'kpi',
          title: 'Novos Pacientes',
          dataSource: 'patients.new_patients',
          refreshInterval: 300,
          config: {
            kpiType: 'count',
            format: 'number',
            comparison: 'previous_month',
          },
          position: { x: 3, y: 0, w: 3, h: 2 },
          permissions: ['admin', 'manager'],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: 'kpi',
          title: 'Taxa de Ocupação',
          dataSource: 'operations.occupancy_rate',
          refreshInterval: 300,
          config: {
            kpiType: 'percentage',
            format: 'percent',
            comparison: 'previous_month',
          },
          position: { x: 6, y: 0, w: 3, h: 2 },
          permissions: ['admin', 'manager'],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: 'kpi',
          title: 'Satisfação do Paciente',
          dataSource: 'patients.satisfaction_score',
          refreshInterval: 300,
          config: {
            kpiType: 'score',
            format: 'decimal',
            comparison: 'previous_month',
          },
          position: { x: 9, y: 0, w: 3, h: 2 },
          permissions: ['admin', 'manager'],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: 'chart',
          title: 'Tendência de Receita',
          dataSource: 'financial.revenue_trend',
          refreshInterval: 600,
          config: {
            chartType: 'line',
            period: '12_months',
            showComparison: true,
          },
          position: { x: 0, y: 2, w: 6, h: 4 },
          permissions: ['admin', 'manager'],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: 'chart',
          title: 'Distribuição de Agendamentos',
          dataSource: 'appointments.distribution',
          refreshInterval: 300,
          config: {
            chartType: 'pie',
            period: 'current_month',
            groupBy: 'service_type',
          },
          position: { x: 6, y: 2, w: 6, h: 4 },
          permissions: ['admin', 'manager'],
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      filters: {},
      isDefault: true,
      isPublic: false,
      createdBy,
    };
  }

  // Private helper methods
  private getCachedLayout(dashboardId: string): DashboardLayout | null {
    const expiry = this.cacheExpiry.get(dashboardId);
    if (!expiry || Date.now() > expiry) {
      this.clearCachedLayout(dashboardId);
      return null;
    }
    return this.cache.get(dashboardId) || null;
  }

  private setCachedLayout(dashboardId: string, layout: DashboardLayout): void {
    this.cache.set(dashboardId, layout);
    this.cacheExpiry.set(dashboardId, Date.now() + this.CACHE_TTL);
  }

  private clearCachedLayout(dashboardId: string): void {
    this.cache.delete(dashboardId);
    this.cacheExpiry.delete(dashboardId);
  }

  private transformDatabaseToLayout(data: any): DashboardLayout {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      name: data.name,
      description: data.description,
      layout: data.layout,
      widgets: (data.widgets || []).map((widget: any) => ({
        id: widget.id,
        type: widget.widget_type,
        title: widget.title,
        dataSource: widget.data_source,
        refreshInterval: widget.refresh_interval,
        config: widget.config || {},
        position: widget.position,
        permissions: widget.config?.permissions || [],
        isVisible: widget.config?.isVisible ?? true,
        createdAt: widget.created_at,
        updatedAt: widget.updated_at,
      })),
      filters: data.filters || {},
      isDefault: data.is_default,
      isPublic: data.is_public,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton instance
export const dashboardLayoutEngine = new DashboardLayoutEngine();
