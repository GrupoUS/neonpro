// WhatsApp Template Message API Route
// Handles sending template messages with parameters

import type { NextRequest, NextResponse } from "next/server";
import type { createwhatsAppService } from "@/app/lib/services/whatsapp-service";
import type { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("WhatsApp template message request:", body);

    // Validate required fields
    const { phoneNumber, templateName, parameters = {}, patientId } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    if (!templateName) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    // Verify user authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if WhatsApp is configured
    const config = await createwhatsAppService().getConfig();
    if (!config || !config.isActive) {
      return NextResponse.json(
        { error: "WhatsApp is not configured or inactive" },
        { status: 400 },
      );
    }

    // Check opt-in status if patientId is provided
    if (patientId) {
      const isOptedIn = await createwhatsAppService().checkOptIn(phoneNumber);
      if (!isOptedIn) {
        return NextResponse.json(
          { error: "Patient has not opted in for WhatsApp communications" },
          { status: 400 },
        );
      }
    }

    // Send the template message
    const messageId = await createwhatsAppService().sendTemplateMessage(
      phoneNumber,
      templateName,
      parameters,
      patientId,
    );

    console.log("WhatsApp template message sent successfully:", messageId);

    return NextResponse.json({
      success: true,
      messageId,
      message: "Template message sent successfully",
    });
  } catch (error) {
    console.error("Error sending WhatsApp template message:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
