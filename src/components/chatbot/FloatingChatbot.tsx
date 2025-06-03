
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Settings, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatInterface } from './ChatInterface';
import { ChatbotSettings } from './ChatbotSettings';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { config, hasApiKey } = useChatbotConfig();
  const { 
    sessions, 
    activeSession, 
    createSession, 
    selectSession, 
    deleteSession,
    isLoading 
  } = useChatSessions();

  // Controlar posição inicial
  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      });
    };

    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleNewChat = async () => {
    await createSession();
    setShowSettings(false);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSession(sessionId);
  };

  if (!isOpen) {
    return (
      <div
        className="fixed z-50 cursor-pointer"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(true)}
      >
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          {sessions.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
              {sessions.length}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[600px] shadow-2xl border-2 border-yellow-200">
        <CardHeader className="pb-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">
              🤖 NEON AI Assistant
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-[calc(100%-80px)]">
          {!hasApiKey() ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Configure sua chave API do OpenRouter para começar a usar o assistente.
              </p>
              <Button 
                onClick={() => setShowSettings(true)}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          ) : showSettings ? (
            <ChatbotSettings onClose={() => setShowSettings(false)} />
          ) : (
            <div className="h-full flex flex-col">
              {/* Lista de Sessões */}
              {!activeSession && (
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Conversas</h3>
                    <Button size="sm" onClick={handleNewChat}>
                      <Plus className="w-4 h-4 mr-1" />
                      Nova
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-48">
                    {isLoading ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Carregando...
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Nenhuma conversa ainda
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className="p-2 rounded-lg border hover:bg-accent cursor-pointer group"
                            onClick={() => selectSession(session.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {session.titulo}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(session.last_message_at), {
                                    addSuffix: true,
                                    locale: ptBR
                                  })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleDeleteSession(session.id, e)}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}

              {/* Interface de Chat */}
              {activeSession && (
                <ChatInterface 
                  session={activeSession}
                  onBack={() => selectSession('')}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
