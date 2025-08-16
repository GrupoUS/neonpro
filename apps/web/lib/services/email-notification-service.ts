import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Types for email notifications
export type NotificationData = {
  recipientEmail: string;
  recipientPhone?: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  invoiceNumber?: string;
  paymentId?: string;
  companyName?: string;
};

export type EmailNotificationConfig = {
  enableEmail: boolean;
  enableSMS: boolean;
  fromEmail?: string;
  companyName?: string;
  supportEmail?: string;
};

// Professional email templates with modern styling
const EmailTemplates = {
  overduePayment: (
    data: NotificationData,
    config: EmailNotificationConfig
  ) => ({
    subject: `[URGENTE] Pagamento em atraso - ${data.supplierName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento em Atraso</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Ação imediata requerida</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 1px solid #fca5a5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>
                <td style="padding: 12px 0; color: #111827; font-weight: 500;">${data.supplierName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor:</td>
                <td style="padding: 12px 0; color: #dc2626; font-size: 24px; font-weight: 700;">R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Vencimento:</td>
                <td style="padding: 12px 0; color: #dc2626; font-weight: 600; font-size: 16px;">${new Date(data.dueDate).toLocaleDateString('pt-BR')}</td>
              </tr>
              ${
                data.invoiceNumber
                  ? `
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Nota Fiscal:</td>
                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.invoiceNumber}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 24px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 16px; color: #991b1b; font-weight: 500;">
              <strong>Importante:</strong> Este pagamento está em atraso. Por favor, efetue o pagamento o quanto antes para evitar juros e multas.
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Efetue o pagamento HOJE
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">
              Esta é uma notificação automática do sistema <strong>${config.companyName || 'NeonPro'}</strong><br>
              Para dúvidas, entre em contato: <a href="mailto:${config.supportEmail || 'suporte@neonpro.com'}" style="color: #3b82f6; text-decoration: none;">${config.supportEmail || 'suporte@neonpro.com'}</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  dueToday: (data: NotificationData, config: EmailNotificationConfig) => ({
    subject: `⏰ Pagamento vence HOJE - ${data.supplierName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento Vence Hoje</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Lembrete importante</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border: 1px solid #fbbf24; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #d97706; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>
                <td style="padding: 12px 0; color: #111827; font-weight: 500;">${data.supplierName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor:</td>
                <td style="padding: 12px 0; color: #f59e0b; font-size: 24px; font-weight: 700;">R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Vencimento:</td>
                <td style="padding: 12px 0; color: #f59e0b; font-weight: 600; font-size: 16px;">HOJE (${new Date(data.dueDate).toLocaleDateString('pt-BR')})</td>
              </tr>
              ${
                data.invoiceNumber
                  ? `
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Nota Fiscal:</td>
                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.invoiceNumber}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="background: #fff3cd; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #d97706;">
                🎯 Não esqueça: o pagamento vence hoje!
              </p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">
              Esta é uma notificação automática do sistema <strong>${config.companyName || 'NeonPro'}</strong><br>
              Para dúvidas, entre em contato: <a href="mailto:${config.supportEmail || 'suporte@neonpro.com'}" style="color: #3b82f6; text-decoration: none;">${config.supportEmail || 'suporte@neonpro.com'}</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  dueSoon: (data: NotificationData, config: EmailNotificationConfig) => ({
    subject: `📅 Pagamento próximo do vencimento - ${data.supplierName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">📅</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento Próximo</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Lembrete preventivo</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #93c5fd; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #1d4ed8; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>
                <td style="padding: 12px 0; color: #111827; font-weight: 500;">${data.supplierName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor:</td>
                <td style="padding: 12px 0; color: #3b82f6; font-size: 24px; font-weight: 700;">R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Vencimento:</td>
                <td style="padding: 12px 0; color: #3b82f6; font-weight: 600; font-size: 16px;">${new Date(data.dueDate).toLocaleDateString('pt-BR')}</td>
              </tr>
              ${
                data.invoiceNumber
                  ? `
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Nota Fiscal:</td>
                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.invoiceNumber}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-size: 16px; color: #1e40af; font-weight: 500;">
              💡 <strong>Dica:</strong> Organize-se para efetuar este pagamento antes do vencimento e evite multas e juros.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">
              Esta é uma notificação automática do sistema <strong>${config.companyName || 'NeonPro'}</strong><br>
              Para dúvidas, entre em contato: <a href="mailto:${config.supportEmail || 'suporte@neonpro.com'}" style="color: #3b82f6; text-decoration: none;">${config.supportEmail || 'suporte@neonpro.com'}</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  paymentCompleted: (
    data: NotificationData,
    config: EmailNotificationConfig
  ) => ({
    subject: `✅ Pagamento confirmado - ${data.supplierName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento Confirmado</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Transação realizada com sucesso</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 1px solid #6ee7b7; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>
                <td style="padding: 12px 0; color: #111827; font-weight: 500;">${data.supplierName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor Pago:</td>
                <td style="padding: 12px 0; color: #10b981; font-size: 24px; font-weight: 700;">R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Data:</td>
                <td style="padding: 12px 0; color: #111827; font-weight: 500;">${new Date().toLocaleDateString('pt-BR')}</td>
              </tr>
              ${
                data.paymentId
                  ? `
              <tr>
                <td style="padding: 12px 0; font-weight: 600; color: #374151;">ID Pagamento:</td>
                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.paymentId}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #059669;">
                🎉 Obrigado por manter as contas em dia!
              </p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">
              Esta é uma confirmação automática do sistema <strong>${config.companyName || 'NeonPro'}</strong><br>
              Para dúvidas, entre em contato: <a href="mailto:${config.supportEmail || 'suporte@neonpro.com'}" style="color: #3b82f6; text-decoration: none;">${config.supportEmail || 'suporte@neonpro.com'}</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),
};

// SMS Templates (concise messages)
const SMSTemplates = {
  overduePayment: (data: NotificationData) =>
    `🚨 URGENTE: Pagamento ${data.supplierName} em atraso - R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - Venceu: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}`,

  dueToday: (data: NotificationData) =>
    `⏰ HOJE: Vence pagamento ${data.supplierName} - R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Não esqueça!`,

  dueSoon: (data: NotificationData) =>
    `📅 Lembrete: Pagamento ${data.supplierName} vence ${new Date(data.dueDate).toLocaleDateString('pt-BR')} - R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,

  paymentCompleted: (data: NotificationData) =>
    `✅ Confirmado: Pagamento ${data.supplierName} - R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso`,
};

// Main email notification service class
export class EmailNotificationService {
  private config: EmailNotificationConfig;

  constructor(
    config: EmailNotificationConfig = {
      enableEmail: true,
      enableSMS: false,
      fromEmail: 'noreply@neonpro.com',
      companyName: 'NeonPro',
      supportEmail: 'suporte@neonpro.com',
    }
  ) {
    this.config = config;
  }

  // Public notification methods
  async sendOverduePaymentNotification(
    data: NotificationData
  ): Promise<boolean> {
    return await this.sendNotification('overduePayment', data);
  }

  async sendDueTodayNotification(data: NotificationData): Promise<boolean> {
    return await this.sendNotification('dueToday', data);
  }

  async sendDueSoonNotification(data: NotificationData): Promise<boolean> {
    return await this.sendNotification('dueSoon', data);
  }

  async sendPaymentCompletedNotification(
    data: NotificationData
  ): Promise<boolean> {
    return await this.sendNotification('paymentCompleted', data);
  }

  // Private notification dispatcher
  private async sendNotification(
    type: keyof typeof EmailTemplates,
    data: NotificationData
  ): Promise<boolean> {
    let emailSuccess = true;
    let smsSuccess = true;

    try {
      // Send email notification
      if (this.config.enableEmail && data.recipientEmail) {
        emailSuccess = await this.sendEmail(type, data);
      }

      // Send SMS notification (placeholder for future implementation)
      if (this.config.enableSMS && data.recipientPhone) {
        smsSuccess = await this.sendSMS(type, data);
      }

      return emailSuccess && smsSuccess;
    } catch (_error) {
      return false;
    }
  }

  // Email sender
  private async sendEmail(
    type: keyof typeof EmailTemplates,
    data: NotificationData
  ): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        return false;
      }

      const template = EmailTemplates[type](data, this.config);

      const _result = await resend.emails.send({
        from: this.config.fromEmail || 'NeonPro <noreply@neonpro.com>',
        to: [data.recipientEmail],
        subject: template.subject,
        html: template.html,
        tags: [
          { name: 'category', value: 'accounts-payable' },
          { name: 'type', value: type },
          { name: 'supplier', value: data.supplierName },
        ],
      });
      return true;
    } catch (_error) {
      return false;
    }
  }

  // SMS sender (placeholder)
  private async sendSMS(
    type: keyof typeof SMSTemplates,
    data: NotificationData
  ): Promise<boolean> {
    try {
      const _message = SMSTemplates[type](data);

      // Example Twilio implementation:
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: data.recipientPhone
      // });

      return true;
    } catch (_error) {
      return false;
    }
  }

  // Helper method to create notification data from accounts payable record
  static createNotificationData(
    accountsPayable: any,
    recipientEmail: string,
    recipientPhone?: string
  ): NotificationData {
    return {
      recipientEmail,
      recipientPhone,
      supplierName: accountsPayable.supplier_name,
      amount: Number.parseFloat(accountsPayable.amount),
      dueDate: accountsPayable.due_date,
      invoiceNumber: accountsPayable.invoice_number,
      paymentId: accountsPayable.id,
    };
  }

  // Batch notification method
  async sendBatchNotifications(
    notifications: {
      type: keyof typeof EmailTemplates;
      data: NotificationData;
    }[]
  ): Promise<boolean[]> {
    const results = await Promise.allSettled(
      notifications.map(({ type, data }) => this.sendNotification(type, data))
    );

    return results.map((result) =>
      result.status === 'fulfilled' ? result.value : false
    );
  }

  // Configuration methods
  updateConfig(newConfig: Partial<EmailNotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): EmailNotificationConfig {
    return { ...this.config };
  }

  // Health check method
  async testConnection(): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        return false;
      }
      return true;
    } catch (_error) {
      return false;
    }
  }
}

// Default export
export default EmailNotificationService;
