import { type NextRequest, NextResponse } from 'next/server';
import { MultiLocationInventoryService } from '@/app/lib/services/multi-location-inventory-service';
import type { UpdateInventoryItem } from '@/app/lib/types/inventory';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inventoryService = new MultiLocationInventoryService();
    const item = await inventoryService.getInventoryItem(params.id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: UpdateInventoryItem = {
      ...body,
      id: params.id,
      updated_by: session.user.id,
    };

    const inventoryService = new MultiLocationInventoryService();
    const item = await inventoryService.updateInventoryItem(updateData);

    return NextResponse.json({ data: item });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inventoryService = new MultiLocationInventoryService();
    await inventoryService.deleteInventoryItem(params.id);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
