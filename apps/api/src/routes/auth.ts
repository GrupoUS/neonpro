/**
 * Authentication Routes
 * Login, register, logout, and user management endpoints
 */

import { zValidator } from '@hono/zod-validator';
import { createClient } from '@supabase/supabase-js';
import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth';
import { rateLimitConfigs, rateLimitMiddleware } from '@/middleware/rate-limit';
import type { AppEnv } from '@/types/env';

const authRoutes = new Hono<AppEnv>();

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  clinic_id: z.string().optional(),
  remember_me: z.boolean().default(false),
});

const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirm_password: z.string(),
    full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    clinic_name: z
      .string()
      .min(2, 'Nome da clínica deve ter pelo menos 2 caracteres'),
    phone: z.string().min(10, 'Telefone inválido'),
    cnpj: z.string().optional(),
    consent_lgpd: z.boolean(),
    consent_marketing: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Senhas não coincidem',
    path: ['confirm_password'],
  })
  .refine((data) => data.consent_lgpd === true, {
    message: 'Consentimento LGPD é obrigatório',
    path: ['consent_lgpd'],
  });

// Apply rate limiting to auth routes
authRoutes.use('*', rateLimitMiddleware(rateLimitConfigs.auth));

/**
 * POST /login
 * User authentication
 */
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password, clinic_id, remember_me } = c.req.valid('json');

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json(
        {
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Email ou senha inválidos',
            details: error.message,
          },
        },
        401
      );
    }

    if (!(data.user && data.session)) {
      return c.json(
        {
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Falha na autenticação',
          },
        },
        401
      );
    }

    // TODO: Get user permissions and clinic data
    const permissions = ['user']; // TODO: Implement actual permission system
    const clinic_data = null; // TODO: Fetch clinic data if clinic_id provided

    return c.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: 'bearer',
      expires_in: data.session.expires_in || 3600,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
        avatar_url: data.user.user_metadata?.avatar_url,
        role: data.user.app_metadata?.role || 'user',
        email_confirmed: !!data.user.email_confirmed_at,
        last_sign_in: data.user.last_sign_in_at,
      },
      clinic: clinic_data,
      permissions,
    });
  } catch (_error) {
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      500
    );
  }
});

/**
 * POST /register
 * User registration
 */
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const {
      email,
      password,
      full_name,
      clinic_name,
      phone,
      cnpj,
      consent_lgpd,
      consent_marketing,
    } = c.req.valid('json');

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          clinic_name,
          phone,
          cnpj: cnpj || null,
        },
      },
    });

    if (error) {
      return c.json(
        {
          error: {
            code: 'REGISTRATION_FAILED',
            message: error.message,
          },
        },
        400
      );
    }

    if (!data.user) {
      return c.json(
        {
          error: {
            code: 'REGISTRATION_FAILED',
            message: 'Falha no registro do usuário',
          },
        },
        400
      );
    }

    // TODO: Create clinic record and user profile in database
    // TODO: Record LGPD consents

    return c.json({
      success: true,
      message:
        'Usuário registrado com sucesso. Verifique seu email para confirmar a conta.',
      user_id: data.user.id,
      email_sent: true,
    });
  } catch (_error) {
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      500
    );
  }
});

/**
 * POST /refresh
 * Refresh access token
 */
authRoutes.post(
  '/refresh',
  zValidator(
    'json',
    z.object({
      refresh_token: z.string(),
    })
  ),
  async (c) => {
    try {
      const { refresh_token } = c.req.valid('json');

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token,
      });

      if (error || !data.session) {
        return c.json(
          {
            error: {
              code: 'INVALID_REFRESH_TOKEN',
              message: 'Token de refresh inválido',
            },
          },
          401
        );
      }

      // TODO: Get updated permissions
      const permissions = ['user'];

      return c.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        token_type: 'bearer',
        expires_in: data.session.expires_in || 3600,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          full_name: data.user?.user_metadata?.full_name,
          avatar_url: data.user?.user_metadata?.avatar_url,
          role: data.user?.app_metadata?.role || 'user',
        },
        permissions,
      });
    } catch (_error) {
      return c.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno do servidor',
          },
        },
        500
      );
    }
  }
);

/**
 * POST /logout
 * User logout
 */
authRoutes.post('/logout', requireAuth(), async (c) => {
  try {
    const _user = c.get('user')!;

    // Get token from header
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.substring(7); // Remove 'Bearer '

    if (token) {
      // Sign out from Supabase
      await supabase.auth.admin.signOut(token);
    }

    // TODO: Invalidate session in database
    // TODO: Log logout event for LGPD compliance

    return c.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (_error) {
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      500
    );
  }
});

/**
 * GET /me
 * Get current user data
 */
authRoutes.get('/me', requireAuth(), async (c) => {
  try {
    const user = c.get('user')!;

    // TODO: Get complete user profile from database
    // TODO: Get LGPD consent status

    return c.json({
      user,
      // profile: user_profile,
      // consent_status: consent_status,
      // active_sessions: session_count,
    });
  } catch (_error) {
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      500
    );
  }
});

export { authRoutes };
