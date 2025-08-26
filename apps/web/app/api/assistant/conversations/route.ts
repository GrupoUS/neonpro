import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "20", 10),
      50,
    );
    const offset = Math.max(
      Number.parseInt(searchParams.get("offset") || "0", 10),
      0,
    );

    // Buscar conversas do usuário com contagem de mensagens
    const { data: conversations, error } = await supabase
      .from("assistant_conversations")
      .select(
        `
        id,
        title,
        model_used,
        is_active,
        created_at,
        updated_at,
        assistant_messages(count)
      `,
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 },
      );
    }

    // Formatar resposta
    const formattedConversations =
      conversations?.map((conv) => ({
        id: conv.id,
        title: conv.title,
        model_used: conv.model_used,
        is_active: conv.is_active,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        message_count: conv.assistant_messages?.[0]?.count || 0,
      })) || [];

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        limit,
        offset,
        total: formattedConversations.length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, model = "gpt4" } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Criar nova conversa
    const { data: conversation, error } = await supabase
      .from("assistant_conversations")
      .insert({
        user_id: user.id,
        title: title.trim(),
        model_used: model,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 },
      );
    }

    return NextResponse.json({ conversation });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const validateCSRF = () => true;

export const rateLimit = () => ({});

export const createBackupConfig = () => ({});

export const sessionConfig = {};

export class UnifiedSessionSystem {}

export const trackLoginPerformance = () => {};

export type PermissionContext = any;

export type SessionValidationResult = any;
