// WhatsApp Template Message API Route
// Handles sending template messages with parameters

import { type NextRequest, NextResponse } from 'next/server';
import { whatsAppService } from '@/app/lib/services/whatsapp-service';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { phoneNumber, templateName, parameters = {}, patientId } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if WhatsApp is configured
    const config = await whatsAppService.getConfig();
    if (!config?.isActive) {
      return NextResponse.json(
        { error: 'WhatsApp is not configured or inactive' },
        { status: 400 }
      );
    }

    // Check opt-in status if patientId is provided
    if (patientId) {
      const isOptedIn = await whatsAppService.checkOptIn(phoneNumber);
      if (!isOptedIn) {
        return NextResponse.json(
          { error: 'Patient has not opted in for WhatsApp communications' },
          { status: 400 }
        );
      }
    }

    // Send the template message
    const messageId = await whatsAppService.sendTemplateMessage(
      phoneNumber,
      templateName,
      parameters,
      patientId
    );

    return NextResponse.json({
      success: true,
      messageId,
      message: 'Template message sent successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
