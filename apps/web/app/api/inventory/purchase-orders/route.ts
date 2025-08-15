// Purchase Orders API Endpoints
// GET /api/inventory/purchase-orders - List purchase orders
// POST /api/inventory/purchase-orders - Create new purchase order

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { purchaseOrderService } from '@/app/lib/services/purchase-order-service';
import { createClient } from '@/app/utils/supabase/server';

// Validation schemas
const createPurchaseOrderSchema = z.object({
  clinic_id: z.string().min(1, 'Clinic ID is required'),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, 'Item ID is required'),
        requiredQuantity: z.number().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
  user_id: z.string().min(1, 'User ID is required'),
  auto_optimize: z.boolean().optional().default(true),
  template_type: z
    .enum(['standard', 'medical', 'urgent'])
    .optional()
    .default('standard'),
});

const purchaseOrderFiltersSchema = z.object({
  clinic_id: z.string().optional(),
  supplier_id: z.string().optional(),
  status: z
    .enum([
      'draft',
      'pending_approval',
      'approved',
      'sent',
      'received',
      'cancelled',
    ])
    .optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 50)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 0)),
});

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
    const searchParams = request.nextUrl.searchParams;
    const filters = purchaseOrderFiltersSchema.parse(
      Object.fromEntries(searchParams)
    );

    // Build query
    let query = supabase.from('purchase_orders').select(`
        *,
        suppliers (
          id,
          name,
          contact_email,
          contact_phone
        ),
        purchase_order_items (
          *,
          inventory_items (
            name,
            sku,
            unit
          )
        )
      `);

    // Apply filters
    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }

    if (filters.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    const { data: purchaseOrders, error } = await query;

    if (error) {
      console.error('Error fetching purchase orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch purchase orders' },
        { status: 500 }
      );
    }

    // Transform data
    const transformedOrders =
      purchaseOrders?.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        supplier: {
          id: order.suppliers?.id,
          name: order.suppliers?.name,
          email: order.suppliers?.contact_email,
          phone: order.suppliers?.contact_phone,
        },
        clinic_id: order.clinic_id,
        status: order.status,
        total_amount: order.total_amount,
        expected_delivery_date: order.expected_delivery_date,
        created_at: order.created_at,
        created_by: order.created_by,
        items:
          order.purchase_order_items?.map((item: any) => ({
            id: item.id,
            item_id: item.item_id,
            item_name: item.inventory_items?.name,
            sku: item.inventory_items?.sku,
            unit: item.inventory_items?.unit,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            supplier_sku: item.supplier_sku,
          })) || [],
      })) || [];

    return NextResponse.json({
      purchase_orders: transformedOrders,
      total: transformedOrders.length,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    console.error('Error in purchase orders GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const validatedData = createPurchaseOrderSchema.parse(body);

    // Generate automated purchase order
    const purchaseOrder = await purchaseOrderService.generatePurchaseOrder(
      validatedData.clinic_id,
      validatedData.items,
      validatedData.user_id
    );

    // Save to database
    const { data: savedPO, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        id: purchaseOrder.id,
        order_number: purchaseOrder.order_number,
        supplier_id: purchaseOrder.supplier_id,
        clinic_id: purchaseOrder.clinic_id,
        status: purchaseOrder.status,
        total_amount: purchaseOrder.total_amount,
        expected_delivery_date:
          purchaseOrder.expected_delivery_date.toISOString(),
        created_by: purchaseOrder.created_by,
        notes: `Auto-generated purchase order with ${validatedData.auto_optimize ? 'EOQ optimization' : 'standard quantities'}`,
      })
      .select()
      .single();

    if (poError) {
      console.error('Error saving purchase order:', poError);
      return NextResponse.json(
        { error: 'Failed to save purchase order' },
        { status: 500 }
      );
    }

    // Save purchase order items
    const itemsToInsert = purchaseOrder.items.map((item) => ({
      purchase_order_id: purchaseOrder.id,
      item_id: item.item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      supplier_sku: item.supplier_sku,
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error saving purchase order items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to save purchase order items' },
        { status: 500 }
      );
    }

    // Generate template if requested
    let template = null;
    if (validatedData.template_type) {
      template = await purchaseOrderService.generatePOTemplate(
        purchaseOrder,
        validatedData.template_type
      );
    }

    return NextResponse.json(
      {
        purchase_order: {
          ...purchaseOrder,
          created_at: purchaseOrder.created_at.toISOString(),
          expected_delivery_date:
            purchaseOrder.expected_delivery_date.toISOString(),
        },
        template,
        message: 'Purchase order created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error in purchase orders POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
