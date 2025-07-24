"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Settings,
  MessageSquare,
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface AssistantChatProps {
  conversationId?: string;
  onConversationChange?: (conversationId: string) => void;
}

export function AssistantChat({ 
  conversationId, 
  onConversationChange 
}: AssistantChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<'gpt4' | 'claude' | 'gpt35'>('gpt4');

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages
  } = useChat({
    api: '/api/assistant/chat',
    body: {
      conversationId,
      model: selectedModel
    },
    onResponse: async (response) => {
      if (!response.ok) {
        const error = await response.text();
        toast.error('Erro ao enviar mensagem: ' + error);
      }
    },
    onFinish: (message) => {
      // Scroll to bottom after response
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversation messages if conversationId provided
  useEffect(() => {
    if (conversationId) {
      loadConversationMessages(conversationId);
    }
  }, [conversationId]);

  const loadConversationMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/assistant/conversations/${convId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Erro ao carregar conversa');
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
      case 'claude': return 'Claude 3.5 Sonnet';
      case 'gpt35': return 'GPT-3.5 Turbo';
      default: return model;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Assistente Virtual NeonPro</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              className={getModelBadgeColor(selectedModel)}
            >
              {getModelName(selectedModel)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator className="mt-2" />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 px-4"
        >
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-medium mb-2">
                  Olá! Sou seu assistente virtual do NeonPro
                </h3>
                <p className="text-sm">
                  Estou aqui para ajudar com gestão da sua clínica, agendamentos, 
                  pacientes e muito mais. Como posso ajudar hoje?
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
              autoFocus
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="sm"
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}