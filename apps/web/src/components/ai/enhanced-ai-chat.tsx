'use client';

/**
 * Enhanced AI Chat Interface Component for NeonPro
 *
 * Built with AI SDK components as foundation, enhanced with KokonutUI components
 * and integrated with existing tRPC agent backend for healthcare-specific AI functionality.
 *
 * Features:
 * - AI SDK useChat hook for streaming responses
 * - Voice input capability with Brazilian Portuguese support
 * - Real-time search functionality
 * - Healthcare compliance elements (LGPD)
 * - Mobile-optimized design with touch interactions
 * - Accessibility compliance (WCAG 2.1 AA+)
 * - Integration with tRPC agent backend
 */

import { useChat } from '@ai-sdk/react';
import { smoothStream } from 'ai';
import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle,
  Clock,
  Mic,
  MicOff,
  Paperclip,
  Search,
  Send,
  Settings,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

import { formatDateTime } from '@/utils/brazilian-formatters';
import { cn } from '@neonpro/ui';

// Import tRPC hooks for agent integration
import { useAgentChat, useAgentSessionManager, useKnowledgeBaseManager } from '@/trpc/agent';

// Types
export interface EnhancedAIChatProps {
  /** Patient context for healthcare-specific conversations */
  patientContext?: {
    patientId: string;
    patientName: string;
    medicalHistory?: any;
    cpf?: string;
  };
  /** Healthcare professional context */
  healthcareProfessional?: {
    id: string;
    name: string;
    specialty: string;
    crmNumber: string;
  };
  /** Initial AI model preference */
  defaultModel?: string;
  /** Show model selection */
  showModelSelection?: boolean;
  /** Show voice input */
  showVoiceInput?: boolean;
  /** Show file attachments */
  showFileAttachment?: boolean;
  /** Show search functionality */
  showSearch?: boolean;
  /** LGPD consent for chat history */
  lgpdConsent?: {
    canStoreHistory: boolean;
    dataRetentionDays: number;
    requiresExplicitConsent: boolean;
  };
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** Maximum height */
  maxHeight?: string;
  /** Test ID */
  testId?: string;
  /** Session type for tRPC integration */
  sessionType?: 'client' | 'financial' | 'appointment' | 'general';
}

export interface ChatMessage {
  id: string;
  _role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  confidence?: number;
  metadata?: {
    processingTime?: number;
    tokensUsed?: number;
    healthcareContext?: boolean;
    sessionType?: string;
    sources?: Array<{
      id: string;
      title: string;
      content: string;
      relevance: number;
    }>;
  };
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  healthcareOptimized: boolean;
  status: 'available' | 'limited' | 'unavailable';
  icon?: React.ReactNode;
}

// Available AI models for NeonPro
const AVAILABLE_AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    capabilities: ['chat', 'reasoning', 'healthcare-context'],
    healthcareOptimized: true,
    status: 'available',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    capabilities: ['chat', 'analysis', 'healthcare-context'],
    healthcareOptimized: true,
    status: 'available',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    capabilities: ['chat', 'multimodal', 'healthcare-context'],
    healthcareOptimized: true,
    status: 'available',
  },
  {
    id: 'neonpro-assistant',
    name: 'NeonPro Assistant',
    provider: 'Internal',
    capabilities: [
      'healthcare',
      'appointments',
      'patient-data',
      'lgpd-compliant',
    ],
    healthcareOptimized: true,
    status: 'available',
  },
];

// Voice recognition types
type VoiceRecognitionState = 'idle' | 'listening' | 'processing' | 'error';

/**
 * Enhanced AI Chat Component
 */
export const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({
  patientContext,
  healthcareProfessional,
  defaultModel = 'gpt-4o',
  showModelSelection = true,
  showVoiceInput = true,
  showFileAttachment = false,
  showSearch = true,
  lgpdConsent = {
    canStoreHistory: true,
    dataRetentionDays: 30,
    requiresExplicitConsent: false,
  },
  mobileOptimized = true,
  maxHeight = '600px',
  testId = 'enhanced-ai-chat',
  sessionType = 'general',
}) => {
  // State management
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLgpdConsentGiven, setIsLgpdConsentGiven] = useState(
    !lgpdConsent.requiresExplicitConsent,
  );
  const [activeTab, setActiveTab] = useState('chat');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // AI SDK chat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleAIChatSubmit,
    setInput,
    isLoading: isAILoading,
    error: aiError,
    setMessages,
    setData,
  } = useChat({
    api: '/api/ai/chat',
    experimental_transform: smoothStream({
      chunking: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]|\S+\s+/, // Supports Japanese, Chinese, and word boundaries
    }),
    onFinish: async message => {
      // Handle LGPD compliance
      if (lgpdConsent.canStoreHistory && isLgpdConsentGiven) {
        // Store message with proper retention policies
        console.log('Storing message for LGPD compliance:', {
          messageId: message.id,
          retentionDays: lgpdConsent.dataRetentionDays,
        });
      }
    },
  });

  // tRPC agent integration
  const {
    currentSessionId,
    startNewSession,
    endCurrentSession,
    isCreating: isAgentCreating,
  } = useAgentSessionManager();

  const {
    messages: agentMessages,
    sendMessage: sendAgentMessage,
    performRAGSearch,
    isSending: isAgentSending,
    isSearchingRAG,
  } = useAgentChat(currentSessionId);

  // Knowledge base search
  const { searchEntries, isSearching: isKnowledgeSearching } = useKnowledgeBaseManager();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentMessages, scrollToBottom]);

  // Voice recognition implementation
  const startVoiceRecognition = useCallback(async () => {
    if (
      !('webkitSpeechRecognition' in window)
      && !('SpeechRecognition' in window)
    ) {
      setVoiceState('error');
      return;
    }

    try {
      setVoiceState('listening');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'pt-BR'; // Brazilian Portuguese
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = event => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInput(transcript);
      };

      recognition.onerror = event => {
        console.error('Speech recognition error:', event.error);
        setVoiceState('error');
      };

      recognition.onend = () => {
        setVoiceState('idle');
      };

      recognition.start();
    } catch (_error) {
      console.error('Voice recognition error:', error);
      setVoiceState('error');
    }
  }, [setInput]);

  const stopVoiceRecognition = useCallback(() => {
    setVoiceState('idle');
  }, []);

  // Search functionality
  const handleSearch = useCallback(
    async (query: any) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Search in current messages
        const filteredMessages = messages.filter(msg =>
          msg.content.toLowerCase().includes(query.toLowerCase())
        );

        // Search in knowledge base if available
        if (currentSessionId) {
          const knowledgeResults = await searchEntries({
            agent_type: sessionType,
            query,
            limit: 5,
          });

          const knowledgeMessages: ChatMessage[] = knowledgeResults.data?.map((entry, index) => ({
            id: `knowledge-${index}`,
            _role: 'system',
            content: entry.content,
            timestamp: new Date(),
            metadata: {
              sources: [
                {
                  id: entry.id,
                  title: entry.title,
                  content: entry.content,
                  relevance: 0.8,
                },
              ],
            },
          })) || [];

          setSearchResults([...filteredMessages, ...knowledgeMessages]);
        } else {
          setSearchResults(filteredMessages);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [messages, currentSessionId, sessionType, searchEntries],
  );

  // Handle message submission
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || (isAILoading && isAgentSending)) return;

      try {
        // Create or get agent session if needed
        if (!currentSessionId && sessionType !== 'general') {
          await startNewSession({
            agent_type: sessionType,
            initial_context: `Patient: ${patientContext?.patientName || 'Unknown'}, Professional: ${
              healthcareProfessional?.name || 'Unknown'
            }`,
            metadata: {
              patientId: patientContext?.patientId,
              professionalId: healthcareProfessional?.id,
              lgpdConsent: isLgpdConsentGiven,
            },
          });
        }

        // Send through tRPC agent for healthcare-specific chats
        if (sessionType !== 'general' && currentSessionId) {
          await sendAgentMessage(input, {
            metadata: {
              model: selectedModel,
              patientContext,
              healthcareProfessional,
              lgpdCompliant: isLgpdConsentGiven,
            },
          });
        } else {
          // Send through AI SDK for general chats
          handleAIChatSubmit(e);
        }
      } catch (error) {
        console.error('Message send error:', error);
      }
    },
    [
      input,
      isAILoading,
      isAgentSending,
      currentSessionId,
      sessionType,
      startNewSession,
      patientContext,
      healthcareProfessional,
      isLgpdConsentGiven,
      sendAgentMessage,
      selectedModel,
      handleAIChatSubmit,
    ],
  );

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e as any);
      }
    },
    [handleSendMessage],
  );

  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setData(undefined);
  }, [setMessages, setData]);

  // Get selected model info
  const selectedModelInfo = AVAILABLE_AI_MODELS.find(
    m => m.id === selectedModel,
  );

  // Render message content with markdown support
  const renderMessageContent = useCallback((content: any) => {
    return (
      <div className='prose prose-sm max-w-none dark:prose-invert'>
        {content.split('\n').map((line, index) => (
          <p key={index} className='mb-2 last:mb-0'>
            {line}
          </p>
        ))}
      </div>
    );
  }, []);

  // LGPD Consent Modal
  if (lgpdConsent.requiresExplicitConsent && !isLgpdConsentGiven) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-amber-500' />
            Consentimento LGPD
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Para utilizar o chat com IA, precisamos do seu consentimento conforme a Lei Geral de
            Proteção de Dados (LGPD).
          </p>
          <div className='space-y-2 text-sm'>
            <p>
              • Suas conversas serão armazenadas por {lgpdConsent.dataRetentionDays} dias
            </p>
            <p>
              • Os dados serão utilizados apenas para melhoria do atendimento
            </p>
            <p>• Você pode solicitar a exclusão dos dados a qualquer momento</p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={() => setIsLgpdConsentGiven(true)}
              className='flex-1'
            >
              Concordar e Continuar
            </Button>
            <Button variant='outline' onClick={() => window.history.back()}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'flex flex-col w-full h-full',
        mobileOptimized && 'touch-manipulation',
        'border-0 shadow-lg rounded-xl overflow-hidden',
      )}
      data-testid={testId}
    >
      {/* Header */}
      <CardHeader className='pb-3 border-b bg-background/50 backdrop-blur-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Brain className='h-5 w-5 text-primary' />
              <CardTitle className='text-lg font-semibold'>
                Assistente NeonPro
              </CardTitle>
            </div>

            {patientContext && (
              <Badge variant='secondary' className='hidden sm:flex'>
                <User className='h-3 w-3 mr-1' />
                {patientContext.patientName}
              </Badge>
            )}

            {healthcareProfessional && (
              <Badge variant='outline' className='hidden sm:flex'>
                <Stethoscope className='h-3 w-3 mr-1' />
                {healthcareProfessional.specialty}
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {showSearch && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowSearchPanel(!showSearchPanel)}
                      className={cn(showSearchPanel && 'bg-primary/10')}
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

            {showModelSelection && (
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className='w-32 h-8 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_AI_MODELS.filter(
                    model => model.status === 'available',
                  ).map(model => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className='text-xs'
                    >
                      <div className='flex items-center gap-2'>
                        {model.healthcareOptimized && (
                          <Stethoscope className='h-3 w-3 text-green-500' />
                        )}
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <Settings className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Configurações do Chat</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-medium mb-2 text-sm'>Modelo Atual</h4>
                    <div className='flex items-center gap-2'>
                      {selectedModelInfo?.icon || <Brain className='h-4 w-4' />}
                      <span className='text-sm'>{selectedModelInfo?.name}</span>
                      {selectedModelInfo?.healthcareOptimized && (
                        <Badge variant='secondary' className='text-xs'>
                          Otimizado para Saúde
                        </Badge>
                      )}
                    </div>
                  </div>

                  {patientContext && (
                    <div>
                      <h4 className='font-medium mb-2 text-sm'>
                        Contexto do Paciente
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        {patientContext.patientName} (ID: {patientContext.patientId})
                      </p>
                      {patientContext.cpf && (
                        <p className='text-xs text-muted-foreground'>
                          CPF: {patientContext.cpf.replace(
                            /(\d{3})(\d{3})(\d{3})(\d{2})/,
                            '$1.$2.$3-$4',
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className='font-medium mb-2 text-sm'>
                      LGPD e Privacidade
                    </h4>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground'>
                        {lgpdConsent.canStoreHistory
                          ? `Histórico armazenado por ${lgpdConsent.dataRetentionDays} dias`
                          : 'Histórico não armazenado'}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Consentimento: {isLgpdConsentGiven ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    onClick={handleClearChat}
                    variant='outline'
                    className='w-full'
                  >
                    <X className='h-4 w-4 mr-2' />
                    Limpar Conversa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {/* Tabs */}
      <div className='border-b'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 h-8'>
            <TabsTrigger value='chat' className='text-xs'>
              Chat
            </TabsTrigger>
            <TabsTrigger value='search' className='text-xs'>
              Pesquisa
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CardContent className='flex-1 flex flex-col p-0'>
        {/* Search Panel */}
        {showSearchPanel && activeTab === 'search' && (
          <div className='border-b p-4 bg-background/50'>
            <div className='relative'>
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder='Pesquisar conversas...'
                className='pr-8'
              />
              <Search className='absolute right-2 top-2.5 h-4 w-4 text-muted-foreground' />
            </div>

            {isSearching && (
              <div className='flex items-center gap-2 mt-2 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3 animate-spin' />
                Pesquisando...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className='mt-3 space-y-2 max-h-32 overflow-y-auto'>
                {searchResults.map((result, _index) => (
                  <div
                    key={index}
                    className='p-2 rounded bg-muted text-xs cursor-pointer hover:bg-muted/80'
                    onClick={() => {
                      setInput(result.content);
                      setShowSearchPanel(false);
                      setActiveTab('chat');
                    }}
                  >
                    <div className='font-medium mb-1'>{result.role}</div>
                    <div className='text-muted-foreground line-clamp-2'>
                      {result.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className='flex-1 px-4' style={{ maxHeight }}>
          <div className='space-y-4 py-4'>
            {/* Welcome message */}
            {messages.length === 0 && agentMessages.length === 0 && (
              <div className='text-center py-8'>
                <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4'>
                  <Brain className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>
                  Bem-vindo ao Assistente NeonPro
                </h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  {patientContext
                    ? `Estou aqui para ajudar com questões sobre ${patientContext.patientName}.`
                    : 'Como posso ajudar você hoje?'}
                </p>
                <div className='flex flex-wrap gap-2 justify-center'>
                  <Badge variant='outline' className='text-xs'>
                    LGPD Compliant
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    Healthcare Optimized
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    Real-time Response
                  </Badge>
                </div>
              </div>
            )}

            {/* Render AI SDK messages */}
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {message.role === 'assistant' && (
                  <div className='flex-shrink-0'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-primary/10 text-primary'>
                        <Bot className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted',
                  )}
                >
                  <div className='text-sm'>
                    {renderMessageContent(message.content)}
                  </div>

                  <div className='flex items-center justify-between mt-2 text-xs opacity-70'>
                    <span>{formatDateTime(message.createdAt)}</span>

                    {message.role === 'assistant' && selectedModelInfo && (
                      <div className='flex items-center gap-2'>
                        <span>{selectedModelInfo.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className='flex-shrink-0'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-primary text-primary-foreground'>
                        <User className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}

            {/* Render agent messages */}
            {agentMessages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {message.role === 'assistant' && (
                  <div className='flex-shrink-0'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-green-500/10 text-green-600'>
                        <Stethoscope className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800',
                  )}
                >
                  <div className='text-sm'>
                    {renderMessageContent(message.content)}
                  </div>

                  <div className='flex items-center justify-between mt-2 text-xs opacity-70'>
                    <span>{formatDateTime(new Date(message.createdAt))}</span>

                    {message.role === 'assistant' && (
                      <Badge variant='secondary' className='text-xs'>
                        <Stethoscope className='h-3 w-3 mr-1' />
                        Agente NeonPro
                      </Badge>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className='flex-shrink-0'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-primary text-primary-foreground'>
                        <User className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}

            {/* Loading states */}
            {(isAILoading || isAgentSending) && (
              <div className='flex gap-3 justify-start'>
                <div className='flex-shrink-0'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-primary/10 text-primary'>
                      <Bot className='h-4 w-4 animate-pulse' />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className='bg-muted rounded-lg px-4 py-3'>
                  <div className='flex items-center gap-2'>
                    <div className='flex gap-1'>
                      <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce' />
                      <div
                        className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {sessionType === 'general'
                        ? 'Digitando...'
                        : 'Analisando contexto médico...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {aiError && (
              <div className='flex gap-3 justify-start'>
                <div className='flex-shrink-0'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-red-500/10 text-red-600'>
                      <AlertTriangle className='h-4 w-4' />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className='bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3'>
                  <div className='text-sm text-red-800 dark:text-red-200'>
                    Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className='border-t p-4 bg-background/50 backdrop-blur-sm'>
          <form onSubmit={handleSendMessage} className='flex gap-2'>
            <div className='flex-1 relative'>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  handleInputChange(e);
                  if (showSearchPanel && e.target.value) {
                    handleSearch(e.target.value);
                  }
                }}
                onKeyDown={handleKeyPress}
                placeholder={sessionType === 'client'
                  ? 'Pergunte sobre o paciente...'
                  : sessionType === 'appointment'
                  ? 'Agendamentos e consultas...'
                  : sessionType === 'financial'
                  ? 'Questões financeiras...'
                  : 'Digite sua mensagem...'}
                disabled={isAILoading || isAgentSending}
                className='w-full min-h-[44px] max-h-32 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-20'
                rows={1}
              />

              <div className='absolute right-2 top-2 flex items-center gap-1'>
                {showFileAttachment && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          disabled
                        >
                          <Paperclip className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Anexar arquivo (em breve)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {showVoiceInput && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={voiceState === 'listening'
                            ? stopVoiceRecognition
                            : startVoiceRecognition}
                          className={cn(
                            'h-8 w-8 p-0',
                            voiceState === 'listening'
                              && 'text-red-500 bg-red-50',
                            voiceState === 'error' && 'text-red-500',
                          )}
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
              </div>
            </div>

            <Button
              type='submit'
              disabled={!input.trim() || (isAILoading && isAgentSending)}
              size='sm'
              className='px-3 h-10'
            >
              <Send className='h-4 w-4' />
            </Button>
          </form>

          {/* Voice state indicator */}
          {voiceState === 'listening' && (
            <div className='flex items-center gap-2 mt-2 text-xs text-red-600'>
              <div className='w-2 h-2 bg-red-600 rounded-full animate-pulse' />
              <span>Ouvindo... Fale agora</span>
            </div>
          )}

          {voiceState === 'error' && (
            <div className='flex items-center gap-2 mt-2 text-xs text-red-600'>
              <AlertTriangle className='h-3 w-3' />
              <span>
                Erro no reconhecimento de voz. Verifique as permissões do microfone.
              </span>
            </div>
          )}

          {/* LGPD Notice */}
          <div className='flex items-center justify-between mt-2'>
            <p className='text-xs text-muted-foreground'>
              {lgpdConsent.canStoreHistory
                ? `Conversa armazenada conforme LGPD por ${lgpdConsent.dataRetentionDays} dias`
                : 'Conversa não armazenada • Conforme LGPD'}
            </p>

            {selectedModelInfo?.healthcareOptimized && (
              <Badge variant='outline' className='text-xs'>
                <CheckCircle className='h-3 w-3 mr-1 text-green-500' />
                Saúde
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIChat;
