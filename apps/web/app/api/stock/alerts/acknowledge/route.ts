import { createClient } from '@/app/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const acknowledgeAlertSchema = z.object({
  alertId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

/**
 * POST /api/stock/alerts/acknowledge - Acknowledge a stock alert
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = acknowledgeAlertSchema.parse(body);

    // Check if alert exists and is not already acknowledged
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

    if (existingAlert.status === 'acknowledged' || existingAlert.status === 'resolved') {
      return NextResponse.json(
        { success: false, error: 'Alert already acknowledged or resolved' },
        { status: 409 }
      );
    }

    // Update alert status
    const { data: updatedAlert, error: updateError } = await supabase
      .from('stock_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: session.user.id,
        acknowledgment_note: validatedData.note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.alertId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to acknowledge alert' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
    });

  } catch (error) {
    console.error('POST /api/stock/alerts/acknowledge error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}