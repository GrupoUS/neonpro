/**
 * Patient Management Routes
 * Patient CRUD operations and healthcare workflows
 */

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import type { AppEnv } from '@/types/env';

const patientRoutes = new Hono<AppEnv>();

// Validation schemas
const createPatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().min(11, 'CPF inválido').optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

// Apply auth middleware to all routes
patientRoutes.use('*', requireAuth());

/**
 * GET /patients
 * List clinic patients
 */
patientRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')!;

    const patients = await db.getPatients();

    return c.json({
      patients,
      count: patients.length,
    });
  } catch (error) {
    console.error('List patients error:', error);
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
 * POST /patients
 * Create new patient
 */
patientRoutes.post('/', zValidator('json', createPatientSchema), async (c) => {
  try {
    const user = c.get('user')!;
    const data = c.req.valid('json');

    const patient = await db.createPatient({
      ...data,
      clinic_id: user.clinic_id, // TODO: Get from user context
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return c.json(
      {
        patient,
      },
      201
    );
  } catch (error) {
    console.error('Create patient error:', error);
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
 * GET /patients/:id
 * Get patient details
 */
patientRoutes.get(
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

      const patient = await db.getPatientById(id);

      if (!patient) {
        return c.json(
          {
            error: {
              code: 'PATIENT_NOT_FOUND',
              message: 'Paciente não encontrado',
            },
          },
          404
        );
      }

      return c.json({
        patient,
      });
    } catch (error) {
      console.error('Get patient error:', error);
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
 * PUT /patients/:id
 * Update patient
 */
patientRoutes.put(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().uuid(),
    })
  ),
  zValidator('json', updatePatientSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');
      const user = c.get('user')!;

      // TODO: Implement updatePatient when schema is ready
      return c.json({
        message: `Update patient ${id} endpoint ready`,
        patient_id: id,
        data,
      });
    } catch (error) {
      console.error('Update patient error:', error);
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

export { patientRoutes };
