"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bot, CheckCircle, User } from "lucide-react";
import { useMemo } from "react";
import { ConfidenceIndicator } from "./confidence-indicator";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  confidence?: number;
  metadata?: {
    source?: string;
    requiresHumanHandoff?: boolean;
    processed?: boolean;
    error?: boolean;
    errorMessage?: string;
  };
}

interface MessageRendererProps {
  message: Message;
  className?: string;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  showConfidence?: boolean;
  isHighContrast?: boolean;
}

export function MessageRenderer({
  message,
  className,
  showAvatar = true,
  showTimestamp = true,
  showConfidence = true,
  isHighContrast = false,
}: MessageRendererProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const hasError = message.metadata?.error;
  const requiresHandoff = message.metadata?.requiresHumanHandoff;

  const formattedTime = useMemo(() => {
    return message.timestamp.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.timestamp]);

  const messageContentId = `message-content-${message.id}`;
  const messageTimeId = `message-time-${message.id}`;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 group",
        isUser ? "flex-row-reverse" : "flex-row",
        isHighContrast && "border border-gray-300",
        className,
      )}
      role="group"
      aria-labelledby={messageContentId}
      aria-describedby={showTimestamp ? messageTimeId : undefined}
    >
      {/* Avatar */}
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback
            className={cn(
              isUser
                ? "bg-blue-100 text-blue-700"
                : isSystem
                ? "bg-gray-100 text-gray-700"
                : "bg-green-100 text-green-700",
            )}
            aria-hidden="true"
          >
            {isUser
              ? <User className="h-4 w-4" />
              : isSystem
              ? <AlertTriangle className="h-4 w-4" />
              : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Container */}
      <div
        className={cn(
          "flex-1 space-y-2 max-w-[85%]",
          isUser && "text-right",
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "inline-block px-4 py-3 rounded-lg break-words",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500",
            isUser
              ? cn(
                "bg-blue-600 text-white",
                isHighContrast && "bg-blue-800 border border-blue-900",
              )
              : isSystem
              ? cn(
                "bg-yellow-50 text-yellow-800 border border-yellow-200",
                isHighContrast && "bg-yellow-100 border-yellow-400",
              )
              : cn(
                "bg-gray-100 text-gray-900 border border-gray-200",
                hasError && "bg-red-50 border-red-200 text-red-800",
                isHighContrast && "bg-white border-gray-400",
              ),
          )}
          tabIndex={0}
          role="article"
          aria-label={`Mensagem ${
            isUser ? "do usuário" : isSystem ? "do sistema" : "do assistente"
          }`}
        >
          <p
            id={messageContentId}
            className="text-sm leading-relaxed whitespace-pre-wrap"
          >
            {message.content}
          </p>

          {/* Error Message */}
          {hasError && message.metadata?.errorMessage && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                <span className="font-medium">Erro:</span>
              </div>
              <p className="mt-1">{message.metadata.errorMessage}</p>
            </div>
          )}
        </div>

        {/* Message Metadata */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-gray-500",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          {/* Timestamp */}
          {showTimestamp && (
            <time
              id={messageTimeId}
              dateTime={message.timestamp.toISOString()}
              className="select-none"
              aria-label={`Enviado às ${formattedTime}`}
            >
              {formattedTime}
            </time>
          )}

          {/* Confidence Indicator */}
          {showConfidence && message.confidence !== undefined && !isUser && (
            <ConfidenceIndicator
              confidence={message.confidence}
              size="sm"
              showPercentage={false}
            />
          )}

          {/* Processing Status */}
          {message.metadata?.processed && (
            <Badge
              variant="secondary"
              className="text-xs"
              aria-label="Mensagem processada"
            >
              <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
              Processado
            </Badge>
          )}

          {/* Human Handoff Required */}
          {requiresHandoff && (
            <Badge
              variant="destructive"
              className="text-xs"
              aria-label="Requer atendimento humano"
            >
              <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
              Atendimento Humano
            </Badge>
          )}

          {/* Source */}
          {message.metadata?.source && (
            <Badge
              variant="outline"
              className="text-xs"
              aria-label={`Fonte: ${message.metadata.source}`}
            >
              {message.metadata.source}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
