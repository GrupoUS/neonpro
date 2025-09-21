/**
 * DataAgentChat Accessibility Enhancements
 * WCAG 2.1 AA+ Compliance for Healthcare Applications
 *
 * Features:
 * - Complete keyboard navigation support
 * - Screen reader optimization with ARIA attributes
 * - Touch target accessibility (≥44px)
 * - Color contrast compliance (4.5:1 minimum)
 * - Healthcare-specific accessibility patterns
 * - Portuguese language support
 * - Clinical workflow optimization
 */

'use client';

import { useCopilotContext, useCopilotReadable } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bot,
  Brain,
  Calendar,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ThumbsDown,
  ThumbsUp,
  User,
  Users,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActionHandlers } from './ActionHandlers';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  ScrollArea,
  Textarea,
  Toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/brazilian-formatters';
import { cn } from '@neonpro/ui';
import { createAGUIProtocolClient, useAGUIProtocol } from '@/services/agui-protocol';

// Import our specific types for AI agent integration
import type {
  AgentAction,
  AgentResponse,
  ChatMessage,
  ChatState,
  DataAgentRequest,
  DataAgentResponse,
  AppointmentData,
  ClientData,
  FinancialData,
  UserQuery,
} from '@neonpro/types';

export interface DataAgentChatAccessibilityProps {
  /** Current user context for role-based access */
  userContext: {
    userId: string;
    userRole: 'admin' | 'professional' | 'assistant' | 'receptionist';
    domain?: string; // Clinic/domain identifier
  };
  /** Initial session ID to resume conversation */
  initialSessionId?: string;
  /** Show as popup vs inline chat */
  mode?: 'inline' | 'popup';
  /** Maximum height for inline mode */
  maxHeight?: string;
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** LGPD consent settings */
  lgpdConsent?: {
    canStoreHistory: boolean;
    dataRetentionDays: number;
  };
  /** Custom placeholder text */
  placeholder?: string;
  /** Test ID for testing */
  testId?: string;
  /** Callback when session changes */
  onSessionChange?: (sessionId: string | null) => void;
  /** Callback when new data is discovered */
  onDataDiscovered?: (data: {
    clients?: ClientData[];
    appointments?: AppointmentData[];
    financial?: FinancialData[];
  }) => void;
  /** Accessibility enhancement options */
  accessibilityOptions?: {
    enableHighContrast?: boolean;
    enableLargeText?: boolean;
    enableReducedMotion?: boolean;
    screenReaderOptimized?: boolean;
    voiceCommands?: boolean;
  };
}

/**
 * Accessible Message Feedback Component
 * WCAG 2.1 AA+ compliant feedback interface
 */
const AccessibleMessageFeedback: React.FC<{
  messageId: string;
  sessionId: string;
  onFeedbackSubmitted: () => void;
  className?: string;
}> = ({ messageId, sessionId, onFeedbackSubmitted, className }) => {
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleQuickFeedback = (_helpful: any) => {
    // Submit quick feedback logic here
    setFeedbackSubmitted(true);
    onFeedbackSubmitted();
    
    // Announce to screen readers
    const announcement = helpful ? 'Feedback positivo enviado' : 'Feedback negativo enviado';
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 1000);
  };

  const handleDetailedFeedback = () => {
    if (rating === 0) return;
    
    // Submit detailed feedback logic here
    setShowDetailedFeedback(false);
    setRating(0);
    setComment('');
    setFeedbackSubmitted(true);
    onFeedbackSubmitted();
  };

  if (feedbackSubmitted) {
    return (
      <div 
        className={cn('flex items-center gap-2 mt-2 text-xs text-green-600', className)}
        role="status"
        aria-label="Feedback enviado com sucesso"
      >
        <span>✓ Feedback enviado</span>
      </div>
    );
  }

  return (
    <div 
      className={cn('flex items-center gap-2 mt-2', className)}
      role="group"
      aria-label="Avaliação da resposta do assistente"
    >
      <div className="flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFeedback(true)}
                className="min-h-[44px] min-w-[44px] p-2 text-muted-foreground hover:text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Marcar resposta como útil"
                type="button"
              >
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resposta útil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFeedback(false)}
                className="min-h-[44px] min-w-[44px] p-2 text-muted-foreground hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Marcar resposta como não útil"
                type="button"
              >
                <ThumbsDown className="h-4 w-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resposta não útil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dialog open={showDetailedFeedback} onOpenChange={setShowDetailedFeedback}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto text-xs text-muted-foreground hover:text-[#AC9469] focus:ring-2 focus:ring-[#AC9469] focus:ring-offset-2"
            aria-label="Abrir formulário de feedback detalhado"
          >
            Feedback Detalhado
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-md"
          aria-describedby="feedback-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Avaliar Resposta do Assistente</DialogTitle>
            <DialogDescription id="feedback-dialog-description">
              Sua avaliação nos ajuda a melhorar o atendimento e a precisão das respostas sobre dados de saúde.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="rating-input"
                className="text-sm font-medium block mb-2"
              >
                Nota (1-5 estrelas) *
              </label>
              <div 
                className="flex gap-1"
                role="radiogroup"
                aria-label="Avaliação de 1 a 5 estrelas"
                aria-required="true"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(star)}
                    className={cn(
                      "h-10 w-10 p-0 focus:ring-2 focus:ring-[#AC9469] focus:ring-offset-2",
                      rating >= star ? "text-yellow-500" : "text-muted-foreground"
                    )}
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                  >
                    ⭐
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label 
                htmlFor="comment-input"
                className="text-sm font-medium block mb-2"
              >
                Comentário (opcional)
              </label>
              <Textarea
                id="comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Como podemos melhorar as respostas do assistente?"
                className="mt-1 focus:ring-2 focus:ring-[#AC9469] focus:ring-offset-2"
                rows={3}
                aria-describedby="comment-help"
              />
              <div id="comment-help" className="text-xs text-muted-foreground mt-1">
                Opcional: Compartilhe sugestões específicas para melhorar as consultas de dados de saúde.
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDetailedFeedback}
                disabled={rating === 0}
                className="flex-1 bg-gradient-to-r from-[#AC9469] to-[#294359] hover:from-[#294359] hover:to-[#112031] focus:ring-2 focus:ring-[#AC9469] focus:ring-offset-2"
                aria-describedby={rating === 0 ? 'rating-required' : undefined}
              >
                Enviar Avaliação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDetailedFeedback(false)}
                className="focus:ring-2 focus:ring-[#AC9469] focus:ring-offset-2"
              >
                Cancelar
              </Button>
            </div>
            {rating === 0 && (
              <div id="rating-required" className="text-xs text-red-600" role="alert">
                Por favor, selecione uma avaliação antes de enviar.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Accessible Action Button Component
 * Healthcare-optimized interactive buttons with accessibility features
 */
const AccessibleActionButton: React.FC<{
  action: AgentAction;
  onExecute: (action: AgentAction) => void;
  className?: string;
}> = ({ action, onExecute, className }) => {
  const getIcon = (_iconName: any) => {
    const iconProps = { className: "h-4 w-4", 'aria-hidden': "true" as const };
    switch (iconName) {
      case 'user': return <User {...iconProps} />;
      case 'calendar': return <Calendar {...iconProps} />;
      case 'chart-bar': return <DollarSign {...iconProps} />;
      case 'download': return <Download {...iconProps} />;
      case 'refresh': return <RefreshCw {...iconProps} />;
      case 'plus': return <Plus {...iconProps} />;
      case 'help': return <MessageSquare {...iconProps} />;
      default: return <ExternalLink {...iconProps} />;
    }
  };

  const getActionDescription = (action: AgentAction): string => {
    switch (action.type) {
      case 'view_details': return 'Visualizar detalhes do item selecionado';
      case 'create_appointment': return 'Criar novo agendamento';
      case 'export_data': return 'Exportar dados em formato acessível';
      case 'navigate': return 'Navegar para página relacionada';
      case 'refresh': return 'Atualizar informações exibidas';
      default: return 'Executar ação relacionada aos dados';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={action.primary ? 'default' : 'outline'}
            size="sm"
            onClick={() => onExecute(action)}
            className={cn(
              'flex items-center gap-2 text-xs min-h-[44px] px-4',
              'focus:ring-2 focus:ring-[#AC9469] focus:ring-offset-2',
              'hover:scale-105 transition-transform duration-200',
              action.primary && 'bg-gradient-to-r from-[#AC9469] to-[#294359] hover:from-[#294359] hover:to-[#112031]',
              className
            )}
            aria-label={`${action.label}: ${getActionDescription(action)}`}
            type="button"
          >
            {action.icon && getIcon(action.icon)}
            <span>{action.label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getActionDescription(action)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Accessible Data Summary Card Component
 * Healthcare data display with full accessibility support
 */
const AccessibleDataSummaryCard: React.FC<{
  title: string;
  data: any[];
  type: 'clients' | 'appointments' | 'financial';
  summary?: any;
  testId?: string;
}> = ({ title, data, type, summary, testId }) => {
  const [expanded, setExpanded] = useState(false);
  const displayLimit = 3;
  const cardRef = useRef<HTMLDivElement>(null);

  const getTypeDescription = (type: string): string => {
    switch (type) {
      case 'clients': return 'Lista de clientes do sistema';
      case 'appointments': return 'Lista de agendamentos médicos';
      case 'financial': return 'Dados financeiros e faturamento';
      default: return 'Dados estruturados do sistema';
    }
  };

  const renderItem = (item: any, index: number) => {
    const itemId = `${testId}-item-${index}`;
    
    switch (type) {
      case 'clients':
        return (
          <div 
            key={index} 
            className="p-3 border rounded-md focus-within:ring-2 focus-within:ring-[#AC9469] focus-within:ring-offset-2"
            role="article"
            aria-labelledby={`${itemId}-name`}
            aria-describedby={`${itemId}-details`}
          >
            <div id={`${itemId}-name`} className="font-medium text-sm">{item.name}</div>
            <div id={`${itemId}-details`} className="text-xs text-muted-foreground">
              <span>Email: {item.email}</span>
              <span className="mx-2">•</span>
              <span>Status: {item.status}</span>
            </div>
          </div>
        );
      
      case 'appointments':
        return (
          <div 
            key={index} 
            className="p-3 border rounded-md focus-within:ring-2 focus-within:ring-[#AC9469] focus-within:ring-offset-2"
            role="article"
            aria-labelledby={`${itemId}-client`}
            aria-describedby={`${itemId}-details`}
          >
            <div id={`${itemId}-client`} className="font-medium text-sm">{item.clientName}</div>
            <div id={`${itemId}-details`} className="text-xs text-muted-foreground">
              <time dateTime={item.scheduledAt}>
                {formatDateTime(item.scheduledAt)}
              </time>
              <span className="mx-2">•</span>
              <span>{item.serviceName}</span>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs mt-1"
              aria-label={`Status do agendamento: ${item.status}`}
            >
              {item.status}
            </Badge>
          </div>
        );
      
      case 'financial':
        return (
          <div 
            key={index} 
            className="p-3 border rounded-md focus-within:ring-2 focus-within:ring-[#AC9469] focus-within:ring-offset-2"
            role="article"
            aria-labelledby={`${itemId}-client`}
            aria-describedby={`${itemId}-details`}
          >
            <div id={`${itemId}-client`} className="font-medium text-sm">{item.clientName}</div>
            <div id={`${itemId}-details`} className="text-xs text-muted-foreground">
              <span>{item.serviceName}</span>
              <span className="mx-2">•</span>
              <span aria-label={`Valor: ${formatCurrency(item.amount)}`}>
                {formatCurrency(item.amount)}
              </span>
            </div>
            <Badge 
              variant={item.status === 'paid' ? 'default' : 'destructive'} 
              className="text-xs mt-1"
              aria-label={`Status do pagamento: ${item.status === 'paid' ? 'Pago' : 'Pendente'}`}
            >
              {item.status === 'paid' ? 'Pago' : 'Pendente'}
            </Badge>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <Card 
      className="mt-3"
      ref={cardRef}
      role="region"
      aria-labelledby={`${testId}-title`}
      aria-describedby={`${testId}-description`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle 
            id={`${testId}-title`}
            className="text-sm font-medium"
          >
            {title}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="text-xs"
            aria-label={`Total de ${data.length} ${data.length === 1 ? 'item' : 'itens'}`}
          >
            {data.length} {data.length === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
        <CardDescription 
          id={`${testId}-description`}
          className="text-xs"
        >
          {getTypeDescription(type)}
          {summary && type === 'financial' && (
            <span 
              className="block mt-1"
              aria-label={`Total financeiro: ${formatCurrency(summary.total)}`}
            >
              Total: {formatCurrency(summary.total)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="space-y-2"
          role="list"
          aria-label={`Lista de ${data.length} ${data.length === 1 ? 'item' : 'itens'}`}
        >
          {data.slice(0, expanded ? data.length : displayLimit).map((item, index) => (
            <div key={index} role="listitem">
              {renderItem(item, index)}
            </div>
          ))}
          
          {data.length > displayLimit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpanded(!expanded);
                // Announce change to screen readers
                if (!expanded) {
                  setTimeout(() => {
                    const newItems = cardRef.current?.querySelectorAll('[role="listitem"]');
                    if (newItems && newItems.length > displayLimit) {
                      (newItems[displayLimit] as HTMLElement)?.focus();
                    }
                  }, 100);
                }
              }}
              className="w-full justify-center text-xs min-h-[44px] focus:ring-2 focus:ring-[#AC9469] focus:ring-offset-2"
              aria-expanded={expanded}
              aria-controls={`${testId}-items`}
              aria-label={expanded 
                ? 'Recolher lista, mostrar menos itens' 
                : `Expandir lista, mostrar mais ${data.length - displayLimit} itens`
              }
            >
              {expanded ? 'Ver menos' : `Ver mais ${data.length - displayLimit} itens`}
              <ChevronDown 
                className={cn("h-3 w-3 ml-1 transition-transform", expanded && "rotate-180")} 
                aria-hidden="true"
              />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export {
  AccessibleMessageFeedback,
  AccessibleActionButton,
  AccessibleDataSummaryCard,
};

export type { DataAgentChatAccessibilityProps };