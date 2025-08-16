/**
 * API Endpoint: Notification Status
 *
 * Endpoint para consultar status, histórico e métricas de notificações
 *
 * @route GET /api/notifications/status
 * @route GET /api/notifications/status/[id]
 * @author APEX Architecture Team
 * @version 1.0.0
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// ================================================================================
// VALIDATION SCHEMAS
// ================================================================================

const StatusQuerySchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  type: z.string().optional(),
  status: z
    .enum(['pending', 'sent', 'delivered', 'failed', 'cancelled'])
    .optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
});

// ================================================================================
// HELPER FUNCTIONS
// ================================================================================

async function validateAuth(_request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { error: 'Não autenticado', status: 401 };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Usuário inválido', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id, role, permissions')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Perfil não encontrado', status: 404 };
  }

  return { user, profile, supabase };
}

// ================================================================================
// API HANDLERS
// ================================================================================

/**
 * GET /api/notifications/status
 * Lista notificações com filtros
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const { profile, supabase } = authResult;
    const { searchParams } = new URL(request.url);

    // Validar parâmetros
    const queryParams = {
      id: searchParams.get('id') || undefined,
      userId: searchParams.get('userId') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      limit: Number.parseInt(searchParams.get('limit') || '50', 10),
      offset: Number.parseInt(searchParams.get('offset') || '0', 10),
    };

    const validationResult = StatusQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Parâmetros inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const query = validationResult.data;

    // Construir query do Supabase
    let dbQuery = supabase
      .from('notifications')
      .select(
        `
        id,
        user_id,
        clinic_id,
        type,
        status,
        title,
        content,
        channels,
        scheduled_for,
        sent_at,
        delivered_at,
        failed_at,
        error_message,
        metadata,
        created_at,
        updated_at
      `,
      )
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (query.id) {
      dbQuery = dbQuery.eq('id', query.id);
    }

    if (query.userId) {
      dbQuery = dbQuery.eq('user_id', query.userId);
    }

    if (query.type) {
      dbQuery = dbQuery.eq('type', query.type);
    }

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.dateFrom) {
      dbQuery = dbQuery.gte('created_at', query.dateFrom);
    }

    if (query.dateTo) {
      dbQuery = dbQuery.lte('created_at', query.dateTo);
    }

    // Aplicar paginação
    dbQuery = dbQuery.range(query.offset, query.offset + query.limit - 1);

    const { data: notifications, error, count } = await dbQuery;

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar notificações' },
        { status: 500 },
      );
    }

    // Buscar contagem total se não foi retornada
    const totalCount = count || notifications?.length || 0;

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        total: totalCount,
        limit: query.limit,
        offset: query.offset,
        hasNext: totalCount > query.offset + query.limit,
        hasPrevious: query.offset > 0,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
