/**
 * Healthcare API Routes - Optimized Hono.dev implementation
 * Features: LGPD compliance, audit logging, performance optimization, type safety
 */

import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import { cache } from 'hono/cache';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { supabase } from '../lib/supabase';

// Healthcare-specific types
type HealthcareEnv = {
  Variables: {
    user: {
      id: string;
      role: 'admin' | 'professional' | 'coordinator';
      permissions: string[];
    };
    auditContext: {
      action: string;
      resourceType: string;
      resourceId?: string;
    };
    performanceMetrics: {
      startTime: number;
      dbQueries: number;
    };
  };
};

// Create healthcare API instance
const healthcare = new Hono<HealthcareEnv>();

// Performance monitoring middleware
const performanceMiddleware = createMiddleware<HealthcareEnv>(async (c, next) => {
  const startTime = Date.now();
  c.set('performanceMetrics', { startTime, dbQueries: 0 });
  
  await next();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  const metrics = c.get('performanceMetrics');
  
  // Log performance metrics for healthcare compliance
  console.log(`Healthcare API Performance: ${c.req.method} ${c.req.path} - ${duration}ms, ${metrics.dbQueries} DB queries`);
  
  // Add performance headers
  c.header('X-Response-Time', `${duration}ms`);
  c.header('X-DB-Queries', metrics.dbQueries.toString());
});

// LGPD compliance audit middleware
const auditMiddleware = createMiddleware<HealthcareEnv>(async (c, next) => {
  const user = c.get('user');
  const method = c.req.method;
  const path = c.req.path;
  
  // Determine audit context based on route
  let auditContext = { action: 'unknown', resourceType: 'unknown' };
  
  if (path.includes('/patients')) {
    auditContext = { 
      action: `patient_${method.toLowerCase()}`, 
      resourceType: 'patient',
      resourceId: c.req.param('id')
    };
  } else if (path.includes('/appointments')) {
    auditContext = { 
      action: `appointment_${method.toLowerCase()}`, 
      resourceType: 'appointment',
      resourceId: c.req.param('id')
    };
  }
  
  c.set('auditContext', auditContext);
  
  await next();
  
  // Log audit trail for LGPD compliance
  try {
    await supabase.from('audit_logs').insert({
      action: auditContext.action,
      resource_type: auditContext.resourceType,
      resource_id: auditContext.resourceId,
      user_id: user?.id,
      user_role: user?.role,
      timestamp: new Date().toISOString(),
      compliance_flags: ['lgpd_logged', 'healthcare_action'],
      request_details: {
        method,
        path,
        userAgent: c.req.header('User-Agent'),
        ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For'),
      },
    });
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
});

// Healthcare role-based authorization middleware
const healthcareAuthMiddleware = createMiddleware<HealthcareEnv>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Token de autorização necessário' }, 401);
  }
  
  try {
    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }
    
    // Get user role and permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return c.json({ error: 'Perfil de usuário não encontrado' }, 403);
    }
    
    c.set('user', {
      id: user.id,
      role: profile.role,
      permissions: profile.permissions || [],
    });
    
    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ error: 'Erro de autenticação' }, 401);
  }
});

// Apply global middleware
healthcare.use('*', logger());
healthcare.use('*', timing());
healthcare.use('*', performanceMiddleware);
healthcare.use('*', cors({
  origin: [
  process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://neonpro.vercel.app',
  'http://localhost:3000'
],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
healthcare.use('*', healthcareAuthMiddleware);
healthcare.use('*', auditMiddleware);

// Validation schemas
const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  birth_date: z.string().datetime().optional(),
  aesthetic_preferences: z.record(z.any()).optional(),
  medical_history: z.record(z.any()).optional(),
});

const appointmentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  scheduled_at: z.string().datetime('Data/hora inválida'),
  procedure_type: z.string().min(1, 'Tipo de procedimento obrigatório'),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Patient routes with caching and optimization
healthcare.get('/patients', 
  cache({
    cacheName: 'healthcare-patients',
    cacheControl: 'max-age=300', // 5 minutes
  }),
  async (c) => {
    const user = c.get('user');
    const metrics = c.get('performanceMetrics');
    
    // Check permissions
    if (!user.permissions.includes('read_patients')) {
      return c.json({ error: 'Sem permissão para visualizar pacientes' }, 403);
    }
    
    try {
      metrics.dbQueries++;
      
      const { data: patients, error } = await supabase
        .from('patients')
        .select(`
          id,
          name,
          phone,
          email,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Pagination for performance
      
      if (error) {
        throw error;
      }
      
      return c.json({
        success: true,
        data: patients,
        meta: {
          count: patients?.length || 0,
          cached: false,
        },
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      return c.json({ 
        success: false, 
        error: 'Erro ao buscar pacientes' 
      }, 500);
    }
  }
);

healthcare.get('/patients/:id', async (c) => {
  const patientId = c.req.param('id');
  const user = c.get('user');
  const metrics = c.get('performanceMetrics');
  
  if (!user.permissions.includes('read_patients')) {
    return c.json({ error: 'Sem permissão para visualizar paciente' }, 403);
  }
  
  try {
    metrics.dbQueries++;
    
    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        id,
        name,
        cpf,
        phone,
        email,
        birth_date,
        created_at,
        updated_at,
        aesthetic_preferences,
        medical_history
      `)
      .eq('id', patientId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Paciente não encontrado' }, 404);
      }
      throw error;
    }
    
    return c.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao buscar paciente' 
    }, 500);
  }
});

healthcare.post('/patients', 
  zValidator('json', patientSchema),
  async (c) => {
    const user = c.get('user');
    const metrics = c.get('performanceMetrics');
    const patientData = c.req.valid('json');
    
    if (!user.permissions.includes('create_patients')) {
      return c.json({ error: 'Sem permissão para criar pacientes' }, 403);
    }
    
    try {
      metrics.dbQueries++;
      
      const { data: patient, error } = await supabase
        .from('patients')
        .insert({
          ...patientData,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return c.json({
        success: true,
        data: patient,
        message: 'Paciente criado com sucesso',
      }, 201);
    } catch (error) {
      console.error('Error creating patient:', error);
      return c.json({ 
        success: false, 
        error: 'Erro ao criar paciente' 
      }, 500);
    }
  }
);

healthcare.put('/patients/:id', 
  zValidator('json', patientSchema.partial()),
  async (c) => {
    const patientId = c.req.param('id');
    const user = c.get('user');
    const metrics = c.get('performanceMetrics');
    const updates = c.req.valid('json');
    
    if (!user.permissions.includes('update_patients')) {
      return c.json({ error: 'Sem permissão para atualizar pacientes' }, 403);
    }
    
    try {
      metrics.dbQueries++;
      
      const { data: patient, error } = await supabase
        .from('patients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', patientId)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return c.json({ error: 'Paciente não encontrado' }, 404);
        }
        throw error;
      }
      
      return c.json({
        success: true,
        data: patient,
        message: 'Paciente atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      return c.json({ 
        success: false, 
        error: 'Erro ao atualizar paciente' 
      }, 500);
    }
  }
);

// Appointment routes
healthcare.get('/patients/:id/appointments', async (c) => {
  const patientId = c.req.param('id');
  const user = c.get('user');
  const metrics = c.get('performanceMetrics');
  
  if (!user.permissions.includes('read_appointments')) {
    return c.json({ error: 'Sem permissão para visualizar agendamentos' }, 403);
  }
  
  try {
    metrics.dbQueries++;
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        procedure_type,
        notes,
        created_at,
        updated_at
      `)
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return c.json({
      success: true,
      data: appointments || [],
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao buscar agendamentos' 
    }, 500);
  }
});

healthcare.post('/appointments', 
  zValidator('json', appointmentSchema),
  async (c) => {
    const user = c.get('user');
    const metrics = c.get('performanceMetrics');
    const appointmentData = c.req.valid('json');
    
    if (!user.permissions.includes('create_appointments')) {
      return c.json({ error: 'Sem permissão para criar agendamentos' }, 403);
    }
    
    // Healthcare-specific validation
    const scheduledDate = new Date(appointmentData.scheduled_at);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return c.json({ 
        success: false, 
        error: 'Agendamento deve ser para uma data futura' 
      }, 400);
    }
    
    try {
      // Check for scheduling conflicts
      metrics.dbQueries++;
      const { data: conflicts } = await supabase
        .from('appointments')
        .select('id')
        .eq('scheduled_at', appointmentData.scheduled_at)
        .neq('status', 'cancelled');
      
      if (conflicts && conflicts.length > 0) {
        return c.json({ 
          success: false, 
          error: 'Já existe um agendamento para este horário' 
        }, 409);
      }
      
      metrics.dbQueries++;
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          status: 'scheduled',
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return c.json({
        success: true,
        data: appointment,
        message: 'Agendamento criado com sucesso',
      }, 201);
    } catch (error) {
      console.error('Error creating appointment:', error);
      return c.json({ 
        success: false, 
        error: 'Erro ao criar agendamento' 
      }, 500);
    }
  }
);

// Healthcare analytics endpoint with caching
healthcare.get('/analytics/dashboard', 
  cache({
    cacheName: 'healthcare-analytics',
    cacheControl: 'max-age=600', // 10 minutes
  }),
  async (c) => {
    const user = c.get('user');
    const metrics = c.get('performanceMetrics');
    
    if (!user.permissions.includes('read_analytics')) {
      return c.json({ error: 'Sem permissão para visualizar analytics' }, 403);
    }
    
    try {
      // Parallel queries for better performance
      const [patientsResult, appointmentsResult, proceduresResult] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id, status', { count: 'exact' }),
        supabase.from('procedures').select('id, performed_at', { count: 'exact' }),
      ]);
      
      metrics.dbQueries += 3;
      
      const analytics = {
        totalPatients: patientsResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        totalProcedures: proceduresResult.count || 0,
        appointmentsByStatus: appointmentsResult.data?.reduce((acc: any, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {}) || {},
        lastUpdated: new Date().toISOString(),
      };
      
      return c.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return c.json({ 
        success: false, 
        error: 'Erro ao buscar analytics' 
      }, 500);
    }
  }
);

// Health check endpoint
healthcare.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

export default healthcare;