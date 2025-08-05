import { createClient } from "@/lib/supabase/server";

// Tipos temporários baseados na estrutura atual - substituir por tipos do Supabase quando disponível
interface AccountsPayable {
  id: string;
  clinic_id: string;
  vendor_id: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
}

interface Vendor {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
}

export interface NotificationConfig {
  id?: string;
  clinic_id: string;
  notification_type: 'due_date_reminder' | 'overdue_payment' | 'approval_needed' | 'payment_completed';
  days_before_due?: number; // Para lembretes de vencimento
  days_after_due?: number; // Para escalação de pagamentos em atraso
  enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  dashboard_enabled: boolean;
  escalation_level?: number; // 1, 2, 3 para diferentes níveis de escalação
  recipients: string[]; // emails ou telefones
  created_at?: string;
  updated_at?: string;
}

export interface NotificationQueue {
  id?: string;
  clinic_id: string;
  accounts_payable_id: string;
  notification_type: string;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retry_count: number;
  email_sent?: boolean;
  sms_sent?: boolean;
  dashboard_alert_created?: boolean;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardAlert {
  id?: string;
  clinic_id: string;
  accounts_payable_id?: string;
  alert_type: 'due_soon' | 'overdue' | 'approval_needed' | 'high_priority' | 'due_today';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  is_dismissed: boolean;
  action_url?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentReminder {
  accounts_payable: AccountsPayable;
  vendor: Vendor;
  days_until_due: number;
  days_overdue: number;
  alert_type: 'due_soon' | 'due_today' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class NotificationService {
  private supabase: any;

  constructor() {
    // Usar createClient de forma assíncrona quando necessário
  }

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  // Configuração de Notificações
  async getNotificationConfigs(clinicId: string): Promise<NotificationConfig[]> {
    // Mock implementation - substituir por query real quando tabela for criada
    return [
      {
        id: '1',
        clinic_id: clinicId,
        notification_type: 'due_date_reminder',
        days_before_due: 3,
        enabled: true,
        email_enabled: true,
        sms_enabled: false,
        dashboard_enabled: true,
        recipients: ['admin@clinic.com'],
      },
      {
        id: '2',
        clinic_id: clinicId,
        notification_type: 'overdue_payment',
        days_after_due: 1,
        enabled: true,
        email_enabled: true,
        sms_enabled: false,
        dashboard_enabled: true,
        escalation_level: 1,
        recipients: ['manager@clinic.com'],
      },
    ];
  }

  async createNotificationConfig(config: Omit<NotificationConfig, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationConfig> {
    // Mock implementation
    const newConfig: NotificationConfig = {
      ...config,
      id: `config_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newConfig;
  }

  async updateNotificationConfig(id: string, config: Partial<NotificationConfig>): Promise<NotificationConfig> {
    // Mock implementation
    const existingConfig = await this.getNotificationConfigs(config.clinic_id || '');
    const configToUpdate = existingConfig.find(c => c.id === id);
    
    if (!configToUpdate) {
      throw new Error('Configuration not found');
    }

    return {
      ...configToUpdate,
      ...config,
      updated_at: new Date().toISOString(),
    };
  }

  // Monitoramento de Vencimentos
  async getDuePayments(clinicId: string, daysAhead: number = 7): Promise<PaymentReminder[]> {
    try {
      const supabase = await this.getSupabaseClient();
      
      const { data: payables, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('clinic_id', clinicId)
        .in('status', ['pending', 'approved'])
        .lte('due_date', new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching due payments:', error);
        return [];
      }

      const reminders: PaymentReminder[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const payable of payables || []) {
        const dueDate = new Date(payable.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        let alertType: 'due_soon' | 'due_today' | 'overdue' = 'due_soon';
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';

        if (daysDiff < 0) {
          alertType = 'overdue';
          priority = Math.abs(daysDiff) > 7 ? 'urgent' : 'high';
        } else if (daysDiff === 0) {
          alertType = 'due_today';
          priority = 'high';
        } else {
          alertType = 'due_soon';
          priority = daysDiff <= 1 ? 'medium' : 'low';
        }

        reminders.push({
          accounts_payable: payable,
          vendor: payable.vendor,
          days_until_due: daysDiff > 0 ? daysDiff : 0,
          days_overdue: daysDiff < 0 ? Math.abs(daysDiff) : 0,
          alert_type: alertType,
          priority,
        });
      }

      return reminders.sort((a, b) => {
        // Ordenar por prioridade (urgent > high > medium > low) e depois por data
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(a.accounts_payable.due_date).getTime() - new Date(b.accounts_payable.due_date).getTime();
      });

    } catch (error) {
      console.error('Error in getDuePayments:', error);
      return [];
    }
  }

  // Alertas do Dashboard
  async getDashboardAlerts(clinicId: string, limit: number = 10): Promise<DashboardAlert[]> {
    // Mock implementation baseada em pagamentos próximos do vencimento
    const duePayments = await this.getDuePayments(clinicId, 7);
    
    const alerts: DashboardAlert[] = [];
    
    for (const reminder of duePayments.slice(0, limit)) {
      let title: string = '';
      let message: string = '';
      
      if (reminder.alert_type === 'overdue') {
        title = `Pagamento em atraso - ${reminder.vendor.name}`;
        message = `Conta de R$ ${reminder.accounts_payable.amount} está ${reminder.days_overdue} dias em atraso`;
      } else if (reminder.alert_type === 'due_today') {
        title = `Pagamento vence hoje - ${reminder.vendor.name}`;
        message = `Conta de R$ ${reminder.accounts_payable.amount} vence hoje`;
      } else {
        title = `Pagamento próximo do vencimento - ${reminder.vendor.name}`;
        message = `Conta de R$ ${reminder.accounts_payable.amount} vence em ${reminder.days_until_due} dias`;
      }

      alerts.push({
        id: `alert_${reminder.accounts_payable.id}`,
        clinic_id: clinicId,
        accounts_payable_id: reminder.accounts_payable.id,
        alert_type: reminder.alert_type,
        title,
        message,
        priority: reminder.priority,
        is_read: false,
        is_dismissed: false,
        action_url: `/dashboard/accounts-payable/payables?id=${reminder.accounts_payable.id}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return alerts;
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    // Mock implementation - implementar quando tabela for criada
    console.log(`Alert ${alertId} marked as read`);
  }

  async dismissAlert(alertId: string): Promise<void> {
    // Mock implementation - implementar quando tabela for criada
    console.log(`Alert ${alertId} dismissed`);
  }

  // Fila de Notificações
  async queueNotification(notification: Omit<NotificationQueue, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationQueue> {
    const queuedNotification: NotificationQueue = {
      ...notification,
      id: `queue_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Mock implementation - adicionar à fila quando tabela for criada
    console.log('Notification queued:', queuedNotification);
    return queuedNotification;
  }

  async processNotificationQueue(clinicId: string): Promise<void> {
    // Mock implementation - processar fila de notificações
    console.log(`Processing notification queue for clinic ${clinicId}`);
    
    // 1. Buscar notificações pendentes
    // 2. Enviar emails
    // 3. Enviar SMS
    // 4. Criar alertas no dashboard
    // 5. Atualizar status das notificações
  }

  // Sistema de Escalação
  async escalateOverduePayments(clinicId: string): Promise<void> {
    const overduePayments = await this.getDuePayments(clinicId, 0);
    const overdue = overduePayments.filter(p => p.alert_type === 'overdue');
    
    for (const payment of overdue) {
      // Determinar nível de escalação baseado em dias de atraso
      let escalationLevel = 1;
      if (payment.days_overdue > 7) escalationLevel = 2;
      if (payment.days_overdue > 15) escalationLevel = 3;
      
      // Criar notificação de escalação
      await this.queueNotification({
        clinic_id: clinicId,
        accounts_payable_id: payment.accounts_payable.id,
        notification_type: 'overdue_payment',
        scheduled_for: new Date().toISOString(),
        status: 'pending',
        retry_count: 0,
      });
      
      console.log(`Escalated payment ${payment.accounts_payable.id} to level ${escalationLevel}`);
    }
  }

  // Relatórios de Notificações
  async getNotificationStats(clinicId: string, startDate: string, endDate: string) {
    // Mock implementation
    return {
      total_sent: 45,
      emails_sent: 32,
      sms_sent: 8,
      dashboard_alerts: 15,
      success_rate: 95.6,
      failed_notifications: 2,
      most_common_type: 'due_date_reminder',
      escalations_triggered: 5,
      avg_response_time: '2.3 hours',
    };
  }

  // Utilitários
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  calculateBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const curDate = new Date(startDate);
    
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
  }
}

export const createnotificationService = () => new NotificationService();

