// CNPJ Validation & Consultation API
// Story 5.5: Specialized API for CNPJ operations with Brasil API integration
// Author: VoidBeast V6.0 Master Orchestrator
// Date: 2025-01-30

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const cnpjValidationSchema = z.object({
  cnpj: z.string().min(11).max(18),
  validate_status: z.boolean().default(true),
  get_company_data: z.boolean().default(true),
  store_result: z.boolean().default(true),
});

const cnpjBatchSchema = z.object({
  cnpjs: z.array(z.string()).min(1).max(100),
  validate_status: z.boolean().default(true),
  get_company_data: z.boolean().default(false),
});

const cnpjSearchSchema = z.object({
  company_name: z.string().min(3).optional(),
  activity_code: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.enum(['ativa', 'inapta', 'suspensa', 'nula', 'baixada']).optional(),
});

/**
 * GET /api/tax/cnpj - CNPJ consultation and search
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'validate':
        return await validateSingleCNPJ(supabase, searchParams);
      
      case 'search':
        return await searchCompanies(supabase, searchParams);
      
      case 'history':
        return await getValidationHistory(supabase, searchParams);
      
      case 'status':
        return await getCNPJStatus(supabase, searchParams);
      
      default:
        return NextResponse.json(
          { error: 'Action parameter is required' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CNPJ API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tax/cnpj - CNPJ validation and batch operations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'validate':
        return await validateCNPJ(supabase, body);
      
      case 'batch-validate':
        return await batchValidateCNPJ(supabase, body);
      
      case 'search':
        return await searchCompaniesByData(supabase, body);
      
      case 'update-status':
        return await updateCNPJStatus(supabase, body);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CNPJ API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function validateSingleCNPJ(supabase: any, searchParams: URLSearchParams) {
  const cnpj = searchParams.get('cnpj');
  
  if (!cnpj) {
    return NextResponse.json(
      { error: 'cnpj parameter is required' },
      { status: 400 }
    );
  }

  // Import CNPJ validator
  const { CNPJValidator } = await import('@/lib/services/brazilian-tax/cnpj-validator');
  const validator = new CNPJValidator();

  try {
    const validation = await validator.validateCNPJ(cnpj);
    
    // Store validation result
    if (validation.valid && validation.companyData) {
      await supabase
        .from('cnpj_validations')
        .upsert({
          cnpj: validation.formatted,
          company_data: validation.companyData,
          validation_date: new Date().toISOString(),
          status: 'valid',
          source: 'api_validation'
        });
    }

    return NextResponse.json({
      data: {
        cnpj: validation.formatted,
        valid: validation.valid,
        company_data: validation.companyData,
        validation_errors: validation.errors || [],
        validated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('CNPJ validation error:', error);
    return NextResponse.json(
      { error: 'CNPJ validation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function searchCompanies(supabase: any, searchParams: URLSearchParams) {
  const companyName = searchParams.get('company_name');
  const activityCode = searchParams.get('activity_code');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const status = searchParams.get('status');

  if (!companyName && !activityCode && !city) {
    return NextResponse.json(
      { error: 'At least one search parameter is required' },
      { status: 400 }
    );
  }

  // Import CNPJ consultation service
  const { CNPJConsultationService } = await import('@/lib/services/brazilian-tax/cnpj-consultation');
  const consultationService = new CNPJConsultationService();

  try {
    const searchParams = {
      razao_social: companyName,
      codigo_atividade: activityCode,
      municipio: city,
      uf: state,
      situacao: status
    };

    const results = await consultationService.searchCompanies(searchParams);
    
    return NextResponse.json({
      data: {
        results,
        total_found: results.length,
        search_parameters: searchParams,
        searched_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json(
      { error: 'Company search failed', details: error.message },
      { status: 500 }
    );
  }
}

async function getValidationHistory(supabase: any, searchParams: URLSearchParams) {
  const cnpj = searchParams.get('cnpj');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('cnpj_validations')
    .select('*')
    .order('validation_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (cnpj) {
    query = query.eq('cnpj', cnpj);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch validation history' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    pagination: {
      total: count,
      limit,
      offset,
      has_more: count > offset + limit
    }
  });
}

async function getCNPJStatus(supabase: any, searchParams: URLSearchParams) {
  const cnpj = searchParams.get('cnpj');
  
  if (!cnpj) {
    return NextResponse.json(
      { error: 'cnpj parameter is required' },
      { status: 400 }
    );
  }

  // Get latest validation from database
  const { data: latestValidation, error } = await supabase
    .from('cnpj_validations')
    .select('*')
    .eq('cnpj', cnpj)
    .order('validation_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !latestValidation) {
    return NextResponse.json(
      { error: 'CNPJ validation not found' },
      { status: 404 }
    );
  }

  // Check if validation is recent (within 24 hours)
  const validationAge = Date.now() - new Date(latestValidation.validation_date).getTime();
  const isRecent = validationAge < 24 * 60 * 60 * 1000; // 24 hours

  let currentStatus = latestValidation;

  // If validation is old, fetch updated status
  if (!isRecent) {
    try {
      const { CNPJValidator } = await import('@/lib/services/brazilian-tax/cnpj-validator');
      const validator = new CNPJValidator();
      
      const updatedValidation = await validator.validateCNPJ(cnpj);
      
      if (updatedValidation.valid && updatedValidation.companyData) {
        // Update database with fresh data
        const { data: updated } = await supabase
          .from('cnpj_validations')
          .upsert({
            cnpj: updatedValidation.formatted,
            company_data: updatedValidation.companyData,
            validation_date: new Date().toISOString(),
            status: 'valid',
            source: 'status_check'
          })
          .select()
          .single();

        currentStatus = updated;
      }
    } catch (error) {
      console.error('CNPJ status update error:', error);
      // Continue with cached data
    }
  }

  return NextResponse.json({
    data: {
      cnpj,
      status: currentStatus.status,
      company_data: currentStatus.company_data,
      last_validated: currentStatus.validation_date,
      is_recent: isRecent,
      validation_age_hours: Math.floor(validationAge / (1000 * 60 * 60))
    }
  });
}

async function validateCNPJ(supabase: any, body: any) {
  const validatedData = cnpjValidationSchema.parse(body);
  
  // Import CNPJ validator
  const { CNPJValidator } = await import('@/lib/services/brazilian-tax/cnpj-validator');
  const validator = new CNPJValidator();

  try {
    const validation = await validator.validateCNPJ(validatedData.cnpj);
    
    // Store validation result if requested
    if (validatedData.store_result && validation.valid && validation.companyData) {
      await supabase
        .from('cnpj_validations')
        .upsert({
          cnpj: validation.formatted,
          company_data: validation.companyData,
          validation_date: new Date().toISOString(),
          status: validation.valid ? 'valid' : 'invalid',
          source: 'api_post_validation'
        });
    }

    return NextResponse.json({
      data: {
        cnpj: validation.formatted,
        valid: validation.valid,
        company_data: validatedData.get_company_data ? validation.companyData : undefined,
        validation_errors: validation.errors || [],
        validated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('CNPJ validation error:', error);
    return NextResponse.json(
      { error: 'CNPJ validation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function batchValidateCNPJ(supabase: any, body: any) {
  const validatedData = cnpjBatchSchema.parse(body);
  
  // Import CNPJ validator
  const { CNPJValidator } = await import('@/lib/services/brazilian-tax/cnpj-validator');
  const validator = new CNPJValidator();

  const results = [];
  const validationPromises = validatedData.cnpjs.map(async (cnpj) => {
    try {
      const validation = await validator.validateCNPJ(cnpj);
      
      // Store result in database
      if (validation.valid && validation.companyData) {
        await supabase
          .from('cnpj_validations')
          .upsert({
            cnpj: validation.formatted,
            company_data: validatedData.get_company_data ? validation.companyData : null,
            validation_date: new Date().toISOString(),
            status: 'valid',
            source: 'batch_validation'
          });
      }

      return {
        cnpj: validation.formatted,
        valid: validation.valid,
        company_data: validatedData.get_company_data ? validation.companyData : undefined,
        errors: validation.errors || []
      };

    } catch (error) {
      console.error(`Batch CNPJ validation error for ${cnpj}:`, error);
      return {
        cnpj,
        valid: false,
        errors: [error.message]
      };
    }
  });

  try {
    const results = await Promise.all(validationPromises);
    
    const summary = {
      total_processed: validatedData.cnpjs.length,
      valid_count: results.filter(r => r.valid).length,
      invalid_count: results.filter(r => !r.valid).length,
      processed_at: new Date().toISOString()
    };

    return NextResponse.json({
      data: {
        batch_id: crypto.randomUUID(),
        summary,
        results
      }
    });

  } catch (error) {
    console.error('Batch CNPJ validation error:', error);
    return NextResponse.json(
      { error: 'Batch validation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function searchCompaniesByData(supabase: any, body: any) {
  const validatedData = cnpjSearchSchema.parse(body);
  
  // Import CNPJ consultation service
  const { CNPJConsultationService } = await import('@/lib/services/brazilian-tax/cnpj-consultation');
  const consultationService = new CNPJConsultationService();

  try {
    const results = await consultationService.searchCompanies({
      razao_social: validatedData.company_name,
      codigo_atividade: validatedData.activity_code,
      municipio: validatedData.city,
      uf: validatedData.state,
      situacao: validatedData.status
    });

    // Store search results for caching
    const searchRecord = {
      search_parameters: validatedData,
      results_count: results.length,
      search_date: new Date().toISOString(),
      results: results.slice(0, 100) // Store first 100 results
    };

    await supabase
      .from('cnpj_searches')
      .insert(searchRecord);

    return NextResponse.json({
      data: {
        search_id: crypto.randomUUID(),
        results,
        total_found: results.length,
        search_parameters: validatedData,
        searched_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json(
      { error: 'Company search failed', details: error.message },
      { status: 500 }
    );
  }
}

async function updateCNPJStatus(supabase: any, body: any) {
  const { cnpj, force_update = false } = body;

  if (!cnpj) {
    return NextResponse.json(
      { error: 'cnpj is required' },
      { status: 400 }
    );
  }

  // Check if we need to update (either forced or data is old)
  const { data: existing } = await supabase
    .from('cnpj_validations')
    .select('*')
    .eq('cnpj', cnpj)
    .order('validation_date', { ascending: false })
    .limit(1)
    .single();

  const shouldUpdate = force_update || 
    !existing || 
    (Date.now() - new Date(existing.validation_date).getTime()) > 24 * 60 * 60 * 1000;

  if (!shouldUpdate) {
    return NextResponse.json({
      data: {
        cnpj,
        status: existing.status,
        company_data: existing.company_data,
        last_updated: existing.validation_date,
        updated: false,
        reason: 'Recent data available'
      }
    });
  }

  try {
    // Import CNPJ validator
    const { CNPJValidator } = await import('@/lib/services/brazilian-tax/cnpj-validator');
    const validator = new CNPJValidator();
    
    const validation = await validator.validateCNPJ(cnpj);
    
    if (validation.valid && validation.companyData) {
      // Update database
      const { data: updated } = await supabase
        .from('cnpj_validations')
        .upsert({
          cnpj: validation.formatted,
          company_data: validation.companyData,
          validation_date: new Date().toISOString(),
          status: 'valid',
          source: 'status_update'
        })
        .select()
        .single();

      return NextResponse.json({
        data: {
          cnpj: validation.formatted,
          status: 'valid',
          company_data: validation.companyData,
          last_updated: updated.validation_date,
          updated: true,
          reason: 'Fresh data retrieved'
        }
      });
    } else {
      return NextResponse.json(
        { error: 'CNPJ validation failed', details: validation.errors },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('CNPJ status update error:', error);
    return NextResponse.json(
      { error: 'CNPJ status update failed', details: error.message },
      { status: 500 }
    );
  }
}

