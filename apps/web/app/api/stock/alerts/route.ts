/**
 * Story 11.4: Stock Alerts API Routes
 * API para gerenciamento de alertas de estoque
 */

import { type NextRequest, NextResponse } from 'next/server';
import { StockAlertsService } from '@/app/lib/services/stock-alerts.service';
import { validateAlertsQuery } from '@/app/lib/types/stock-alerts';
import { createClient } from '@/app/utils/supabase/server';

const alertsService = new StockAlertsService();

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter perfil do usuário para pegar clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Processar query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryFilters = {
      status: searchParams.get('status') as any,
      severity: searchParams.get('severity') as any,
      type: searchParams.get('type') as any,
      limit: searchParams.get('limit')
        ? Number.parseInt(searchParams.get('limit')!, 10)
        : undefined,
    };

    // Validar parâmetros de query
    const validatedQuery = validateAlertsQuery({
      ...queryFilters,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const result = await alertsService.getActiveAlerts(profile.clinic_id, {
      severity: validatedQuery.severity ? [validatedQuery.severity] : undefined,
      type: validatedQuery.type ? [validatedQuery.type] : undefined,
      status: validatedQuery.status ? [validatedQuery.status] : undefined,
      limit: validatedQuery.limit,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      meta: {
        total: result.data?.length || 0,
        filters: validatedQuery,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/stock/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter perfil do usuário para pegar clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'acknowledge': {
        const ackResult = await alertsService.acknowledgeAlert(
          body.data,
          user.id
        );
        if (!ackResult.success) {
          return NextResponse.json({ error: ackResult.error }, { status: 400 });
        }
        return NextResponse.json({ data: ackResult.data });
      }

      case 'resolve': {
        const resolveResult = await alertsService.resolveAlert(
          body.data,
          user.id
        );
        if (!resolveResult.success) {
          return NextResponse.json(
            { error: resolveResult.error },
            { status: 400 }
          );
        }
        return NextResponse.json({ data: resolveResult.data });
      }

      case 'dismiss': {
        const dismissResult = await alertsService.dismissAlert(
          body.data.alert_id,
          user.id,
          body.data.reason
        );
        if (!dismissResult.success) {
          return NextResponse.json(
            { error: dismissResult.error },
            { status: 400 }
          );
        }
        return NextResponse.json({ data: dismissResult.data });
      }

      case 'generate': {
        const generateResult = await alertsService.generateAlerts(
          profile.clinic_id
        );
        if (!generateResult.success) {
          return NextResponse.json(
            { error: generateResult.error },
            { status: 500 }
          );
        }
        return NextResponse.json({ data: generateResult.data });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/stock/alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
