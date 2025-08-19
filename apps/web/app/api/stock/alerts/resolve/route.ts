import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const resolveAlertSchema = z.object({
  alertId: z.string().uuid(),
  resolutionDescription: z.string().min(5).max(1000),
});

/**
 * POST /api/stock/alerts/resolve - Resolve a stock alert
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = resolveAlertSchema.parse(body);

    // Check if alert exists and is not already resolved
    const { data: existingAlert, error: fetchError } = await supabase
      .from('stock_alerts')
      .select('id, status')
      .eq('id', validatedData.alertId)
      .single();

    if (fetchError || !existingAlert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    if (existingAlert.status === 'resolved') {
      return NextResponse.json(
        { success: false, error: 'Alert already resolved' },
        { status: 409 }
      );
    }

    // Update alert status to resolved
    const { data: updatedAlert, error: updateError } = await supabase
      .from('stock_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: session.user.id,
        resolution_description: validatedData.resolutionDescription,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.alertId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to resolve alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
