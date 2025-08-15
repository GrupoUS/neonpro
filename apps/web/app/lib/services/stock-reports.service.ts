/**
 * Story 11.4: Stock Reports Service
 * Serviço para gerenciamento de relatórios de estoque
 */

import type {
  CreateCustomReport,
  CustomStockReport,
  ReportFilters,
  ReportType,
  StockPerformanceMetrics,
} from '@/app/lib/types/stock-alerts';
import { createClient } from '@/app/utils/supabase/server';

export class StockReportsService {
  private async getSupabase() {
    return await createClient();
  }

  // ==========================================
  // CONFIGURAÇÕES DE RELATÓRIOS
  // ==========================================

  /**
   * Criar novo relatório personalizado
   */
  async createCustomReport(data: CreateCustomReport, user_id: string) {
    try {
      const supabase = await this.getSupabase();
      const { data: report, error } = await supabase
        .from('stock_report_configs')
        .insert({
          ...data,
          user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return { success: true, data: report };
    } catch (error) {
      console.error('Error creating custom report:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Listar relatórios da clínica
   */
  async getClinicReports(
    clinic_id: string,
    filters?: {
      type?: ReportType;
      user_id?: string;
      active_only?: boolean;
    }
  ) {
    try {
      const supabase = await this.getSupabase();
      let query = supabase
        .from('stock_report_configs')
        .select('*')
        .eq('clinic_id', clinic_id)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('report_type', filters.type);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.active_only) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching clinic reports:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Atualizar configuração de relatório
   */
  async updateReportConfig(id: string, updates: Partial<CustomStockReport>) {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('stock_report_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error updating report config:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Deletar configuração de relatório
   */
  async deleteReportConfig(id: string) {
    try {
      const supabase = await this.getSupabase();
      const { error } = await supabase
        .from('stock_report_configs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting report config:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  // ==========================================
  // GERAÇÃO DE RELATÓRIOS
  // ==========================================

  /**
   * Gerar relatório de consumo
   */
  async generateConsumptionReport(clinic_id: string, filters: ReportFilters) {
    try {
      const supabase = await this.getSupabase();

      // Consultar dados de consumo baseado no material_usage
      let query = supabase
        .from('material_usage')
        .select(`
          *,
          profiles:user_id (name, email),
          appointments:appointment_id (
            id,
            appointment_date,
            status
          )
        `)
        .eq('clinic_id', clinic_id);

      // Aplicar filtros de data
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data: usageData, error } = await query;
      if (error) {
        throw error;
      }

      // Processar dados para relatório
      const reportData = {
        title: 'Relatório de Consumo de Materiais',
        generated_at: new Date().toISOString(),
        period: filters.dateRange
          ? {
              start: filters.dateRange.start.toISOString(),
              end: filters.dateRange.end.toISOString(),
            }
          : null,
        total_items: usageData?.length || 0,
        total_cost: this.calculateTotalCost(usageData || []),
        by_category: this.groupByCategory(usageData || []),
        by_user: this.groupByUser(usageData || []),
        by_date: this.groupByDate(usageData || []),
        top_consumed: this.getTopConsumed(usageData || []),
        data: usageData,
      };

      return { success: true, data: reportData };
    } catch (error) {
      console.error('Error generating consumption report:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Gerar relatório de valorização
   */
  async generateValuationReport(_clinic_id: string, filters: ReportFilters) {
    try {
      // Simulação de relatório de valorização
      // Em uma implementação real, isso calcularia o valor atual do estoque

      const reportData = {
        title: 'Relatório de Valorização de Estoque',
        generated_at: new Date().toISOString(),
        period: filters.dateRange
          ? {
              start: filters.dateRange.start.toISOString(),
              end: filters.dateRange.end.toISOString(),
            }
          : null,
        total_value: 50_000, // Simulação
        categories: [
          { name: 'Medicamentos', value: 25_000, percentage: 50 },
          { name: 'Materiais', value: 15_000, percentage: 30 },
          { name: 'Equipamentos', value: 10_000, percentage: 20 },
        ],
        trend: {
          current_month: 50_000,
          previous_month: 48_000,
          variation: 4.17,
          trend: 'up',
        },
      };

      return { success: true, data: reportData };
    } catch (error) {
      console.error('Error generating valuation report:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Gerar relatório de movimentação
   */
  async generateMovementReport(clinic_id: string, filters: ReportFilters) {
    try {
      const supabase = await this.getSupabase();

      // Consultar movimentações
      let query = supabase
        .from('material_usage')
        .select('*')
        .eq('clinic_id', clinic_id);

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data: movements, error } = await query;
      if (error) {
        throw error;
      }

      const reportData = {
        title: 'Relatório de Movimentação de Estoque',
        generated_at: new Date().toISOString(),
        period: filters.dateRange
          ? {
              start: filters.dateRange.start.toISOString(),
              end: filters.dateRange.end.toISOString(),
            }
          : null,
        total_movements: movements?.length || 0,
        by_type: {
          outbound: movements?.length || 0, // Todas são saídas no material_usage
          inbound: 0, // Não temos entradas registradas ainda
        },
        by_category: this.groupByCategory(movements || []),
        daily_movement: this.groupByDate(movements || []),
        data: movements,
      };

      return { success: true, data: reportData };
    } catch (error) {
      console.error('Error generating movement report:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Gerar relatório de vencimentos
   */
  async generateExpirationReport(_clinic_id: string, _filters: ReportFilters) {
    try {
      // Simulação de relatório de vencimentos
      // Em uma implementação real, isso consultaria produtos com datas de vencimento

      const today = new Date();
      const next30Days = new Date();
      next30Days.setDate(today.getDate() + 30);
      const next90Days = new Date();
      next90Days.setDate(today.getDate() + 90);

      const reportData = {
        title: 'Relatório de Produtos Próximos ao Vencimento',
        generated_at: new Date().toISOString(),
        categories: {
          expired: {
            count: 2,
            total_value: 500,
            items: [
              {
                name: 'Medicamento A',
                expiry_date: '2024-12-01',
                quantity: 5,
                value: 250,
              },
              {
                name: 'Material B',
                expiry_date: '2024-11-15',
                quantity: 3,
                value: 250,
              },
            ],
          },
          expiring_30_days: {
            count: 5,
            total_value: 1500,
            items: [
              {
                name: 'Produto C',
                expiry_date: next30Days.toISOString().split('T')[0],
                quantity: 10,
                value: 500,
              },
              {
                name: 'Produto D',
                expiry_date: next30Days.toISOString().split('T')[0],
                quantity: 8,
                value: 400,
              },
              {
                name: 'Produto E',
                expiry_date: next30Days.toISOString().split('T')[0],
                quantity: 12,
                value: 600,
              },
            ],
          },
          expiring_90_days: {
            count: 8,
            total_value: 3200,
            items: [],
          },
        },
        summary: {
          total_items_at_risk: 15,
          total_value_at_risk: 5200,
          recommendations: [
            'Revisar política de compras para produtos com alta rotatividade',
            'Implementar sistema FIFO (First In, First Out)',
            'Considerar promoções para produtos próximos ao vencimento',
          ],
        },
      };

      return { success: true, data: reportData };
    } catch (error) {
      console.error('Error generating expiration report:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  // ==========================================
  // MÉTRICAS DE PERFORMANCE
  // ==========================================

  /**
   * Calcular métricas de performance
   */
  async calculatePerformanceMetrics(
    clinic_id: string,
    date: Date = new Date()
  ) {
    try {
      const supabase = await this.getSupabase();

      // Período de análise (último mês)
      const startDate = new Date(date);
      startDate.setMonth(startDate.getMonth() - 1);

      // Buscar dados de uso
      const { data: usageData, error } = await supabase
        .from('material_usage')
        .select('*')
        .eq('clinic_id', clinic_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', date.toISOString());

      if (error) {
        throw error;
      }

      // Buscar alertas ativos
      const { data: alertsData } = await supabase
        .from('stock_alerts')
        .select('alert_severity, status')
        .eq('clinic_id', clinic_id)
        .eq('status', 'active');

      // Calcular métricas
      const totalValue = this.calculateTotalCost(usageData || []);
      const activeAlerts = alertsData?.length || 0;
      const criticalAlerts =
        alertsData?.filter((a) => a.alert_severity === 'critical').length || 0;

      const metrics: Omit<StockPerformanceMetrics, 'id' | 'createdAt'> = {
        clinicId: clinic_id,
        metricDate: date,
        totalValue,
        turnoverRate: this.calculateTurnoverRate(usageData || []),
        daysCoverage: this.calculateDaysCoverage(usageData || []),
        accuracyPercentage: 95, // Simulação
        wasteValue: totalValue * 0.02, // 2% de desperdício simulado
        wastePercentage: 2,
        activeAlertsCount: activeAlerts,
        criticalAlertsCount: criticalAlerts,
        productsCount: this.getUniqueProductsCount(usageData || []),
        outOfStockCount: 0, // Simulação
        lowStockCount: activeAlerts,
      };

      // Salvar métricas no banco
      const { data: savedMetrics, error: saveError } = await supabase
        .from('stock_metrics')
        .insert({
          ...metrics,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.warn('Could not save metrics to database:', saveError);
      }

      return { success: true, data: metrics };
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Obter histórico de métricas
   */
  async getMetricsHistory(clinic_id: string, days = 30) {
    try {
      const supabase = await this.getSupabase();
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('stock_metrics')
        .select('*')
        .eq('clinic_id', clinic_id)
        .gte('metric_date', since.toISOString())
        .order('metric_date', { ascending: true });

      if (error) {
        throw error;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching metrics history:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  // ==========================================
  // UTILITÁRIOS PRIVADOS
  // ==========================================

  private calculateTotalCost(usageData: any[]): number {
    return usageData.reduce((total, item) => {
      return total + (item.cost_per_unit || 0) * (item.quantity_used || 0);
    }, 0);
  }

  private groupByCategory(usageData: any[]): Record<string, any> {
    const grouped = usageData.reduce(
      (acc, item) => {
        const category = item.material_category || 'Outros';
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            total_cost: 0,
            items: [],
          };
        }
        acc[category].count += 1;
        acc[category].total_cost +=
          (item.cost_per_unit || 0) * (item.quantity_used || 0);
        acc[category].items.push(item);
        return acc;
      },
      {} as Record<string, any>
    );

    return grouped;
  }

  private groupByUser(usageData: any[]): Record<string, any> {
    const grouped = usageData.reduce(
      (acc, item) => {
        const userId = item.user_id || 'Unknown';
        if (!acc[userId]) {
          acc[userId] = {
            count: 0,
            total_cost: 0,
            items: [],
          };
        }
        acc[userId].count += 1;
        acc[userId].total_cost +=
          (item.cost_per_unit || 0) * (item.quantity_used || 0);
        acc[userId].items.push(item);
        return acc;
      },
      {} as Record<string, any>
    );

    return grouped;
  }

  private groupByDate(usageData: any[]): Record<string, any> {
    const grouped = usageData.reduce(
      (acc, item) => {
        const date = item.created_at?.split('T')[0] || 'Unknown';
        if (!acc[date]) {
          acc[date] = {
            count: 0,
            total_cost: 0,
            items: [],
          };
        }
        acc[date].count += 1;
        acc[date].total_cost +=
          (item.cost_per_unit || 0) * (item.quantity_used || 0);
        acc[date].items.push(item);
        return acc;
      },
      {} as Record<string, any>
    );

    return grouped;
  }

  private getTopConsumed(usageData: any[], limit = 10): any[] {
    const grouped = usageData.reduce(
      (acc, item) => {
        const key = `${item.material_name}_${item.material_type}`;
        if (!acc[key]) {
          acc[key] = {
            material_name: item.material_name,
            material_type: item.material_type,
            total_quantity: 0,
            total_cost: 0,
            usage_count: 0,
          };
        }
        acc[key].total_quantity += item.quantity_used || 0;
        acc[key].total_cost +=
          (item.cost_per_unit || 0) * (item.quantity_used || 0);
        acc[key].usage_count += 1;
        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(grouped)
      .sort((a: any, b: any) => b.total_quantity - a.total_quantity)
      .slice(0, limit);
  }

  private calculateTurnoverRate(usageData: any[]): number {
    // Simulação de cálculo de turnover rate
    // Em uma implementação real, seria: (Custo dos Produtos Vendidos / Estoque Médio)
    const totalCost = this.calculateTotalCost(usageData);
    const estimatedStockValue = 50_000; // Simulação
    return totalCost / estimatedStockValue;
  }

  private calculateDaysCoverage(usageData: any[]): number {
    // Simulação de cálculo de cobertura em dias
    // Em uma implementação real, seria baseado no estoque atual vs consumo médio diário
    const dailyAverage = usageData.length / 30; // Assumindo 30 dias
    const estimatedStockQuantity = 1000; // Simulação
    return estimatedStockQuantity / (dailyAverage || 1);
  }

  private getUniqueProductsCount(usageData: any[]): number {
    const uniqueProducts = new Set(
      usageData.map((item) => `${item.material_name}_${item.material_type}`)
    );
    return uniqueProducts.size;
  }
}
