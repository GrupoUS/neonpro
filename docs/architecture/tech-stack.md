# Tech Stack - NeonPro AI Advanced Aesthetic Platform 2025

> **AI-First, Advanced Aesthetic-Optimized Architecture with Constitutional Service Layer**

## Executive Summary

NeonPro utiliza uma arquitetura moderna e otimizada para clínicas de estética brasileiras, combinando performance, compliance e inteligência artificial. O stack foi cuidadosamente selecionado para atender aos requisitos específicos do PRD, incluindo Engine Anti-No-Show, Universal AI Chat e compliance LGPD/ANVISA.

**Arquitetura**: Turborepo monorepo com 2 aplicações + 8 packages essenciais\
**Deployment**: Vercel (região gru1 - São Paulo)\
**Database**: Supabase PostgreSQL com real-time subscriptions\
**AI Integration**: OpenAI GPT-4 + Anthropic Claude via Vercel AI SDK

## Current Tech Stack (Verified September 2025)

Esta seção reflete a configuração atual verificada nos manifestos de pacotes e configurações em apps e packages.

### 🏗️ **Monorepo & Build System**

| Technology     | Version | Purpose                      | Rationale                                                                |
| -------------- | ------- | ---------------------------- | ------------------------------------------------------------------------ |
| **Turborepo**  | ^2.5.6  | Monorepo build orchestration | Intelligent caching, parallel builds, optimized for healthcare workflows |
| **pnpm**       | 8.15.0  | Package manager              | Fast installs, efficient disk usage, workspace protocol support          |
| **Bun**        | Latest  | Scripts and audits           | 3-5x faster than npm for development tasks                               |
| **TypeScript** | 5.7.2   | Type safety                  | Strict mode for healthcare data safety, latest features                  |

**Build Configuration**:

- `turbo.json`: Optimized task pipeline with caching
- `pnpm-workspace.yaml`: Workspace configuration
- `bunfig.toml`: Bun optimization settings

### 🎨 **Frontend Stack (apps/web)**

| Technology       | Version | Purpose           | Rationale                                    |
| ---------------- | ------- | ----------------- | -------------------------------------------- |
| **Next.js**      | ^15.5.0 | React framework   | App Router, RSC, optimal for Brazilian SEO   |
| **React**        | ^19.1.1 | UI library        | Latest features, concurrent rendering        |
| **TypeScript**   | 5.7.2   | Type safety       | Healthcare data type safety                  |
| **Tailwind CSS** | ^3.3.0  | Styling framework | Rapid development, healthcare design tokens  |
| **shadcn/ui**    | v4      | Component library | WCAG 2.1 AA compliance, healthcare optimized |

**UI & Styling**:

- **Radix UI**: Accessible primitives for healthcare interfaces
- **Lucide React**: Icon library with healthcare-specific icons
- **Framer Motion**: Smooth animations for better UX
- **class-variance-authority**: Type-safe component variants
- **tailwind-merge**: Efficient class merging

**Forms & Validation**:

- **React Hook Form** ^7.62.0: Performance-focused form handling
- **Zod** ^3.23.8: Runtime schema validation for healthcare data
- **@hookform/resolvers**: Zod integration with React Hook Form

### 🔐 **Authentication & Security**

| Technology        | Version                | Purpose                 | Rationale                                 |
| ----------------- | ---------------------- | ----------------------- | ----------------------------------------- |
| **Supabase Auth** | ^2.38.5                | Authentication provider | LGPD compliant, healthcare-grade security |
| **NextAuth.js**   | ^4.24.11               | Auth framework          | Session management, provider integration  |
| **WebAuthn**      | @simplewebauthn/server | Biometric auth          | Enhanced security for healthcare data     |
| **JWT**           | jose library           | Token handling          | Secure token validation and generation    |
| **bcryptjs**      | ^2.4.3                 | Password hashing        | Industry standard password security       |

- Single source of truth: Supabase Auth is the canonical session provider. Do not run NextAuth.js as an independent session store; if used, integrate it as a thin adapter over Supabase sessions to prevent drift.
- Session exposure: Supabase sessions are accessed via server components/middleware and propagated to the client as needed.
- Password hashing: Prefer Argon2id when implementing in-house hashing (memory-hard). If retaining bcryptjs, use cost >= 12 and ensure CPU/memory budgets for serverless are respected. Document migration steps for existing bcrypt hashes.

### 🗄️ **Database & Data Layer**

| Technology            | Version  | Purpose              | Rationale                                    |
| --------------------- | -------- | -------------------- | -------------------------------------------- |
| **Supabase**          | ^2.45.1  | Backend-as-a-Service | PostgreSQL + real-time + auth + storage      |
| **PostgreSQL**        | 15+      | Primary database     | ACID compliance, healthcare data integrity   |
| **Prisma**            | ^5.22.0  | ORM                  | Type-safe database access, migrations        |
| **Supabase Realtime** | Included | Live updates         | Real-time appointment updates, notifications |

**Data Management**:

- **Row Level Security (RLS)**: Database-level data isolation
- **Audit Logging**: Comprehensive healthcare data access tracking
- **LGPD Compliance**: Built-in data protection and consent management
- **Backup Strategy**: Automated backups with point-in-time recovery

### 🤖 **AI & Machine Learning**

| Technology           | Version                  | Purpose           | Rationale                                     |
| -------------------- | ------------------------ | ----------------- | --------------------------------------------- |
| **Vercel AI SDK**    | ^5.0.23                  | AI framework      | Unified interface for multiple AI providers   |
| **OpenAI GPT-4**     | @ai-sdk/openai ^2.0.15   | Conversational AI | Universal AI Chat, Portuguese optimization    |
| **Anthropic Claude** | @ai-sdk/anthropic ^2.0.4 | AI assistant      | Backup provider, specialized healthcare tasks |
| **TensorFlow.js**    | Latest                   | Client-side ML    | Anti-No-Show prediction engine                |

**AI Features Implementation**:

- **Universal AI Chat**: Portuguese-optimized conversational AI
- **Anti-No-Show Engine**: Predictive analytics for appointment attendance
- **Natural Language Processing**: Brazilian Portuguese healthcare terminology
- **Vector Database**: Knowledge base for healthcare procedures

#### AI Provider Governance

- Timeouts: default 15s; provider overrides supported via config (e.g., ai.providers.openai.timeoutMs).
- Retries: exponential backoff, maxRetries=3, baseDelay=500ms, backoffFactor=2.
- Failover: primary→secondary order [OpenAI → Anthropic]; triggers on timeout, 5xx, or safety block; sticky per request.
- Data retention: prompts/logs retained 7 days (LGPD-compliant); PII minimized; redaction rules applied before logging.
- PII stripping: client-side and middleware filters remove phone numbers, emails, and patient IDs; see configs in apps/web/lib/ai-sanitizer.ts and apps/api/src/middleware/audit.ts.

### 🔧 **Backend API (apps/api)**

| Technology              | Version | Purpose            | Rationale                          |
| ----------------------- | ------- | ------------------ | ---------------------------------- |
| **Hono.dev**            | ^4.5.8  | Web framework      | Lightweight, fast, edge-compatible |
| **Node.js**             | 20+     | Runtime            | Vercel Functions compatibility     |
| **@hono/node-server**   | ^1.12.0 | Server adapter     | Production deployment              |
| **@hono/zod-validator** | ^0.2.2  | Request validation | Type-safe API validation           |

**API Features**:

- **RESTful APIs**: Healthcare data management endpoints
- **Real-time WebSockets**: Live appointment updates
- **Webhook Handlers**: WhatsApp Business API integration
- **CORS Configuration**: Secure cross-origin requests

#### Webhook Security (WhatsApp Business)

- Signature verification: extract `X-Hub-Signature-256` (or provider header), compute HMAC (SHA-256) using app secret over raw body, and reject on mismatch.
- Idempotency: validate and persist event IDs; ignore duplicates on retry.
- Retry/backoff: handle provider retries with exponential backoff; safe to retry as handlers are idempotent; respect retry headers if provided.

### 📱 **State Management & Data Fetching**

| Technology          | Version | Purpose      | Rationale                                       |
| ------------------- | ------- | ------------ | ----------------------------------------------- |
| **Zustand**         | ^4.4.0  | Client state | Lightweight, TypeScript-first                   |
| **TanStack Query**  | ^5.62.0 | Server state | Caching, background updates, optimistic updates |
| **TanStack Router** | Latest  | Routing      | Type-safe routing with data loading             |

### 🧪 **Testing & Quality Assurance**

| Technology          | Version | Purpose           | Rationale                                    |
| ------------------- | ------- | ----------------- | -------------------------------------------- |
| **Vitest**          | ^3.2.0  | Unit testing      | Fast, Vite-powered, Jest-compatible          |
| **Testing Library** | ^16.3.0 | Component testing | User-centric testing approach                |
| **Playwright**      | ^1.40.0 | E2E testing       | Cross-browser, reliable healthcare workflows |
| **MSW**             | ^2.10.5 | API mocking       | Realistic API testing                        |

**Quality Tools**:

- **Oxlint** ^1.13.0: Fast linting with healthcare-specific rules
- **dprint** ^0.50.0: Code formatting
- **TypeScript**: Strict mode for type safety

### 📊 **Monitoring & Analytics**

| Technology                | Version  | Purpose                  | Rationale                        |
| ------------------------- | -------- | ------------------------ | -------------------------------- |
| **Vercel Analytics**      | 1.2.2    | Performance monitoring   | Core Web Vitals, user experience |
| **Vercel Speed Insights** | 1.0.4    | Performance optimization | Real user monitoring             |
| **Custom Audit Logging**  | Internal | Healthcare compliance    | LGPD audit trail requirements    |

- LGPD compliance: client-side analytics disabled by default pending explicit opt-in consent.
- Consent mechanism: consent banner with state stored server-side or in user profile; enforce before any data transmission.
- Anonymization: IP truncation, no persistent device IDs, pseudonymous user identifiers.
- Server-side toggle: ensure analytics SDKs do not initialize until consent is granted.

### 🚀 **Deployment & Infrastructure**

| Technology         | Version        | Purpose          | Rationale                                    |
| ------------------ | -------------- | ---------------- | -------------------------------------------- |
| **Vercel**         | pinned project | Hosting platform | Edge functions, global CDN, Brazilian region |
| **Docker**         | 24.0.7         | Containerization | Consistent environments, reproducible builds |
| **GitHub Actions** | actions@v4/SHA | CI/CD            | Pinned actions reduce supply-chain risk      |

Note: Pin all GitHub Actions to exact versions or commit SHAs (e.g., uses: actions/checkout@v4 or @<commit-sha>) to ensure reproducible builds and mitigate supply-chain risk.

**Deployment Configuration**:

- **Region**: gru1 (São Paulo) for Brazilian latency optimization
- **Runtime**: Node.js 20 with edge function support
- **Security Headers**: CSP, HSTS, X-Frame-Options configured
- **Environment**: Production, staging, development environments

## 📋 **PRD Requirements Mapping**

### **Universal AI Chat Requirements**

✅ **Implemented**:

- OpenAI GPT-4 for conversational AI
- Portuguese language optimization
- Vercel AI SDK for unified interface
- Real-time chat via Supabase

🔄 **In Progress**:

- WhatsApp Business API integration
- Custom healthcare knowledge base
- Natural language appointment booking

### **Engine Anti-No-Show Requirements**

✅ **Implemented**:

- TensorFlow.js for client-side ML
- Supabase for patient behavior data
- Real-time prediction scoring

🔄 **In Progress**:

- Custom ML model training
- Behavioral pattern analysis
- Automated intervention triggers

### **LGPD/ANVISA Compliance Requirements**

✅ **Implemented**:

- Supabase RLS for data isolation
- Audit logging infrastructure
- Consent management system
- Data encryption at rest and transit

### **Mobile-First Requirements**

✅ **Implemented**:

- Tailwind CSS responsive design
- Next.js App Router for performance
- PWA capabilities
- Touch-optimized interfaces

## 🔧 **Package Dependencies Analysis**

### **Critical Dependencies**

```json
{
  "next": "^15.5.0",
  "react": "^19.1.1",
  "typescript": "^5.7.2",
  "@supabase/supabase-js": "^2.45.1",
  "ai": "^5.0.23",
  "hono": "^4.5.8",
  "prisma": "^5.22.0"
}
```

### **Development Dependencies**

```json
{
  "turbo": "^2.5.6",
  "vitest": "^3.2.0",
  "oxlint": "^1.13.0",
  "typescript": "^5.7.2"
}
```

### **Security Dependencies**

```json
{
  "jose": "^5.1.3",
  "bcryptjs": "^2.4.3",
  "zod": "^3.23.8"
}
```

## 🎯 **MVP Technology Priorities**

### **Phase 1: Core Platform (Current)**

- ✅ Next.js 15 + React 19 frontend
- ✅ Hono.dev API backend
- ✅ Supabase database + auth
- ✅ Basic AI integration
- ✅ TypeScript strict mode

### **Phase 2: AI Enhancement (In Progress)**

- 🔄 Advanced AI chat capabilities
- 🔄 Anti-No-Show ML models
- 🔄 WhatsApp Business integration
- 🔄 Real-time notifications

### **Phase 3: Advanced Features (Planned)**

- 📋 Advanced analytics dashboard
- 📋 Multi-clinic support
- 📋 Advanced compliance reporting
- 📋 Third-party integrations

## 🚨 **Technology Decisions & Rationale**

### **Why Next.js 15 over alternatives?**

- **App Router**: Modern routing with React Server Components
- **Performance**: Optimal Core Web Vitals for Brazilian users
- **SEO**: Critical for clinic discovery in Brazilian market
- **Vercel Integration**: Seamless deployment and edge functions

### **Why Hono.dev over Express/Fastify?**

- **Performance**: 3x faster than Express
- **API Runtime**: Hono API on Vercel Functions (Edge-compatible where applicable)
- **Type Safety**: Built-in TypeScript support
- **Lightweight**: Minimal overhead for healthcare APIs

### **Why Supabase over traditional databases?**

- **Real-time**: Essential for appointment updates
- **Auth Built-in**: LGPD-compliant authentication
- **Row Level Security**: Database-level data isolation
- **PostgreSQL**: ACID compliance for healthcare data

### **Why Turborepo over Nx/Lerna?**

- **Performance**: Intelligent caching and parallel builds
- **Simplicity**: Easier configuration and maintenance
- **Vercel Integration**: Optimized for Vercel deployment
- **TypeScript**: First-class TypeScript support

## 📈 **Performance Metrics**

### **Build Performance**

- **Cold Build**: ~45 seconds (8 packages + 2 apps)
- **Incremental Build**: ~5 seconds (with Turbo cache)
- **Type Check**: ~8 seconds (strict mode)
- **Test Suite**: ~12 seconds (Vitest)

### **Runtime Performance**

- **First Contentful Paint**: <1.5s (Brazilian users)
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <3s

### **Bundle Sizes**

- **Frontend Bundle**: ~180KB gzipped
- **API Bundle**: ~45KB
- **Shared Packages**: ~25KB each

## 🔒 **Security & Compliance**

### **Data Protection**

- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: Multi-factor with WebAuthn support
- **Authorization**: Role-based with RLS
- **Audit Logging**: Comprehensive healthcare data access tracking

### **Brazilian Compliance**

- **LGPD**: Data protection and consent management
- **ANVISA**: Medical device regulations compliance
- **CFM**: Medical council regulations
- **Healthcare Standards**: HL7 FHIR compatibility planned

### **Security Headers**

```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'strict-dynamic' https: 'nonce-<generated>'",
      "style-src 'self' https:",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-src 'none'",
      "worker-src 'self'",
      "base-uri 'none'",
      "form-action 'self'",
      "object-src 'none'",
      'block-all-mixed-content',
      'upgrade-insecure-requests',
    ].join('; ',),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
]
```

Note: Deploy CSP initially as Content-Security-Policy-Report-Only to collect violations before enforcing. Only add HSTS preload after verifying HTTPS on all subdomains and submitting to the preload list.

## 🔄 **Migration & Upgrade Strategy**

### **Current Version Status**

- **Next.js**: 15.5.0 (latest stable)
- **React**: 19.1.1 (latest stable)
- **TypeScript**: 5.7.2 (latest stable)
- **Node.js**: 20+ (LTS)

### **Upgrade Path**

1. **Quarterly Updates**: Minor version updates
2. **Annual Reviews**: Major version evaluations
3. **Security Patches**: Immediate application
4. **LTS Strategy**: Prefer LTS versions for stability

### **Rollback Strategy**

- **Database Migrations**: Reversible with Prisma
- **Feature Flags**: Gradual rollout capability
- **Blue-Green Deployment**: Zero-downtime updates
- **Backup Strategy**: Point-in-time recovery

---

**Tech Stack Status**: ✅ **Production Ready & PRD Aligned**\
**Performance**: Optimized for Brazilian healthcare workflows\
**Compliance**: LGPD + ANVISA + CFM ready\
**Scalability**: Designed for multi-clinic expansion\
**Last Updated**: September 2025 - Current State Verified
