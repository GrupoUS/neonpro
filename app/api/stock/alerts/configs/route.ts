// Stock Alert Configurations API
// Story 11.4: Alertas e Relatórios de Estoque
// GET /api/stock/alerts/configs - List alert configurations
// POST /api/stock/alerts/configs - Create alert configuration

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { 
  stockAlertConfigSchema,
  createStockAlertConfigSchema,
  StockAlertConfig,
  CreateStockAlertConfig,
  StockAlertConfigWithDetails
} from '@/app/lib/types/stock-alerts';
import { z } from 'zod';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

async function getUserClinicId(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return { error: 'Authentication required', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id, role')
    .eq('id', session.user.id)
    .single();

  if (!profile?.clinic_id) {
    return { error: 'User not associated with any clinic', status: 403 };
  }

  return { 
    userId: session.user.id, 
    clinicId: profile.clinic_id,
    userRole: profile.role,
    supabase 
  };
}

function hasConfigManagementPermission(userRole: string): boolean {
  // Only admins and managers can manage alert configurations
  return ['admin', 'manager'].includes(userRole);
}

function handleError(error: unknown, defaultMessage: string = 'Internal server error') {
  console.error('Stock Alert Configs API Error:', error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Validation error', 
        details: error.errors 
      },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { 
      success: false, 
      error: defaultMessage 
    },
    { status: 500 }
  );
}

// =====================================================
// GET /api/stock/alerts/configs - List configurations
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // Authentication and clinic validation
    const authResult = await getUserClinicId(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { clinicId, supabase } = authResult;
    
    // Parse query parameters
    const url = new URL(request.url);
    const isActiveOnly = url.searchParams.get('active_only') === 'true';
    const productId = url.searchParams.get('product_id');
    const categoryId = url.searchParams.get('category_id');
    const alertType = url.searchParams.get('alert_type');
    
    // Build the query
    let query = supabase
      .from('stock_alert_configs')
      .select(`
        *,
        product:products!stock_alert_configs_product_id_fkey (
          id,
          name,
          sku,
          current_stock,
          min_stock
        ),
        category:product_categories!stock_alert_configs_category_id_fkey (
          id,
          name
        )
      `)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (isActiveOnly) {
      query = query.eq('is_active', true);
    }
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (alertType) {
      query = query.eq('alert_type', alertType);
    }
    
    // Execute query
    const { data: configs, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch alert configurations' },
        { status: 500 }
      );
    }
    
    // Get trigger statistics for each config
    const configIds = configs?.map(c => c.id) || [];
    let triggerStats: Record<string, { count: number; lastTriggered?: string }> = {};
    
    if (configIds.length > 0) {
      const { data: stats } = await supabase
        .from('stock_alerts_history')
        .select('alert_config_id, created_at')
        .in('alert_config_id', configIds)
        .order('created_at', { ascending: false });
      
      if (stats) {
        triggerStats = stats.reduce((acc, stat) => {
          if (!acc[stat.alert_config_id]) {
            acc[stat.alert_config_id] = { 
              count: 0, 
              lastTriggered: stat.created_at 
            };
          }
          acc[stat.alert_config_id].count++;
          return acc;
        }, {} as Record<string, { count: number; lastTriggered?: string }>);
      }
    }
    
    // Transform data
    const transformedConfigs: StockAlertConfigWithDetails[] = configs?.map(config => ({
      id: config.id,
      clinicId: config.clinic_id,
      productId: config.product_id,
      categoryId: config.category_id,
      alertType: config.alert_type,
      thresholdValue: config.threshold_value,
      thresholdUnit: config.threshold_unit,
      severityLevel: config.severity_level,
      isActive: config.is_active,
      notificationChannels: config.notification_channels,
      createdAt: new Date(config.created_at),
      updatedAt: new Date(config.updated_at),
      createdBy: config.created_by,
      updatedBy: config.updated_by,
      product: config.product ? {
        id: config.product.id,
        name: config.product.name,
        sku: config.product.sku,
        currentStock: config.product.current_stock
      } : undefined,
      category: config.category ? {
        id: config.category.id,
        name: config.category.name
      } : undefined,
      lastTriggered: triggerStats[config.id]?.lastTriggered ? 
        new Date(triggerStats[config.id].lastTriggered!) : undefined,
      triggersCount: triggerStats[config.id]?.count || 0
    })) || [];
    
    return NextResponse.json({
      success: true,
      data: transformedConfigs,
      total: transformedConfigs.length,
      filters: {
        activeOnly: isActiveOnly,
        productId,
        categoryId,
        alertType
      }
    });
    
  } catch (error) {
    return handleError(error, 'Failed to fetch alert configurations');
  }
}

// =====================================================
// POST /api/stock/alerts/configs - Create configuration
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // Authentication and clinic validation
    const authResult = await getUserClinicId(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { userId, clinicId, userRole, supabase } = authResult;
    
    // Check permissions
    if (!hasConfigManagementPermission(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to manage alert configurations' },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    // Validate configuration data
    const configData: CreateStockAlertConfig = createStockAlertConfigSchema.parse({
      ...body,
      clinicId
    });
    
    // Validate product/category existence if specified
    if (configData.productId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, clinic_id')
        .eq('id', configData.productId)
        .eq('clinic_id', clinicId)
        .single();
      
      if (productError || !product) {
        return NextResponse.json(
          { success: false, error: 'Product not found or not accessible' },
          { status: 404 }
        );
      }
    }
    
    if (configData.categoryId) {
      const { data: category, error: categoryError } = await supabase
        .from('product_categories')
        .select('id, name, clinic_id')
        .eq('id', configData.categoryId)
        .eq('clinic_id', clinicId)
        .single();
      
      if (categoryError || !category) {
        return NextResponse.json(
          { success: false, error: 'Category not found or not accessible' },
          { status: 404 }
        );
      }
    }
    
    // Check for duplicate configurations
    let duplicateQuery = supabase
      .from('stock_alert_configs')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('alert_type', configData.alertType)
      .eq('is_active', true);
    
    if (configData.productId) {
      duplicateQuery = duplicateQuery.eq('product_id', configData.productId);
    } else if (configData.categoryId) {
      duplicateQuery = duplicateQuery.eq('category_id', configData.categoryId);
    } else {
      // Global alert config
      duplicateQuery = duplicateQuery.is('product_id', null).is('category_id', null);
    }
    
    const { data: duplicate } = await duplicateQuery.single();
    
    if (duplicate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An active alert configuration already exists for this combination',
          conflictingConfigId: duplicate.id
        },
        { status: 409 }
      );
    }
    
    // Insert the configuration
    const { data: newConfig, error: insertError } = await supabase
      .from('stock_alert_configs')
      .insert({
        clinic_id: clinicId,
        product_id: configData.productId,
        category_id: configData.categoryId,
        alert_type: configData.alertType,
        threshold_value: configData.thresholdValue,
        threshold_unit: configData.thresholdUnit,
        severity_level: configData.severityLevel,
        is_active: configData.isActive,
        notification_channels: configData.notificationChannels,
        created_by: userId,
        updated_by: userId
      })
      .select(`
        *,
        product:products!stock_alert_configs_product_id_fkey (
          id,
          name,
          sku,
          current_stock
        ),
        category:product_categories!stock_alert_configs_category_id_fkey (
          id,
          name
        )
      `)
      .single();
    
    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create alert configuration' },
        { status: 500 }
      );
    }
    
    // Transform response data
    const transformedConfig: StockAlertConfigWithDetails = {
      id: newConfig.id,
      clinicId: newConfig.clinic_id,
      productId: newConfig.product_id,
      categoryId: newConfig.category_id,
      alertType: newConfig.alert_type,
      thresholdValue: newConfig.threshold_value,
      thresholdUnit: newConfig.threshold_unit,
      severityLevel: newConfig.severity_level,
      isActive: newConfig.is_active,
      notificationChannels: newConfig.notification_channels,
      createdAt: new Date(newConfig.created_at),
      updatedAt: new Date(newConfig.updated_at),
      createdBy: newConfig.created_by,
      updatedBy: newConfig.updated_by,
      product: newConfig.product ? {
        id: newConfig.product.id,
        name: newConfig.product.name,
        sku: newConfig.product.sku,
        currentStock: newConfig.product.current_stock
      } : undefined,
      category: newConfig.category ? {
        id: newConfig.category.id,
        name: newConfig.category.name
      } : undefined,
      triggersCount: 0
    };
    
    // Log the configuration creation for audit trail
    console.log(`Alert configuration created by user ${userId} for clinic ${clinicId}:`, {
      configId: newConfig.id,
      alertType: configData.alertType,
      productId: configData.productId,
      categoryId: configData.categoryId
    });
    
    return NextResponse.json({
      success: true,
      data: transformedConfig,
      message: 'Alert configuration created successfully'
    }, { status: 201 });
    
  } catch (error) {
    return handleError(error, 'Failed to create alert configuration');
  }
}

// =====================================================
// OPTIONS - CORS support
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}