import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inventoryReportsService } from '@/app/lib/services/inventory-reports-service';
import type { ReportDefinition } from '@/app/lib/types/inventory-reports';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters: { created_by?: string; is_active?: boolean } = {};

    if (searchParams.get('created_by')) {
      filters.created_by = searchParams.get('created_by')!;
    }
    if (searchParams.get('is_active')) {
      filters.is_active = searchParams.get('is_active') === 'true';
    }

    const definitions = await inventoryReportsService.getReportDefinitions(filters);

    return NextResponse.json({
      success: true,
      definitions,
    });

  } catch (error) {
    console.error('Error fetching report definitions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch report definitions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = validateReportDefinition(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid report definition',
          details: validationResult.errors 
        },
        { status: 400 }
      );
    }

    const definitionData: Omit<ReportDefinition, 'id' | 'created_at' | 'updated_at'> = {
      name: body.name,
      description: body.description || '',
      report_type: body.report_type,
      parameters: body.parameters,
      schedule_expression: body.schedule_expression || null,
      is_active: body.is_active !== false,
      created_by: user.id,
    };

    const savedDefinition = await inventoryReportsService.saveReportDefinition(definitionData);

    return NextResponse.json({
      success: true,
      definition: savedDefinition,
    });

  } catch (error) {
    console.error('Error creating report definition:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create report definition',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateReportDefinition(body: any): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!body.report_type || typeof body.report_type !== 'string') {
    errors.push('Report type is required');
  }

  if (!body.parameters || typeof body.parameters !== 'object') {
    errors.push('Parameters are required and must be an object');
  }

  // Validate report type
  const validTypes = [
    'stock_movement',
    'stock_valuation', 
    'low_stock',
    'expiring_items',
    'transfers',
    'location_performance'
  ];
  
  if (body.report_type && !validTypes.includes(body.report_type)) {
    errors.push(`Invalid report type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Validate parameters structure
  if (body.parameters) {
    if (!body.parameters.type) {
      errors.push('Parameters must include a type field');
    }
    
    if (body.parameters.type !== body.report_type) {
      errors.push('Parameters type must match report_type');
    }

    if (!body.parameters.filters || typeof body.parameters.filters !== 'object') {
      errors.push('Parameters must include a filters object');
    }
  }

  // Validate schedule expression if provided (cron format)
  if (body.schedule_expression && !isValidCronExpression(body.schedule_expression)) {
    errors.push('Invalid schedule expression. Must be a valid cron expression');
  }

  // Validate description length if provided
  if (body.description && typeof body.description === 'string' && body.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidCronExpression(expression: string): boolean {
  // Basic cron validation - 5 or 6 fields separated by spaces
  const parts = expression.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}
