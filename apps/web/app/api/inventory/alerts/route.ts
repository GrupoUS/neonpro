// =====================================================================================
// NeonPro Inventory Alerts API Endpoints
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const AlertFiltersSchema = z.object({
  type: z
    .enum([
      'low_stock',
      'out_of_stock',
      'expired',
      'expiring_soon',
      'overstock',
    ])
    .optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  is_read: z.boolean().optional(),
  location_id: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// =====================================================================================
// GET INVENTORY ALERTS
// =====================================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = AlertFiltersSchema.parse({
      type: searchParams.get('type'),
      severity: searchParams.get('severity'),
      is_read:
        searchParams.get('is_read') === 'true'
          ? true
          : searchParams.get('is_read') === 'false'
            ? false
            : undefined,
      location_id: searchParams.get('location_id'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    // Build query
    let query = supabase
      .from('inventory_alerts')
      .select(
        `
        *,
        inventory_items(name, sku),
        inventory_locations(name)
      `,
      )
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }
    if (filters.location_id) {
      query = query.eq('location_id', filters.location_id);
    }

    const { data: alerts, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 500 },
      );
    }

    // Transform response
    const transformedAlerts =
      alerts?.map((alert) => ({
        id: alert.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        item_name: alert.inventory_items?.name || 'Unknown Item',
        item_id: alert.item_id,
        location_name: alert.inventory_locations?.name || 'Unknown Location',
        current_quantity: alert.current_quantity,
        min_quantity: alert.min_quantity,
        expiry_date: alert.expiry_date,
        severity: alert.severity,
        is_read: alert.is_read,
        created_at: alert.created_at,
      })) || [];

    return NextResponse.json(transformedAlerts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// =====================================================================================
// CREATE INVENTORY ALERT
// =====================================================================================

const CreateAlertSchema = z.object({
  type: z.enum([
    'low_stock',
    'out_of_stock',
    'expired',
    'expiring_soon',
    'overstock',
  ]),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  item_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  current_quantity: z.number().min(0).optional(),
  min_quantity: z.number().min(0).optional(),
  expiry_date: z.string().datetime().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const alertData = CreateAlertSchema.parse(body);

    // Create alert
    const { data: alert, error } = await supabase
      .from('inventory_alerts')
      .insert({
        ...alertData,
        is_read: false,
        created_by: user.id,
      })
      .select(
        `
        *,
        inventory_items(name, sku),
        inventory_locations(name)
      `,
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 },
      );
    }

    // Transform response
    const transformedAlert = {
      id: alert.id,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      item_name: alert.inventory_items?.name || 'Unknown Item',
      item_id: alert.item_id,
      location_name: alert.inventory_locations?.name || 'Unknown Location',
      current_quantity: alert.current_quantity,
      min_quantity: alert.min_quantity,
      expiry_date: alert.expiry_date,
      severity: alert.severity,
      is_read: alert.is_read,
      created_at: alert.created_at,
    };

    return NextResponse.json(transformedAlert, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// =====================================================================================
// MARK ALL ALERTS AS READ
// =====================================================================================

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'mark-all-read') {
      // Mark all unread alerts as read
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to mark alerts as read' },
          { status: 500 },
        );
      }

      return NextResponse.json({ message: 'All alerts marked as read' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
