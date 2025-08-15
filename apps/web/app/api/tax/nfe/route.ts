// NFE Management API
// Story 5.5: Specialized API for NFE operations
// Author: VoidBeast V6.0 Master Orchestrator
// Date: 2025-01-30

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Validation schemas
const nfeEmissionSchema = z.object({
  nfe_id: z.string().uuid(),
  force_emission: z.boolean().default(false),
});

const nfeCancellationSchema = z.object({
  nfe_id: z.string().uuid(),
  justification: z.string().min(15).max(255),
});

const _nfeConsultationSchema = z.object({
  nfe_number: z.string().optional(),
  chave_nfe: z.string().optional(),
  status: z.enum(['draft', 'emitted', 'cancelled', 'rejected']).optional(),
  date_range: z
    .object({
      start_date: z.string(),
      end_date: z.string(),
    })
    .optional(),
});

/**
 * GET /api/tax/nfe - Consult NFE documents
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const action = searchParams.get('action');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id parameter is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'list':
        return await listNFEDocuments(supabase, clinicId, searchParams);

      case 'status':
        return await getNFEStatus(supabase, searchParams);

      case 'download':
        return await downloadNFE(supabase, searchParams);

      case 'validate':
        return await validateNFE(supabase, searchParams);

      default:
        return await getNFEOverview(supabase, clinicId);
    }
  } catch (error) {
    console.error('NFE API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tax/nfe - NFE operations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'emit':
        return await emitNFE(supabase, body);

      case 'cancel':
        return await cancelNFE(supabase, body);

      case 'reprocess':
        return await reprocessNFE(supabase, body);

      case 'batch-emit':
        return await batchEmitNFE(supabase, body);

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('NFE API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function listNFEDocuments(
  supabase: any,
  clinicId: string,
  searchParams: URLSearchParams
) {
  let query = supabase
    .from('nfe_documents')
    .select('*')
    .eq('clinic_id', clinicId);

  // Apply filters
  const status = searchParams.get('status');
  if (status) {
    query = query.eq('status', status);
  }

  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  if (startDate && endDate) {
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  }

  const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
  const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch NFE documents' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    pagination: {
      total: count,
      limit,
      offset,
      has_more: count > offset + limit,
    },
  });
}

async function getNFEStatus(supabase: any, searchParams: URLSearchParams) {
  const nfeId = searchParams.get('nfe_id');
  const chaveNfe = searchParams.get('chave_nfe');

  if (!(nfeId || chaveNfe)) {
    return NextResponse.json(
      { error: 'nfe_id or chave_nfe parameter is required' },
      { status: 400 }
    );
  }

  let query = supabase.from('nfe_documents').select('*');

  if (nfeId) {
    query = query.eq('id', nfeId);
  } else {
    query = query.eq('chave_nfe', chaveNfe);
  }

  const { data, error } = await query.single();

  if (error) {
    return NextResponse.json({ error: 'NFE not found' }, { status: 404 });
  }

  // Import NFE service to get latest status
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  try {
    const updatedStatus = await nfeService.consultNFEStatus(data.chave_nfe);

    // Update database if status changed
    if (updatedStatus.status !== data.status) {
      await supabase
        .from('nfe_documents')
        .update({
          status: updatedStatus.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
    }

    return NextResponse.json({
      data: {
        ...data,
        status: updatedStatus.status,
        latest_consultation: updatedStatus,
      },
    });
  } catch (error) {
    console.error('NFE status consultation error:', error);
    return NextResponse.json({ data });
  }
}

async function downloadNFE(supabase: any, searchParams: URLSearchParams) {
  const nfeId = searchParams.get('nfe_id');
  const format = searchParams.get('format') || 'pdf';

  if (!nfeId) {
    return NextResponse.json(
      { error: 'nfe_id parameter is required' },
      { status: 400 }
    );
  }

  const { data: nfe, error } = await supabase
    .from('nfe_documents')
    .select('*')
    .eq('id', nfeId)
    .single();

  if (error || !nfe) {
    return NextResponse.json({ error: 'NFE not found' }, { status: 404 });
  }

  // Import NFE service
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  try {
    const fileData = await nfeService.downloadNFE(nfe.chave_nfe, format);

    const headers = new Headers();
    headers.set(
      'Content-Type',
      format === 'pdf' ? 'application/pdf' : 'application/xml'
    );
    headers.set(
      'Content-Disposition',
      `attachment; filename="NFE_${nfe.numero_nfe}.${format}"`
    );

    return new NextResponse(fileData, { headers });
  } catch (error) {
    console.error('NFE download error:', error);
    return NextResponse.json(
      { error: 'Failed to download NFE' },
      { status: 500 }
    );
  }
}

async function validateNFE(supabase: any, searchParams: URLSearchParams) {
  const nfeId = searchParams.get('nfe_id');

  if (!nfeId) {
    return NextResponse.json(
      { error: 'nfe_id parameter is required' },
      { status: 400 }
    );
  }

  const { data: nfe, error } = await supabase
    .from('nfe_documents')
    .select('*')
    .eq('id', nfeId)
    .single();

  if (error || !nfe) {
    return NextResponse.json({ error: 'NFE not found' }, { status: 404 });
  }

  // Import NFE service
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  try {
    const validation = await nfeService.validateNFE(nfe);

    return NextResponse.json({
      data: {
        nfe_id: nfeId,
        valid: validation.valid,
        errors: validation.errors || [],
        warnings: validation.warnings || [],
        validated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('NFE validation error:', error);
    return NextResponse.json(
      { error: 'NFE validation failed' },
      { status: 500 }
    );
  }
}

async function getNFEOverview(supabase: any, clinicId: string) {
  // Get summary statistics
  const { data: stats, error: statsError } = await supabase
    .from('nfe_documents')
    .select('status, valor_total, created_at')
    .eq('clinic_id', clinicId)
    .gte(
      'created_at',
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (statsError) {
    return NextResponse.json(
      { error: 'Failed to fetch NFE statistics' },
      { status: 500 }
    );
  }

  const summary = {
    total_documents: stats.length,
    total_value: stats.reduce((sum, doc) => sum + doc.valor_total, 0),
    by_status: stats.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    last_30_days: stats.length,
  };

  return NextResponse.json({
    data: {
      summary,
      recent_documents: stats.slice(0, 10),
    },
  });
}

async function emitNFE(supabase: any, body: any) {
  const validatedData = nfeEmissionSchema.parse(body);

  // Get NFE document
  const { data: nfe, error } = await supabase
    .from('nfe_documents')
    .select('*')
    .eq('id', validatedData.nfe_id)
    .single();

  if (error || !nfe) {
    return NextResponse.json({ error: 'NFE not found' }, { status: 404 });
  }

  if (nfe.status === 'emitted' && !validatedData.force_emission) {
    return NextResponse.json({ error: 'NFE already emitted' }, { status: 400 });
  }

  // Import NFE service
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  try {
    const emission = await nfeService.emitNFE(validatedData.nfe_id);

    // Update document status
    await supabase
      .from('nfe_documents')
      .update({
        status: emission.status,
        chave_nfe: emission.chave_nfe,
        protocolo_autorizacao: emission.protocolo,
        data_emissao: emission.data_emissao,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.nfe_id);

    return NextResponse.json({
      data: {
        nfe_id: validatedData.nfe_id,
        status: emission.status,
        chave_nfe: emission.chave_nfe,
        protocolo: emission.protocolo,
        emitted_at: emission.data_emissao,
      },
    });
  } catch (error) {
    console.error('NFE emission error:', error);

    // Update status to error
    await supabase
      .from('nfe_documents')
      .update({
        status: 'error',
        error_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.nfe_id);

    return NextResponse.json(
      { error: 'NFE emission failed', details: error.message },
      { status: 500 }
    );
  }
}

async function cancelNFE(supabase: any, body: any) {
  const validatedData = nfeCancellationSchema.parse(body);

  // Get NFE document
  const { data: nfe, error } = await supabase
    .from('nfe_documents')
    .select('*')
    .eq('id', validatedData.nfe_id)
    .single();

  if (error || !nfe) {
    return NextResponse.json({ error: 'NFE not found' }, { status: 404 });
  }

  if (nfe.status !== 'emitted') {
    return NextResponse.json(
      { error: 'Only emitted NFEs can be cancelled' },
      { status: 400 }
    );
  }

  // Import NFE service
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  try {
    const cancellation = await nfeService.cancelNFE(
      nfe.chave_nfe,
      validatedData.justification
    );

    // Update document status
    await supabase
      .from('nfe_documents')
      .update({
        status: 'cancelled',
        cancellation_reason: validatedData.justification,
        cancellation_protocol: cancellation.protocolo,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.nfe_id);

    return NextResponse.json({
      data: {
        nfe_id: validatedData.nfe_id,
        status: 'cancelled',
        cancellation_protocol: cancellation.protocolo,
        cancelled_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('NFE cancellation error:', error);
    return NextResponse.json(
      { error: 'NFE cancellation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function reprocessNFE(supabase: any, body: any) {
  const { nfe_id } = body;

  if (!nfe_id) {
    return NextResponse.json({ error: 'nfe_id is required' }, { status: 400 });
  }

  // Get NFE document
  const { data: nfe, error } = await supabase
    .from('nfe_documents')
    .select('*')
    .eq('id', nfe_id)
    .single();

  if (error || !nfe) {
    return NextResponse.json({ error: 'NFE not found' }, { status: 404 });
  }

  // Import NFE service
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  try {
    const reprocessed = await nfeService.reprocessNFE(nfe_id);

    return NextResponse.json({
      data: {
        nfe_id,
        status: reprocessed.status,
        reprocessed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('NFE reprocessing error:', error);
    return NextResponse.json(
      { error: 'NFE reprocessing failed', details: error.message },
      { status: 500 }
    );
  }
}

async function batchEmitNFE(supabase: any, body: any) {
  const { nfe_ids, emit_options = {} } = body;

  if (!(nfe_ids && Array.isArray(nfe_ids))) {
    return NextResponse.json(
      { error: 'nfe_ids array is required' },
      { status: 400 }
    );
  }

  // Import NFE service
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  const results = [];

  for (const nfeId of nfe_ids) {
    try {
      const emission = await nfeService.emitNFE(nfeId);

      // Update document status
      await supabase
        .from('nfe_documents')
        .update({
          status: emission.status,
          chave_nfe: emission.chave_nfe,
          protocolo_autorizacao: emission.protocolo,
          data_emissao: emission.data_emissao,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nfeId);

      results.push({
        nfe_id: nfeId,
        success: true,
        status: emission.status,
        chave_nfe: emission.chave_nfe,
      });
    } catch (error) {
      console.error(`Batch NFE emission error for ${nfeId}:`, error);

      // Update status to error
      await supabase
        .from('nfe_documents')
        .update({
          status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nfeId);

      results.push({
        nfe_id: nfeId,
        success: false,
        error: error.message,
      });
    }
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    data: {
      batch_id: crypto.randomUUID(),
      total_processed: nfe_ids.length,
      successful,
      failed,
      results,
    },
  });
}
