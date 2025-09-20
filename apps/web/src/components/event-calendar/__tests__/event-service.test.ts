/**
 * Test suite for Event Service
 * Tests CRUD operations, validation, filtering, and search functionality
 */

import { supabase } from '@/integrations/supabase/client';
import { EventService } from '@/services/event.service';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

// Mock date-fns functions
vi.mock('date-fns', () => ({
  addHours: vi.fn((date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000)),
  addMinutes: vi.fn((date, minutes) => new Date(date.getTime() + minutes * 60 * 1000)),
  isSameDay: vi.fn(() => false),
  isSameMonth: vi.fn(() => false),
  isSameWeek: vi.fn(() => false),
  isAfter: vi.fn((a, b) => a > b),
  isBefore: vi.fn((a, b) => a < b),
  startOfDay: vi.fn(date => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  endOfDay: vi.fn(date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  ),
  startOfWeek: vi.fn(date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
  ),
  endOfWeek: vi.fn(date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6)
  ),
  startOfMonth: vi.fn(date => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: vi.fn(date => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  parseISO: vi.fn(isoString => new Date(isoString)),
  format: vi.fn((date, formatString) => date.toString()),
}));

describe('EventService', () => {
  const mockAppointment = {
    id: 'test-appointment-id',
    clinic_id: 'test-clinic-id',
    patient_id: 'test-patient-id',
    professional_id: 'test-professional-id',
    service_type_id: 'test-service-id',
    start_time: '2024-01-15T10:00:00.000Z',
    end_time: '2024-01-15T11:00:00.000Z',
    status: 'confirmed',
    priority: 2,
    notes: 'Test appointment notes',
    internal_notes: 'Internal notes',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  const mockEvent = {
    id: 'test-appointment-id',
    title: 'Appointment #test-app',
    start: new Date('2024-01-15T10:00:00.000Z'),
    end: new Date('2024-01-15T11:00:00.000Z'),
    color: 'emerald',
    status: 'confirmed',
    priority: 2,
    patientId: 'test-patient-id',
    professionalId: 'test-professional-id',
    serviceTypeId: 'test-service-id',
    clinicId: 'test-clinic-id',
    notes: 'Test appointment notes',
    internalNotes: 'Internal notes',
    createdAt: new Date('2024-01-15T09:00:00.000Z'),
    updatedAt: new Date('2024-01-15T09:00:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('appointmentToEvent', () => {
    it('should convert appointment to event format', () => {
      const result = EventService['appointmentToEvent'](mockAppointment as any);

      expect(result).toEqual(mockEvent);
    });

    it('should handle appointment without status', () => {
      const appointmentWithoutStatus = { ...mockAppointment, status: null };
      const result = EventService['appointmentToEvent'](appointmentWithoutStatus as any);

      expect(result.color).toBe('sky');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for confirmed status', () => {
      const color = EventService['getStatusColor']('confirmed');
      expect(color).toBe('emerald');
    });

    it('should return correct color for pending status', () => {
      const color = EventService['getStatusColor']('pending');
      expect(color).toBe('orange');
    });

    it('should return default color for unknown status', () => {
      const color = EventService['getStatusColor']('unknown');
      expect(color).toBe('sky');
    });

    it('should return default color for undefined status', () => {
      const color = EventService['getStatusColor'](undefined);
      expect(color).toBe('sky');
    });
  });

  describe('validateEvent', () => {
    it('should validate valid event data', () => {
      const eventData = {
        title: 'Test Event',
        start: new Date('2024-01-15T10:00:00.000Z'),
        end: new Date('2024-01-15T11:00:00.000Z'),
      };

      const result = EventService.validateEvent(eventData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject event without title', () => {
      const eventData = {
        title: '',
        start: new Date('2024-01-15T10:00:00.000Z'),
        end: new Date('2024-01-15T11:00:00.000Z'),
      };

      const result = EventService.validateEvent(eventData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Event title is required');
    });

    it('should reject event with end time before start time', () => {
      const eventData = {
        title: 'Test Event',
        start: new Date('2024-01-15T11:00:00.000Z'),
        end: new Date('2024-01-15T10:00:00.000Z'),
      };

      const result = EventService.validateEvent(eventData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Event start time must be before end time');
    });

    it('should warn about short duration events', () => {
      const eventData = {
        title: 'Test Event',
        start: new Date('2024-01-15T10:00:00.000Z'),
        end: new Date('2024-01-15T10:02:00.000Z'),
      };

      const result = EventService.validateEvent(eventData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Event duration is less than 5 minutes');
    });

    it('should warn about long duration events', () => {
      const eventData = {
        title: 'Test Event',
        start: new Date('2024-01-15T10:00:00.000Z'),
        end: new Date('2024-01-15T19:00:00.000Z'),
      };

      const result = EventService.validateEvent(eventData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Event duration exceeds 8 hours');
    });

    it('should warn about events outside business hours', () => {
      const eventData = {
        title: 'Test Event',
        start: new Date('2024-01-15T23:00:00.000Z'),
        end: new Date('2024-01-16T01:00:00.000Z'),
      };

      const result = EventService.validateEvent(eventData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Event is scheduled outside normal business hours');
    });
  });

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: mockAppointment,
        error: null,
      });

      (supabase.from as Mock).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockInsert,
          }),
        }),
      });

      const eventData = {
        title: 'Test Event',
        start: new Date('2024-01-15T10:00:00.000Z'),
        end: new Date('2024-01-15T11:00:00.000Z'),
        clinicId: 'test-clinic-id',
      };

      const result = await EventService.createEvent(eventData);

      expect(result).toEqual(mockEvent);
      expect(supabase.from).toHaveBeenCalledWith('appointments');
    });

    it('should throw error for invalid event data', async () => {
      const eventData = {
        title: '',
        start: new Date('2024-01-15T10:00:00.000Z'),
        end: new Date('2024-01-15T11:00:00.000Z'),
        clinicId: 'test-clinic-id',
      };

      await expect(EventService.createEvent(eventData)).rejects.toThrow('Validation failed');
    });
  });

  describe('getEventById', () => {
    it('should return event by ID', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: mockAppointment,
        error: null,
      });

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSelect,
          }),
        }),
      });

      const result = await EventService.getEventById('test-appointment-id');

      expect(result).toEqual(mockEvent);
    });

    it('should return null for non-existent event', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSelect,
          }),
        }),
      });

      const result = await EventService.getEventById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { ...mockAppointment, title: 'Updated Event' },
        error: null,
      });

      (supabase.from as Mock).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: mockUpdate,
            }),
          }),
        }),
      });

      const updateData = {
        id: 'test-appointment-id',
        title: 'Updated Event',
      };

      const result = await EventService.updateEvent(updateData);

      expect(result.title).toBe('Updated Event');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        error: null,
      });

      (supabase.from as Mock).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: mockDelete,
        }),
      });

      await expect(EventService.deleteEvent('test-appointment-id')).resolves.not.toThrow();
    });
  });

  describe('getEvents', () => {
    it('should return events with filters', async () => {
      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockAppointment],
          error: null,
        }),
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const filters = {
        dateRange: {
          start: new Date('2024-01-01T00:00:00.000Z'),
          end: new Date('2024-01-31T23:59:59.999Z'),
        },
        status: ['confirmed'],
      };

      const result = await EventService.getEvents(filters);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEvent);
    });
  });

  describe('searchEvents', () => {
    it('should search events with query', async () => {
      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [mockAppointment],
          error: null,
          count: 1,
        }),
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const searchOptions = {
        query: 'test',
        limit: 10,
        offset: 0,
      };

      const result = await EventService.searchEvents(searchOptions);

      expect(result.events).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('checkConflicts', () => {
    it('should detect conflicting events', async () => {
      const conflictingAppointment = {
        ...mockAppointment,
        start_time: '2024-01-15T10:30:00.000Z',
        end_time: '2024-01-15T11:30:00.000Z',
      };

      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [conflictingAppointment],
          error: null,
        }),
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const start = new Date('2024-01-15T10:00:00.000Z');
      const end = new Date('2024-01-15T11:00:00.000Z');

      const conflicts = await EventService.checkConflicts(start, end);

      expect(conflicts).toHaveLength(1);
    });

    it('should not detect conflicts when excludeEventId is provided', async () => {
      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockAppointment],
          error: null,
        }),
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const start = new Date('2024-01-15T10:00:00.000Z');
      const end = new Date('2024-01-15T11:00:00.000Z');

      const conflicts = await EventService.checkConflicts(start, end, 'test-appointment-id');

      expect(conflicts).toHaveLength(0);
    });
  });

  describe('getEventStatistics', () => {
    it('should calculate event statistics', async () => {
      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockAppointment],
          error: null,
        }),
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const stats = await EventService.getEventStatistics();

      expect(stats.totalEvents).toBe(1);
      expect(stats.eventsByStatus.confirmed).toBe(1);
      expect(stats.eventsByPriority[2]).toBe(1);
    });
  });
});
