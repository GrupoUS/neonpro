import { createClient } from '@/lib/supabase/client'

interface WhatsAppMessage {
  to: string
  template: string
  variables?: string[]
}

interface AppointmentData {
  client_name: string
  client_phone: string
  service_name: string
  appointment_date: string
  appointment_time: string
  clinic_name: string
}

export class WhatsAppService {
  private supabase = createClient()

  async getSettings() {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await this.supabase
      .from('notification_settings')
      .select('whatsapp_api_key, whatsapp_phone_number, whatsapp_notifications')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const settings = await this.getSettings()
      
      if (!settings?.whatsapp_notifications || !settings?.whatsapp_api_key) {
        console.log('WhatsApp não configurado ou desabilitado')
        return false
      }

      // Aqui você integraria com a API real do WhatsApp Business
      // Por enquanto, vamos simular o envio
      console.log('Enviando mensagem WhatsApp:', {
        to: message.to,
        template: message.template,
        variables: message.variables,
        apiKey: settings.whatsapp_api_key?.substring(0, 10) + '...'
      })

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Log da mensagem enviada
      await this.logMessage(message, 'sent')

      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error)
      await this.logMessage(message, 'failed', error as Error)
      return false
    }
  }

  async sendAppointmentReminder(appointmentData: AppointmentData): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: appointmentData.client_phone,
      template: 'appointment_reminder',
      variables: [
        appointmentData.client_name,
        appointmentData.service_name,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.clinic_name
      ]
    }

    return this.sendMessage(message)
  }

  async sendAppointmentConfirmation(appointmentData: AppointmentData): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: appointmentData.client_phone,
      template: 'appointment_confirmation',
      variables: [
        appointmentData.client_name,
        appointmentData.service_name,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.clinic_name
      ]
    }

    return this.sendMessage(message)
  }

  async sendAppointmentCancellation(appointmentData: AppointmentData): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: appointmentData.client_phone,
      template: 'appointment_cancellation',
      variables: [
        appointmentData.client_name,
        appointmentData.service_name,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.clinic_name
      ]
    }

    return this.sendMessage(message)
  }

  private async logMessage(message: WhatsAppMessage, status: 'sent' | 'failed', error?: Error) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      await this.supabase
        .from('whatsapp_logs')
        .insert([{
          user_id: user.id,
          to_number: message.to,
          template: message.template,
          variables: message.variables,
          status,
          error_message: error?.message,
          sent_at: new Date().toISOString()
        }])
    } catch (logError) {
      console.error('Erro ao registrar log do WhatsApp:', logError)
    }
  }

  // Método para testar a configuração
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const settings = await this.getSettings()
      
      if (!settings?.whatsapp_notifications) {
        return { success: false, message: 'WhatsApp não está habilitado' }
      }

      if (!settings?.whatsapp_api_key) {
        return { success: false, message: 'API Key não configurada' }
      }

      if (!settings?.whatsapp_phone_number) {
        return { success: false, message: 'Número do WhatsApp não configurado' }
      }

      // Aqui você faria uma chamada real para a API do WhatsApp para testar
      // Por enquanto, vamos simular
      await new Promise(resolve => setTimeout(resolve, 500))

      return { success: true, message: 'Conexão com WhatsApp Business configurada com sucesso' }
    } catch (error) {
      return { 
        success: false, 
        message: `Erro ao testar conexão: ${(error as Error).message}` 
      }
    }
  }

  // Método para obter templates disponíveis
  getAvailableTemplates() {
    return [
      {
        name: 'appointment_reminder',
        display_name: 'Lembrete de Agendamento',
        variables: ['nome_cliente', 'servico', 'data', 'hora', 'clinica'],
        sample: 'Olá {{1}}, você tem um agendamento de {{2}} marcado para {{3}} às {{4}} na {{5}}. Confirme sua presença!'
      },
      {
        name: 'appointment_confirmation',
        display_name: 'Confirmação de Agendamento',
        variables: ['nome_cliente', 'servico', 'data', 'hora', 'clinica'],
        sample: 'Olá {{1}}, seu agendamento de {{2}} foi confirmado para {{3}} às {{4}} na {{5}}. Aguardamos você!'
      },
      {
        name: 'appointment_cancellation',
        display_name: 'Cancelamento de Agendamento',
        variables: ['nome_cliente', 'servico', 'data', 'hora', 'clinica'],
        sample: 'Olá {{1}}, seu agendamento de {{2}} marcado para {{3}} às {{4}} na {{5}} foi cancelado.'
      }
    ]
  }
}

// Instância singleton
export const whatsappService = new WhatsAppService()
