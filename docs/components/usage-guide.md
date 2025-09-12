---
title: "NeonPro Component Usage Guide"
last_updated: 2025-01-12
form: reference
tags: [components, usage, monorepo, healthcare, ui]
related:
  - ../architecture/frontend-architecture.md
  - ../architecture/front-end-spec.md
  - ../architecture/source-tree.md
  - ../agents/apex-ui-ux-designer.md
---

# NeonPro Component Usage Guide

**The Single Source of Truth for Component Development in the NeonPro Monorepo**

This guide provides definitive guidance on component architecture, placement strategies, import patterns, and development workflows for the NeonPro aesthetic clinic management platform.

## Table of Contents

1. [Component Architecture & Routing](#component-architecture--routing)
2. [Component Placement Strategy](#component-placement-strategy)
3. [Import/Export Patterns](#importexport-patterns)
4. [Component Development Workflow](#component-development-workflow)
5. [Healthcare-Specific Considerations](#healthcare-specific-considerations)
6. [Visual Documentation](#visual-documentation)
7. [Troubleshooting](#troubleshooting)

---

## Component Architecture & Routing

### Technology Stack Integration

NeonPro uses a **TanStack Router + Vite + React 19** architecture with **Turborepo monorepo** structure:

```yaml
CORE_STACK:
  frontend: "TanStack Router + Vite + React 19 + TypeScript 5.7.2"
  styling: "Tailwind CSS + shadcn/ui v4"
  backend: "Hono.dev + Supabase + PostgreSQL 15+"
  deployment: "Vercel (São Paulo region)"
  performance: "<2s page loads, <100ms interactions"
```

### Component Hierarchy

Following **Atomic Design Methodology** with healthcare-specific extensions:

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                      │
├─────────────────────────────────────────────────────────────┤
│ ATOMS          │ Basic UI elements (Button, Input, Badge)   │
│ MOLECULES      │ Simple combinations (SearchBox, Card)      │
│ ORGANISMS      │ Complex components (Dashboard, Scheduler)  │
│ TEMPLATES      │ Page layouts with placeholder content      │
│ PAGES          │ Specific instances with real content       │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Integration

**TanStack Router** file-based routing with component integration:

````typescript
// Route definition with component integration
// apps/web/src/routes/dashboard.tsx
import { PatientCard } from '@neonpro/shared';
import { DashboardLayout } from '@/components/organisms';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <DashboardLayout>
      <PatientCard patientId='123' userRole='professional' lgpdCompliant />
    </DashboardLayout>
  );
}

---

## Component Placement Strategy

### Modular Component Patterns (MCPs)

Based on the monorepo structure analysis, components are organized using clear placement criteria:

#### **Shared Components** (`packages/ui` or `@neonpro/ui`)

**Criteria for Shared Placement:**

- Used across multiple applications (web, future mobile)
- Core design system components
- No application-specific business logic
- High reusability score (>3 usage locations)

**Examples:**

```typescript
// packages/ui/src/components/ui/button.tsx
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

// Usage across apps
import { Button } from '@neonpro/ui';
````

#### **Feature-Specific Components** (`apps/web/src/components/`)

**Atomic Design Structure:**

```
apps/web/src/components/
├── atoms/                    # Basic building blocks
│   ├── badge.tsx            # Status indicators
│   ├── input.tsx            # Form inputs
│   └── label.tsx            # Form labels
├── molecules/               # Composed components
│   ├── alert.tsx            # Enhanced notifications
│   ├── card.tsx             # Content containers
│   └── table.tsx            # Data display
├── organisms/               # Complex features
│   ├── ai-chat-container.tsx
│   └── governance/          # Admin features
└── ui/                      # Specialized components
    ├── magic-card.tsx       # Visual effects
    └── universal-button.tsx # Advanced interactions
```

#### **Healthcare-Specific Components** (`packages/shared/src/`)

**Criteria for Healthcare Components:**

- LGPD compliance requirements
- Medical data handling
- Audit logging capabilities
- Brazilian healthcare regulations

**Base Interface:**

```typescript
interface HealthcareComponentProps {
  readonly patientId?: string;
  readonly userRole: 'admin' | 'professional' | 'coordinator';
  readonly lgpdCompliant: boolean;
  readonly onAuditLog?: (action: string, details?: Record<string, any>) => void;
}
```

### Decision Matrix

| Component Type    | Reusability | Complexity | Domain         | Location                  |
| ----------------- | ----------- | ---------- | -------------- | ------------------------- |
| **Button, Input** | High        | Low        | Generic        | `@neonpro/ui`             |
| **PatientCard**   | Medium      | Medium     | Healthcare     | `packages/shared/src/`    |
| **Dashboard**     | Low         | High       | App-specific   | `apps/web/src/organisms/` |
| **MagicCard**     | Medium      | Medium     | Visual Effects | `apps/web/src/ui/`        |

---

## Import/Export Patterns

### Workspace Aliases Configuration

**TypeScript Configuration** (`tsconfig.json`):

````json
**Vite Configuration** (`vite.config.ts`):

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
````

### Import Priority Hierarchy

import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
resolve: {
alias: {
'@': path.resolve(__dirname, './src'),
'@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
'@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
},
},
});
import { Table, TableBody, TableCell, TableHead } from '@/components/molecules/table';

````
**3. Basic Atoms (Primitive Components)**

```typescript
import { Badge } from '@/components/atoms/badge';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
````

**4. Specialized UI Components**

```typescript
import { MagicCard } from '@/components/ui/magic-card';
import { UniversalButton } from '@/components/ui/universal-button';
```

**5. Healthcare Components**

```typescript
import { AestheticScheduler, PatientCard } from '@neonpro/shared';
```

### Barrel Exports Pattern

**Package-level exports** (`packages/ui/src/index.ts`):

```typescript
// Core components
export * from './components/ui/button';
export * from './components/ui/card';

// Types
export type { ButtonProps, CardProps } from './types';

// Theme
export { ThemeProvider } from './theme';
```

**App-level exports** (`apps/web/src/components/index.ts`):

```typescript
// Atoms
export { Badge } from './atoms/badge';
export { Input } from './atoms/input';
export { Label } from './atoms/label';

// Molecules
export { Alert, AlertDescription, AlertTitle } from './molecules/alert';
export { Card } from './molecules/card';
export { Table, TableBody, TableCell } from './molecules/table';

// Note: Organisms not exported to prevent circular dependencies
```

### Tree-Shaking Optimization

**Optimized imports for bundle size:**

```typescript
// ✅ Good - Tree-shakeable
import { PatientCard } from '@neonpro/shared/components/patient-card';
import { Button } from '@neonpro/ui';

// ❌ Avoid - Imports entire package
import * as Shared from '@neonpro/shared';
import * as UI from '@neonpro/ui';
```

---

## Component Development Workflow

### Creation Process

**Step 1: Determine Component Scope**

```bash
# Use decision matrix to determine placement
# High reusability + Generic domain = @neonpro/ui
# Healthcare-specific + Medium reusability = packages/shared
# App-specific + Complex = apps/web/src/organisms
```

**Step 2: Create Component Structure**

```typescript
// Example: Creating a new healthcare component
// Location: packages/shared/src/components/patient-risk-card.tsx

import type { HealthcareComponentProps } from '../types'

interface PatientRiskCardProps extends HealthcareComponentProps {
  patient: Patient
  riskScore: NoShowRiskScore
  onScheduleIntervention: (type: string) => void
}

export function PatientRiskCard({
  patient,
  riskScore,
  onScheduleIntervention,
  onAuditLog
}: PatientRiskCardProps) {
  // Component implementation with audit logging
  const handleAction = (action: string) => {
    onAuditLog?.(action, { patientId: patient.id, riskScore: riskScore.score })
    onScheduleIntervention(action)
  }

  return (
    // Component JSX
  )
}
```

### Testing Strategy

**Component Testing with Healthcare Context:**

````typescript
// packages/shared/src/components/__tests__/patient-risk-card.test.tsx
// packages/shared/src/components/__tests__/patient-risk-card.test.tsx
import { render, screen } from '@testing-library/react';
import { PatientRiskCard } from '../patient-risk-card';

const mockPatient = {
  id: 'patient-123',
  name: 'João Silva',
  cpf: '123.456.789-01',
};

const mockRiskScore = {
  score: 0.8,
  factors: ['historical_no_shows'],
  historicalNoShows: 3,
};

describe('PatientRiskCard', () => {
  it('displays high risk styling for high-risk patients', () => {
    render(
      <PatientRiskCard
        patient={mockPatient}
        riskScore={mockRiskScore}
        userRole='professional'
        lgpdCompliant={true}
        onScheduleIntervention={vi.fn()}
      />,
    );

    expect(screen.getByText('80% risco')).toBeInTheDocument();
    expect(screen.getByText('Agendar Lembrete')).toBeInTheDocument();
  });
});

**Build Process Integration:**

```bash
# Type checking
bun run type-check

# Linting with oxlint (50x faster than ESLint)
bun run lint:fix

# Testing with Vitest
bun run test

# Build verification
bun run build
````

---

## Healthcare-Specific Considerations

### LGPD Compliance Requirements

**Data Protection by Design:**

```typescript
interface LGPDCompliantComponentProps {
  // Consent management
  lgpdConsent?: {
    version: string;
    timestamp: string;
    scope: string[];
  };

  // Data minimization
  dataMinimization?: boolean;

  // Audit requirements
  auditTrail?: {
    userId: string;
    action: string;
    timestamp: string;
    details?: Record<string, any>;
  };
}
```

**Privacy Controls:**

```typescript
// Example: Patient data with privacy controls
export function PatientDataCard({ patient, userRole, lgpdCompliant }: Props) {
  const shouldMaskData = userRole !== 'admin' && !lgpdCompliant;

  return (
    <Card>
      <CardContent>
        <p>Nome: {shouldMaskData ? maskName(patient.name) : patient.name}</p>
        <p>CPF: {shouldMaskData ? maskCPF(patient.cpf) : patient.cpf}</p>
      </CardContent>
    </Card>
  );
}
```

### Accessibility Standards

**WCAG 2.2 AA Compliance:**

```typescript
// Accessibility-first component design
export function AccessibleButton({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        // Minimum 44px touch target for mobile
        'min-h-[44px] min-w-[44px]',
        // High contrast focus indicators
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        // Color contrast ratio 4.5:1 minimum
        'bg-blue-600 text-white hover:bg-blue-700',
        props.className,
      )}
      // Screen reader support
      aria-label={props['aria-label'] || children?.toString()}
    >
      {children}
    </button>
  );
}
```

### Performance Requirements

**Real-time Healthcare Data:**

```typescript
// Optimized for clinic operations
export function RealTimePatientStatus({ patientId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['patient-status', patientId],
export function RealTimePatientStatus({ patientId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['patient-status', patientId],
    queryFn: () => fetchPatientStatus(patientId),
    // Atualizações em tempo real para operações da clínica
    refetchInterval: 30000, // 30s
  });
  }

  return <PatientStatusDisplay data={data} />;
}
```

---

## Visual Documentation

### Component Hierarchy Diagram

```
                NeonPro Component Architecture
                          
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATIONS                           │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │   apps/web      │              │  apps/mobile    │      │
│  │  (TanStack)     │              │ (React Native)  │      │
│  └─────────────────┘              └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SHARED PACKAGES                           │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │@neonpro/ui  │  │@neonpro/    │  │@neonpro/    │        │
│  │(Core UI)    │  │shared       │  │types        │        │
│  │             │  │(Healthcare) │  │(TypeScript) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 COMPONENT LAYERS                            │
│                                                             │
│  ORGANISMS    │ Dashboard, Scheduler, AI Chat              │
│  ─────────────┼─────────────────────────────────────────── │
│  MOLECULES    │ PatientCard, Alert, Table                  │
│  ─────────────┼─────────────────────────────────────────── │
│  ATOMS        │ Button, Input, Badge, Label                │
└─────────────────────────────────────────────────────────────┘
```

### Import Decision Flowchart

```
Start: Need a Component
          │
          ▼
┌─────────────────────────┐
│ Is it in @neonpro/ui?   │
└─────────────────────────┘
          │
     Yes  │  No
          ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ import from @neonpro/ui │     │ Is it healthcare-       │
│ ✅ DONE                 │     │ specific?               │
└─────────────────────────┘     └─────────────────────────┘
                                          │
                                     Yes  │  No
                                          ▼
                                ┌─────────────────────────┐
                                │ Check @neonpro/shared   │
                                └─────────────────────────┘
                                          │
                                     Yes  │  No
                                          ▼
                                ┌─────────────────────────┐
                                │ Check app components:   │
                                │ atoms → molecules →     │
                                │ organisms → ui          │
                                └─────────────────────────┘
                                          │
                                          ▼
                                ┌─────────────────────────┐
                                │ Create new component    │
                                │ in appropriate location │
                                └─────────────────────────┘
```

---

## Troubleshooting

### Common Issues and Solutions

#### **Import Resolution Errors**

**Problem:** `Module not found: Can't resolve '@neonpro/ui'`

**Solution:**

```bash
# 1. Verify workspace configuration
cat pnpm-workspace.yaml

# 2. Reinstall dependencies
pnpm install

# 3. Check TypeScript paths
# Ensure tsconfig.json has correct path mapping
```

#### **Component Conflicts**

**Problem:** Multiple components with same name

**Solution:**

```typescript
// Use explicit imports to avoid conflicts
import { Button as LocalButton } from '@/components/atoms/button';
import { Button as UIButton } from '@neonpro/ui';

// Or use the recommended hierarchy
import { Button } from '@neonpro/ui'; // Preferred
```

#### **Build Performance Issues**

**Problem:** Slow build times with component imports

**Solution:**

```typescript
// ✅ Use specific imports
import { Button } from '@neonpro/ui/button';

// ❌ Avoid barrel imports in large packages
import { Button } from '@neonpro/ui'; // May import entire package
```

#### **Healthcare Component Errors**

**Problem:** LGPD compliance validation failures

**Solution:**

```typescript
// Ensure all healthcare components implement base interface
interface Props extends HealthcareComponentProps {
  // Component-specific props
}

// Always include audit logging
const handleAction = (action: string) => {
  onAuditLog?.(action, { patientId, timestamp: new Date().toISOString() });
  // Action implementation
};
```

### Development Environment Setup

**Required Tools:**

```bash
# Package manager
npm install -g pnpm

# Build system
pnpm install -g turbo

# Development tools
pnpm install -g @biomejs/biome # Alternative to ESLint
```

**VS Code Extensions:**

- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

---

### Performance Monitoring

**Component Performance Metrics:**

```typescript
// Performance monitoring for healthcare components
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name.includes(componentName)) {
          // Log performance metrics for healthcare-critical components
          console.log(`${componentName} render time:`, entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, [componentName]);
}
```

**Bundle Size Analysis:**

```bash
# Analyze component bundle impact
pnpm run build:analyze

# Check specific component size
pnpm run bundle-analyzer --component=PatientCard
```

---

## Advanced Patterns

### Compound Components Pattern

**Healthcare Form Components:**

```typescript
// Compound component for patient forms
export const PatientForm = {
  Root: PatientFormRoot,
  Section: PatientFormSection,
  Field: PatientFormField,
  Actions: PatientFormActions,
};

// Usage
function PatientRegistration() {
  return (
    <PatientForm.Root onSubmit={handleSubmit}>
      <PatientForm.Section title='Dados Pessoais'>
        <PatientForm.Field name='name' label='Nome Completo' required />
        <PatientForm.Field name='cpf' label='CPF' mask='999.999.999-99' />
      </PatientForm.Section>

      <PatientForm.Section title='Contato'>
        <PatientForm.Field name='phone' label='Telefone' type='tel' />
        <PatientForm.Field name='email' label='Email' type='email' />
      </PatientForm.Section>

      <PatientForm.Actions>
        <Button type='submit'>Cadastrar Paciente</Button>
      </PatientForm.Actions>
    </PatientForm.Root>
  );
}
```

### Render Props Pattern

**Data Fetching Components:**

```typescript
// Flexible data fetching for healthcare data
interface PatientDataProps {
  patientId: string;
  children: (data: {
    patient: Patient | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export function PatientData({ patientId, children }: PatientDataProps) {
  const { data: patient, isLoading, error, refetch } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => fetchPatient(patientId),
  });

  return children({
    patient,
    loading: isLoading,
    error,
    refetch,
  });
}

// Usage
function PatientProfile({ patientId }: Props) {
  return (
    <PatientData patientId={patientId}>
      {({ patient, loading, error, refetch }) => {
        if (loading) return <PatientSkeleton />;
        if (error) return <ErrorMessage onRetry={refetch} />;
        if (!patient) return <PatientNotFound />;

        return <PatientCard patient={patient} />;
      }}
    </PatientData>
  );
}
```

### Custom Hooks Pattern

**Healthcare-Specific Hooks:**

```typescript
// Custom hook for patient risk assessment
export function usePatientRisk(patientId: string) {
  const [riskScore, setRiskScore] = useState<NoShowRiskScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateRisk() {
      try {
        setLoading(true);
        const score = await calculateNoShowRisk(patientId);
        setRiskScore(score);
      } catch (error) {
        console.error('Risk calculation failed:', error);
      } finally {
        setLoading(false);
      }
    }

    calculateRisk();
  }, [patientId]);

  const scheduleIntervention = useCallback(async (type: string) => {
    await schedulePatientIntervention(patientId, type);
    // Recalculate risk after intervention
    const newScore = await calculateNoShowRisk(patientId);
    setRiskScore(newScore);
  }, [patientId]);

  return {
    riskScore,
    loading,
    scheduleIntervention,
    isHighRisk: riskScore ? riskScore.score > 0.7 : false,
    isMediumRisk: riskScore ? riskScore.score > 0.4 && riskScore.score <= 0.7 : false,
  };
}
```

---

## Component Library Integration

### shadcn/ui v4 Integration

**Theme Customization for Healthcare:**

```typescript
// tailwind.config.js - NeonPro healthcare theme
module.exports = {
  theme: {
    extend: {
      colors: {
        // NeonPro brand palette for aesthetic clinics
        primary: {
          DEFAULT: '#112031', // Deep Sophisticated Green
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#294359', // Professional Petrol Blue
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#AC9469', // Warm Aesthetic Gold
// tailwind.config.js - NeonPro healthcare theme
export default {
  theme: {
    extend: {
      colors: {
        // NeonPro brand palette for aesthetic clinics
        primary: {
          DEFAULT: '#112031', // Deep Sophisticated Green
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#294359', // Professional Petrol Blue
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#AC9469', // Warm Aesthetic Gold
          foreground: '#112031',
        },
        // Healthcare-specific colors
        medical: {
          success: '#10b981', // Treatment success
          warning: '#f59e0b', // Attention needed
          error: '#ef4444', // Critical issues
          info: '#3b82f6', // Information
        },
      },
      // Touch-friendly sizing for clinic tablets
      spacing: {
        touch: '44px', // Minimum touch target
      },
    },
  },
};
        success: 'bg-medical-success text-white hover:bg-medical-success/90',
        warning: 'bg-medical-warning text-white hover:bg-medical-warning/90',
        emergency: 'bg-medical-error text-white hover:bg-medical-error/90 animate-pulse',
      },
    },
  },
);
```

### Component Testing Framework

**Healthcare Component Testing:**

```typescript
// Test utilities for healthcare components
export const healthcareRenderOptions = {
export const healthcareRenderOptions = {
  wrapper: ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        <LGPDProvider>
          {children}
        </LGPDProvider>
      </ThemeProvider>
    </QueryClientProvider>
  ),
};
export const mockHealthcareData = {
  patient: {
    id: 'patient-123',
    name: 'Maria Silva',
    cpf: '123.456.789-01',
    phone: '(11) 99999-9999',
    email: 'maria@example.com',
    birthDate: '1985-06-15',
    lgpdConsent: {
      version: '1.0',
      timestamp: '2025-01-12T10:00:00Z',
      scope: ['treatment', 'communication'],
    },
  },
  appointment: {
    id: 'apt-456',
    patientId: 'patient-123',
    procedure: 'Botox',
    date: '2025-01-15T14:00:00Z',
    status: 'confirmed',
    duration: 30,
  },
};

// Component test example
describe('PatientCard', () => {
  it('handles LGPD compliance correctly', () => {
    render(
      <PatientCard
        patient={mockHealthcareData.patient}
        userRole='coordinator'
        lgpdCompliant={false}
      />,
      healthcareRenderOptions,
    );

    // Should mask sensitive data for non-admin users
    expect(screen.getByText('Maria S***')).toBeInTheDocument();
    expect(screen.getByText('***.***.***-01')).toBeInTheDocument();
  });
});
```

---

## Migration Guide

### From Legacy Components

**Step-by-Step Migration:**

1. **Identify Legacy Components**

```bash
# Find components using old patterns
grep -r "import.*@/components/ui/button" apps/web/src/
grep -r "import.*@/components/ui/alert" apps/web/src/
```

2. **Update Import Statements**

```typescript
// Before (Legacy)
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// After (Current)
import { Badge } from '@/components/atoms/badge';
import { Alert, AlertDescription } from '@/components/molecules/alert';
import { Button } from '@neonpro/ui';
```

3. **Update Component Usage**

```typescript
// Before - Basic usage
<Button>Click me</Button>

// After - Healthcare-enhanced usage
<Button
  variant="medical"
  onAuditLog={(action) => logUserAction(action)}
>
  Agendar Consulta
</Button>
```

### Breaking Changes Handling

**Version Compatibility:**

```typescript
// Component version compatibility check
export function checkComponentVersion(component: string, version: string) {
  const compatibilityMatrix = {
    Button: ['1.0.0', '1.1.0', '2.0.0'],
    PatientCard: ['1.0.0', '1.2.0'],
    Alert: ['1.0.0', '1.1.0'],
  };

  return compatibilityMatrix[component]?.includes(version) ?? false;
}
```

---

## Best Practices Summary

### Do's ✅

1. **Use the Import Hierarchy**
   - Always check `@neonpro/ui` first
   - Follow the established priority order
   - Use specific imports for better tree-shaking

2. **Healthcare Compliance**
   - Implement `HealthcareComponentProps` interface
   - Include audit logging capabilities
   - Handle LGPD requirements from the start

3. **Performance Optimization**
   - Use lazy loading for heavy components
   - Implement proper memoization
   - Monitor bundle size impact

4. **Accessibility First**
   - Minimum 44px touch targets
   - Proper ARIA labels and descriptions
   - Keyboard navigation support

### Don'ts ❌

1. **Avoid Import Conflicts**
   - Don't import from multiple sources for same component
   - Don't bypass the established hierarchy
   - Don't create duplicate components

2. **Security Violations**
   - Don't expose sensitive patient data without proper controls
   - Don't skip audit logging for healthcare actions
   - Don't ignore LGPD compliance requirements

3. **Performance Anti-patterns**
   - Don't import entire packages when only using specific components
   - Don't create unnecessary re-renders in healthcare-critical components
   - Don't ignore bundle size impact

---

## Quick Reference Examples

### Complete Patient Management Form

```typescript
// Example: Complete patient registration form using NeonPro components
import { Badge } from '@/components/atoms/badge';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Alert, AlertDescription } from '@/components/molecules/alert';
import { usePatientRisk } from '@/hooks/usePatientRisk';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';

interface PatientRegistrationProps {
  onSubmit: (data: PatientData) => Promise<void>;
  userRole: 'admin' | 'professional' | 'coordinator';
}

export function PatientRegistrationForm({ onSubmit, userRole }: PatientRegistrationProps) {
  const [formData, setFormData] = useState<PatientData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { riskScore, isHighRisk } = usePatientRisk(formData.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Log successful registration for audit
      logAuditEvent('patient_registered', {
        patientId: formData.id,
        userRole,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Cadastro de Paciente
          {isHighRisk && <Badge variant='destructive'>Alto Risco</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Personal Information Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Dados Pessoais</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='name'>Nome Completo *</Label>
                <Input
                  id='name'
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder='Digite o nome completo'
                />
              </div>

              <div>
                <Label htmlFor='cpf'>CPF *</Label>
                <Input
                  id='cpf'
                  required
                  value={formData.cpf || ''}
                  onChange={e => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder='000.000.000-00'
                  maxLength={14}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Contato</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='phone'>Telefone *</Label>
                <Input
                  id='phone'
                  type='tel'
                  required
                  value={formData.phone || ''}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder='(11) 99999-9999'
                />
              </div>

              <div>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email || ''}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder='email@exemplo.com'
                />
              </div>
            </div>
          </div>

          {/* LGPD Compliance Notice */}
          <Alert>
            <AlertDescription>
              Ao cadastrar este paciente, você confirma que obteve o consentimento adequado para o
              tratamento dos dados pessoais conforme a LGPD. Todos os dados são criptografados e
              auditados.
            </AlertDescription>
          </Alert>

          {/* Submit Actions */}
          <div className='flex gap-4 pt-4'>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='flex-1'
              variant='default'
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Paciente'}
            </Button>

            <Button
              type='button'
              variant='outline'
              onClick={() => setFormData({})}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Dashboard with Real-time Updates

```typescript
// Example: Healthcare dashboard with real-time patient monitoring
import { Badge } from '@/components/atoms/badge';
import { Alert, AlertDescription } from '@/components/molecules/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/molecules/table';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';

export function HealthcareDashboard() {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', 'dashboard'],
    queryFn: fetchDashboardPatients,
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: fetchTodayAppointments,
    refetchInterval: 60000, // Update appointments every minute
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Pacientes Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{appointments?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Alto Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {patients?.filter(p => p.riskScore > 0.7).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Patients Alert */}
      {patients?.some(p => p.riskScore > 0.7) && (
        <Alert variant='destructive'>
          <AlertDescription>
            Existem pacientes com alto risco de não comparecimento. Considere entrar em contato para
            confirmação.
          </AlertDescription>
        </Alert>
      )}

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments?.map(appointment => (
                <TableRow key={appointment.id}>
                  <TableCell className='font-medium'>
                    {appointment.patient.name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(appointment.date), 'HH:mm')}
                  </TableCell>
                  <TableCell>{appointment.procedure}</TableCell>
                  <TableCell>
                    <Badge
                      variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={appointment.patient.riskScore > 0.7
                        ? 'destructive'
                        : appointment.patient.riskScore > 0.4
                        ? 'secondary'
                        : 'default'}
                    >
                      {Math.round(appointment.patient.riskScore * 100)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Related Documentation

### Architecture References

- [Frontend Architecture](../architecture/frontend-architecture.md) - High-level architectural decisions
- [Frontend Specification](../architecture/front-end-spec.md) - Healthcare-specific implementation patterns
- [Technology Stack](../architecture/tech-stack.md) - Technology choices and rationale
- [Source Tree Organization](../architecture/source-tree.md) - Monorepo structure and navigation

### UI/UX Guidelines

- [Apex UI/UX Designer](../agents/apex-ui-ux-designer.md) - Design system principles and healthcare UI patterns
- [Coding Standards](../rules/coding-standards.md) - General coding patterns and best practices

### Component Documentation

- [Component Architecture Analysis](../ui/neonpro-component-architecture-analysis.md) - Detailed component analysis
- [Shared UI Architecture](../ui/shared-ui-architecture.md) - Shared component organization
- [Component Governance Policies](../ui/component-governance-policies.md) - Component management policies

### Development Workflow

- [Development Guidelines](../AGENTS.md) - Development workflow and best practices
- [Deployment Guide](../features/deploy-vercel.md) - Production deployment procedures

---

## Changelog

### Version 1.0.0 (2025-01-12)

- ✅ Initial comprehensive component usage guide
- ✅ Complete architecture analysis and documentation
- ✅ Healthcare-specific component patterns
- ✅ Import/export patterns with examples
- ✅ Development workflow integration
- ✅ LGPD compliance guidelines
- ✅ Performance optimization strategies
- ✅ Troubleshooting guide with solutions

### Future Enhancements

- [ ] Interactive component playground
- [ ] Automated component documentation generation
- [ ] Visual regression testing integration
- [ ] Component performance benchmarking
- [ ] Advanced healthcare component patterns

---

**Document Status**: ✅ Complete - Definitive Component Usage Guide
**Target Audience**: Frontend developers, technical leads, UI/UX designers
**Last Updated**: 2025-01-12
**Next Review**: When major architecture changes occur
**Maintainer**: NeonPro Development Team
