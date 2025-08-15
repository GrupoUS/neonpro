// Brazilian Tax Declarations API
// Story 5.5: API for DEFIS, ECF, DMED and other fiscal declarations
// Author: VoidBeast V6.0 Master Orchestrator
// Date: 2025-01-30

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Validation schemas
const declarationGenerationSchema = z.object({
  clinic_id: z.string().uuid(),
  declaration_type: z.enum(['DEFIS', 'ECF', 'DMED', 'DIPJ']),
  period: z.object({
    year: z.number().int().min(2020).max(2030),
    month: z.number().int().min(1).max(12).optional(),
  }),
  auto_submit: z.boolean().default(false),
  test_mode: z.boolean().default(false),
});

const declarationValidationSchema = z.object({
  declaration_id: z.string().uuid(),
  validate_data: z.boolean().default(true),
  check_compliance: z.boolean().default(true),
});

/**
 * GET /api/tax/declarations - Get declarations and status
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
        return await listDeclarations(supabase, clinicId, searchParams);

      case 'status':
        return await getDeclarationStatus(supabase, searchParams);

      case 'download':
        return await downloadDeclaration(supabase, searchParams);

      case 'calendar':
        return await getDeclarationCalendar(supabase, clinicId);

      case 'compliance':
        return await getComplianceStatus(supabase, clinicId);

      default:
        return await getDeclarationsOverview(supabase, clinicId);
    }
  } catch (error) {
    console.error('Declarations API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tax/declarations - Generate and manage declarations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'generate':
        return await generateDeclaration(supabase, body);

      case 'validate':
        return await validateDeclaration(supabase, body);

      case 'submit':
        return await submitDeclaration(supabase, body);

      case 'schedule':
        return await scheduleDeclaration(supabase, body);

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Declarations API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function listDeclarations(
  supabase: any,
  clinicId: string,
  searchParams: URLSearchParams
) {
  let query = supabase
    .from('tax_declarations')
    .select('*')
    .eq('clinic_id', clinicId);

  // Apply filters
  const type = searchParams.get('type');
  if (type) {
    query = query.eq('declaration_type', type);
  }

  const year = searchParams.get('year');
  if (year) {
    query = query.eq('period_year', Number.parseInt(year, 10));
  }

  const status = searchParams.get('status');
  if (status) {
    query = query.eq('status', status);
  }

  const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
  const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch declarations' },
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

async function getDeclarationStatus(
  supabase: any,
  searchParams: URLSearchParams
) {
  const declarationId = searchParams.get('declaration_id');

  if (!declarationId) {
    return NextResponse.json(
      { error: 'declaration_id parameter is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('tax_declarations')
    .select('*')
    .eq('id', declarationId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Declaration not found' },
      { status: 404 }
    );
  }

  // Get submission status from tax authority if submitted
  if (data.status === 'submitted' && data.protocol_number) {
    try {
      const { TaxDeclarationService } = await import(
        '@/lib/services/tax/tax-declarations'
      );
      const declarationService = new TaxDeclarationService();

      const updatedStatus = await declarationService.checkSubmissionStatus(
        data.declaration_type,
        data.protocol_number
      );

      // Update database if status changed
      if (updatedStatus.status !== data.status) {
        await supabase
          .from('tax_declarations')
          .update({
            status: updatedStatus.status,
            processing_result: updatedStatus.result,
            updated_at: new Date().toISOString(),
          })
          .eq('id', declarationId);

        data.status = updatedStatus.status;
        data.processing_result = updatedStatus.result;
      }
    } catch (error) {
      console.error('Declaration status check error:', error);
    }
  }

  return NextResponse.json({
    data: {
      ...data,
      last_checked: new Date().toISOString(),
    },
  });
}

async function downloadDeclaration(
  supabase: any,
  searchParams: URLSearchParams
) {
  const declarationId = searchParams.get('declaration_id');
  const format = searchParams.get('format') || 'pdf';

  if (!declarationId) {
    return NextResponse.json(
      { error: 'declaration_id parameter is required' },
      { status: 400 }
    );
  }

  const { data: declaration, error } = await supabase
    .from('tax_declarations')
    .select('*')
    .eq('id', declarationId)
    .single();

  if (error || !declaration) {
    return NextResponse.json(
      { error: 'Declaration not found' },
      { status: 404 }
    );
  }

  try {
    const { TaxDeclarationService } = await import(
      '@/lib/services/tax/tax-declarations'
    );
    const declarationService = new TaxDeclarationService();

    const fileData = await declarationService.exportDeclaration(
      declarationId,
      format
    );

    const headers = new Headers();
    headers.set(
      'Content-Type',
      format === 'pdf' ? 'application/pdf' : 'application/xml'
    );
    headers.set(
      'Content-Disposition',
      `attachment; filename="${declaration.declaration_type}_${declaration.period_year}.${format}"`
    );

    return new NextResponse(fileData, { headers });
  } catch (error) {
    console.error('Declaration download error:', error);
    return NextResponse.json(
      { error: 'Failed to download declaration' },
      { status: 500 }
    );
  }
}

async function getDeclarationCalendar(supabase: any, clinicId: string) {
  const currentYear = new Date().getFullYear();

  // Get clinic tax configuration
  const { data: config } = await supabase
    .from('tax_configuration')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('active', true)
    .single();

  if (!config) {
    return NextResponse.json(
      { error: 'Tax configuration not found' },
      { status: 404 }
    );
  }

  // Generate declaration calendar based on tax regime
  const { TaxDeclarationService } = await import(
    '@/lib/services/tax/tax-declarations'
  );
  const declarationService = new TaxDeclarationService();

  try {
    const calendar = await declarationService.generateDeclarationCalendar(
      config.tax_regime,
      currentYear
    );

    return NextResponse.json({
      data: {
        year: currentYear,
        tax_regime: config.tax_regime,
        calendar,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Declaration calendar error:', error);
    return NextResponse.json(
      { error: 'Failed to generate declaration calendar' },
      { status: 500 }
    );
  }
}

async function getComplianceStatus(supabase: any, clinicId: string) {
  const currentYear = new Date().getFullYear();

  // Get all declarations for current year
  const { data: declarations } = await supabase
    .from('tax_declarations')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('period_year', currentYear);

  // Get required declarations for tax regime
  const { data: config } = await supabase
    .from('tax_configuration')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('active', true)
    .single();

  if (!config) {
    return NextResponse.json(
      { error: 'Tax configuration not found' },
      { status: 404 }
    );
  }

  try {
    const { TaxDeclarationService } = await import(
      '@/lib/services/tax/tax-declarations'
    );
    const declarationService = new TaxDeclarationService();

    const compliance = await declarationService.assessCompliance(
      clinicId,
      config.tax_regime,
      currentYear
    );

    return NextResponse.json({
      data: {
        clinic_id: clinicId,
        year: currentYear,
        tax_regime: config.tax_regime,
        compliance_status: compliance.status,
        compliance_score: compliance.score,
        required_declarations: compliance.required,
        submitted_declarations: compliance.submitted,
        pending_declarations: compliance.pending,
        overdue_declarations: compliance.overdue,
        recommendations: compliance.recommendations,
        assessed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Compliance assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to assess compliance' },
      { status: 500 }
    );
  }
}

async function getDeclarationsOverview(supabase: any, clinicId: string) {
  const currentYear = new Date().getFullYear();

  // Get statistics
  const { data: stats } = await supabase
    .from('tax_declarations')
    .select('declaration_type, status, created_at')
    .eq('clinic_id', clinicId)
    .gte('created_at', `${currentYear}-01-01`);

  const summary = {
    total_declarations: stats?.length || 0,
    by_type:
      stats?.reduce(
        (acc, decl) => {
          acc[decl.declaration_type] = (acc[decl.declaration_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {},
    by_status:
      stats?.reduce(
        (acc, decl) => {
          acc[decl.status] = (acc[decl.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {},
    year: currentYear,
  };

  return NextResponse.json({
    data: {
      summary,
      recent_declarations: stats?.slice(0, 10) || [],
    },
  });
}

async function generateDeclaration(supabase: any, body: any) {
  const validatedData = declarationGenerationSchema.parse(body);

  try {
    const { TaxDeclarationService } = await import(
      '@/lib/services/tax/tax-declarations'
    );
    const declarationService = new TaxDeclarationService();

    // Generate declaration
    const declaration = await declarationService.generateDeclaration({
      clinic_id: validatedData.clinic_id,
      declaration_type: validatedData.declaration_type,
      period: validatedData.period,
      test_mode: validatedData.test_mode,
    });

    // Store in database
    const { data, error } = await supabase
      .from('tax_declarations')
      .insert({
        clinic_id: validatedData.clinic_id,
        declaration_type: validatedData.declaration_type,
        period_year: validatedData.period.year,
        period_month: validatedData.period.month,
        status: 'generated',
        declaration_data: declaration.data,
        file_path: declaration.file_path,
        test_mode: validatedData.test_mode,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to store declaration' },
        { status: 500 }
      );
    }

    // Auto-submit if requested
    if (validatedData.auto_submit && !validatedData.test_mode) {
      try {
        const submission = await declarationService.submitDeclaration(data.id);

        await supabase
          .from('tax_declarations')
          .update({
            status: 'submitted',
            protocol_number: submission.protocol,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        data.status = 'submitted';
        data.protocol_number = submission.protocol;
      } catch (submissionError) {
        console.error('Auto-submission failed:', submissionError);
        // Continue with generated status
      }
    }

    return NextResponse.json({
      data: {
        declaration_id: data.id,
        declaration_type: data.declaration_type,
        period: {
          year: data.period_year,
          month: data.period_month,
        },
        status: data.status,
        file_path: data.file_path,
        protocol_number: data.protocol_number,
        generated_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('Declaration generation error:', error);
    return NextResponse.json(
      { error: 'Declaration generation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function validateDeclaration(supabase: any, body: any) {
  const validatedData = declarationValidationSchema.parse(body);

  // Get declaration
  const { data: declaration, error } = await supabase
    .from('tax_declarations')
    .select('*')
    .eq('id', validatedData.declaration_id)
    .single();

  if (error || !declaration) {
    return NextResponse.json(
      { error: 'Declaration not found' },
      { status: 404 }
    );
  }

  try {
    const { TaxDeclarationService } = await import(
      '@/lib/services/tax/tax-declarations'
    );
    const declarationService = new TaxDeclarationService();

    const validation = await declarationService.validateDeclaration(
      validatedData.declaration_id,
      {
        validate_data: validatedData.validate_data,
        check_compliance: validatedData.check_compliance,
      }
    );

    // Update declaration status
    await supabase
      .from('tax_declarations')
      .update({
        validation_status: validation.valid ? 'valid' : 'invalid',
        validation_errors: validation.errors,
        validation_warnings: validation.warnings,
        validated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.declaration_id);

    return NextResponse.json({
      data: {
        declaration_id: validatedData.declaration_id,
        valid: validation.valid,
        errors: validation.errors || [],
        warnings: validation.warnings || [],
        compliance_score: validation.compliance_score,
        validated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Declaration validation error:', error);
    return NextResponse.json(
      { error: 'Declaration validation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function submitDeclaration(supabase: any, body: any) {
  const { declaration_id, force_submit = false } = body;

  if (!declaration_id) {
    return NextResponse.json(
      { error: 'declaration_id is required' },
      { status: 400 }
    );
  }

  // Get declaration
  const { data: declaration, error } = await supabase
    .from('tax_declarations')
    .select('*')
    .eq('id', declaration_id)
    .single();

  if (error || !declaration) {
    return NextResponse.json(
      { error: 'Declaration not found' },
      { status: 404 }
    );
  }

  if (declaration.status === 'submitted' && !force_submit) {
    return NextResponse.json(
      { error: 'Declaration already submitted' },
      { status: 400 }
    );
  }

  try {
    const { TaxDeclarationService } = await import(
      '@/lib/services/tax/tax-declarations'
    );
    const declarationService = new TaxDeclarationService();

    const submission =
      await declarationService.submitDeclaration(declaration_id);

    // Update declaration status
    await supabase
      .from('tax_declarations')
      .update({
        status: 'submitted',
        protocol_number: submission.protocol,
        submitted_at: new Date().toISOString(),
        submission_result: submission.result,
      })
      .eq('id', declaration_id);

    return NextResponse.json({
      data: {
        declaration_id,
        status: 'submitted',
        protocol_number: submission.protocol,
        submission_result: submission.result,
        submitted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Declaration submission error:', error);

    // Update status to error
    await supabase
      .from('tax_declarations')
      .update({
        status: 'error',
        error_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', declaration_id);

    return NextResponse.json(
      { error: 'Declaration submission failed', details: error.message },
      { status: 500 }
    );
  }
}

async function scheduleDeclaration(supabase: any, body: any) {
  const { clinic_id, declaration_type, period, schedule_date } = body;

  if (!(clinic_id && declaration_type && period && schedule_date)) {
    return NextResponse.json(
      {
        error:
          'clinic_id, declaration_type, period, and schedule_date are required',
      },
      { status: 400 }
    );
  }

  try {
    // Create scheduled declaration
    const { data, error } = await supabase
      .from('scheduled_declarations')
      .insert({
        clinic_id,
        declaration_type,
        period_year: period.year,
        period_month: period.month,
        scheduled_date: schedule_date,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to schedule declaration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        schedule_id: data.id,
        clinic_id,
        declaration_type,
        period,
        scheduled_date: schedule_date,
        status: 'scheduled',
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('Declaration scheduling error:', error);
    return NextResponse.json(
      { error: 'Declaration scheduling failed', details: error.message },
      { status: 500 }
    );
  }
}
