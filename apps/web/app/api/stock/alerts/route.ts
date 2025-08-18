import { createClient } from '@/app/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const stockAlertQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  sortBy: z.enum(['created_at', 'severity', 'status']).optional().default('created_at'),
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
    const supabase = await createClient();
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = stockAlertQuerySchema.parse(queryParams);
    
    // Build query with filters
    let query = supabase
      .from('stock_alerts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status);
    }
    
    if (validatedParams.severity) {
      query = query.eq('severity', validatedParams.severity);
    }

    // Apply sorting and pagination
    query = query
      .order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

    const { data: alerts, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

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
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}/**
 * POST /api/stock/alerts - Create new stock alert configuration
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createStockAlertSchema.parse(body);

    // Validate that either productId or categoryId is provided
    if (!validatedData.productId && !validatedData.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Either productId or categoryId must be provided' },
        { status: 400 }
      );
    }

    // Check for duplicate configuration
    let duplicateQuery = supabase
      .from('stock_alert_configs')
      .select('id')
      .eq('alert_type', validatedData.alertType)
      .eq('user_id', session.user.id);

    if (validatedData.productId) {
      duplicateQuery = duplicateQuery.eq('product_id', validatedData.productId);
    }
    
    if (validatedData.categoryId) {
      duplicateQuery = duplicateQuery.eq('category_id', validatedData.categoryId);
    }

    const { data: existingConfig } = await duplicateQuery;

    if (existingConfig && existingConfig.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Alert configuration already exists' },
        { status: 409 }
      );
    }

    // Create new alert configuration
    const { data: newConfig, error: insertError } = await supabase
      .from('stock_alert_configs')
      .insert({
        ...validatedData,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create alert configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newConfig,
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/stock/alerts error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}