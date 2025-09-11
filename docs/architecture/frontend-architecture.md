---
title: "NeonPro Frontend Architecture"
last_updated: 2025-09-10
form: explanation
tags: [frontend, architecture, decisions, patterns]
related:
  - ./front-end-spec.md
  - ./tech-stack.md
  - ../prd/prd.md
  - ../AGENTS.md
---

# NeonPro Frontend Architecture

## Overview

This document defines the high-level architectural decisions, patterns, and design philosophy for the NeonPro frontend - a **mobile-first aesthetic clinic management platform** built with **Turborepo monorepo architecture**. NeonPro serves advanced aesthetic professionals in Brazil with AI-powered automation, predictive analytics, and intelligent patient engagement.

**Target Audience**: Frontend architects, technical leads, and senior developers
**Scope**: Architectural decisions, system design patterns, and technology rationale
**Companion Document**: [Frontend Specification](./front-end-spec.md) for implementation details

## Architectural Principles

### 1. Mobile-First Philosophy

- **95% mobile usage** by aesthetic professionals and patients
- Touch-optimized interfaces with minimum 44px touch targets
- Offline-capable core functions for unreliable connections
- Progressive Web App (PWA) capabilities for app-like experience

### 2. AI-First Architecture

- **Universal AI Chat** as primary interaction method
- Context-aware AI responses based on user role and patient data
- Predictive UI elements powered by machine learning
- Intelligent automation reducing administrative burden by 40%

### 3. Healthcare Compliance by Design

- **LGPD compliance** built into every component
- Audit logging for all patient data access
- Role-based access control (RBAC) at component level
- Data masking and encryption for sensitive information

### 4. Performance-Driven Design

- **<2 second page loads** on 3G connections
- **99.9% uptime** requirement for critical clinic operations
- Edge-first architecture with global CDN
- Optimistic UI updates for immediate feedback

## Technology Architecture

### Core Stack Rationale

**TanStack Router + Vite + React 19**

- **Why**: Server Components reduce bundle size, App Router provides file-based routing
- **Benefits**: Automatic code splitting, built-in performance optimizations, Vercel integration
- **Trade-offs**: Learning curve for Server Components, limited client-side state

**TypeScript 5.0+ Strict Mode**

- **Why**: Healthcare data requires absolute type safety
- **Benefits**: Compile-time error detection, excellent IDE support, self-documenting code
- **Implementation**: Strict null checks, no implicit any, path mapping for monorepo

**Tailwind CSS + shadcn/ui**

- **Why**: Rapid development, consistent design system, accessibility built-in
- **Benefits**: Utility-first approach, responsive design, dark mode support
- **Customization**: Healthcare-specific color tokens, Portuguese typography optimization

**Supabase + Prisma**

- **Why**: Real-time subscriptions, built-in auth, PostgreSQL compatibility
- **Benefits**: Type-safe database queries, automatic migrations, row-level security
- **Architecture**: Edge functions for business logic, real-time for live updates

## System Architecture Patterns

### 1. Monorepo Structure

```
apps/
├── web/              # TanStack Router + Vite Frontend (Primary)
├── api/              # Hono.dev Backend API
└── mobile/           # Future React Native app

packages/
├── @neonpro/ui                    # Core UI components
├── @neonpro/brazilian-healthcare-ui # Healthcare-specific components
├── @neonpro/database              # Supabase + Prisma integration
├── @neonpro/auth                  # Authentication utilities
├── @neonpro/ai                    # AI integration layer
├── @neonpro/analytics             # Analytics and tracking
├── @neonpro/compliance            # LGPD compliance utilities
└── @neonpro/utils                 # Shared utilities
```

**Benefits**:

- Shared code between applications
- Consistent versioning and dependencies
- Atomic commits across related changes
- Efficient CI/CD with selective builds

### 2. Component Architecture

**Atomic Design Methodology**

- **Atoms**: Basic UI elements (Button, Input, Badge)
- **Molecules**: Simple combinations (SearchBox, PatientCard)
- **Organisms**: Complex components (Dashboard, AppointmentScheduler)
- **Templates**: Page layouts with placeholder content
- **Pages**: Specific instances with real content

**Healthcare Component Pattern**

```typescript
interface HealthcareComponentProps {
  readonly patientId?: string;
  readonly userRole: 'admin' | 'professional' | 'coordinator';
  readonly lgpdCompliant: boolean;
  readonly onAuditLog?: (action: string) => void;
}
```

### 3. State Management Architecture

**Hybrid Approach**

- **Server State**: TanStack Query for API data, caching, and synchronization
- **Client State**: Zustand for UI state, user preferences, and temporary data
- **Form State**: React Hook Form with Zod validation
- **Real-time State**: Supabase subscriptions for live updates

**State Flow Pattern**

1. User action triggers optimistic update
2. API call initiated with TanStack Query
3. Real-time subscription updates other clients
4. Error handling with automatic retry and rollback

### 4. Security Architecture

**Defense in Depth**

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row-level security (RLS) in database
- **Data Protection**: Client-side encryption for sensitive data
- **Audit Logging**: Comprehensive logging for compliance

**LGPD Compliance Pattern**

- Data minimization at component level
- Consent management integrated into UI
- Right to erasure with cascading deletes
- Data portability with structured exports

## Design System Architecture

### 1. Token-Based Design

**Color System**

- **Primary**: Professional trust blue (#2563eb)
- **Secondary**: Sophisticated purple (#7c3aed)
- **Accent**: Modern cyan (#06b6d4)
- **Semantic**: Success, warning, error with healthcare context

**Typography Scale**

- **Primary Font**: Inter (optimized for Portuguese)
- **Monospace**: JetBrains Mono (for data display)
- **Line Height**: 1.6 (optimal for Portuguese readability)

### 2. Component System

**Base Components** (shadcn/ui)

- Accessible by default (WCAG 2.1 AA)
- Consistent API across components
- Theme-aware with CSS variables
- Responsive design built-in

**Healthcare Extensions**

- Patient data components with privacy controls
- Medical procedure interfaces
- Appointment scheduling components
- AI chat interfaces

## Performance Architecture

### 1. Loading Strategy

**Progressive Enhancement**

- Critical CSS inlined for first paint
- Non-critical resources loaded asynchronously
- Service worker for offline functionality
- Image optimization with Vite static assets

**Code Splitting Strategy**

- Route-based splitting with TanStack Router
- Component-based splitting for large features
- Dynamic imports for heavy libraries
- Preloading for anticipated navigation

### 2. Caching Strategy

**Multi-Layer Caching**

- **CDN**: Static assets and API responses
- **Browser**: Service worker for offline access
- **Memory**: TanStack Query for API data
- **Database**: Redis for session and computed data

### 3. Real-Time Architecture

**Supabase Realtime**

- WebSocket connections for live updates
- Selective subscriptions to reduce bandwidth
- Automatic reconnection with exponential backoff
- Conflict resolution for concurrent edits

## Mobile Architecture

### 1. Responsive Design Strategy

**Breakpoint System**

- **Mobile**: 320px - 768px (primary focus)
- **Tablet**: 768px - 1024px (secondary)
- **Desktop**: 1024px+ (administrative tasks)

**Adaptive Components**

- Navigation: Bottom tabs on mobile, sidebar on desktop
- Data tables: Card layout on mobile, table on desktop
- Forms: Single column on mobile, multi-column on desktop

### 2. Touch Interaction Design

**Touch Targets**

- Minimum 44px for all interactive elements
- Adequate spacing between touch targets
- Swipe gestures for common actions
- Pull-to-refresh for data updates

### 3. Performance Optimization

**Mobile-Specific Optimizations**

- Reduced bundle size with tree shaking
- Lazy loading for below-the-fold content
- Optimized images with WebP format
- Minimal JavaScript for critical path

## AI Integration Architecture

### 1. Universal AI Chat System

**Context-Aware Architecture**

- Patient context injection for personalized responses
- Role-based response filtering
- Emergency detection with automatic escalation
- Multi-language support (Portuguese primary)

**Integration Pattern**

```typescript
interface AIContext {
  userRole: UserRole;
  patientId?: string;
  clinicId: string;
  conversationHistory: Message[];
  emergencyProtocols: EmergencyProtocol[];
}
```

### 2. Predictive UI Components

**Anti-No-Show Engine**

- Real-time risk scoring display
- Automated intervention suggestions
- Historical pattern visualization
- Success rate tracking

**Smart Scheduling**

- AI-powered time slot recommendations
- Resource optimization suggestions
- Conflict detection and resolution
- Capacity planning insights

## Scalability Architecture

### 1. Horizontal Scaling

**Stateless Design**

- No server-side session storage
- JWT tokens for authentication
- Database for persistent state
- CDN for static asset delivery

**Microservices Preparation**

- Domain-driven package organization
- Clear API boundaries between packages
- Event-driven communication patterns
- Independent deployment capabilities

### 2. Database Scaling

**Read Replicas**

- Supabase read replicas for analytics queries
- Connection pooling for efficient resource usage
- Query optimization with proper indexing
- Caching layer for frequently accessed data

### 3. CDN and Edge Computing

**Global Distribution**

- Vercel Edge Network for low latency
- Edge functions for business logic
- Regional data compliance (Brazil focus)
- Automatic failover and load balancing

## Quality Architecture

### 1. Testing Strategy

**Testing Pyramid**

- **Unit Tests**: Component logic and utilities (70%)
- **Integration Tests**: API interactions and workflows (20%)
- **E2E Tests**: Critical user journeys (10%)

**Healthcare-Specific Testing**

- LGPD compliance validation
- Accessibility testing with screen readers
- Performance testing under load
- Security penetration testing

### 2. Monitoring and Observability

**Application Monitoring**

- Real-time error tracking with Sentry
- Performance monitoring with Vercel Analytics
- User behavior tracking with privacy compliance
- Business metrics dashboard

**Health Checks**

- API endpoint availability
- Database connection status
- Third-party service dependencies
- Real-time subscription health

## Future Architecture Considerations

### 1. Multi-Tenant Architecture

**Clinic Isolation**

- Database-level tenant separation
- UI customization per clinic
- Feature flags for different plans
- Compliance requirements per region

### 2. International Expansion

**Localization Architecture**

- i18n framework integration
- Currency and date formatting
- Regional compliance modules
- Multi-language AI training

### 3. Advanced AI Features

**Autonomous Practice Intelligence**

- Predictive analytics dashboard
- Automated workflow optimization
- Intelligent resource allocation
- Advanced patient insights

## Conclusion

The NeonPro frontend architecture prioritizes mobile-first design, AI integration, and healthcare compliance while maintaining high performance and scalability. The monorepo structure enables code sharing and consistent development practices, while the component-based architecture ensures maintainability and reusability.

Key architectural decisions focus on:

- **User Experience**: Mobile-first, AI-powered, intuitive interfaces
- **Compliance**: LGPD, ANVISA, and healthcare regulatory requirements
- **Performance**: Sub-2-second load times, 99.9% uptime, offline capabilities
- **Scalability**: Horizontal scaling, microservices preparation, global distribution

This architecture provides a solid foundation for NeonPro's evolution from a smart aesthetic platform to an autonomous practice intelligence system.

## See Also

- [Frontend Specification](./front-end-spec.md) - Implementation details and coding standards
- [Technology Stack](./tech-stack.md) - Detailed technology choices and rationale
- [Product Requirements](../prd/prd.md) - Business requirements and user needs
- [Development Guidelines](../AGENTS.md) - Development workflow and best practices
