'use client';

import { AIBrandIcon } from '@/components/atoms/ai-brand-icon';
import {
  AIInputSearch,
  AILoading,
  AIPrompt,
  AITextLoading,
  AIVoice,
} from '@/components/ui/ai-chat';
import { useAIChat } from '@/hooks/useAIChat';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils.ts';
import { Button } from '@neonpro/ui';
import { Crown, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'; // React import not needed
// import type { AIAssistantProps } from '@/components/healthcare/types';

interface AIAssistantProps {
  sessionId?: string;
  locale?: string;
}

interface AIChatContainerProps extends Partial<AIAssistantProps> {
  clientId?: string;
  className?: string;
  showVoiceControls?: boolean;
  showSearchSuggestions?: boolean;
  // Healthcare-specific props
  context?: 'scheduling' | 'procedures' | 'aftercare' | 'emergency';
  patientId?: string;
  userRole?: 'admin' | 'professional' | 'coordinator';
  lgpdCompliant?: boolean;
  onAuditLog?: (action: string, details?: Record<string, any>) => void;
  onEmergencyDetected?: (severity: 'low' | 'medium' | 'high') => void;
}

/**
 * Complete AI Chat Container for NeonPro Aesthetic Clinic
 * Integrates all AI chat components with hooks and services
 */
export default function AIChatContainer({
  clientId,
  className,
  showVoiceControls = true,
  showSearchSuggestions = true,
  context = 'procedures',
  patientId,
  userRole = 'professional',
  lgpdCompliant = true,
  onAuditLog,
  onEmergencyDetected,
}: AIChatContainerProps) {
  const [_searchQuery, setSearchQuery] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscription management
  const {
    chatModels,
    hasPro,
    checkModelAccess,
    subscriptionInfo,
    shouldShowUpgradePrompt,
    upgradeUrl,
  } = useSubscription();

  const chat = useAIChat(clientId);
  const {
    messages,
    isLoading,
    error,
    searchSuggestions,
    suggestionsLoading,
    sendMessage,
    processVoice,
    generateVoice,
    clearChat,
    // sessionId, // unused
    model: currentModel,
    setModel,
  } = chat as ReturnType<typeof useAIChat>;
  // Narrow type to include optional loading flags without breaking current signature
  const { sendMessageLoading = false, voiceProcessingLoading = false } = (chat as any) as {
    sendMessageLoading?: boolean;
    voiceProcessingLoading?: boolean;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Model comes from hook state; default is gpt-5-mini

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    // Check if user has access to current model
    if (!checkModelAccess(currentModel as any)) {
      // Show upgrade prompt for pro models
      if (shouldShowUpgradePrompt) {
        alert(
          `Este modelo requer NeonPro Pro. Faça upgrade para acessar todos os modelos avançados.`,
        );
        return;
      }
    }

    // Healthcare audit logging
    if (onAuditLog && lgpdCompliant) {
      onAuditLog('ai_chat_message_sent', {
        context,
        patientId,
        userRole,
        messageLength: content.length,
        model: currentModel,
        hasPro,
        timestamp: new Date().toISOString(),
      });
    }

    // Emergency detection for healthcare context
    const emergencyKeywords = [
      'emergência',
      'emergency',
      'dor intensa',
      'severe pain',
      'reação alérgica',
    ];
    const hasEmergencyKeyword = emergencyKeywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasEmergencyKeyword && onEmergencyDetected) {
      onEmergencyDetected('high');
    }

    sendMessage(content);
    setSearchQuery('');
  };

  // Model is managed by the hook; no extra sync needed here

  const handleSearch = (query: string) => {
    if (query.trim()) {
      handleSendMessage(query);
    }
  };

  const handleVoiceInput = (audioBlob: Blob) => {
    setIsVoiceMode(true);
    processVoice(audioBlob);
  };

  const handleVoiceOutput = () => {
    const lastAIMessage = messages
      .filter(m => m.role === 'assistant')
      .pop();

    if (lastAIMessage) {
      generateVoice(lastAIMessage.content);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full max-h-[600px] bg-white rounded-lg border border-[#D2D0C8]',
        className,
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-[#D2D0C8]'>
        <div className='flex items-center space-x-2'>
          <AIBrandIcon size={18} />
          <div>
            <h3 className='text-lg font-semibold text-[#112031]'>
              Assistente NeonPro
            </h3>
            <div className='flex items-center space-x-2'>
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  hasPro
                    ? 'bg-gradient-to-r from-[#AC9469] to-[#294359] text-white'
                    : 'bg-[#D2D0C8] text-[#112031]',
                )}
              >
                {hasPro && <Crown className='w-3 h-3 mr-1 inline' />}
                {subscriptionInfo.displayStatus}
              </span>
              {shouldShowUpgradePrompt && (
                <Button
                  size='sm'
                  onClick={() => window.open(upgradeUrl, '_blank')}
                  className='text-xs bg-gradient-to-r from-[#AC9469] to-[#294359] hover:from-[#294359] hover:to-[#112031]'
                >
                  <Crown className='w-3 h-3 mr-1' />
                  Upgrade Pro
                  <ExternalLink className='w-3 h-3 ml-1' />
                </Button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          className='text-sm text-[#B4AC9C] hover:text-[#294359] transition-colors'
        >
          Limpar conversa
        </button>
      </div>{' '}
      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0
          ? (
            <div className='text-center py-8'>
              <div className='text-[#B4AC9C] mb-4'>
                <svg className='w-12 h-12 mx-auto mb-3' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.53 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z' />
                </svg>
              </div>
              <h4 className='text-lg font-medium text-[#112031] mb-2'>
                Como posso ajudar hoje?
              </h4>
              <p className='text-[#B4AC9C] max-w-md mx-auto'>
                Pergunte sobre tratamentos estéticos, agendamentos ou cuidados com a pele.
              </p>
            </div>
          )
          : (
            messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-[#294359] text-white'
                      : 'bg-[#D2D0C8] text-[#112031]',
                  )}
                >
                  <p className='text-sm'>{message.content}</p>
                  <span className='text-xs opacity-70 mt-1 block'>
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}

        {/* Loading State */}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-[#D2D0C8] rounded-lg px-4 py-2'>
              <AITextLoading message='Assistente pensando' />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='flex justify-center'>
            <div className='bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm'>
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>{' '}
      {/* Input Area */}
      <div className='border-t border-[#D2D0C8] p-4 space-y-3'>
        {/* Search/Input */}
        {showSearchSuggestions
          ? (
            <div className='space-y-2'>
              <AIPrompt
                onSubmit={handleSendMessage}
                placeholder='Pergunte ao assistente...'
                disabled={sendMessageLoading}
                model={currentModel}
                onModelChange={setModel}
                showInput={false}
              />
              <AIInputSearch
                onSearch={handleSearch}
                suggestions={searchSuggestions}
                placeholder='Digite sua pergunta sobre tratamentos estéticos...'
                className='w-full'
              />
              {/** Suggestions loading indicator */}
              {/** Show subtle loading when suggestions are being fetched */}
              {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
              {/** Accessible spinner below input */}

              {/* suggestionsLoading is provided by useAIChat */}
              {suggestionsLoading && (
                <div className='pt-1'>
                  <AILoading size='sm' message='Buscando sugestões...' />
                </div>
              )}
            </div>
          )
          : (
            <AIPrompt
              onSubmit={handleSendMessage}
              placeholder='Digite sua pergunta sobre tratamentos estéticos...'
              disabled={sendMessageLoading}
              model={currentModel}
              onModelChange={setModel}
              models={chatModels}
            />
          )}

        {/* Voice Controls */}
        {showVoiceControls && (
          <div className='flex items-center justify-between'>
            <AIVoice
              onVoiceInput={handleVoiceInput}
              onVoiceOutput={handleVoiceOutput}
              isListening={voiceProcessingLoading}
              disabled={sendMessageLoading}
            />

            {(sendMessageLoading || voiceProcessingLoading) && (
              <AILoading
                size='sm'
                message={isVoiceMode ? 'Processando áudio...' : 'Enviando...'}
                showMessage={true}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='px-4 pb-2'>
        <p className='text-xs text-[#B4AC9C] text-center'>
          Powered by NeonPro AI • Respeitamos sua privacidade (LGPD)
          {patientId && (
            <span className='block mt-1'>
              Paciente: {patientId.slice(-4)} • Contexto: {context}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
