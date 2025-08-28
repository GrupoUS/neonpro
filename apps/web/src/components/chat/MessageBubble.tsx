/**
 * MessageBubble - Individual Chat Message Component
 * Supports multiple message types and sender roles
 * TweakCN NEONPRO theme integration with healthcare styling
 */

"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { AIResponseData, MessageType, SenderType } from "@/types/chat";
import React, { useCallback, useState } from "react";

// Icons (would be imported from lucide-react or similar)
const CheckIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-3 h-3", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      points="20,6 9,17 4,12"
    />
  </svg>
);

const CheckCheckIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-3 h-3", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      points="9,11 12,14 22,4"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m21,4-3,3-1.5-1.5"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-3 h-3", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle
      cx={12}
      cy={12}
      r={10}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <polyline
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      points="12,6 12,12 16,14"
    />
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-3 h-3", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m21.73,18-8-14a2,2,0,0,0-3.48,0l-8,14A2,2,0,0,0,4,21H20A2,2,0,0,0,21.73,18Z"
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={12}
      y1={9}
      x2={12}
      y2={13}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={12}
      y1={17}
      x2={12.01}
      y2={17}
    />
  </svg>
);

const BotIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect
      x={3}
      y={11}
      width={18}
      height={10}
      rx={2}
      ry={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <circle
      cx={12}
      cy={5}
      r={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m12,7v4"
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={8}
      y1={16}
      x2={8}
      y2={16}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={16}
      y1={16}
      x2={16}
      y2={16}
    />
  </svg>
);

const UserIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
    />
    <circle
      cx={12}
      cy={7}
      r={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const StethoscopeIcon = ({ className }: { className?: string; }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 2a2 2 0 0 0-2 2v6.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V8a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V8a4 4 0 0 1 8 0v13a2 2 0 0 1-4 0v-4a2 2 0 0 1 2-2 2 2 0 0 1 2 2"
    />
  </svg>
);

export interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: string;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  emergencyMode?: boolean;
  onMessageAction?: (action: string, message: ChatMessage) => void;
  className?: string;
}

export default function MessageBubble({
  message,
  currentUserId,
  showAvatar = true,
  showTimestamp = true,
  emergencyMode = false,
  onMessageAction,
  className,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [expandedAI, setExpandedAI] = useState(false);

  const isOwnMessage = message.sender_id === currentUserId;
  const isAIMessage = message.sender_type === "ai_assistant";
  const isSystemMessage = message.sender_type === "system";
  const isEmergencyMessage = message.metadata?.priority === "critical"
    || message.content.emergency_data?.severity_level === "red";

  // Get sender info and styling
  const getSenderInfo = useCallback(() => {
    switch (message.sender_type) {
      case "ai_assistant":
        return {
          name: "Assistente IA NeonPro",
          avatar: "🤖",
          color: "blue",
          icon: BotIcon,
        };
      case "doctor":
        return {
          name: "Dr(a). " + (message.sender_id.split("-")[1] || "Médico"),
          avatar: "👨‍⚕️",
          color: "green",
          icon: StethoscopeIcon,
        };
      case "nurse":
        return {
          name: "Enfermeiro(a)",
          avatar: "👩‍⚕️",
          color: "teal",
          icon: StethoscopeIcon,
        };
      case "staff":
        return {
          name: "Equipe NeonPro",
          avatar: "👥",
          color: "purple",
          icon: UserIcon,
        };
      case "system":
        return {
          name: "Sistema",
          avatar: "⚙️",
          color: "gray",
          icon: UserIcon,
        };
      case "patient":
      default:
        return {
          name: isOwnMessage ? "Você" : "Paciente",
          avatar: "👤",
          color: "blue",
          icon: UserIcon,
        };
    }
  }, [message.sender_type, message.sender_id, isOwnMessage]);

  const senderInfo = getSenderInfo();

  // Message bubble styling based on sender and theme
  const getBubbleClasses = useCallback(() => {
    const baseClasses = "relative max-w-[70%] rounded-lg p-3 shadow-sm";

    if (isSystemMessage) {
      return cn(
        baseClasses,
        "mx-auto max-w-sm bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-400",
      );
    }

    if (isEmergencyMessage) {
      return cn(
        baseClasses,
        "bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700 text-red-900 dark:text-red-100",
        "animate-pulse shadow-red-200 dark:shadow-red-900",
      );
    }

    if (isAIMessage) {
      return cn(
        baseClasses,
        "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
      );
    }

    if (isOwnMessage) {
      return cn(
        baseClasses,
        "bg-green-600 text-white ml-auto",
        emergencyMode && "bg-red-600",
      );
    }

    // Other users' messages
    return cn(
      baseClasses,
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
    );
  }, [
    isSystemMessage,
    isEmergencyMessage,
    isAIMessage,
    isOwnMessage,
    emergencyMode,
  ]);

  // Message status icon
  const getStatusIcon = useCallback(() => {
    if (!isOwnMessage || isSystemMessage) {
      return null;
    }

    switch (message.status) {
      case "sending":
        return <ClockIcon className="text-gray-400" />;
      case "sent":
        return <CheckIcon className="text-gray-400" />;
      case "delivered":
        return <CheckCheckIcon className="text-gray-400" />;
      case "read":
        return <CheckCheckIcon className="text-green-500" />;
      case "failed":
        return <AlertTriangleIcon className="text-red-500" />;
      default:
        return null;
    }
  }, [isOwnMessage, isSystemMessage, message.status]);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }, []);

  // Handle AI response expansion
  const handleToggleAIDetails = useCallback(() => {
    setExpandedAI((prev) => !prev);
  }, []);

  // Handle message actions
  const handleAction = useCallback(
    (action: string) => {
      onMessageAction?.(action, message);
    },
    [onMessageAction, message],
  );

  // System message rendering
  if (isSystemMessage) {
    return (
      <div className={cn("flex justify-center my-2", className)}>
        <div className={getBubbleClasses()}>
          <p>{message.content.text}</p>
          {showTimestamp && (
            <div className="text-xs text-gray-500 mt-1">
              {formatTimestamp(message.created_at)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isOwnMessage ? "flex-row-reverse" : "flex-row",
        className,
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
            isAIMessage
              && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
            message.sender_type === "doctor"
              && "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
            message.sender_type === "nurse"
              && "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400",
            message.sender_type === "staff"
              && "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
            message.sender_type === "patient"
              && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
          )}
        >
          {React.createElement(senderInfo.icon, { className: "w-4 h-4" })}
        </div>
      )}

      {/* Message Content */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Sender name (for non-own messages) */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
            {senderInfo.name}
          </div>
        )}

        {/* Message Bubble */}
        <div className={getBubbleClasses()}>
          {/* Emergency Alert Header */}
          {isEmergencyMessage && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-red-300 dark:border-red-700">
              <AlertTriangleIcon className="text-red-600 animate-pulse" />
              <span className="text-sm font-bold text-red-800 dark:text-red-200">
                ALERTA DE EMERGÊNCIA
              </span>
            </div>
          )}

          {/* Main Message Content */}
          <div className="space-y-2">
            {message.content.text && (
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.content.text}
              </p>
            )}

            {/* File/Image Content */}
            {message.content.file_url && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                <div className="flex items-center gap-2 text-sm">
                  <span>📎</span>
                  <span className="font-medium">
                    {message.content.file_name}
                  </span>
                  {message.content.file_size && (
                    <span className="text-gray-500">
                      ({Math.round(message.content.file_size / 1024)} KB)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* AI Response Details */}
            {isAIMessage && message.content.ai_response && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <BotIcon className="w-3 h-3" />
                    <span>
                      IA • Confiança: {Math.round(
                        (message.content.ai_response.confidence_score || 0)
                          * 100,
                      )}
                      %
                    </span>
                  </div>
                  <button
                    onClick={handleToggleAIDetails}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    {expandedAI ? "Menos detalhes" : "Mais detalhes"}
                  </button>
                </div>

                {/* AI Suggested Actions */}
                {message.content.ai_response.suggested_actions
                  && message.content.ai_response.suggested_actions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Ações sugeridas:
                    </div>
                    {message.content.ai_response.suggested_actions.map(
                      (action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(action.action_type)}
                          className="block w-full text-left text-xs p-2 bg-blue-100 dark:bg-blue-800 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                        >
                          <div className="font-medium">
                            {action.description}
                          </div>
                          {action.priority !== "low" && (
                            <div className="text-blue-600 dark:text-blue-300">
                              Prioridade: {action.priority === "urgent"
                                ? "Urgente"
                                : action.priority === "high"
                                ? "Alta"
                                : "Média"}
                            </div>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                )}

                {/* Expanded AI Details */}
                {expandedAI && (
                  <div className="text-xs space-y-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <div>
                      <strong>Modelo:</strong> {message.content.ai_response.ai_model}
                    </div>
                    <div>
                      <strong>Tipo de Resposta:</strong> {message.content.ai_response.response_type}
                    </div>
                    <div>
                      <strong>Validação Médica:</strong>{" "}
                      {message.content.ai_response.medical_accuracy_validated
                        ? "✅ Validado"
                        : "⚠️ Não validado"}
                    </div>
                    {message.content.ai_response.escalation_recommendation
                      ?.should_escalate && (
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded border border-orange-300 dark:border-orange-700">
                        <strong>Recomendação:</strong>{" "}
                        {message.content.ai_response.escalation_recommendation
                          .reasoning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Footer */}
          <div className="flex items-center justify-between mt-2 pt-2">
            <div className="flex items-center gap-2">
              {showTimestamp && (
                <span
                  className={cn(
                    "text-xs",
                    isOwnMessage
                      ? "text-green-100"
                      : "text-gray-500 dark:text-gray-400",
                    emergencyMode && isOwnMessage && "text-red-100",
                  )}
                >
                  {formatTimestamp(message.created_at)}
                </span>
              )}

              {/* Medical Context Indicator */}
              {message.metadata?.healthcare_context && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded">
                  Saúde
                </span>
              )}
            </div>

            {/* Message Status */}
            <div className="flex items-center gap-1">{getStatusIcon()}</div>
          </div>
        </div>

        {/* Quick Actions (visible on hover) */}
        {showActions && !isSystemMessage && (
          <div
            className={cn(
              "flex gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
              isOwnMessage ? "justify-end" : "justify-start",
            )}
          >
            <button
              onClick={() => handleAction("reply")}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Responder
            </button>
            {isAIMessage && (
              <button
                onClick={() => handleAction("feedback")}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Feedback
              </button>
            )}
            {message.metadata?.healthcare_context && (
              <button
                onClick={() => handleAction("medical_details")}
                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-800 rounded hover:bg-green-200 dark:hover:bg-green-700 transition-colors"
              >
                Detalhes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
