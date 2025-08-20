/**
 * Clinic Management Routes
 * Clinic CRUD operations and management endpoints
 */

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import type { AppEnv } from '@/types/env';

const clinicRoutes = new Hono<AppEnv>();

// Validation schemas
const createClinicSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  address: z.string().optional(),
});

const updateClinicSchema = createClinicSchema.partial();

// Apply auth middleware to all routes
clinicRoutes.use('*', requireAuth());

/**
 * GET /clinics
 * List user's clinics
 */
clinicRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')!;

    const clinics = await db.getClinics();

    return c.json({
      clinics,
      count: clinics.length,
    });
  } catch (error) {
    console.error('List clinics error:', error);
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
 * POST /clinics
 * Create new clinic
 */
clinicRoutes.post('/', zValidator('json', createClinicSchema), async (c) => {
  try {
    const user = c.get('user')!;
    const data = c.req.valid('json');

    // Basic clinic creation - TODO: Expand with proper schema
    const clinicData = {
      name: data.name,
      cnpj: data.cnpj,
      phone: data.phone,
      email: data.email,
      address: data.address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // TODO: Use real create method when schema is ready
    return c.json(
      {
        message: 'Clinic creation endpoint ready',
        data: clinicData,
      },
      201
    );
  } catch (error) {
    console.error('Create clinic error:', error);
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
 * GET /clinics/:id
 * Get clinic details
 */
clinicRoutes.get(
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

      // TODO: Implement getClinicById when schema is ready
      return c.json({
        message: `Get clinic ${id} endpoint ready`,
        clinic_id: id,
      });
    } catch (error) {
      console.error('Get clinic error:', error);
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
 * PUT /clinics/:id
 * Update clinic
 */
clinicRoutes.put(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().uuid(),
    })
  ),
  zValidator('json', updateClinicSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');
      const user = c.get('user')!;

      // TODO: Implement updateClinic when schema is ready
      return c.json({
        message: `Update clinic ${id} endpoint ready`,
        clinic_id: id,
        data,
      });
    } catch (error) {
      console.error('Update clinic error:', error);
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

export { clinicRoutes };
