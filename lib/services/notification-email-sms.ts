// Serviço de notificações por email e SMS
// lib/services/notification-email-sms.ts

import { Resend } from 'resend';

// Configuração do Resend para emails
const resend = new Resend(process.env.RESEND_API_KEY);

// Tipos de notificações
export type NotificationType = 'overdue' | 'due_today' | 'due_soon' | 'approved' | 'rejected' | 'payment_complete';

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSNotificationData {
  to: string; // Número de telefone
  message: string;
}

export interface NotificationContext {
  vendorName: string;
  invoiceNumber: string;
  amount: number;
  dueDate?: string;
  daysPastDue?: number;
}

class NotificationService {
  
  // Templates de email
  private getEmailTemplate(type: NotificationType, context: NotificationContext): EmailNotificationData {
    const baseSubject = `[NeonPro] Contas a Pagar - `;
    
    switch (type) {
      case 'overdue':
        return {
          to: context.vendorName,
          subject: `${baseSubject}Conta Vencida - ${context.invoiceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">⚠️ Conta Vencida</h2>
              <p><strong>Fornecedor:</strong> ${context.vendorName}</p>
              <p><strong>Fatura:</strong> ${context.invoiceNumber}</p>
              <p><strong>Valor:</strong> R$ ${context.amount.toFixed(2)}</p>
              <p><strong>Vencimento:</strong> ${context.dueDate}</p>
              <p><strong>Dias em Atraso:</strong> ${context.daysPastDue} dias</p>
              <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #dc2626; margin: 0;">
                  <strong>Ação Urgente Necessária:</strong> Esta conta está vencida há ${context.daysPastDue} dias. 
                  Por favor, providencie o pagamento o mais breve possível para evitar juros e multas.
                </p>
              </div>
              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Acessar Sistema
              </a>
            </div>
          `,
          text: `Conta Vencida - ${context.invoiceNumber} - ${context.vendorName} - R$ ${context.amount.toFixed(2)} - ${context.daysPastDue} dias em atraso`
        };
      
      case 'due_today':
        return {
          to: context.vendorName,
          subject: `${baseSubject}Vencimento Hoje - ${context.invoiceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">📅 Vencimento Hoje</h2>
              <p><strong>Fornecedor:</strong> ${context.vendorName}</p>
              <p><strong>Fatura:</strong> ${context.invoiceNumber}</p>
              <p><strong>Valor:</strong> R$ ${context.amount.toFixed(2)}</p>
              <p><strong>Vencimento:</strong> ${context.dueDate}</p>
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #d97706; margin: 0;">
                  <strong>Lembrete:</strong> Esta conta vence hoje. Providencie o pagamento para evitar atrasos.
                </p>
              </div>
              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" 
                 style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Processar Pagamento
              </a>
            </div>
          `,
          text: `Vencimento Hoje - ${context.invoiceNumber} - ${context.vendorName} - R$ ${context.amount.toFixed(2)}`
        };
      
      case 'due_soon':
        return {
          to: context.vendorName,
          subject: `${baseSubject}Vencimento Próximo - ${context.invoiceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">🔔 Vencimento Próximo</h2>
              <p><strong>Fornecedor:</strong> ${context.vendorName}</p>
              <p><strong>Fatura:</strong> ${context.invoiceNumber}</p>
              <p><strong>Valor:</strong> R$ ${context.amount.toFixed(2)}</p>
              <p><strong>Vencimento:</strong> ${context.dueDate}</p>
              <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #1d4ed8; margin: 0;">
                  <strong>Aviso:</strong> Esta conta vencerá em breve. Organize-se para o pagamento.
                </p>
              </div>
              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Detalhes
              </a>
            </div>
          `,
          text: `Vencimento Próximo - ${context.invoiceNumber} - ${context.vendorName} - R$ ${context.amount.toFixed(2)} em ${context.dueDate}`
        };
      
      case 'payment_complete':
        return {
          to: context.vendorName,
          subject: `${baseSubject}Pagamento Realizado - ${context.invoiceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">✅ Pagamento Realizado</h2>
              <p><strong>Fornecedor:</strong> ${context.vendorName}</p>
              <p><strong>Fatura:</strong> ${context.invoiceNumber}</p>
              <p><strong>Valor Pago:</strong> R$ ${context.amount.toFixed(2)}</p>
              <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #065f46; margin: 0;">
                  <strong>Confirmado:</strong> O pagamento foi processado com sucesso.
                </p>
              </div>
              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" 
                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Comprovante
              </a>
            </div>
          `,
          text: `Pagamento Realizado - ${context.invoiceNumber} - ${context.vendorName} - R$ ${context.amount.toFixed(2)}`
        };
      
      default:
        return {
          to: context.vendorName,
          subject: `${baseSubject}Notificação - ${context.invoiceNumber}`,
          html: `<p>Notificação sobre a fatura ${context.invoiceNumber} - ${context.vendorName}</p>`,
          text: `Notificação sobre a fatura ${context.invoiceNumber} - ${context.vendorName}`
        };
    }
  }

  // Templates de SMS
  private getSMSTemplate(type: NotificationType, context: NotificationContext): string {
    switch (type) {
      case 'overdue':
        return `[NeonPro] URGENTE: Conta ${context.invoiceNumber} vencida há ${context.daysPastDue} dias. Valor: R$ ${context.amount.toFixed(2)}. Acesse: http://127.0.0.1:8080/dashboard/accounts-payable`;
      
      case 'due_today':
        return `[NeonPro] VENCE HOJE: ${context.invoiceNumber} - R$ ${context.amount.toFixed(2)}. Providencie pagamento. Acesse: http://127.0.0.1:8080/dashboard/accounts-payable`;
      
      case 'due_soon':
        return `[NeonPro] Vence ${context.dueDate}: ${context.invoiceNumber} - R$ ${context.amount.toFixed(2)}. Prepare-se para o pagamento.`;
      
      case 'payment_complete':
        return `[NeonPro] ✅ Pagamento confirmado: ${context.invoiceNumber} - R$ ${context.amount.toFixed(2)}`;
      
      default:
        return `[NeonPro] Notificação sobre ${context.invoiceNumber} - R$ ${context.amount.toFixed(2)}`;
    }
  }

  // Enviar email
  async sendEmail(type: NotificationType, context: NotificationContext, recipientEmail: string): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
        console.log('⚠️ Email não configurado. Template que seria enviado:');
        const template = this.getEmailTemplate(type, context);
        console.log(`Para: ${recipientEmail}`);
        console.log(`Assunto: ${template.subject}`);
        console.log(`Conteúdo: ${template.text}`);
        return false;
      }

      const template = this.getEmailTemplate(type, context);
      
      const result = await resend.emails.send({
        from: 'NeonPro <noreply@neonpro.app>',
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      console.log(`✅ Email enviado: ${template.subject} para ${recipientEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  // Enviar SMS (simulado - integraria com Twilio, etc.)
  async sendSMS(type: NotificationType, context: NotificationContext, phoneNumber: string): Promise<boolean> {
    try {
      const message = this.getSMSTemplate(type, context);
      
      // Por enquanto apenas simula o envio
      console.log('📱 SMS (SIMULADO):');
      console.log(`Para: ${phoneNumber}`);
      console.log(`Mensagem: ${message}`);
      
      // Aqui integraria com Twilio, AWS SNS, ou outro provedor
      // const result = await twilioClient.messages.create({
      //   body: message,
      //   from: '+5511999999999',
      //   to: phoneNumber
      // });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar SMS:', error);
      return false;
    }
  }

  // Enviar notificação (email + SMS)
  async sendNotification(
    type: NotificationType, 
    context: NotificationContext, 
    recipients: { email?: string; phone?: string }
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const results = { emailSent: false, smsSent: false };

    if (recipients.email) {
      results.emailSent = await this.sendEmail(type, context, recipients.email);
    }

    if (recipients.phone) {
      results.smsSent = await this.sendSMS(type, context, recipients.phone);
    }

    return results;
  }
}

export const notificationService = new NotificationService();
export default NotificationService;
