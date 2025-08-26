/**
 * 👩‍⚕️ Professionals Routes - NeonPro API
 * ==========================================
 *
 * Rotas para gerenciamento de profissionais da clínica
 * com validação Zod e type-safety completo.
 */

import { zValidator } from '@hono/zod-validator';
import type { ApiResponse } from '@neonpro/shared/types';
import { Hono } from 'hono';
import { z } from 'zod';
import { HTTP_STATUS } from '../lib/constants.js';

// Zod schemas for professionals
const CreateProfessionalSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  profession: z.enum([
    'dermatologist',
    'esthetician',
    'therapist',
    'coordinator',
  ]),
  specialization: z.string().optional(),
  registrationNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  workingHours: z
    .object({
      monday: z.array(z.string()).optional(),
      tuesday: z.array(z.string()).optional(),
      wednesday: z.array(z.string()).optional(),
      thursday: z.array(z.string()).optional(),
      friday: z.array(z.string()).optional(),
      saturday: z.array(z.string()).optional(),
      sunday: z.array(z.string()).optional(),
    })
    .optional(),
  permissions: z.array(z.string()).default([]),
});

const UpdateProfessionalSchema = CreateProfessionalSchema.partial();

const ProfessionalQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  profession: z
    .enum(['dermatologist', 'esthetician', 'therapist', 'coordinator'])
    .optional(),
  isActive: z.coerce.boolean().optional(),
});

// Create professionals router
export const professionalsRoutes = new Hono()
  // Authentication middleware
  .use('*', async (c, next) => {
    const auth = c.req.header('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return c.json(
        { error: 'UNAUTHORIZED', message: 'Token de acesso obrigatório' },
        401,
      );
    }
    await next();
  })
  // 📋 List professionals
  .get('/', zValidator('query', ProfessionalQuerySchema), async (c) => {
    const { page, limit, search, profession, isActive } = c.req.valid('query');

    try {
      // TODO: Implement actual database query
      const mockProfessionals = [
        {
          id: '1',
          fullName: 'Dra. Ana Silva',
          email: 'ana.silva@neonpro.com',
          phone: '+5511999999999',
          profession: 'dermatologist',
          specialization: 'Dermatologia Estética',
          registrationNumber: 'CRM 12345',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          fullName: 'Carla Santos',
          email: 'carla.santos@neonpro.com',
          phone: '+5511888888888',
          profession: 'esthetician',
          specialization: 'Estética Facial',
          registrationNumber: undefined,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ].filter((prof) => {
        if (
          search
          && !prof.fullName.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        if (profession && prof.profession !== profession) {
          return false;
        }
        if (isActive !== undefined && prof.isActive !== isActive) {
          return false;
        }
        return true;
      });

      const total = mockProfessionals.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProfessionals = mockProfessionals.slice(
        startIndex,
        endIndex,
      );

      const response: ApiResponse<{
        professionals: typeof paginatedProfessionals;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }> = {
        success: true,
        data: {
          professionals: paginatedProfessionals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        message: 'Profissionais listados com sucesso',
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Erro ao listar profissionais',
        },
        500,
      );
    }
  })
  // 👤 Get professional by ID
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      // TODO: Implement actual database query
      const mockProfessional = {
        id,
        fullName: 'Dra. Ana Silva',
        email: 'ana.silva@neonpro.com',
        phone: '+5511999999999',
        profession: 'dermatologist',
        specialization: 'Dermatologia Estética',
        registrationNumber: 'CRM 12345',
        isActive: true,
        workingHours: {
          monday: ['09:00', '18:00'],
          tuesday: ['09:00', '18:00'],
          wednesday: ['09:00', '18:00'],
          thursday: ['09:00', '18:00'],
          friday: ['09:00', '17:00'],
        },
        permissions: [
          'read:patients',
          'write:patients',
          'read:appointments',
          'write:appointments',
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse<typeof mockProfessional> = {
        success: true,
        data: mockProfessional,
        message: 'Profissional encontrado',
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Profissional não encontrado',
        },
        404,
      );
    }
  })
  // ✨ Create professional
  .post('/', zValidator('json', CreateProfessionalSchema), async (c) => {
    const professionalData = c.req.valid('json');

    try {
      // TODO: Implement actual database creation
      const newProfessional = {
        id: `prof_${Date.now()}`,
        ...professionalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse<typeof newProfessional> = {
        success: true,
        data: newProfessional,
        message: 'Profissional criado com sucesso',
      };

      return c.json(response, HTTP_STATUS.CREATED);
    } catch {
      return c.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Erro ao criar profissional',
        },
        400,
      );
    }
  })
  // ✏️ Update professional
  .put('/:id', zValidator('json', UpdateProfessionalSchema), async (c) => {
    const id = c.req.param('id');
    const updateData = c.req.valid('json');

    try {
      // TODO: Implement actual database update
      const updatedProfessional = {
        id,
        fullName: 'Dra. Ana Silva',
        email: 'ana.silva@neonpro.com',
        phone: '+5511999999999',
        profession: 'dermatologist',
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse<typeof updatedProfessional> = {
        success: true,
        data: updatedProfessional,
        message: 'Profissional atualizado com sucesso',
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Profissional não encontrado',
        },
        404,
      );
    }
  })
  // 🗑️ Delete professional (soft delete)
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      // TODO: Implement actual soft delete
      const response: ApiResponse<{ id: string; }> = {
        success: true,
        data: { id },
        message: 'Profissional removido com sucesso',
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Profissional não encontrado',
        },
        404,
      );
    }
  })
  // 📊 Get professional stats
  .get('/:id/stats', async (c) => {
    const _id = c.req.param('id');

    try {
      // TODO: Implement actual stats query
      const mockStats = {
        totalAppointments: 156,
        completedAppointments: 142,
        cancelledAppointments: 14,
        totalPatients: 89,
        averageRating: 4.8,
        monthlyRevenue: 12_500.5,
        upcomingAppointments: 8,
      };

      const response: ApiResponse<typeof mockStats> = {
        success: true,
        data: mockStats,
        message: 'Estatísticas do profissional',
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Estatísticas não encontradas',
        },
        404,
      );
    }
  })
  // 📅 Get professional availability
  .get('/:id/availability', async (c) => {
    const _id = c.req.param('id');
    const date = c.req.query('date'); // YYYY-MM-DD format

    try {
      // TODO: Implement actual availability query
      const mockAvailability = {
        date: date || new Date().toISOString().split('T')[0],
        availableSlots: [
          '09:00',
          '09:30',
          '10:00',
          '10:30',
          '14:00',
          '14:30',
          '15:00',
          '15:30',
          '16:00',
        ],
        bookedSlots: ['11:00', '11:30', '16:30', '17:00'],
      };

      const response: ApiResponse<typeof mockAvailability> = {
        success: true,
        data: mockAvailability,
        message: 'Disponibilidade do profissional',
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Disponibilidade não encontrada',
        },
        404,
      );
    }
  });
