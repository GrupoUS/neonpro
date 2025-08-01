import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST, GET, PUT } from '@/app/api/scheduling/reminders/route'

// Mock dependencies
jest.mock('@/app/utils/supabase/server')
jest.mock('@/lib/communication/scheduling-templates')
jest.mock('@/lib/communication/scheduling-workflow')
jest.mock('@/lib/communication/communication-service')

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn()
      })),
      gte: jest.fn(() => ({
        lte: jest.fn(() => ({
          order: jest.fn()
        }))
      }))
    }))
  }))
}

const mockCreateClient = jest.fn(() => Promise.resolve(mockSupabase))

beforeEach(() => {
  jest.clearAllMocks()
  require('@/app/utils/supabase/server').createClient = mockCreateClient
})

describe('/api/scheduling/reminders', () => {
  const mockUser = {
    id: '350e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com'
  }

  const mockAppointment = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    patient_id: 'patient-123',
    clinic_id: '450e8400-e29b-41d4-a716-446655440000',
    date: '2024-01-15T10:00:00Z',
    patients: {
      id: 'patient-123',
      name: 'João Silva',
      phone: '+5511999999999',
      email: 'joao@example.com'
    },
    professionals: {
      id: 'prof-123',
      name: 'Dr. Maria Santos'
    },
    services: {
      id: 'service-123',
      name: 'Consulta Dermatológica',
      category: 'dermatology'
    },
    clinics: {
      id: '450e8400-e29b-41d4-a716-446655440000',
      name: 'Clínica Beleza',
      phone: '+5511888888888'
    }
  }

  describe('POST /api/scheduling/reminders', () => {
    it('should schedule reminders using workflow by default', async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockAppointment,
              error: null
            })
          })
        })
      })

      // Mock workflow
      const mockWorkflows = [
        {
          id: 'workflow-123',
          workflowType: 'reminder',
          scheduledAt: new Date(),
          status: 'scheduled',
          metadata: { timing: '24h' }
        }
      ]

      const mockWorkflowModule = require('@/lib/communication/scheduling-workflow')
      mockWorkflowModule.schedulingCommunicationWorkflow = {
        initializeWorkflows: jest.fn().mockResolvedValue(mockWorkflows)
      }

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: '550e8400-e29b-41d4-a716-446655440000',
          reminderTypes: ['24h', '2h'],
          channels: ['whatsapp', 'sms'],
          useWorkflow: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.method).toBe('workflow')
      expect(data.workflows).toHaveLength(1)
      expect(mockWorkflowModule.schedulingCommunicationWorkflow.initializeWorkflows).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        expect.objectContaining({
          reminderSettings: expect.objectContaining({
            enabled24h: true,
            enabled2h: true,
            channels: ['whatsapp', 'sms']
          })
        })
      )
    })

    it('should handle immediate reminders', async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockAppointment,
              error: null
            }),
            gte: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: null
              })
            })
          })
        }),
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'reminder-123' }],
          error: null
        })
      })

      // Mock communication service
      const mockCommunicationService = {
        sendMessage: jest.fn().mockResolvedValue({
          success: true,
          messageId: 'msg-123',
          cost: 0.05
        })
      }
      
      const mockCommModule = require('@/lib/communication/communication-service')
      mockCommModule.CommunicationService = jest.fn(() => mockCommunicationService)

      // Mock template engine
      const mockTemplateEngine = {
        selectBestTemplate: jest.fn().mockReturnValue({
          id: 'template-123',
          type: 'reminder'
        }),
        renderTemplate: jest.fn().mockResolvedValue('Lembrete: Sua consulta é amanhã às 10:00')
      }

      const mockTemplateModule = require('@/lib/communication/scheduling-templates')
      mockTemplateModule.schedulingTemplateEngine = mockTemplateEngine

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: '550e8400-e29b-41d4-a716-446655440000',
          immediate: true,
          channel: 'whatsapp',
          force: false
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.method).toBe('immediate')
      expect(data.messageId).toBe('msg-123')
      expect(mockCommunicationService.sendMessage).toHaveBeenCalled()
    })

    it('should prevent duplicate immediate reminders', async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockRecentReminder = {
        id: 'reminder-456',
        appointment_id: '550e8400-e29b-41d4-a716-446655440000',
        reminder_type: 'immediate',
        sent_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'appointments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockAppointment,
                  error: null
                })
              })
            })
          }
        } else if (table === 'appointment_reminders') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  gte: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockRecentReminder,
                      error: null
                    })
                  })
                })
              })
            })
          }
        }
      })

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: '550e8400-e29b-41d4-a716-446655440000',
          immediate: true,
          channel: 'whatsapp',
          force: false
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already sent recently')
    })

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized')
      })

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: '550e8400-e29b-41d4-a716-446655440000',
          reminderTypes: ['24h'],
          channels: ['whatsapp']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should validate request schema', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: 'invalid-uuid',
          reminderTypes: ['invalid-type'],
          channels: ['invalid-channel']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
    })

    it('should handle appointment not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Not found')
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: '550e8400-e29b-41d4-a716-446655440000',
          reminderTypes: ['24h'],
          channels: ['whatsapp']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Appointment not found')
    })
  })

  describe('GET /api/scheduling/reminders', () => {
    it('should fetch reminders with filters', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockReminders = [
        {
          id: 'reminder-1',
          appointment_id: '550e8400-e29b-41d4-a716-446655440000',
          reminder_type: '24h',
          status: 'sent',
          scheduled_time: '2024-01-14T10:00:00Z'
        },
        {
          id: 'reminder-2',
          appointment_id: '550e8400-e29b-41d4-a716-446655440000',
          reminder_type: '2h',
          status: 'scheduled',
          scheduled_time: '2024-01-15T08:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockReminders,
              error: null
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders?appointmentId=550e8400-e29b-41d4-a716-446655440000')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.reminders).toHaveLength(2)
      expect(data.count.reminders).toBe(2)
    })

    it('should fetch workflow information when workflowId provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockWorkflow = {
        id: 'workflow-123',
        workflowType: 'reminder',
        status: 'scheduled',
        steps: [
          { id: 'step-1', type: 'send_message', status: 'pending' }
        ]
      }

      const mockWorkflowModule = require('@/lib/communication/scheduling-workflow')
      mockWorkflowModule.schedulingCommunicationWorkflow = {
        getWorkflow: jest.fn().mockResolvedValue(mockWorkflow)
      }

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders?workflowId=workflow-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.workflow).toEqual(mockWorkflow)
    })
  })

  describe('PUT /api/scheduling/reminders (bulk)', () => {
    it('should schedule bulk reminders for all appointments on date', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockAppointments = [
        { id: '550e8400-e29b-41d4-a716-446655440001' },
        { id: '550e8400-e29b-41d4-a716-446655440002' },
        { id: '550e8400-e29b-41d4-a716-446655440003' }
      ]

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'appointments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                      data: mockAppointments,
                      error: null
                    })
                  })
                })
              })
            })
          }
        }
        return mockSupabase.from()
      })

      // Mock workflow for each appointment
      const mockWorkflowModule = require('@/lib/communication/scheduling-workflow')
      mockWorkflowModule.schedulingCommunicationWorkflow = {
        initializeWorkflows: jest.fn().mockResolvedValue([
          { id: 'workflow-1', workflowType: 'reminder' }
        ])
      }

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'PUT',
        body: JSON.stringify({
          date: '2024-01-15',
          clinicId: '450e8400-e29b-41d4-a716-446655440000',
          reminderType: '24h',
          channels: ['whatsapp'],
          useWorkflow: true
        })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed).toBe(3)
      expect(data.successful).toBe(3)
      expect(data.failed).toBe(0)
      expect(mockWorkflowModule.schedulingCommunicationWorkflow.initializeWorkflows).toHaveBeenCalledTimes(3)
    })

    it('should handle no appointments found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'PUT',
        body: JSON.stringify({
          date: '2024-01-15',
          clinicId: '450e8400-e29b-41d4-a716-446655440000',
          reminderType: '24h',
          channels: ['whatsapp']
        })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed).toBe(0)
      expect(data.message).toContain('No appointments found')
    })
  })

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error('Database connection failed'))
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/scheduling/reminders', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: '550e8400-e29b-41d4-a716-446655440000',
          reminderTypes: ['24h'],
          channels: ['whatsapp']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})