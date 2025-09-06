"use client";

/**
 * WhatsApp Chat Interface Component for NeonPro Healthcare
 * Mobile-first design optimized for Brazilian users
 * Integrates with WhatsApp Business API and existing AI chat system
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Hooks and utilities
import { cn } from "@/lib/utils";

// Types
import type {
  SendWhatsappMessageRequest,
  WhatsappConversation,
  WhatsappMessage,
} from "@neonpro/shared";

interface WhatsappChatProps {
  conversation: WhatsappConversation;
  messages: WhatsappMessage[];
  currentUserId: string;
  clinicId: string;
  onSendMessage: (message: SendWhatsappMessageRequest) => Promise<void>;
  onMarkAsRead?: (messageId: string) => void;
  className?: string;
  isLoading?: boolean;
}

interface MessageBubbleProps {
  message: WhatsappMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

// Message status icon component
const MessageStatusIcon = ({ status }: { status: WhatsappMessage["status"]; }) => {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    case "sent":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    default:
      return null;
  }
};

// Message bubble component
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar = true }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 max-w-[85%]",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-green-100 text-green-700 text-xs">
            {message.phoneNumber.slice(-2)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-full break-words",
          isOwn
            ? "bg-green-500 text-white rounded-br-sm"
            : "bg-white border rounded-bl-sm shadow-sm",
        )}
      >
        {/* Message content */}
        <div className="text-sm leading-relaxed">
          {message.content}
        </div>

        {/* Message metadata */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-xs",
            isOwn ? "text-green-100 justify-end" : "text-muted-foreground",
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isOwn && <MessageStatusIcon status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
};

// Main WhatsApp chat component
export const WhatsappChat: React.FC<WhatsappChatProps> = ({
  conversation,
  messages,
  currentUserId,
  clinicId,
  onSendMessage,
  onMarkAsRead,
  className,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      await onSendMessage({
        to: conversation.phoneNumber,
        message: messageContent,
        type: "text",
        clinicId,
        patientId: conversation.patientId,
        messageType: "general",
      });

      console.log("Message sent successfully");
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isSending, onSendMessage, conversation, clinicId]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Format contact name
  const getContactDisplayName = () => {
    return conversation.contactName || `+${conversation.phoneNumber}`;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, WhatsappMessage[]>, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, WhatsappMessage[]>);

  return (
    <TooltipProvider>
      <Card className={cn("flex flex-col h-full max-h-[600px]", className)}>
        {/* Chat Header */}
        <CardHeader className="flex flex-row items-center gap-3 p-4 border-b bg-green-50">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-green-100 text-green-700">
              {getContactDisplayName().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {getContactDisplayName()}
            </h3>
            <p className="text-xs text-muted-foreground">
              {conversation.status === "active" ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ligar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Videochamada</TooltipContent>
            </Tooltip>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-4">
                  <h4 className="font-semibold">Informações do Contato</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Telefone:</span> +{conversation.phoneNumber}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      <Badge variant={conversation.status === "active" ? "default" : "secondary"}>
                        {conversation.status}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Mensagens:</span> {conversation.messageCount}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                <div key={date} className="space-y-3">
                  {/* Date separator */}
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {new Intl.DateTimeFormat("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }).format(new Date(date))}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-2">
                    {dayMessages.map((message, index) => {
                      const isOwn = message.direction === "outbound";
                      const prevMessage = dayMessages[index - 1];
                      const showAvatar = !prevMessage
                        || prevMessage.direction !== message.direction;

                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    Carregando mensagens...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>

            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma mensagem..."
                className="pr-10 resize-none"
                disabled={isSending}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSending}
              size="sm"
              className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default WhatsappChat;
