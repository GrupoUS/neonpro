---
title: "NeonPro Technology Stack"
last_updated: 2025-09-09
form: reference
tags: [technology, stack, decisions, rationale]
related:
  - ./architecture.md
  - ./source-tree.md
  - ../AGENTS.md
---

# NeonPro Technology Stack

This document details **WHICH** technologies NeonPro uses and **WHY** they were chosen, including framework selections, tool configurations, version management, and implementation rationale.

## Technology Selection Philosophy

**Decision Criteria**: Performance, type safety, compliance readiness, developer experience, scalability

**Stack Overview**:

- **Frontend**: TanStack Router + Vite + React 19 + TypeScript 5.7.2
- **Backend**: Hono.dev + Supabase + PostgreSQL 15+
- **AI**: OpenAI GPT-4 + Anthropic Claude via Vercel AI SDK
- **Infrastructure**: Vercel (São Paulo) + Turborepo monorepo
- **Quality**: Vitest + Playwright + Oxlint + TypeScript strict

## Core Technology Stack

### Monorepo & Build System

**Turborepo v2.5.6** - Monorepo Build Orchestration

- **Why**: 80% faster builds via intelligent caching, parallel execution, TypeScript support
- **Benefits**: Zero-config caching, dependency-aware builds, Vercel integration
- **Performance**: ~35s cold build, ~3s incremental with cache

**PNPM v8.15.0** - Package Manager

- **Why**: 3x faster installs, efficient disk usage, workspace protocol support
- **Benefits**: Strict dependency resolution, workspace hoisting, security advantages
- **Config**: Workspace protocol (`workspace:*`), symlinked node_modules

**Bun (Latest)** - Development Scripts & Testing

- **Why**: 3-5x faster than npm, excellent TypeScript support, built-in bundler
- **Usage**: Test runner, development scripts, package auditing
- **Performance**: ~12s test suite execution vs ~30s with Jest

**TypeScript v5.7.2** - Type Safety & Developer Experience

- **Why**: Latest features (decorators, satisfies), strict mode for data safety
- **Benefits**: Compile-time error detection, excellent IDE support, data validation
- **Config**: Strict mode, path mapping, monorepo type definitions

### Frontend Technology Stack

**TanStack Router (Latest)** - Type-Safe Routing

- **Why**: Full type safety, file-based routing, automatic route generation
- **Benefits**: Type-safe data loading, search param validation, performance
- **Migration**: From Next.js App Router for better type safety
- **Performance**: 40% faster development builds

**Vite v5.2.0** - Build Tool & Development Server

- **Why**: Lightning-fast HMR (<100ms), optimized builds, plugin ecosystem
- **Benefits**: Native ES modules, fast cold starts, tree shaking, CSS splitting
- **Performance**: <2s dev server startup, <100ms hot reload

**React v19.1.1** - UI Library

- **Why**: Latest features (concurrent rendering, batching), ecosystem, TypeScript support
- **Features**: Suspense, concurrent rendering, automatic batching
- **Performance**: Improved rendering performance with concurrent features

**Tailwind CSS v3.3.0** - Utility-First Styling

- **Why**: Rapid development, design system consistency, responsive design
- **Benefits**: Utility classes, dark mode support, accessibility focus
- **Config**: Custom Brazilian healthcare color palette, responsive breakpoints

**shadcn/ui v4** - Component Library

- **Why**: WCAG 2.1 AA compliance, Radix primitives, copy-paste approach
- **Benefits**: Accessibility built-in, TypeScript support, customizable components
- **Features**: 40+ components, Brazilian Portuguese localization

**Supporting Frontend Libraries**:

- **React Hook Form v7.62.0**: Performance-focused forms, minimal re-renders
- **Zod v3.23.8**: Runtime schema validation, TypeScript integration
- **Zustand v4.4.0**: Lightweight state management, TypeScript-first
- **TanStack Query v5.62.0**: Server state management, caching, background updates

### Backend Technology Stack

**Hono.dev v4.5.8** - Web Framework

- **Why**: Ultra-lightweight (<10KB), 3x faster than Express, edge compatible, TypeScript support
- **Features**: Type-safe routing, middleware support, request validation, streaming
- **Performance**: 3x faster than Express, edge runtime optimized

**Node.js 20+** - Runtime Environment

- **Why**: LTS stability, Vercel Functions compatibility, mature ecosystem
- **Benefits**: Vercel optimization, npm compatibility, security updates
- **Config**: ES modules, strict mode, serverless optimized

**Supabase v2.45.1** - Backend-as-a-Service Platform

- **Why**: PostgreSQL foundation, real-time capabilities, built-in auth, Brazilian data centers
- **Features**: PostgreSQL 15+, real-time subscriptions, storage, edge functions
- **Benefits**: Reduced backend complexity, compliance features

**PostgreSQL 15+** - Primary Database

- **Why**: ACID compliance, JSON support, excellent performance, mature ecosystem
- **Benefits**: Data integrity, complex queries, JSON/JSONB support, full-text search
- **Config**: Optimized workloads, proper indexing, connection pooling

**@hono/zod-validator v0.2.2** - Request Validation

- **Why**: Type-safe validation, Zod integration, automatic TypeScript inference
- **Benefits**: Runtime type checking, automatic error handling, schema reuse
- **Usage**: API request validation, response validation, data schemas

### Authentication & Security Stack

**Supabase Auth v2.38.5** - Primary Authentication Provider

- **Why**: LGPD-compliant, built-in MFA, social providers, Brazilian data residency
- **Features**: Email/password, magic links, OAuth, MFA, session management
- **Compliance**: LGPD data protection, audit trails

**JOSE Library** - JWT Token Handling

- **Why**: Lightweight, secure JWT implementation, TypeScript support, Web Crypto API
- **Benefits**: Web standards compliance, edge runtime compatibility
- **Usage**: Token validation, signature verification, claims extraction

**WebAuthn (@simplewebauthn/server)** - Biometric Authentication

- **Why**: Passwordless authentication, FIDO2 compliance, enhanced security
- **Benefits**: Phishing resistance, device-bound credentials, improved UX
- **Implementation**: Fingerprint, Face ID, hardware keys

**bcryptjs v2.4.3** - Password Hashing (Legacy Support)

- **Why**: Industry standard, wide compatibility, gradual migration path
- **Migration**: Moving to Argon2id for new passwords, bcrypt for legacy
- **Config**: Cost factor 12+, serverless optimized, timing attack protection

### AI & Machine Learning Stack

**Vercel AI SDK v5.0.23** - Unified AI Framework

- **Why**: Provider-agnostic interface, streaming support, React integration, edge compatibility
- **Features**: Streaming chat, function calling, provider switching, error handling
- **Benefits**: Unified API across providers, excellent TypeScript support

**OpenAI GPT-4** - Primary Conversational AI

- **Why**: Best Portuguese language support, function calling, reliability
- **Benefits**: Excellent Portuguese understanding, fast responses, stable API
- **Config**: Temperature 0.7, max tokens 2048, system prompts
- **Performance**: <2s response time for typical queries

**Anthropic Claude** - Secondary AI Provider

- **Why**: Excellent reasoning capabilities, safety focus, backup reliability
- **Benefits**: Strong reasoning, safety features, context understanding
- **Usage**: Backup provider, complex reasoning, safety-critical operations

**TensorFlow.js (Latest)** - Client-Side Machine Learning

- **Why**: Browser-native ML, privacy-preserving, offline capabilities
- **Benefits**: Client-side inference, privacy protection, offline support
- **Use Cases**: Anti-No-Show prediction, client-side validation, offline analytics

**AI Governance**:

- **Data Retention**: 7-day log retention
- **PII Protection**: Automatic redaction
- **Failover**: OpenAI → Anthropic with exponential backoff
- **Rate Limiting**: Provider-specific limits with graceful degradation

### Testing & Quality Assurance Stack

**Vitest v3.2.0** - Unit & Integration Testing

- **Why**: Vite-powered speed, Jest compatibility, TypeScript support
- **Benefits**: Fast execution, hot module replacement, snapshot testing, coverage reports
- **Performance**: 3-5x faster than Jest, ~12s test suite execution

**Playwright v1.40.0** - End-to-End Testing

- **Why**: Cross-browser testing, reliable automation, excellent debugging
- **Benefits**: Multi-browser support, network interception, visual testing, mobile testing
- **Config**: Brazilian Portuguese locale, healthcare-specific test scenarios

**React Testing Library v16.3.0** - Component Testing

- **Why**: User-centric testing approach, accessibility focus, React integration
- **Benefits**: Accessibility testing, user behavior simulation, maintainable tests

**MSW v2.10.5** - API Mocking

- **Why**: Service Worker-based mocking, realistic network behavior, cross-platform support
- **Benefits**: Realistic API responses, network error simulation, development server mocking

**Quality Tools**:

- **Oxlint v1.13.0**: Rust-powered linting, 50x faster than ESLint
- **dprint v0.50.0**: Fast code formatting, consistent style
- **TypeScript Strict Mode**: Maximum type safety for data integrity

### Deployment & Infrastructure Stack

**Vercel Platform** - Hosting & Edge Functions

- **Why**: Brazilian edge locations (São Paulo), React support, edge functions, global CDN
- **Benefits**: São Paulo region (gru1), automatic HTTPS, preview deployments
- **Config**: Node.js 20 runtime, edge function optimization
- **Performance**: <1.5s First Contentful Paint, <2.5s Largest Contentful Paint

**GitHub Actions** - CI/CD Pipeline

- **Why**: Native GitHub integration, extensive marketplace, security features
- **Benefits**: Workflow automation, security scanning, deployment automation
- **Security**: Pinned action versions, secret management, supply chain security

**Docker v24.0.7** - Containerization

- **Why**: Consistent environments, reproducible builds, industry standard
- **Benefits**: Environment consistency, dependency isolation, scalability
- **Usage**: Development environments, testing isolation, production consistency

### Monitoring & Analytics Stack

**Vercel Analytics v1.2.2** - Performance Monitoring

- **Why**: Built-in Vercel integration, Core Web Vitals tracking, privacy-first approach
- **Features**: Core Web Vitals, user experience metrics, performance optimization insights
- **Compliance**: LGPD-compliant analytics, no personal data collection

**Custom Audit Logging** - Compliance Tracking

- **Why**: Audit trail requirements, data access tracking, custom compliance needs
- **Benefits**: Complete audit trail, compliance support, data sovereignty
- **Implementation**: Supabase-based logging, encrypted storage, retention policies

## Major Technology Decisions & Rationale

### Frontend Framework: TanStack Router + Vite vs Next.js

**Decision**: TanStack Router + Vite + React 19
**Key Factors**:

- **Type Safety**: Full type-safe routing vs Next.js partial type safety
- **Performance**: Vite HMR (<100ms) vs Next.js slower builds
- **Flexibility**: Greater build control vs opinionated structure
- **Bundle Size**: Smaller bundles with better tree shaking

**Impact**: 40% faster development builds, improved type safety, ~180KB gzipped bundle

### Backend Framework: Hono.dev vs Express/Fastify

**Decision**: Hono.dev v4.5.8
**Key Factors**:

- **Performance**: 3x faster than Express, edge runtime optimized
- **Size**: <10KB vs Express 200KB+, crucial for serverless
- **TypeScript**: Built-in support vs additional setup required
- **Edge Compatibility**: Native edge runtime support

**Impact**: Faster API responses, smaller serverless functions, better TypeScript experience

### Database: Supabase vs Traditional PostgreSQL/MySQL

**Decision**: Supabase PostgreSQL
**Key Factors**:

- **Real-time**: Built-in subscriptions essential for clinic operations
- **Authentication**: Compliant auth system vs custom implementation
- **Row Level Security**: Database-level isolation for multi-tenant
- **Developer Experience**: Reduced backend complexity

**Impact**: 60% reduction in backend code, built-in compliance features, real-time capabilities

### AI Provider: Multi-Provider vs Single Provider

**Decision**: OpenAI GPT-4 + Anthropic Claude via Vercel AI SDK
**Key Factors**:

- **Reliability**: Failover capability vs single point of failure
- **Cost Optimization**: Provider switching based on usage patterns
- **Feature Diversity**: GPT-4 for Portuguese, Claude for reasoning
- **Vendor Independence**: Reduced lock-in risk

**Impact**: 99.9% AI service uptime, cost optimization, feature diversity

## Version Management & Upgrade Strategy

### Current Version Status

**Core Technologies**:

- **React**: 19.1.1 (latest stable) - Concurrent features
- **TypeScript**: 5.9.2 (latest stable) - Latest language features
- **Node.js**: 20+ (LTS) - Long-term support
- **Vite**: 7.1.5 (latest stable) - Modern build tooling

**Framework Versions**:

- **TanStack Router**: Latest (stable) - Type-safe routing
- **Hono.dev**: 4.9.7 (stable) - Edge-compatible framework (Security patched)
- **Supabase**: 2.45.1 (stable) - Backend-as-a-service
- **Vercel AI SDK**: 5.0.23 (stable) - Multi-provider AI

### Upgrade Philosophy

**LTS Strategy**: Prefer Long-Term Support versions for stability

- Node.js: Always LTS (currently 20.x)
- React: Stable releases only, avoid pre-release
- TypeScript: Latest stable for new features

**Update Frequency**:

- **Security Patches**: Immediate (within 24 hours)
- **Minor Updates**: Monthly review and application
- **Major Updates**: Quarterly evaluation with testing
- **Breaking Changes**: Planned migration with rollback

**Dependency Management**:

- **Pinned Versions**: Critical dependencies pinned
- **Range Updates**: Non-critical use semantic versioning
- **Security Scanning**: Automated with Dependabot
- **Update Testing**: Comprehensive before production

### Performance Metrics & Benchmarks

**Build Performance**:

- **Cold Build**: ~35s (7 packages + 2 apps)
- **Incremental Build**: ~3s (Turborepo cache)
- **Type Check**: ~8s (strict mode)
- **Test Suite**: ~12s (Vitest)
- **Dev Server**: ~2s (Vite startup)

**Runtime Performance**:

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <3s
- **Bundle Size**: ~180KB gzipped

**Database Performance**:

- **Query Response**: <100ms (95th percentile)
- **Real-time Updates**: <50ms latency
- **Connection Pool**: Serverless optimized
- **Index Performance**: Sub-millisecond lookups

## Security & Compliance Technologies

### Data Protection Stack

**Encryption**:

- **At Rest**: AES-256 (Supabase native)
- **In Transit**: TLS 1.3 for all communications
- **JWT Handling**: JOSE library with Web Crypto API
- **Key Management**: Separate encryption keys per clinic

**Authentication**:

- **Primary**: Supabase Auth with MFA support
- **Biometric**: WebAuthn for passwordless authentication
- **Password Hashing**: bcryptjs (cost 12+) with Argon2id migration
- **Session Management**: Secure JWT with refresh tokens

**PII Protection**:

- **Automatic Redaction**: AI conversation sanitization
- **Data Masking**: Sensitive data display protection
- **Access Logging**: Complete audit trail for all data access

### Compliance Technologies

**LGPD Compliance**:

- **Consent Management**: Granular consent tracking with versioning
- **Data Export**: Automated data portability functionality
- **Data Deletion**: Secure erasure with compliance verification
- **Audit Trails**: Complete data access logging with retention policies

**ANVISA Compliance**:

- **Device Validation**: Real-time medical device registration checking
- **Compliance Monitoring**: Continuous device compliance status tracking
- **Audit Logging**: Immutable records for regulatory reporting

**Standards Compliance**:

- **Medical Device Software**: SaMD Class I compliance framework
- **Professional Regulation**: CFM professional standards adherence
- **Data Residency**: Brazilian data center requirements

### Deployment & Infrastructure Stack

**Vercel Platform** - Hosting & Edge Functions

- **Why**: Brazilian edge locations (São Paulo), React support, edge functions, global CDN
- **Benefits**: São Paulo region (gru1), automatic HTTPS, preview deployments
- **Config**: Node.js 20 runtime, edge function optimization
- **Performance**: <1.5s First Contentful Paint, <2.5s Largest Contentful Paint

**GitHub Actions** - CI/CD Pipeline

- **Why**: Native GitHub integration, extensive marketplace, security features
- **Benefits**: Workflow automation, security scanning, deployment automation
- **Security**: Pinned action versions, secret management, supply chain security

**Docker v24.0.7** - Containerization

- **Why**: Consistent environments, reproducible builds, industry standard
- **Benefits**: Environment consistency, dependency isolation, scalability
- **Usage**: Development environments, testing isolation, production consistency

**📋 Deployment Documentation**: See comprehensive deployment guide at [`../features/deploy-vercel.md`](../features/deploy-vercel.md) for implementation details, checklist, and production readiness validation.

## Technology Roadmap & Future Considerations

### Short-term Improvements (Q1 2025)

**Performance Optimizations**:

- **Advanced Code Splitting**: Route-based and component-based splitting
- **CDN Optimization**: Enhanced edge caching strategies
- **Database Query Optimization**: Materialized views and advanced indexing
- **AI Response Caching**: Intelligent caching for common queries

**Developer Experience**:

- **Faster Hot Reload**: Sub-50ms reload times
- **Improved Type Generation**: Faster database type generation
- **Enhanced Testing**: Visual regression testing integration
- **Interactive API Documentation**: Auto-generated API docs with examples

### Long-term Evolution (2025-2026)

**Technology Upgrades**:

- **React 20**: When stable, for improved performance features
- **TypeScript 6**: Latest language features and performance improvements
- **Supabase v3**: Enhanced real-time capabilities and performance
- **Edge Runtime Expansion**: Broader edge function capabilities

**New Capabilities**:

- **Offline Support**: Progressive Web App with offline functionality
- **Mobile Applications**: React Native apps for iOS and Android
- **Custom AI Models**: Fine-tuned models for Brazilian healthcare
- **Multi-Region Expansion**: Additional Brazilian data centers

**Infrastructure Evolution**:

- **Kubernetes Migration**: For complex multi-service deployments
- **Microservices Architecture**: Service extraction for scale
- **Advanced Monitoring**: Comprehensive observability stack
- **Multi-Cloud Strategy**: Vendor diversification for resilience

## Summary

The NeonPro technology stack represents a curated selection of modern, performant technologies chosen for type safety, performance, developer experience, and compliance readiness.

**Key Technology Strengths**:

- **Type Safety**: End-to-end TypeScript with strict mode for data integrity
- **Performance**: Sub-second response times with edge optimization
- **Developer Experience**: Modern tooling with excellent debugging workflows
- **Scalability**: Architecture ready for multi-clinic expansion
- **Compliance**: Built-in LGPD and ANVISA compliance features

**Technology Philosophy**: Choose proven, well-supported technologies with strong communities, clear documentation, and upgrade paths. Prioritize developer productivity while maintaining high standards for data security and compliance.

**Decision Framework**: Every technology choice evaluated against performance, type safety, compliance readiness, developer experience, and long-term maintainability criteria.

---

**Document Status**: ✅ Optimized - Technology Decisions and Rationale
**Focus**: WHICH technologies and WHY they were chosen
**Target Length**: 250-300 lines (Current: ~290 lines)
**Last Updated**: 2025-09-09
**Next Review**: 2025-12-09
