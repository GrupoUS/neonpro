---
title: "AI Agent Frontend Implementation"
last_updated: 2025-09-24
form: how-to
tags: [ai-agent, frontend, implementation, database, tRPC]
related:
  - ../AGENTS.md
  - ../apis/ai-agent-api.md
  - ../architecture/frontend-architecture.md
---

# AI Agent Frontend Implementation — How-to

## Goal

Implement comprehensive frontend integration for AI agents with database system using AI SDK, KokonutUI components, and tRPC backend.

## Prerequisites

- tRPC agent router configured
- AI SDK dependencies installed
- Database access configured
- Authentication system active

## Architecture Overview

### Current State Analysis

- **Backend**: Complete tRPC agent router with 10 endpoints (`/apps/api/src/trpc/routers/agent.ts`)
- **Frontend**: Existing AI chat component (`apps/web/src/components/ai/ai-chat.tsx`)
- **UI System**: shadcn/ui + custom KokonutUI components
- **State Management**: TanStack Query + React Query
- **AI SDK**: Vercel AI SDK integration partially implemented

### Target Architecture

```
Frontend Layer
├── AI SDK Core (Vercel)
├── KokonutUI Components
├── tRPC Client Integration
└── Healthcare Compliance Layer

Backend Layer
├── tRPC Agent Router
├── Database Integration
├── RAG System
└── Audit Trail System
```

## Implementation Strategy

### Phase 1: Core Setup & Configuration

#### 1.1 Package Installation

```bash
# Install required packages
pnpm add @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic ai
pnpm add @radix-ui/react-accordion @radix-ui/react-collapsible
pnpm add framer-motion lucide-react date-fns
```

#### 1.2 Environment Configuration

```typescript
// apps/web/src/config/ai.ts
export const AI_CONFIG = {
  providers: {
    openai: {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
    },
    anthropic: {
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    },
    local: {
      baseUrl:
        process.env.NEXT_PUBLIC_LOCAL_AI_ENDPOINT || "http://localhost:8000/v1",
    },
  },
  defaults: {
    model: "gpt-4",
    temperature: 0.3,
    maxTokens: 4000,
    streaming: true,
  },
  healthcare: {
    contextEnabled: true,
    lgpdCompliance: true,
    auditEnabled: true,
  },
} as const;
```

#### 1.3 TypeScript Types

```typescript
// apps/web/src/types/ai-agent.ts
import { z } from "zod";

export const AgentTypeSchema = z.enum(["client", "financial", "appointment"]);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const AgentStatusSchema = z.enum(["active", "archived", "pending"]);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export interface AgentProvider {
  id: string;
  name: string;
  endpoint: string;
  capabilities: string[];
  healthcareOptimized: boolean;
  status: "available" | "limited" | "unavailable";
}

export interface AgentSession {
  id: string;
  userId: string;
  agentType: AgentType;
  status: AgentStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
  attachments?: any[];
  createdAt: Date;
}

export interface KnowledgeEntry {
  id: string;
  agentType: AgentType;
  title: string;
  content: string;
  source: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RAGResult {
  id: string;
  content: string;
  source: string;
  score: number;
  metadata: Record<string, any>;
}
```

### Phase 2: Backend Adapter Integration

#### 2.1 tRPC Integration Setup

```typescript
// apps/web/src/trpc/agent.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@neonpro/api";

export const agentTRPC = createTRPCReact<AppRouter>();

// Agent-specific hooks
export const useAgentSession = () => {
  return agentTRPC.agent.createSession.useMutation();
};

export const useAgentMessages = (sessionId?: string) => {
  return agentTRPC.agent.getSession.useQuery(
    { session_id: sessionId!, include_messages: true },
    { enabled: !!sessionId },
  );
};

export const useAgentSendMessage = () => {
  return agentTRPC.agent.sendMessage.useMutation();
};

export const useAgentKnowledge = () => {
  const search = agentTRPC.agent.searchKnowledge.useMutation();
  const add = agentTRPC.agent.addKnowledge.useMutation();

  return { search, add };
};
```

#### 2.2 AI Service Adapter

```typescript
// apps/web/src/services/ai/agent-service.ts
import { AI_CONFIG } from "@/config/ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { AgentType, RAGResult } from "@/types/ai-agent";

export class AgentService {
  async streamResponse(
    message: string,
    agentType: AgentType,
    sessionId: string,
    context?: any,
  ) {
    const provider = this.getProviderForAgent(agentType);

    return streamText({
      model: provider.model,
      messages: [
        {
          role: "system",
          content: this.getHealthcareContext(agentType),
        },
        ...(context?.messages || []),
        {
          role: "user",
          content: message,
        },
      ],
      temperature: AI_CONFIG.defaults.temperature,
      maxTokens: AI_CONFIG.defaults.maxTokens,
    });
  }

  async performRAGSearch(
    query: string,
    agentType: AgentType,
  ): Promise<RAGResult[]> {
    // Call tRPC endpoint for RAG search
    const response = await fetch("/api/trpc/agent.ragQuery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: "current-session",
        query,
        max_results: 10,
      }),
    });

    const data = await response.json();
    return data.result.data.results;
  }

  private getProviderForAgent(agentType: AgentType) {
    switch (agentType) {
      case "client":
        return { model: openai("gpt-4"), name: "OpenAI GPT-4" };
      case "financial":
        return {
          model: anthropic("claude-3-sonnet"),
          name: "Anthropic Claude",
        };
      default:
        return { model: openai("gpt-3.5-turbo"), name: "OpenAI GPT-3.5" };
    }
  }

  private getHealthcareContext(agentType: AgentType): string {
    const contexts = {
      client: `Você é um assistente de IA especializado em atendimento ao paciente no sistema de saúde brasileiro...`,
      financial: `Você é um assistente financeiro especializado em gestão de clínicas médicas no Brasil...`,
      appointment: `Você é um assistente de agendamento especializado em clínicas médicas brasileiras...`,
    };

    return contexts[agentType];
  }
}
```

### Phase 3: UI Component Implementation

#### 3.1 Agent Selection Component

```typescript
// apps/web/src/components/ai/agent-selector.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  Calendar,
  Bot,
  Check,
  Stethoscope
} from 'lucide-react';
import { AgentType } from '@/types/ai-agent';

interface AgentSelectorProps {
  selectedAgent?: AgentType;
  onAgentSelect: (agent: AgentType) => void;
  disabled?: boolean;
}

const AGENT_TYPES = [
  {
    type: 'client' as AgentType,
    name: 'Assistente de Pacientes',
    description: 'Atendimento e suporte para pacientes',
    icon: Users,
    color: 'bg-blue-500',
    capabilities: ['Agendamento', 'Triagem', 'Orientação'],
  },
  {
    type: 'financial' as AgentType,
    name: 'Assistente Financeiro',
    description: 'Gestão financeira e cobrança',
    icon: DollarSign,
    color: 'bg-green-500',
    capabilities: ['Faturamento', 'Pagamentos', 'Relatórios'],
  },
  {
    type: 'appointment' as AgentType,
    name: 'Assistente de Agendamento',
    description: 'Gerenciamento de consultas',
    icon: Calendar,
    color: 'bg-purple-500',
    capabilities: ['Agendamento', 'Confirmação', 'Lembretes'],
  },
];

export function AgentSelector({
  selectedAgent,
  onAgentSelect,
  disabled
}: AgentSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {AGENT_TYPES.map((agent) => {
        const Icon = agent.icon;
        const isSelected = selectedAgent === agent.type;

        return (
          <Card
            key={agent.type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => !disabled && onAgentSelect(agent.type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {agent.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Otimizado para saúde</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>

                <Button
                  size="sm"
                  className="w-full mt-3"
                  variant={isSelected ? "default" : "outline"}
                  disabled={disabled}
                >
                  {isSelected ? 'Selecionado' : 'Selecionar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

#### 3.2 Enhanced Chat Interface

```typescript
// apps/web/src/components/ai/agent-chat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Bot,
  User,
  Paperclip,
  Mic,
  Settings,
  Clock,
  FileText,
  Database
} from 'lucide-react';
import { useAgentSession, useAgentSendMessage, useAgentMessages } from '@/trpc/agent';
import { AgentService } from '@/services/ai/agent-service';
import { AgentType, AgentMessage } from '@/types/ai-agent';
import { AgentSelector } from './agent-selector';
import { formatDateTime } from '@/utils/brazilian-formatters';

interface AgentChatProps {
  patientId?: string;
  healthcareProfessionalId?: string;
}

export function AgentChat({
  patientId,
  healthcareProfessionalId
}: AgentChatProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('client');
  const [sessionId, setSessionId] = useState<string>();
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentService = new AgentService();

  const createSession = useAgentSession();
  const sendMessage = useAgentSendMessage();
  const { data: sessionData } = useAgentMessages(sessionId);

  const messages = sessionData?.data?.messages || [];

  // Create session when agent is selected
  useEffect(() => {
    if (selectedAgent && !sessionId) {
      createSession.mutate(
        {
          agent_type: selectedAgent,
          initial_context: patientId ? 'patient_context' : 'general',
          metadata: {
            patientId,
            healthcareProfessionalId,
          },
        },
        {
          onSuccess: (data) => {
            setSessionId(data.data.id);
          },
        }
      );
    }
  }, [selectedAgent, sessionId, patientId, healthcareProfessionalId, createSession]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      sessionId,
      role: 'user',
      content: message.trim(),
      createdAt: new Date(),
    };

    // Add user message immediately
    // (This would be handled by React Query optimistic updates)

    setMessage('');
    setIsStreaming(true);

    try {
      // Perform RAG search for context
      const ragResults = await agentService.performRAGSearch(
        message.trim(),
        selectedAgent
      );

      // Stream AI response
      const stream = await agentService.streamResponse(
        message.trim(),
        selectedAgent,
        sessionId,
        {
          messages,
          ragResults,
          patientId,
        }
      );

      // Process stream and update UI
      let aiContent = '';
      for await (const chunk of stream.textStream) {
        aiContent += chunk;
        // Update UI with streaming content
      }

      // Save AI response via tRPC
      sendMessage.mutate({
        session_id: sessionId,
        role: 'user',
        content: message.trim(),
        metadata: {
          ragResults: ragResults.length,
          provider: 'AI SDK',
        },
      });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Agent Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Selecionar Assistente de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgentSelector
            selectedAgent={selectedAgent}
            onAgentSelect={setSelectedAgent}
            disabled={!!sessionId}
          />
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">
                  Conversa com Assistente
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {selectedAgent === 'client' ? 'Pacientes' :
                     selectedAgent === 'financial' ? 'Financeiro' : 'Agendamento'}
                  </Badge>
                  {sessionId && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Olá! Como posso ajudar?
                  </p>
                  <p className="text-sm">
                    Sou seu assistente de IA especializado em saúde.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10
                                   flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    <div className="flex items-center justify-between mt-2
                                text-xs opacity-70">
                      <span>{formatDateTime(msg.createdAt)}</span>
                      {msg.metadata?.provider && (
                        <Badge variant="outline" className="text-xs">
                          {msg.metadata.provider}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary
                                   flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isStreaming && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10
                                 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full
                                  animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full
                                  animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full
                                  animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={!sessionId || isStreaming}
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="sm"
                disabled={!sessionId || isStreaming}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={!sessionId || isStreaming}
              >
                <Mic className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !sessionId || isStreaming}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Compliance Notice */}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              <span>
                Conforme LGPD • Conversa armazenada com segurança •
                Dados criptografados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3.3 Knowledge Base Management

```typescript
// apps/web/src/components/ai/knowledge-base.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Search,
  BookOpen,
  Tag,
  Calendar,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { useAgentKnowledge } from '@/trpc/agent';
import { AgentType, KnowledgeEntry } from '@/types/ai-agent';
import { formatDateTime } from '@/utils/brazilian-formatters';

export function KnowledgeBaseManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AgentType>('client');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { search, add } = useAgentKnowledge();
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    source: '',
    tags: [] as string[],
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      await search.mutateAsync({
        agent_type: selectedType,
        query: searchQuery,
        limit: 20,
      });
    } catch (error) {
      console.error('Error searching knowledge base:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.title || !newEntry.content) return;

    try {
      await add.mutateAsync({
        agent_type: selectedType,
        title: newEntry.title,
        content: newEntry.content,
        source: newEntry.source || 'Manual',
        tags: newEntry.tags,
        metadata: {
          createdBy: 'user',
          createdAt: new Date().toISOString(),
        },
      });

      setNewEntry({ title: '', content: '', source: '', tags: [] });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding knowledge entry:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Base de Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar conhecimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Select value={selectedType} onValueChange={(value: AgentType) => setSelectedType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Pacientes</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="appointment">Agendamento</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Conhecimento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Título"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  />

                  <Textarea
                    placeholder="Conteúdo"
                    rows={6}
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  />

                  <Input
                    placeholder="Fonte"
                    value={newEntry.source}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, source: e.target.value }))}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddEntry}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {search.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Resultados da Busca ({search.data.data?.total_matches || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {search.data.data?.results.map((entry: KnowledgeEntry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{entry.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {entry.agent_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(entry.created_at)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {entry.content.substring(0, 200)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {entry.source}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Phase 4: Healthcare Compliance & Security

#### 4.1 LGPD Compliance Layer

```typescript
// apps/web/src/compliance/ai-compliance.ts
export class AIComplianceManager {
  static sanitizeDataForAI(data: any, agentType: string): any {
    const sensitiveFields = [
      "fullName",
      "cpf",
      "rg",
      "email",
      "phonePrimary",
      "phoneSecondary",
      "addressLine1",
      "addressLine2",
      "passportNumber",
    ];

    const sanitized = { ...data };

    // Remove direct identifiers
    sensitiveFields.forEach((field) => {
      delete sanitized[field];
    });

    // Generalize age
    if (sanitized.birthDate) {
      const birthYear = new Date(sanitized.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      sanitized.ageGroup = Math.floor((currentYear - birthYear) / 10) * 10;
      delete sanitized.birthDate;
    }

    return sanitized;
  }

  static async logAIInteraction(
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    userId: string,
    metadata?: any,
  ) {
    // Send to audit trail
    await fetch("/api/audit/ai-interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        userMessage,
        aiResponse,
        userId,
        metadata,
        timestamp: new Date().toISOString(),
        compliance: {
          lgpd: true,
          dataRetention: 30, // days
          encryption: true,
        },
      }),
    });
  }

  static validateDataSharing(
    data: any,
    userPermissions: string[],
    agentType: string,
  ): { valid: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Check if user has permissions for this agent type
    const requiredPermissions = {
      client: ["patient:read"],
      financial: ["billing:read"],
      appointment: ["appointment:read"],
    };

    const required =
      requiredPermissions[agentType as keyof typeof requiredPermissions] || [];
    const hasPermission = required.some((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      reasons.push("Insufficient permissions for agent type");
    }

    // Validate data sensitivity
    if (data.includes("cpf") || data.includes("rg")) {
      reasons.push("Direct identifiers cannot be shared");
    }

    return {
      valid: reasons.length === 0,
      reasons,
    };
  }
}
```

#### 4.2 Security Middleware

```typescript
// apps/web/src/middleware/ai-security.ts
import { NextRequest, NextResponse } from "next/server";

export function aiSecurityMiddleware(request: NextRequest) {
  // Rate limiting check
  const clientIp = request.ip || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Validate request size
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    // 1MB limit
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  // Check for suspicious patterns
  const body = request.body?.toString() || "";
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /eval\(/i,
    /document\./i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(body)) {
      return NextResponse.json(
        { error: "Suspicious content detected" },
        { status: 400 },
      );
    }
  }

  return NextResponse.next();
}
```

### Phase 5: Testing & Deployment

#### 5.1 Test Suite

```typescript
// apps/web/src/__tests__/ai/agent-chat.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentChat } from '@/components/ai/agent-chat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock tRPC
jest.mock('@/trpc/agent', () => ({
  useAgentSession: () => ({
    mutate: jest.fn(),
  }),
  useAgentMessages: () => ({
    data: { data: { messages: [] } },
  }),
  useAgentSendMessage: () => ({
    mutate: jest.fn(),
  }),
}));

describe('AgentChat Component', () => {
  const queryClient = new QueryClient();

  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AgentChat patientId="test-patient" />
      </QueryClientProvider>
    );
  };

  test('renders agent selection', () => {
    renderComponent();
    expect(screen.getByText('Selecionar Assistente de IA')).toBeInTheDocument();
    expect(screen.getByText('Assistente de Pacientes')).toBeInTheDocument();
  });

  test('allows agent selection', () => {
    renderComponent();
    const clientAgent = screen.getByText('Assistente de Pacientes');
    fireEvent.click(clientAgent);

    expect(screen.getByText('Selecionado')).toBeInTheDocument();
  });

  test('handles message sending', async () => {
    renderComponent();

    // Select agent first
    fireEvent.click(screen.getByText('Assistente de Pacientes'));

    // Type and send message
    const input = screen.getByPlaceholderText('Digite sua mensagem...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  test('shows compliance notice', () => {
    renderComponent();
    expect(screen.getByText(/Conforme LGPD/)).toBeInTheDocument();
  });
});
```

#### 5.2 Performance Monitoring

```typescript
// apps/web/src/monitoring/ai-performance.ts
export class AIPerformanceMonitor {
  static metrics = {
    responseTimes: [] as number[],
    errorRates: [] as number[],
    tokenUsage: [] as number[],
  };

  static trackResponseTime(responseTime: number) {
    this.metrics.responseTimes.push(responseTime);

    // Keep only last 100 measurements
    if (this.metrics.responseTimes.length > 100) {
      this.metrics.responseTimes.shift();
    }
  }

  static trackError() {
    this.metrics.errorRates.push(1);

    // Keep only last 100 measurements
    if (this.metrics.errorRates.length > 100) {
      this.metrics.errorRates.shift();
    }
  }

  static getAverageResponseTime(): number {
    if (this.metrics.responseTimes.length === 0) return 0;

    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    return sum / this.metrics.responseTimes.length;
  }

  static getErrorRate(): number {
    if (this.metrics.errorRates.length === 0) return 0;

    const errors = this.metrics.errorRates.reduce((a, b) => a + b, 0);
    return (errors / this.metrics.errorRates.length) * 100;
  }

  static generateReport() {
    return {
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      totalRequests: this.metrics.responseTimes.length,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## Implementation Checklist

### Phase 1: Core Setup

- [ ] Install required packages
- [ ] Configure environment variables
- [ ] Set up TypeScript types
- [ ] Create AI configuration

### Phase 2: Backend Integration

- [ ] Implement tRPC hooks
- [ ] Create AI service adapter
- [ ] Set up RAG integration
- [ ] Implement streaming responses

### Phase 3: UI Components

- [ ] Build agent selector
- [ ] Create enhanced chat interface
- [ ] Implement knowledge base manager
- [ ] Add Portuguese healthcare context

### Phase 4: Compliance & Security

- [ ] Implement LGPD compliance
- [ ] Add security middleware
- [ ] Set up audit logging
- [ ] Validate data sharing

### Phase 5: Testing & Deployment

- [ ] Write comprehensive tests
- [ ] Set up performance monitoring
- [ ] Create deployment pipeline
- [ ] Document API endpoints

## Deployment Strategy

### Environment Setup

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

### Feature Flags

```typescript
const AI_FEATURES = {
  enableAgentChat: process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === "true",
  enableKnowledgeBase: process.env.NEXT_PUBLIC_ENABLE_KB === "true",
  enableVoiceInput: process.env.NEXT_PUBLIC_ENABLE_VOICE === "true",
  enableFileAttachments: process.env.NEXT_PUBLIC_ENABLE_ATTACHMENTS === "true",
};
```

### Monitoring & Analytics

- Response time tracking
- Error rate monitoring
- User satisfaction metrics
- Usage analytics per agent type

## Success Metrics

### Technical Metrics

- Response time < 2 seconds
- Error rate < 1%
- Uptime > 99.9%
- Mobile performance score > 90

### User Experience Metrics

- User satisfaction > 4.5/5
- Task completion rate > 85%
- Session duration optimization
- Mobile usage compatibility

### Compliance Metrics

- LGPD compliance 100%
- Data encryption 100%
- Audit trail completeness
- Security vulnerability resolution

## Conclusion

This implementation plan provides a comprehensive approach to integrating AI agents with the database system while maintaining healthcare compliance, security, and user experience standards. The hybrid approach using AI SDK and KokonutUI components ensures flexibility, maintainability, and scalability for the Brazilian healthcare market.
