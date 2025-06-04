import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Settings, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// import { ChatInterface } from './ChatInterface'; // Removido
// import { ChatbotSettings } from './ChatbotSettings'; // Removido
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom'; // Adicionado

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Manter para controle interno do botão
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const navigate = useNavigate(); // Inicializar useNavigate

  const { sessions, isLoading } = useChatSessions(); // Manter apenas para contagem de sessões

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

  const handleOpenChatbot = () => {
    if (!isDragging) {
      navigate('/chatbot'); // Navegar para a página do chatbot
      setIsOpen(true); // Marcar como aberto para não arrastar ao clicar novamente
    }
  };

  // Renderizar apenas o botão flutuante
  return (
    <div
      className="fixed z-50 cursor-pointer"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onClick={handleOpenChatbot} // Chamar a função de navegação
    >
      <div className="relative">
        <div className="w-14 h-14 bg-gradient-to-br from-neon-brand to-neon-subtitle rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        {sessions.length > 0 && ( // Manter a badge de contagem de sessões
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
            {sessions.length}
          </Badge>
        )}
      </div>
    </div>
  );
};
