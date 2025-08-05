import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import EmailService from "@/app/lib/services/email-service";
import type { EmailMessageSchema } from "@/app/types/email";
import type { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to verify clinic access
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();

    try {
      EmailMessageSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationError.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 },
        );
      }
      throw validationError;
    }

    // Initialize email service
    const emailService = new EmailService(supabase, profile.clinic_id);

    // Get provider configurations
    const { data: providerConfigs } = await supabase
      .from("email_providers")
      .select("*")
      .eq("clinic_id", profile.clinic_id)
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (!providerConfigs || providerConfigs.length === 0) {
      return NextResponse.json({ error: "No email providers configured" }, { status: 503 });
    }

    // Initialize providers
    await emailService.initializeProviders(
      providerConfigs.map((config) => ({
        provider: config.provider,
        name: config.name,
        settings: config.settings,
        isActive: config.is_active,
        priority: config.priority,
        dailyLimit: config.daily_limit,
        monthlyLimit: config.monthly_limit,
        rateLimit: config.rate_limit,
      })),
    );

    // Send email
    const result = await emailService.sendEmail(body);

    // Log the send attempt
    await supabase.from("email_logs").insert([
      {
        id: crypto.randomUUID(),
        clinic_id: profile.clinic_id,
        user_id: session.user.id,
        message_id: result.messageId,
        provider_message_id: result.providerMessageId,
        recipient_email: body.to[0]?.email,
        subject: body.subject,
        template_id: body.templateId,
        status: result.success ? "sent" : "failed",
        error_message: result.error,
        metadata: {
          priority: body.priority,
          tags: body.tags,
          scheduled_at: body.scheduledAt,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check email sending status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const messageId = url.searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // Get email log
    const { data: emailLog, error } = await supabase
      .from("email_logs")
      .select("*")
      .eq("message_id", messageId)
      .eq("clinic_id", profile.clinic_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Email not found" }, { status: 404 });
      }
      throw error;
    }

    // Get delivery events
    const { data: events } = await supabase
      .from("email_events")
      .select("*")
      .eq("message_id", messageId)
      .eq("clinic_id", profile.clinic_id)
      .order("timestamp", { ascending: true });

    return NextResponse.json({
      log: emailLog,
      events: events || [],
    });
  } catch (error) {
    console.error("Email status check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
