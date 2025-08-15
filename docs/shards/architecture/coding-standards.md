# NeonPro Coding Standards

_Auto-loaded by BMad Dev Agent (@dev) - Version: BMad v4.29.0_

## 🎯 Overview

This document defines the coding standards, patterns, and conventions for NeonPro development. It is automatically loaded when using the BMad Dev Agent (@dev) to ensure consistent code quality across all implementations.

## 📋 Core Technology Standards

### TypeScript Configuration

- **Strict Mode**: Always use strict TypeScript configuration
- **No Any**: Never use `any` type - always define proper interfaces
- **Explicit Returns**: Define return types for all functions
- **Null Safety**: Use optional chaining and nullish coalescing

```typescript
// ✅ Good
interface PatientData {
  id: string;
  name: string;
  email?: string;
}

const getPatient = async (id: string): Promise<PatientData | null> => {
  // Implementation
};

// ❌ Bad
const getPatient = async (id: any): Promise<any> => {
  // Implementation
};
```

### Component Architecture

#### Server Components (Default)

```typescript
// app/dashboard/patients/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PatientsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', session.user.id)

  return (
    <DashboardLayout title="Patients" description="Manage your patients">
      <PatientsList patients={patients} />
    </DashboardLayout>
  )
}
```

#### Client Components (When Required)

```typescript
// components/dashboard/PatientForm.tsx
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits')
})

type PatientFormData = z.infer<typeof patientSchema>

export default function PatientForm() {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      // Handle submission
      toast.success('Patient created successfully')
    } catch (error) {
      toast.error('Failed to create patient')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
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
import { createServerClient } from '@/lib/supabase/server';

// Client Components - Use browser client
import { createBrowserClient } from '@/lib/supabase/client';

// Never mix clients - always use appropriate client for context
```

### Page-Level Authentication

```typescript
// Every protected page must start with this pattern
export default async function ProtectedPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  .eq('clinic_id', session.user.id); // Always filter by clinic_id
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define schema
const formSchema = z.object({
  // Define validation rules
});

// 2. Infer type
type FormData = z.infer<typeof formSchema>;

// 3. Initialize form
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    // Set default values
  },
});

// 4. Handle submission with proper error handling
const onSubmit = async (data: FormData) => {
  try {
    // API call
    toast.success('Success message');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error message');
  }
};
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
const [isLoading, setIsLoading] = useState(false);
const [patients, setPatients] = useState<Patient[]>([]);

// Use useCallback for memoized functions
const handlePatientUpdate = useCallback(
  async (id: string, data: Partial<Patient>) => {
    // Implementation
  },
  []
);
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

_This document is part of the BMad Method configuration for NeonPro and is automatically loaded by the Dev Agent for consistent development standards._
