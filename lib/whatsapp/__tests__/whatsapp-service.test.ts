import { WhatsAppService } from '../whatsapp-service'

// Mock do Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
  })),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

describe('WhatsAppService', () => {
  let whatsappService: WhatsAppService

  beforeEach(() => {
    whatsappService = new WhatsAppService()
    jest.clearAllMocks()
  })

  describe('getSettings', () => {
    it('deve retornar configurações do WhatsApp para usuário autenticado', async () => {
      const mockUser = { id: 'user-123' }
      const mockSettings = {
        whatsapp_api_key: 'test-api-key',
        whatsapp_phone_number: '+5511999999999',
        whatsapp_notifications: true,
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from().single.mockResolvedValue({
        data: mockSettings,
        error: null,
      })

      const result = await whatsappService.getSettings()

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(mockSupabase.from).toHaveBeenCalledWith('notification_settings')
      expect(result).toEqual(mockSettings)
    })

    it('deve lançar erro quando usuário não está autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await expect(whatsappService.getSettings()).rejects.toThrow('Usuário não autenticado')
    })

    it('deve lançar erro quando há erro no Supabase', async () => {
      const mockUser = { id: 'user-123' }
      const mockError = new Error('Database error')

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(whatsappService.getSettings()).rejects.toThrow('Database error')
    })
  })

  describe('sendMessage', () => {
    const mockMessage = {
      to: '+5511999999999',
      template: 'appointment_reminder',
      variables: ['João', 'Limpeza de Pele', '25/06/2025', '14:00', 'Clínica Bella'],
    }

    it('deve enviar mensagem quando WhatsApp está configurado', async () => {
      const mockSettings = {
        whatsapp_notifications: true,
        whatsapp_api_key: 'test-api-key',
        whatsapp_phone_number: '+5511888888888',
      }

      jest.spyOn(whatsappService, 'getSettings').mockResolvedValue(mockSettings)

      // Mock do método privado logMessage
      const logMessageSpy = jest.spyOn(whatsappService as any, 'logMessage').mockResolvedValue(undefined)

      const result = await whatsappService.sendMessage(mockMessage)

      expect(result).toBe(true)
      expect(logMessageSpy).toHaveBeenCalledWith(mockMessage, 'sent')
    })

    it('deve retornar false quando WhatsApp não está configurado', async () => {
      const mockSettings = {
        whatsapp_notifications: false,
        whatsapp_api_key: null,
        whatsapp_phone_number: null,
      }

      jest.spyOn(whatsappService, 'getSettings').mockResolvedValue(mockSettings)

      const result = await whatsappService.sendMessage(mockMessage)

      expect(result).toBe(false)
    })

    it('deve retornar false quando não há API key', async () => {
      const mockSettings = {
        whatsapp_notifications: true,
        whatsapp_api_key: null,
        whatsapp_phone_number: '+5511888888888',
      }

      jest.spyOn(whatsappService, 'getSettings').mockResolvedValue(mockSettings)

      const result = await whatsappService.sendMessage(mockMessage)

      expect(result).toBe(false)
    })

    it('deve registrar erro quando envio falha', async () => {
      const mockSettings = {
        whatsapp_notifications: true,
        whatsapp_api_key: 'test-api-key',
        whatsapp_phone_number: '+5511888888888',
      }

      const mockError = new Error('API Error')
      jest.spyOn(whatsappService, 'getSettings').mockRejectedValue(mockError)

      const logMessageSpy = jest.spyOn(whatsappService as any, 'logMessage').mockResolvedValue(undefined)

      const result = await whatsappService.sendMessage(mockMessage)

      expect(result).toBe(false)
      expect(logMessageSpy).toHaveBeenCalledWith(mockMessage, 'failed', mockError)
    })
  })

  describe('sendAppointmentReminder', () => {
    const mockAppointmentData = {
      client_name: 'João Silva',
      client_phone: '+5511999999999',
      service_name: 'Limpeza de Pele',
      appointment_date: '25/06/2025',
      appointment_time: '14:00',
      clinic_name: 'Clínica Bella',
    }

    it('deve enviar lembrete de agendamento', async () => {
      const sendMessageSpy = jest.spyOn(whatsappService, 'sendMessage').mockResolvedValue(true)

      const result = await whatsappService.sendAppointmentReminder(mockAppointmentData)

      expect(result).toBe(true)
      expect(sendMessageSpy).toHaveBeenCalledWith({
        to: mockAppointmentData.client_phone,
        template: 'appointment_reminder',
        variables: [
          mockAppointmentData.client_name,
          mockAppointmentData.service_name,
          mockAppointmentData.appointment_date,
          mockAppointmentData.appointment_time,
          mockAppointmentData.clinic_name,
        ],
      })
    })
  })

  describe('sendAppointmentConfirmation', () => {
    const mockAppointmentData = {
      client_name: 'Maria Santos',
      client_phone: '+5511888888888',
      service_name: 'Massagem Relaxante',
      appointment_date: '26/06/2025',
      appointment_time: '15:30',
      clinic_name: 'Spa Zen',
    }

    it('deve enviar confirmação de agendamento', async () => {
      const sendMessageSpy = jest.spyOn(whatsappService, 'sendMessage').mockResolvedValue(true)

      const result = await whatsappService.sendAppointmentConfirmation(mockAppointmentData)

      expect(result).toBe(true)
      expect(sendMessageSpy).toHaveBeenCalledWith({
        to: mockAppointmentData.client_phone,
        template: 'appointment_confirmation',
        variables: [
          mockAppointmentData.client_name,
          mockAppointmentData.service_name,
          mockAppointmentData.appointment_date,
          mockAppointmentData.appointment_time,
          mockAppointmentData.clinic_name,
        ],
      })
    })
  })

  describe('testConnection', () => {
    it('deve retornar sucesso quando tudo está configurado', async () => {
      const mockSettings = {
        whatsapp_notifications: true,
        whatsapp_api_key: 'test-api-key',
        whatsapp_phone_number: '+5511999999999',
      }

      jest.spyOn(whatsappService, 'getSettings').mockResolvedValue(mockSettings)

      const result = await whatsappService.testConnection()

      expect(result.success).toBe(true)
      expect(result.message).toBe('Conexão com WhatsApp Business configurada com sucesso')
    })

    it('deve retornar erro quando WhatsApp não está habilitado', async () => {
      const mockSettings = {
        whatsapp_notifications: false,
        whatsapp_api_key: 'test-api-key',
        whatsapp_phone_number: '+5511999999999',
      }

      jest.spyOn(whatsappService, 'getSettings').mockResolvedValue(mockSettings)

      const result = await whatsappService.testConnection()

      expect(result.success).toBe(false)
      expect(result.message).toBe('WhatsApp não está habilitado')
    })

    it('deve retornar erro quando API Key não está configurada', async () => {
      const mockSettings = {
        whatsapp_notifications: true,
        whatsapp_api_key: null,
        whatsapp_phone_number: '+5511999999999',
      }

      jest.spyOn(whatsappService, 'getSettings').mockResolvedValue(mockSettings)

      const result = await whatsappService.testConnection()

      expect(result.success).toBe(false)
      expect(result.message).toBe('API Key não configurada')
    })

    it('deve retornar erro quando número não está configurado', async () => {
      const mockSettings = {
        whatsapp_notifications: true,
        whatsapp_api_key: 'test-api-key',
        whatsapp_phone_number: null,
      }

      jest.spyOn(whatsappService, 'getSettings').mockResolvedValue(mockSettings)

      const result = await whatsappService.testConnection()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Número do WhatsApp não configurado')
    })
  })

  describe('getAvailableTemplates', () => {
    it('deve retornar lista de templates disponíveis', () => {
      const templates = whatsappService.getAvailableTemplates()

      expect(templates).toHaveLength(3)
      expect(templates[0]).toEqual({
        name: 'appointment_reminder',
        display_name: 'Lembrete de Agendamento',
        variables: ['nome_cliente', 'servico', 'data', 'hora', 'clinica'],
        sample: 'Olá {{1}}, você tem um agendamento de {{2}} marcado para {{3}} às {{4}} na {{5}}. Confirme sua presença!'
      })
    })

    it('deve incluir template de confirmação', () => {
      const templates = whatsappService.getAvailableTemplates()
      const confirmationTemplate = templates.find(t => t.name === 'appointment_confirmation')

      expect(confirmationTemplate).toBeDefined()
      expect(confirmationTemplate?.display_name).toBe('Confirmação de Agendamento')
    })

    it('deve incluir template de cancelamento', () => {
      const templates = whatsappService.getAvailableTemplates()
      const cancellationTemplate = templates.find(t => t.name === 'appointment_cancellation')

      expect(cancellationTemplate).toBeDefined()
      expect(cancellationTemplate?.display_name).toBe('Cancelamento de Agendamento')
    })
  })
})
