import { logger, task } from '@trigger.dev/sdk/v3';
import { Resend } from 'resend';
import { createClient } from '@/app/utils/supabase/server';
import { type InvoiceJobPayload, JOB_IDS } from '../client';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 💰 INVOICE EMAIL DELIVERY
 * Automatiza envio de faturas por email
 * Integra com sistema de billing existente
 */
export const invoiceEmailDelivery = task({
  id: JOB_IDS.INVOICE_EMAIL,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
  },
  run: async (payload: InvoiceJobPayload) => {
    logger.info('💰 Sending invoice email', {
      invoiceId: payload.invoiceId,
      recipientEmail: payload.recipientEmail,
    });

    try {
      const supabase = await createClient();

      // Buscar detalhes da fatura no sistema existente
      const { data: invoice, error } = await supabase
        .from('billing_invoices')
        .select(
          `
          id,
          invoice_number,
          amount,
          due_date,
          status,
          description,
          created_at,
          patients (
            full_name,
            email,
            phone
          ),
          billing_services (
            service_name,
            quantity,
            unit_price,
            total_price
          )
        `
        )
        .eq('id', payload.invoiceId)
        .single();

      if (error || !invoice) {
        throw new Error(`Invoice not found: ${payload.invoiceId}`);
      }

      // Calcular informações da fatura
      const services = invoice.billing_services || [];
      const _subtotal = services.reduce((sum, service) => sum + service.total_price, 0);
      const dueDate = new Date(invoice.due_date).toLocaleDateString('pt-BR');
      const invoiceDate = new Date(invoice.created_at).toLocaleDateString('pt-BR');

      // Template de email profissional para fatura
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Fatura #${invoice.invoice_number} - ${payload.clinicName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 650px; margin: 0 auto; padding: 20px;">
            <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px;">
              <div>
                <h1 style="color: #2563eb; margin: 0;">${payload.clinicName}</h1>
                <p style="color: #666; margin: 5px 0;">Fatura de Serviços</p>
              </div>
              <div style="text-align: right;">
                <h2 style="color: #1e40af; margin: 0;">Fatura #${invoice.invoice_number}</h2>
                <p style="color: #666; margin: 5px 0;">Data: ${invoiceDate}</p>
              </div>
            </header>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Olá, ${payload.recipientName}!</h3>
              <p>Sua fatura está pronta. Confira os detalhes dos serviços realizados:</p>
            </div>
            
            <!-- Detalhes dos serviços -->
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
              <div style="background: #1e40af; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
                <h3 style="margin: 0;">Serviços Realizados</h3>
              </div>
              <div style="padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f8fafc;">
                      <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0;">Serviço</th>
                      <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0;">Qtd</th>
                      <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0;">Valor Unit.</th>
                      <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${services
                      .map(
                        (service) => `
                      <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${service.service_name}</td>
                        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f0f0f0;">${service.quantity}</td>
                        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0;">R$ ${service.unit_price.toFixed(2)}</td>
                        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0;">R$ ${service.total_price.toFixed(2)}</td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                  <tfoot>
                    <tr style="background: #f8fafc; font-weight: bold;">
                      <td colspan="3" style="padding: 15px; text-align: right; border-top: 2px solid #e0e0e0;">Total a Pagar:</td>
                      <td style="padding: 15px; text-align: right; border-top: 2px solid #e0e0e0; color: #059669; font-size: 18px;">R$ ${payload.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <!-- Informações de pagamento -->
            <div style="display: flex; gap: 20px; margin: 30px 0;">
              <div style="flex: 1; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px;">
                <h4 style="color: #92400e; margin-top: 0;">📅 Vencimento</h4>
                <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 5px 0;">${dueDate}</p>
                ${
                  invoice.status === 'overdue'
                    ? '<p style="color: #dc2626; font-size: 14px; margin: 0;"><strong>⚠️ Fatura em atraso</strong></p>'
                    : '<p style="color: #92400e; font-size: 14px; margin: 0;">Pagamento até esta data</p>'
                }
              </div>
              <div style="flex: 1; background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; padding: 15px;">
                <h4 style="color: #065f46; margin-top: 0;">💳 Formas de Pagamento</h4>
                <ul style="color: #065f46; margin: 0; font-size: 14px;">
                  <li>PIX (Desconto 5%)</li>
                  <li>Cartão de débito/crédito</li>
                  <li>Dinheiro na clínica</li>
                </ul>
              </div>
            </div>
            
            <!-- Call to action -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
              <h3 style="margin: 0 0 10px 0;">Pagar Agora</h3>
              <p style="margin: 0 0 15px 0; opacity: 0.9;">Clique no botão abaixo para acessar suas opções de pagamento</p>
              ${
                payload.invoiceUrl
                  ? `
                <a href="${payload.invoiceUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  💳 Pagar Fatura
                </a>
              `
                  : `
                <p style="background: rgba(255,255,255,0.2); border-radius: 6px; padding: 10px; margin: 0;">
                  Entre em contato para pagamento: WhatsApp ou visite a clínica
                </p>
              `
              }
            </div>
            
            <div style="background: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0;">📋 Observações Importantes</h4>
              <ul style="color: #6b7280; margin: 0; font-size: 14px;">
                <li>Guarde este email como comprovante de serviços</li>
                <li>Para esclarecimentos sobre a fatura, entre em contato conosco</li>
                <li>Pagamentos após o vencimento podem ter juros aplicados</li>
                ${invoice.description ? `<li>Observação: ${invoice.description}</li>` : ''}
              </ul>
            </div>
            
            <footer style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${payload.clinicName} - Powered by NeonPro</p>
              <p>Este é um email automático. Em caso de dúvidas, responda este email ou entre em contato conosco.</p>
            </footer>
          </div>
        </body>
        </html>
      `;

      // Enviar fatura por email
      const emailResult = await resend.emails.send({
        from: `${payload.clinicName} Financeiro <billing@neonpro.app>`,
        to: [payload.recipientEmail],
        subject: `💰 Fatura #${invoice.invoice_number} - R$ ${payload.amount.toFixed(2)} - Venc: ${dueDate}`,
        html: invoiceHtml,
        headers: {
          'X-Invoice-ID': payload.invoiceId,
          'X-Clinic-ID': payload.clinicId,
          'X-Email-Type': 'invoice',
        },
      });

      // Atualizar fatura para marcar que foi enviada por email
      await supabase
        .from('billing_invoices')
        .update({
          email_sent_at: new Date().toISOString(),
          email_sent_to: payload.recipientEmail,
        })
        .eq('id', payload.invoiceId);

      logger.info('✅ Invoice email sent successfully', {
        emailId: emailResult.data?.id,
        invoiceId: payload.invoiceId,
        amount: payload.amount,
      });

      return {
        success: true,
        emailId: emailResult.data?.id,
        invoiceId: payload.invoiceId,
        amount: payload.amount,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Failed to send invoice email', {
        error: error instanceof Error ? error.message : error,
        invoiceId: payload.invoiceId,
      });

      throw error;
    }
  },
});

/**
 * 📱 PAYMENT REMINDER EMAIL
 * Lembra sobre faturas vencidas automaticamente
 */
export const paymentReminderEmail = task({
  id: JOB_IDS.PAYMENT_REMINDER,
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 15_000,
  },
  run: async (payload: InvoiceJobPayload) => {
    logger.info('📱 Sending payment reminder', {
      invoiceId: payload.invoiceId,
    });

    try {
      const supabase = await createClient();

      // Verificar status atual da fatura
      const { data: invoice } = await supabase
        .from('billing_invoices')
        .select('status, due_date, amount, last_reminder_sent')
        .eq('id', payload.invoiceId)
        .single();

      if (invoice?.status === 'paid') {
        logger.info('⚠️ Invoice already paid, skipping reminder', {
          invoiceId: payload.invoiceId,
        });
        return { success: true, skipped: true, reason: 'already_paid' };
      }

      // Verificar se lembrete foi enviado recentemente (último 3 dias)
      if (invoice?.last_reminder_sent) {
        const lastReminder = new Date(invoice.last_reminder_sent);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        if (lastReminder > threeDaysAgo) {
          logger.info('⚠️ Reminder sent recently, skipping', {
            invoiceId: payload.invoiceId,
            lastSent: invoice.last_reminder_sent,
          });
          return { success: true, skipped: true, reason: 'recent_reminder' };
        }
      }

      // Calcular dias em atraso
      const dueDate = new Date(invoice?.due_date || payload.dueDate);
      const today = new Date();
      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Template de lembrete amigável mas firme
      const reminderHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Lembrete de Pagamento - ${payload.clinicName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">💰 Lembrete de Pagamento</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${payload.clinicName}</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; text-align: center;">
              <h2 style="color: #1e40af; margin-top: 0;">Olá, ${payload.recipientName}! 👋</h2>
              
              ${
                daysOverdue > 0
                  ? `
                <div style="background: #fee2e2; border: 1px solid #f87171; border-radius: 6px; padding: 15px; margin: 20px 0;">
                  <p style="color: #dc2626; margin: 0; font-weight: bold;">
                    ⚠️ Sua fatura está em atraso há ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''}
                  </p>
                </div>
              `
                  : `
                <p style="color: #f59e0b; font-weight: bold;">Sua fatura vence hoje!</p>
              `
              }
              
              <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; text-align: left; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>💰 Valor:</strong> R$ ${payload.amount.toFixed(2)}</p>
                <p style="margin: 5px 0;"><strong>📅 Vencimento:</strong> ${payload.dueDate}</p>
                <p style="margin: 5px 0;"><strong>🧾 Fatura:</strong> Para ${payload.recipientName}</p>
              </div>
              
              <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>💡 Formas de Pagamento:</strong><br>
                  PIX (5% desconto) • Cartão • Dinheiro na clínica
                </p>
              </div>
              
              ${
                payload.invoiceUrl
                  ? `
                <div style="margin: 25px 0;">
                  <a href="${payload.invoiceUrl}" style="display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    💳 Pagar Agora
                  </a>
                </div>
              `
                  : ''
              }
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Precisa renegociar? Entre em contato conosco.<br>
                Estamos aqui para ajudar! 🤝
              </p>
            </div>
            
            <footer style="text-align: center; padding-top: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${payload.clinicName} - Powered by NeonPro</p>
            </footer>
          </div>
        </body>
        </html>
      `;

      const emailResult = await resend.emails.send({
        from: `${payload.clinicName} Financeiro <billing@neonpro.app>`,
        to: [payload.recipientEmail],
        subject:
          daysOverdue > 0
            ? `⚠️ Pagamento em Atraso - R$ ${payload.amount.toFixed(2)} (${daysOverdue} dia${daysOverdue > 1 ? 's' : ''})`
            : `💰 Lembrete: Fatura vence hoje - R$ ${payload.amount.toFixed(2)}`,
        html: reminderHtml,
        headers: {
          'X-Invoice-ID': payload.invoiceId,
          'X-Clinic-ID': payload.clinicId,
          'X-Email-Type': 'payment-reminder',
        },
      });

      // Atualizar última data de lembrete
      await supabase
        .from('billing_invoices')
        .update({ last_reminder_sent: new Date().toISOString() })
        .eq('id', payload.invoiceId);

      logger.info('✅ Payment reminder sent successfully', {
        emailId: emailResult.data?.id,
        invoiceId: payload.invoiceId,
        daysOverdue,
      });

      return {
        success: true,
        emailId: emailResult.data?.id,
        invoiceId: payload.invoiceId,
        daysOverdue,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Failed to send payment reminder', {
        error: error instanceof Error ? error.message : error,
        invoiceId: payload.invoiceId,
      });

      throw error;
    }
  },
});
