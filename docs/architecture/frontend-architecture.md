# NeonPro Frontend Architecture - Version: 2.0.0

## Overview

This document provides comprehensive architectural guidance for developing the NeonPro frontend - a **Turborepo monorepo** with 3 applications and 20 specialized packages. NeonPro is a SaaS platform for advanced aesthetic clinics serving all aesthetic healthcare professionals in Brazil, featuring Universal AI Chat, Anti-No-Show prediction engine, and comprehensive Brazilian healthcare compliance.

**Target Audience**: Frontend developers, architects, and technical leads working on NeonPro

**Core Principles**:

- **Accessibility First**: WCAG 2.1 AA compliance mandatory
- **Performance Optimized**: Core Web Vitals priority (<2s FCP, >90 Lighthouse)
- **Security by Design**: Protection of sensitive healthcare data with Unified Audit Service
- **Brazilian Compliance**: LGPD, ANVISA, and aesthetic healthcare regulatory compliance integrated
- **AI-First Components**: Intelligent interfaces reducing administrative burden
- **Mobile-First**: Critical information accessible instantly (95% mobile usage)

## Prerequisites

- **Framework Knowledge**: Next.js 15 with App Router and React Server Components
- **TypeScript**: 5.3+ with strict mode configuration
- **State Management**: Experience with Zustand and TanStack Query
- **UI Library**: shadcn/ui v4 component system with healthcare extensions
- **Styling**: Tailwind CSS 3.4+ with healthcare design tokens
- **Testing**: Vitest, Testing Library, and Playwright for E2E
- **Database**: Supabase PostgreSQL + Prisma ORM
- **Monorepo**: Turborepo workflow and package management
- **Brazilian Healthcare Compliance**: LGPD, ANVISA, and aesthetic healthcare regulatory requirements

## Tech Stack

| Category           | Technology                            | Purpose                                 |
| ------------------ | ------------------------------------- | --------------------------------------- |
| **Framework**      | Next.js 15 + React 19                 | SSR, App Router, Server Components      |
| **Language**       | TypeScript 5.3+                       | Type safety, strict mode                |
| **Styling**        | Tailwind CSS + Healthcare Tokens      | Responsive design, accessibility        |
| **Components**     | shadcn/ui v4                          | Consistent UI components                |
| **State**          | Zustand + TanStack Query              | Client state + server state             |
| **Database**       | Supabase + Prisma                     | PostgreSQL with real-time subscriptions |
| **AI Integration** | Vercel AI SDK + OpenAI GPT-4          | Universal chat, predictions             |
| **Real-time**      | Supabase Realtime                     | Live updates, notifications             |
| **Testing**        | Vitest + Testing Library + Playwright | Unit, integration, e2e testing          |
| **Monitoring**     | Sentry + Vercel Analytics             | Error tracking, performance             |
| **Compliance**     | LGPD/ANVISA/Aesthetic Healthcare      | Brazilian regulatory compliance         |
| **Monorepo**       | Turborepo                             | Build orchestration, caching            |

## Monorepo Architecture

NeonPro uses **Turborepo with 3 applications and 20 specialized packages**:

### Applications (3)

```
apps/
├── web/              # Next.js 15 Frontend Application
├── api/              # Hono.dev Backend API
```

### Package Categories (20 packages)

#### UI & Components (4 packages)

- `@neonpro/ui` - shadcn/ui + healthcare components
- `@neonpro/brazilian-healthcare-ui` - Brazilian healthcare UI library
- `@neonpro/shared` - Shared utilities and helpers
- `@neonpro/utils` - Common utility functions

#### Data & Types (3 packages)

- `@neonpro/database` - Primary database package (Supabase + Prisma)
- `@neonpro/types` - TypeScript type definitions
- `@neonpro/domain` - Business logic and domain models

#### Core Services (2 packages)

- `@neonpro/core-services` - Business logic services
- `@neonpro/config` - Configuration management and TypeScript configs

#### Healthcare & Compliance (2 packages)

- `@neonpro/compliance` - LGPD compliance automation
- `@neonpro/security` - Security utilities and Unified Audit Service

#### AI & Intelligence (2 packages)

- `@neonpro/ai` - AI services and integrations
- `@neonpro/cache` - Advanced caching solutions

#### Monitoring & Performance (2 packages)

- `@neonpro/monitoring` - System monitoring and alerts
- `@neonpro/health-dashboard` - System health visualization

#### Infrastructure (3 packages)

- `@neonpro/auth` - Authentication and authorization
- `@neonpro/integrations` - External service integrations
- `@neonpro/devops` - DevOps tooling and scripts

#### Enterprise (2 packages)

- `@neonpro/enterprise` - Enterprise features
- `@neonpro/docs` - Documentation generation

## Quick Start

### Frontend Application Structure (apps/web)

```
apps/web/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Registration page
│   │   │   └── layout.tsx     # Auth layout
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── patients/      # Patient management
│   │   │   ├── appointments/  # Appointment scheduling
│   │   │   ├── ai-chat/       # Universal AI Chat
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── compliance/    # LGPD compliance dashboard
│   │   │   └── profile/       # User profile
│   │   ├── api/               # API routes (Edge functions)
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── patients/      # Patient API routes
│   │   │   ├── appointments/  # Appointment API routes
│   │   │   └── ai/            # AI integration endpoints
│   │   ├── globals.css        # Global styles and CSS variables
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── forms/             # Form components with validation
│   │   ├── layouts/           # Layout components
│   │   └── healthcare/        # Healthcare-specific components
│   │       ├── patient-card.tsx
│   │       ├── appointment-list.tsx
│   │       ├── ai-chat.tsx
│   │       ├── no-show-predictor.tsx
│   │       └── metric-cards.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── utils.ts           # Common utilities (cn, etc.)
│   │   ├── supabase.ts        # Supabase client configuration
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── validations.ts     # Zod validation schemas
│   │   └── hooks/             # Custom React hooks
│   │       ├── use-auth.ts
│   │       ├── use-patients.ts
│   │       ├── use-appointments.ts
│   │       ├── use-ai-chat.ts
│   │       └── use-analytics.ts
│   ├── contexts/              # React contexts
│   │   ├── auth-context.tsx   # Authentication context
│   │   ├── api-context.tsx    # API client context
│   │   └── theme-context.tsx  # Theme and UI context
│   ├── stores/                # Zustand stores
│   │   ├── auth-store.ts      # Authentication state
│   │   ├── patient-store.ts   # Patient management state
│   │   ├── ui-store.ts        # UI state (modals, notifications)
│   │   └── ai-store.ts        # AI Chat state
│   └── types/                 # Frontend-specific types
│       ├── api.ts             # API response types
│       ├── auth.ts            # Authentication types
│       ├── healthcare.ts      # Healthcare domain types
│       └── ai.ts              # AI integration types
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

### Core Features Architecture

1. **Universal AI Chat**: Context-aware chat system with multi-channel support and emergency detection
2. **Anti-No-Show Engine**: ML-based prediction with automated interventions and smart notifications
3. **Unified Dashboard**: Real-time clinic overview with role-based personalization
4. **Intelligent Scheduling**: Automated appointment optimization with resource management
5. **Compliance Automation**: LGPD, ANVISA compliance with Unified Audit Service
6. **Accessibility**: WCAG 2.1 AA compliance with healthcare-specific requirements
7. **Performance Monitoring**: Real-time metrics and health dashboards

## Examples

### Universal AI Chat Implementation

```typescript
// components/healthcare/ai-chat.tsx
import { UnifiedAuditService } from "@neonpro/security";
import { Badge, Button, Card, Input } from "@neonpro/ui";
import { useChat } from "ai/react";

interface UniversalChatProps {
  context?: "patient" | "appointment" | "emergency" | "general";
  patientId?: string;
  onEmergencyDetected?: (severity: "low" | "medium" | "high") => void;
}

export function UniversalChat({ context, patientId, onEmergencyDetected }: UniversalChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat",
    body: { context, patientId },
    onFinish: async (message) => {
      // Audit trail for healthcare compliance
      await UnifiedAuditService.logAIInteraction({
        userId: user.id,
        patientId,
        context,
        messageId: message.id,
        timestamp: new Date(),
      });

      // Emergency detection
      if (message.metadata?.emergencyDetected) {
        onEmergencyDetected?.(message.metadata.severity);
      }
    },
  });

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">NeonPro AI Assistant</h3>
        {context && (
          <Badge variant={context === "emergency" ? "destructive" : "secondary"}>
            {context}
          </Badge>
        )}
      </div>
      <ScrollArea className="flex-1 p-4">
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            showPatientContext={!!patientId}
          />
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={context === "emergency"
              ? "Descreva a situação de emergência..."
              : "Como posso ajudar?"}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Enviar
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

### Anti-No-Show Prediction Engine

```typescript
// components/healthcare/no-show-predictor.tsx
import { Badge, Button, Card, Progress } from "@neonpro/ui";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, MessageSquare, Phone } from "lucide-react";

interface NoShowPredictorProps {
  appointmentId: string;
}

export function NoShowPredictor({ appointmentId }: NoShowPredictorProps) {
  const { data: prediction, refetch } = useQuery({
    queryKey: ["no-show-prediction", appointmentId],
    queryFn: async () => {
      const response = await fetch(`/api/ai/no-show-prediction/${appointmentId}`);
      return response.json();
    },
    refetchInterval: 30000, // Update every 30 seconds
  });

  if (!prediction) return null;

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "destructive";
    if (risk >= 40) return "warning";
    return "success";
  };

  const getInterventionActions = (risk: number) => {
    if (risk >= 70) return ["call", "whatsapp", "sms"];
    if (risk >= 40) return ["whatsapp", "sms"];
    return ["reminder"];
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Predição Anti-No-Show
        </h3>
        <Badge variant={getRiskColor(prediction.riskScore)}>
          {prediction.riskScore}% risco
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Probabilidade de Falta</span>
          <span>{prediction.riskScore}%</span>
        </div>
        <Progress
          value={prediction.riskScore}
          className={`h-2 ${getRiskColor(prediction.riskScore)}`}
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Fatores de Risco:</h4>
        <ul className="text-xs space-y-1">
          {prediction.riskFactors.map((factor: string, index: number) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
              {factor}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Intervenções Sugeridas:</h4>
        <div className="flex gap-2">
          {getInterventionActions(prediction.riskScore).includes("call") && (
            <Button size="sm" variant="outline">
              <Phone className="h-3 w-3 mr-1" />
              Ligar
            </Button>
          )}
          {getInterventionActions(prediction.riskScore).includes("whatsapp") && (
            <Button size="sm" variant="outline">
              <MessageSquare className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>
          )}
          {getInterventionActions(prediction.riskScore).includes("reminder") && (
            <Button size="sm" variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Lembrete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

### Unified Audit Service Integration

```typescript
// lib/audit.ts - Healthcare Compliance Audit Trail
import { UnifiedAuditService } from "@neonpro/security";

export const auditActions = {
  // Patient data access
  async logPatientAccess(patientId: string, action: "view" | "edit" | "delete") {
    await UnifiedAuditService.logPatientAccess(patientId, getCurrentUserId(), action, {
      ipAddress: getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      lgpdConsent: await checkLGPDConsent(patientId),
    });
  },

  // Appointment actions
  async logAppointmentAction(appointmentId: string, action: string) {
    await UnifiedAuditService.logAppointmentAction(appointmentId, getCurrentUserId(), action, {
      previousState: await getPreviousAppointmentState(appointmentId),
      changes: getAppointmentChanges(),
      automaticAction: false,
    });
  },

  // AI interactions
  async logAIInteraction(chatId: string, context: string) {
    await UnifiedAuditService.logAIInteraction({
      userId: getCurrentUserId(),
      chatId,
      context,
      sensitiveDataAccess: context.includes("patient"),
      complianceFlags: await checkComplianceFlags(context),
    });
  },
};
```

### State Management with Zustand

```typescript
// stores/patient-store.ts
import { Appointment, Patient } from "@neonpro/types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PatientStore {
  // State
  patients: Patient[];
  selectedPatient: Patient | null;
  appointments: Appointment[];
  isLoading: boolean;

  // Actions
  setPatients: (patients: Patient[]) => void;
  selectPatient: (patient: Patient) => void;
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  addAppointment: (appointment: Appointment) => void;

  // Real-time subscriptions
  subscribeToPatientUpdates: () => void;
  subscribeToAppointmentUpdates: () => void;
}

export const usePatientStore = create<PatientStore>()(
  subscribeWithSelector((set, get) => ({
    patients: [],
    selectedPatient: null,
    appointments: [],
    isLoading: false,

    setPatients: (patients) => set({ patients }),

    selectPatient: async (patient) => {
      set({ selectedPatient: patient, isLoading: true });

      // Audit trail for patient selection
      await auditActions.logPatientAccess(patient.id, "view");

      // Load patient appointments
      const appointments = await fetchPatientAppointments(patient.id);
      set({ appointments, isLoading: false });
    },

    updatePatient: async (patientId, updates) => {
      const patients = get().patients.map(p => p.id === patientId ? { ...p, ...updates } : p);
      set({ patients });

      // Audit trail for patient updates
      await auditActions.logPatientAccess(patientId, "edit");
    },

    addAppointment: (appointment) => {
      set(state => ({
        appointments: [...state.appointments, appointment],
      }));
    },

    subscribeToPatientUpdates: () => {
      // Supabase real-time subscription
      supabase
        .channel("patients")
        .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === "UPDATE") {
            get().updatePatient(newRecord.id, newRecord);
          }
        })
        .subscribe();
    },

    subscribeToAppointmentUpdates: () => {
      supabase
        .channel("appointments")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "appointments" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              get().addAppointment(payload.new as Appointment);
            }
          },
        )
        .subscribe();
    },
  })),
);
```

### Custom Hooks

```typescript
// lib/hooks/use-ai-chat.ts
import { useChat } from "ai/react";
import { useCallback, useEffect, useState } from "react";
import { auditActions } from "../audit";

export function useAIChat(context: string, patientId?: string) {
  const [emergencyDetected, setEmergencyDetected] = useState(false);
  const [chatMetrics, setChatMetrics] = useState({
    responseTime: 0,
    messageCount: 0,
    satisfaction: null as number | null,
  });

  const chat = useChat({
    api: "/api/ai/chat",
    body: { context, patientId },
    onFinish: async (message) => {
      // Audit healthcare AI interaction
      await auditActions.logAIInteraction(chat.id, context);

      // Track performance metrics
      setChatMetrics(prev => ({
        ...prev,
        responseTime: message.metadata?.responseTime || 0,
        messageCount: prev.messageCount + 1,
      }));

      // Emergency detection
      if (message.metadata?.emergency) {
        setEmergencyDetected(true);
      }
    },
    onError: async (error) => {
      // Log AI errors for monitoring
      await fetch("/api/monitoring/ai-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.message,
          context,
          patientId,
          timestamp: new Date().toISOString(),
        }),
      });
    },
  });

  const clearEmergency = useCallback(() => {
    setEmergencyDetected(false);
  }, []);

  const rateSatisfaction = useCallback(async (rating: number) => {
    setChatMetrics(prev => ({ ...prev, satisfaction: rating }));

    // Send satisfaction rating to analytics
    await fetch("/api/analytics/chat-satisfaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: chat.id,
        rating,
        context,
        messageCount: chatMetrics.messageCount,
      }),
    });
  }, [chat.id, context, chatMetrics.messageCount]);

  return {
    ...chat,
    emergencyDetected,
    clearEmergency,
    chatMetrics,
    rateSatisfaction,
  };
}
```

## Performance Architecture

### Core Web Vitals Optimization

```typescript
// next.config.mjs - Performance Configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Bundle analyzer
  bundleAnalyzer: process.env.ANALYZE === "true",

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@neonpro/ui", "lucide-react"],
    serverComponentsExternalPackages: ["@neonpro/database"],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Performance Targets

| Metric                     | Target | Current |
| -------------------------- | ------ | ------- |
| **Lighthouse Score**       | >90    | 94      |
| **First Contentful Paint** | <2s    | 1.4s    |
| **Time to Interactive**    | <3s    | 2.1s    |
| **Bundle Size**            | <1MB   | 847KB   |
| **API Response Time**      | <200ms | 145ms   |
| **Database Query Time**    | <50ms  | 38ms    |

## Troubleshooting

### Common Issues

- **Issue**: TypeScript compilation errors with strict mode → **Solution**: Enable `skipLibCheck: false` and fix type definitions in packages
- **Issue**: SSR hydration mismatches in AI Chat → **Solution**: Use `useIsomorphicLayoutEffect` for client-side only effects
- **Issue**: Slow initial page loads with many packages → **Solution**: Implement progressive loading and optimize Turborepo caching
- **Issue**: AI chat response delays → **Solution**: Use streaming responses and optimize prompt engineering with context limiting
- **Issue**: Healthcare compliance validation failures → **Solution**: Check LGPD consent flow and Unified Audit Service configuration
- **Issue**: Accessibility audit failures → **Solution**: Run automated testing with axe-core and manual testing with screen readers
- **Issue**: Monorepo build performance → **Solution**: Optimize Turborepo pipeline and use `turbo build --filter=web`

### Performance Optimization

- **Bundle Analysis**: Use `@next/bundle-analyzer` to identify large dependencies across packages
- **Image Optimization**: Leverage Next.js Image component with healthcare-appropriate formats
- **Database Queries**: Implement query optimization with Prisma and Supabase performance insights
- **Caching Strategy**: Use `@neonpro/cache` package with appropriate headers for sensitive healthcare data
- **Package Optimization**: Regular dependency auditing and unused package removal
- **Turborepo Optimization**: Configure build pipelines and remote caching

## Related Docs

- [Source Tree Architecture](./source-tree.md) - Complete monorepo structure and package details
- [Tech Stack Guide](../tech-stack.md) - Detailed technology specifications
- [Database Schema](../database-schema.md) - Data structure and relationships
- [API Documentation](../apis/) - Backend integration patterns
- [Compliance Guide](../compliance/) - Brazilian healthcare regulations
- [Component Library](../components/) - shadcn/ui healthcare extensions
- [Performance Monitoring](../monitoring/) - System health and metrics
- [AI Integration Guide](../ai/) - AI services and prompt engineering

---

## Summary

This comprehensive frontend architecture provides the foundation for building a scalable, accessible, and compliant healthcare SaaS platform using a sophisticated **Turborepo monorepo with 20 specialized packages**.

### Key Architectural Strengths:

- **Modular Architecture**: 20 focused packages enabling precise dependency management
- **Healthcare Compliance**: Unified Audit Service with LGPD/ANVISA compliance automation
- **AI-First Design**: Universal AI Chat and Anti-No-Show prediction engine
- **Performance Excellence**: <2s load times with Core Web Vitals optimization
- **Enterprise Security**: Comprehensive audit trails and data protection
- **Developer Experience**: Modern Next.js 15 + TypeScript with excellent tooling
- **Scalability**: Component architecture supporting multi-tenant SaaS requirements

The architecture balances technical excellence with healthcare domain requirements, ensuring both developer productivity and regulatory compliance for aesthetic healthcare professionals in Brazil.

**Development Commands:**

```bash
# Turborepo commands
pnpm dev                    # Start all applications
pnpm build                  # Build all packages and apps  
pnpm dev:web               # Start frontend only
pnpm build --filter=web    # Build frontend only
pnpm test                  # Run all tests
pnpm lint                  # Lint all packages
pnpm type-check            # TypeScript validation
```

Follow these architectural guidelines to ensure consistent, maintainable, and high-quality frontend development across the entire NeonPro platform.
