"use client";

import type { formatDistanceToNow } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { MoreHorizontal, Paperclip, Phone, Send, Video } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Input } from "@/components/ui/input";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type { Separator } from "@/components/ui/separator";
import type { useCommunicationRealtime } from "@/hooks/use-communication-realtime";
import type { cn } from "@/lib/utils";
import type { Message } from "@/types/communication";

export interface StaffChatProps {
  conversationId: string;
  userId: string;
  patientContext?: {
    id: string;
    name: string;
    avatar?: string;
  };
  className?: string;
}

export function StaffChat({ conversationId, userId, patientContext, className }: StaffChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    isConnected,
    isLoading,
    error,
    typingUsers,
    sendMessage,
    markAsRead,
    broadcastTyping,
  } = useCommunicationRealtime({
    conversationId,
    userId,
    autoConnect: true,
  });

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gerenciar status de digitação
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Definir novo timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 1000);
  };

  // Enviar mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    const content = messageInput.trim();
    setMessageInput("");

    // Parar indicador de digitação
    if (isTyping) {
      setIsTyping(false);
      broadcastTyping(false);
    }

    await sendMessage(content, "text", conversationId);

    // Focar novamente no input
    inputRef.current?.focus();
  };

  // Renderizar mensagem
  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.sender_id === userId;
    const showAvatar =
      !isCurrentUser && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);

    return (
      <div
        key={message.id}
        className={cn("flex gap-3 mb-4", isCurrentUser ? "flex-row-reverse" : "flex-row")}
      >
        {showAvatar && !isCurrentUser && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.sender?.raw_user_meta_data?.avatar} />
            <AvatarFallback>
              {message.sender?.raw_user_meta_data?.full_name?.[0] ||
                message.sender?.email?.[0]?.toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>
        )}

        {!showAvatar && !isCurrentUser && (
          <div className="w-8" /> // Espaçamento
        )}

        <div
          className={cn("max-w-[70%] flex flex-col", isCurrentUser ? "items-end" : "items-start")}
        >
          {!isCurrentUser && showAvatar && (
            <span className="text-xs text-muted-foreground mb-1">
              {message.sender?.raw_user_meta_data?.full_name || message.sender?.email || "Usuário"}
            </span>
          )}

          <div
            className={cn(
              "rounded-lg px-3 py-2 break-words",
              isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <p>{message.content}</p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 text-xs">
                    <Paperclip className="w-3 h-3" />
                    <span>{attachment.filename}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
            {message.read_at && isCurrentUser && <span className="ml-1">✓</span>}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              {patientContext ? `Chat - ${patientContext.name}` : "Chat da Equipe"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
              {patientContext && (
                <Badge variant="outline">Paciente #{patientContext.id.slice(-6)}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Histórico completo</DropdownMenuItem>
                <DropdownMenuItem>Exportar conversa</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensagens */}
        <ScrollArea className="flex-1 p-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive">
              <p>Erro ao carregar chat: {error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm mt-1">Inicie a conversa!</p>
            </div>
          )}

          {messages.map((message, index) => renderMessage(message, index))}

          {/* Indicador de digitação */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
              </div>
              <span>
                {typingUsers.length === 1
                  ? "Alguém está digitando..."
                  : `${typingUsers.length} pessoas estão digitando...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        {/* Input de mensagem */}
        <div className="p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" className="shrink-0">
              <Paperclip className="w-4 h-4" />
            </Button>

            <Input
              ref={inputRef}
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={!isConnected}
            />

            <Button type="submit" disabled={!messageInput.trim() || !isConnected} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
