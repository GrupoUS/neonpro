"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MessageSquare, 
  MoreVertical, 
  Trash2, 
  Edit,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Conversation {
  id: string;
  title: string;
  model_used: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ConversationSidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewConversation
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assistant/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      } else {
        toast.error('Erro ao carregar conversas');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/assistant/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Nova Conversa',
          model: 'gpt4'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(prev => [data.conversation, ...prev]);
        onSelectConversation(data.conversation.id);
        onNewConversation();
        toast.success('Nova conversa criada');
      } else {
        toast.error('Erro ao criar nova conversa');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erro ao criar nova conversa');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/assistant/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        if (selectedConversationId === conversationId) {
          onNewConversation(); // Reset to new conversation
        }
        toast.success('Conversa excluída');
      } else {
        toast.error('Erro ao excluir conversa');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Erro ao excluir conversa');
    }
  };

  const getModelBadgeColor = (model: string) => {
    switch (model) {
      case 'gpt4': return 'bg-green-100 text-green-800';
      case 'claude': return 'bg-purple-100 text-purple-800';
      case 'gpt35': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModelName = (model: string) => {
    switch (model) {
      case 'gpt4': return 'GPT-4';
      case 'claude': return 'Claude';
      case 'gpt35': return 'GPT-3.5';
      default: return model;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversas
          </CardTitle>
          <Button
            size="sm"
            onClick={createNewConversation}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="mt-2" />
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-3">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-16 animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Nenhuma conversa ainda</p>
              <p className="text-xs">Clique em + para começar</p>
            </div>
          ) : (
            <div className="space-y-2 py-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedConversationId === conversation.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {conversation.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary"
                          className={`text-xs ${getModelBadgeColor(conversation.model_used)}`}
                        >
                          {getModelName(conversation.model_used)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conversation.message_count} mensagens
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.updated_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}