# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Development server (use pnpm)
pnpm dev

# Build for production
pnpm build

# Linting with Next.js
pnpm lint

# Start production server
pnpm start

# Initialize project context (VIBECODE)
npm run init
```

### Testing Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui
```

### Database Commands
```bash
# Run Supabase migrations
npm run db:migrate

# Reset database
npm run db:reset

# Generate types from Supabase
npm run db:types
```

## Project Architecture

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Storage + Edge Functions)
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: react-hook-form + zod validation
- **Package Manager**: pnpm (required)

### Business Domain
NeonPro is a comprehensive clinic management system for aesthetic and beauty clinics with:
- **Appointment scheduling** with intelligent conflict detection
- **Patient management** with medical records and history
- **Financial management** (accounts payable/receivable, cash flow)
- **CRM and campaigns** for patient retention
- **BI dashboards** with real-time analytics
- **WhatsApp Business integration** for notifications
- **PWA capabilities** for mobile installation

### Key Performance Targets
- API p95 ≤ 800ms
- Page load p95 ≤ 300ms
- Reduce no-shows by 25%
- Increase MRR by 25%
- Quality threshold ≥8/10 (VIBECODE standard)

## Code Architecture Patterns

### Authentication Pattern (Mandatory)
```typescript
// Server Components - Always use server client
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Fetch data with RLS
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', session.user.id) // Multi-tenant isolation
}
```

### Client Component Pattern
```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Always define schemas with zod
const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits')
})

type PatientFormData = z.infer<typeof patientSchema>

export default function PatientForm() {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: '', email: '', phone: '' }
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      // Handle submission with proper error handling
      toast.success('Patient created successfully')
    } catch (error) {
      toast.error('Failed to create patient')
    }
  }
}
```

### API Route Pattern
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Business logic with RLS
    const { data, error } = await supabase
      .from('patients')
      .insert({ ...body, clinic_id: user.id })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

## File Organization

### Directory Structure
```
app/
├── (auth)/              # Authentication pages
├── dashboard/           # Protected dashboard pages
│   ├── patients/       # Patient management
│   ├── appointments/   # Appointment scheduling
│   ├── financial/      # Financial management
│   └── settings/       # Clinic settings
├── api/                # API routes
└── globals.css         # Global styles

components/
├── ui/                 # shadcn/ui base components
├── auth/              # Authentication components
├── dashboard/         # Business logic components
└── navigation/        # Layout and navigation

lib/
├── supabase/          # Supabase clients (client.ts, server.ts)
├── validations/       # Zod schemas
├── utils.ts           # Utility functions
└── types/            # TypeScript definitions
```

### Critical Rules

#### Package Management
- **NEVER use npm or yarn** - always use `pnpm`
- All dependencies use `"latest"` for automatic updates
- Only use dependencies already in package.json

#### Authentication & Security
- **NEVER bypass RLS policies** - always filter by `clinic_id`
- **NEVER use service_role key** in client-side code
- **NEVER mix Supabase clients** - use appropriate client for context
- Always validate sessions on protected pages

#### Component Patterns
- **Prefer Server Components** - use Client Components only when necessary
- **Always implement error boundaries** and loading states
- **Use TypeScript strict mode** - never use `any` type
- **Follow shadcn/ui patterns** with `cn()` utility for styling

#### Data Access
- **Multi-tenant isolation**: Always filter by `clinic_id`
- **Error handling**: Wrap all async operations in try/catch
- **Loading states**: Implement for all user interactions
- **Form validation**: Use react-hook-form + zod for all forms

## Integration with VIBECODE Workspace

### Shared Components
- Access shared components from `@saas-projects/shared`
- Reuse ≥85% of existing components before creating new ones
- Follow "Aprimore, Não Prolifere" principle

### Memory Bank Integration
- Run `/init` command to activate project context
- Patterns and solutions are automatically shared across projects
- Technical documentation in `docs/architecture/`

### Quality Standards
- Maintain ≥8/10 quality threshold for all code
- TypeScript strict mode enforced
- Comprehensive error handling required
- Responsive design with accessibility compliance

## Environment Setup

### Required Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Dependencies
- Node.js ≥18.0.0
- pnpm (required package manager)
- Supabase account with configured project
- Google OAuth credentials for authentication

## Important Notes

### PWA Features
- Service Worker for offline functionality
- Background sync for data synchronization
- Web App Manifest for native installation
- Push notifications support

### WhatsApp Integration
- WhatsApp Business API for automated reminders
- Configurable templates for different notification types
- Test connection functionality in settings

### Development Workflow
1. Use `/init` command to activate project context
2. Follow established patterns from documentation
3. Implement with proper error handling and loading states
4. Test authentication flows and RLS policies
5. Ensure responsive design and accessibility
6. Maintain quality threshold ≥8/10