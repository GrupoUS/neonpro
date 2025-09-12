"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAIChatSimpleProps {
  className?: string;
  context?: string;
  patientId?: string;
  userRole?: string;
  lgpdCompliant?: boolean;
  onAuditLog?: (action: string, details?: Record<string, any>) => void;
  onEmergencyDetected?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Simplified Floating AI Chat Component for NeonPro
 * A working version without complex dependencies
 */
export default function FloatingAIChatSimple({
  className,
  context = 'procedures',
  patientId,
  userRole = 'professional',
  lgpdCompliant = true,
  onAuditLog,
  onEmergencyDetected,
}: FloatingAIChatSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    
    // Audit log for chat interactions
    if (onAuditLog && lgpdCompliant) {
      onAuditLog('ai_chat_toggled', {
        action: isOpen ? 'closed' : 'opened',
        context,
        patientId,
        userRole,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Olá! Entendi que você está perguntando sobre "${userMessage.content}". Como assistente da NeonPro, posso ajudá-lo com informações sobre procedimentos estéticos, agendamentos e cuidados pós-tratamento. Como posso ser mais específico em minha ajuda?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50",
          className
        )}
      >
        <button
          onClick={handleToggleChat}
          className={cn(
            "relative group flex items-center justify-center",
            "w-14 h-14 rounded-full shadow-lg",
            "bg-gradient-to-r from-[#294359] to-[#AC9469]",
            "hover:from-[#1e3147] hover:to-[#9a8157]",
            "transition-all duration-300 ease-in-out",
            "focus:outline-none focus:ring-4 focus:ring-[#AC9469]/20",
            "active:scale-95"
          )}
          aria-label={isOpen ? "Fechar chat AI" : "Abrir chat AI"}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#294359] to-[#AC9469] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
          
          {/* Icon container */}
          <div className="relative z-10">
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-white" />
                {/* AI sparkle indicator */}
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 text-[#AC9469] animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Assistente NeonPro AI
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </button>
      </div>

      {/* Chat Modal/Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container */}
          <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#294359] to-[#AC9469] text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">NeonPro AI Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="text-white/80 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#AC9469]" />
                  <p className="text-sm">
                    Olá! Sou o assistente virtual da NeonPro.<br />
                    Como posso ajudá-lo hoje?
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                      message.role === 'user'
                        ? 'bg-[#294359] text-white'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AC9469] focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-[#294359] text-white rounded-md hover:bg-[#1e3147] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* LGPD Compliance Notice */}
              {lgpdCompliant && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by NeonPro AI • Respeitamos sua privacidade (LGPD)
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}