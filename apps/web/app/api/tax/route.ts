// Brazilian Tax Management API
// Story 5.5: API endpoints for Brazilian tax system integration
// Author: VoidBeast V6.0 Master Orchestrator
// Date: 2025-01-30

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Validation schemas
const taxCalculationSchema = z.object({
  clinic_id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  services: z.array(
    z.object({
      codigo_servico: z.string(),
      descricao: z.string(),
      valor_unitario: z.number().positive(),
      quantidade: z.number().positive(),
      valor_total: z.number().positive(),
    }),
  ),
  customer: z.object({
    cnpj: z.string().optional(),
    cpf: z.string().optional(),
    nome: z.string(),
    endereco: z.object({
      logradouro: z.string(),
      numero: z.string(),
      bairro: z.string(),
      municipio: z.string(),
      uf: z.string(),
      cep: z.string(),
    }),
  }),
  calculation_type: z.enum(['estimate', 'final']).default('final'),
});

const nfeGenerationSchema = z.object({
  clinic_id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  emit_immediately: z.boolean().default(false),
  test_mode: z.boolean().default(false),
});

/**
 * GET /api/tax - Get tax configuration and statistics
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
        { status: 400 },
      );
    }

    switch (action) {
      case 'config':
        return await getTaxConfiguration(supabase, clinicId);

      case 'statistics':
        return await getTaxStatistics(supabase, clinicId);

      case 'nfe-status':
        return await getNFEStatus(supabase, clinicId);

      default:
        return await getTaxOverview(supabase, clinicId);
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tax - Tax calculations and NFE generation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'calculate':
        return await calculateTaxes(supabase, body);

      case 'generate-nfe':
        return await generateNFE(supabase, body);

      case 'validate-cnpj':
        return await validateCNPJ(supabase, body);

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 },
        );
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Helper functions
async function getTaxConfiguration(supabase: any, clinicId: string) {
  const { data, error } = await supabase
    .from('tax_configuration')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('active', true)
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Tax configuration not found' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data });
}

async function getTaxStatistics(supabase: any, clinicId: string) {
  // Get NFE statistics
  const { data: nfeStats, error: nfeError } = await supabase
    .from('nfe_documents')
    .select('status, valor_total, created_at')
    .eq('clinic_id', clinicId)
    .gte(
      'created_at',
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    );

  if (nfeError) {
    return NextResponse.json(
      { error: 'Failed to fetch NFE statistics' },
      { status: 500 },
    );
  }

  // Calculate statistics
  const totalDocuments = nfeStats.length;
  const totalValue = nfeStats.reduce((sum, doc) => sum + doc.valor_total, 0);
  const byStatus = nfeStats.reduce(
    (acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return NextResponse.json({
    data: {
      total_documents: totalDocuments,
      total_value: totalValue,
      by_status: byStatus,
      period: '30_days',
    },
  });
}

async function getNFEStatus(supabase: any, clinicId: string) {
  const { data, error } = await supabase
    .from('nfe_documents')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch NFE status' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}

async function getTaxOverview(supabase: any, clinicId: string) {
  const [configResult, statsResult, nfeResult] = await Promise.all([
    getTaxConfiguration(supabase, clinicId),
    getTaxStatistics(supabase, clinicId),
    getNFEStatus(supabase, clinicId),
  ]);

  return NextResponse.json({
    data: {
      configuration: configResult,
      statistics: statsResult,
      recent_nfe: nfeResult,
    },
  });
}

async function calculateTaxes(supabase: any, body: any) {
  const validatedData = taxCalculationSchema.parse(body);

  // Import tax engine
  const { BrazilianTaxEngine } = await import('@/lib/services/tax/tax-engine');
  const taxEngine = new BrazilianTaxEngine();

  const calculations = [];

  for (const service of validatedData.services) {
    const calculation = await taxEngine.calculateTaxes({
      clinic_id: validatedData.clinic_id,
      valor_base: service.valor_total,
      tipo_servico: service.descricao,
      codigo_servico: service.codigo_servico,
    });

    calculations.push({
      service,
      calculation,
    });
  }

  // Store calculation in database
  const { data, error } = await supabase
    .from('tax_calculations')
    .insert({
      clinic_id: validatedData.clinic_id,
      invoice_id: validatedData.invoice_id,
      calculations,
      total_base: validatedData.services.reduce(
        (sum, s) => sum + s.valor_total,
        0,
      ),
      total_taxes: calculations.reduce(
        (sum, c) => sum + c.calculation.total_taxes,
        0,
      ),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to store tax calculation' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      calculation_id: data.id,
      calculations,
      summary: {
        total_base: data.total_base,
        total_taxes: data.total_taxes,
        effective_rate: (data.total_taxes / data.total_base) * 100,
      },
    },
  });
}

async function generateNFE(supabase: any, body: any) {
  const validatedData = nfeGenerationSchema.parse(body);

  // Import NFE service
  const { NFEIntegrationService } = await import(
    '@/lib/services/tax/nfe-service'
  );
  const nfeService = new NFEIntegrationService();

  try {
    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', validatedData.invoice_id)
      .eq('clinic_id', validatedData.clinic_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Generate NFE
    const nfeDocument = await nfeService.generateNFE({
      clinic_id: validatedData.clinic_id,
      invoice_id: validatedData.invoice_id,
      services: invoice.items,
      customer: invoice.customer,
      test_mode: validatedData.test_mode,
    });

    // Store NFE document
    const { data, error } = await supabase
      .from('nfe_documents')
      .insert(nfeDocument)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to store NFE document' },
        { status: 500 },
      );
    }

    // Emit NFE if requested
    if (validatedData.emit_immediately && !validatedData.test_mode) {
      await nfeService.emitNFE(data.id);
    }

    return NextResponse.json({
      data: {
        nfe_id: data.id,
        numero_nfe: data.numero_nfe,
        status: data.status,
        chave_nfe: data.chave_nfe,
        emitted: validatedData.emit_immediately && !validatedData.test_mode,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'NFE generation failed' },
      { status: 500 },
    );
  }
}

async function validateCNPJ(supabase: any, body: any) {
  const { cnpj } = body;

  if (!cnpj) {
    return NextResponse.json({ error: 'CNPJ is required' }, { status: 400 });
  }

  // Import CNPJ validator
  const { CNPJValidator } = await import(
    '@/lib/services/brazilian-tax/cnpj-validator'
  );
  const validator = new CNPJValidator();

  try {
    const validation = await validator.validateCNPJ(cnpj);

    if (validation.valid && validation.companyData) {
      // Store validation result
      await supabase.from('cnpj_validations').upsert({
        cnpj: validation.formatted,
        company_data: validation.companyData,
        validation_date: new Date().toISOString(),
        status: 'valid',
      });
    }

    return NextResponse.json({
      data: validation,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'CNPJ validation failed' },
      { status: 500 },
    );
  }
}
