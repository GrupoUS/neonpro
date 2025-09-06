# NeonPro Frontend Architecture Document

## Template and Framework Selection

### Framework Decision

**Selected Framework**: Next.js 15 with React 19\
**Rationale**: Next.js provides the optimal foundation for NeonPro's healthcare platform requirements:

- **Server-Side Rendering**: Critical for SEO and initial page load performance in Brazilian markets
- **App Router**: Modern routing with React Server Components for optimal performance
- **API Routes**: Integrated backend functionality for healthcare data processing
- **Built-in Optimization**: Image optimization, font optimization, and Core Web Vitals focus
- **Vercel Deployment**: Seamless deployment with edge functions for global performance

**No Starter Template Used**: Custom implementation built from scratch to meet specific healthcare compliance and Brazilian regulatory requirements.

### Change Log

| Date       | Version | Description                                                                        | Author           |
| ---------- | ------- | ---------------------------------------------------------------------------------- | ---------------- |
| 2025-09-06 | 2.0.0   | Enhanced with frontend architecture template structure and current state alignment | AI IDE Agent     |
| 2024-12-01 | 1.0.0   | Initial frontend architecture document                                             | Development Team |

## Frontend Tech Stack

### Technology Stack Table

| Category              | Technology         | Version  | Purpose                              | Rationale                                                     |
| --------------------- | ------------------ | -------- | ------------------------------------ | ------------------------------------------------------------- |
| **Framework**         | Next.js            | 15.5.2   | SSR, App Router, Server Components   | Healthcare performance requirements, SEO for Brazilian market |
| **UI Library**        | React              | 19.0.0   | Component-based UI development       | Industry standard, excellent TypeScript support               |
| **State Management**  | Zustand            | ^4.4.0   | Client state management              | Lightweight, TypeScript-first, minimal boilerplate            |
| **Server State**      | TanStack Query     | ^5.0.0   | Server state synchronization         | Caching, background updates, optimistic updates               |
| **Routing**           | Next.js App Router | 15.5.2   | File-based routing with layouts      | Built-in, supports React Server Components                    |
| **Build Tool**        | Turbo (Turborepo)  | ^1.10.0  | Monorepo build orchestration         | Fast builds, intelligent caching, parallel execution          |
| **Styling**           | Tailwind CSS       | ^3.4.0   | Utility-first CSS framework          | Rapid development, consistent design system                   |
| **Component Library** | shadcn/ui          | v4       | Accessible UI components             | WCAG 2.1 AA compliance, customizable, healthcare-optimized    |
| **Form Handling**     | React Hook Form    | ^7.45.0  | Form state and validation            | Performance-focused, minimal re-renders                       |
| **Validation**        | Zod                | ^3.23.0  | Schema validation                    | TypeScript-first, runtime safety                              |
| **Animation**         | Framer Motion      | ^10.16.0 | UI animations and transitions        | Declarative animations, gesture support                       |
| **Testing**           | Vitest             | ^1.0.0   | Unit and integration testing         | Fast, Vite-powered, Jest-compatible                           |
| **E2E Testing**       | Playwright         | ^1.40.0  | End-to-end testing                   | Cross-browser, reliable, healthcare workflow testing          |
| **Dev Tools**         | TypeScript         | 5.7.2    | Type safety and developer experience | Strict mode, healthcare data type safety                      |

## Project Structure

**Current MVP State**: Simplified 8-package monorepo architecture optimized for rapid development.

```plaintext
neonpro/
├── apps/
│   ├── web/                    # Next.js 15 Frontend Application
│   │   ├── src/
│   │   │   ├── app/            # App Router (Next.js 15)
│   │   │   │   ├── (auth)/     # Authentication route group
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (dashboard)/ # Protected dashboard routes
│   │   │   │   │   ├── patients/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── new/
│   │   │   │   │   ├── appointments/
│   │   │   │   │   ├── ai-chat/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── compliance/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── api/        # API routes
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── patients/
│   │   │   │   │   ├── appointments/
│   │   │   │   │   └── health/
│   │   │   │   ├── globals.css
│   │   │   │   ├── layout.tsx  # Root layout
│   │   │   │   └── page.tsx    # Landing page
│   │   │   ├── components/     # React components
│   │   │   │   ├── ui/         # shadcn/ui base components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── healthcare/ # Healthcare-specific components
│   │   │   │   │   ├── PatientCard.tsx
│   │   │   │   │   ├── AppointmentScheduler.tsx
│   │   │   │   │   ├── LGPDConsentManager.tsx
│   │   │   │   │   └── NoShowPredictor.tsx
│   │   │   │   ├── forms/      # Form components
│   │   │   │   │   ├── PatientForm.tsx
│   │   │   │   │   ├── AppointmentForm.tsx
│   │   │   │   │   └── ConsentForm.tsx
│   │   │   │   └── layouts/    # Layout components
│   │   │   │       ├── DashboardLayout.tsx
│   │   │   │       ├── AuthLayout.tsx
│   │   │   │       └── PublicLayout.tsx
│   │   │   ├── lib/            # Utilities and integrations
│   │   │   │   ├── hooks/      # Custom React hooks
│   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   ├── usePatients.ts
│   │   │   │   │   └── useAuditLogging.ts
│   │   │   │   ├── stores/     # Zustand state management
│   │   │   │   │   ├── authStore.ts
│   │   │   │   │   ├── patientStore.ts
│   │   │   │   │   └── uiStore.ts
│   │   │   │   ├── services/   # API service layer
│   │   │   │   │   ├── api.ts
│   │   │   │   │   ├── auth.ts
│   │   │   │   │   └── patients.ts
│   │   │   │   ├── utils.ts    # Common utilities
│   │   │   │   ├── supabase.ts # Supabase client
│   │   │   │   └── validations.ts # Zod schemas
│   │   │   └── types/          # Frontend-specific types
│   │   │       ├── auth.ts
│   │   │       ├── patient.ts
│   │   │       └── api.ts
│   │   ├── public/             # Static assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── favicon.ico
│   │   ├── tests/              # Frontend tests
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── utils/
│   │   ├── next.config.js      # Next.js configuration
│   │   ├── tailwind.config.ts  # Tailwind configuration
│   │   ├── tsconfig.json       # TypeScript configuration
│   │   └── package.json
│   └── api/                    # Backend API Application
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── services/
│       └── package.json
├── packages/                   # Shared packages (8 essential)
│   ├── types/                  # @neonpro/types
│   ├── ui/                     # @neonpro/ui
│   ├── database/               # @neonpro/database
│   ├── core-services/          # @neonpro/core-services
│   ├── security/               # @neonpro/security
│   ├── shared/                 # @neonpro/shared
│   ├── utils/                  # @neonpro/utils
│   └── config/                 # @neonpro/config
└── tools/                      # Development tools
    ├── e2e/
    ├── testing/
    └── scripts/
```

## Component Standards

### Component Template

```typescript
import { useAuditLogging } from "@/hooks/useAuditLogging";
import { cn } from "@/lib/utils";
import React from "react";

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
  // Add specific props here
  variant?: "default" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}

export function ComponentName({
  className,
  children,
  variant = "default",
  size = "md",
  disabled = false,
  onClick,
  ...props
}: ComponentNameProps) {
  const { logComponentInteraction } = useAuditLogging();

  const handleClick = () => {
    if (!disabled && onClick) {
      logComponentInteraction("ComponentName", "click");
      onClick();
    }
  };

  return (
    <div
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        // Variant styles
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "default",
          "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
          "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
        },
        // Size styles
        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4 text-base": size === "md",
          "h-12 px-6 text-lg": size === "lg",
        },
        // Disabled styles
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
}

// Export with display name for debugging
ComponentName.displayName = "ComponentName";
```

### Naming Conventions

**Files and Directories**:

- Components: `PascalCase.tsx` (e.g., `PatientCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `usePatientData.ts`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Pages: `page.tsx` (App Router convention)
- Layouts: `layout.tsx` (App Router convention)
- API Routes: `route.ts` (App Router convention)

**Components**:

- Component names: `PascalCase` (e.g., `PatientCard`, `AppointmentScheduler`)
- Props interfaces: `ComponentNameProps` (e.g., `PatientCardProps`)
- Event handlers: `handleEventName` (e.g., `handleSubmit`, `handlePatientSelect`)

**State and Stores**:

- Zustand stores: `camelCase` with `Store` suffix (e.g., `authStore`, `patientStore`)
- State variables: `camelCase` (e.g., `isLoading`, `selectedPatient`)
- Actions: `camelCase` verbs (e.g., `setUser`, `updatePatient`, `clearCache`)

**Constants**:

- Global constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`, `API_ENDPOINTS`)
- Enum values: `SCREAMING_SNAKE_CASE` (e.g., `USER_ROLES.ADMIN`)

## State Management

### Store Structure

```plaintext
src/lib/stores/
├── authStore.ts              # Authentication state
├── patientStore.ts           # Patient management state
├── appointmentStore.ts       # Appointment scheduling state
├── uiStore.ts               # UI state (modals, sidebar, theme)
├── complianceStore.ts       # LGPD compliance state
└── index.ts                 # Store exports and providers
```

### State Management Template

````typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Define the state interface
interface PatientState {
  // State
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  filters: PatientFilters;
  
  // Actions
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  removePatient: (id: string) => void;
  selectPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<PatientFilters>) => void;
  clearState: () => void;
}

// Create the store
export const usePatientStore = create<PatientState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        patients: [],
        selectedPatient: null,
        isLoading: false,
        error: null,
        filters: {
          search: '',
          status: 'all',
          riskLevel: 'all',
        },

        // Actions
        setPatients: (patients) =>
          set((state) => {
            state.patients = patients;
            state.error = null;
          }),

        addPatient: (patient) =>
          set((state) => {
            state.patients.push(patient);
          }),

        updatePatient: (id, updates) =>
          set((state) => {
            const index = state.patients.findIndex((p) => p.id === id);
            if (index !== -1) {
              Object.assign(state.patients[index], updates);
            }
            // Update selected patient if it's the one being updated
            if (state.selectedPatient?.id === id) {
              Object.assign(state.selectedPatient, updates);
            }
          }),

        removePatient: (id) =>
          set((state) => {
            state.patients = state.patients.filter((p) => p.id !== id);
            // Clear selection if removed patient was selected
            if (state.selectedPatient?.id === id) {
              state.selectedPatient = null;
            }
          }),

        selectPatient: (patient) =>
          set((state) => {
            state.selectedPatient = patient;
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
            state.isLoading = false;
          }),

        setFilters: (filters) =>
          set((state) => {
            Object.assign(state.filters, filters);
          }),

        clearState: () =>
          set((state) => {
            state.patients = [];
            state.selectedPatient = null;
            state.isLoading = false;
            state.error = null;
            state.filters = {
              search: '',
              status: 'all',
              riskLevel: 'all',
            };
          }),
      })),
      {
        name: 'patient-store',
        partialize: (state) => ({
          // Only persist selected fields
          selectedPatient: state.selectedPatient,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'patient-store',
    }
  )
);

// Selectors for computed values
export const usePatientSelectors = () => {
  const store = usePatientStore();
  
  return {
    filteredPatients: store.patients.filter((patient) => {
      const matchesSearch = patient.name
        .toLowerCase()
        .includes(store.filters.search.toLowerCase());
      const matchesStatus = store.filters.status === 'all' || 
        patient.status === store.filters.status;
      const matchesRisk = store.filters.riskLevel === 'all' || 
        patient.riskLevel === store.filters.riskLevel;
      
      return matchesSearch && matchesStatus && matchesRisk;
    }),
    
    patientCount: store.patients.length,
    hasSelectedPatient: !!store.selectedPatient,
    isEmptyState: store.patients.length === 0 && !store.isLoading,
  };
};
```## API Integration

### Service Template

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuditLogging } from '@/hooks/useAuditLogging';

// Base API service class
class BaseAPIService {
  protected supabase = createClientComponentClient();
  protected auditLogger = useAuditLogging();

  protected async handleRequest<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    operationName: string,
    resourceId?: string
  ): Promise<T> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        this.auditLogger.logError(operationName, error, { resourceId });
        throw new Error(`${operationName} failed: ${error.message}`);
      }

      this.auditLogger.logSuccess(operationName, { resourceId });
      return data as T;
    } catch (error) {
      this.auditLogger.logError(operationName, error, { resourceId });
      throw error;
    }
  }
}

// Patient service implementation
export class PatientService extends BaseAPIService {
  async getPatients(clinicId: string, filters?: PatientFilters): Promise<Patient[]> {
    return this.handleRequest(
      async () => {
        let query = this.supabase
          .from('patients')
          .select('*')
          .eq('clinic_id', clinicId)
          .eq('is_active', true);

        if (filters?.search) {
          query = query.ilike('full_name', `%${filters.search}%`);
        }

        if (filters?.riskLevel && filters.riskLevel !== 'all') {
          const riskRanges = {
            low: [0, 30],
            medium: [31, 69],
            high: [70, 100],
          };
          const [min, max] = riskRanges[filters.riskLevel];
          query = query.gte('no_show_risk_score', min).lte('no_show_risk_score', max);
        }

        return query.order('created_at', { ascending: false });
      },
      'getPatients',
      clinicId
    );
  }

  async getPatient(id: string): Promise<Patient> {
    return this.handleRequest(
      () => this.supabase
        .from('patients')
        .select('*, appointments(*)')
        .eq('id', id)
        .single(),
      'getPatient',
      id
    );
  }

  async createPatient(data: CreatePatientRequest): Promise<Patient> {
    return this.handleRequest(
      () => this.supabase
        .from('patients')
        .insert(data)
        .select()
        .single(),
      'createPatient'
    );
  }

  async updatePatient(id: string, updates: UpdatePatientRequest): Promise<Patient> {
    return this.handleRequest(
      () => this.supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single(),
      'updatePatient',
      id
    );
  }

  async deletePatient(id: string): Promise<void> {
    return this.handleRequest(
      () => this.supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', id),
      'deletePatient',
      id
    );
  }
}

// Export service instance
export const patientService = new PatientService();
````

### API Client Configuration

```typescript
import { useAuthStore } from "@/lib/stores/authStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Supabase client configuration
export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});

// API client with authentication interceptor
class APIClient {
  private supabase = supabase;

  constructor() {
    this.setupAuthInterceptor();
  }

  private setupAuthInterceptor() {
    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        useAuthStore.getState().clearAuth();
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        useAuthStore.getState().setSession(session);
      }
    });
  }

  async request<T>(
    table: string,
    operation: "select" | "insert" | "update" | "delete",
    data?: any,
    filters?: any,
  ): Promise<T> {
    // Check authentication
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) {
      throw new Error("Authentication required");
    }

    let query = this.supabase.from(table);

    switch (operation) {
      case "select":
        query = query.select(filters?.select || "*");
        if (filters?.eq) {
          Object.entries(filters.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        break;
      case "insert":
        query = query.insert(data);
        break;
      case "update":
        query = query.update(data);
        if (filters?.eq) {
          Object.entries(filters.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        break;
      case "delete":
        query = query.delete();
        if (filters?.eq) {
          Object.entries(filters.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        break;
    }

    const { data: result, error } = await query;

    if (error) {
      // Log error for audit trail
      console.error(`API Error [${operation} ${table}]:`, error);
      throw new Error(`API Error: ${error.message}`);
    }

    return result as T;
  }
}

export const apiClient = new APIClient();
```

## Routing

### Route Configuration

```typescript
// middleware.ts - Authentication and authorization
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check professional status
    const { data: professional } = await supabase
      .from("professionals")
      .select("is_active, professional_type, clinic_id")
      .eq("user_id", session.user.id)
      .single();

    if (!professional || !professional.is_active) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Add professional context to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-role", professional.professional_type);
    requestHeaders.set("x-clinic-id", professional.clinic_id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Redirect authenticated users away from auth pages
  if (session && req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};

// app/(dashboard)/layout.tsx - Protected layout
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Get professional data
  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (!professional || !professional.is_active) {
    redirect("/unauthorized");
  }

  return (
    <DashboardLayout user={session.user} professional={professional}>
      {children}
    </DashboardLayout>
  );
}

// Route groups for organization
// (auth) - Authentication pages (login, register)
// (dashboard) - Protected application pages
// api - API routes for backend functionality
```

## Styling Guidelines

### Styling Approach

**Tailwind CSS with Healthcare Design System**:

- Utility-first approach for rapid development
- Custom healthcare design tokens
- WCAG 2.1 AA compliant color palette
- Responsive design with mobile-first approach
- Dark mode support for accessibility

**Component Styling Pattern**:

```typescript
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Define component variants
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        ghost: "hover:bg-gray-100",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants>
{}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Global Theme Variables

````css
/* globals.css - Healthcare design system */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Healthcare Color Palette */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;  /* Medical Blue */
  --primary-600: #2563eb;
  --primary-900: #1e3a8a;

  --secondary-50: #fffbeb;
  --secondary-100: #fef3c7;
  --secondary-500: #f59e0b;  /* Aesthetic Gold */
  --secondary-600: #d97706;

  --success-50: #f0fdf4;
  --success-500: #22c55e;   /* Brazilian Green */
  --success-600: #16a34a;

  --warning-50: #fffbeb;
  --warning-500: #f59e0b;   /* Attention Orange */
  --warning-600: #d97706;

  --error-50: #fef2f2;
  --error-500: #ef4444;     /* Medical Alert Red */
  --error-600: #dc2626;

  /* Neutral Grays */
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;

  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */

  /* Typography Scale */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
}

/* Dark mode support */
[data-theme="dark"] {
  --primary-50: #1e3a8a;
  --primary-100: #2563eb;
  --primary-500: #60a5fa;
  --primary-600: #3b82f6;
  --primary-900: #dbeafe;

  --neutral-50: #111827;
  --neutral-100: #1f2937;
  --neutral-200: #374151;
  --neutral-300: #4b5563;
  --neutral-400: #6b7280;
  --neutral-500: #9ca3af;
  --neutral-600: #d1d5db;
  --neutral-700: #e5e7eb;
  --neutral-800: #f3f4f6;
  --neutral-900: #f9fafb;
}

/* Base styles */
@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Focus styles for accessibility */
  *:focus-visible {
    @apply outline-none ring-2 ring-blue-500 ring-offset-2;
  }

  /* Healthcare-specific utilities */
  .healthcare-card {
    @apply bg-white border border-gray-200 rounded-lg shadow-sm p-6;
  }

  .healthcare-button {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500;
    @apply disabled:opacity-50 disabled:pointer-events-none;
    min-height: 44px; /* Touch target size */
  }

  .healthcare-input {
    @apply flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm;
    @apply placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20;
    @apply disabled:cursor-not-allowed disabled:opacity-50;
  }
}

/* Portuguese language optimizations */
html[lang="pt-BR"] {
  /* Adjust line height for Portuguese text */
  line-height: 1.6;
}

/* Print styles for healthcare documents */
@media print {
  .no-print {
    display: none !important;
  }
  
  .healthcare-card {
    @apply border border-gray-400 shadow-none;
  }
}
```## Testing Requirements

### Component Test Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PatientCard } from '@/components/healthcare/PatientCard';
import { testUtils } from '@/lib/test-utils';

// Mock dependencies
vi.mock('@/hooks/useAuditLogging', () => ({
  useAuditLogging: () => ({
    logComponentView: vi.fn(),
    logPatientAccess: vi.fn(),
  }),
}));

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('PatientCard', () => {
  const mockPatient = testUtils.createMockPatient({
    id: '123',
    name: 'João Silva',
    cpf: '123.456.789-01',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    lgpdCompliant: true,
    noShowRisk: 'low',
  });

  const mockUser = testUtils.createMockUser('professional');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render patient information correctly', () => {
    render(
      <PatientCard 
        patient={mockPatient} 
        userRole={mockUser.role}
        onViewDetails={vi.fn()}
      />,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText(/CPF:/)).toBeInTheDocument();
    expect(screen.getByText('LGPD')).toBeInTheDocument();
    expect(screen.getByText(/Risco Baixo/)).toBeInTheDocument();
  });

  it('should mask sensitive data for unauthorized users', () => {
    const coordinatorUser = testUtils.createMockUser('coordinator');
    
    render(
      <PatientCard 
        patient={mockPatient} 
        userRole={coordinatorUser.role}
        onViewDetails={vi.fn()}
      />,
      { wrapper: TestWrapper }
    );

    // CPF should be masked
    expect(screen.getByText(/\*\*\*\.\*\*\*\.\*\*\*-\*\*/)).toBeInTheDocument();
    expect(screen.queryByText('123.456.789-01')).not.toBeInTheDocument();
  });

  it('should call onViewDetails when button is clicked', async () => {
    const onViewDetails = vi.fn();
    
    render(
      <PatientCard 
        patient={mockPatient} 
        userRole={mockUser.role}
        onViewDetails={onViewDetails}
      />,
      { wrapper: TestWrapper }
    );

    const viewButton = screen.getByRole('button', { name: /ver detalhes/i });
    fireEvent.click(viewButton);
    
    await waitFor(() => {
      expect(onViewDetails).toHaveBeenCalledWith(mockPatient.id);
    });
  });

  it('should be accessible', async () => {
    const { container } = render(
      <PatientCard 
        patient={mockPatient} 
        userRole={mockUser.role}
        onViewDetails={vi.fn()}
      />,
      { wrapper: TestWrapper }
    );

    // Check for proper ARIA attributes
    const card = screen.getByRole('region');
    expect(card).toHaveAttribute('aria-label');
    
    // Check for keyboard navigation
    const viewButton = screen.getByRole('button', { name: /ver detalhes/i });
    expect(viewButton).toBeInTheDocument();
    
    // Run accessibility tests
    await testUtils.expectAccessible(container);
  });

  it('should handle loading state', () => {
    render(
      <PatientCard 
        patient={null} 
        userRole={mockUser.role}
        onViewDetails={vi.fn()}
        isLoading={true}
      />,
      { wrapper: TestWrapper }
    );

    expect(screen.getByTestId('patient-card-skeleton')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(
      <PatientCard 
        patient={mockPatient} 
        userRole={mockUser.role}
        onViewDetails={vi.fn()}
        error="Failed to load patient data"
      />,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
````

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation with proper mocking
2. **Integration Tests**: Test component interactions and data flow
3. **E2E Tests**: Test critical user flows using Playwright (patient registration, appointment booking)
4. **Coverage Goals**: Aim for 80% code coverage with focus on business logic
5. **Test Structure**: Follow Arrange-Act-Assert pattern consistently
6. **Mock External Dependencies**: API calls, authentication, third-party services
7. **Accessibility Testing**: Include accessibility checks in component tests
8. **Portuguese Language Testing**: Test with Brazilian Portuguese content and formatting

## Environment Configuration

```bash
# .env.local - Development environment
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production - Production environment
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_SITE_URL=https://neonpro.com.br

# Optional: Analytics and monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_NO_SHOW_PREDICTION=true
NEXT_PUBLIC_ENABLE_COMPLIANCE_CENTER=true

# Optional: Brazilian integrations
NEXT_PUBLIC_WHATSAPP_BUSINESS_ID=your-whatsapp-business-id
NEXT_PUBLIC_SMS_PROVIDER=your-sms-provider
```

## Frontend Developer Standards

### Critical Coding Rules

**Universal Rules**:

1. **Always use TypeScript**: No `any` types, prefer strict mode
2. **Component Props**: Always define interfaces for component props
3. **Error Boundaries**: Wrap components that might fail with error boundaries
4. **Loading States**: Always handle loading and error states in UI
5. **Accessibility**: Include ARIA labels, semantic HTML, keyboard navigation
6. **Performance**: Use React.memo, useMemo, useCallback for expensive operations
7. **Security**: Never expose sensitive data in client-side code

**Next.js Specific Rules**:

1. **Server Components**: Use Server Components by default, Client Components only when needed
2. **App Router**: Use the new App Router conventions (page.tsx, layout.tsx, route.ts)
3. **Image Optimization**: Always use Next.js Image component for images
4. **Font Optimization**: Use next/font for font loading optimization
5. **Metadata**: Define proper metadata for SEO and social sharing
6. **Environment Variables**: Use NEXT_PUBLIC_ prefix for client-side variables only

**Healthcare Specific Rules**:

1. **Audit Logging**: Log all patient data access using useAuditLogging hook
2. **Data Masking**: Mask sensitive data based on user permissions
3. **LGPD Compliance**: Check consent before processing patient data
4. **Portuguese Language**: Use pt-BR locale for dates, numbers, and text
5. **Accessibility**: Ensure WCAG 2.1 AA compliance for healthcare accessibility
6. **Error Messages**: Provide clear, actionable error messages in Portuguese

### Quick Reference

**Development Commands**:

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

**Key Import Patterns**:

```typescript
// Components
import { PatientCard } from "@/components/healthcare/PatientCard";
import { Button } from "@/components/ui/button";

// Hooks
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";

// Stores
import { useAuthStore } from "@/lib/stores/authStore";
import { usePatientStore } from "@/lib/stores/patientStore";

// Services
import { apiClient } from "@/lib/api-client";
import { patientService } from "@/lib/services/patients";

// Types
import type { Appointment, Patient } from "@neonpro/types";

// Utils
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
```

**File Naming Conventions**:

- Components: `PascalCase.tsx`
- Pages: `page.tsx` (App Router)
- Layouts: `layout.tsx` (App Router)
- API Routes: `route.ts` (App Router)
- Hooks: `useHookName.ts`
- Stores: `storeName.ts`
- Utils: `camelCase.ts`

**Project-Specific Patterns**:

```typescript
// Healthcare component wrapper
export function HealthcareComponent({ children, lgpdCompliant = true }) {
  const { logComponentView } = useAuditLogging();

  useEffect(() => {
    logComponentView("ComponentName");
  }, []);

  return (
    <div className="healthcare-component" data-lgpd-compliant={lgpdCompliant}>
      {children}
    </div>
  );
}

// Patient data access pattern
export function usePatientData(patientId: string) {
  const { logPatientAccess } = useAuditLogging();

  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      await logPatientAccess(patientId, "VIEW_PATIENT_PROFILE");
      return patientService.getPatient(patientId);
    },
  });
}

// Brazilian date formatting
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatBrazilianDate(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}
```

---

**Frontend Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui\
**Quality Validated**: ✅ WCAG 2.1 AA + Brazilian Healthcare Compliance + MVP Architecture\
**Target Market**: Brazilian Aesthetic Clinics with Professional Healthcare Focus\
**Status**: Enhanced with Frontend Architecture Template Structure\
**Version**: 2.0.0 - Template-Enhanced Frontend Architecture Document
