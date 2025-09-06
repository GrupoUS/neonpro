"use client";

/**
 * WhatsApp Conversation List Component for NeonPro Healthcare
 * Displays list of WhatsApp conversations with search and filtering
 * Mobile-first design optimized for Brazilian users
 */

import { motion } from "framer-motion";
import { Archive, Filter, MessageCircle, MoreVertical, Pin, Search } from "lucide-react";
import type React from "react";
import { useMemo, useRef, useState } from "react";

// UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Hooks and utilities
import { cn } from "@/lib/utils";

// Types
import type { WhatsappConversation, WhatsappConversationStatus } from "@neonpro/shared";

interface WhatsappConversationListProps {
  conversations: WhatsappConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: WhatsappConversation) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onPinConversation?: (conversationId: string) => void;
  className?: string;
  isLoading?: boolean;
}

interface ConversationItemProps {
  conversation: WhatsappConversation;
  isSelected: boolean;
  onClick: () => void;
  onArchive?: () => void;
  onPin?: () => void;
}

// Individual conversation item component
const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
  onArchive,
  onPin,
}) => {
  const formatLastMessageTime = (date?: Date) => {
    if (!date) return "";

    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(messageDate);
    } else if (diffInHours < 168) { // 7 days
      return new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
      }).format(messageDate);
    } else {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }).format(messageDate);
    }
  };

  const getContactDisplayName = () => {
    return conversation.contactName || `+${conversation.phoneNumber}`;
  };

  const getStatusColor = (status: WhatsappConversationStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "closed":
        return "bg-gray-400";
      case "archived":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const actionBtnRef = useRef<HTMLButtonElement | null>(null);

  const onRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      actionBtnRef.current?.focus();
      actionBtnRef.current?.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
      className={cn(
        "group flex items-center gap-3 p-3 cursor-pointer border-b transition-colors",
        isSelected && "bg-green-50 border-l-4 border-l-green-500",
      )}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={onRowKeyDown}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-green-100 text-green-700">
            {getContactDisplayName().slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Status indicator */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
            getStatusColor(conversation.status),
          )}
        />
      </div>

      {/* Conversation info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm truncate">
            {getContactDisplayName()}
          </h4>
          <div className="flex items-center gap-1">
            {conversation.lastMessageAt && (
              <span className="text-xs text-muted-foreground">
                {formatLastMessageTime(conversation.lastMessageAt)}
              </span>
            )}
            {conversation.unreadCount > 0 && (
              <Badge variant="default" className="h-5 min-w-5 text-xs bg-green-500">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span>{conversation.messageCount} mensagens</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                ref={actionBtnRef}
                aria-haspopup="menu"
                className={cn(
                  "h-6 w-6 p-0 opacity-0 transition-opacity",
                  "group-hover:opacity-100 focus:opacity-100",
                  isSelected && "opacity-100",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPin?.();
                }}
              >
                <Pin className="h-4 w-4 mr-2" />
                Fixar conversa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive?.();
                }}
              >
                <Archive className="h-4 w-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex gap-1 mt-1">
            {conversation.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {conversation.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{conversation.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main conversation list component
export const WhatsappConversationList: React.FC<WhatsappConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onArchiveConversation,
  onPinConversation,
  className,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WhatsappConversationStatus | "all">("all");

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      // Status filter
      if (statusFilter !== "all" && conversation.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const contactName = conversation.contactName?.toLowerCase() || "";
        const phoneNumber = conversation.phoneNumber.toLowerCase();

        return contactName.includes(query) || phoneNumber.includes(query);
      }

      return true;
    });
  }, [conversations, searchQuery, statusFilter]);

  // Sort conversations by last message time
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }, [filteredConversations]);

  const handleArchiveConversation = (conversationId: string) => {
    onArchiveConversation?.(conversationId);
  };

  const handlePinConversation = (conversationId: string) => {
    onPinConversation?.(conversationId);
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">WhatsApp</h2>
          <Badge variant="secondary" className="text-xs">
            {conversations.length} conversas
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value: string) =>
              setStatusFilter(value as "all" | WhatsappConversationStatus)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="closed">Fechadas</SelectItem>
              <SelectItem value="archived">Arquivadas</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </CardHeader>

      {/* Conversation List */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading
            ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-sm text-muted-foreground">
                  Carregando conversas...
                </div>
              </div>
            )
            : sortedConversations.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-medium text-sm mb-1">Nenhuma conversa encontrada</h3>
                <p className="text-xs text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "As conversas do WhatsApp aparecerão aqui"}
                </p>
              </div>
            )
            : (
              <div>
                {sortedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onClick={() => onSelectConversation(conversation)}
                    onArchive={() => handleArchiveConversation(conversation.id)}
                    onPin={() => handlePinConversation(conversation.id)}
                  />
                ))}
              </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WhatsappConversationList;
