# Architecture Rules Checklist - NeonPro Healthcare Platform

> **Generated from PREP-002**: Comprehensive architecture documentation audit\
> **Source Documents**: docs/architecture/*.md (5 files, 4,710 total lines)\
> **Date**: 2025-09-06\
> **Purpose**: Compliance verification and implementation guidance

## 🏗️ **Core Architecture Rules**

### **Monorepo Structure (MANDATORY)**

- [ ] **Turborepo 2.5.6** with pnpm workspaces configured
- [ ] **2 apps + 8 packages** structure maintained (MVP simplified)
- [ ] **Package boundaries** respected: no cross-package imports outside defined dependencies
- [ ] **Workspace protocol** used for internal package dependencies
- [ ] **Build system** uses intelligent caching with turbo.json configuration

**Verification Commands**:

```bash
# Check structure compliance
pnpm workspace-structure-check
turbo build --dry-run
```

### **Technology Stack (STRICT VERSION REQUIREMENTS)**

- [ ] **TypeScript 5.7.2** - strict mode enabled, no `any` types
- [ ] **Next.js 15.5.2** - App Router only, no Pages Router
- [ ] **React 19.0.0** - Server Components by default, Client Components when needed
- [ ] **Node.js 20+ LTS** - for runtime compatibility
- [ ] **pnpm 8.15.0** - package manager with workspace support

**Critical Dependencies**:

- [ ] **Supabase**: ^2.45.1 (auth + database + realtime)
- [ ] **Hono.dev**: ^4.5.8 (API framework)
- [ ] **Tailwind CSS**: ^3.4.0 (styling framework)
- [ ] **shadcn/ui**: v4 (component library)
- [ ] **Prisma**: ^5.22.0 (ORM)

## 🎨 **Frontend Architecture Rules**

### **Component Standards (MANDATORY)**

- [ ] **PascalCase.tsx** naming for all components
- [ ] **Props interface** defined for every component (ComponentNameProps)
- [ ] **forwardRef** used when exposing DOM elements
- [ ] **displayName** set for debugging purposes
- [ ] **Audit logging** integrated via useAuditLogging hook for healthcare components

**Template Compliance**:

```typescript
// REQUIRED: Component template structure
interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
  // ... specific props
}

export function ComponentName({ className, children, ...props }: ComponentNameProps) {
  const { logComponentView } = useAuditLogging();

  useEffect(() => {
    logComponentView("ComponentName");
  }, []);

  return (
    <div className={cn("base-styles", className)} {...props}>
      {children}
    </div>
  );
}

ComponentName.displayName = "ComponentName";
```

### **State Management Rules**

- [ ] **Zustand** for client state (no Redux/Context API for global state)
- [ ] **TanStack Query** for server state management
- [ ] **React Server Components** for initial data fetching
- [ ] **Immutable updates** in all state mutations
- [ ] **Persist middleware** only for user preferences (not sensitive data)

**Store Structure Compliance**:

- [ ] **Immer middleware** for immutable updates
- [ ] **DevTools middleware** in development only
- [ ] **Clear actions** with descriptive names
- [ ] **Selectors** exported for computed values

### **Routing Rules (App Router)**

- [ ] **App Router** structure: page.tsx, layout.tsx, route.ts
- [ ] **Route Groups** used for organization: (auth), (dashboard)
- [ ] **Protected routes** wrapped with authentication middleware
- [ ] **Server Components** by default for pages
- [ ] **Client Components** explicitly marked with "use client"

### **Styling Requirements**

- [ ] **Tailwind CSS** utility-first approach
- [ ] **Healthcare color palette** defined in globals.css
- [ ] **Design tokens** used for consistent spacing/typography
- [ ] **Dark mode support** via data-theme attribute
- [ ] **WCAG 2.1 AA compliance** verified for all components

## 🔐 **Security & Authentication Rules**

### **Authentication (Supabase Auth)**

- [ ] **Single source of truth**: Supabase Auth is canonical session provider
- [ ] **NextAuth.js** used only as adapter over Supabase sessions (no independent session store)
- [ ] **JWT tokens** stored in httpOnly cookies with secure flag
- [ ] **Session refresh** implemented with sliding expiration
- [ ] **Password hashing**: Argon2id preferred (bcrypt acceptable with cost ≥12)

### **Authorization Rules**

- [ ] **Role-based access control** implemented via user roles
- [ ] **Row Level Security (RLS)** enabled on all sensitive tables
- [ ] **Middleware authentication** on protected routes
- [ ] **Professional type verification** for clinic-specific access
- [ ] **Clinic isolation** enforced at database level

### **Security Headers (MANDATORY)**

- [ ] **Content Security Policy (CSP)** implemented with nonces
- [ ] **Strict Transport Security (HSTS)** configured
- [ ] **X-Frame-Options**: DENY
- [ ] **X-Content-Type-Options**: nosniff
- [ ] **Referrer-Policy**: strict-origin-when-cross-origin

**CSP Template**:

```javascript
// REQUIRED: Security headers configuration
"Content-Security-Policy": [
  "default-src 'self'",
  "script-src 'self' 'strict-dynamic' https: 'nonce-<generated>'",
  "style-src 'self' https:",
  "img-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'self'"
].join("; ")
```

## 🏥 **Healthcare Compliance Rules**

### **LGPD Compliance (MANDATORY)**

- [ ] **Consent management** system implemented
- [ ] **Data minimization** principles applied
- [ ] **Audit logging** for all PHI access
- [ ] **Data retention** policies automated
- [ ] **Patient rights** endpoints implemented (export, delete)
- [ ] **Encryption** for all PII data (CPF, RG, medical records)

### **Healthcare Data Protection**

- [ ] **PHI sanitization** before AI processing
- [ ] **Data masking** based on user permissions
- [ ] **Secure data transmission** (TLS 1.3)
- [ ] **Database encryption** at rest (AES-256)
- [ ] **Access logging** with audit trail

### **Brazilian Healthcare Standards**

- [ ] **ANVISA compliance** for medical device validation
- [ ] **CFM regulations** compliance for medical council requirements
- [ ] **Portuguese language** support (pt-BR locale)
- [ ] **Brazilian date/time formatting** implemented
- [ ] **CPF/CNPJ validation** with proper formatting

## 🤖 **AI Integration Rules**

### **AI Provider Configuration**

- [ ] **Vercel AI SDK** as unified interface
- [ ] **Primary provider**: OpenAI GPT-4 for Portuguese
- [ ] **Fallback provider**: Anthropic Claude
- [ ] **Timeout configuration**: 15s default, configurable per provider
- [ ] **Retry logic**: exponential backoff, maxRetries=3

### **AI Safety & Compliance**

- [ ] **PII stripping** client-side and middleware
- [ ] **PHI detection** before AI processing
- [ ] **Data retention**: 7 days max for prompts/logs
- [ ] **Prompt sanitization** for healthcare context
- [ ] **Response validation** for medical accuracy

**AI Governance Rules**:

```typescript
// REQUIRED: AI sanitization pattern
const sanitizedData = await PHIMasker.sanitizeForAI(userData);
const aiResponse = await aiService.chat(sanitizedData);
await auditLogger.logAIInteraction(session.user.id, "chat", { sanitized: true });
```

## 📊 **Database Rules**

### **Supabase Database Standards**

- [ ] **PostgreSQL 15+** as primary database
- [ ] **Prisma ORM** for type-safe database access
- [ ] **Row Level Security (RLS)** enabled on all tables
- [ ] **Audit logging** table with comprehensive event tracking
- [ ] **Real-time subscriptions** for live updates

### **Schema Requirements**

- [ ] **UUID primary keys** for all tables
- [ ] **Timestamps** (created_at, updated_at) on all entities
- [ ] **Soft deletes** via is_active flags
- [ ] **Foreign key constraints** properly defined
- [ ] **Indexes** optimized for query patterns

### **Data Types & Validation**

- [ ] **Encrypted columns** for sensitive data (BYTEA type)
- [ ] **JSONB** for flexible data structures (consent, metadata)
- [ ] **Enum types** for constrained values
- [ ] **Check constraints** for data validation
- [ ] **Text search** indexes for patient/appointment search

## 🧪 **Testing Requirements**

### **Test Coverage Standards**

- [ ] **80% code coverage** minimum
- [ ] **Unit tests** for all business logic
- [ ] **Integration tests** for API endpoints
- [ ] **Component tests** for UI components
- [ ] **E2E tests** for critical user flows

### **Testing Tools Compliance**

- [ ] **Vitest** for unit/integration tests
- [ ] **Testing Library** for component tests
- [ ] **Playwright** for E2E tests
- [ ] **MSW** for API mocking
- [ ] **Accessibility testing** integrated in component tests

### **Healthcare-Specific Testing**

- [ ] **LGPD compliance** scenarios tested
- [ ] **Audit logging** verification in tests
- [ ] **Data masking** tested for different user roles
- [ ] **Portuguese language** content tested
- [ ] **Accessibility** (WCAG 2.1 AA) automated testing

## 🚀 **Performance Rules**

### **Core Web Vitals Targets**

- [ ] **Largest Contentful Paint (LCP)**: < 2.5s
- [ ] **First Input Delay (FID)**: < 100ms
- [ ] **Cumulative Layout Shift (CLS)**: < 0.1
- [ ] **Time to Interactive (TTI)**: < 3s
- [ ] **First Contentful Paint (FCP)**: < 1.5s

### **Bundle Optimization**

- [ ] **Frontend bundle**: < 180KB gzipped
- [ ] **API bundle**: < 45KB per function
- [ ] **Shared packages**: < 25KB each
- [ ] **Code splitting** implemented for routes
- [ ] **Tree shaking** enabled in production builds

### **Caching Strategy**

- [ ] **Turborepo caching** for builds
- [ ] **Next.js caching** for static assets
- [ ] **Supabase cache** for database queries
- [ ] **Service worker** for offline capabilities
- [ ] **CDN caching** via Vercel Edge Network

## 🔧 **Development Workflow Rules**

### **Build System Requirements**

- [ ] **Turborepo pipeline** configured in turbo.json
- [ ] **Parallel builds** for independent packages
- [ ] **Type checking** in build process
- [ ] **Lint checks** as pre-build step
- [ ] **Test execution** in CI pipeline

### **Code Quality Standards**

- [ ] **TypeScript strict mode** enabled
- [ ] **Oxlint** for fast linting
- [ ] **dprint** for code formatting
- [ ] **Pre-commit hooks** configured
- [ ] **Conventional commits** for changelog

### **Environment Configuration**

- [ ] **Environment variables** properly typed
- [ ] **NEXT_PUBLIC_** prefix for client-side vars only
- [ ] **Config objects** in packages/config
- [ ] **Environment validation** on startup
- [ ] **Feature flags** for gradual rollouts

## 📱 **Mobile & Accessibility Rules**

### **Responsive Design (Mobile-First)**

- [ ] **Mobile-first CSS** implementation
- [ ] **Touch targets** minimum 44px height/width
- [ ] **Responsive breakpoints** defined in Tailwind config
- [ ] **Progressive Web App (PWA)** capabilities
- [ ] **Offline functionality** for critical features

### **Accessibility Compliance (WCAG 2.1 AA)**

- [ ] **Semantic HTML** used throughout
- [ ] **ARIA labels** for complex components
- [ ] **Keyboard navigation** support
- [ ] **Screen reader** compatibility
- [ ] **Color contrast** ratios compliant
- [ ] **Portuguese language** attributes (lang="pt-BR")

## 🔄 **Integration Rules**

### **External API Integration**

- [ ] **WhatsApp Business API** for patient communication
- [ ] **Brazilian SMS providers** for notifications
- [ ] **ANVISA API** for device validation
- [ ] **Webhook security** with signature verification
- [ ] **Rate limiting** and retry logic implemented

### **Monitoring & Observability**

- [ ] **Vercel Analytics** for performance monitoring
- [ ] **Audit logging** for healthcare compliance
- [ ] **Error tracking** with structured logging
- [ ] **Performance monitoring** for Core Web Vitals
- [ ] **LGPD compliance** analytics opt-in only

## ✅ **Verification Checklist**

### **Pre-deployment Verification**

- [ ] All architectural rules above verified
- [ ] Security headers tested
- [ ] LGPD compliance validated
- [ ] Performance targets met
- [ ] Accessibility standards verified
- [ ] Brazilian healthcare compliance checked

### **Automated Verification**

```bash
# Run complete architecture verification
pnpm run verify:architecture
pnpm run verify:security
pnpm run verify:performance
pnpm run verify:accessibility
pnpm run verify:healthcare-compliance
```

---

**Status**: 🎯 **Production-Ready Architecture Rules**\
**Compliance**: ✅ LGPD + ANVISA + CFM + WCAG 2.1 AA\
**Source**: 5 architecture documents, 4,710 lines analyzed\
**Last Updated**: 2025-09-06 - PREP-002 Architecture Audit
