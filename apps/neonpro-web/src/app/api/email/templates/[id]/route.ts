import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import EmailService from "@/app/lib/services/email-service";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const emailService = new EmailService(supabase, profile.clinic_id);
    const template = await emailService.getTemplate(params.id);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Get email template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const body = await request.json();
    const emailService = new EmailService(supabase, profile.clinic_id);

    const template = await emailService.updateTemplate(params.id, body);

    return NextResponse.json(template);
  } catch (error) {
    console.error("Update email template error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const emailService = new EmailService(supabase, profile.clinic_id);
    await emailService.deleteTemplate(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete email template error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
