import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const conversationId = resolvedParams.id();

    // Verificar se a conversa existe e pertence ao usuário
    const { data: conversation, error: convError } = await supabase
      .from("assistant_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Buscar mensagens da conversa
    const { data: messages, error: messagesError } = await supabase
      .from("assistant_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    return NextResponse.json({ conversation, messages: messages || [] });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const conversationId = resolvedParams.id();
    const { title, is_active } = await request.json();

    // Verificar se a conversa existe e pertence ao usuário
    const { data: existingConversation, error: convError } = await supabase
      .from("assistant_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (convError || !existingConversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Preparar dados para atualização    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Atualizar conversa
    const { data: conversation, error } = await supabase
      .from("assistant_conversations")
      .update(updateData)
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
    }

    return NextResponse.json({ conversation });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const conversationId = resolvedParams.id();

    // Verificar se a conversa existe e pertence ao usuário
    const { data: existingConversation, error: convError } = await supabase
      .from("assistant_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (convError || !existingConversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Deletar conversa (cascata automática deletará mensagens)
    const { error } = await supabase
      .from("assistant_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
