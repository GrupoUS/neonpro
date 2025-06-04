
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatSession, ChatMessage } from '@/types/chatbot';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  session: ChatSession;
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onBack }) => {
  const { user } = useAuth();
  const { config } = useChatbotConfig();
  const { messages, addMessage } = useChatSessions();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Adicionar mensagem do usuário
      await addMessage(session.id, 'user', userMessage);

      // Preparar mensagens para a AI
      const chatMessages = messages.map(msg => ({
        tipo: msg.tipo,
        conteudo: msg.conteudo
      }));

      // Adicionar a nova mensagem do usuário
      chatMessages.push({ tipo: 'user', conteudo: userMessage });

      // Chamar a edge function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          messages: chatMessages,
          config,
          sessionId: session.id
        }
      });

      if (error) {
        console.error('Erro na chamada da edge function:', error);
        toast.error('Erro ao enviar mensagem');
        return;
      }

      // Adicionar resposta da AI
      await addMessage(session.id, 'assistant', data.message, {
        tokens_used: data.usage?.total_tokens || 0
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{session.titulo}</h3>
          <p className="text-xs text-muted-foreground">
            {messages.length} mensagen{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Mensagens */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <div className="mb-2">🤖</div>
              <p>Olá! Sou seu assistente AI do NEON PRO.</p>
              <p>Como posso ajudá-lo hoje?</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.tipo === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.tipo === 'user'
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.conteudo}</div>
                  <div className={`text-xs mt-1 opacity-70 ${
                    message.tipo === 'user' ? 'text-white' : 'text-muted-foreground'
                  }`}>
                    {formatDistanceToNow(new Date(message.timestamp), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Digitando...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
