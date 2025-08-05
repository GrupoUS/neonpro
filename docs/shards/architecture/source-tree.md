# NeonPro Source Tree Documentation

*Auto-loaded by BMad Dev Agent (@dev) - Version: BMad v4.29.0*

## 🎯 Overview
This document provides a comprehensive mapping of the NeonPro project structure, following BMAD Method standards for architectural clarity and development efficiency. It serves as the single source of truth for project organization and file purposes.

## 🏗️ High-Level Architecture Layers

```
NeonPro Aesthetic Clinic SaaS Platform
├── 🌐 Presentation Layer (Next.js 15 + React 19)
├── ⚡ Interactive Layer (Vite + React Components)  
├── 🔧 Business Logic Layer (Server Actions + Edge Functions)
├── 🗄️ Data Layer (Supabase + RLS Multi-tenancy)
├── 🔐 Security Layer (Auth + Compliance Engine)
└── 📊 Analytics Layer (AI + Reporting)
```

## 📁 Complete Project Structure

### Root Directory
```
neonpro/
├── 📋 .bmad-core/                     # BMAD Method configuration
│   ├── agents/                        # BMad agent definitions
│   ├── data/                          # Knowledge base and preferences
│   ├── tasks/                         # Executable workflows
│   └── templates/                     # Document templates
├── 📱 app/                            # Next.js 15 App Router
├── 🎨 components/                     # React components library
├── 📚 docs/                           # BMAD documentation system
├── 🔧 lib/                            # Utilities and configurations
├── 🌐 public/                         # Static assets
├── 🎯 supabase/                       # Database and backend
├── 📦 package.json                    # Project dependencies
└── ⚙️ Configuration files
```

### App Directory (Next.js 15 App Router)
```
app/
├── 🔐 (auth)/                         # Authentication routes
│   ├── login/
│   │   └── page.tsx                   # Login page (Server Component)
│   ├── signup/
│   │   └── page.tsx                   # Registration page
│   └── forgot-password/
│       └── page.tsx                   # Password recovery
├── 📊 dashboard/                      # Main application
│   ├── page.tsx                       # Dashboard home
│   ├── layout.tsx                     # Dashboard layout wrapper
│   ├── patients/                      # Patient management
│   │   ├── page.tsx                   # Patient list (Server Component)
│   │   ├── [id]/
│   │   │   ├── page.tsx               # Patient details
│   │   │   └── edit/page.tsx          # Patient editing
│   │   └── new/page.tsx               # New patient form
│   ├── appointments/                  # Appointment system
│   │   ├── page.tsx                   # Appointment calendar
│   │   ├── [id]/page.tsx              # Appointment details
│   │   └── book/page.tsx              # Booking interface
│   ├── treatments/                    # Treatment management
│   │   ├── page.tsx                   # Treatment catalog
│   │   ├── [id]/page.tsx              # Treatment details
│   │   └── protocols/page.tsx         # Treatment protocols
│   ├── billing/                       # Financial management
│   │   ├── page.tsx                   # Billing dashboard
│   │   ├── invoices/page.tsx          # Invoice management
│   │   └── payments/page.tsx          # Payment processing
│   ├── analytics/                     # Business intelligence
│   │   ├── page.tsx                   # Analytics dashboard
│   │   ├── reports/page.tsx           # Report generation
│   │   └── ai-insights/page.tsx       # AI-powered insights
│   ├── team/                          # Staff management
│   │   ├── page.tsx                   # Team overview
│   │   ├── [id]/page.tsx              # Staff member profile
│   │   └── permissions/page.tsx       # Role management
│   └── settings/                      # Clinic configuration
│       ├── page.tsx                   # General settings
│       ├── clinic/page.tsx            # Clinic profile
│       ├── integrations/page.tsx      # Third-party integrations
│       └── compliance/page.tsx        # LGPD/ANVISA settings
├── 🔌 api/                            # API routes
│   ├── auth/
│   │   └── callback/route.ts          # OAuth callback handler
│   ├── patients/
│   │   ├── route.ts                   # CRUD operations
│   │   └── [id]/route.ts              # Individual patient API
│   ├── appointments/
│   │   ├── route.ts                   # Appointment management
│   │   └── availability/route.ts      # Scheduling availability
│   ├── treatments/route.ts            # Treatment catalog API
│   ├── billing/route.ts               # Billing operations
│   ├── analytics/route.ts             # Analytics data
│   ├── ai/
│   │   ├── predictions/route.ts       # AI predictions API
│   │   └── recommendations/route.ts   # Treatment recommendations
│   └── webhooks/
│       ├── supabase/route.ts          # Database webhooks
│       └── payments/route.ts          # Payment webhooks
├── 🌍 globals.css                     # Global styles
├── 📄 layout.tsx                      # Root layout
├── 🚫 not-found.tsx                   # 404 page
└── ⚡ loading.tsx                     # Global loading UI
```

### Components Library
```
components/
├── 🎨 ui/                             # shadcn/ui base components
│   ├── button.tsx                     # Button component
│   ├── input.tsx                      # Input component
│   ├── form.tsx                       # Form components
│   ├── dialog.tsx                     # Modal dialogs
│   ├── table.tsx                      # Data tables
│   ├── calendar.tsx                   # Calendar picker
│   ├── chart.tsx                      # Chart components
│   └── toast.tsx                      # Notification system
├── 🔐 auth/                           # Authentication components
│   ├── login-form.tsx                 # Login form (Client Component)
│   ├── signup-form.tsx                # Registration form
│   ├── oauth-buttons.tsx              # Social login buttons
│   └── auth-guard.tsx                 # Authentication wrapper
├── 📊 dashboard/                      # Business logic components
│   ├── 👥 patients/                   # Patient management
│   │   ├── patient-list.tsx           # Patient data table
│   │   ├── patient-card.tsx           # Patient summary card
│   │   ├── patient-form.tsx           # Patient creation/editing
│   │   ├── patient-search.tsx         # Patient search interface
│   │   └── patient-history.tsx       # Treatment history
│   ├── 📅 appointments/               # Appointment system
│   │   ├── calendar-view.tsx          # Calendar interface
│   │   ├── appointment-form.tsx       # Booking form
│   │   ├── time-slots.tsx             # Available time slots
│   │   ├── appointment-card.tsx       # Appointment summary
│   │   └── scheduling-ai.tsx          # AI scheduling assistant
│   ├── 💊 treatments/                 # Treatment management
│   │   ├── treatment-catalog.tsx      # Treatment list
│   │   ├── treatment-card.tsx         # Treatment display
│   │   ├── protocol-builder.tsx       # Custom protocols
│   │   ├── before-after.tsx           # Photo comparison
│   │   └── consent-forms.tsx          # Digital consent
│   ├── 💰 billing/                    # Financial components
│   │   ├── invoice-generator.tsx      # Invoice creation
│   │   ├── payment-processor.tsx      # Payment handling
│   │   ├── pricing-calculator.tsx     # Dynamic pricing
│   │   ├── financial-summary.tsx      # Revenue overview
│   │   └── payment-plans.tsx          # Installment options
│   ├── 📈 analytics/                  # Analytics components
│   │   ├── revenue-chart.tsx          # Financial charts
│   │   ├── patient-metrics.tsx        # Patient analytics
│   │   ├── treatment-stats.tsx        # Treatment statistics
│   │   ├── ai-insights.tsx            # Machine learning insights
│   │   └── report-builder.tsx         # Custom reports
│   ├── 👨‍⚕️ team/                      # Staff management
│   │   ├── staff-list.tsx             # Team member list
│   │   ├── role-manager.tsx           # Permission management
│   │   ├── schedule-manager.tsx       # Staff scheduling
│   │   └── performance-tracker.tsx    # Staff metrics
│   └── ⚙️ settings/                   # Configuration components
│       ├── clinic-profile.tsx         # Clinic information
│       ├── integration-manager.tsx    # Third-party connections
│       ├── compliance-dashboard.tsx   # LGPD/ANVISA compliance
│       ├── backup-manager.tsx         # Data backup
│       └── notification-settings.tsx  # Alert preferences
├── 🧭 navigation/                     # Layout and navigation
│   ├── sidebar.tsx                    # Main sidebar navigation
│   ├── topbar.tsx                     # Header with user menu
│   ├── breadcrumbs.tsx                # Navigation breadcrumbs
│   ├── mobile-nav.tsx                 # Mobile navigation
│   └── search-command.tsx             # Global search palette
├── 📱 mobile/                         # Mobile-specific components
│   ├── mobile-header.tsx              # Mobile header
│   ├── mobile-menu.tsx                # Mobile navigation menu
│   ├── touch-optimized/               # Touch-friendly components
│   └── pwa-install.tsx                # PWA installation prompt
└── 🎯 shared/                         # Reusable components
    ├── data-table.tsx                 # Generic data table
    ├── file-upload.tsx                # File upload handler
    ├── image-gallery.tsx              # Photo gallery
    ├── pdf-viewer.tsx                 # Document viewer
    ├── loading-states.tsx             # Loading animations
    ├── error-boundary.tsx             # Error handling
    ├── confirmation-dialog.tsx        # Confirmation modals
    └── feature-flags.tsx              # Feature toggle system
```

### Library Directory
```
lib/
├── 🔗 supabase/                       # Database client configuration
│   ├── client.ts                      # Browser Supabase client
│   ├── server.ts                      # Server Supabase client
│   ├── middleware.ts                  # Authentication middleware
│   ├── auth.ts                        # Authentication utilities
│   └── types.ts                       # Database type definitions
├── 🔐 auth/                           # Authentication utilities
│   ├── providers.ts                   # OAuth provider configs
│   ├── session.ts                     # Session management
│   ├── permissions.ts                 # Role-based access control
│   └── security.ts                    # Security utilities
├── 📊 ai/                             # Artificial Intelligence
│   ├── predictions.ts                 # Treatment outcome predictions
│   ├── scheduling.ts                  # Intelligent scheduling
│   ├── recommendations.ts             # Treatment recommendations
│   ├── image-analysis.ts              # Computer vision for treatments
│   └── analytics.ts                   # Business intelligence AI
├── 💳 payments/                       # Payment processing
│   ├── stripe.ts                      # Stripe integration
│   ├── pix.ts                         # Brazilian PIX payments
│   ├── installments.ts                # Payment plans
│   └── billing.ts                     # Billing calculations
├── 📱 integrations/                   # External service integrations
│   ├── whatsapp.ts                    # WhatsApp Business API
│   ├── sms.ts                         # SMS notifications
│   ├── email.ts                       # Email services
│   ├── calendar.ts                    # Calendar synchronization
│   ├── cfm.ts                         # CFM integration (medical council)
│   └── anvisa.ts                      # ANVISA compliance reporting
├── 🛡️ compliance/                     # Legal and regulatory compliance
│   ├── lgpd.ts                        # LGPD data protection
│   ├── anvisa.ts                      # ANVISA medical regulations
│   ├── cfm.ts                         # CFM medical council compliance
│   ├── audit-trail.ts                 # Audit logging
│   └── data-retention.ts              # Data lifecycle management
├── 📋 validations/                    # Data validation schemas
│   ├── patient.ts                     # Patient data validation
│   ├── appointment.ts                 # Appointment validation
│   ├── treatment.ts                   # Treatment validation
│   ├── billing.ts                     # Billing validation
│   ├── auth.ts                        # Authentication validation
│   └── settings.ts                    # Settings validation
├── 🛠️ utils/                          # Utility functions
│   ├── date.ts                        # Date manipulation utilities
│   ├── currency.ts                    # Brazilian currency formatting
│   ├── phone.ts                       # Phone number utilities
│   ├── cpf.ts                         # CPF validation
│   ├── address.ts                     # Address utilities
│   ├── file.ts                        # File handling utilities
│   ├── encryption.ts                  # Data encryption
│   └── constants.ts                   # Application constants
├── 📈 analytics/                      # Analytics and tracking
│   ├── google-analytics.ts            # GA4 integration
│   ├── mixpanel.ts                    # Event tracking
│   ├── business-metrics.ts            # KPI calculations
│   └── cohort-analysis.ts             # Patient retention analysis
└── 🌍 i18n/                           # Internationalization
    ├── pt-BR.ts                       # Portuguese translations
    ├── en-US.ts                       # English translations
    └── config.ts                      # i18n configuration
```

### Documentation System (BMAD Method)
```
docs/
├── 📋 shards/                         # BMAD sharded documentation
│   ├── architecture/                  # Architecture documentation
│   │   ├── source-tree.md             # This file - project structure
│   │   ├── 01-system-overview-context.md  # System overview
│   │   ├── tech-stack.md              # Technology stack
│   │   ├── coding-standards.md        # Development standards
│   │   └── 03-data-model-rls-policies.md  # Database design
│   ├── prd/                           # Product requirements
│   │   ├── functional-requirements.md  # Feature specifications
│   │   ├── non-functional-requirements.md  # Quality requirements
│   │   └── user-stories.md            # User story backlog
│   ├── epics/                         # Feature epics
│   │   ├── patient-management.md      # Patient system epic
│   │   ├── appointment-system.md      # Scheduling epic
│   │   ├── treatment-catalog.md       # Treatment management
│   │   ├── billing-system.md          # Financial management
│   │   └── analytics-ai.md            # AI and analytics
│   └── stories/                       # Development stories
│       ├── completed/                 # Finished stories
│       ├── in-progress/               # Current work
│       └── backlog/                   # Planned work
├── 🚀 deployment/                     # Deployment documentation
│   ├── vercel-setup.md                # Vercel configuration
│   ├── supabase-setup.md              # Database setup
│   ├── environment-variables.md       # Configuration guide
│   └── ci-cd.md                       # Continuous deployment
├── 🔧 development/                    # Developer guides
│   ├── getting-started.md             # Setup instructions
│   ├── contributing.md                # Contribution guidelines
│   ├── testing.md                     # Testing strategies
│   └── troubleshooting.md             # Common issues
└── 📚 api/                            # API documentation
    ├── authentication.md              # Auth endpoints
    ├── patients.md                    # Patient API
    ├── appointments.md                # Appointment API
    ├── treatments.md                  # Treatment API
    └── webhooks.md                    # Webhook documentation
```

### Database Structure (Supabase)
```
supabase/
├── 🗄️ migrations/                     # Database schema changes
│   ├── 20240101000000_initial_schema.sql   # Initial database setup
│   ├── 20240102000000_auth_setup.sql       # Authentication tables
│   ├── 20240103000000_patients.sql         # Patient management
│   ├── 20240104000000_appointments.sql     # Appointment system
│   ├── 20240105000000_treatments.sql       # Treatment catalog
│   ├── 20240106000000_billing.sql          # Billing system
│   ├── 20240107000000_analytics.sql        # Analytics tables
│   └── 20240108000000_rls_policies.sql     # Row Level Security
├── 🔧 functions/                      # Edge Functions
│   ├── auth-callback/                 # OAuth callback handler
│   ├── ai-predictions/                # Machine learning predictions
│   ├── appointment-reminders/         # Automated notifications
│   ├── billing-processor/             # Payment processing
│   ├── compliance-reporter/           # Regulatory reporting
│   └── analytics-aggregator/          # Data aggregation
├── 🌱 seed.sql                        # Sample data for development
├── 📊 types.ts                        # Generated TypeScript types
└── ⚙️ config.toml                     # Supabase configuration
```

### Static Assets
```
public/
├── 🖼️ images/                         # Image assets
│   ├── logos/                         # Brand logos
│   ├── treatments/                    # Treatment photos
│   ├── before-after/                  # Patient photos
│   └── stock/                         # Stock photography
├── 📱 icons/                          # App icons and favicons
│   ├── favicon.ico                    # Browser favicon
│   ├── apple-touch-icon.png           # iOS icon
│   └── android-chrome-*.png           # Android icons
├── 📄 documents/                      # Static documents
│   ├── terms-of-service.pdf           # Legal documents
│   ├── privacy-policy.pdf             # Privacy policy
│   └── consent-forms/                 # Treatment consent forms
└── 🌐 manifest.json                   # PWA manifest
```

## 🔧 Build and Configuration Files

### Package Management
```
├── 📦 package.json                    # Project dependencies and scripts
├── 🔒 pnpm-lock.yaml                  # Dependency lock file
└── 📋 .npmrc                          # NPM configuration
```

### Development Configuration
```
├── ⚙️ next.config.mjs                 # Next.js configuration
├── 🎨 tailwind.config.ts              # Tailwind CSS configuration
├── 📝 tsconfig.json                   # TypeScript configuration
├── 🧹 eslint.config.js                # ESLint configuration
├── 💅 prettier.config.js              # Code formatting
└── 🔍 components.json                 # shadcn/ui configuration
```

### Development Tools
```
├── 🐳 .devcontainer/                  # VS Code dev container
├── 🚫 .gitignore                      # Git ignore rules
├── 🔍 .env.example                    # Environment template
├── 📋 README.md                       # Project overview
└── 📄 LICENSE                         # Software license
```

## 🎯 BMAD Method Integration Points

### Agent Interaction Patterns
- **@dev**: Automatically loads `tech-stack.md`, `coding-standards.md`, and `source-tree.md`
- **@architect**: References architecture shards for system design decisions
- **@pm**: Uses PRD shards for feature requirements and user stories
- **@qa**: Follows quality standards defined in coding-standards.md

### Development Workflow
1. **Planning Phase**: Use BMAD agents to create/update PRD and architecture docs
2. **Story Creation**: SM agent creates detailed stories from epics
3. **Development**: Dev agent implements following coding standards
4. **Quality Assurance**: QA agent validates against established patterns
5. **Documentation**: Auto-update source tree when structure changes

### Quality Gates
- All components must achieve ≥9.5/10 quality rating
- Must follow established coding standards
- Must respect RLS policies for multi-tenancy
- Must include proper TypeScript types
- Must implement proper error handling

## 🔄 File Naming Conventions

### Components
- **React Components**: PascalCase (`PatientForm.tsx`, `AppointmentCard.tsx`)
- **Utility Functions**: camelCase (`formatCurrency.ts`, `validateCPF.ts`)
- **Configuration Files**: kebab-case (`next.config.mjs`, `tailwind.config.ts`)

### API Routes
- **REST Endpoints**: kebab-case directories, route.ts files
- **Dynamic Routes**: Square brackets (`[id]/route.ts`, `[...slug]/route.ts`)

### Documentation
- **BMAD Docs**: kebab-case with descriptive names
- **Architecture**: Numbered prefix for logical ordering
- **API Docs**: Match corresponding endpoint names

## 🚀 Performance Considerations

### Code Splitting
- **Page-Level**: Automatic with Next.js App Router
- **Component-Level**: Dynamic imports for heavy components
- **Library-Level**: Separate chunks for third-party libraries

### Bundle Optimization
- **Tree Shaking**: Remove unused code automatically
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Optimization**: Next.js font optimization system

## 🔐 Security Architecture

### Data Protection
- **Encryption at Rest**: Supabase built-in encryption
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Client-Side Encryption**: Sensitive data encrypted before storage

### Access Control
- **Row Level Security**: Database-level access control
- **Role-Based Access**: Application-level permissions
- **OAuth Integration**: Secure third-party authentication

---

*This source tree documentation is maintained as part of the BMAD Method and should be updated whenever significant structural changes are made to the project.*