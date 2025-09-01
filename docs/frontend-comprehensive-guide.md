# NeonPro Frontend Development Guide - Version: 3.0.0

## Overview

**NeonPro Frontend Development Guide** provides comprehensive specifications for building the **AI-First Brazilian Aesthetic Clinic Platform**. This guide consolidates design guidelines, technical architecture, and UI/UX specifications into a single source of truth for frontend development within our Turborepo monorepo architecture.

**Target Audience**: Frontend developers, UI/UX designers, and technical leads working on the NeonPro aesthetic clinic platform

**Platform Focus**: Turborepo monorepo with Next.js 15 + React 19 frontend, Hono.dev backend API, Portuguese AI chat integration, and Brazilian aesthetic clinic compliance (LGPD/ANVISA).

**Core Mission**: Deliver a production-ready frontend that transforms Brazilian aesthetic clinic operations through Portuguese AI chat, Anti-No-Show predictive engine, and intelligent automation while maintaining regulatory compliance and exceptional user experience.

**Architecture Score**: 87/100 with ongoing optimizations (24 packages being reduced to 22 for better maintainability)

## Prerequisites

### Technical Requirements
- **Node.js 20+** with pnpm package manager (required for Turborepo)
- **TypeScript 5.3+** with strict mode enabled
- **Turborepo 2.x** understanding for monorepo development
- **Next.js 15** with App Router and React Server Components
- **Hono.dev 4.x** knowledge for backend API integration
- **Basic understanding** of Brazilian aesthetic clinic regulations (LGPD, ANVISA)

### Knowledge Prerequisites  
- React 19 fundamentals and hooks
- TypeScript with aesthetic clinic data modeling
- Turborepo workspace and package management
- Responsive design and accessibility principles
- Portuguese localization for aesthetic clinic applications
- Brazilian aesthetic clinic business processes

### Development Environment
- **IDE**: VS Code with Turborepo extension, TypeScript, ESLint, Prettier
- **Package Manager**: pnpm (required - not npm, yarn, or bun)
- **Monorepo**: Turborepo workspace with 3 apps + 24 packages architecture
- **Design Tools**: Figma access for TweakCN NEONPRO design system
- **Database**: Supabase PostgreSQL with Real-time subscriptions
- **AI Integration**: OpenAI API for Portuguese chat and predictive analytics

## Quick Start

### Turborepo Monorepo Setup

```bash
# 1. Clone NeonPro Turborepo (Brazilian Aesthetic Clinic Platform)
git clone <neonpro-repo-url>
cd neonpro
pnpm install  # Required: pnpm for Turborepo

# 2. Architecture Overview
apps/
├── web/          # Next.js 15 Frontend Application
├── api/          # Hono.dev Backend API  
└── docs/         # Documentation Site

packages/ (24 packages - being optimized to 22)
├── ui/                    # shadcn/ui + aesthetic clinic components
├── brazilian-healthcare-ui/ # Brazilian aesthetic UI (consolidating)
├── database/              # Supabase + Prisma integration
└── ... (21 more packages)

# 3. Start Development Environment
pnpm dev          # Start all apps
pnpm dev:web      # Start frontend only (localhost:3000)
pnpm dev:api      # Start Hono.dev API (localhost:3004)

# 4. Install New Aesthetic Clinic Dependencies
pnpm add @neonpro/ui @neonpro/types @neonpro/database
pnpm add ai @ai-sdk/openai  # Portuguese AI chat
pnpm add @supabase/supabase-js lucide-react
```

## Core Architecture

### Turborepo Monorepo Structure (Current: 24 packages → Optimizing to: 22)

```yaml
ARCHITECTURE_OVERVIEW:
  monorepo_type: "Turborepo 2.x with pnpm workspaces"
  package_manager: "pnpm (required - not npm/yarn/bun)"
  architecture_score: "87/100 (Good with optimization opportunities)"
  
  applications: 
    count: 3
    structure:
      - "apps/web (Next.js 15 Frontend)"
      - "apps/api (Hono.dev Backend)"  
      - "apps/docs (Documentation)"
      
  packages:
    current_count: 24
    optimizing_to: 22
    categories:
      - "UI & Components (4 packages)"
      - "Data & Types (3 packages)"
      - "Core Services (4 packages)"
      - "Healthcare & Compliance (3 packages)"
      - "AI & Intelligence (2 packages)"
      - "Monitoring & Performance (2 packages)"
      - "Infrastructure (3 packages)"
      - "Enterprise (2 packages)"
```

### Technology Stack (AI-First Aesthetic Platform)

```yaml
FRONTEND_STACK:
  framework: "Next.js 15 with App Router"
  ui_library: "React 19 with Server Components"
  styling: "Tailwind CSS 3.x + shadcn/ui"
  state_management: "TanStack Query 5.x + Zustand"
  ai_integration: "Vercel AI SDK 5.0 + OpenAI GPT-4"
  forms: "React Hook Form + Zod validation"
  
BACKEND_STACK:
  api_framework: "Hono.dev 4.x (Ultra-fast web framework)"
  database: "Supabase PostgreSQL 17 + pgvector"
  real_time: "Supabase Real-time subscriptions"
  ai_providers: "OpenAI GPT-4 + Anthropic Claude (Portuguese optimized)"
  deployment: "Vercel Edge Functions"
  
AESTHETIC_CLINIC_FEATURES:
  ai_chat: "Portuguese conversational AI for patient communication"
  no_show_engine: "Predictive analytics to prevent appointment cancellations"
  compliance: "LGPD + ANVISA automation (Brazilian regulations)"
  scheduling: "Smart appointment optimization"
```

### Core Aesthetic Clinic Components

```typescript
// components/aesthetic-clinic/patient-card.tsx - Brazilian Aesthetic Clinic Focused
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Sparkles } from "lucide-react";

interface AestheticPatientCardProps {
  clientId: string;
  name: string;
  cpf: string;
  lastProcedure: {
    name: string;
    date: Date;
  };
  nextAppointment?: Date;
  lgpdCompliant: boolean;
  noShowRisk?: 'low' | 'medium' | 'high';
}

export function AestheticPatientCard({ 
  clientId, 
  name, 
  cpf,
  lastProcedure, 
  nextAppointment,
  lgpdCompliant,
  noShowRisk = 'low'
}: AestheticPatientCardProps) {
  return (
    <Card className="aesthetic-client-card transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-client-name">{name}</CardTitle>
            <p className="text-xs text-muted-foreground">CPF: {cpf}</p>
          </div>
          <div className="flex gap-2">
            {lgpdCompliant && (
              <Badge variant="outline" className="border-success text-success">
                <Shield className="h-3 w-3 mr-1" />
                LGPD
              </Badge>
            )}
            {noShowRisk === 'high' && (
              <Badge variant="destructive" className="text-xs">
                Risco Alto
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Último: {lastProcedure.name}</span>
          <span className="text-muted-foreground">
            {lastProcedure.date.toLocaleDateString('pt-BR')}
          </span>
        </div>
        {nextAppointment && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Próximo: {nextAppointment.toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Portuguese AI Chat Integration (Core Feature)

```typescript
// components/ai/portuguese-aesthetic-chat.tsx - Core NeonPro Feature
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, User, Sparkles } from "lucide-react";

export function PortugueseAestheticChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat",
    initialMessages: [{
      id: "welcome",
      role: "assistant", 
      content: "Olá! Sou a assistente virtual da clínica. Posso ajudar com:\n• Agendamento de procedimentos\n• Dúvidas sobre tratamentos estéticos\n• Informações sobre cuidados pós-procedimento\n• Reagendamento ou cancelamento\n\nComo posso te ajudar hoje?"
    }],
    body: {
      language: "pt-BR",
      context: "aesthetic-clinic",
      features: ["scheduling", "procedures", "aftercare"]
    }
  });

  return (
    <div className="aesthetic-chat-container max-w-md mx-auto border rounded-lg p-4 bg-background">
      <div className="chat-header flex items-center gap-2 mb-4 pb-3 border-b">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Assistente Virtual</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          <Sparkles className="h-3 w-3 mr-1" />
          IA em Português
        </Badge>
      </div>
      
      <div className="messages space-y-3 mb-4 h-64 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`message flex gap-2 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            <div className={`message-bubble p-3 rounded-lg max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground'
            }`}>
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <Sparkles className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                )}
                {message.role === 'user' && (
                  <User className="h-4 w-4 mt-0.5 text-primary-foreground flex-shrink-0" />
                )}
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "..." : "Enviar"}
        </Button>
      </form>
    </div>
  );
}
```

### Anti-No-Show Predictive Engine (Key Differentiator)

```typescript
// components/ai/anti-no-show-engine.tsx - NeonPro's Core Innovation
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, MessageSquare, Phone } from "lucide-react";

interface NoShowPrediction {
  appointmentId: string;
  clientName: string;
  procedure: string;
  appointmentDate: Date;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  interventions: {
    type: 'sms' | 'whatsapp' | 'call' | 'email';
    message: string;
    timing: string;
  }[];
  confidence: number;
}

export function AntiNoShowEngine({ appointments }: { appointments: any[] }) {
  const [predictions, setPredictions] = useState<NoShowPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  const runPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/anti-no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointments })
      });
      
      const results = await response.json();
      setPredictions(results);
    } catch (error) {
      console.error('Erro na análise preditiva:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeIntervention = async (appointmentId: string, intervention: any) => {
    try {
      await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, intervention })
      });
      
      // Update prediction status
      setPredictions(prev => prev.map(p => 
        p.appointmentId === appointmentId 
          ? { ...p, riskScore: Math.max(0, p.riskScore - 20) }
          : p
      ));
    } catch (error) {
      console.error('Erro ao executar intervenção:', error);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="anti-no-show-dashboard space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Engine Anti-No-Show
              <Badge variant="outline" className="ml-2">
                IA Preditiva
              </Badge>
            </CardTitle>
            <Button onClick={runPredictions} disabled={loading}>
              {loading ? "Analisando..." : "Executar Análise"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {predictions.map((prediction) => (
              <Card key={prediction.appointmentId} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{prediction.clientName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {prediction.procedure} - {prediction.appointmentDate.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskColor(prediction.riskLevel)}>
                        {prediction.riskScore}% risco
                      </Badge>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Fatores de Risco:</p>
                      <div className="flex flex-wrap gap-1">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Intervenções Sugeridas:</p>
                      <div className="space-y-2">
                        {prediction.interventions.map((intervention, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              {intervention.type === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                              {intervention.type === 'call' && <Phone className="h-4 w-4" />}
                              <span className="capitalize">{intervention.type}</span>
                            </div>
                            <span className="text-muted-foreground">em {intervention.timing}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => executeIntervention(prediction.appointmentId, intervention)}
                            >
                              Executar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      Confiança: {prediction.confidence}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Core Architecture

### Technology Stack

```typescript
// Complete frontend stack specification
const frontendStack = {
  // Core Framework
  framework: "Next.js 15",
  runtime: "React 19",
  language: "TypeScript 5.3+",

  // Styling & Components
  styling: "Tailwind CSS 3.4+",
  theme: "TweakCN NEONPRO",
  components: "shadcn/ui v4",
  icons: "Lucide React",

  // State & Data
  database: "Supabase PostgreSQL",
  realtime: "Supabase Realtime",
  stateManagement: "Zustand + TanStack Query",
  forms: "React Hook Form + Zod",

  // AI & Integrations
  ai: "Vercel AI SDK + OpenAI GPT-4",
  communication: "WhatsApp Business API",
  payments: "Brazilian payment systems (PIX)",

  // Quality & Performance
  testing: "Vitest + Testing Library + Playwright",
  monitoring: "Sentry + Web Vitals",
  deployment: "Vercel with Edge Functions",

  // Compliance & Accessibility
  accessibility: "WCAG 2.1 AA+ with Radix primitives",
  compliance: "LGPD/ANVISA/CFM automated validation",
  localization: "Portuguese-first with cultural optimization"
};
```

### Project Structure

```
apps/web/                           # Next.js 15 Application
├── app/                            # App Router (Server Components)
│   ├── layout.tsx                  # Root layout with TweakCN theme
│   ├── globals.css                 # TweakCN NEONPRO color system
│   ├── (dashboard)/                # Dashboard routes
│   ├── (patients)/                 # Patient management
│   ├── (appointments)/             # Scheduling system
│   └── api/                        # API routes
│
├── components/                     # Component Library
│   ├── ui/                         # shadcn/ui base components
│   ├── healthcare/                 # Healthcare-specific components
│   │   ├── patient-card.tsx
│   │   ├── appointment-scheduler.tsx
│   │   └── compliance-indicator.tsx
│   ├── ai/                         # AI interaction components
│   │   ├── universal-chat.tsx
│   │   ├── risk-predictor.tsx
│   │   └── behavioral-insights.tsx
│   └── layout/                     # Navigation and layout
│
├── lib/                            # Utilities and Configuration
│   ├── utils.ts                    # Utility functions
│   ├── supabase.ts                 # Database client
│   ├── ai.ts                       # OpenAI configuration
│   └── compliance/                 # LGPD/ANVISA utilities
│
└── styles/                         # Global Styles
    └── globals.css                 # TweakCN theme + custom variables
```

### Component Architecture

**Server vs Client Components Strategy**:
- **Server Components**: Default for static content, data display, initial page loads
- **Client Components**: Interactive features, AI chat, real-time updates, forms

```typescript
// Server Component Example (Default)
export default async function PatientsPage() {
  const patients = await getPatients(); // Server-side data fetching

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pacientes</h1>
      {patients.map(patient => (
        <PatientCard key={patient.id} {...patient} />
      ))}
    </div>
  );
}

// Client Component Example (Interactive)
"use client";
export function InteractiveScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="scheduler-container">
      {/* Interactive calendar component */}
    </div>
  );
}
```

## Design System & Components

### TweakCN NEONPRO Theme

The **TweakCN NEONPRO** design system provides a healthcare-optimized color palette and component framework built on shadcn/ui, specifically designed for Brazilian aesthetic clinics.

#### Color System (Healthcare-Focused)

```css
/* TweakCN NEONPRO Healthcare Theme */
:root {
  /* === PRIMARY COLORS === */
  --background: 252 252 252;           /* #fcfcfc - Ultra-clean medical white */
  --foreground: 23 23 23;              /* #171717 - High contrast text */
  --primary: 114 227 173;              /* #72e3ad - NEONPRO signature green */
  --primary-foreground: 30 39 35;      /* #1e2723 - Dark green contrast */

  /* === HEALTHCARE STATES === */
  --success: 16 185 129;               /* #10b981 - Treatment success */
  --warning: 245 158 11;               /* #f59e0b - Attention needed */
  --destructive: 202 50 20;            /* #ca3214 - Critical/emergency */

  /* === BRAZILIAN COMPLIANCE === */
  --lgpd-compliant: 5 150 105;         /* #059669 - LGPD compliance */
  --anvisa-validated: 59 130 246;      /* #3b82f6 - ANVISA approval */
  --cfm-certified: 139 92 246;         /* #8b5cf6 - CFM certification */

  /* === UI COMPONENTS === */
  --card: 252 252 252;                 /* #fcfcfc - Card backgrounds */
  --border: 223 223 223;               /* #dfdfdf - Subtle borders */
  --input: 246 246 246;                /* #f6f6f6 - Input backgrounds */
  --ring: 114 227 173;                 /* #72e3ad - Focus rings */
  --muted: 237 237 237;                /* #ededed - Muted backgrounds */
  --muted-foreground: 32 32 32;        /* #202020 - Muted text */
}

/* Dark mode support for healthcare environments */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 9 9 11;              /* #09090b - Dark background */
    --foreground: 250 250 250;          /* #fafafa - Light text */
    --card: 24 24 27;                   /* #18181b - Dark cards */
    --primary: 114 227 173;             /* Keep NEONPRO green */
    --border: 39 39 42;                 /* #27272a - Dark borders */
  }
}
```

#### Typography (Portuguese-Optimized)

```css
/* Healthcare Typography System */
:root {
  --font-sans: "Inter", sans-serif;                    /* Primary UI font */
  --font-serif: "Lora", serif;                         /* Medical reports */
  --font-mono: "JetBrains Mono", monospace;            /* Technical data */
}

/* Portuguese text optimization */
.text-patient-name {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.text-medical-data {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
}

.text-compliance {
  font-size: 0.75rem;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}
```

### Essential Healthcare Components

#### Patient Information Card

```typescript
// components/healthcare/patient-info-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Shield, User } from "lucide-react";

interface PatientInfoCardProps {
  patient: {
    id: string;
    name: string;
    cpf: string;              // Masked for privacy
    lastVisit: Date;
    nextAppointment?: Date;
    treatmentPlan: string;
  };
  lgpdCompliant: boolean;
  accessLevel: 'full' | 'limited' | 'emergency';
}

export function PatientInfoCard({ patient, lgpdCompliant, accessLevel }: PatientInfoCardProps) {
  return (
    <Card className="patient-card hover:shadow-md transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-patient-name">{patient.name}</CardTitle>
              <p className="text-medical-data text-muted-foreground">
                CPF: {patient.cpf}
              </p>
            </div>
          </div>
          {lgpdCompliant && (
            <Badge variant="outline" className="border-lgpd-compliant text-success">
              <Shield className="h-3 w-3 mr-1" />
              LGPD
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Última consulta: {patient.lastVisit.toLocaleDateString('pt-BR')}</span>
        </div>
        {patient.nextAppointment && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Próxima consulta: {patient.nextAppointment.toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        <div className="mt-4 p-3 bg-muted/30 rounded-md">
          <p className="text-sm">
            <strong>Plano de Tratamento:</strong> {patient.treatmentPlan}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Compliance Status Indicator

```typescript
// components/healthcare/compliance-status.tsx
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

interface ComplianceStatusProps {
  lgpd: boolean;
  anvisa: boolean;
  cfm: boolean;
  showDetails?: boolean;
}

export function ComplianceStatus({ lgpd, anvisa, cfm, showDetails = false }: ComplianceStatusProps) {
  const getStatusIcon = (status: boolean) =>
    status ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;

  const getStatusVariant = (status: boolean) =>
    status ? "default" : "destructive";

  if (!showDetails) {
    const allCompliant = lgpd && anvisa && cfm;
    return (
      <Badge variant={getStatusVariant(allCompliant)} className="gap-1">
        <Shield className="h-3 w-3" />
        {allCompliant ? "Conforme" : "Atenção"}
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={getStatusVariant(lgpd)} className="gap-1">
        {getStatusIcon(lgpd)}
        LGPD
      </Badge>
      <Badge variant={getStatusVariant(anvisa)} className="gap-1">
        {getStatusIcon(anvisa)}
        ANVISA
      </Badge>
      <Badge variant={getStatusVariant(cfm)} className="gap-1">
        {getStatusIcon(cfm)}
        CFM
      </Badge>
    </div>
  );
}
```

#### Appointment Scheduler

```typescript
// components/healthcare/appointment-scheduler.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, AlertCircle } from "lucide-react";

interface AppointmentSlot {
  time: string;
  available: boolean;
  professional: string;
  noShowRisk?: number;           // AI-predicted risk score
}

interface AppointmentSchedulerProps {
  availableSlots: AppointmentSlot[];
  onScheduleAppointment: (date: Date, time: string) => void;
}

export function AppointmentScheduler({ availableSlots, onScheduleAppointment }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const getRiskBadge = (risk?: number) => {
    if (!risk) return null;

    if (risk > 70) return <Badge variant="destructive" className="text-xs">Alto Risco</Badge>;
    if (risk > 40) return <Badge variant="secondary" className="text-xs">Médio Risco</Badge>;
    return <Badge variant="default" className="text-xs">Baixo Risco</Badge>;
  };

  return (
    <Card className="appointment-scheduler">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Agendar Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Selecione a Data</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>

          <div>
            <h3 className="font-medium mb-3">Horários Disponíveis</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTime === slot.time
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{slot.time}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {slot.professional}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getRiskBadge(slot.noShowRisk)}
                    {!slot.available && (
                      <Badge variant="secondary">Ocupado</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedDate && selectedTime && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => onScheduleAppointment(selectedDate, selectedTime)}
              className="w-full"
            >
              Confirmar Agendamento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## AI-Enhanced Features

### Universal AI Chat System

The **Universal AI Chat** provides intelligent conversation in Portuguese for both patients and staff, with context-aware responses and seamless human handoff capabilities.

#### External Patient Chat Widget

```typescript
// components/ai/patient-chat-widget.tsx
"use client";

import { useState, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Mic, Send, Phone } from "lucide-react";

interface PatientChatWidgetProps {
  patientId?: string;
  clinicInfo: {
    name: string;
    hours: string;
    phone: string;
  };
}

export function PatientChatWidget({ patientId, clinicInfo }: PatientChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/patient-chat",
    body: { patientId, clinicContext: clinicInfo },
    initialMessages: [{
      id: "welcome",
      role: "assistant",
      content: `Olá! Sou o assistente da ${clinicInfo.name}. Como posso ajudar você hoje? Posso responder sobre tratamentos, agendar consultas ou tirar dúvidas.`
    }]
  });

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleInputChange({ target: { value: transcript } } as any);
      };

      recognition.start();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            Assistente {clinicInfo.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 max-w-[80%] ${
                message.role === 'user' ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Anti-No-Show Predictive Engine

```typescript
import { Brain, TrendingUp, Clock, AlertTriangle } from "lucide-react";

interface NoShowPrediction {
  patientId: string;
  appointmentId: string;
  riskScore: number;
  factors: string[];
  suggestedActions: string[];
  confidence: number;
}

export function NoShowPredictor({ appointment, onActionTaken }: NoShowPredictorProps) {
  const [prediction, setPrediction] = useState<NoShowPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzePrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/no-show-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id })
      });

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Prediction analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-warning/20 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Brain className="h-4 w-4 text-warning" />
          Análise Anti-No-Show
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {prediction && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risco de Falta:</span>
              <Badge variant={prediction.riskScore > 70 ? "destructive" :
                             prediction.riskScore > 40 ? "secondary" : "default"}>
                {prediction.riskScore}%
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Confiança: {prediction.confidence}%</p>
              <p>Fatores: {prediction.factors.join(', ')}</p>
            </div>

            <div className="space-y-1">
              {prediction.suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => onActionTaken(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={analyzePrediction}
          disabled={loading}
          size="sm"
          className="w-full"
        >
          {loading ? 'Analisando...' : 'Analisar Risco'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Compliance Automation Dashboard

```typescript
import { Shield, CheckCircle, AlertCircle, Clock, FileText } from "lucide-react";

export function ComplianceAutomation({ clinicId }: { clinicId: string }) {
  const [complianceStatus, setComplianceStatus] = useState({
    lgpd: { status: 'compliant', lastCheck: '2024-01-15', score: 98 },
    anvisa: { status: 'warning', lastCheck: '2024-01-10', score: 85 },
    cfm: { status: 'compliant', lastCheck: '2024-01-12', score: 95 }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Automação de Compliance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitoramento automático de conformidade regulatória
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {Object.entries(complianceStatus).map(([key, data]) => (
          <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(data.status)}
              <div>
                <p className="font-medium text-sm">{key.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">
                  Última verificação: {data.lastCheck}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{data.score}%</p>
              <Badge variant={data.status === 'compliant' ? 'default' :
                              data.status === 'warning' ? 'secondary' : 'destructive'}>
                {data.status}
              </Badge>
            </div>
          </div>
        ))}

        <Button className="w-full mt-4" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório de Compliance
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Accessibility & Compliance

### WCAG 2.1 AA+ Implementation

Our Brazilian aesthetic clinic platform strictly adheres to WCAG 2.1 AA+ accessibility standards:

#### Core Accessibility Features

- **Keyboard Navigation**: Full keyboard accessibility across all components
- **Screen Reader Support**: ARIA labels and semantic HTML structure in Portuguese
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Management**: Visible focus indicators and logical tab sequences
- **Alternative Text**: Comprehensive alt text for aesthetic procedure images and charts

#### Aesthetic Clinic-Specific Accessibility

```typescript
// Aesthetic clinic-accessible components with Portuguese support
export function AestheticAccessibleButton({ children, priority = false, ...props }) {
  return (
    <Button
      {...props}
      className={cn(
        "transition-all duration-200",
        priority && "ring-2 ring-primary bg-primary hover:bg-primary/90",
        "focus:ring-2 focus:ring-offset-2 focus:outline-none",
        props.className
      )}
      aria-live={priority ? "assertive" : "polite"}
      aria-describedby={priority ? "priority-description" : undefined}
    >
      {priority && <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />}
      {children}
    </Button>
  );
}
```

### Brazilian Aesthetic Clinic Compliance

#### LGPD (Lei Geral de Proteção de Dados) - Core Requirement

```typescript
// Privacy-first data handling with LGPD compliance for aesthetic clinics
export const lgpdAestheticClinicHandler = {
  collectClientData: (purpose: string, legalBasis: LGPDLegalBasis) => {
    // Implement consent collection with clear purpose for aesthetic procedures
    return {
      purpose, // e.g., "tratamento estético", "agendamento", "comunicação"
      legalBasis, // Usually "consent" for aesthetic procedures
      timestamp: new Date(),
      consentId: generateConsentId(),
      clinicId: getCurrentClinicId(),
      dataSubject: "aesthetic_client"
    };
  },

  anonymizeClientData: (clientData: AestheticClientData) => {
    // Remove or hash identifying information for aesthetic clients
    return {
      ...clientData,
      cpf: hashCPF(clientData.cpf),
      name: anonymizePersonalName(clientData.name),
      email: hashEmail(clientData.email),
      phone: hashPhone(clientData.phone),
      // Keep only aggregated procedure data
      procedureHistory: clientData.procedureHistory.map(p => ({
        type: p.type,
        date: p.date,
        // Remove personal details, keep statistical data
      }))
    };
  },

  generateConsentReport: (clinicId: string, period: DateRange) => {
    // Generate LGPD compliance report for audit
    return {
      totalConsents: getTotalConsents(clinicId, period),
      withdrawnConsents: getWithdrawnConsents(clinicId, period),
      dataRequests: getDataRequests(clinicId, period),
      complianceScore: calculateComplianceScore(clinicId)
    };
  }
};
```

#### ANVISA Cosmetic Products & Equipment Compliance

```typescript
// Aesthetic equipment and products compliance with ANVISA
export function ANVISACosmeticComplianceCheck({ product }: { product: CosmeticProduct }) {
  const [validationStatus, setValidationStatus] = useState<ANVISACosmeticValidation>();
  const [loading, setLoading] = useState(false);

  const validateCosmeticProduct = async () => {
    setLoading(true);
    try {
      // Validate cosmetic products and aesthetic equipment per ANVISA regulations
      const validation = await anvisaCosmeticService.validate({
        productType: product.type, // 'cosmetic', 'aesthetic_device', 'dermocosmetic'
        registration: product.anvisaRegistration,
        manufacturer: product.manufacturer,
        clinicLicense: getCurrentClinicLicense()
      });
      setValidationStatus(validation);
    } catch (error) {
      console.error('Erro na validação ANVISA:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anvisa-cosmetic-compliance p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{product.name}</h4>
        <Badge variant={validationStatus?.isCompliant ? "default" : "secondary"}>
          {validationStatus?.isCompliant ? "Conforme ANVISA" : "Validação Pendente"}
        </Badge>
      </div>
      
      {!validationStatus?.isCompliant && (
        <Alert className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Produto/equipamento requer validação ANVISA para uso em clínica estética
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Registro ANVISA:</span>
          <span className="font-mono">{product.anvisaRegistration || "Não informado"}</span>
        </div>
        <div className="flex justify-between">
          <span>Categoria:</span>
          <span>{product.type === 'cosmetic' ? 'Cosmético' : 
                  product.type === 'aesthetic_device' ? 'Equipamento Estético' : 
                  'Dermocosmoético'}</span>
        </div>
        <div className="flex justify-between">
          <span>Fabricante:</span>
          <span>{product.manufacturer}</span>
        </div>
      </div>
      
      <Button 
        onClick={validateCosmeticProduct} 
        disabled={loading}
        size="sm"
        className="w-full mt-3"
      >
        {loading ? "Validando..." : "Validar Conformidade ANVISA"}
      </Button>
    </div>
  );
}
```

#### Professional Validation for Aesthetic Practitioners
      consultation.hasEmergencyFallback
    ];

    return {
      isCompliant: requirements.every(Boolean),
      missingRequirements: requirements
        .map((req, index) => !req ? CFM_REQUIREMENTS[index] : null)
        .filter(Boolean)
    };
  }
};
```

## Examples

### Complete Healthcare Dashboard

```typescript
import {
  PatientInfoCard,
  ComplianceStatus,
  AppointmentScheduler,
  PatientChatWidget,
  NoShowPredictor,
  ComplianceAutomation
} from '@/components/healthcare';

export default function ClinicDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  return (
    <div className="clinic-dashboard min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map((patient) => (
                <PatientInfoCard
                  key={patient.id}
                  patient={patient}
                  lgpdCompliant={true}
                  accessLevel="full"
                  onSelect={setSelectedPatient}
                />
              ))}
            </div>

            <AppointmentScheduler
              availableSlots={availableSlots}
              onSchedule={handleAppointmentSchedule}
              timezone="America/Sao_Paulo"
            />
          </div>

          {/* Compliance & AI */}
          <div className="space-y-6">
            <ComplianceStatus
              clinic={clinicData}
              lastAudit={lastAuditDate}
            />

            <ComplianceAutomation
              clinicId={clinicData.id}
            />

            {selectedPatient && (
              <>
                <NoShowPredictor
                  appointment={upcomingAppointments[0]}
                  onActionTaken={handleNoShowAction}
                />

                <PatientChatWidget
                  patientId={selectedPatient.id}
                  clinicInfo={clinicData}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Form Validation with Healthcare Patterns

```typescript
import { z } from "zod";
import { cpfValidator, crmValidator } from "@/lib/validators";

const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().refine(cpfValidator, "CPF inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  emergencyContact: z.string().min(10, "Contato de emergência obrigatório"),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional()
});

export function PatientRegistrationForm() {
  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      allergies: [],
      medications: []
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00"
                  {...field}
                  onChange={(e) => {
                    field.onChange(formatCPF(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional form fields */}
      </form>
    </Form>
  );
}
```

## Troubleshooting

### Common Issues and Solutions

#### **Issue**: Components not loading with healthcare theme
**Solution**: Ensure TweakCN NEONPRO variables are properly imported

```css
/* In your globals.css */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

:root {
  --primary: 114 227 173; /* Required for healthcare theme */
  --lgpd-compliant: 5 150 105;
  --anvisa-validated: 59 130 246;
  --cfm-approved: 34 197 94;
}
```

#### **Issue**: LGPD compliance warnings in console
**Solution**: Implement proper consent collection

```typescript
// Add to your app root
import { LGPDConsentProvider } from '@/providers/lgpd-consent';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <LGPDConsentProvider>
          {children}
        </LGPDConsentProvider>
      </body>
    </html>
  );
}
```

#### **Issue**: Accessibility violations with screen readers
**Solution**: Add proper ARIA labels and semantic HTML

```typescript
// ✅ Good - Accessible healthcare component
<Card role="article" aria-labelledby="patient-info-title">
  <CardHeader>
    <CardTitle id="patient-info-title">
      Informações do Paciente: {patient.name}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div role="group" aria-label="Dados pessoais">
      <p aria-label={`CPF: ${patient.cpf}`}>CPF: {patient.cpf}</p>
    </div>
  </CardContent>
</Card>
```

#### **Issue**: AI chat widget not connecting properly
**Solution**: Verify API endpoints and WebSocket connections

```typescript
// Check your API configuration
const chatConfig = {
  apiEndpoint: process.env.NEXT_PUBLIC_AI_API_URL,
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  maxRetries: 3,
  retryDelay: 1000
};

// Implement connection retry logic
const connectWithRetry = async (retries = 3) => {
  try {
    await establishConnection();
  } catch (error) {
    if (retries > 0) {
      setTimeout(() => connectWithRetry(retries - 1), chatConfig.retryDelay);
    }
  }
};
```

#### **Issue**: Performance issues with large patient datasets
**Solution**: Implement virtual scrolling and data pagination

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function PatientList({ patients }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height per patient card
    overscan: 5
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <PatientInfoCard patient={patients[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### **Issue**: Mobile responsiveness problems on healthcare dashboards
**Solution**: Use proper responsive breakpoints and touch-friendly interactions

```typescript
// Mobile-optimized healthcare dashboard
export function MobileClinicDashboard() {
  const [activeTab, setActiveTab] = useState('patients');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 sticky top-0 z-10">
          <TabsTrigger value="patients" className="text-xs">
            <Users className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Pacientes</span>
          </TabsTrigger>
          {/* Additional tabs */}
        </TabsList>

        <TabsContent value="patients" className="p-4">
          {/* Mobile-optimized patient cards */}
          <div className="space-y-3">
            {patients.map((patient) => (
              <Card key={patient.id} className="touch-manipulation">
                <CardContent className="p-4">
                  {/* Simplified mobile layout */}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Performance Optimization

#### Bundle Size Optimization

```javascript
// next.config.js - Optimize for healthcare applications
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  webpack: (config) => {
    // Healthcare-specific optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components/healthcare': path.resolve(__dirname, 'components/healthcare'),
    };
    return config;
  },
};
```

#### Image Optimization for Medical Content

```typescript
import Image from 'next/image';

export function MedicalImageViewer({ src, alt, priority = false }) {
  return (
    <div className="medical-image-container">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={90} // Higher quality for medical images
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-contain"
      />
    </div>
  );
}
```

## Related Docs

### Documentation Structure

- [`design-guidelines.md`](./design-guidelines.md) - Complete TweakCN NEONPRO theme documentation
- [`frontend-architecture.md`](./frontend-architecture.md) - Detailed technical architecture and AI integration
- [`front-end-spec.md`](./front-end-spec.md) - UI/UX specifications and Brazilian aesthetic clinic requirements
- [`database-schema-consolidated.md`](../database-schema-consolidated.md) - Backend data structures
- [`tables-consolidated.md`](../tables-consolidated.md) - Database table specifications

### External Resources

- [Turborepo Documentation](https://turbo.build/repo/docs) - Monorepo management
- [Next.js 15 Documentation](https://nextjs.org/docs) - Framework documentation
- [Hono.dev Documentation](https://hono.dev/) - Backend API framework
- [shadcn/ui Components](https://ui.shadcn.com/) - Component library reference
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd) - Brazilian data protection
- [ANVISA Cosmetics](https://www.gov.br/anvisa/pt-br/assuntos/cosmeticos) - Cosmetic products regulation
- [OpenAI API](https://platform.openai.com/docs) - Portuguese AI integration

### Component Libraries

```typescript
// Brazilian aesthetic clinic component imports
import {
  AestheticPatientCard,
  PortugueseAestheticChat,
  AntiNoShowEngine,
  LGPDComplianceHandler,
  ANVISACosmeticComplianceCheck,
  PractitionerValidationBadge,
  AestheticAccessibleButton
} from '@/components/aesthetic-clinic';

// Core shadcn/ui base components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui';

// Turborepo workspace packages
import { AestheticClient, ProcedureType } from '@neonpro/types';
import { supabaseClient } from '@neonpro/database';
import { formatCPF, validateCPF } from '@neonpro/utils';
```

---

**Version**: 3.0.0  
**Last Updated**: January 2025  
**Architecture**: Turborepo monorepo with 24 packages (optimizing to 22)  
**Compliance**: LGPD/ANVISA approved for Brazilian aesthetic clinics  
**Accessibility**: WCAG 2.1 AA+ compliant  
**AI Features**: Portuguese conversational AI + Anti-No-Show predictive engine  
**Package Manager**: pnpm (required for Turborepo)
