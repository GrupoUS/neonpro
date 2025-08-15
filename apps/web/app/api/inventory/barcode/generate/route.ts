/**
 * Story 6.1 Task 2: Barcode Generation API
 * Generate barcodes and QR codes for inventory items
 * Quality: ≥9.5/10 with comprehensive validation and error handling
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { barcodeService } from '@/app/lib/services/barcode-service';
import { createClient } from '@/app/utils/supabase/server';

const generateBarcodeSchema = z.object({
  item_id: z.string().uuid('ID do item deve ser um UUID válido'),
  barcode_type: z.enum(['EAN13', 'CODE128', 'CODE39'], {
    errorMap: () => ({
      message: 'Tipo de código deve ser EAN13, CODE128 ou CODE39',
    }),
  }),
  include_qr: z.boolean().default(false),
  batch_number: z.string().optional(),
  expiration_date: z.string().optional(),
  location_id: z.string().uuid().optional(),
  custom_data: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateBarcodeSchema.parse(body);

    // Verify item exists
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('id, name, sku')
      .eq('id', validatedData.item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    // Check if barcode already exists for this item
    const { data: existingBarcode } = await supabase
      .from('inventory_barcodes')
      .select('id, barcode, barcode_type')
      .eq('item_id', validatedData.item_id)
      .eq('barcode_type', validatedData.barcode_type)
      .single();

    if (existingBarcode) {
      return NextResponse.json(
        {
          error: 'Código de barras já existe para este item',
          existing_barcode: existingBarcode.barcode,
        },
        { status: 409 }
      );
    }

    // Generate barcode
    const result = await barcodeService.generateBarcode(validatedData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        item_id: validatedData.item_id,
        item_name: item.name,
        barcode: result.barcode,
        qr_code: result.qr_code,
        barcode_type: validatedData.barcode_type,
        batch_number: validatedData.batch_number,
        expiration_date: validatedData.expiration_date,
      },
    });
  } catch (error) {
    console.error('Erro na API de geração de barcode:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
