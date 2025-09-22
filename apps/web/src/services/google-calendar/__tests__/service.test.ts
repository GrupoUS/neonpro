import { createClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleCalendarCompliance } from '../compliance';
import { GoogleCalendarService } from '../service';

// Mock dependencies
vi.mock(('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
})

describe(('GoogleCalendarService', () => {
  let _service: GoogleCalendarService;
  let mockSupabase: any;
  let mockClient: any;
  let mockCompliance: any;

  const mockUser = {
    id: 'user-123',
    email: 'doctor@neonpro.com.br',
  };

  const mockAppointment = {
    id: 'appt-123',
    patientId: 'patient-456',
    doctorId: 'doctor-789',
    clinicId: 'clinic-101',
    title: 'Consulta de Rotina',
    description: 'Consulta de acompanhamento',
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-15T11:00:00'),
    location: 'Sala 101',
    status: 'SCHEDULED',
    type: 'CONSULTATION',
    virtual: false,
    metadata: {
      specialty: 'Cardiologia',
      confidential: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks(

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            data: null,
            error: null,
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [{ id: 'integration-123' }],
            error: null,
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    };
    (createClient as any).mockReturnValue(mockSupabase

    // Setup client mock
    mockClient = {
      getAuthUrl: vi
        .fn()
        .mockReturnValue('https://accounts.google.com/o/oauth2/auth'),
      exchangeCodeForTokens: vi.fn(),
      listCalendars: vi
        .fn()
        .mockResolvedValue([{ id: 'primary', summary: 'Primary Calendar' }]),
      createEvent: vi.fn().mockResolvedValue({ id: 'event-123' }),
      updateEvent: vi.fn().mockResolvedValue({ id: 'event-123' }),
      deleteEvent: vi.fn(),
      listEvents: vi.fn().mockResolvedValue([]),
      setTokens: vi.fn(),
    };

    // Setup compliance mock
    mockCompliance = {
      validateDataProcessing: vi.fn().mockResolvedValue(true),
      logDataAccess: vi.fn(),
      logDataDeletion: vi.fn(),
      validateConsent: vi.fn().mockResolvedValue(true),
      encryptSensitiveData: vi.fn(data => `encrypted:${data}`),
      decryptSensitiveData: vi.fn(data => data.replace('encrypted:', '')),
    };

    const { GoogleCalendarClient } = require('../client')
    GoogleCalendarClient.mockImplementation(() => mockClient

    const { GoogleCalendarCompliance } = require('../compliance')
    GoogleCalendarCompliance.mockImplementation(() => mockCompliance

    service = new GoogleCalendarService(
  }

  describe(('Integration Management', () => {
    it(_'should create new integration',async () => {
      const integration = await service.createIntegration({
        _userId: mockUser.id,
        clinicId: 'clinic-101',
        calendarId: 'primary',
      }

      expect(mockSupabase.from).toHaveBeenCalledWith(
        'google_calendar_integrations',
      
      expect(integration).toEqual([{ id: 'integration-123' }]
    }

    it(_'should get user integration',async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'integration-123',
                user_id: mockUser.id,
                calendar_id: 'primary',
                sync_enabled: true,
              },
              error: null,
            }),
          })),
        })),
      }

      const integration = await service.getUserIntegration(mockUser.id

      expect(integration).toEqual({
        id: 'integration-123',
        user_id: mockUser.id,
        calendar_id: 'primary',
        sync_enabled: true,
      }
    }

    it(_'should update integration settings',async () => {
      await service.updateIntegration('integration-123', {
        syncEnabled: false,
        autoSync: false,
      }

      expect(mockSupabase.from).toHaveBeenCalledWith(
        'google_calendar_integrations',
      
    }

    it(_'should delete integration',async () => {

      expect(mockCompliance.logDataDeletion).toHaveBeenCalled(
    }
  }

  describe(('Event Synchronization', () => {
    beforeEach(async () => {
      // Setup integration
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'integration-123',
                user_id: mockUser.id,
                calendar_id: 'primary',
                access_token: 'encrypted:token',
                refresh_token: 'encrypted:refresh',
                sync_enabled: true,
              },
              error: null,
            }),
          })),
        })),
      }

      await service.syncAppointmentToCalendar(mockAppointment
    }

    it(_'should sync appointment to calendar',async () => {
      expect(mockClient.setTokens).toHaveBeenCalledWith({
        access_token: 'token',
        refresh_token: 'refresh',
      }

      expect(mockClient.createEvent).toHaveBeenCalledWith('primary', {
        summary: 'Consulta de Rotina',
        description: 'Consulta de acompanhamento',
        start: mockAppointment.startTime,
        end: mockAppointment.endTime,
        location: 'Sala 101',
        attendees: expect.arrayContaining([
          expect.objectContaining({
            email: mockUser.email,
          }),
        ]),
        metadata: {
          appointmentId: mockAppointment.id,
          patientId: mockAppointment.patientId,
          doctorId: mockAppointment.doctorId,
          clinicId: mockAppointment.clinicId,
          healthcareType: mockAppointment.type,
          confidential: mockAppointment.metadata.confidential,
          specialty: mockAppointment.metadata.specialty,
        },
      }

      expect(mockCompliance.validateDataProcessing).toHaveBeenCalled(
    }

    it(_'should update synced appointment',async () => {
      const updatedAppointment = {
        ...mockAppointment,
        title: 'Consulta Remarcada',
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T15:00:00'),
      };

      // Mock existing sync record
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'sync-123',
                google_event_id: 'event-123',
              },
              error: null,
            }),
          })),
        })),
      }

      await service.syncAppointmentToCalendar(updatedAppointment

      expect(mockClient.updateEvent).toHaveBeenCalledWith(
        'primary',
        'event-123',
        {
          summary: 'Consulta Remarcada',
          start: updatedAppointment.startTime,
          end: updatedAppointment.endTime,
        },
      
    }

    it(_'should cancel appointment in calendar',async () => {
      const cancelledAppointment = {
        ...mockAppointment,
        status: 'CANCELLED',
      };

      // Mock existing sync record
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'sync-123',
                google_event_id: 'event-123',
              },
              error: null,
            }),
          })),
        })),
      }

      await service.syncAppointmentToCalendar(cancelledAppointment

      expect(mockClient.deleteEvent).toHaveBeenCalledWith(
        'primary',
        'event-123',
      
    }

    it(_'should handle sync conflicts',async () => {
      // Mock conflicting event in Google Calendar
      mockClient.listEvents.mockResolvedValueOnce([
        {
          id: 'event-conflict',
          summary: 'Other Appointment',
          start: { dateTime: '2024-01-15T10:30:00-03:00' },
          end: { dateTime: '2024-01-15T11:30:00-03:00' },
        },
      ]

      const conflict = await service.checkForConflicts(
        mockAppointment.startTime,
        mockAppointment.endTime,
        'primary',
      

      expect(conflict).toHaveLength(1
      expect(conflict[0].id).toBe('event-conflict')
    }
  }

  describe(('Bidirectional Sync', () => {
    it(_'should sync Google events to appointments',async () => {
      const googleEvents = [
        {
          id: 'google-event-123',
          summary: 'Patient Meeting',
          description: 'Follow up consultation',
          start: { dateTime: '2024-01-16T10:00:00-03:00' },
          end: { dateTime: '2024-01-16T11:00:00-03:00' },
          extendedProperties: {
            private: {
              appointmentId: 'appt-456',
            },
          },
        },
      ];

      mockClient.listEvents.mockResolvedValueOnce(googleEvents

      const synced = await service.syncFromGoogle('primary')

      expect(synced).toHaveLength(1
      expect(mockCompliance.validateDataProcessing).toHaveBeenCalled(
    }

    it(_'should handle webhook events',async () => {
      const webhookEvent = {
        kind: 'event#sync',
        id: 'webhook-123',
        resourceId: 'resource-123',
        channelId: 'channel-123',
        resourceState: 'exists',
        changed: true,
      };

      await service.handleWebhookEvent(webhookEvent

      expect(mockClient.listEvents).toHaveBeenCalled(
    }
  }

  describe(('Error Handling', () => {
    it(_'should handle authentication errors',async () => {
      mockClient.listCalendars.mockRejectedValue({
        code: 401,
        message: 'Token expired',
      }

      await expect(service.getCalendars(mockUser.id)).rejects.toThrow(
        'Calendar authentication failed',
      
    }

    it(_'should handle rate limit errors',async () => {
      mockClient.createEvent.mockRejectedValue({
        code: 429,
        message: 'Rate limit exceeded',
      }

      await expect(
        service.syncAppointmentToCalendar(mockAppointment),
      ).rejects.toThrow('Calendar API rate limit exceeded')
    }

    it(_'should handle network errors gracefully',async () => {

      const result = await service.syncAppointmentToCalendar(mockAppointment

      expect(result).toBeNull(
      // Should have logged the error
    }
  }

  describe(('Healthcare Compliance', () => {
    it(_'should validate consent before syncing',async () => {

      await expect(
        service.syncAppointmentToCalendar(mockAppointment),
      ).rejects.toThrow('Patient consent required')
    }

    it(_'should encrypt sensitive data',async () => {

      expect(mockCompliance.encryptSensitiveData).toHaveBeenCalledWith('token')
      expect(mockCompliance.encryptSensitiveData).toHaveBeenCalledWith(
        'refresh',
      
    }

    it(_'should log all data access',async () => {

      expect(mockCompliance.logDataAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          _userId: mockUser.id,
          action: 'SYNC_APPOINTMENT',
          dataType: 'CALENDAR_EVENT',
        }),
      
    }

    it(_'should handle data retention policies',async () => {
      const oldAppointment = {
        ...mockAppointment,
        startTime: new Date('2020-01-15T10:00:00'), // 4 years ago
      };

      await service.syncAppointmentToCalendar(oldAppointment

      expect(mockCompliance.validateDataProcessing).toHaveBeenCalledWith(
        expect.objectContaining({
          retentionPeriod: '10-years',
        }),
      
    }
  }

  describe(('Batch Operations', () => {
    it(_'should sync multiple appointments',async () => {
      const appointments = [
        mockAppointment,
        {
          ...mockAppointment,
          id: 'appt-124',
          startTime: new Date('2024-01-15T14:00:00'),
          endTime: new Date('2024-01-15T15:00:00'),
        },
      ];

      const results = await service.batchSyncAppointments(appointments

      expect(results).toHaveLength(2
      expect(mockClient.createEvent).toHaveBeenCalledTimes(2
    }

    it(_'should handle partial failures in batch sync',async () => {
      const appointments = [
        mockAppointment,
        {
          ...mockAppointment,
          id: 'appt-124',
          startTime: new Date('2024-01-15T14:00:00'),
          endTime: new Date('2024-01-15T15:00:00'),
        },
      ];

      mockClient.createEvent
        .mockResolvedValueOnce({ id: 'event-123' })
        .mockRejectedValueOnce(new Error('API Error')

      const results = await service.batchSyncAppointments(appointments

      expect(results).toHaveLength(2
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    }
  }
}
