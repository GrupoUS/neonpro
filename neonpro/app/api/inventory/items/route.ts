import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { MultiLocationInventoryService } from '@/app/lib/services/multi-location-inventory-service';
import type { CreateInventoryItem, InventoryFilters } from '@/app/lib/types/inventory';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters: InventoryFilters = {
      clinic_id: searchParams.get('clinic_id') || undefined,
      category: searchParams.get('category') || undefined,
      active_only: searchParams.get('active_only') !== 'false',
    };

    const inventoryService = new MultiLocationInventoryService();
    const items = await inventoryService.getInventoryItems(filters);

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const itemData: CreateInventoryItem = {
      ...body,
      created_by: session.user.id,
      updated_by: session.user.id,
    };

    const inventoryService = new MultiLocationInventoryService();
    const item = await inventoryService.createInventoryItem(itemData);

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}