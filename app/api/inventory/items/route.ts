// =====================================================================================
// NeonPro Inventory Management API Routes
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

import { InventoryItemSchema } from '@/app/lib/validations/inventory';
import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// =====================================================================================
// INVENTORY ITEMS MANAGEMENT
// =====================================================================================

/**
 * GET /api/inventory/items
 * Retrieve all inventory items with filtering and search
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    
    // Extract query parameters
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || 'active';
    const lowStock = url.searchParams.get('lowStock') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '50');
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

    // Build query with filters
    let query = supabase
      .from('inventory_items')
      .select(`
        *,
        category:inventory_categories(id, name, description),
        stock_levels:stock_levels(
          id,
          location_id,
          current_quantity,
          available_quantity,
          reserved_quantity,
          location:inventory_locations(name)
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .eq('status', status)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,barcode.eq.${search}`);
    }

    // Apply category filter
    if (category) {
      query = query.eq('category_id', category);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Failed to fetch inventory items:', error);
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

    // Filter for low stock if requested
    let filteredItems = items || [];
    if (lowStock) {
      filteredItems = items?.filter(item => {
        const totalStock = item.stock_levels?.reduce((sum: number, level: any) => 
          sum + level.available_quantity, 0) || 0;
        return totalStock <= item.reorder_level;
      }) || [];
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .eq('status', status);

    return NextResponse.json({
      items: filteredItems,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Inventory items API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/inventory/items
 * Create new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate request body
    const validatedData = InventoryItemSchema.parse(body);

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

    // Check for duplicate barcode if provided
    if (validatedData.barcode) {
      const { data: existing } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('clinic_id', profile.clinic_id)
        .eq('barcode', validatedData.barcode)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
      }
    }

    // Create inventory item
    const { data: item, error } = await supabase
      .from('inventory_items')
      .insert({
        ...validatedData,
        clinic_id: profile.clinic_id,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create inventory item:', error);
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Create inventory item API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =====================================================================================
// INDIVIDUAL ITEM OPERATIONS
// =====================================================================================

/**
 * GET /api/inventory/items/[id]
 * Get specific inventory item with stock levels
 */
export async function getItemById(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

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

    // Get item with stock levels and recent transactions
    const { data: item, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        category:inventory_categories(id, name, description),
        stock_levels:stock_levels(
          *,
          location:inventory_locations(*)
        ),
        recent_transactions:inventory_transactions(
          *,
          location:inventory_locations(name),
          created_by_profile:profiles(first_name, last_name)
        )
      `)
      .eq('id', params.id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get recent transactions (last 20)
    const { data: transactions } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        location:inventory_locations(name),
        created_by_profile:profiles(first_name, last_name)
      `)
      .eq('item_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      item,
      transactions: transactions || []
    });

  } catch (error) {
    console.error('Get inventory item API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function updateItem(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const updateData = await request.json();

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

    // Check if item exists and belongs to clinic
    const { data: existingItem } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('id', params.id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check for duplicate barcode if being updated
    if (updateData.barcode) {
      const { data: existing } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('clinic_id', profile.clinic_id)
        .eq('barcode', updateData.barcode)
        .neq('id', params.id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
      }
    }

    // Update inventory item
    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('clinic_id', profile.clinic_id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update inventory item:', error);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    return NextResponse.json({ item });

  } catch (error) {
    console.error('Update inventory item API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/inventory/items/[id]
 * Soft delete inventory item
 */
export async function deleteItem(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

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

    // Check if item exists and belongs to clinic
    const { data: existingItem } = await supabase
      .from('inventory_items')
      .select('id, name')
      .eq('id', params.id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if item has active stock
    const { data: stockLevels } = await supabase
      .from('stock_levels')
      .select('current_quantity')
      .eq('item_id', params.id)
      .gt('current_quantity', 0);

    if (stockLevels && stockLevels.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete item with active stock. Transfer or adjust stock to zero first.' 
      }, { status: 409 });
    }

    // Soft delete the item
    const { error } = await supabase
      .from('inventory_items')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('clinic_id', profile.clinic_id);

    if (error) {
      console.error('Failed to delete inventory item:', error);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Item "${existingItem.name}" has been deactivated successfully` 
    });

  } catch (error) {
    console.error('Delete inventory item API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
