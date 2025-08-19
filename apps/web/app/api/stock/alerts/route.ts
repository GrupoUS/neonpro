import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Helper function to get clinic context from user
async function getUserClinicContext(supabase: any, userId: string) {
  const { data: professional, error } = await supabase
    .from('healthcare_professionals')
    .select('clinic_id')
    .eq('user_id', userId)
    .single();
  
  if (error || !professional?.clinic_id) {
    throw new Error('User clinic context not found');
  }
  
  return professional.clinic_id;
}

// Validation schemas
const stockAlertQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  sortBy: z
    .enum(['created_at', 'severity', 'status'])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const createStockAlertSchema = z.object({
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  alertType: z.enum(['low_stock', 'out_of_stock', 'expiring']),
  threshold: z.number().int().min(0),
  notificationChannels: z.array(z.enum(['email', 'sms', 'app'])).min(1),
  isActive: z.boolean().optional().default(true),
});

/**
 * GET /api/stock/alerts - Retrieve stock alerts with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/stock/alerts - Starting request');

    const supabase = await createClient();
    console.log('Supabase client created:', !!supabase);

    // Get current user session
    console.log('Getting session...');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('Session result:', { session: !!session, sessionError });

    if (sessionError || !session) {
      console.log('Session check failed:', {
        sessionError,
        hasSession: !!session,
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Session validated, parsing URL...');
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    console.log('Query params:', queryParams);

    const validatedParams = stockAlertQuerySchema.parse(queryParams);
    console.log('Validated params:', validatedParams);

    // Build query with filters
    console.log('Building database query...');
    let query = supabase.from('stock_alerts').select('*', { count: 'exact' });

    // Apply filters
    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status);
    }

    if (validatedParams.severity) {
      query = query.eq('severity', validatedParams.severity);
    }

    // Apply sorting and pagination
    query = query
      .order(validatedParams.sortBy, {
        ascending: validatedParams.sortOrder === 'asc',
      })
      .range(
        validatedParams.offset,
        validatedParams.offset + validatedParams.limit - 1
      );

    console.log('Executing database query...');
    const { data: alerts, error, count } = await query;
    console.log('Query result:', { alerts: alerts?.length, error, count });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    console.log('Returning successful response');
    return NextResponse.json({
      success: true,
      data: alerts || [],
      pagination: {
        total: count || 0,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
      },
    });
  } catch (error) {
    console.error('GET /api/stock/alerts error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} /**
 * POST /api/stock/alerts - Create new stock alert configuration
 */
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/stock/alerts - Starting request');

    const supabase = await createClient();
    console.log('Supabase client created:', !!supabase);

    // Get current user session
    console.log('Getting session...');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('Session result:', { session: !!session, sessionError });

    if (sessionError || !session) {
      console.log('Session check failed:', {
        sessionError,
        hasSession: !!session,
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Session validated, reading request body...');
    const body = await request.json();
    console.log('Request body:', body);

    const validatedData = createStockAlertSchema.parse(body);
    console.log('Data validated:', validatedData);

    // Validate that either productId or categoryId is provided
    if (!(validatedData.productId || validatedData.categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either productId or categoryId must be provided',
        },
        { status: 400 }
      );
    }

    // Get clinic context from user
    const clinicId = await getUserClinicContext(supabase, session.user.id);

    // Check for duplicate configuration
    let duplicateQuery = supabase
      .from('stock_alert_configs')
      .select('id')
      .eq('alert_type', validatedData.alertType)
      .eq('clinic_id', clinicId);

    if (validatedData.productId) {
      duplicateQuery = duplicateQuery.eq('product_id', validatedData.productId);
    }

    if (validatedData.categoryId) {
      duplicateQuery = duplicateQuery.eq(
        'category_id',
        validatedData.categoryId
      );
    }

    console.log('Checking for duplicates with query parameters:', {
      alert_type: validatedData.alertType,
      clinic_id: clinicId,
      product_id: validatedData.productId,
      category_id: validatedData.categoryId,
    });

    const { data: existingConfig } = await duplicateQuery;

    if (existingConfig && existingConfig.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Alert configuration already exists' },
        { status: 409 }
      );
    }

    // Create new alert configuration
    // Transform camelCase to snake_case for database insertion

    const insertData = {
      product_id: validatedData.productId,
      category_id: validatedData.categoryId,
      alert_type: validatedData.alertType,
      threshold_value: validatedData.threshold,
      threshold_unit: 'quantity', // Default from schema
      severity_level: 'medium', // Default from schema
      is_active: validatedData.isActive,
      notification_channels: validatedData.notificationChannels,
      clinic_id: clinicId,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    };

    console.log('Insert data:', insertData);

    const { data: newConfig, error: insertError } = await supabase
      .from('stock_alert_configs')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create alert configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newConfig,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/stock/alerts error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
