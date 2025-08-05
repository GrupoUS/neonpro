// WhatsApp Send Message API Route
// Handles sending individual and template messages via WhatsApp Business API

import { NextRequest, NextResponse } from 'next/server';
import { whatsAppService } from '@/app/lib/services/whatsapp-service';
import { createClient } from '@/lib/supabase/server';
import { WhatsAppMessageType } from '@/app/types/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('WhatsApp send message request:', body);

    // Validate required fields
    const { phoneNumber, content, type = WhatsAppMessageType.TEXT, patientId, templateName } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!content && type !== WhatsAppMessageType.TEMPLATE) {
      return NextResponse.json(
        { error: 'Content is required for non-template messages' },
        { status: 400 }
      );
    }

    if (type === WhatsAppMessageType.TEMPLATE && !templateName) {
      return NextResponse.json(
        { error: 'Template name is required for template messages' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if WhatsApp is configured
    const config = await whatsAppService.getConfig();
    if (!config || !config.isActive) {
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

    // Send the message
    const messageId = await whatsAppService.sendMessage(
      phoneNumber,
      content,
      type,
      patientId,
      templateName
    );

    console.log('WhatsApp message sent successfully:', messageId);

    return NextResponse.json({
      success: true,
      messageId,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
