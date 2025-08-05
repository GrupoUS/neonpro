// WhatsApp Bulk Message API Route
// Handles sending bulk template messages to multiple recipients

import type { NextRequest, NextResponse } from "next/server";
import type { createwhatsAppService } from "@/app/lib/services/whatsapp-service";
import type { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("WhatsApp bulk message request:", body);

    // Validate required fields
    const {
      templateName,
      parameters = {},
      recipientType,
      selectedPatients = [],
      customPhoneNumbers = [],
    } = body;

    if (!templateName) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    if (
      !recipientType ||
      !["all_patients", "selected_patients", "custom_list"].includes(recipientType)
    ) {
      return NextResponse.json(
        {
          error: "Valid recipient type is required (all_patients, selected_patients, custom_list)",
        },
        { status: 400 },
      );
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

    let phoneNumbers: string[] = [];

    // Get phone numbers based on recipient type
    if (recipientType === "all_patients") {
      // Get all patients with WhatsApp opt-in
      const { data: optIns, error } = await supabase
        .from("whatsapp_opt_ins")
        .select("phone_number")
        .eq("is_opted_in", true);

      if (error) {
        console.error("Error fetching opt-ins:", error);
        throw new Error("Failed to fetch patient opt-ins");
      }

      phoneNumbers = optIns?.map((opt) => opt.phone_number) || [];
    } else if (recipientType === "selected_patients") {
      if (!selectedPatients.length) {
        return NextResponse.json(
          { error: "Selected patients are required for selected_patients type" },
          { status: 400 },
        );
      }

      // Get phone numbers for selected patients with opt-in
      const { data: optIns, error } = await supabase
        .from("whatsapp_opt_ins")
        .select("phone_number")
        .in("patient_id", selectedPatients)
        .eq("is_opted_in", true);

      if (error) {
        console.error("Error fetching selected patient opt-ins:", error);
        throw new Error("Failed to fetch selected patient opt-ins");
      }

      phoneNumbers = optIns?.map((opt) => opt.phone_number) || [];
    } else if (recipientType === "custom_list") {
      if (!customPhoneNumbers.length) {
        return NextResponse.json(
          { error: "Custom phone numbers are required for custom_list type" },
          { status: 400 },
        );
      }

      // Filter only opted-in phone numbers
      const optInChecks = await Promise.all(
        customPhoneNumbers.map(async (phone: string) => {
          const isOptedIn = await createwhatsAppService().checkOptIn(phone);
          return isOptedIn ? phone : null;
        }),
      );

      phoneNumbers = optInChecks.filter((phone): phone is string => phone !== null);
    }

    if (!phoneNumbers.length) {
      return NextResponse.json(
        { error: "No valid recipients found with WhatsApp opt-in" },
        { status: 400 },
      );
    }

    // Limit bulk sending to prevent abuse
    if (phoneNumbers.length > 1000) {
      return NextResponse.json(
        { error: "Bulk sending limited to 1000 recipients per batch" },
        { status: 400 },
      );
    }

    console.log(`Starting bulk send to ${phoneNumbers.length} recipients`);

    // Send bulk messages
    const results = await createwhatsAppService().sendBulkMessages(
      phoneNumbers,
      templateName,
      parameters,
    );

    console.log("Bulk send completed:", results);

    return NextResponse.json({
      success: true,
      results: {
        totalRecipients: phoneNumbers.length,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
      },
      message: `Bulk sending completed: ${results.sent} sent, ${results.failed} failed`,
    });
  } catch (error) {
    console.error("Error sending bulk WhatsApp messages:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
