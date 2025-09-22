import { createClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleCalendarClient } from '../client';

// Mock googleapis
vi.mock(('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        setCredentials: vi.fn(),
        getAccessToken: vi.fn(),
        refreshToken: vi.fn(),
      })),
    },
    calendar: vi.fn().mockImplementation(() => ({
      calendars: {
        get: vi.fn(),
        list: vi.fn(),
      },
      events: {
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
        patch: vi.fn(),
      },
    })),
  },
})

// Mock Supabase
vi.mock(('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
})

describe(('GoogleCalendarClient', () => {
  let client: GoogleCalendarClient;
  let mockSupabase: any;
  let mockGoogleAuth: any;
  let mockCalendar: any;

  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/auth/callback',
  };

  const mockUser = {
    id: 'user-123',
    email: 'doctor@neonpro.com.br',
  };

  beforeEach(() => {
    vi.clearAllMocks(

    // Setup mocks
    mockGoogleAuth = {
      setCredentials: vi.fn(),
      getAccessToken: vi.fn().mockResolvedValue({
        token: 'access-token',
        expiry_date: Date.now() + 3600000,
      }),
      refreshToken: vi.fn().mockResolvedValue({
        access_token: 'new-access-token',
        expiry_date: Date.now() + 3600000,
      }),
    };

    mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'primary',
            summary: 'Doctor Smith',
            description: 'Appointment calendar',
          },
        }),
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              { id: 'primary', summary: 'Primary Calendar' },
              { id: 'work', summary: 'Work Calendar' },
            ],
          },
        }),
      },
      events: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'event-123',
            summary: 'Patient Appointment',
            start: { dateTime: '2024-01-15T10:00:00-03:00' },
            end: { dateTime: '2024-01-15T11:00:00-03:00' },
          },
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            id: 'event-123',
            summary: 'Updated Appointment',
          },
        }),
        delete: vi.fn().mockResolvedValue({}),
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'event-123',
                summary: 'Patient Appointment',
                start: { dateTime: '2024-01-15T10:00:00-03:00' },
                end: { dateTime: '2024-01-15T11:00:00-03:00' },
              },
            ],
          },
        }),
        patch: vi.fn().mockResolvedValue({
          data: {
            id: 'event-123',
            status: 'cancelled',
          },
        }),
      },
    };

    // Setup googleapis mock
    const { google } = require('googleapis')
    google.auth.OAuth2.mockImplementation(() => mockGoogleAuth
    google.calendar.mockImplementation(() => mockCalendar

    // Setup Supabase mock
    mockSupabase = createClient('test-url', 'test-key')

    client = new GoogleCalendarClient(mockConfig
  }

  describe(('Authentication', () => {
    it(('should generate auth URL with correct scopes', () => {

      expect(authUrl).toContain('client_id=test-client-id')
      expect(authUrl).toContain(
        'redirect_uri=http://localhost:3000/auth/callback',
      
      expect(authUrl).toContain(
        'scope=https://www.googleapis.com/auth/calendar',
      
    }

    it(_'should handle token exchange',async () => {
      const code = 'auth-code-123';
      const tokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expiry_date: Date.now() + 3600000,
      };

      mockGoogleAuth.getToken = vi.fn().mockResolvedValue(tokens

      await client.exchangeCodeForTokens(code

      expect(mockGoogleAuth.getToken).toHaveBeenCalledWith(code
      expect(mockGoogleAuth.setCredentials).toHaveBeenCalledWith(tokens
    }

    it(_'should refresh expired tokens',async () => {

      expect(mockGoogleAuth.refreshToken).toHaveBeenCalled(
    }
  }

  describe(('Calendar Operations', () => {
    beforeEach(async () => {
      // Setup authenticated client
      await client.setTokens({
        access_token: 'test-token',
        refresh_token: 'refresh-token',
      }
    }

    it(_'should fetch calendar list',async () => {

      expect(mockCalendar.calendars.list).toHaveBeenCalled(
      expect(calendars).toHaveLength(2
      expect(calendars[0].id).toBe('primary')
    }

    it(_'should create events with healthcare metadata',async () => {
      const eventData = {
        summary: 'Consulta com Dr. Silva',
        description: 'Consulta de rotina',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00'),
        location: 'Clínica NeonPro - Sala 101',
        attendees: [
          { email: 'patient@neonpro.com.br', displayName: 'João Silva' },
        ],
        metadata: {
          appointmentId: 'appt-123',
          patientId: 'patient-456',
          healthcareType: 'CONSULTATION',
          confidential: true,
        },
      };

      const event = await client.createEvent('primary', eventData

      expect(mockCalendar.events.insert).toHaveBeenCalledWith({
        calendarId: 'primary',
        requestBody: expect.objectContaining({
          summary: 'Consulta com Dr. Silva',
          extendedProperties: {
            private: {
              appointmentId: 'appt-123',
              patientId: 'patient-456',
              healthcareType: 'CONSULTATION',
              confidential: 'true',
            },
          },
        }),
      }

      expect(event.id).toBe('event-123')
    }

    it(_'should update events with conflict resolution',async () => {
      const updates = {
        summary: 'Consulta Remarcada',
        start: new Date('2024-01-15T14:00:00'),
        end: new Date('2024-01-15T15:00:00'),
      };

      const event = await client.updateEvent('primary', 'event-123', updates

      expect(mockCalendar.events.update).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: 'event-123',
        requestBody: updates,
      }

      expect(event.summary).toBe('Updated Appointment')
    }

    it(_'should delete events with audit logging',async () => {

      expect(mockCalendar.events.delete).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: 'event-123',
      }
    }

    it(_'should list events with time range filter',async () => {

      const events = await client.listEvents('primary', start, end

      expect(mockCalendar.events.list).toHaveBeenCalledWith({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      }

      expect(events).toHaveLength(1
      expect(events[0].summary).toBe('Patient Appointment')
    }

    it(_'should cancel events gracefully',async () => {

      expect(mockCalendar.events.patch).toHaveBeenCalledWith({
        calendarId: 'primary',
        eventId: 'event-123',
        requestBody: {
          status: 'cancelled',
        },
      }
    }
  }

  describe(('Error Handling', () => {
    it(_'should handle API rate limits',async () => {
      mockCalendar.events.insert.mockRejectedValue({
        code: 429,
        message: 'Rate limit exceeded',
      }

      await expect(
        client.createEvent('primary', {
          summary: 'Test Event',
          start: new Date(),
          end: new Date(),
        }),
      ).rejects.toThrow('Rate limit exceeded')
    }

    it(_'should handle invalid auth tokens',async () => {
      mockCalendar.calendars.list.mockRejectedValue({
        code: 401,
        message: 'Invalid credentials',
      }

      await expect(client.listCalendars()).rejects.toThrow(
        'Invalid credentials',
      
    }

    it(_'should handle network errors',async () => {

      await expect(
        client.createEvent('primary', {
          summary: 'Test Event',
          start: new Date(),
          end: new Date(),
        }),
      ).rejects.toThrow('Network error')
    }
  }

  describe(('Healthcare Compliance', () => {
    it(_'should include LGPD compliance headers',async () => {
      await client.createEvent('primary', {
        summary: 'Consulta Médica',
        description: 'Dados do paciente',
        start: new Date(),
        end: new Date(),
        metadata: {
          patientId: 'patient-123',
          healthcareType: 'CONSULTATION',
        },
      }

      expect(mockCalendar.events.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-LGPD-Compliance': 'true',
            'X-Data-Processing-Purpose': 'healthcare',
            'X-Retention-Period': '10-years',
          }),
        }),
      
    }

    it(('should mask sensitive data in error logs', () => {
      const error = new Error(
        'Failed to process patient data: João Silva - 123.456.789-00',
      
      const sanitizedError = client.sanitizeError(error

      expect(sanitizedError.message).not.toContain('João Silva')
      expect(sanitizedError.message).not.toContain('123.456.789-00')
      expect(sanitizedError.message).toContain('[REDACTED]')
    }
  }
}
