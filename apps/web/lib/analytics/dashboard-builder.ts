// Customizable Dashboard Builder System
// Description: Drag-and-drop dashboard builder with widget library and layout management
// Author: Dev Agent
// Date: 2025-01-26

import { createClient } from '@supabase/supabase-js';
import type {
  DashboardFilters,
  DashboardLayout,
  DashboardTemplate,
  DashboardWidget,
  GridLayout,
} from '@/lib/types/kpi-types';

export interface WidgetLibraryItem {
  id: string;
  type: 'kpi_card' | 'chart' | 'table' | 'alert_panel' | 'summary_stats';
  name: string;
  description: string;
  category:
    | 'overview'
    | 'revenue'
    | 'profitability'
    | 'operational'
    | 'financial_health';
  defaultConfig: DashboardWidget['configuration'];
  requiredKpis: string[];
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  preview?: string;
}

export interface DashboardBuilderState {
  layout: DashboardLayout;
  isDirty: boolean;
  isEditing: boolean;
  selectedWidget?: string;
  draggedWidget?: WidgetLibraryItem;
  gridSettings: GridLayout;
  previewMode: boolean;
}

export class DashboardBuilder {
  private readonly supabase;
  private readonly widgetLibrary: WidgetLibraryItem[];
  private readonly templates: DashboardTemplate[];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.widgetLibrary = this.initializeWidgetLibrary();
    this.templates = [];
  }

  // Dashboard CRUD Operations
  async createDashboard(
    userId: string,
    name: string,
    layoutType:
      | 'kpi_dashboard'
      | 'executive_summary'
      | 'detailed_analysis' = 'kpi_dashboard',
    templateId?: string
  ): Promise<DashboardLayout> {
    try {
      let initialLayout: Partial<DashboardLayout>;

      if (templateId) {
        const template = await this.getTemplate(templateId);
        if (!template) {
          throw new Error('Template not found');
        }

        initialLayout = {
          layout_name: name,
          layout_type: layoutType,
          widget_configuration: template.default_widgets,
          filters: template.default_filters,
          grid_layout: this.getDefaultGridLayout(),
        };
      } else {
        initialLayout = {
          layout_name: name,
          layout_type: layoutType,
          widget_configuration: [],
          filters: this.getDefaultFilters(),
          grid_layout: this.getDefaultGridLayout(),
        };
      }

      const { data, error } = await this.supabase
        .from('dashboard_layouts')
        .insert({
          user_id: userId,
          ...initialLayout,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  async updateDashboard(
    dashboardId: string,
    updates: Partial<DashboardLayout>
  ): Promise<DashboardLayout> {
    try {
      const { data, error } = await this.supabase
        .from('dashboard_layouts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dashboardId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw error;
    }
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('dashboard_layouts')
        .delete()
        .eq('id', dashboardId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw error;
    }
  }

  async getDashboard(dashboardId: string): Promise<DashboardLayout | null> {
    try {
      const { data, error } = await this.supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('id', dashboardId)
        .single();

      if (error) {
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return null;
    }
  }

  async getUserDashboards(
    userId: string,
    filters: {
      layoutType?: string;
      isShared?: boolean;
      search?: string;
    } = {}
  ): Promise<DashboardLayout[]> {
    try {
      let query = this.supabase
        .from('dashboard_layouts')
        .select('*')
        .or(`user_id.eq.${userId},is_shared.eq.true`);

      if (filters.layoutType) {
        query = query.eq('layout_type', filters.layoutType);
      }

      if (filters.isShared !== undefined) {
        query = query.eq('is_shared', filters.isShared);
      }

      if (filters.search) {
        query = query.ilike('layout_name', `%${filters.search}%`);
      }

      const { data, error } = await query.order('updated_at', {
        ascending: false,
      });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching user dashboards:', error);
      return [];
    }
  }

  // Widget Management
  addWidget(
    layout: DashboardLayout,
    widgetType: string,
    position: { x: number; y: number; w: number; h: number },
    kpiIds?: string[],
    config?: Partial<DashboardWidget['configuration']>
  ): DashboardLayout {
    const widgetTemplate = this.widgetLibrary.find(
      (w) => w.type === widgetType
    );
    if (!widgetTemplate) {
      throw new Error('Widget type not found');
    }

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: widgetType as any,
      kpi_ids: kpiIds,
      position,
      configuration: {
        ...widgetTemplate.defaultConfig,
        ...config,
      },
    };

    const updatedLayout = {
      ...layout,
      widget_configuration: [...layout.widget_configuration, newWidget],
    };

    return updatedLayout;
  }

  removeWidget(layout: DashboardLayout, widgetId: string): DashboardLayout {
    return {
      ...layout,
      widget_configuration: layout.widget_configuration.filter(
        (w) => w.id !== widgetId
      ),
    };
  }

  updateWidget(
    layout: DashboardLayout,
    widgetId: string,
    updates: Partial<DashboardWidget>
  ): DashboardLayout {
    return {
      ...layout,
      widget_configuration: layout.widget_configuration.map((widget) =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
    };
  }

  duplicateWidget(layout: DashboardLayout, widgetId: string): DashboardLayout {
    const widget = layout.widget_configuration.find((w) => w.id === widgetId);
    if (!widget) {
      throw new Error('Widget not found');
    }

    const duplicatedWidget: DashboardWidget = {
      ...widget,
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        ...widget.position,
        x: widget.position.x + 1,
        y: widget.position.y + 1,
      },
      configuration: {
        ...widget.configuration,
        title: `${widget.configuration.title || 'Widget'} (Copy)`,
      },
    };

    return {
      ...layout,
      widget_configuration: [...layout.widget_configuration, duplicatedWidget],
    };
  }

  // Grid Layout Management
  updateGridLayout(
    layout: DashboardLayout,
    gridUpdates: Partial<GridLayout>
  ): DashboardLayout {
    return {
      ...layout,
      grid_layout: {
        ...layout.grid_layout,
        ...gridUpdates,
      },
    };
  }

  optimizeLayout(layout: DashboardLayout): DashboardLayout {
    // Auto-arrange widgets to minimize gaps and overlaps
    const widgets = [...layout.widget_configuration];
    const _grid = layout.grid_layout;

    // Sort widgets by y position, then x position
    widgets.sort(
      (a, b) => a.position.y - b.position.y || a.position.x - b.position.x
    );

    let currentY = 0;
    const rowWidgets: DashboardWidget[][] = [];

    // Group widgets by rows
    widgets.forEach((widget) => {
      if (widget.position.y >= currentY + 1) {
        rowWidgets.push([]);
        currentY = widget.position.y;
      }
      rowWidgets.at(-1).push(widget);
    });

    // Reposition widgets to eliminate gaps
    let y = 0;
    const optimizedWidgets: DashboardWidget[] = [];

    rowWidgets.forEach((row) => {
      let x = 0;
      const maxHeight = Math.max(...row.map((w) => w.position.h));

      row.forEach((widget) => {
        optimizedWidgets.push({
          ...widget,
          position: {
            ...widget.position,
            x,
            y,
          },
        });
        x += widget.position.w;
      });

      y += maxHeight;
    });

    return {
      ...layout,
      widget_configuration: optimizedWidgets,
    };
  }

  // Template Management
  async createTemplate(
    name: string,
    description: string,
    category: 'executive' | 'operational' | 'financial' | 'custom',
    layout: DashboardLayout,
    recommendedFor: string[] = []
  ): Promise<DashboardTemplate> {
    const template: DashboardTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      default_widgets: layout.widget_configuration,
      default_filters: layout.filters,
      recommended_for: recommendedFor,
    };

    this.templates.push(template);
    return template;
  }

  async getTemplates(category?: string): Promise<DashboardTemplate[]> {
    if (category) {
      return this.templates.filter((t) => t.category === category);
    }
    return this.templates;
  }

  async getTemplate(templateId: string): Promise<DashboardTemplate | null> {
    return this.templates.find((t) => t.id === templateId) || null;
  }

  // Widget Library
  getWidgetLibrary(category?: string): WidgetLibraryItem[] {
    if (category) {
      return this.widgetLibrary.filter((w) => w.category === category);
    }
    return this.widgetLibrary;
  }

  getWidgetTemplate(type: string): WidgetLibraryItem | null {
    return this.widgetLibrary.find((w) => w.type === type) || null;
  }

  // Validation and Compatibility
  validateLayout(layout: DashboardLayout): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for widget overlaps
    const positions = layout.widget_configuration.map((w) => w.position);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (this.doWidgetsOverlap(positions[i], positions[j])) {
          errors.push(`Widgets ${i + 1} and ${j + 1} overlap`);
        }
      }
    }

    // Check widget sizes
    layout.widget_configuration.forEach((widget, index) => {
      const template = this.getWidgetTemplate(widget.type);
      if (template) {
        const { w, h } = widget.position;
        if (w < template.minSize.w || h < template.minSize.h) {
          warnings.push(
            `Widget ${index + 1} is smaller than recommended minimum size`
          );
        }
        if (
          template.maxSize &&
          (w > template.maxSize.w || h > template.maxSize.h)
        ) {
          warnings.push(`Widget ${index + 1} exceeds maximum recommended size`);
        }
      }
    });

    // Check for missing KPIs
    layout.widget_configuration.forEach((widget, index) => {
      const template = this.getWidgetTemplate(widget.type);
      if (
        template &&
        template.requiredKpis.length > 0 &&
        !widget.kpi_ids?.length
      ) {
        errors.push(
          `Widget ${index + 1} (${widget.type}) requires KPI selection`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateKPICompatibility(
    kpiIds: string[],
    widgetType: string
  ): Promise<boolean> {
    try {
      const { data: kpis } = await this.supabase
        .from('financial_kpis')
        .select('kpi_category')
        .in('id', kpiIds);

      const template = this.getWidgetTemplate(widgetType);
      if (!template) {
        return false;
      }

      // Check if KPI categories are compatible with widget type
      const categories = kpis?.map((k) => k.kpi_category) || [];
      return this.areKPICategoriesCompatible(categories, widgetType);
    } catch (error) {
      console.error('Error validating KPI compatibility:', error);
      return false;
    }
  }

  // Performance Optimization
  calculateLayoutPerformance(layout: DashboardLayout): {
    widgetCount: number;
    estimatedLoadTime: number;
    complexity: 'low' | 'medium' | 'high';
    recommendations: string[];
  } {
    const widgetCount = layout.widget_configuration.length;
    const chartWidgets = layout.widget_configuration.filter(
      (w) => w.type === 'chart'
    ).length;
    const tableWidgets = layout.widget_configuration.filter(
      (w) => w.type === 'table'
    ).length;

    // Estimate load time based on widget types and count
    let estimatedLoadTime = 200; // Base load time
    estimatedLoadTime += widgetCount * 50;
    estimatedLoadTime += chartWidgets * 150;
    estimatedLoadTime += tableWidgets * 100;

    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (widgetCount > 15 || chartWidgets > 5) {
      complexity = 'high';
    } else if (widgetCount > 8 || chartWidgets > 3) {
      complexity = 'medium';
    }

    const recommendations: string[] = [];
    if (widgetCount > 20) {
      recommendations.push(
        'Consider splitting into multiple dashboards for better performance'
      );
    }
    if (chartWidgets > 6) {
      recommendations.push('Too many charts may impact load time');
    }
    if (tableWidgets > 3) {
      recommendations.push('Consider pagination for table widgets');
    }

    return {
      widgetCount,
      estimatedLoadTime,
      complexity,
      recommendations,
    };
  }

  // Helper Methods
  private doWidgetsOverlap(
    pos1: { x: number; y: number; w: number; h: number },
    pos2: { x: number; y: number; w: number; h: number }
  ): boolean {
    return !(
      pos1.x + pos1.w <= pos2.x ||
      pos2.x + pos2.w <= pos1.x ||
      pos1.y + pos1.h <= pos2.y ||
      pos2.y + pos2.h <= pos1.y
    );
  }

  private areKPICategoriesCompatible(
    categories: string[],
    widgetType: string
  ): boolean {
    const compatibilityMap: Record<string, string[]> = {
      kpi_card: ['revenue', 'profitability', 'operational', 'financial_health'],
      chart: ['revenue', 'profitability', 'operational'],
      table: ['revenue', 'profitability', 'operational', 'financial_health'],
      alert_panel: [
        'revenue',
        'profitability',
        'operational',
        'financial_health',
      ],
      summary_stats: [
        'revenue',
        'profitability',
        'operational',
        'financial_health',
      ],
    };

    const compatibleCategories = compatibilityMap[widgetType] || [];
    return categories.every((category) =>
      compatibleCategories.includes(category)
    );
  }

  private getDefaultGridLayout(): GridLayout {
    return {
      cols: 12,
      rows: 20,
      row_height: 60,
      margin: [10, 10],
      container_padding: [10, 10],
      breakpoints: {
        lg: 1200,
        md: 996,
        sm: 768,
        xs: 480,
        xxs: 0,
      },
      layouts: {},
    };
  }

  private getDefaultFilters(): DashboardFilters {
    return {
      time_period: {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        preset: 'month',
      },
    };
  }

  private initializeWidgetLibrary(): WidgetLibraryItem[] {
    return [
      {
        id: 'kpi_card_revenue',
        type: 'kpi_card',
        name: 'Revenue KPI Card',
        description: 'Display key revenue metrics with trend indicators',
        category: 'revenue',
        defaultConfig: {
          display_format: 'currency',
          comparison_enabled: true,
          chart_type: 'sparkline',
        },
        requiredKpis: [],
        minSize: { w: 2, h: 2 },
        maxSize: { w: 4, h: 3 },
      },
      {
        id: 'chart_revenue_trend',
        type: 'chart',
        name: 'Revenue Trend Chart',
        description: 'Line chart showing revenue trends over time',
        category: 'revenue',
        defaultConfig: {
          chart_type: 'line',
          time_range: 'month',
          drill_down_enabled: true,
        },
        requiredKpis: [],
        minSize: { w: 4, h: 3 },
        maxSize: { w: 8, h: 6 },
      },
      {
        id: 'table_kpi_summary',
        type: 'table',
        name: 'KPI Summary Table',
        description: 'Tabular view of multiple KPIs with sorting and filtering',
        category: 'overview',
        defaultConfig: {
          comparison_enabled: true,
          drill_down_enabled: true,
        },
        requiredKpis: [],
        minSize: { w: 6, h: 4 },
        maxSize: { w: 12, h: 8 },
      },
      {
        id: 'alert_panel',
        type: 'alert_panel',
        name: 'KPI Alerts Panel',
        description: 'Display active alerts and threshold breaches',
        category: 'overview',
        defaultConfig: {},
        requiredKpis: [],
        minSize: { w: 3, h: 3 },
        maxSize: { w: 6, h: 6 },
      },
      {
        id: 'summary_stats',
        type: 'summary_stats',
        name: 'Summary Statistics',
        description: 'High-level summary with key performance indicators',
        category: 'overview',
        defaultConfig: {
          display_format: 'number',
        },
        requiredKpis: [],
        minSize: { w: 4, h: 2 },
        maxSize: { w: 8, h: 4 },
      },
    ];
  }
}

// Export singleton instance
export const dashboardBuilder = new DashboardBuilder();
