import { type NextRequest, NextResponse } from 'next/server';
import { MultiLocationInventoryService } from '@/app/lib/services/multi-location-inventory-service';
import type {
  InventoryFilters,
  UpdateInventoryStock,
} from '@/app/lib/types/inventory';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters: InventoryFilters = {
      clinic_id: searchParams.get('clinic_id') || undefined,
      room_id: searchParams.get('room_id') || undefined,
      low_stock: searchParams.get('low_stock') === 'true',
      expiring_soon: searchParams.get('expiring_soon') === 'true',
      batch_number: searchParams.get('batch_number') || undefined,
    };

    const inventoryService = new MultiLocationInventoryService();
    const stock = await inventoryService.getInventoryStock(filters);

    return NextResponse.json({ data: stock });
  } catch (error) {
    console.error('Error fetching inventory stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory stock' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle bulk updates
    if (Array.isArray(body)) {
      const updates: UpdateInventoryStock[] = body.map((update) => ({
        ...update,
        last_counted_by: session.user.id,
      }));

      const inventoryService = new MultiLocationInventoryService();
      const updatedStock = await inventoryService.bulkUpdateStock(updates);

      return NextResponse.json({ data: updatedStock });
    }

    // Handle single update
    const updateData: UpdateInventoryStock = {
      ...body,
      last_counted_by: session.user.id,
    };

    const inventoryService = new MultiLocationInventoryService();
    const stock = await inventoryService.updateStock(updateData);

    return NextResponse.json({ data: stock });
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory stock' },
      { status: 500 }
    );
  }
}
