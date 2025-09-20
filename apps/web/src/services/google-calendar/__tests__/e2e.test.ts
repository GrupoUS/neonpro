import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleCalendarService } from '../service';
import { GoogleCalendarClient } from '../client';
import { GoogleCalendarCompliance } from '../compliance';
import { createClient } from '@supabase/supabase-js';

describe('Google Calendar Integration E2E', () => {
  let service: GoogleCalendarService;
  let mockSupabase: any;
  let mockClient: any;
  let mockCompliance: any;

  const mockUser = {
    id: 'user-123',
    email: 'doctor@neonpro.com.br'
  };

  const mockClinic = {
    id: 'clinic-101',
    name: 'Clínica NeonPro'
  };

  const mockAppointment = {
    id: 'appt-123',
    patientId: 'patient-456',
    doctorId: 'doctor-789',
    clinicId: mockClinic.id,
    title: 'Consulta de Cardiologia',
    description: 'Consulta de rotina com Dr. Silva',
    startTime: new Date('2024-01-15T10:00:00'),
    endTime: new Date('2024-01-15T11:00:00'),
    location: 'Sala 101 - 1º Andar',
    status: 'SCHEDULED',
    type: 'CONSULTATION',
    virtual: false,
    metadata: {
      specialty: 'Cardiologia',
      confidential: true,
      notes: 'Paciente com histórico de hipertensão'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } })
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
            data: null,
            error: null
          })),
          gte: vi.fn(() => ({
            lte: vi.fn()
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [{ id: 'integration-123' }],
            error: null
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn()
        })),
        delete: vi.fn(() => ({
          eq: vi.fn()
        }))
      }))
    };
    (createClient as any).mockReturnValue(mockSupabase);

    // Setup client mock
    mockClient = {
      getAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/o/oauth2/auth'),
      exchangeCodeForTokens: vi.fn(),
      listCalendars: vi.fn().mockResolvedValue([
        { id: 'primary', summary: 'Dr. Smith - Consultas', description: 'Calendar principal' },
        { id: 'work', summary: 'Work', description: 'Calendar de trabalho' }
      ]),
      createEvent: vi.fn().mockImplementation(async (calendarId, eventData) => ({
        id: `google-${Date.now()}`,
        ...eventData,
        htmlLink: `https://calendar.google.com/calendar/event?eid=${Date.now()}`,
        created: new Date().toISOString()
      })),
      updateEvent: vi.fn().mockImplementation(async (calendarId, eventId, updates) => ({
        id: eventId,
        ...updates,
        updated: new Date().toISOString()
      })),
      deleteEvent: vi.fn().mockResolvedValue({}),
      listEvents: vi.fn().mockResolvedValue([]),
      setTokens: vi.fn()
    };

    // Setup compliance mock
    mockCompliance = {
      validateDataProcessing: vi.fn().mockResolvedValue(true),
      logDataAccess: vi.fn(),
      logDataDeletion: vi.fn(),
      validateConsent: vi.fn().mockResolvedValue(true),
      encryptSensitiveData: vi.fn((data) => `encrypted:${data}`),
      decryptSensitiveData: vi.fn((data) => data.replace('encrypted:', '')),
      anonymizeData: vi.fn((data) => data.replace(/[0-9]/g, 'X'))
    };

    const { GoogleCalendarClient } = require('../client');
    GoogleCalendarClient.mockImplementation(() => mockClient);

    const { GoogleCalendarCompliance } = require('../compliance');
    GoogleCalendarCompliance.mockImplementation(() => mockCompliance);

    service = new GoogleCalendarService();
  });

  describe('Complete Integration Flow', () => {
    it('should handle full integration lifecycle', async () => {
      // 1. User connects Google Calendar
      const authUrl = service.getAuthUrl();
      expect(authUrl).toContain('accounts.google.com');

      // 2. Create integration after OAuth callback
      const integration = await service.createIntegration({
        userId: mockUser.id,
        clinicId: mockClinic.id,
        calendarId: 'primary'
      });

      expect(integration).toEqual([{ id: 'integration-123' }]);

      // 3. Sync appointment to Google Calendar
      const syncResult = await service.syncAppointmentToCalendar(mockAppointment);

      expect(syncResult).toBeTruthy();
      expect(mockClient.createEvent).toHaveBeenCalledWith(
        'primary',
        expect.objectContaining({
          summary: mockAppointment.title,
          description: mockAppointment.description,
          start: mockAppointment.startTime,
          end: mockAppointment.endTime,
          location: mockAppointment.location,
          extendedProperties: {
            private: expect.objectContaining({
              appointmentId: mockAppointment.id,
              patientId: mockAppointment.patientId,
              healthcareType: mockAppointment.type,
              confidential: 'true'
            })
          }
        })
      );

      // 4. Verify compliance checks
      expect(mockCompliance.validateDataProcessing).toHaveBeenCalled();
      expect(mockCompliance.validateConsent).toHaveBeenCalled();
      expect(mockCompliance.logDataAccess).toHaveBeenCalled();
    });

    it('should handle appointment updates', async () => {
      // Setup existing integration and sync record
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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'sync-123',
                google_event_id: 'google-event-123'
              },
              error: null
            })
          }))
        }))
      });

      // Update appointment
      const updatedAppointment = {
        ...mockAppointment,
        title: 'Consulta Remarcada - Cardiologia',
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T15:00:00'),
        location: 'Sala 202 - 2º Andar'
      };

      await service.syncAppointmentToCalendar(updatedAppointment);

      expect(mockClient.updateEvent).toHaveBeenCalledWith(
        'primary',
        'google-event-123',
        expect.objectContaining({
          summary: updatedAppointment.title,
          start: updatedAppointment.startTime,
          end: updatedAppointment.endTime,
          location: updatedAppointment.location
        })
      );
    });

    it('should handle appointment cancellation', async () => {
      // Setup existing integration and sync record
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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'sync-123',
                google_event_id: 'google-event-123'
              },
              error: null
            })
          }))
        }))
      });

      const cancelledAppointment = {
        ...mockAppointment,
        status: 'CANCELLED'
      };

      await service.syncAppointmentToCalendar(cancelledAppointment);

      expect(mockClient.deleteEvent).toHaveBeenCalledWith('primary', 'google-event-123');
      expect(mockCompliance.logDataDeletion).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE_APPOINTMENT',
          dataType: 'CALENDAR_EVENT'
        })
      );
    });

    it('should handle bidirectional sync', async () => {
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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      // Mock events from Google Calendar
      const googleEvents = [
        {
          id: 'google-event-456',
          summary: 'Consulta Agendada',
          description: 'Paciente: Maria Santos',
          start: { dateTime: '2024-01-16T09:00:00-03:00' },
          end: { dateTime: '2024-01-16T10:00:00-03:00' },
          extendedProperties: {
            private: {
              appointmentId: 'appt-456',
              patientId: 'patient-789'
            }
          }
        }
      ];

      mockClient.listEvents.mockResolvedValueOnce(googleEvents);

      const syncedEvents = await service.syncFromGoogle('primary');

      expect(syncedEvents).toHaveLength(1);
      expect(mockCompliance.validateDataProcessing).toHaveBeenCalledTimes(1);
    });

    it('should handle conflicts properly', async () => {
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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      // Mock conflicting event
      const conflictingEvent = {
        id: 'conflict-event',
        summary: 'Outra Consulta',
        start: { dateTime: '2024-01-15T10:30:00-03:00' },
        end: { dateTime: '2024-01-15T11:30:00-03:00' }
      };

      mockClient.listEvents.mockResolvedValueOnce([conflictingEvent]);

      const conflicts = await service.checkForConflicts(
        mockAppointment.startTime,
        mockAppointment.endTime,
        'primary'
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].id).toBe('conflict-event');
    });

    it('should ensure data privacy throughout the flow', async () => {
      // Setup integration with encrypted tokens
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'integration-123',
                user_id: mockUser.id,
                calendar_id: 'primary',
                access_token: 'encrypted:very-secret-token',
                refresh_token: 'encrypted:very-secret-refresh',
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      await service.syncAppointmentToCalendar(mockAppointment);

      // Verify tokens were decrypted
      expect(mockCompliance.decryptSensitiveData).toHaveBeenCalledWith('encrypted:very-secret-token');
      expect(mockCompliance.decryptSensitiveData).toHaveBeenCalledWith('encrypted:very-secret-refresh');

      // Verify sensitive data is not logged
      expect(mockCompliance.anonymizeData).toHaveBeenCalledWith(
        expect.stringContaining(mockAppointment.patientId)
      );
    });

    it('should handle errors gracefully and maintain system stability', async () => {
      // Simulate API failure
      mockClient.createEvent.mockRejectedValue({
        code: 503,
        message: 'Service Unavailable'
      });

      const result = await service.syncAppointmentToCalendar(mockAppointment);

      // Should return null instead of throwing
      expect(result).toBeNull();

      // Should have logged the error
      // Error would be logged by the service
    });

    it('should handle token refresh automatically', async () => {
      // Setup integration with expired token
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'integration-123',
                user_id: mockUser.id,
                calendar_id: 'primary',
                access_token: 'encrypted:expired-token',
                refresh_token: 'encrypted:valid-refresh',
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      // First call fails with auth error
      mockClient.createEvent.mockRejectedValueOnce({
        code: 401,
        message: 'Invalid token'
      });

      // After refresh, it succeeds
      mockClient.createEvent.mockResolvedValueOnce({
        id: 'event-after-refresh'
      });

      // Mock token refresh
      mockClient.refreshTokens = vi.fn().mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token'
      });

      const result = await service.syncAppointmentToCalendar(mockAppointment);

      expect(result).toBeTruthy();
      expect(mockClient.refreshTokens).toHaveBeenCalled();
    });
  });

  describe('Healthcare Compliance Requirements', () => {
    it('should enforce data retention policies', async () => {
      const oldAppointment = {
        ...mockAppointment,
        startTime: new Date('2015-01-15T10:00:00'), // 9 years ago
        metadata: {
          ...mockAppointment.metadata,
          retentionRequired: true
        }
      };

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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      await service.syncAppointmentToCalendar(oldAppointment);

      expect(mockCompliance.validateDataProcessing).toHaveBeenCalledWith(
        expect.objectContaining({
          retentionPeriod: '10-years',
          dataType: 'HEALTHCARE_APPOINTMENT'
        })
      );
    });

    it('should handle patient consent revocation', async () => {
      mockCompliance.validateConsent.mockResolvedValueOnce(false);

      await expect(
        service.syncAppointmentToCalendar(mockAppointment)
      ).rejects.toThrow('Patient consent required');

      // Should not proceed with sync
      expect(mockClient.createEvent).not.toHaveBeenCalled();
    });

    it('should maintain audit trail for all operations', async () => {
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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      await service.syncAppointmentToCalendar(mockAppointment);

      // Verify all access was logged
      expect(mockCompliance.logDataAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          action: 'SYNC_APPOINTMENT',
          dataType: 'CALENDAR_EVENT',
          patientId: mockAppointment.patientId
        })
      );
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle batch operations efficiently', async () => {
      const appointments = Array.from({ length: 100 }, (_, i) => ({
        ...mockAppointment,
        id: `appt-${i}`,
        startTime: new Date(`2024-01-${15 + i}T10:00:00`),
        endTime: new Date(`2024-01-${15 + i}T11:00:00`)
      }));

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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      const startTime = Date.now();
      const results = await service.batchSyncAppointments(appointments);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds
    });

    it('should handle rate limiting gracefully', async () => {
      // Simulate rate limit responses
      mockClient.createEvent
        .mockRejectedValueOnce({ code: 429, message: 'Rate limit exceeded' })
        .mockResolvedValueOnce({ id: 'event-after-retry' });

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
                sync_enabled: true
              },
              error: null
            })
          }))
        }))
      });

      const result = await service.syncAppointmentToCalendar(mockAppointment);

      expect(result).toBeTruthy();
    });
  });
});