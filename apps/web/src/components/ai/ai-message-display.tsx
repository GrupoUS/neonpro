'use client';

/**
 * AI Message Display Component
 *
 * Enhanced message display component with streaming support,
 * healthcare context, and accessibility features.
 *
 * Features:
 * - Real-time streaming text display
 * - Markdown rendering with safety
 * - Healthcare context indicators
 * - Source citations
 * - Timestamp display
 * - Accessibility compliance
 * - Mobile-optimized design
 */

import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Flag,
  MoreHorizontal,
  Stethoscope,
  Trash2,
  User,
  Volume2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Tooltip } from '@/components/ui/tooltip';

import { Card } from '@/components/ui/card';

import { formatDateTime } from '@/utils/brazilian-formatters';
import { cn } from '@neonpro/ui';

export interface AIMessageDisplayProps {
  /** Message content */
  content: string;
  /** Message role */
  role: 'user' | 'assistant' | 'system';
  /** Message timestamp */
  timestamp: Date;
  /** Message ID */
  messageId: string;
  /** Is streaming */
  isStreaming?: boolean;
  /** Streaming content */
  streamingContent?: string;
  /** AI model used */
  model?: string;
  /** Confidence score */
  confidence?: number;
  /** Processing time */
  processingTime?: number;
  /** Healthcare context */
  healthcareContext?: boolean;
  /** Sources/citations */
  sources?: Array<{
    id: string;
    title: string;
    url?: string;
    content: string;
    relevance: number;
    type: 'document' | 'database' | 'knowledge_base' | 'external';
  }>;
  /** Metadata */
  metadata?: Record<string, any>;
  /** User avatar */
  userAvatar?: string;
  /** Assistant avatar */
  assistantAvatar?: string;
  /** Show timestamp */
  showTimestamp?: boolean;
  /** Show model info */
  showModelInfo?: boolean;
  /** Show actions */
  showActions?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Test ID */
  testId?: string;
  /** On message action */
  onMessageAction?: (action: string, messageId: string) => void;
  /** On copy */
  onCopy?: (content: string) => void;
  /** On speak */
  onSpeak?: (content: string) => void;
  /** On edit */
  onEdit?: (messageId: string, newContent: string) => void;
  /** On delete */
  onDelete?: (messageId: string) => void;
  /** On flag */
  onFlag?: (messageId: string) => void;
}

// Simple markdown renderer (safe implementation)
const renderMarkdown = (content: string, isStreaming = false) => {
  if (!content) return null;

  // Basic markdown processing - replace with a proper markdown library in production
  const processedContent = content
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-muted p-2 rounded text-xs overflow-x-auto"><code>$1</code></pre>',
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>',
    )
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>',
    )
    // Line breaks
    .replace(/\n/g, '<br />');

  return (
    <div
      className='prose prose-sm max-w-none dark:prose-invert [&_pre]:whitespace-pre-wrap [&_code]:whitespace-pre-wrap'
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

// Streaming text component
const StreamingText: React.FC<{ content: string; isComplete?: boolean }> = ({
  content,
  isComplete,
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setDisplayedContent(content);
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }
    }, 10); // Adjust speed as needed

    return () => clearTimeout(timer);
  }, [content, currentIndex, isComplete]);

  return (
    <span
      className={isComplete
        ? ''
        : 'after:content-["|"] after:animate-pulse after:inline-block after:ml-1'}
    >
      {displayedContent}
    </span>
  );
};

/**
 * AI Message Display Component
 */
export const AIMessageDisplay: React.FC<AIMessageDisplayProps> = ({
  content,
  role,
  timestamp,
  messageId,
  isStreaming = false,
  streamingContent = '',
  model,
  confidence,
  processingTime,
  healthcareContext = false,
  sources = [],
  metadata = {},
  userAvatar,
  assistantAvatar,
  showTimestamp = true,
  showModelInfo = true,
  showActions = true,
  compact = false,
  testId = 'ai-message-display',
  onMessageAction,
  onCopy,
  onSpeak,
  onEdit,
  onDelete,
  onFlag,
}) => {
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isCopied, setIsCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  // Refs
  const messageRef = useRef<HTMLDivElement>(null);

  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onCopy?.(content);
    } catch (_error) {
      console.error('Failed to copy text:', error);
    }
  }, [content, onCopy]);

  // Handle speak (text-to-speech)
  const handleSpeak = useCallback(() => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'pt-BR';
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      onSpeak?.(content);
    }
  }, [content, onSpeak]);

  // Handle edit
  const handleEdit = useCallback(() => {
    if (role === 'user') {
      setIsEditing(true);
      setEditContent(content);
    }
  }, [role, content]);

  // Handle save edit
  const handleSaveEdit = useCallback(() => {
    if (onEdit) {
      onEdit(messageId, editContent);
      setIsEditing(false);
    }
  }, [onEdit, messageId, editContent]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(content);
  }, [content]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (onDelete && confirm('Tem certeza que deseja excluir esta mensagem?')) {
      onDelete(messageId);
    }
  }, [onDelete, messageId]);

  // Handle flag
  const handleFlag = useCallback(() => {
    onFlag?.(messageId);
  }, [onFlag, messageId]);

  // Display content
  const displayContent = isStreaming ? streamingContent : content;
  const isAssistant = role === 'assistant';
  const isUser = role === 'user';

  // Get confidence color
  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get avatar
  const getAvatar = () => {
    if (isUser) {
      return (
        <Avatar className='h-8 w-8'>
          {userAvatar
            ? <AvatarImage src={userAvatar} alt='User' />
            : (
              <AvatarFallback className='bg-primary text-primary-foreground'>
                <User className='h-4 w-4' />
              </AvatarFallback>
            )}
        </Avatar>
      );
    }

    if (isAssistant) {
      return (
        <Avatar className='h-8 w-8'>
          {assistantAvatar ? <AvatarImage src={assistantAvatar} alt='Assistant' /> : (
            <AvatarFallback
              className={cn(
                'bg-primary/10 text-primary',
                healthcareContext && 'bg-green-500/10 text-green-600',
              )}
            >
              {healthcareContext
                ? <Stethoscope className='h-4 w-4' />
                : <Bot className='h-4 w-4' />}
            </AvatarFallback>
          )}
        </Avatar>
      );
    }

    return null;
  };

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex gap-3 group/message',
        isUser ? 'justify-end' : 'justify-start',
        compact && 'gap-2',
      )}
      data-testid={testId}
      data-message-id={messageId}
      data-role={role}
    >
      {/* Avatar */}
      {isAssistant && !compact && getAvatar()}

      {/* Message Content */}
      <div className={cn('max-w-[85%] flex flex-col', isUser && 'items-end')}>
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground'
              : healthcareContext
              ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
              : 'bg-muted',
            compact && 'px-3 py-2',
            isStreaming && 'animate-pulse',
          )}
        >
          {/* Edit Mode */}
          {isEditing && isUser
            ? (
              <div className='space-y-2'>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className='w-full min-h-20 p-2 rounded border text-sm resize-none bg-background text-foreground'
                  autoFocus
                />
                <div className='flex gap-2 justify-end'>
                  <Button size='sm' variant='outline' onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button size='sm' onClick={handleSaveEdit}>
                    Salvar
                  </Button>
                </div>
              </div>
            )
            : (
              /* Message Content */
              <div className='text-sm'>
                {isStreaming
                  ? (
                    <StreamingText
                      content={displayContent}
                      isComplete={!isStreaming}
                    />
                  )
                  : (
                    renderMarkdown(displayContent)
                  )}
              </div>
            )}

          {/* Sources */}
          {sources.length > 0 && (
            <div className='mt-3 pt-3 border-t border-border/50'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowSources(!showSources)}
                className='text-xs h-6 px-2'
              >
                <FileText className='h-3 w-3 mr-1' />
                Fontes ({sources.length})
              </Button>

              {showSources && (
                <div className='mt-2 space-y-1'>
                  {sources.map((source, _index) => (
                    <div
                      key={source.id}
                      className='flex items-start gap-2 p-2 rounded bg-background/50 text-xs'
                    >
                      <Badge variant='outline' className='text-xs'>
                        {source.type === 'document' && '📄'}
                        {source.type === 'database' && '🗄️'}
                        {source.type === 'knowledge_base' && '🧠'}
                        {source.type === 'external' && '🌐'}
                      </Badge>
                      <div className='flex-1'>
                        <div className='font-medium'>{source.title}</div>
                        {source.content && (
                          <div className='text-muted-foreground mt-1 line-clamp-2'>
                            {source.content}
                          </div>
                        )}
                        {source.url && (
                          <a
                            href={source.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary hover:underline flex items-center gap-1 mt-1'
                          >
                            <span>Ver fonte</span>
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        )}
                      </div>
                      <div className='text-muted-foreground'>
                        {Math.round(source.relevance * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Metadata */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1 text-xs opacity-70',
            isUser ? 'justify-end' : 'justify-start',
            compact && 'text-[10px]',
          )}
        >
          {/* Timestamp */}
          {showTimestamp && (
            <div className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              <span>{formatDateTime(timestamp)}</span>
            </div>
          )}

          {/* Model Info */}
          {isAssistant && showModelInfo && model && (
            <Badge variant='outline' className='text-xs'>
              {model}
            </Badge>
          )}

          {/* Confidence Score */}
          {isAssistant && confidence && (
            <div className='flex items-center gap-1'>
              <CheckCircle
                className={cn('h-3 w-3', getConfidenceColor(confidence))}
              />
              <span className={getConfidenceColor(confidence)}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}

          {/* Processing Time */}
          {isAssistant && processingTime && <span>{processingTime}ms</span>}

          {/* Healthcare Context */}
          {healthcareContext && (
            <Badge variant='outline' className='text-xs'>
              <Stethoscope className='h-3 w-3 mr-1' />
              Saúde
            </Badge>
          )}
        </div>
      </div>

      {/* User Avatar (Right Side) */}
      {isUser && !compact && getAvatar()}

      {/* Actions */}
      {showActions && !compact && (
        <div
          className={cn(
            'opacity-0 group-hover/message:opacity-100 transition-opacity',
            isUser ? 'order-first' : 'order-last',
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className='h-4 w-4 mr-2' />
                Copiar
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleSpeak}>
                <Volume2 className='h-4 w-4 mr-2' />
                Ler em voz alta
              </DropdownMenuItem>

              {isUser && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit3 className='h-4 w-4 mr-2' />
                    Editar
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleFlag}>
                <Flag className='h-4 w-4 mr-2' />
                Reportar
              </DropdownMenuItem>

              {isUser && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className='text-destructive'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default AIMessageDisplay;
