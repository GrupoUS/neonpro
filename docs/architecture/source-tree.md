# NeonPro Source Tree Organization

*Auto-loaded by BMad Dev Agent (@dev) - Version: BMad v4.29.0*

## 🎯 Overview
This document defines the complete file and directory organization for NeonPro, including component structure, naming conventions, and architectural patterns. It is automatically loaded when using the BMad Dev Agent (@dev) to ensure consistent file organization across all implementations.

## 📁 Root Directory Structure

```
neonpro/
├── .bmad-core/                 # BMad Method configuration
│   ├── agents/                 # Agent definitions
│   ├── workflows/              # Development workflows
│   ├── templates/              # Document templates
│   ├── tasks/                  # Reusable tasks
│   ├── checklists/             # Quality checklists
│   └── data/                   # Knowledge base and config
├── .github/                    # GitHub configuration
│   └── copilot-instructions.md # AI coding instructions
├── .ai/                        # AI development logs
│   └── debug-log.md           # Development debugging log
├── app/                        # Next.js 15 App Router
├── components/                 # React components
├── lib/                        # Shared utilities and configuration
├── public/                     # Static assets
├── docs/                       # Project documentation
├── scripts/                    # Database and setup scripts
├── styles/                     # Global styles and themes
└── [config files]              # Package.json, tsconfig, etc.
```

## 🚀 App Directory (Next.js 15 App Router)

### Core Structure
```
app/
├── globals.css                 # Global styles and CSS variables
├── layout.tsx                  # Root layout with providers
├── page.tsx                    # Landing page
├── loading.tsx                 # Global loading UI
├── error.tsx                   # Global error boundary
├── not-found.tsx              # 404 page
│
├── (auth)/                     # Auth route group
│   ├── login/
│   │   └── page.tsx           # Login page
│   └── signup/
│       └── page.tsx           # Signup page
│
├── dashboard/                  # Protected dashboard area
│   ├── layout.tsx             # Dashboard layout
│   ├── page.tsx               # Dashboard overview
│   ├── loading.tsx            # Dashboard loading state
│   ├── error.tsx              # Dashboard error boundary
│   │
│   ├── patients/              # Patient management
│   │   ├── page.tsx           # Patient list
│   │   ├── loading.tsx        # Patient list loading
│   │   ├── [id]/              # Individual patient
│   │   │   ├── page.tsx       # Patient details
│   │   │   └── edit/
│   │   │       └── page.tsx   # Edit patient
│   │   └── new/
│   │       └── page.tsx       # Create patient
│   │
│   ├── appointments/          # Appointment management
│   │   ├── page.tsx           # Appointment calendar
│   │   ├── [id]/
│   │   │   └── page.tsx       # Appointment details
│   │   └── new/
│   │       └── page.tsx       # Create appointment
│   │
│   ├── treatments/            # Treatment management
│   │   ├── page.tsx           # Treatment list
│   │   ├── [id]/
│   │   │   └── page.tsx       # Treatment details
│   │   └── new/
│   │       └── page.tsx       # Create treatment
│   │
│   ├── finances/              # Financial management
│   │   ├── page.tsx           # Financial overview
│   │   ├── invoices/
│   │   │   └── page.tsx       # Invoice management
│   │   └── reports/
│   │       └── page.tsx       # Financial reports
│   │
│   └── settings/              # Clinic settings
│       ├── page.tsx           # General settings
│       ├── profile/
│       │   └── page.tsx       # Clinic profile
│       ├── team/
│       │   └── page.tsx       # Team management
│       └── billing/
│           └── page.tsx       # Billing settings
│
└── api/                       # API routes
    ├── auth/
    │   └── callback/
    │       └── route.ts       # OAuth callback
    ├── patients/
    │   └── route.ts           # Patient API endpoints
    ├── appointments/
    │   └── route.ts           # Appointment API endpoints
    └── webhooks/
        └── supabase/
            └── route.ts       # Supabase webhooks
```

## 🧩 Components Directory

### Organization Strategy
```
components/
├── ui/                        # Base UI components (shadcn/ui)
│   ├── button.tsx             # Button component
│   ├── card.tsx               # Card components
│   ├── dialog.tsx             # Dialog/Modal components
│   ├── form.tsx               # Form components
│   ├── input.tsx              # Input components
│   ├── label.tsx              # Label component
│   ├── select.tsx             # Select dropdown
│   ├── table.tsx              # Table components
│   ├── tabs.tsx               # Tab components
│   └── toast.tsx              # Toast notifications
│
├── auth/                      # Authentication components
│   ├── login-form.tsx         # Login form component
│   ├── signup-form.tsx        # Signup form component
│   ├── oauth-button.tsx       # OAuth provider button
│   └── auth-guard.tsx         # Route protection component
│
├── dashboard/                 # Dashboard-specific components
│   ├── dashboard-layout.tsx   # Main dashboard layout
│   ├── sidebar.tsx            # Dashboard sidebar
│   ├── header.tsx             # Dashboard header
│   ├── breadcrumbs.tsx        # Navigation breadcrumbs
│   │
│   ├── patients/              # Patient-related components
│   │   ├── patient-list.tsx   # Patient list display
│   │   ├── patient-card.tsx   # Individual patient card
│   │   ├── patient-form.tsx   # Patient creation/edit form
│   │   ├── patient-search.tsx # Patient search functionality
│   │   └── patient-details.tsx # Patient detail view
│   │
│   ├── appointments/          # Appointment components
│   │   ├── appointment-calendar.tsx
│   │   ├── appointment-card.tsx
│   │   ├── appointment-form.tsx
│   │   └── appointment-list.tsx
│   │
│   ├── treatments/            # Treatment components
│   │   ├── treatment-list.tsx
│   │   ├── treatment-card.tsx
│   │   ├── treatment-form.tsx
│   │   └── treatment-history.tsx
│   │
│   ├── finances/              # Financial components
│   │   ├── invoice-list.tsx
│   │   ├── invoice-form.tsx
│   │   ├── payment-status.tsx
│   │   └── financial-chart.tsx
│   │
│   └── forms/                 # Reusable form components
│       ├── clinic-form.tsx
│       ├── user-form.tsx
│       └── settings-form.tsx
│
├── navigation/                # Navigation components
│   ├── main-nav.tsx           # Main navigation
│   ├── mobile-nav.tsx         # Mobile navigation
│   ├── user-nav.tsx           # User menu dropdown
│   └── nav-link.tsx           # Navigation link component
│
└── providers/                 # Context providers
    ├── auth-provider.tsx      # Authentication context
    ├── theme-provider.tsx     # Theme management
    └── supabase-provider.tsx  # Supabase client provider
```

## 📚 Lib Directory

### Utility Organization
```
lib/
├── supabase/                  # Supabase client configuration
│   ├── client.ts              # Browser client (Client Components)
│   ├── server.ts              # Server client (Server Components)
│   ├── middleware.ts          # Middleware client
│   └── types.ts               # Supabase type definitions
│
├── validations/               # Zod schemas and validation
│   ├── auth.ts                # Authentication schemas
│   ├── patient.ts             # Patient data schemas
│   ├── appointment.ts         # Appointment schemas
│   ├── treatment.ts           # Treatment schemas
│   └── clinic.ts              # Clinic settings schemas
│
├── types/                     # TypeScript type definitions
│   ├── database.ts            # Database types
│   ├── auth.ts                # Authentication types
│   ├── clinic.ts              # Clinic-related types
│   └── common.ts              # Common/shared types
│
├── hooks/                     # Custom React hooks
│   ├── use-auth.ts            # Authentication hook
│   ├── use-patients.ts        # Patient data hook
│   ├── use-appointments.ts    # Appointment hook
│   └── use-local-storage.ts   # Local storage hook
│
├── constants/                 # Application constants
│   ├── routes.ts              # Route definitions
│   ├── clinic-types.ts        # Clinic type constants
│   └── appointment-status.ts  # Appointment status options
│
└── utils.ts                   # Utility functions (cn, formatters, etc.)
```

## 📝 Docs Directory

### Documentation Organization
```
docs/
├── prd/                       # Sharded Product Requirements
│   ├── README.md              # PRD index and overview
│   ├── 01-goals-context.md    # Goals and background
│   ├── 02-requirements.md     # Functional requirements
│   ├── 03-user-stories.md     # User stories and scenarios
│   └── 04-acceptance-criteria.md # Acceptance criteria
│
├── architecture/              # Sharded Architecture Documents
│   ├── README.md              # Architecture index
│   ├── coding-standards.md    # Coding standards (BMad auto-loaded)
│   ├── tech-stack.md          # Technology stack (BMad auto-loaded)
│   ├── source-tree.md         # Source organization (BMad auto-loaded)
│   ├── 01-system-overview-context.md
│   ├── 02-logical-components-data-flow.md
│   ├── 03-data-model-rls-policies.md
│   └── [other architecture shards]
│
├── stories/                   # Implementation stories
│   ├── story-001-patient-management.md
│   ├── story-002-appointment-system.md
│   └── [other implementation stories]
│
├── epics/                     # Epic documentation
│   ├── epic-001-core-clinic-management.md
│   └── [other epics]
│
└── [other documentation files]
```

## 🎨 Styles Directory

### Styling Organization
```
styles/
├── globals.css                # Global styles and CSS variables
├── components.css             # Component-specific styles
└── themes/                    # Theme variations
    ├── light.css              # Light theme variables
    └── dark.css               # Dark theme variables
```

## 🗄️ Database Schema Organization

### Supabase Table Structure
```sql
-- User and Authentication
auth.users                     -- Supabase auth users
public.profiles                -- User profile extensions

-- Clinic Management
public.clinics                 -- Clinic information
public.clinic_members          -- Clinic team members
public.clinic_settings         -- Clinic configuration

-- Patient Management
public.patients               -- Patient records
public.patient_notes          -- Patient consultation notes
public.patient_documents      -- Patient file uploads

-- Appointment System
public.appointments           -- Appointment bookings
public.appointment_types      -- Types of appointments
public.time_slots            -- Available time slots

-- Treatment Management
public.treatments            -- Treatment definitions
public.treatment_sessions    -- Individual treatment sessions
public.treatment_plans       -- Patient treatment plans

-- Financial Management
public.invoices              -- Invoice records
public.payments              -- Payment tracking
public.price_lists           -- Service pricing
```

## 🔧 Configuration Files

### Root Level Configuration
```
neonpro/
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.mjs            # Next.js configuration
├── postcss.config.mjs         # PostCSS configuration
├── components.json            # shadcn/ui configuration
├── middleware.ts              # Next.js middleware
├── .env.local                 # Environment variables (local)
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
└── QUICK_OAUTH_SETUP.md       # OAuth setup guide
```

## 📋 File Naming Conventions

### Component Files
- **React Components**: PascalCase (`PatientForm.tsx`, `AppointmentList.tsx`)
- **Page Components**: lowercase (`page.tsx`, `layout.tsx`, `loading.tsx`)
- **Hook Files**: camelCase with "use" prefix (`useAuth.ts`, `usePatients.ts`)
- **Utility Files**: kebab-case (`auth-utils.ts`, `date-helpers.ts`)

### Directory Names
- **Feature Directories**: lowercase (`patients`, `appointments`, `treatments`)
- **Component Directories**: lowercase (`ui`, `auth`, `dashboard`)
- **Configuration Directories**: lowercase (`lib`, `types`, `constants`)

### Database Files
- **Schema Files**: numbered with descriptive names (`01-setup-profiles.sql`)
- **Migration Files**: timestamped (`20240101_create_patients_table.sql`)
- **Seed Files**: descriptive names (`sample-clinic-data.sql`)

## 🎯 Import Path Conventions

### Absolute Imports (Preferred)
```typescript
// UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Business Components
import PatientForm from '@/components/dashboard/patients/patient-form'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

// Utilities and Configuration
import { createServerClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { patientSchema } from '@/lib/validations/patient'

// Types
import type { Patient } from '@/lib/types/clinic'
import type { Database } from '@/lib/types/database'
```

### Import Order Standards
```typescript
// 1. React and Next.js
import React from 'react'
import { NextRequest } from 'next/server'

// 2. Third-party libraries
import { z } from 'zod'
import { toast } from 'sonner'

// 3. Internal utilities
import { createServerClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

// 4. UI components
import { Button } from '@/components/ui/button'

// 5. Business components
import DashboardLayout from '@/components/dashboard/dashboard-layout'

// 6. Types and schemas
import type { Patient } from '@/lib/types/clinic'
```

---

*This document is part of the BMad Method configuration for NeonPro and is automatically loaded by the Dev Agent for consistent source tree organization.*