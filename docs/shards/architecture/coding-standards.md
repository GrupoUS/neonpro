# NeonPro Coding Standards - BMAD Enhanced

*Auto-loaded by BMad Dev Agent (@dev) - Version: BMad v4.29.0*

## 🎯 Overview
This document defines the BMAD-enhanced coding standards, patterns, and conventions for NeonPro development. It is automatically loaded when using the BMad Dev Agent (@dev) to ensure consistent code quality across all implementations and maintains the ≥9.5/10 quality standard required by BMAD Method.

## 🏆 BMAD Quality Standards
- **Code Quality Rating**: ≥9.5/10 on all components
- **TypeScript Coverage**: 100% with strict configuration
- **Test Coverage**: ≥90% for critical business logic
- **Accessibility**: WCAG 2.1 AA+ compliance
- **Performance**: Core Web Vitals within "Good" thresholds
- **Security**: Zero-trust architecture with comprehensive validation

## 📋 Core Technology Standards

### TypeScript Configuration
- **Strict Mode**: Always use strict TypeScript configuration
- **No Any**: Never use `any` type - always define proper interfaces
- **Explicit Returns**: Define return types for all functions
- **Null Safety**: Use optional chaining and nullish coalescing

```typescript
// ✅ Good
interface PatientData {
  id: string
  name: string
  email?: string
}

const getPatient = async (id: string): Promise<PatientData | null> => {
  // Implementation
}

// ❌ Bad  
const getPatient = async (id: any): Promise<any> => {
  // Implementation
}
```

### Component Architecture

#### Server Components (BMAD Default Pattern)
```typescript
// app/dashboard/patients/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PatientsList } from '@/components/dashboard/patients/PatientsList'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import type { Database } from '@/lib/supabase/types'

type Patient = Database['public']['Tables']['patients']['Row']

export default async function PatientsPage(): Promise<JSX.Element> {
  const supabase = createServerClient()
  
  // BMAD Pattern: Always type authentication responses
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  
  if (authError || !session) {
    redirect('/login')
  }

  // BMAD Pattern: Explicit error handling and typing
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', session.user.id)
    .returns<Patient[]>()

  if (patientsError) {
    throw new Error(`Failed to fetch patients: ${patientsError.message}`)
  }

  return (
    <DashboardLayout 
      title="Patients" 
      description="Manage your patients"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Patients', href: '/dashboard/patients' }
      ]}
    >
      <PatientsList patients={patients ?? []} />
    </DashboardLayout>
  )
}
```

#### Client Components (BMAD React 19 Pattern)
```typescript
// components/dashboard/PatientForm.tsx
"use client"

import { useActionState } from 'react' // React 19 feature
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPatient } from '@/app/actions/patients'
import { patientSchema, type PatientFormData } from '@/lib/validations/patient'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface PatientFormProps {
  initialData?: Partial<PatientFormData>
  onSuccess?: () => void
}

export default function PatientForm({ initialData, onSuccess }: PatientFormProps): JSX.Element {
  // BMAD Pattern: Use React 19 useActionState for optimistic updates
  const [state, formAction, isPending] = useActionState(createPatient, {
    message: '',
    errors: {},
    success: false
  })

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      cpf: initialData?.cpf ?? '',
    }
  })

  // BMAD Pattern: Handle server action responses
  React.useEffect(() => {
    if (state.success) {
      toast.success('Patient created successfully')
      form.reset()
      onSuccess?.()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state, form, onSuccess])

  const onSubmit = async (data: PatientFormData) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
    formAction(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter patient's full name" 
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="patient@example.com" 
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Patient'
          )}
        </Button>
      </form>
    </Form>
  )
}
```

## 🗂️ File Organization Standards

### Directory Structure
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── page.tsx
│   ├── patients/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── appointments/
│   └── settings/
├── api/
│   ├── auth/callback/route.ts
│   └── patients/route.ts
└── globals.css

components/
├── ui/                 # shadcn/ui base components
├── auth/              # Authentication specific
├── dashboard/         # Business logic components  
│   ├── patients/
│   ├── appointments/
│   └── forms/
└── navigation/        # Layout and navigation

lib/
├── supabase/
│   ├── client.ts      # Browser client
│   ├── server.ts      # Server client
│   └── middleware.ts  # Middleware client
├── utils.ts           # Utility functions
├── validations/       # Zod schemas
└── types/            # TypeScript definitions
```

### Naming Conventions
- **Files**: kebab-case (`patient-form.tsx`, `appointment-list.tsx`)
- **Components**: PascalCase (`PatientForm`, `AppointmentList`)
- **Functions**: camelCase (`createPatient`, `fetchAppointments`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_APPOINTMENTS`, `DEFAULT_CLINIC_HOURS`)
- **Types/Interfaces**: PascalCase with descriptive suffixes (`PatientData`, `AppointmentProps`)

## 🔐 Authentication Patterns

### Dual Client Pattern (Mandatory)
```typescript
// Server Components - Use server client
import { createServerClient } from '@/lib/supabase/server'

// Client Components - Use browser client  
import { createBrowserClient } from '@/lib/supabase/client'

// Never mix clients - always use appropriate client for context
```

### Page-Level Authentication
```typescript
// Every protected page must start with this pattern
export default async function ProtectedPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  // Rest of component logic
}
```

### RLS Policy Compliance
```typescript
// Always respect Row Level Security policies
// Never bypass RLS with service_role key in client code
// Use clinic_id for multi-tenant data isolation

const { data: patients } = await supabase
  .from('patients')
  .select('*')
  .eq('clinic_id', session.user.id) // Always filter by clinic_id
```

## 🎨 UI/UX Standards

### shadcn/ui Component Usage
```typescript
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Always use cn() for conditional styling
<Button 
  className={cn(
    "w-full",
    isLoading && "opacity-50 cursor-not-allowed",
    variant === "destructive" && "bg-red-600 hover:bg-red-700"
  )}
  disabled={isLoading}
>
  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
  {children}
</Button>
```

### Responsive Design Pattern
```typescript
// Mobile-first approach with Tailwind CSS
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <Card className="col-span-full lg:col-span-2">
    {/* Primary content */}
  </Card>
  <Card className="col-span-full lg:col-span-1">
    {/* Secondary content */}
  </Card>
</div>
```

## 📝 Form Standards

### react-hook-form + zod Pattern
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Define schema
const formSchema = z.object({
  // Define validation rules
})

// 2. Infer type
type FormData = z.infer<typeof formSchema>

// 3. Initialize form
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    // Set default values
  }
})

// 4. Handle submission with proper error handling
const onSubmit = async (data: FormData) => {
  try {
    // API call
    toast.success('Success message')
  } catch (error) {
    console.error('Error:', error)
    toast.error('Error message')
  }
}
```

## 🔄 State Management

### Server State (Preferred)
```typescript
// Use Server Components for data fetching when possible
export default async function PatientsPage() {
  const supabase = createServerClient()
  
  // Fetch data on server
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    
  return <PatientsList patients={patients} />
}
```

### Client State (When Required)
```typescript
// Use React hooks for client-side state
const [isLoading, setIsLoading] = useState(false)
const [patients, setPatients] = useState<Patient[]>([])

// Use useCallback for memoized functions
const handlePatientUpdate = useCallback(async (id: string, data: Partial<Patient>) => {
  // Implementation
}, [])
```

## 🚫 Anti-Patterns (Never Do)

### Package Management
- ❌ Never use `npm` or `yarn` - always use `pnpm`
- ❌ Never install dependencies without updating package.json
- ❌ Never commit package-lock.json or yarn.lock files

### Authentication & Security
- ❌ Never bypass RLS policies
- ❌ Never use service_role key in client-side code
- ❌ Never store sensitive data in localStorage
- ❌ Never manually insert user profiles (use triggers)

### Component Patterns
- ❌ Never use Client Components unnecessarily
- ❌ Never ignore error boundaries
- ❌ Never use inline styles instead of Tailwind classes
- ❌ Never create components without proper TypeScript interfaces

### Data Fetching
- ❌ Never fetch data in useEffect when Server Components can be used
- ❌ Never ignore loading and error states
- ❌ Never fetch data without proper error handling

## ✅ Quality Checklist

Before marking any story task as complete:
- [ ] TypeScript types are properly defined
- [ ] Components follow established patterns
- [ ] Authentication is properly handled
- [ ] Error handling is implemented
- [ ] RLS policies are respected
- [ ] Forms use react-hook-form + zod validation
- [ ] Loading states are implemented
- [ ] Responsive design is applied
- [ ] Code is readable and well-commented
- [ ] File organization follows standards
- [ ] No anti-patterns are present

---

*This document is part of the BMad Method configuration for NeonPro and is automatically loaded by the Dev Agent for consistent development standards.*## 🎯 BMAD Development Patterns

### Server Actions (React 19 Enhanced)
```typescript
// app/actions/patients.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { patientSchema } from '@/lib/validations/patient'

export async function createPatient(prevState: any, formData: FormData) {
  // BMAD Pattern: Always validate server-side
  const validatedFields = patientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    cpf: formData.get('cpf'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid form data. Please check your inputs.',
      success: false,
    }
  }

  const supabase = createServerClient()
  
  // BMAD Pattern: Authentication check in all server actions
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  
  if (authError || !session) {
    return {
      message: 'Authentication required.',
      success: false,
    }
  }

  try {
    const { error } = await supabase
      .from('patients')
      .insert({
        ...validatedFields.data,
        clinic_id: session.user.id,
        created_by: session.user.id,
      })

    if (error) {
      return {
        message: 'Database error: Failed to create patient.',
        success: false,
      }
    }

    revalidatePath('/dashboard/patients')
    return {
      message: 'Patient created successfully.',
      success: true,
    }
  } catch (error) {
    return {
      message: 'Unexpected error occurred.',
      success: false,
    }
  }
}
```

### Error Boundary Pattern (BMAD Required)
```typescript
// components/ui/error-boundary.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // BMAD Pattern: Log errors for monitoring
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send to monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined') {
      // client-side error reporting
    }
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return (
        <Fallback 
          error={this.state.error!} 
          reset={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  )
}
```

### Loading States (BMAD UX Pattern)
```typescript
// components/ui/loading-states.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

export function PatientListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-[100px]" />
        </div>
      ))}
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  )
}
```

## 🔐 Security Patterns (BMAD Enhanced)

### Input Sanitization
```typescript
// lib/security/sanitization.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: string): string {
  // Remove potential XSS vectors
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}
```

### Rate Limiting
```typescript
// lib/security/rate-limiting.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
  
  return {
    success,
    limit,
    reset,
    remaining,
  }
}
```

## ✅ BMAD Quality Checklist (Updated)

Before marking any story task as complete:
- [ ] **TypeScript**: All types properly defined with strict configuration
- [ ] **React 19**: Uses modern patterns (useActionState, Server Actions)  
- [ ] **Error Handling**: Comprehensive error boundaries and validation
- [ ] **Loading States**: Proper skeleton screens and loading indicators
- [ ] **Accessibility**: WCAG 2.1 AA+ compliance with proper ARIA labels
- [ ] **Security**: Input sanitization and rate limiting implemented
- [ ] **Performance**: Optimized with proper caching and lazy loading
- [ ] **Testing**: Unit tests with ≥90% coverage for business logic
- [ ] **Documentation**: JSDoc comments for complex functions
- [ ] **BMAD Compliance**: Follows all established patterns and standards

---

*These enhanced coding standards ensure NeonPro maintains the highest quality while following BMAD Method principles for agile AI-driven development.*