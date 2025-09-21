'use client';

/**
 * AI Chat Input Component
 *
 * Enhanced input component with voice capability, search functionality,
 * and healthcare compliance features. Based on KokonutUI patterns.
 *
 * Features:
 * - Auto-resizing textarea
 * - Voice input with Brazilian Portuguese support
 * - File attachment capability
 * - Search integration
 * - Healthcare compliance indicators
 * - Mobile-optimized design
 */

import {
  Bot,
  FileText,
  Globe,
  Image,
  Mic,
  MicOff,
  Music,
  Paperclip,
  Plus,
  Search,
  Send,
  Stethoscope,
  Video,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@neonpro/ui';

export interface AIChatInputProps {
  /** Input value */
  value: string;
  /** On change handler */
  onChange: (value: string) => void;
  /** On submit handler */
  onSubmit: (e: React.FormEvent) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Show voice input */
  showVoiceInput?: boolean;
  /** Show file attachment */
  showFileAttachment?: boolean;
  /** Show search button */
  showSearch?: boolean;
  /** Show model selection */
  showModelSelection?: boolean;
  /** Selected AI model */
  selectedModel?: string;
  /** On model change */
  onModelChange?: (model: string) => void;
  /** Available AI models */
  availableModels?: Array<{
    id: string;
    name: string;
    provider: string;
    healthcareOptimized?: boolean;
    icon?: React.ReactNode;
  }>;
  /** Voice recognition state */
  voiceState?: 'idle' | 'listening' | 'processing' | 'error';
  /** On voice toggle */
  onVoiceToggle?: () => void;
  /** Attached files */
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  }>;
  /** On file attach */
  onFileAttach?: (files: File[]) => void;
  /** On file remove */
  onFileRemove?: (fileId: string) => void;
  /** On search */
  onSearch?: (query: string) => void;
  /** Healthcare compliance */
  healthcareCompliance?: {
    lgpdCompliant: boolean;
    requiresConsent: boolean;
    consentGiven: boolean;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Minimum height */
  minHeight?: number;
  /** Maximum height */
  maxHeight?: number;
  /** Test ID */
  testId?: string;
}

// File type icons
const getFileIcon = (_type: [a-zA-Z][a-zA-Z]*) => {
  if (type.startsWith('image/')) return <Image className='h-4 w-4' />;
  if (type.startsWith('video/')) return <Video className='h-4 w-4' />;
  if (type.startsWith('audio/')) return <Music className='h-4 w-4' />;
  return <FileText className='h-4 w-4' />;
};

// Format file size
const formatFileSize = (_bytes: [a-zA-Z][a-zA-Z]*) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * AI Chat Input Component
 */
export const AIChatInput: React.FC<AIChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Digite sua mensagem...',
  disabled = false,
  showVoiceInput = true,
  showFileAttachment = true,
  showSearch = true,
  showModelSelection = true,
  selectedModel = 'gpt-4o',
  onModelChange,
  availableModels = [],
  voiceState = 'idle',
  onVoiceToggle,
  attachments = [],
  onFileAttach,
  onFileRemove,
  onSearch,
  healthcareCompliance,
  isLoading = false,
  minHeight = 44,
  maxHeight = 200,
  testId = 'ai-chat-input',
}) => {
  // State
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.min(Math.max(scrollHeight, minHeight), maxHeight) + 'px';
  }, [value, minHeight, maxHeight]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSubmit(e);
        }
      }
    },
    [value, disabled, onSubmit],
  );

  // Handle file attachment
  const handleFileAttach = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0 && onFileAttach) {
        onFileAttach(files);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onFileAttach],
  );

  // Handle search
  const handleSearch = useCallback(() => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch]);

  // Handle search key down
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  // Remove attachment
  const handleRemoveAttachment = useCallback(
    (_fileId: [a-zA-Z][a-zA-Z]*) => {
      if (onFileRemove) {
        onFileRemove(fileId);
      }
    },
    [onFileRemove],
  );

  // Get selected model info
  const selectedModelInfo = availableModels.find(m => m.id === selectedModel);

  return (
    <div className='relative w-full'>
      {/* Search Panel */}
      {showSearchPanel && (
        <div className='absolute bottom-full left-0 right-0 mb-2 p-3 bg-background border rounded-lg shadow-lg z-10'>
          <div className='flex items-center gap-2 mb-2'>
            <Search className='h-4 w-4 text-muted-foreground' />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder='Pesquisar conversas e documentos...'
              className='flex-1'
              autoFocus
            />
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowSearchPanel(false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            size='sm'
            className='w-full'
          >
            Pesquisar
          </Button>
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={cn(
          'relative flex flex-col rounded-xl transition-all duration-200 w-full',
          'border border-input bg-background',
          isFocused && 'ring-2 ring-ring ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className='flex flex-wrap gap-2 p-3 border-b bg-muted/30'>
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className='flex items-center gap-2 px-3 py-1.5 bg-background border rounded-lg text-xs'
              >
                {getFileIcon(attachment.type)}
                <span className='max-w-32 truncate'>{attachment.name}</span>
                <span className='text-muted-foreground'>
                  {formatFileSize(attachment.size)}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0 hover:bg-destructive/20'
                  onClick={() => handleRemoveAttachment(attachment.id)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea Area */}
        <div className='relative'>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full resize-none border-none rounded-t-xl',
              'min-h-[44px] max-h-32',
              'px-4 py-3',
              'focus-visible:outline-none focus-visible:ring-0',
              'placeholder:text-muted-foreground',
              attachments.length > 0 && 'rounded-t-none',
            )}
            rows={1}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Action Buttons */}
          <div className='absolute right-2 top-2 flex items-center gap-1'>
            {/* Model Selection */}
            {showModelSelection && availableModels.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select
                      value={selectedModel}
                      onValueChange={value => onModelChange?.(value)}
                    >
                      <SelectTrigger className='w-auto h-8 px-2 border-0 bg-transparent'>
                        <SelectValue className='text-xs' />
                      </SelectTrigger>
                      <SelectContent align='end' className='min-w-48'>
                        {availableModels.map(model => (
                          <SelectItem
                            key={model.id}
                            value={model.id}
                            className='text-xs'
                          >
                            <div className='flex items-center gap-2'>
                              {model.icon || <Bot className='h-3 w-3' />}
                              <div className='flex-1'>
                                <div className='font-medium'>{model.name}</div>
                                <div className='text-muted-foreground text-xs'>
                                  {model.provider}
                                </div>
                              </div>
                              {model.healthcareOptimized && (
                                <Stethoscope className='h-3 w-3 text-green-500' />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Selecionar modelo de IA</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* File Attachment */}
            {showFileAttachment && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className='cursor-pointer rounded-lg p-1.5 hover:bg-muted transition-colors'>
                      <input
                        ref={fileInputRef}
                        type='file'
                        multiple
                        className='hidden'
                        onChange={handleFileAttach}
                        accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'
                      />
                      <Paperclip className='h-4 w-4 text-muted-foreground hover:text-foreground transition-colors' />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Anexar arquivo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Search Button */}
            {showSearch && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() => setShowSearchPanel(!showSearchPanel)}
                    >
                      <Search className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pesquisar conversas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Voice Input */}
            {showVoiceInput && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className={cn(
                        'h-8 w-8 p-0',
                        voiceState === 'listening' && 'text-red-500 bg-red-50',
                        voiceState === 'error' && 'text-red-500',
                      )}
                      onClick={onVoiceToggle}
                      disabled={disabled}
                    >
                      {voiceState === 'listening'
                        ? <MicOff className='h-4 w-4' />
                        : <Mic className='h-4 w-4' />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {voiceState === 'listening'
                        ? 'Parar gravação'
                        : voiceState === 'error'
                        ? 'Erro no reconhecimento'
                        : 'Gravar áudio'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Send Button */}
            <Button
              type='submit'
              onClick={onSubmit}
              disabled={!value.trim() || disabled || isLoading}
              size='sm'
              className={cn(
                'h-8 w-8 p-0',
                value.trim() && !disabled && !isLoading
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between px-4 py-2 bg-muted/30 border-t'>
          <div className='flex items-center gap-2'>
            {/* Voice State Indicator */}
            {voiceState === 'listening' && (
              <div className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse' />
                <span className='text-xs text-red-600'>Ouvindo...</span>
              </div>
            )}

            {voiceState === 'error' && (
              <div className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-red-500 rounded-full' />
                <span className='text-xs text-red-600'>Erro no microfone</span>
              </div>
            )}

            {/* Healthcare Compliance */}
            {healthcareCompliance?.lgpdCompliant && (
              <Badge variant='outline' className='text-xs'>
                <Globe className='h-3 w-3 mr-1' />
                LGPD
              </Badge>
            )}

            {selectedModelInfo?.healthcareOptimized && (
              <Badge variant='outline' className='text-xs'>
                <Stethoscope className='h-3 w-3 mr-1' />
                Saúde
              </Badge>
            )}
          </div>

          <div className='text-xs text-muted-foreground'>
            {selectedModelInfo?.name || selectedModel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatInput;
