// Stock Alerts Resolve API
// Story 11.4: Alertas e Relatórios de Estoque
// POST /api/stock/alerts/resolve - Resolve an alert

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { 
  resolveAlertSchema,
  ResolveAlert,
  AlertStatus
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
    .select('clinic_id')
    .eq('id', session.user.id)
    .single();

  if (!profile?.clinic_id) {
    return { error: 'User not associated with any clinic', status: 403 };
  }

  return { 
    userId: session.user.id, 
    clinicId: profile.clinic_id, 
    supabase 
  };
}

function handleError(error: unknown, defaultMessage: string = 'Internal server error') {
  console.error('Stock Alerts Resolve API Error:', error);
  
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
// POST /api/stock/alerts/resolve
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
    
    const { userId, clinicId, supabase } = authResult;
    
    // Parse and validate request body
    const body = await request.json();
    
    // Validate resolution data
    const resolveData: ResolveAlert = resolveAlertSchema.parse({
      ...body,
      resolvedBy: userId // Override with authenticated user ID
    });
    
    // Verify alert exists and belongs to clinic
    const { data: alert, error: alertError } = await supabase
      .from('stock_alerts_history')
      .select('id, clinic_id, status, message, product_id, alert_type, current_value, threshold_value, metadata')
      .eq('id', resolveData.alertId)
      .eq('clinic_id', clinicId)
      .single();
    
    if (alertError || !alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found or not accessible' },
        { status: 404 }
      );
    }
    
    // Check if alert is in valid state for resolution
    if (alert.status === AlertStatus.RESOLVED) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Alert is already resolved`,
          currentStatus: alert.status
        },
        { status: 400 }
      );
    }
    
    if (alert.status === AlertStatus.DISMISSED) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Alert has been dismissed and cannot be resolved`,
          currentStatus: alert.status
        },
        { status: 400 }
      );
    }
    
    // Prepare resolution metadata
    const resolutionMetadata = {
      ...alert.metadata,
      resolution: {
        description: resolveData.resolution,
        actionsTaken: resolveData.actionsTaken || [],
        resolvedAt: new Date().toISOString(),
        resolvedBy: userId,
        previousStatus: alert.status
      }
    };
    
    // Update alert status to resolved
    const { data: updatedAlert, error: updateError } = await supabase
      .from('stock_alerts_history')
      .update({
        status: AlertStatus.RESOLVED,
        resolved_at: new Date().toISOString(),
        metadata: resolutionMetadata
      })
      .eq('id', resolveData.alertId)
      .eq('clinic_id', clinicId)
      .select(`
        *,
        product:products!stock_alerts_history_product_id_fkey (
          id,
          name,
          sku,
          current_stock
        ),
        acknowledged_user:users!stock_alerts_history_acknowledged_by_fkey (
          id,
          name,
          email
        )
      `)
      .single();
    
    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to resolve alert' },
        { status: 500 }
      );
    }
    
    // Transform response data
    const transformedAlert = {
      id: updatedAlert.id,
      clinicId: updatedAlert.clinic_id,
      alertConfigId: updatedAlert.alert_config_id,
      productId: updatedAlert.product_id,
      alertType: updatedAlert.alert_type,
      severityLevel: updatedAlert.severity_level,
      currentValue: updatedAlert.current_value,
      thresholdValue: updatedAlert.threshold_value,
      message: updatedAlert.message,
      status: updatedAlert.status,
      metadata: updatedAlert.metadata || {},
      acknowledgedBy: updatedAlert.acknowledged_by,
      acknowledgedAt: updatedAlert.acknowledged_at ? new Date(updatedAlert.acknowledged_at) : undefined,
      resolvedAt: updatedAlert.resolved_at ? new Date(updatedAlert.resolved_at) : undefined,
      createdAt: new Date(updatedAlert.created_at),
      product: updatedAlert.product ? {
        id: updatedAlert.product.id,
        name: updatedAlert.product.name,
        sku: updatedAlert.product.sku,
        currentStock: updatedAlert.product.current_stock
      } : undefined,
      acknowledgedUser: updatedAlert.acknowledged_user ? {
        id: updatedAlert.acknowledged_user.id,
        name: updatedAlert.acknowledged_user.name,
        email: updatedAlert.acknowledged_user.email
      } : undefined
    };
    
    // Log the resolution action for audit trail
    console.log(`Alert ${resolveData.alertId} resolved by user ${userId} for clinic ${clinicId}`);
    
    // Update alert configurations for recurring issues
    await updateAlertConfigurationsIfRecurring(supabase, alert, resolveData, clinicId);
    
    // Trigger analytics update for resolution metrics
    await updateResolutionAnalytics(supabase, alert, resolveData, userId, clinicId);
    
    // Send notifications to stakeholders
    await sendResolutionNotifications(alert, resolveData, userId, clinicId);
    
    // Check if this resolution should trigger any automated actions
    const shouldTriggerReorder = alert.alert_type === 'low_stock' && 
                                resolveData.actionsTaken?.includes('reorder_initiated');
    
    if (shouldTriggerReorder) {
      // Integrate with purchasing system to track reorder status
      await integratePurchasingSystem(supabase, alert, resolveData, clinicId);
      console.log(`Reorder initiated for product ${alert.product_id} as part of alert resolution`);
    }
    
    return NextResponse.json({
      success: true,
      data: transformedAlert,
      message: 'Alert resolved successfully',
      action: {
        type: 'resolved',
        performedBy: userId,
        performedAt: new Date().toISOString(),
        resolution: resolveData.resolution,
        actionsTaken: resolveData.actionsTaken
      },
      recommendations: shouldTriggerReorder ? [
        {
          type: 'track_reorder',
          message: 'Monitor reorder status to prevent future stockouts',
          productId: alert.product_id
        }
      ] : []
    });
    
  } catch (error) {
    return handleError(error, 'Failed to resolve alert');
  }
}

// =====================================================
// HELPER FUNCTIONS FOR TODO IMPLEMENTATIONS
// =====================================================

/**
 * Update alert configurations if this is a recurring issue
 */
async function updateAlertConfigurationsIfRecurring(
  supabase: any,
  alert: any,
  resolveData: any,
  clinicId: string
) {
  try {
    // Check if this is a recurring issue (same product, same type within 30 days)
    const { data: recentAlerts, error } = await supabase
      .from('stock_alerts')
      .select('id, created_at')
      .eq('product_id', alert.product_id)
      .eq('alert_type', alert.alert_type)
      .eq('clinic_id', clinicId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error checking recurring alerts:', error);
      return;
    }

    if (recentAlerts && recentAlerts.length > 2) { // More than 2 alerts in 30 days
      // Update alert configuration to be more sensitive
      const { error: configError } = await supabase
        .from('alert_configs')
        .upsert({
          clinic_id: clinicId,
          product_id: alert.product_id,
          alert_type: alert.alert_type,
          threshold: alert.alert_type === 'low_stock' ? 
            Math.max((alert.threshold || 10) * 1.5, 15) : // Increase threshold by 50%
            alert.threshold,
          is_active: true,
          recurring_issue_detected: true,
          last_updated_reason: 'Automatic adjustment due to recurring issues',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'clinic_id,product_id,alert_type'
        });

      if (configError) {
        console.error('Error updating alert configuration:', configError);
      } else {
        console.log(`Updated alert configuration for recurring issue: Product ${alert.product_id}`);
      }
    }
  } catch (error) {
    console.error('Error in updateAlertConfigurationsIfRecurring:', error);
  }
}

/**
 * Update analytics for resolution metrics
 */
async function updateResolutionAnalytics(
  supabase: any,
  alert: any,
  resolveData: any,
  userId: string,
  clinicId: string
) {
  try {
    const resolutionTimeMs = new Date().getTime() - new Date(alert.created_at).getTime();
    const resolutionTimeHours = Math.round(resolutionTimeMs / (1000 * 60 * 60) * 100) / 100;

    // Insert analytics record
    const { error } = await supabase
      .from('stock_alert_analytics')
      .insert({
        clinic_id: clinicId,
        alert_id: alert.id,
        product_id: alert.product_id,
        alert_type: alert.alert_type,
        resolution_time_hours: resolutionTimeHours,
        resolved_by: userId,
        resolution_type: resolveData.resolution,
        actions_taken: resolveData.actionsTaken || [],
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating resolution analytics:', error);
    } else {
      console.log(`Analytics updated for alert ${alert.id}: ${resolutionTimeHours}h resolution time`);
    }

    // Update aggregated metrics
    const { error: metricsError } = await supabase.rpc('update_alert_metrics', {
      p_clinic_id: clinicId,
      p_alert_type: alert.alert_type,
      p_resolution_time: resolutionTimeHours
    });

    if (metricsError) {
      console.error('Error updating aggregated metrics:', metricsError);
    }
  } catch (error) {
    console.error('Error in updateResolutionAnalytics:', error);
  }
}

/**
 * Send notifications to stakeholders about resolution
 */
async function sendResolutionNotifications(
  alert: any,
  resolveData: any,
  userId: string,
  clinicId: string
) {
  try {
    // Get notification preferences for the clinic
    const notificationData = {
      type: 'stock_alert_resolved',
      clinicId,
      alertId: alert.id,
      productName: alert.product?.name || `Product ID: ${alert.product_id}`,
      alertType: alert.alert_type,
      resolution: resolveData.resolution,
      actionsTaken: resolveData.actionsTaken || [],
      resolvedBy: userId,
      resolvedAt: new Date().toISOString()
    };

    // Send email notification to clinic administrators
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'stock_alert_resolved',
        to: 'clinic_admins', // Will be resolved to actual emails
        data: notificationData
      })
    });

    // Send push notification if configured
    await fetch('/api/notifications/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Alerta de Estoque Resolvido',
        body: `${alert.product?.name}: ${resolveData.resolution}`,
        data: notificationData,
        audience: 'clinic_managers',
        clinicId
      })
    });

    console.log(`Notifications sent for resolved alert ${alert.id}`);
  } catch (error) {
    console.error('Error sending resolution notifications:', error);
  }
}

/**
 * Integrate with purchasing system to track reorder status
 */
async function integratePurchasingSystem(
  supabase: any,
  alert: any,
  resolveData: any,
  clinicId: string
) {
  try {
    // Create purchase order record
    const purchaseOrder = {
      clinic_id: clinicId,
      product_id: alert.product_id,
      alert_id: alert.id,
      status: 'initiated',
      quantity_ordered: resolveData.quantityOrdered || alert.suggested_reorder_quantity,
      supplier_id: alert.product?.supplier_id || null,
      expected_delivery_date: resolveData.expectedDeliveryDate || 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
      order_notes: resolveData.orderNotes || 'Automatic reorder from stock alert resolution',
      created_at: new Date().toISOString(),
      created_by: resolveData.resolvedBy || 'system'
    };

    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert(purchaseOrder)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating purchase order:', orderError);
      return;
    }

    // Create tracking entry
    await supabase
      .from('purchase_order_tracking')
      .insert({
        order_id: order.id,
        status: 'order_placed',
        notes: 'Order placed automatically from stock alert resolution',
        timestamp: new Date().toISOString(),
        updated_by: 'system'
      });

    // Schedule follow-up check
    const followUpDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    await supabase
      .from('scheduled_tasks')
      .insert({
        clinic_id: clinicId,
        task_type: 'check_purchase_order_status',
        reference_id: order.id,
        scheduled_for: followUpDate.toISOString(),
        task_data: {
          orderId: order.id,
          productId: alert.product_id,
          alertId: alert.id
        },
        created_at: new Date().toISOString()
      });

    console.log(`Purchase order ${order.id} created and tracking initiated for product ${alert.product_id}`);
  } catch (error) {
    console.error('Error in integratePurchasingSystem:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}