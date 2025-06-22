import { createClient } from '@/lib/supabase/client'
import { whatsappService } from '@/lib/whatsapp/whatsapp-service'

interface NotificationData {
  client_name: string
  client_email?: string
  client_phone?: string
  service_name: string
  appointment_date: string
  appointment_time: string
  clinic_name: string
  professional_name?: string
}

interface NotificationSettings {
  email_notifications: boolean
  sms_notifications: boolean
  whatsapp_notifications: boolean
  appointment_reminders: boolean
  appointment_confirmations: boolean
  cancellation_notifications: boolean
  reminder_hours_before: number
  email_template_reminder?: string
  email_template_confirmation?: string
}

export class NotificationService {
  private supabase = createClient()

  async getSettings(): Promise<NotificationSettings | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Erro ao buscar configurações de notificação:', error)
      return null
    }

    return data
  }

  async sendAppointmentReminder(notificationData: NotificationData): Promise<boolean> {
    const settings = await this.getSettings()
    if (!settings || !settings.appointment_reminders) {
      return false
    }

    let success = false

    // Enviar por WhatsApp
    if (settings.whatsapp_notifications && notificationData.client_phone) {
      try {
        const whatsappSuccess = await whatsappService.sendAppointmentReminder({
          client_name: notificationData.client_name,
          client_phone: notificationData.client_phone,
          service_name: notificationData.service_name,
          appointment_date: notificationData.appointment_date,
          appointment_time: notificationData.appointment_time,
          clinic_name: notificationData.clinic_name
        })
        success = success || whatsappSuccess
      } catch (error) {
        console.error('Erro ao enviar lembrete por WhatsApp:', error)
      }
    }

    // Enviar por email
    if (settings.email_notifications && notificationData.client_email) {
      try {
        const emailSuccess = await this.sendEmailReminder(notificationData, settings)
        success = success || emailSuccess
      } catch (error) {
        console.error('Erro ao enviar lembrete por email:', error)
      }
    }

    // Log da notificação
    await this.logNotification({
      type: 'reminder',
      client_name: notificationData.client_name,
      success,
      channels: this.getActiveChannels(settings)
    })

    return success
  }

  async sendAppointmentConfirmation(notificationData: NotificationData): Promise<boolean> {
    const settings = await this.getSettings()
    if (!settings || !settings.appointment_confirmations) {
      return false
    }

    let success = false

    // Enviar por WhatsApp
    if (settings.whatsapp_notifications && notificationData.client_phone) {
      try {
        const whatsappSuccess = await whatsappService.sendAppointmentConfirmation({
          client_name: notificationData.client_name,
          client_phone: notificationData.client_phone,
          service_name: notificationData.service_name,
          appointment_date: notificationData.appointment_date,
          appointment_time: notificationData.appointment_time,
          clinic_name: notificationData.clinic_name
        })
        success = success || whatsappSuccess
      } catch (error) {
        console.error('Erro ao enviar confirmação por WhatsApp:', error)
      }
    }

    // Enviar por email
    if (settings.email_notifications && notificationData.client_email) {
      try {
        const emailSuccess = await this.sendEmailConfirmation(notificationData, settings)
        success = success || emailSuccess
      } catch (error) {
        console.error('Erro ao enviar confirmação por email:', error)
      }
    }

    // Log da notificação
    await this.logNotification({
      type: 'confirmation',
      client_name: notificationData.client_name,
      success,
      channels: this.getActiveChannels(settings)
    })

    return success
  }

  async sendAppointmentCancellation(notificationData: NotificationData): Promise<boolean> {
    const settings = await this.getSettings()
    if (!settings || !settings.cancellation_notifications) {
      return false
    }

    let success = false

    // Enviar por WhatsApp
    if (settings.whatsapp_notifications && notificationData.client_phone) {
      try {
        const whatsappSuccess = await whatsappService.sendAppointmentCancellation({
          client_name: notificationData.client_name,
          client_phone: notificationData.client_phone,
          service_name: notificationData.service_name,
          appointment_date: notificationData.appointment_date,
          appointment_time: notificationData.appointment_time,
          clinic_name: notificationData.clinic_name
        })
        success = success || whatsappSuccess
      } catch (error) {
        console.error('Erro ao enviar cancelamento por WhatsApp:', error)
      }
    }

    // Enviar por email
    if (settings.email_notifications && notificationData.client_email) {
      try {
        const emailSuccess = await this.sendEmailCancellation(notificationData, settings)
        success = success || emailSuccess
      } catch (error) {
        console.error('Erro ao enviar cancelamento por email:', error)
      }
    }

    // Log da notificação
    await this.logNotification({
      type: 'cancellation',
      client_name: notificationData.client_name,
      success,
      channels: this.getActiveChannels(settings)
    })

    return success
  }

  private async sendEmailReminder(data: NotificationData, settings: NotificationSettings): Promise<boolean> {
    // Implementar envio de email
    // Por enquanto, simular o envio
    console.log('Enviando lembrete por email para:', data.client_email)
    
    // Aqui você integraria com um serviço de email como SendGrid, Resend, etc.
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return true
  }

  private async sendEmailConfirmation(data: NotificationData, settings: NotificationSettings): Promise<boolean> {
    // Implementar envio de email de confirmação
    console.log('Enviando confirmação por email para:', data.client_email)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return true
  }

  private async sendEmailCancellation(data: NotificationData, settings: NotificationSettings): Promise<boolean> {
    // Implementar envio de email de cancelamento
    console.log('Enviando cancelamento por email para:', data.client_email)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return true
  }

  private getActiveChannels(settings: NotificationSettings): string[] {
    const channels = []
    if (settings.email_notifications) channels.push('email')
    if (settings.whatsapp_notifications) channels.push('whatsapp')
    if (settings.sms_notifications) channels.push('sms')
    return channels
  }

  private async logNotification(logData: {
    type: string
    client_name: string
    success: boolean
    channels: string[]
  }) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      await this.supabase
        .from('notification_logs')
        .insert([{
          user_id: user.id,
          type: logData.type,
          client_name: logData.client_name,
          success: logData.success,
          channels: logData.channels,
          sent_at: new Date().toISOString()
        }])
    } catch (error) {
      console.error('Erro ao registrar log de notificação:', error)
    }
  }

  // Método para agendar lembretes automáticos
  async scheduleReminders(): Promise<void> {
    const settings = await this.getSettings()
    if (!settings || !settings.appointment_reminders) {
      return
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return

    // Buscar agendamentos que precisam de lembrete
    const reminderTime = new Date()
    reminderTime.setHours(reminderTime.getHours() + settings.reminder_hours_before)

    const { data: appointments } = await this.supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        clients (
          full_name,
          email,
          phone
        ),
        services (
          name
        ),
        professionals (
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .gte('start_time', reminderTime.toISOString())
      .lte('start_time', new Date(reminderTime.getTime() + 60 * 60 * 1000).toISOString()) // 1 hora de janela

    if (appointments) {
      for (const appointment of appointments) {
        if (appointment.clients && appointment.services) {
          await this.sendAppointmentReminder({
            client_name: appointment.clients.full_name,
            client_email: appointment.clients.email,
            client_phone: appointment.clients.phone,
            service_name: appointment.services.name,
            appointment_date: new Date(appointment.start_time).toLocaleDateString('pt-BR'),
            appointment_time: new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            clinic_name: 'Sua Clínica', // Buscar das configurações da clínica
            professional_name: appointment.professionals?.name
          })
        }
      }
    }
  }
}

// Instância singleton
export const notificationService = new NotificationService()
