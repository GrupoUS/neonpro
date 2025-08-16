// Individual Purchase Order API Endpoints
// GET /api/inventory/purchase-orders/[id] - Get specific purchase order
// PATCH /api/inventory/purchase-orders/[id] - Update purchase order status
// DELETE /api/inventory/purchase-orders/[id] - Cancel purchase order

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { purchaseOrderService } from '@/app/lib/services/purchase-order-service';
import { createClient } from '@/app/utils/supabase/server';

const updatePurchaseOrderSchema = z.object({
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
  notes: z.string().optional(),
  supplier_id: z.string().optional(),
  expected_delivery_date: z.string().optional(),
  template_type: z.enum(['standard', 'medical', 'urgent']).optional(),
});

type RouteParams = {
  params: { id: string };
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .select(
        `
        *,
        suppliers (
          id,
          name,
          contact_email,
          contact_phone,
          payment_terms
        ),
        purchase_order_items (
          *,
          inventory_items (
            name,
            sku,
            unit,
            category
          )
        ),
        clinics (
          name,
          address,
          phone,
          email
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Purchase order not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch purchase order' },
        { status: 500 },
      );
    }

    // Transform data
    const transformedOrder = {
      id: purchaseOrder.id,
      order_number: purchaseOrder.order_number,
      supplier: {
        id: purchaseOrder.suppliers?.id,
        name: purchaseOrder.suppliers?.name,
        email: purchaseOrder.suppliers?.contact_email,
        phone: purchaseOrder.suppliers?.contact_phone,
        payment_terms: purchaseOrder.suppliers?.payment_terms,
      },
      clinic: {
        name: purchaseOrder.clinics?.name,
        address: purchaseOrder.clinics?.address,
        phone: purchaseOrder.clinics?.phone,
        email: purchaseOrder.clinics?.email,
      },
      clinic_id: purchaseOrder.clinic_id,
      status: purchaseOrder.status,
      total_amount: purchaseOrder.total_amount,
      expected_delivery_date: purchaseOrder.expected_delivery_date,
      created_at: purchaseOrder.created_at,
      created_by: purchaseOrder.created_by,
      notes: purchaseOrder.notes,
      items:
        purchaseOrder.purchase_order_items?.map((item: any) => ({
          id: item.id,
          item_id: item.item_id,
          item_name: item.inventory_items?.name,
          sku: item.inventory_items?.sku,
          unit: item.inventory_items?.unit,
          category: item.inventory_items?.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          supplier_sku: item.supplier_sku,
        })) || [],
    };

    return NextResponse.json({ purchase_order: transformedOrder });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePurchaseOrderSchema.parse(body);

    // Check if purchase order exists
    const { data: existingPO, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('id, status, clinic_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Purchase order not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch purchase order' },
        { status: 500 },
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ['pending_approval', 'approved', 'cancelled'],
      pending_approval: ['approved', 'draft', 'cancelled'],
      approved: ['sent', 'cancelled'],
      sent: ['received', 'cancelled'],
      received: [],
      cancelled: [],
    };

    if (validatedData.status && existingPO.status !== validatedData.status) {
      const allowedStatuses = validTransitions[existingPO.status] || [];
      if (!allowedStatuses.includes(validatedData.status)) {
        return NextResponse.json(
          {
            error: `Cannot change status from ${existingPO.status} to ${validatedData.status}`,
          },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }
    if (validatedData.notes) {
      updateData.notes = validatedData.notes;
    }
    if (validatedData.supplier_id) {
      updateData.supplier_id = validatedData.supplier_id;
    }
    if (validatedData.expected_delivery_date) {
      updateData.expected_delivery_date = validatedData.expected_delivery_date;
    }

    updateData.updated_at = new Date().toISOString();

    // Update purchase order
    const { data: updatedPO, error: updateError } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update purchase order' },
        { status: 500 },
      );
    }

    // Generate template if requested and status is approved or sent
    let template = null;
    if (
      validatedData.template_type &&
      (updatedPO.status === 'approved' || updatedPO.status === 'sent')
    ) {
      // Fetch full PO data for template generation
      const { data: fullPO, error: fullPOError } = await supabase
        .from('purchase_orders')
        .select(
          `
          *,
          purchase_order_items (
            *,
            inventory_items (name)
          )
        `,
        )
        .eq('id', params.id)
        .single();

      if (!fullPOError && fullPO) {
        const purchaseOrderData = {
          id: fullPO.id,
          order_number: fullPO.order_number,
          supplier_id: fullPO.supplier_id,
          clinic_id: fullPO.clinic_id,
          status: fullPO.status,
          total_amount: fullPO.total_amount,
          expected_delivery_date: new Date(fullPO.expected_delivery_date),
          created_at: new Date(fullPO.created_at),
          created_by: fullPO.created_by,
          items: fullPO.purchase_order_items.map((item: any) => ({
            item_id: item.item_id,
            item_name: item.inventory_items.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            supplier_sku: item.supplier_sku,
          })),
        };

        template = await purchaseOrderService.generatePOTemplate(
          purchaseOrderData as any,
          validatedData.template_type,
        );
      }
    }

    return NextResponse.json({
      purchase_order: updatedPO,
      template,
      message: 'Purchase order updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if purchase order exists and can be cancelled
    const { data: existingPO, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Purchase order not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch purchase order' },
        { status: 500 },
      );
    }

    // Check if PO can be cancelled
    const cancelableStatuses = [
      'draft',
      'pending_approval',
      'approved',
      'sent',
    ];
    if (!cancelableStatuses.includes(existingPO.status)) {
      return NextResponse.json(
        {
          error: `Cannot cancel purchase order with status: ${existingPO.status}`,
        },
        { status: 400 },
      );
    }

    // Update status to cancelled instead of deleting
    const { data: cancelledPO, error: cancelError } = await supabase
      .from('purchase_orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        notes:
          (existingPO as any).notes +
          '\n[CANCELLED] Purchase order cancelled by user.',
      })
      .eq('id', id)
      .select()
      .single();

    if (cancelError) {
      return NextResponse.json(
        { error: 'Failed to cancel purchase order' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      purchase_order: cancelledPO,
      message: 'Purchase order cancelled successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
