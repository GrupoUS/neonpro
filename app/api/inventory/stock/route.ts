// =====================================================================================
// NeonPro Inventory Stock Updates API Route
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

import { StockUpdateRequestSchema } from '@/app/lib/validations/inventory';
import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// =====================================================================================
// STOCK LEVEL OPERATIONS
// =====================================================================================

/**
 * POST /api/inventory/stock/update
 * Update stock levels (transaction-based updates)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate request body
    const validatedData = StockUpdateRequestSchema.parse(body);

    // Get current user and clinic
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Verify item belongs to clinic
    const { data: item } = await supabase
      .from('inventory_items')
      .select('id, name')
      .eq('id', validatedData.item_id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Verify location belongs to clinic
    const { data: location } = await supabase
      .from('inventory_locations')
      .select('id, name')
      .eq('id', validatedData.location_id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Create inventory transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        item_id: validatedData.item_id,
        location_id: validatedData.location_id,
        transaction_type: validatedData.transaction_type,
        quantity_change: validatedData.quantity_change,
        reason: validatedData.reason,
        batch_number: validatedData.batch_number,
        expiration_date: validatedData.expiration_date,
        reference_type: validatedData.reference_type,
        reference_id: validatedData.reference_id,
        created_by: user.id
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Failed to create transaction:', transactionError);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    // Get or create stock level record
    const { data: existingStock } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('item_id', validatedData.item_id)
      .eq('location_id', validatedData.location_id)
      .single();

    let updatedStock;
    if (existingStock) {
      // Update existing stock level
      const newQuantity = Math.max(0, existingStock.current_quantity + validatedData.quantity_change);
      const { data: updated, error: updateError } = await supabase
        .from('stock_levels')
        .update({
          current_quantity: newQuantity,
          available_quantity: newQuantity, // Simplified - in production, consider reserved stock
          updated_at: new Date().toISOString()
        })
        .eq('item_id', validatedData.item_id)
        .eq('location_id', validatedData.location_id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update stock level:', updateError);
        return NextResponse.json({ error: 'Failed to update stock level' }, { status: 500 });
      }
      updatedStock = updated;
    } else {
      // Create new stock level record
      const newQuantity = Math.max(0, validatedData.quantity_change);
      const { data: created, error: createError } = await supabase
        .from('stock_levels')
        .insert({
          item_id: validatedData.item_id,
          location_id: validatedData.location_id,
          current_quantity: newQuantity,
          available_quantity: newQuantity,
          reserved_quantity: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create stock level:', createError);
        return NextResponse.json({ error: 'Failed to create stock level' }, { status: 500 });
      }
      updatedStock = created;
    }

    return NextResponse.json({
      success: true,
      transaction,
      stockLevel: updatedStock,
      item: item,
      location: location
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Stock update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =====================================================================================
// STOCK LEVEL QUERIES
// =====================================================================================

/**
 * GET /api/inventory/stock/levels
 * Get stock levels for all items or specific items
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    
    // Extract query parameters
    const itemId = url.searchParams.get('itemId');
    const locationId = url.searchParams.get('locationId');
    const lowStock = url.searchParams.get('lowStock') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get current user and clinic
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Build base query
    let query = supabase
      .from('stock_levels')
      .select(`
        *,
        item:inventory_items(
          id,
          name,
          sku,
          reorder_level,
          reorder_quantity,
          unit,
          category:inventory_categories(name)
        ),
        location:inventory_locations(
          id,
          name,
          type
        )
      `)
      .eq('item.clinic_id', profile.clinic_id)
      .order('item.name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data: stockLevels, error } = await query;

    if (error) {
      console.error('Failed to fetch stock levels:', error);
      return NextResponse.json({ error: 'Failed to fetch stock levels' }, { status: 500 });
    }

    // Filter for low stock if requested
    let filteredLevels = stockLevels || [];
    if (lowStock) {
      filteredLevels = stockLevels?.filter(level => 
        level.available_quantity <= (level.item?.reorder_level || 0)
      ) || [];
    }

    return NextResponse.json({
      stockLevels: filteredLevels,
      pagination: {
        limit,
        offset,
        total: filteredLevels.length
      }
    });

  } catch (error) {
    console.error('Stock levels API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
