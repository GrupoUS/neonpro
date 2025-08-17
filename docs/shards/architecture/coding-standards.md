# Coding Standards - NeonPro 2025

> **Enhanced com melhores práticas Next.js 15, App Router e Turborepo patterns**

## 🚀 **Next.js 15 & App Router Patterns**

### **Component Architecture**
```typescript
// ✅ Server Component (Default)
// app/patients/page.tsx
import { PatientList } from './components/patient-list'
import { getPatients } from '@/lib/patients'

export default async function PatientsPage() {
  const patients = await getPatients()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Patients</h1>
      <PatientList patients={patients} />
    </div>
  )
}

// ✅ Client Component (Only when needed)
'use client'

import { useState } from 'react'
import { PatientForm } from '@/components/forms/patient-form'

export function PatientModal() {
  const [open, setOpen] = useState(false)
  
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <PatientForm onSuccess={() => setOpen(false)} />
    </Modal>
  )
}
```

### **Server Actions (useActionState)**
```typescript
// ✅ Server Action
'use server'

import { revalidatePath } from 'next/cache'
import { createPatient } from '@/lib/patients'
import { patientSchema } from '@neonpro/shared/validations'

export async function createPatientAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = patientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await createPatient(validatedFields.data)
    revalidatePath('/patients')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to create patient' }
  }
}

// ✅ Client Usage (useActionState)
'use client'

import { useActionState } from 'react'
import { createPatientAction } from './actions'

export function PatientForm() {
  const [state, action, pending] = useActionState(
    createPatientAction,
    { errors: {} }
  )

  return (
    <form action={action}>
      <input name="name" />
      {state.errors?.name && (
        <p className="text-red-500">{state.errors.name}</p>
      )}
      <button disabled={pending}>
        {pending ? 'Creating...' : 'Create Patient'}
      </button>
    </form>
  )
}
```

### **Route Groups & Organization**
```typescript
// ✅ Route Groups Structure
app/
├── (dashboard)/           # Dashboard layout
│   ├── layout.tsx        # Dashboard-specific layout
│   ├── patients/         # Patient management
│   ├── appointments/     # Appointment system
│   └── analytics/        # Analytics dashboard
│
├── (auth)/               # Auth layout
│   ├── layout.tsx        # Auth-specific layout
│   ├── login/
│   └── register/
│
└── api/                  # API routes
    ├── patients/
    └── appointments/
```

### **Error Handling Patterns**
```typescript
// ✅ Error Boundary
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-lg font-semibold">Something went wrong!</h2>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}

// ✅ Loading UI
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
```

## 📦 **Turborepo & Package Organization**

### **Package Imports**
```typescript
// ✅ Workspace imports
import { Button } from '@neonpro/ui'
import { patientService } from '@neonpro/shared'
import type { Patient } from '@neonpro/types'
import { env } from '@neonpro/config'

// ✅ Internal imports (within same package)
import { PatientCard } from './components/patient-card'
import { usePatients } from '@/hooks/use-patients'
import type { PatientFormData } from '@/types/forms'
```

### **Package.json Structure**
```json
{
  "name": "@neonpro/ui",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./styles": "./dist/styles.css"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@neonpro/types": "workspace:*"
  },
  "devDependencies": {
    "@neonpro/eslint-config": "workspace:*",
    "@neonpro/tsconfig": "workspace:*"
  }
}
```

## 🎨 **Component Patterns**

### **Compound Component Pattern**
```typescript
// ✅ Compound Component
interface PatientCardProps {
  patient: Patient
  children: React.ReactNode
}

export function PatientCard({ patient, children }: PatientCardProps) {
  return (
    <div className="border rounded-lg p-4">
      {children}
    </div>
  )
}

PatientCard.Header = function PatientCardHeader({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <div className="mb-2 font-semibold">{children}</div>
}

PatientCard.Content = function PatientCardContent({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <div className="text-sm text-gray-600">{children}</div>
}

PatientCard.Actions = function PatientCardActions({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <div className="mt-4 flex gap-2">{children}</div>
}

// Usage
<PatientCard patient={patient}>
  <PatientCard.Header>{patient.name}</PatientCard.Header>
  <PatientCard.Content>{patient.email}</PatientCard.Content>
  <PatientCard.Actions>
    <Button>Edit</Button>
    <Button variant="destructive">Delete</Button>
  </PatientCard.Actions>
</PatientCard>
```

### **Polymorphic Component Pattern**
```typescript
// ✅ Polymorphic Button
type ButtonProps<T extends React.ElementType> = {
  as?: T
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
} & React.ComponentPropsWithoutRef<T>

export function Button<T extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button'
  
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-destructive text-destructive-foreground': variant === 'destructive',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}

// Usage
<Button>Default Button</Button>
<Button as="a" href="/patients">Link Button</Button>
<Button as={Link} to="/dashboard">Router Link</Button>
```

## 🔐 **Authentication & RLS Patterns**

### **Middleware Authentication**
```typescript
// ✅ middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### **RLS Helper Functions**
```typescript
// ✅ lib/supabase/rls.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

// ✅ Usage in Server Component
export default async function PatientsList() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('organization_id', user.user_metadata.organization_id)

  return <PatientList patients={patients} />
}
```

## ⚡ **Performance Optimization**

### **Image Optimization**
```typescript
// ✅ Next.js Image with optimization
import Image from 'next/image'

export function PatientAvatar({ patient }: { patient: Patient }) {
  return (
    <Image
      src={patient.avatar_url || '/default-avatar.png'}
      alt={`${patient.name} avatar`}
      width={40}
      height={40}
      className="rounded-full"
      priority={false} // Only true for above-the-fold images
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  )
}
```

### **Streaming with Suspense**
```typescript
// ✅ Streaming data
import { Suspense } from 'react'
import { PatientList } from './components/patient-list'
import { AnalyticsWidget } from './components/analytics-widget'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      
      <Suspense fallback={<PatientListSkeleton />}>
        <PatientList />
      </Suspense>
      
      <Suspense fallback={<AnalyticsWidgetSkeleton />}>
        <AnalyticsWidget />
      </Suspense>
    </div>
  )
}

// Individual components fetch their own data
async function PatientList() {
  const patients = await getPatients()
  return <div>{/* render patients */}</div>
}

async function AnalyticsWidget() {
  const analytics = await getAnalytics()
  return <div>{/* render analytics */}</div>
}
```

### **Caching Strategies**
```typescript
// ✅ Fetch with caching
export async function getPatients() {
  const response = await fetch('/api/patients', {
    next: { 
      revalidate: 60, // Cache for 60 seconds
      tags: ['patients'] // Tag for revalidation
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients')
  }
  
  return response.json()
}

// ✅ Manual cache revalidation
import { revalidateTag } from 'next/cache'

export async function createPatient(data: PatientData) {
  const patient = await createPatientInDB(data)
  
  // Revalidate patients cache
  revalidateTag('patients')
  
  return patient
}
```

## 🧪 **Testing Patterns**

### **Component Testing**
```typescript
// ✅ Component test with Vitest + Testing Library
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('handles polymorphic rendering', () => {
    render(<Button as="a" href="/test">Link Button</Button>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
  })
})
```

### **Integration Testing**
```typescript
// ✅ Integration test for form submission
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PatientForm } from './patient-form'

// Mock server action
jest.mock('./actions', () => ({
  createPatientAction: jest.fn(),
}))

describe('PatientForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockAction = jest.mocked(createPatientAction)
    mockAction.mockResolvedValue({ success: true })

    render(<PatientForm />)

    await user.type(screen.getByLabelText('Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: 'Create Patient' }))

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })
  })
})
```

## 📝 **Documentation Standards**

### **Component Documentation**
```typescript
/**
 * A flexible button component that supports multiple variants and polymorphic rendering.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Primary Button
 * </Button>
 * 
 * <Button as="a" href="/dashboard">
 *   Link Button
 * </Button>
 * ```
 */
export interface ButtonProps<T extends React.ElementType = 'button'> {
  /** The element type to render as */
  as?: T
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'destructive'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

export function Button<T extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps<T>) {
  // Implementation...
}
```

### **API Documentation**
```typescript
/**
 * Creates a new patient in the system.
 * 
 * @param patientData - The patient information
 * @returns Promise that resolves to the created patient
 * 
 * @throws {ValidationError} When patient data is invalid
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * ```typescript
 * const patient = await createPatient({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   dateOfBirth: '1990-01-01'
 * })
 * ```
 */
export async function createPatient(
  patientData: CreatePatientInput
): Promise<Patient> {
  // Implementation...
}
```

## ❌ **Anti-Patterns to Avoid**

### **❌ Overusing Client Components**
```typescript
// ❌ Bad: Unnecessary client component
'use client'

export function PatientHeader({ title }: { title: string }) {
  return <h1 className="text-2xl font-bold">{title}</h1>
}

// ✅ Good: Server component for static content
export function PatientHeader({ title }: { title: string }) {
  return <h1 className="text-2xl font-bold">{title}</h1>
}
```

### **❌ Prop Drilling**
```typescript
// ❌ Bad: Prop drilling
function App() {
  const user = useUser()
  return <Dashboard user={user} />
}

function Dashboard({ user }) {
  return <PatientList user={user} />
}

function PatientList({ user }) {
  return <PatientItem user={user} />
}

// ✅ Good: Context or direct data fetching
function PatientItem() {
  const user = useUser() // Get from context
  // or
  const user = await getCurrentUser() // Server component
  
  return <div>{user.name}</div>
}
```

### **❌ Mixing Server and Client Logic**
```typescript
// ❌ Bad: Client component trying to do server work
'use client'

export function PatientList() {
  const [patients, setPatients] = useState([])
  
  useEffect(() => {
    // This won't work in client component
    fetch('/api/patients', {
      headers: { Authorization: `Bearer ${serverOnlyToken}` }
    })
  }, [])
  
  return <div>{/* render */}</div>
}

// ✅ Good: Server component for data fetching
export default async function PatientList() {
  const patients = await getPatients() // Server-side data fetching
  
  return <ClientPatientList patients={patients} />
}

'use client'
function ClientPatientList({ patients }: { patients: Patient[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  // Client-side filtering logic
  
  return <div>{/* render with interaction */}</div>
}
```

---

## ✅ **Quality Checklist**

### **Code Review Checklist**
- [ ] Components follow Single Responsibility Principle
- [ ] Server/Client components used appropriately
- [ ] TypeScript types are properly defined
- [ ] Error boundaries implemented for critical sections
- [ ] Loading states implemented for async operations
- [ ] Accessibility attributes added (aria-labels, roles)
- [ ] Performance optimizations applied (memo, useMemo, useCallback when needed)
- [ ] Tests written for complex business logic
- [ ] Documentation updated for public APIs

### **Performance Checklist**
- [ ] Images optimized with Next.js Image component
- [ ] Bundle size under 300KB for initial load
- [ ] Core Web Vitals targets met (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Appropriate caching strategies implemented
- [ ] Database queries optimized (proper indexing, minimal N+1 queries)
- [ ] Client-side state minimized

---

> **🔄 Living Document**: Standards evoluem com novas práticas e feedback do time. Baseado em pesquisa de melhores práticas 2025 para Next.js 15 + Turborepo + Enterprise patterns.