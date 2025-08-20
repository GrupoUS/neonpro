/**
 * Appointment Management Routes
 * Appointment scheduling and management endpoints
 */

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import type { AppEnv } from '@/types/env';

const appointmentRoutes = new Hono<AppEnv>();

// Validation schemas
const createAppointmentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  service_id: z.string().uuid('ID do serviço inválido').optional(),
  professional_id: z.string().uuid('ID do profissional inválido').optional(),
  scheduled_at: z.string().datetime('Data/hora inválida'),
  duration_minutes: z.number().min(15).max(480).default(60),
  notes: z.string().optional(),
  service_type: z.string().optional(),
});

const updateAppointmentSchema = createAppointmentSchema.partial();

// Apply auth middleware to all routes
appointmentRoutes.use('*', requireAuth());

/**
 * GET /appointments
 * List clinic appointments
 */
appointmentRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')!;

    const appointments = await db.getAppointments();

    return c.json({
      appointments,
      count: appointments.length,
    });
  } catch (error) {
    console.error('List appointments error:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
          details: error.message,
        },
      },
      500
    );
  }
});

/**
 * POST /appointments
 * Create new appointment
 */
appointmentRoutes.post(
  '/',
  zValidator('json', createAppointmentSchema),
  async (c) => {
    try {
      const user = c.get('user')!;
      const data = c.req.valid('json');

      const appointment = await db.createAppointment({
        ...data,
        clinic_id: user.clinic_id, // TODO: Get from user context
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return c.json(
        {
          appointment,
        },
        201
      );
    } catch (error) {
      console.error('Create appointment error:', error);
      return c.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno do servidor',
            details: error.message,
          },
        },
        500
      );
    }
  }
);

/**
 * GET /appointments/:id
 * Get appointment details
 */
appointmentRoutes.get(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().uuid(),
    })
  ),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const user = c.get('user')!;

      // TODO: Implement getAppointmentById when schema is ready
      return c.json({
        message: `Get appointment ${id} endpoint ready`,
        appointment_id: id,
      });
    } catch (error) {
      console.error('Get appointment error:', error);
      return c.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno do servidor',
            details: error.message,
          },
        },
        500
      );
    }
  }
);

/**
 * PUT /appointments/:id
 * Update appointment
 */
appointmentRoutes.put(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().uuid(),
    })
  ),
  zValidator('json', updateAppointmentSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');
      const user = c.get('user')!;

      // TODO: Implement updateAppointment when schema is ready
      return c.json({
        message: `Update appointment ${id} endpoint ready`,
        appointment_id: id,
        data,
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      return c.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno do servidor',
            details: error.message,
          },
        },
        500
      );
    }
  }
);

export { appointmentRoutes };
