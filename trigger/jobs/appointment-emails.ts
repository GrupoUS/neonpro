import { logger, task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { client, JOB_IDS, type AppointmentJobPayload, type EmailJobPayload } from "../client";
import { createClient } from "@/app/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 📧 APPOINTMENT CONFIRMATION EMAIL
 * Automatiza envio de confirmação de consulta
 * Integra com o sistema de appointments existente
 */
export const appointmentConfirmationEmail = task({
  id: JOB_IDS.APPOINTMENT_CONFIRMATION,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: AppointmentJobPayload) => {
    logger.info("🏥 Sending appointment confirmation", { 
      appointmentId: payload.appointmentId,
      recipientEmail: payload.recipientEmail 
    });

    try {
      // Buscar detalhes completos da consulta via Supabase (usando sistema existente)
      const supabase = createClient();
      
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          notes,
          patients (
            full_name,
            email,
            phone
          ),
          professionals (
            name,
            specialty
          ),
          service_types (
            name,
            duration_minutes,
            price
          )
        `)
        .eq('id', payload.appointmentId)
        .single();

      if (error || !appointment) {
        throw new Error(`Appointment not found: ${payload.appointmentId}`);
      }

      // Template de email profissional para clínica de estética
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmação de Consulta - ${payload.clinicName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <header style="text-align: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">${payload.clinicName}</h1>
              <p style="color: #666; margin: 5px 0;">Consulta Confirmada ✨</p>
            </header>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Olá, ${payload.recipientName}!</h2>
              <p>Sua consulta foi confirmada com sucesso. Aqui estão os detalhes:</p>
              
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <p><strong>📅 Data:</strong> ${new Date(appointment.appointment_date).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>🕐 Horário:</strong> ${appointment.appointment_time}</p>
                <p><strong>👨‍⚕️ Profissional:</strong> ${appointment.professionals?.name}</p>
                <p><strong>💅 Serviço:</strong> ${appointment.service_types?.name}</p>
                <p><strong>⏱️ Duração:</strong> ${appointment.service_types?.duration_minutes} minutos</p>
                ${appointment.service_types?.price ? `<p><strong>💰 Valor:</strong> R$ ${appointment.service_types.price.toFixed(2)}</p>` : ''}
              </div>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">📝 Lembrete Importante</h3>
              <ul style="color: #92400e; margin: 0;">
                <li>Chegue 10 minutos antes do horário marcado</li>
                <li>Traga um documento de identidade</li>
                <li>Para reagendamentos, entre em contato conosco</li>
                ${appointment.notes ? `<li>Observação especial: ${appointment.notes}</li>` : ''}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p>Precisa reagendar ou tem alguma dúvida?</p>
              <p style="color: #666; font-size: 14px;">
                Entre em contato conosco<br>
                📱 WhatsApp: Disponível no seu painel<br>
                ✉️ Email: Responda este email
              </p>
            </div>
            
            <footer style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${payload.clinicName} - Powered by NeonPro</p>
              <p>Este é um email automático. Você recebeu porque tem uma consulta agendada conosco.</p>
            </footer>
          </div>
        </body>
        </html>
      `;

      // Enviar email via Resend (integrando com sistema existente)
      const emailResult = await resend.emails.send({
        from: `${payload.clinicName} <noreply@neonpro.app>`,
        to: [payload.recipientEmail],
        subject: `✨ Consulta Confirmada - ${payload.appointmentDate} às ${payload.appointmentTime}`,
        html: emailHtml,
        headers: {
          'X-Appointment-ID': payload.appointmentId,
          'X-Clinic-ID': payload.clinicId,
        },
      });

      logger.info("✅ Appointment confirmation sent successfully", {
        emailId: emailResult.data?.id,
        appointmentId: payload.appointmentId,
        recipientEmail: payload.recipientEmail,
      });

      // Atualizar appointment para marcar que confirmação foi enviada
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          confirmation_sent_at: new Date().toISOString(),
          status: appointment.status === 'pending' ? 'confirmed' : appointment.status
        })
        .eq('id', payload.appointmentId);

      if (updateError) {
        logger.warn("⚠️ Failed to update appointment confirmation status", { 
          error: updateError,
          appointmentId: payload.appointmentId 
        });
      }

      return {
        success: true,
        emailId: emailResult.data?.id,
        appointmentId: payload.appointmentId,
        sentAt: new Date().toISOString(),
      };

    } catch (error) {
      logger.error("❌ Failed to send appointment confirmation", { 
        error: error instanceof Error ? error.message : error,
        appointmentId: payload.appointmentId,
        recipientEmail: payload.recipientEmail,
      });
      
      throw error;
    }
  },
});

/**
 * 📱 APPOINTMENT REMINDER EMAIL (24h antes)  
 * Reduz no-shows automaticamente
 */
export const appointmentReminderEmail = task({
  id: JOB_IDS.APPOINTMENT_REMINDER,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: AppointmentJobPayload) => {
    logger.info("⏰ Sending appointment reminder", { 
      appointmentId: payload.appointmentId 
    });

    try {
      const supabase = createClient();
      
      // Verificar se lembrete já foi enviado
      const { data: appointment } = await supabase
        .from('appointments')
        .select('reminder_sent_at, status, appointment_date, appointment_time')
        .eq('id', payload.appointmentId)
        .single();

      if (appointment?.reminder_sent_at) {
        logger.info("⚠️ Reminder already sent, skipping", { 
          appointmentId: payload.appointmentId 
        });
        return { success: true, skipped: true, reason: 'already_sent' };
      }

      if (appointment?.status === 'cancelled') {
        logger.info("⚠️ Appointment cancelled, skipping reminder", { 
          appointmentId: payload.appointmentId 
        });
        return { success: true, skipped: true, reason: 'cancelled' };
      }

      // Template de lembrete mais direto e amigável
      const reminderHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Lembrete de Consulta - ${payload.clinicName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">⏰ Lembrete de Consulta</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${payload.clinicName}</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; text-align: center;">
              <h2 style="color: #1e40af; margin-top: 0;">Olá, ${payload.recipientName}! 👋</h2>
              <p style="font-size: 16px; margin-bottom: 20px;">Sua consulta é <strong>amanhã</strong>!</p>
              
              <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; text-align: left; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${payload.appointmentDate}</p>
                <p style="margin: 5px 0;"><strong>🕐 Horário:</strong> ${payload.appointmentTime}</p>
                <p style="margin: 5px 0;"><strong>👨‍⚕️ Profissional:</strong> ${payload.professionalName}</p>
                <p style="margin: 5px 0;"><strong>💅 Serviço:</strong> ${payload.serviceName}</p>
              </div>
              
              <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;"><strong>💡 Dica:</strong> Chegue 10 minutos antes para um atendimento mais tranquilo!</p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Precisa reagendar? Entre em contato conosco o quanto antes.<br>
                Estamos ansiosos para atendê-la! ✨
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
        from: `${payload.clinicName} <noreply@neonpro.app>`,
        to: [payload.recipientEmail],
        subject: `⏰ Lembrete: Sua consulta é amanhã - ${payload.appointmentTime}`,
        html: reminderHtml,
        headers: {
          'X-Appointment-ID': payload.appointmentId,
          'X-Clinic-ID': payload.clinicId,
          'X-Email-Type': 'reminder',
        },
      });

      // Marcar lembrete como enviado
      await supabase
        .from('appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', payload.appointmentId);

      logger.info("✅ Appointment reminder sent successfully", {
        emailId: emailResult.data?.id,
        appointmentId: payload.appointmentId,
      });

      return {
        success: true,
        emailId: emailResult.data?.id,
        appointmentId: payload.appointmentId,
        sentAt: new Date().toISOString(),
      };

    } catch (error) {
      logger.error("❌ Failed to send appointment reminder", { 
        error: error instanceof Error ? error.message : error,
        appointmentId: payload.appointmentId,
      });
      
      throw error;
    }
  },
});