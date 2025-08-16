import { type NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { systemIntegrationManager } from '@/lib/patients/integration/system-integration-manager';
import { createClient } from '@/lib/supabase/server';

const auditLogger = new AuditLogger();

/**
 * Quick Access Patient Lists API
 * GET /api/patients/integration/quick-access
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check user permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile && ['admin', 'manager', 'staff'].includes(profile.role))) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões insuficientes' },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const listType = searchParams.get('type') || 'recent';
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);

    let quickAccessData;

    switch (listType) {
      case 'recent':
        quickAccessData = await systemIntegrationManager.getQuickAccessPatients(
          'recent',
          user.id,
          limit,
        );
        break;

      case 'favorites':
        quickAccessData = await systemIntegrationManager.getQuickAccessPatients(
          'favorites',
          user.id,
          limit,
        );
        break;

      case 'high-risk':
        quickAccessData = await systemIntegrationManager.getQuickAccessPatients(
          'high-risk',
          user.id,
          limit,
        );
        break;

      case 'upcoming-appointments':
        quickAccessData = await systemIntegrationManager.getQuickAccessPatients(
          'upcoming-appointments',
          user.id,
          limit,
        );
        break;

      case 'pending-verification':
        quickAccessData = await systemIntegrationManager.getQuickAccessPatients(
          'pending-verification',
          user.id,
          limit,
        );
        break;

      case 'frequent':
        quickAccessData = await systemIntegrationManager.getQuickAccessPatients(
          'frequent',
          user.id,
          limit,
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de lista inválido' },
          { status: 400 },
        );
    }

    // Log quick access activity
    await auditLogger.log({
      action: 'quick_access_patients',
      userId: user.id,
      details: {
        listType,
        patientCount: quickAccessData.patients.length,
        limit,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        patients: quickAccessData.patients,
        listType,
        totalCount: quickAccessData.totalCount,
        lastUpdated: quickAccessData.lastUpdated,
      },
    });
  } catch (error) {
    await auditLogger.log({
      action: 'quick_access_patients_error',
      userId: 'system',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
}

/**
 * Add/Remove Patient from Favorites API
 * POST /api/patients/integration/quick-access
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check user permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile && ['admin', 'manager', 'staff'].includes(profile.role))) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões insuficientes' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { patientId, action } = body;

    // Validate required fields
    if (!(patientId && action)) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: patientId, action' },
        { status: 400 },
      );
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida: deve ser "add" ou "remove"' },
        { status: 400 },
      );
    }

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, name')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 },
      );
    }

    let result;
    if (action === 'add') {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('user_favorite_patients')
        .insert({
          user_id: user.id,
          patient_id: patientId,
          created_at: new Date().toISOString(),
        });

      if (insertError && !insertError.message.includes('duplicate')) {
        throw insertError;
      }

      result = { action: 'added', patientId, patientName: patient.name };
    } else {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('user_favorite_patients')
        .delete()
        .eq('user_id', user.id)
        .eq('patient_id', patientId);

      if (deleteError) {
        throw deleteError;
      }

      result = { action: 'removed', patientId, patientName: patient.name };
    }

    // Log favorite action
    await auditLogger.log({
      action: `patient_favorite_${action}`,
      userId: user.id,
      details: {
        patientId,
        patientName: patient.name,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    await auditLogger.log({
      action: 'patient_favorite_error',
      userId: 'system',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
}
