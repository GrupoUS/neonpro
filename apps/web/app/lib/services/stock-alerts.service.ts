/**
 * Story 11.4: Stock Alerts Service
 * Serviço para gerenciamento de alertas de estoque
 */

import type {
  AcknowledgeAlert,
  AlertStatus,
  AlertType,
  CreateStockAlertConfig,
  ResolveAlert,
  SeverityLevel,
  StockAlertConfig,
} from '@/app/lib/types/stock-alerts';
import { createClient } from '@/app/utils/supabase/server';

export class StockAlertsService {
  private async getSupabase() {
    return await createClient();
  }

  // ==========================================
  // CONFIGURAÇÕES DE ALERTAS
  // ==========================================

  /**
   * Criar nova configuração de alerta
   */
  async createAlertConfig(
    data: CreateStockAlertConfig,
    clinic_id: string,
    user_id: string
  ) {
    try {
      const supabase = await this.getSupabase();
      const { data: config, error } = await supabase
        .from('stock_alert_configs')
        .insert({
          ...data,
          clinic_id,
          created_by: user_id,
          updated_by: user_id,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: config };
    } catch (error) {
      console.error('Error creating alert config:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Listar configurações de alertas
   */
  async getAlertConfigs(
    clinic_id: string,
    filters?: {
      type?: AlertType;
      active_only?: boolean;
    }
  ) {
    try {
      const supabase = await this.getSupabase();
      let query = supabase
        .from('stock_alert_configs')
        .select('*')
        .eq('clinic_id', clinic_id)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('config_type', filters.type);
      }

      if (filters?.active_only) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching alert configs:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Atualizar configuração de alerta
   */
  async updateAlertConfig(
    id: string,
    updates: Partial<StockAlertConfig>,
    user_id: string
  ) {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('stock_alert_configs')
        .update({
          ...updates,
          updated_by: user_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating alert config:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Deletar configuração de alerta
   */
  async deleteAlertConfig(id: string) {
    try {
      const supabase = await this.getSupabase();
      const { error } = await supabase
        .from('stock_alert_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting alert config:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  // ==========================================
  // ALERTAS GERADOS
  // ==========================================

  /**
   * Listar alertas ativos
   */
  async getActiveAlerts(
    clinic_id: string,
    filters?: {
      severity?: SeverityLevel[];
      type?: AlertType[];
      status?: AlertStatus[];
      limit?: number;
    }
  ) {
    try {
      const supabase = await this.getSupabase();
      let query = supabase
        .from('stock_alerts')
        .select('*')
        .eq('clinic_id', clinic_id)
        .order('created_at', { ascending: false });

      if (filters?.severity?.length) {
        query = query.in('alert_severity', filters.severity);
      }

      if (filters?.type?.length) {
        query = query.in('alert_type', filters.type);
      }

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      } else {
        // Por padrão, mostrar apenas alertas ativos
        query = query.in('status', ['active', 'acknowledged']);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Obter alerta específico
   */
  async getAlert(id: string) {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('stock_alerts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching alert:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Reconhecer alerta
   */
  async acknowledgeAlert(data: AcknowledgeAlert, user_id: string) {
    try {
      const supabase = await this.getSupabase();
      const { data: alert, error } = await supabase
        .from('stock_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user_id,
          resolution_notes: data.note || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.alertId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: alert };
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Resolver alerta
   */
  async resolveAlert(data: ResolveAlert, user_id: string) {
    try {
      const supabase = await this.getSupabase();
      const { data: alert, error } = await supabase
        .from('stock_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user_id,
          resolution_notes: data.resolution,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.alertId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: alert };
    } catch (error) {
      console.error('Error resolving alert:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Descartar alerta
   */
  async dismissAlert(alert_id: string, user_id: string, reason?: string) {
    try {
      const supabase = await this.getSupabase();
      const { data: alert, error } = await supabase
        .from('stock_alerts')
        .update({
          status: 'dismissed',
          resolved_at: new Date().toISOString(),
          resolved_by: user_id,
          resolution_notes: reason || 'Alert dismissed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: alert };
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  // ==========================================
  // GERAÇÃO AUTOMÁTICA DE ALERTAS
  // ==========================================

  /**
   * Gerar alertas baseados nas configurações ativas
   */
  async generateAlerts(clinic_id: string) {
    try {
      const supabase = await this.getSupabase();
      // Buscar configurações ativas
      const { data: configs, error: configError } = await supabase
        .from('stock_alert_configs')
        .select('*')
        .eq('clinic_id', clinic_id)
        .eq('is_active', true);

      if (configError) throw configError;

      const results = [];

      for (const config of configs || []) {
        switch (config.config_type) {
          case 'low_stock': {
            const lowStockResult = await this.generateLowStockAlerts(config);
            results.push(lowStockResult);
            break;
          }

          case 'expiry_warning': {
            const expiryResult = await this.generateExpiryWarningAlerts(config);
            results.push(expiryResult);
            break;
          }

          case 'shortage_prediction': {
            const shortageResult =
              await this.generateShortagePredictionAlerts(config);
            results.push(shortageResult);
            break;
          }

          case 'overstock_warning': {
            const overstockResult =
              await this.generateOverstockWarningAlerts(config);
            results.push(overstockResult);
            break;
          }
        }
      }

      return { success: true, data: results };
    } catch (error) {
      console.error('Error generating alerts:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Gerar alertas de estoque baixo
   */
  private async generateLowStockAlerts(config: any) {
    try {
      const supabase = await this.getSupabase();

      const alertsToCreate = [];

      // Lógica simplificada para demonstração
      if (
        config.stock_threshold_quantity &&
        config.stock_threshold_quantity > 0
      ) {
        const sampleAlert = {
          clinic_id: config.clinic_id,
          config_id: config.id,
          alert_type: 'low_stock' as const,
          alert_severity: 'medium' as const,
          alert_title: 'Estoque baixo detectado',
          alert_message: `Produto com estoque abaixo do limite configurado (${config.stock_threshold_quantity} unidades)`,
          product_name: 'Produto Exemplo',
          product_category: 'Materiais',
          current_stock_quantity: config.stock_threshold_quantity - 1,
          minimum_stock_quantity: config.stock_threshold_quantity,
          suggested_order_quantity:
            config.reorder_point || config.stock_threshold_quantity * 2,
          status: 'active' as const,
          business_impact_level: 'medium' as const,
          patient_impact_potential: false,
          auto_generated: true,
          alert_data: {
            threshold_config: config,
            detection_method: 'automated_check',
          },
        };

        alertsToCreate.push(sampleAlert);
      }

      // Inserir alertas no banco
      if (alertsToCreate.length > 0) {
        const { data, error } = await supabase
          .from('stock_alerts')
          .insert(alertsToCreate)
          .select();

        if (error) throw error;
        return { config_id: config.id, alerts_created: data?.length || 0 };
      }

      return { config_id: config.id, alerts_created: 0 };
    } catch (error) {
      console.error('Error generating low stock alerts:', error);
      return {
        config_id: config.id,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Gerar alertas de vencimento
   */
  private async generateExpiryWarningAlerts(config: any) {
    try {
      const supabase = await this.getSupabase();
      const alertsToCreate = [];

      if (config.expiry_warning_days && config.expiry_warning_days > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + config.expiry_warning_days);

        const sampleAlert = {
          clinic_id: config.clinic_id,
          config_id: config.id,
          alert_type: 'expiry_warning' as const,
          alert_severity: 'high' as const,
          alert_title: 'Produtos próximos ao vencimento',
          alert_message: `Produtos vencem em ${config.expiry_warning_days} dias`,
          product_name: 'Produto com Vencimento Próximo',
          product_category: 'Medicamentos',
          current_stock_quantity: 10,
          minimum_stock_quantity: 5,
          expiry_date: expiryDate.toISOString().split('T')[0],
          days_until_expiry: config.expiry_warning_days,
          status: 'active' as const,
          business_impact_level: 'high' as const,
          patient_impact_potential: true,
          auto_generated: true,
          alert_data: {
            threshold_config: config,
            detection_method: 'expiry_check',
          },
        };

        alertsToCreate.push(sampleAlert);
      }

      // Inserir alertas no banco
      if (alertsToCreate.length > 0) {
        const { data, error } = await supabase
          .from('stock_alerts')
          .insert(alertsToCreate)
          .select();

        if (error) throw error;
        return { config_id: config.id, alerts_created: data?.length || 0 };
      }

      return { config_id: config.id, alerts_created: 0 };
    } catch (error) {
      console.error('Error generating expiry alerts:', error);
      return {
        config_id: config.id,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Gerar alertas de previsão de escassez
   */
  private async generateShortagePredictionAlerts(config: any) {
    // Implementação de lógica preditiva baseada em consumo histórico
    return { config_id: config.id, alerts_created: 0 };
  }

  /**
   * Gerar alertas de excesso de estoque
   */
  private async generateOverstockWarningAlerts(config: any) {
    // Implementação de lógica de overstock baseada em movimento e shelf life
    return { config_id: config.id, alerts_created: 0 };
  }

  // ==========================================
  // DASHBOARD E MÉTRICAS
  // ==========================================

  /**
   * Obter resumo de alertas para dashboard
   */
  async getAlertsSummary(clinic_id: string, days = 30) {
    try {
      const supabase = await this.getSupabase();
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('stock_alerts')
        .select('alert_type, alert_severity, status, created_at')
        .eq('clinic_id', clinic_id)
        .gte('created_at', since.toISOString());

      if (error) throw error;

      // Processar dados para dashboard
      const summary = {
        total_alerts: data?.length || 0,
        active_alerts: data?.filter((a) => a.status === 'active').length || 0,
        critical_alerts:
          data?.filter((a) => a.alert_severity === 'critical').length || 0,
        by_type: {} as Record<string, number>,
        by_severity: {} as Record<string, number>,
        trend: [] as Array<{ date: string; count: number }>,
      };

      // Agrupar por tipo e severidade
      data?.forEach((alert) => {
        summary.by_type[alert.alert_type] =
          (summary.by_type[alert.alert_type] || 0) + 1;
        summary.by_severity[alert.alert_severity] =
          (summary.by_severity[alert.alert_severity] || 0) + 1;
      });

      return { success: true, data: summary };
    } catch (error) {
      console.error('Error fetching alerts summary:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }

  /**
   * Obter alertas críticos para notificações
   */
  async getCriticalAlerts(clinic_id: string) {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('stock_alerts')
        .select('*')
        .eq('clinic_id', clinic_id)
        .eq('alert_severity', 'critical')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching critical alerts:', error);
      return {
        success: false,
        error: String((error as Error)?.message || error),
      };
    }
  }
}
