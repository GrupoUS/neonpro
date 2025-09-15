'use client';

import { cn } from "@neonpro/ui";
import { Send, Sparkles, X } from 'lucide-react';
import { AIBrandIcon } from '@/components/atoms/ai-brand-icon';
import { useEffect, useState } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import type { ChatMessage } from '@/components/ui/ai-chat/types';

interface FloatingAIChatSimpleProps {
  className?: string;
  context?: string;
  patientId?: string;
  userRole?: string;
  lgpdCompliant?: boolean;
  onAuditLog?: (action: string, details?: Record<string, any>) => void;
  onEmergencyDetected?: () => void;
}

// Simplified floating chat that now uses the real AI hook


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
}: FloatingAIChatSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Use real AI chat hook instead of local stub state
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    searchSuggestions,
    suggestionsLoading,
  } = useAIChat();
  const [inputValue, setInputValue] = useState('');

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
    const content = inputValue.trim();
    setInputValue('');
    // Send via real hook (streams handled internally)
    sendMessage(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // clearChat now comes from the hook
  // const clearChat = () => { /* handled by hook */ };

  return (
    <>
      {/* Floating Chat Button */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50',
          className,
        )}
      >
        <button
          onClick={handleToggleChat}
          className={cn(
            'relative group flex items-center justify-center',
            'w-14 h-14 rounded-full shadow-lg',
            'bg-gradient-to-r from-[#294359] to-[#AC9469]',
            'hover:from-[#1e3147] hover:to-[#9a8157]',
            'transition-all duration-300 ease-in-out',
            'focus:outline-none focus:ring-4 focus:ring-[#AC9469]/20',
            'active:scale-95',
          )}
          aria-label={isOpen ? 'Fechar chat AI' : 'Abrir chat AI'}
        >
          {/* Background glow effect */}
          <div className='absolute inset-0 rounded-full bg-gradient-to-r from-[#294359] to-[#AC9469] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300' />

          {/* Icon container */}
          <div className='relative z-10'>
            {isOpen ? <X className='w-6 h-6 text-white' /> : (
              <div className='relative'>
                <AIBrandIcon size={24} className='drop-shadow' />
                {/* AI sparkle indicator */}
                <div className='absolute -top-1 -right-1'>
                  <Sparkles className='w-3 h-3 text-[#AC9469] animate-pulse' />
                </div>
              </div>
            )}
          </div>

          {/* Tooltip */}
          {!isOpen && (
            <div className='absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
              Assistente NeonPro AI
              <div className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900' />
            </div>
          )}
        </button>
      </div>

      {/* Chat Modal/Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40'
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container */}
          <div className='fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#294359] to-[#AC9469] text-white rounded-t-lg'>
              <div className='flex items-center gap-2'>
                <AIBrandIcon size={20} />
                <h3 className='font-semibold'>NeonPro AI Assistant</h3>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={clearChat}
                  className='text-white/80 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors'
                >
                  Limpar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className='text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className='flex-1 p-4 overflow-y-auto space-y-4'>
              {messages.length === 0 && (
                <div className='text-center text-gray-500 py-8'>
                  {error && (
                    <div className='mb-2 text-sm text-red-600'>Erro: {error}</div>
                  )}
                  <Sparkles className='w-12 h-12 mx-auto mb-4 text-[#AC9469]' />
                  <p className='text-sm'>
                    Olá! Sou o assistente virtual da NeonPro.<br />
                    Como posso ajudá-lo hoje?
                  </p>
                </div>
              )}

              {messages.map((message: ChatMessage) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-3 py-2 rounded-lg text-sm',
                      message.role === 'user'
                        ? 'bg-[#294359] text-white'
                        : 'bg-gray-100 text-gray-800',
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm'>
                    <div className='flex items-center gap-1'>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className='p-4 border-t space-y-2'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Digite sua mensagem para o NeonPro AI...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AC9469] focus:border-transparent'
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className='px-4 py-2 bg-[#294359] text-white rounded-md hover:bg-[#1e3147] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Send className='w-4 h-4' />
                </button>
              </div>

              {/* Suggestions */}
              {suggestionsLoading ? (
                <div className='text-xs text-gray-500'>Buscando sugestões...</div>
              ) : searchSuggestions?.length ? (
                <div className='flex flex-wrap gap-2'>
                  {searchSuggestions.slice(0, 4).map(s => (
                    <button
                      key={s}
                      onClick={() => { setInputValue(s); setTimeout(() => handleSendMessage(), 0); }}
                      className='text-xs px-2 py-1 rounded-full border border-[#D2D0C8] text-[#112031] hover:bg-[#F6F5F2]'
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* LGPD Compliance Notice */}
              {lgpdCompliant && (
                <p className='text-xs text-gray-500 text-center'>
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
