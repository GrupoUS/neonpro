import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { dataProtection } from '../middleware/lgpd-middleware';
import { ok, serverError } from '../utils/responses';

import { requireAuth } from '../middleware/authn';

const appointments = new Hono();

// Apply data protection to all appointment routes
appointments.use('*', requireAuth);
appointments.use('*', dataProtection.appointments);

// Get all appointments (with LGPD consent validation and multi-tenant scoping)
appointments.get('/', async c => {
  try {
    const clinicId = c.get('clinicId');
    if (!clinicId) {
      return c.json({ error: 'Clinic ID required' }, 400);
    }

    const items = await prisma.appointment.findMany({
      take: 10,
      orderBy: { startTime: 'desc' }, // Fixed field name: startsAt -> startTime
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phonePrimary: true,
            lgpdConsentGiven: true, // Include LGPD consent status
          },
        },
        clinic: {
          select: { id: true, name: true },
        },
        professional: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
          },
        },
      },
      where: {
        // Add multi-tenant scoping - only appointments for this clinic
        clinicId: clinicId,
        // Only return appointments for patients with LGPD consent
        patient: {
          lgpdConsentGiven: true,
          isActive: true,
        },
      },
    });
    return ok(c, { items });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return serverError(
      c,
      'Failed to fetch appointments',
      error instanceof Error ? error : undefined,
    );
  }
});

// Get appointments for a specific patient (with LGPD consent validation and multi-tenant scoping)
appointments.get('/patient/:patientId', async c => {
  try {
    const patientId = c.req.param('patientId');
    const clinicId = c.get('clinicId');
    if (!clinicId) {
      return c.json({ error: 'Clinic ID required' }, 400);
    }

    const items = await prisma.appointment.findMany({
      where: {
        patientId,
        // Add multi-tenant scoping - only appointments for this clinic
        clinicId: clinicId,
        patient: {
          lgpdConsentGiven: true,
          isActive: true,
        },
      },
      orderBy: { startTime: 'desc' },
      include: {
        clinic: {
          select: { id: true, name: true },
        },
        professional: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
          },
        },
      },
    });

    return ok(c, { items });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    return serverError(
      c,
      'Failed to fetch patient appointments',
      error instanceof Error ? error : undefined,
    );
  }
});

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { badRequest, created, notFound } from '../utils/responses';

// Schemas
const AppointmentCreateSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).default('scheduled'),
});

const AppointmentUpdateSchema = AppointmentCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// Conflict detection helper
// moved to utils/appointments
import { hasConflict } from '../utils/appointments';

// Create appointment
appointments.post('/', zValidator('json', AppointmentCreateSchema), async c => {
  const data = c.req.valid('json');
  try {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      return badRequest(c, 'INVALID_TIME_RANGE', 'endTime must be after startTime');
    }

    const conflict = await hasConflict({
      clinicId: data.clinicId,
      professionalId: data.professionalId,
      startTime,
      endTime,
    });
    if (conflict) {
      return badRequest(c, 'APPOINTMENT_CONFLICT', 'Time slot overlaps an existing appointment');
    }

    const appt = await prisma.appointment.create({
      data: {
        ...data,
        startTime,
        endTime,
      },
    });

    return created(c, appt, `/appointments/${appt.id}`);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return serverError(
      c,
      'Failed to create appointment',
      error instanceof Error ? error : undefined,
    );
  }
});

// Update appointment
appointments.put('/:id', zValidator('json', AppointmentUpdateSchema), async c => {
  const id = c.req.param('id');
  const payload = c.req.valid('json');
  try {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, 'Appointment not found');
    }

    const startTime = payload.startTime ? new Date(payload.startTime) : existing.startTime;
    const endTime = payload.endTime ? new Date(payload.endTime) : existing.endTime;

    if (endTime <= startTime) {
      return badRequest(c, 'INVALID_TIME_RANGE', 'endTime must be after startTime');
    }

    const conflict = await hasConflict({
      clinicId: payload.clinicId ?? existing.clinicId,
      professionalId: payload.professionalId ?? existing.professionalId,
      startTime,
      endTime,
      excludeId: id,
    });
    if (conflict) {
      return badRequest(c, 'APPOINTMENT_CONFLICT', 'Time slot overlaps an existing appointment');
    }

    const appt = await prisma.appointment.update({
      where: { id },
      data: {
        ...payload,
        startTime,
        endTime,
      },
    });

    return ok(c, appt);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return serverError(
      c,
      'Failed to update appointment',
      error instanceof Error ? error : undefined,
    );
  }
});

export default appointments;
