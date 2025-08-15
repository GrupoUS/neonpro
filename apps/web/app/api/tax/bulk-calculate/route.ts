// Bulk Tax Calculation API Endpoint
// Story 5.5: Calculate Brazilian taxes for multiple services

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { brazilianTaxEngine } from '@/lib/services/tax/tax-engine';
import { bulkTaxCalculationRequestSchema } from '@/lib/validations/brazilian-tax';

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = bulkTaxCalculationRequestSchema.parse(body);

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('id', validatedData.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found or access denied' },
        { status: 404 }
      );
    }

    // Process bulk calculations
    const results = [];
    const errors = [];

    for (let i = 0; i < validatedData.calculations.length; i++) {
      const calculation = validatedData.calculations[i];

      try {
        // Calculate taxes for this item
        const taxResult = await brazilianTaxEngine.calculateTaxes({
          clinic_id: validatedData.clinic_id,
          ...calculation,
        });

        // Store calculation result
        const { data: calculationRecord, error: insertError } = await supabase
          .from('tax_calculations')
          .insert({
            clinic_id: validatedData.clinic_id,
            service_type: calculation.service_type,
            base_amount: calculation.amount,
            taxes: taxResult.taxes,
            total_amount: taxResult.totalAmount,
            calculation_metadata: taxResult,
            created_by: session.user.id,
          })
          .select()
          .single();

        if (insertError) {
          errors.push({
            index: i,
            error: 'Failed to store calculation result',
            details: insertError.message,
          });
          continue;
        }

        results.push({
          index: i,
          calculation_id: calculationRecord.id,
          ...taxResult,
        });
      } catch (error) {
        errors.push({
          index: i,
          error: 'Calculation failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        failed: errors.length,
        results,
        errors,
      },
    });
  } catch (error) {
    console.error('Bulk tax calculation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
