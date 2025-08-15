/**
 * Story 6.1 Task 2: Barcode Scanning API
 * Scan barcodes and QR codes for inventory items
 * Quality: ≥9.5/10 with comprehensive validation and real-time processing
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { barcodeService } from '@/app/lib/services/barcode-service';
import { createClient } from '@/app/utils/supabase/server';

const scanBarcodeSchema = z.object({
  value: z.string().min(1, 'Valor do scan é obrigatório'),
  format: z.string().optional(),
  location_id: z.string().uuid().optional(),
  device_info: z.string().optional(),
});

const bulkScanSchema = z.object({
  operation_type: z.enum([
    'stock_count',
    'item_verification',
    'location_transfer',
    'expiration_check',
  ]),
  location_id: z.string().uuid().optional(),
  items: z.array(z.string()).optional(),
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

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation') || 'single';

    if (operation === 'bulk') {
      // Handle bulk scan operation
      const validatedData = bulkScanSchema.parse(body);

      const result = await barcodeService.startBulkScanOperation({
        ...validatedData,
        user_id: session.user.id,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        operation_id: result.operation_id,
        message: 'Operação em lote iniciada com sucesso',
      });
    }
    // Handle single scan
    const validatedData = scanBarcodeSchema.parse(body);

    const scanResult = await barcodeService.scanBarcode({
      ...validatedData,
      user_id: session.user.id,
    });

    if (!scanResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: scanResult.error,
          metadata: scanResult.metadata,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scanResult.data,
      metadata: scanResult.metadata,
    });
  } catch (error) {
    console.error('Erro na API de scan:', error);

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

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const operation = searchParams.get('operation');

    if (operation === 'history') {
      // Get scan history
      const { data: scanHistory, error } = await supabase
        .from('scan_activity_log')
        .select(
          `
          *,
          inventory_items (
            name,
            sku
          )
        `
        )
        .eq('user_id', session.user.id)
        .order('scanned_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return NextResponse.json(
          { error: 'Erro ao buscar histórico de scans' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: scanHistory,
      });
    }

    if (itemId) {
      // Get barcode data for specific item
      const barcodeData = await barcodeService.getBarcodeData(itemId);

      return NextResponse.json({
        success: true,
        data: barcodeData,
      });
    }

    // Get all barcode data (paginated)
    const { data: allBarcodes, error } = await supabase
      .from('inventory_barcodes')
      .select(
        `
        *,
        inventory_items (
          name,
          sku,
          category
        ),
        inventory_locations (
          location_name
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar códigos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar códigos de barras' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: allBarcodes,
    });
  } catch (error) {
    console.error('Erro na busca de barcodes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
