/**
 * Appointment API Contract Tests
 * Validates tRPC appointment endpoints against defined contracts
 */

import { createCallerFactory } from '@trpc/server';
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appointmentRouter } from '../../trpc/contracts/appointment';
import { appRouter } from '../../trpc/router';
import { createMockContext } from '../helpers/trpc-context';

// Type inference for contract validation
type AppointmentInput = {
  create: inferProcedureInput<typeof appointmentRouter.create>;
  getById: inferProcedureInput<typeof appointmentRouter.getById>;
  update: inferProcedureInput<typeof appointmentRouter.update>;
  cancel: inferProcedureInput<typeof appointmentRouter.cancel>;
  list: inferProcedureInput<typeof appointmentRouter.list>;
  getAvailability: inferProcedureInput<typeof appointmentRouter.getAvailability>;
  checkConflicts: inferProcedureInput<typeof appointmentRouter.checkConflicts>;
};

type AppointmentOutput = {
  create: inferProcedureOutput<typeof appointmentRouter.create>;
  getById: inferProcedureOutput<typeof appointmentRouter.getById>;
  update: inferProcedureOutput<typeof appointmentRouter.update>;
  cancel: inferProcedureOutput<typeof appointmentRouter.cancel>;
  list: inferProcedureOutput<typeof appointmentRouter.list>;
  getAvailability: inferProcedureOutput<typeof appointmentRouter.getAvailability>;
  checkConflicts: inferProcedureOutput<typeof appointmentRouter.checkConflicts>;
};

describe('Appointment API Contract Tests', () => {
  const createCaller = createCallerFactory(appRouter);
  let caller: ReturnType<typeof createCaller>;
  let mockContext: any;

  beforeEach(() => {
    mockContext = createMockContext();
    caller = createCaller(mockContext);

    // Mock audit logging
    vi.spyOn(mockContext.audit, 'logAppointmentAction').mockResolvedValue(undefined);
    vi.spyOn(mockContext.scheduling, 'checkAvailability').mockResolvedValue(true);
    vi.spyOn(mockContext.scheduling, 'detectConflicts').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Appointment Creation Contract', () => {
    it('should validate appointment creation input schema', async () => {
      const validInput: AppointmentInput['create'] = {
        patientId: 'patient-123',
        professionalId: 'prof-456',
        serviceId: 'service-789',
        scheduledFor: '2024-02-15T14:00:00.000Z',
        duration: 60,
        type: 'consultation',
        priority: 'normal',
        notes: 'Initial aesthetic consultation',
        contactPreferences: {
          reminder: true,
          reminderMethods: ['whatsapp', 'email'],
          reminderTiming: [24, 2], // 24h and 2h before
        },
      };

      // Mock successful creation
      mockContext.prisma.appointment.create.mockResolvedValue({
        id: 'appointment-123',
        ...validInput,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await caller.api.appointment.create(validInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          patientId: 'patient-123',
          professionalId: 'prof-456',
          status: 'scheduled',
          scheduledFor: expect.any(String),
        }),
      });

      // Verify conflict detection was called
      expect(mockContext.scheduling.detectConflicts).toHaveBeenCalledWith({
        professionalId: 'prof-456',
        scheduledFor: '2024-02-15T14:00:00.000Z',
        duration: 60,
      });

      // Verify audit logging
      expect(mockContext.audit.logAppointmentAction).toHaveBeenCalledWith({
        action: 'create',
        appointmentId: 'appointment-123',
        patientId: 'patient-123',
        userId: mockContext.user.id,
        timestamp: expect.any(Date),
      });
    });

    it('should reject appointment creation with scheduling conflicts', async () => {
      const conflictingInput: AppointmentInput['create'] = {
        patientId: 'patient-123',
        professionalId: 'prof-456',
        serviceId: 'service-789',
        scheduledFor: '2024-02-15T14:00:00.000Z',
        duration: 60,
        type: 'consultation',
      };

      // Mock conflict detection
      mockContext.scheduling.detectConflicts.mockResolvedValue([
        {
          id: 'existing-appointment',
          scheduledFor: '2024-02-15T14:30:00.000Z',
          duration: 60,
          conflict: 'overlap',
        },
      ]);

      await expect(caller.api.appointment.create(conflictingInput))
        .rejects.toThrow('Scheduling conflict detected');
    });

    it('should validate appointment timing constraints', async () => {
      const pastDateInput: AppointmentInput['create'] = {
        patientId: 'patient-123',
        professionalId: 'prof-456',
        serviceId: 'service-789',
        scheduledFor: '2023-01-01T14:00:00.000Z', // Past date
        duration: 60,
        type: 'consultation',
      };

      await expect(caller.api.appointment.create(pastDateInput))
        .rejects.toThrow('Cannot schedule appointments in the past');
    });

    it('should validate business hours constraints', async () => {
      const afterHoursInput: AppointmentInput['create'] = {
        patientId: 'patient-123',
        professionalId: 'prof-456',
        serviceId: 'service-789',
        scheduledFor: '2024-02-15T22:00:00.000Z', // After hours
        duration: 60,
        type: 'consultation',
      };

      await expect(caller.api.appointment.create(afterHoursInput))
        .rejects.toThrow('Appointment outside business hours');
    });
  });

  describe('Appointment Retrieval Contract', () => {
    it('should validate appointment retrieval by ID', async () => {
      const appointmentId = 'appointment-123';
      const mockAppointment = {
        id: appointmentId,
        patientId: 'patient-123',
        professionalId: 'prof-456',
        serviceId: 'service-789',
        scheduledFor: '2024-02-15T14:00:00.000Z',
        duration: 60,
        status: 'scheduled',
        type: 'consultation',
        notes: 'Initial consultation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContext.prisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      const input: AppointmentInput['getById'] = { id: appointmentId };
      const result = await caller.api.appointment.getById(input);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: appointmentId,
          patientId: 'patient-123',
          status: 'scheduled',
        }),
      });

      // Verify audit logging
      expect(mockContext.audit.logAppointmentAction).toHaveBeenCalledWith({
        action: 'read',
        appointmentId,
        userId: mockContext.user.id,
        timestamp: expect.any(Date),
      });
    });

    it('should handle appointment not found', async () => {
      const appointmentId = 'nonexistent-appointment';
      mockContext.prisma.appointment.findUnique.mockResolvedValue(null);

      const input: AppointmentInput['getById'] = { id: appointmentId };

      await expect(caller.api.appointment.getById(input))
        .rejects.toThrow('Appointment not found');
    });
  });

  describe('Appointment Update Contract', () => {
    it('should validate appointment update input schema', async () => {
      const appointmentId = 'appointment-123';
      const updateInput: AppointmentInput['update'] = {
        id: appointmentId,
        scheduledFor: '2024-02-16T15:00:00.000Z',
        notes: 'Updated consultation notes',
        status: 'confirmed',
      };

      const existingAppointment = {
        id: appointmentId,
        patientId: 'patient-123',
        professionalId: 'prof-456',
        scheduledFor: '2024-02-15T14:00:00.000Z',
        status: 'scheduled',
        duration: 60,
      };

      const updatedAppointment = {
        ...existingAppointment,
        scheduledFor: '2024-02-16T15:00:00.000Z',
        notes: 'Updated consultation notes',
        status: 'confirmed',
        updatedAt: new Date(),
      };

      mockContext.prisma.appointment.findUnique.mockResolvedValue(existingAppointment);
      mockContext.prisma.appointment.update.mockResolvedValue(updatedAppointment);

      const result = await caller.api.appointment.update(updateInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: appointmentId,
          scheduledFor: '2024-02-16T15:00:00.000Z',
          status: 'confirmed',
        }),
      });

      // Verify audit logging
      expect(mockContext.audit.logAppointmentAction).toHaveBeenCalledWith({
        action: 'update',
        appointmentId,
        userId: mockContext.user.id,
        timestamp: expect.any(Date),
        changes: expect.any(Object),
      });
    });

    it('should prevent updating completed appointments', async () => {
      const appointmentId = 'appointment-123';
      const updateInput: AppointmentInput['update'] = {
        id: appointmentId,
        notes: 'Trying to update completed appointment',
      };

      const completedAppointment = {
        id: appointmentId,
        status: 'completed',
        patientId: 'patient-123',
      };

      mockContext.prisma.appointment.findUnique.mockResolvedValue(completedAppointment);

      await expect(caller.api.appointment.update(updateInput))
        .rejects.toThrow('Cannot update completed appointment');
    });
  });
  describe('Appointment Cancellation Contract', () => {
    it('should validate appointment cancellation', async () => {
      const appointmentId = 'appointment-123';
      const cancelInput: AppointmentInput['cancel'] = {
        id: appointmentId,
        reason: 'Patient requested cancellation',
        cancelledBy: 'patient',
        refund: true,
      };

      const existingAppointment = {
        id: appointmentId,
        patientId: 'patient-123',
        status: 'scheduled',
        scheduledFor: '2024-02-15T14:00:00.000Z',
      };

      const cancelledAppointment = {
        ...existingAppointment,
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: 'Patient requested cancellation',
        cancelledBy: 'patient',
      };

      mockContext.prisma.appointment.findUnique.mockResolvedValue(existingAppointment);
      mockContext.prisma.appointment.update.mockResolvedValue(cancelledAppointment);

      const result = await caller.api.appointment.cancel(cancelInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: appointmentId,
          status: 'cancelled',
          cancellationReason: 'Patient requested cancellation',
        }),
      });

      // Verify audit logging
      expect(mockContext.audit.logAppointmentAction).toHaveBeenCalledWith({
        action: 'cancel',
        appointmentId,
        userId: mockContext.user.id,
        timestamp: expect.any(Date),
        reason: 'Patient requested cancellation',
      });
    });

    it('should enforce cancellation time limits', async () => {
      const appointmentId = 'appointment-123';
      const cancelInput: AppointmentInput['cancel'] = {
        id: appointmentId,
        reason: 'Late cancellation',
      };

      const soonAppointment = {
        id: appointmentId,
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'scheduled',
      };

      mockContext.prisma.appointment.findUnique.mockResolvedValue(soonAppointment);

      await expect(caller.api.appointment.cancel(cancelInput))
        .rejects.toThrow('Cannot cancel appointment less than 24 hours in advance');
    });
  });

  describe('Appointment Availability Contract', () => {
    it('should validate availability checking', async () => {
      const availabilityInput: AppointmentInput['getAvailability'] = {
        professionalId: 'prof-456',
        date: '2024-02-15',
        serviceId: 'service-789',
      };

      const mockAvailability = {
        date: '2024-02-15',
        professionalId: 'prof-456',
        availableSlots: [
          { startTime: '09:00', endTime: '10:00', available: true },
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: false },
        ],
        businessHours: {
          start: '09:00',
          end: '18:00',
          lunchBreak: { start: '12:00', end: '13:00' },
        },
      };

      mockContext.scheduling.getAvailability.mockResolvedValue(mockAvailability);

      const result = await caller.api.appointment.getAvailability(availabilityInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          date: '2024-02-15',
          professionalId: 'prof-456',
          availableSlots: expect.arrayContaining([
            expect.objectContaining({
              startTime: expect.any(String),
              available: expect.any(Boolean),
            }),
          ]),
        }),
      });
    });

    it('should handle no availability', async () => {
      const availabilityInput: AppointmentInput['getAvailability'] = {
        professionalId: 'prof-456',
        date: '2024-02-15',
        serviceId: 'service-789',
      };

      const noAvailability = {
        date: '2024-02-15',
        professionalId: 'prof-456',
        availableSlots: [],
        businessHours: null,
      };

      mockContext.scheduling.getAvailability.mockResolvedValue(noAvailability);

      const result = await caller.api.appointment.getAvailability(availabilityInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          availableSlots: [],
        }),
      });
    });
  });

  describe('Appointment Conflict Detection Contract', () => {
    it('should validate conflict checking', async () => {
      const conflictInput: AppointmentInput['checkConflicts'] = {
        professionalId: 'prof-456',
        scheduledFor: '2024-02-15T14:00:00.000Z',
        duration: 60,
        excludeAppointmentId: 'appointment-existing',
      };

      const mockConflicts = [
        {
          id: 'conflict-appointment',
          scheduledFor: '2024-02-15T14:30:00.000Z',
          duration: 60,
          conflict: 'overlap',
          overlapMinutes: 30,
        },
      ];

      mockContext.scheduling.detectConflicts.mockResolvedValue(mockConflicts);

      const result = await caller.api.appointment.checkConflicts(conflictInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          hasConflicts: true,
          conflicts: expect.arrayContaining([
            expect.objectContaining({
              id: 'conflict-appointment',
              conflict: 'overlap',
              overlapMinutes: 30,
            }),
          ]),
        }),
      });
    });

    it('should return no conflicts when schedule is clear', async () => {
      const conflictInput: AppointmentInput['checkConflicts'] = {
        professionalId: 'prof-456',
        scheduledFor: '2024-02-15T16:00:00.000Z',
        duration: 60,
      };

      mockContext.scheduling.detectConflicts.mockResolvedValue([]);

      const result = await caller.api.appointment.checkConflicts(conflictInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          hasConflicts: false,
          conflicts: [],
        }),
      });
    });
  });

  describe('Appointment List Contract', () => {
    it('should validate appointment listing with filters', async () => {
      const listInput: AppointmentInput['list'] = {
        page: 1,
        limit: 10,
        filters: {
          patientId: 'patient-123',
          status: ['scheduled', 'confirmed'],
          dateRange: {
            start: '2024-02-01',
            end: '2024-02-29',
          },
        },
        orderBy: 'scheduledFor',
        orderDirection: 'asc',
      };

      const mockAppointments = [
        {
          id: 'appointment-1',
          patientId: 'patient-123',
          status: 'scheduled',
          scheduledFor: '2024-02-15T14:00:00.000Z',
          duration: 60,
        },
        {
          id: 'appointment-2',
          patientId: 'patient-123',
          status: 'confirmed',
          scheduledFor: '2024-02-20T10:00:00.000Z',
          duration: 90,
        },
      ];

      mockContext.prisma.appointment.findMany.mockResolvedValue(mockAppointments);
      mockContext.prisma.appointment.count.mockResolvedValue(15);

      const result = await caller.api.appointment.list(listInput);

      expect(result).toMatchObject({
        success: true,
        data: {
          appointments: expect.arrayContaining([
            expect.objectContaining({
              id: 'appointment-1',
              patientId: 'patient-123',
              status: 'scheduled',
            }),
          ]),
          pagination: {
            page: 1,
            limit: 10,
            total: 15,
            totalPages: 2,
          },
          filters: expect.objectContaining({
            patientId: 'patient-123',
            status: ['scheduled', 'confirmed'],
          }),
        },
      });
    });
  });

  describe('Contract Type Safety', () => {
    it('should enforce input type constraints at compile time', () => {
      const validInput: AppointmentInput['create'] = {
        patientId: 'patient-123',
        professionalId: 'prof-456',
        serviceId: 'service-789',
        scheduledFor: '2024-02-15T14:00:00.000Z',
        duration: 60,
        type: 'consultation',
      };

      expect(validInput).toBeDefined();
    });

    it('should enforce output type constraints', () => {
      const mockOutput: AppointmentOutput['getById'] = {
        success: true,
        data: {
          id: 'appointment-123',
          patientId: 'patient-123',
          professionalId: 'prof-456',
          serviceId: 'service-789',
          scheduledFor: '2024-02-15T14:00:00.000Z',
          duration: 60,
          status: 'scheduled',
          type: 'consultation',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(mockOutput).toBeDefined();
      expect(mockOutput.success).toBe(true);
      expect(mockOutput.data.id).toBe('appointment-123');
    });
  });
});
