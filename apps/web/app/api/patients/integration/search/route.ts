import { type NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { systemIntegrationManager } from '@/lib/patients/integration/system-integration-manager';
import { createClient } from '@/lib/supabase/server';

const auditLogger = new AuditLogger();

/**
 * Advanced Patient Search API
 * GET /api/patients/integration/search
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
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    // Parse filters
    const filters: any = {};

    if (searchParams.get('name')) {
      filters.name = searchParams.get('name');
    }
    if (searchParams.get('email')) {
      filters.email = searchParams.get('email');
    }
    if (searchParams.get('phone')) {
      filters.phone = searchParams.get('phone');
    }
    if (searchParams.get('cpf')) {
      filters.cpf = searchParams.get('cpf');
    }
    if (searchParams.get('gender')) {
      filters.gender = searchParams.get('gender');
    }
    if (searchParams.get('riskLevel')) {
      filters.riskLevel = searchParams.get('riskLevel');
    }
    if (searchParams.get('treatmentType')) {
      filters.treatmentType = searchParams.get('treatmentType');
    }
    if (searchParams.get('appointmentStatus')) {
      filters.appointmentStatus = searchParams.get('appointmentStatus');
    }
    if (searchParams.get('hasPhotos')) {
      filters.hasPhotos = searchParams.get('hasPhotos') === 'true';
    }
    if (searchParams.get('consentStatus')) {
      filters.consentStatus = searchParams.get('consentStatus') === 'true';
    }

    // Age range
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    if (minAge && maxAge) {
      filters.ageRange = {
        min: Number.parseInt(minAge, 10),
        max: Number.parseInt(maxAge, 10),
      };
    }

    // Date range for last visit
    const lastVisitFrom = searchParams.get('lastVisitFrom');
    const lastVisitTo = searchParams.get('lastVisitTo');
    if (lastVisitFrom && lastVisitTo) {
      filters.lastVisit = {
        from: new Date(lastVisitFrom),
        to: new Date(lastVisitTo),
      };
    }

    // Tags
    const tags = searchParams.get('tags');
    if (tags) {
      filters.tags = tags.split(',').map((tag) => tag.trim());
    }

    // Execute search
    const searchResults = await systemIntegrationManager.searchPatients(
      query,
      filters,
      user.id,
      limit
    );

    // Log search activity
    await auditLogger.log({
      action: 'advanced_patient_search',
      userId: user.id,
      details: {
        query,
        filters,
        resultCount: searchResults.patients.length,
        searchTime: searchResults.searchTime,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        patients: searchResults.patients,
        suggestions: searchResults.suggestions,
        totalCount: searchResults.totalCount,
        searchTime: searchResults.searchTime,
        query,
        filters,
      },
    });
  } catch (error) {
    console.error('Error in advanced patient search:', error);

    await auditLogger.log({
      action: 'advanced_patient_search_error',
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
      { status: 500 }
    );
  }
}

/**
 * Create Patient Segment API
 * POST /api/patients/integration/search
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

    // Check user permissions (only admin/manager can create segments)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!(profile && ['admin', 'manager'].includes(profile.role))) {
      return NextResponse.json(
        {
          error:
            'Acesso negado: apenas administradores e gerentes podem criar segmentos',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, criteria } = body;

    // Validate required fields
    if (!(name && description && criteria)) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, description, criteria' },
        { status: 400 }
      );
    }

    // Create patient segment
    const segment = await systemIntegrationManager.createPatientSegment(
      name,
      description,
      criteria,
      user.id
    );

    // Log segment creation
    await auditLogger.log({
      action: 'patient_segment_created',
      userId: user.id,
      details: {
        segmentId: segment.id,
        name: segment.name,
        patientCount: segment.patientCount,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: segment,
    });
  } catch (error) {
    console.error('Error creating patient segment:', error);

    await auditLogger.log({
      action: 'patient_segment_creation_error',
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
      { status: 500 }
    );
  }
}
