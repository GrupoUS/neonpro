/**
 * ChatInput - Message Input Component for Healthcare Chat
 * Auto-resize textarea, emoji picker, emergency detection
 * TweakCN NEONPRO theme integration with healthcare-specific features
 */

'use client';

import type { KeyboardEvent } from 'react';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { MessageType, HealthcareContext } from '@/types/chat';

// Icons (would be imported from lucide-react or similar)
const SendIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1={22} y1={2} x2={11} y2={13} />
    <polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="22,2 15,22 11,13 2,9 22,2" />
  </svg>
);

const SmileIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={10} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1={9} y1={9} x2={9.01} y2={9} />
    <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1={15} y1={9} x2={15.01} y2={9} />
  </svg>
);

const PaperclipIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21.44,11.05-9.19,9.19a6,6,0,0,1-8.49-8.49l9.19-9.19a4,4,0,0,1,5.66,5.66L9.41,16.41a2,2,0,0,1-2.83-2.83l8.49-8.49" />
  </svg>
);

const MicIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1={12} y1={19} x2={12} y2={23} />
    <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1={8} y1={23} x2={16} y2={23} />
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21.73,18-8-14a2,2,0,0,0-3.48,0l-8,14A2,2,0,0,0,4,21H20A2,2,0,0,0,21.73,18Z" />
    <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1={12} y1={9} x2={12} y2={13} />
    <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1={12} y1={17} x2={12.01} y2={17} />
  </svg>
);

const BotIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x={3} y={11} width={18} height={10} rx={2} ry={2} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <circle cx={12} cy={5} r={2} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m12,7v4" />
  </svg>
);

export interface ChatInputProps {
  onSendMessage: (message: string, messageType?: MessageType) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  allowFiles?: boolean;
  allowVoice?: boolean;
  healthcareContext?: HealthcareContext;
  emergencyMode?: boolean;
  aiEnabled?: boolean;
  onEmergencyDetected?: (message: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  className?: string;
}

// Emergency keywords for Brazilian healthcare context
const EMERGENCY_KEYWORDS = [
  // Portuguese emergency terms
  'emergência', 'emergencia', 'urgente', 'urgência', 'socorro', 'ajuda',
  'dor forte', 'muita dor', 'não consegue respirar', 'respirar mal', 'respiração ruim',
  'inconsciente', 'desmaiou', 'desmaio', 'sangramento', 'sangrando muito',
  'ataque cardíaco', 'infarto', 'avc', 'derrame', 'convulsão', 'convulsao',
  'alergia grave', 'choque anafilático', 'anafilaxia', 'intoxicação', 'intoxicacao',
  'acidente', 'queda grave', 'ferimento grave', 'corte profundo',
  'overdose', 'tentativa suicídio', 'suicidio', 'automutilação',
  'violência doméstica', 'violencia domestica', 'abuso',
  // Medical emergency symptoms
  'peito apertado', 'falta de ar', 'tontura forte', 'visão embaçada',
  'dormência braço', 'formigamento', 'paralisia', 'queimadura grave',
  'febre muito alta', 'temperatura alta', 'delírio', 'confusão mental'
];

// Healthcare-specific emoji categories
const HEALTHCARE_EMOJIS = {
  medical: ['🏥', '⚕️', '🩺', '💊', '🩹', '🧬', '🦠', '🩸', '🫀', '🧠'],
  emotions: ['😊', '😔', '😰', '😴', '🤒', '🤕', '🤢', '🤧', '😵', '😷'],
  body: ['👁️', '👃', '👂', '🦷', '👄', '🫁', '🦴', '🤲', '🦵', '🦶'],
  emergency: ['🚨', '⚠️', '🆘', '📞', '🚑', '🏃‍♂️', '💨', '🔴', '‼️', '❗']
};

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
  maxLength = 2000,
  allowFiles = true,
  allowVoice = true,
  healthcareContext,
  emergencyMode = false,
  aiEnabled = true,
  onEmergencyDetected,
  onTypingStart,
  onTypingStop,
  className
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyDetected, setEmergencyDetected] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState<string>('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px height
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Handle message change with emergency detection
  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
    adjustTextareaHeight();

    // Emergency keyword detection
    const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(keyword =>
      value.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasEmergencyKeyword && !emergencyDetected) {
      setEmergencyDetected(true);
      onEmergencyDetected?.(value);
    } else if (!hasEmergencyKeyword && emergencyDetected) {
      setEmergencyDetected(false);
    }

    // AI suggestion generation (mock implementation)
    if (aiEnabled && value.length > 10) {
      // Simple AI suggestion based on content
      if (value.toLowerCase().includes('dor')) {
        setAISuggestion('💡 Posso ajudar você a avaliar a intensidade da dor de 1 a 10?');
      } else if (value.toLowerCase().includes('medicamento') || value.toLowerCase().includes('remédio')) {
        setAISuggestion('💡 Lembre-se de informar sobre alergias e outros medicamentos que está tomando.');
      } else if (value.toLowerCase().includes('consulta')) {
        setAISuggestion('💡 Posso verificar horários disponíveis para consulta. Que especialidade precisa?');
      } else {
        setAISuggestion('');
      }
    }

    // Typing indicator management
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop?.();
    }, 1000);
  }, [adjustTextareaHeight, emergencyDetected, aiEnabled, isTyping, onEmergencyDetected, onTypingStart, onTypingStop]);

  // Handle form submission
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) {return;}

    onSendMessage(trimmedMessage);
    setMessage('');
    setEmergencyDetected(false);
    setAISuggestion('');
    adjustTextareaHeight();

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    onTypingStop?.();
  }, [message, disabled, onSendMessage, adjustTextareaHeight, onTypingStop]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  }, [message]);

  // Handle file selection
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      // TODO: Handle file upload
      console.log('File selected:', files[0]);
      // onSendMessage(`[Arquivo: ${files[0].name}]`, 'file');
    }
  }, []);

  // Handle voice recording (mock implementation)
  const handleVoiceRecord = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      // TODO: Stop recording and process audio
      console.log('Voice recording stopped');
    } else {
      setIsRecording(true);
      // TODO: Start voice recording
      console.log('Voice recording started');
      
      // Mock: stop recording after 5 seconds
      setTimeout(() => {
        setIsRecording(false);
      }, 5000);
    }
  }, [isRecording]);

  // Handle AI suggestion acceptance
  const handleAcceptAISuggestion = useCallback(() => {
    if (aiSuggestion) {
      // Extract suggestion text without the emoji
      const suggestionText = aiSuggestion.replace('💡 ', '');
      onSendMessage(suggestionText);
      setAISuggestion('');
    }
  }, [aiSuggestion, onSendMessage]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const canSend = message.trim().length > 0 && !disabled;
  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className={cn("relative", className)}>
      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <BotIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">{aiSuggestion}</p>
            </div>
            <button
              onClick={handleAcceptAISuggestion}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Enviar
            </button>
            <button
              onClick={() => setAISuggestion('')}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Emergency Alert */}
      {emergencyDetected && (
        <div className="mb-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              Emergência detectada. Esta mensagem será tratada com prioridade alta.
            </p>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10 w-64"
        >
          <div className="space-y-3">
            {Object.entries(HEALTHCARE_EMOJIS).map(([category, emojis]) => (
              <div key={category}>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 capitalize">
                  {category === 'medical' ? 'Médico' : 
                   category === 'emotions' ? 'Emoções' : 
                   category === 'body' ? 'Corpo' : 'Emergência'}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="p-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.mp4"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Input Container */}
        <div className={cn(
          "flex-1 relative",
          "bg-white dark:bg-gray-800 border rounded-lg",
          emergencyMode ? "border-red-300 dark:border-red-700" : "border-gray-300 dark:border-gray-600",
          emergencyDetected && "border-red-500 dark:border-red-400 shadow-red-200 dark:shadow-red-900",
          "focus-within:border-green-500 dark:focus-within:border-green-400",
          "transition-all duration-200"
        )}>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={emergencyMode ? "Descreva a emergência..." : placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className={cn(
              "w-full p-3 pr-20 resize-none border-none outline-none bg-transparent",
              "text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400",
              "min-h-[44px] max-h-[120px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />

          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Emoji Picker Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className={cn(
                "p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <SmileIcon />
            </button>

            {/* File Upload Button */}
            {allowFiles && (
              <button
                type="button"
                onClick={handleFileSelect}
                disabled={disabled}
                className={cn(
                  "p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                  "hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <PaperclipIcon />
              </button>
            )}

            {/* Voice Recording Button */}
            {allowVoice && (
              <button
                type="button"
                onClick={handleVoiceRecord}
                disabled={disabled}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  isRecording 
                    ? "text-red-600 bg-red-100 dark:bg-red-900 animate-pulse" 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <MicIcon />
              </button>
            )}
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend || isOverLimit}
          className={cn(
            "p-3 rounded-lg font-medium transition-all duration-200",
            canSend && !isOverLimit
              ? emergencyMode || emergencyDetected
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
            "min-w-[44px] h-[44px] flex items-center justify-center"
          )}
        >
          <SendIcon />
        </button>
      </form>

      {/* Character Counter */}
      {(isNearLimit || isOverLimit) && (
        <div className={cn(
          "absolute -bottom-6 right-0 text-xs",
          isOverLimit ? "text-red-500" : "text-yellow-500"
        )}>
          {characterCount}/{maxLength}
        </div>
      )}
    </div>
  );
}