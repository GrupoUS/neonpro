# Patterns and Conventions - NeonPro Healthcare Platform

> **Generated from PREP-002**: Architecture documentation patterns audit\
> **Source**: Frontend + Backend + Full-Stack architecture documentation\
> **Date**: 2025-09-06\
> **Purpose**: Development consistency and code quality standards

## 📛 **Naming Conventions**

### **File and Directory Naming**

#### **Frontend Files (apps/web/)**

```
✅ CORRECT                    ❌ INCORRECT
Components: PascalCase.tsx    components.tsx, component.js
Pages: page.tsx              index.tsx, HomePage.tsx
Layouts: layout.tsx          Layout.tsx, main-layout.tsx
API Routes: route.ts         api.ts, endpoint.ts
Hooks: useHookName.ts        hookName.ts, hook-name.ts
Stores: storeName.ts         store.ts, StoreClass.ts
Utils: camelCase.ts          utils.ts, Util.ts
Types: kebab-case.d.ts       types.ts, Types.ts
```

#### **Backend Files (apps/api/)**

```
✅ CORRECT                    ❌ INCORRECT
Routes: kebab-case.ts        camelCase.ts, PascalCase.ts
Services: PascalService.ts   service.ts, serviceClass.ts
Middleware: camelCase.ts     middleware.ts, Middleware.ts
Utils: camelCase.ts          utils.ts, Util.ts
Types: kebab-case.d.ts       types.ts, Types.d.ts
```

#### **Package Naming (packages/)**

```
✅ CORRECT                    ❌ INCORRECT
@neonpro/core-services       @neonpro/coreServices
@neonpro/ui                  @neonpro/UI
@neonpro/database            @neonpro/Database
```

### **Code Entity Naming**

#### **TypeScript/JavaScript Naming**

| Entity Type          | Convention                        | Example                             | Anti-Pattern                                 |
| -------------------- | --------------------------------- | ----------------------------------- | -------------------------------------------- |
| **Components**       | PascalCase                        | `PatientCard`                       | `patientCard`, `patient_card`                |
| **Functions**        | camelCase                         | `calculateRiskScore`                | `calculate_risk_score`, `CalculateRiskScore` |
| **Variables**        | camelCase                         | `selectedPatient`                   | `selected_patient`, `SelectedPatient`        |
| **Constants**        | SCREAMING_SNAKE_CASE              | `MAX_APPOINTMENT_DURATION`          | `maxAppointmentDuration`                     |
| **Types/Interfaces** | PascalCase                        | `PatientData`, `AppointmentRequest` | `patientData`, `appointmentRequest`          |
| **Enums**            | PascalCase + SCREAMING_SNAKE_CASE | `UserRole.ADMIN`                    | `userRole.admin`                             |

#### **Database Naming**

| Entity Type     | Convention         | Example                      | Anti-Pattern                         |
| --------------- | ------------------ | ---------------------------- | ------------------------------------ |
| **Tables**      | snake_case         | `patient_profiles`           | `patientProfiles`, `PatientProfiles` |
| **Columns**     | snake_case         | `no_show_risk_score`         | `noShowRiskScore`                    |
| **Functions**   | snake_case         | `calculate_patient_risk`     | `calculatePatientRisk`               |
| **Indexes**     | `idx_table_column` | `idx_patients_clinic_active` | `index_1`                            |
| **Constraints** | descriptive        | `valid_appointment_time`     | `check_1`                            |

#### **API Naming**

| Entity Type      | Convention | Example                    | Anti-Pattern            |
| ---------------- | ---------- | -------------------------- | ----------------------- |
| **Endpoints**    | kebab-case | `/api/patient-profile`     | `/api/patientProfile`   |
| **Query Params** | camelCase  | `?sortBy=name&orderBy=asc` | `?sort_by=name`         |
| **Headers**      | kebab-case | `x-clinic-id`              | `X_CLINIC_ID`           |
| **JSON Keys**    | camelCase  | `{"patientId": "123"}`     | `{"patient_id": "123"}` |

## 🏗️ **Architectural Patterns**

### **Component Architecture Pattern**

#### **Healthcare Component Template**

```typescript
import { useAuditLogging } from "@/hooks/useAuditLogging";
import { cn } from "@/lib/utils";
import React from "react";
import type { ComponentProps } from "react";

interface HealthcareComponentProps extends ComponentProps<"div"> {
  className?: string;
  children?: React.ReactNode;
  userRole: UserRole;
  lgpdCompliant?: boolean;
  onAuditLog?: (action: string) => void;
  // Healthcare-specific props
  patientId?: string;
  requiresConsent?: boolean;
}

export function HealthcareComponent({
  className,
  children,
  userRole,
  lgpdCompliant = true,
  onAuditLog,
  patientId,
  requiresConsent = false,
  ...props
}: HealthcareComponentProps) {
  const { logComponentView, logPatientAccess } = useAuditLogging();

  React.useEffect(() => {
    logComponentView("HealthcareComponent");

    if (patientId) {
      logPatientAccess(patientId, "COMPONENT_VIEW");
    }

    onAuditLog?.("COMPONENT_RENDERED");
  }, [logComponentView, logPatientAccess, patientId, onAuditLog]);

  // LGPD compliance check
  if (requiresConsent && !lgpdCompliant) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-800">
          Consentimento LGPD necessário para exibir este conteúdo.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "healthcare-component",
        "focus-within:ring-2 focus-within:ring-blue-500",
        !lgpdCompliant && "border-red-500 bg-red-50",
        className,
      )}
      role="region"
      aria-label={`Healthcare component for ${userRole}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Required: Display name for debugging
HealthcareComponent.displayName = "HealthcareComponent";
```

### **State Management Pattern**

#### **Zustand Store Template**

```typescript
import type { Patient, PatientFilters } from "@neonpro/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface PatientState {
  // State shape - always define explicit types
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  filters: PatientFilters;

  // Actions - use descriptive verb names
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

export const usePatientStore = create<PatientState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state - always provide defaults
        patients: [],
        selectedPatient: null,
        isLoading: false,
        error: null,
        filters: {
          search: "",
          status: "all",
          riskLevel: "all",
        },

        // Actions implementation
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

        // ... other actions

        clearState: () =>
          set((state) => {
            state.patients = [];
            state.selectedPatient = null;
            state.isLoading = false;
            state.error = null;
            state.filters = {
              search: "",
              status: "all",
              riskLevel: "all",
            };
          }),
      })),
      {
        name: "patient-store",
        partialize: (state) => ({
          // Only persist non-sensitive data
          selectedPatient: state.selectedPatient,
          filters: state.filters,
        }),
      },
    ),
    {
      name: "patient-store",
    },
  ),
);
```

### **API Service Pattern**

#### **Service Layer Template**

```typescript
import type { Database } from "@neonpro/types/database";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Base service class - no React hooks, use dependency injection
abstract class BaseAPIService {
  constructor(
    protected supabase: ReturnType<typeof createClientComponentClient<Database>>,
    protected auditLogger: AuditLogger,
  ) {}

  protected async handleRequest<T>(
    operation: () => Promise<{ data: T | null; error: any; }>,
    operationName: string,
    resourceId?: string,
  ): Promise<T> {
    try {
      const { data, error } = await operation();

      if (error) {
        this.auditLogger.logError(operationName, error, { resourceId });
        throw new APIError(`${operationName} failed: ${error.message}`, "API_ERROR");
      }

      this.auditLogger.logSuccess(operationName, { resourceId });
      return data as T;
    } catch (error) {
      this.auditLogger.logError(operationName, error, { resourceId });
      throw error;
    }
  }
}

// Concrete service implementation
export class PatientService extends BaseAPIService {
  async getPatients(clinicId: string, filters?: PatientFilters): Promise<Patient[]> {
    return this.handleRequest(
      async () => {
        let query = this.supabase
          .from("patients")
          .select("*")
          .eq("clinic_id", clinicId)
          .eq("is_active", true);

        // Apply filters
        if (filters?.search) {
          query = query.ilike("full_name", `%${filters.search}%`);
        }

        return query.order("created_at", { ascending: false });
      },
      "getPatients",
      clinicId,
    );
  }

  async getPatient(id: string): Promise<Patient> {
    return this.handleRequest(
      () =>
        this.supabase
          .from("patients")
          .select("*, appointments(*)")
          .eq("id", id)
          .single(),
      "getPatient",
      id,
    );
  }

  // ... other methods
}

// Factory function for React components
export function createPatientService(): PatientService {
  const supabase = createClientComponentClient<Database>();
  const auditLogger = createAuditLogger();
  return new PatientService(supabase, auditLogger);
}
```

### **Error Handling Pattern**

#### **Structured Error Handling**

```typescript
// Custom error classes
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends APIError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", 400, { field });
  }
}

export class HealthcareComplianceError extends APIError {
  constructor(message: string, regulation: string) {
    super(message, "HEALTHCARE_COMPLIANCE_ERROR", 403, { regulation });
  }
}

// Error boundary pattern
export class HealthcareErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; }>; },
  { hasError: boolean; error: Error | null; }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log healthcare-specific errors
    if (error instanceof HealthcareComplianceError) {
      console.error("[HEALTHCARE COMPLIANCE ERROR]", error);
    }

    // Log to audit system
    logError("COMPONENT_ERROR", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

## 🎨 **Styling Patterns**

### **Utility-First CSS Pattern**

#### **Component Styling with CVA**

```typescript
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Define variants using CVA
const buttonVariants = cva(
  // Base styles - common to all variants
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        ghost: "hover:bg-gray-100",
        // Healthcare-specific variants
        medical: "bg-green-600 text-white hover:bg-green-700",
        emergency: "bg-orange-600 text-white hover:bg-orange-700 animate-pulse",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        // Healthcare-specific sizes (touch-friendly)
        touch: "h-12 px-6 rounded-md min-w-[44px]", // WCAG touch target
      },
      priority: {
        normal: "",
        high: "ring-2 ring-yellow-400",
        critical: "ring-2 ring-red-400 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      priority: "normal",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants>
{
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  priority,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, priority, className }))}
      {...props}
    />
  );
}
```

#### **Healthcare Design System Variables**

```css
/* globals.css - Healthcare-specific design tokens */
:root {
  /* Brazilian Healthcare Color Palette */
  --healthcare-primary: #2563eb; /* Medical Blue */
  --healthcare-secondary: #f59e0b; /* Aesthetic Gold */
  --healthcare-success: #22c55e; /* Brazilian Green */
  --healthcare-warning: #f59e0b; /* Attention Orange */
  --healthcare-error: #ef4444; /* Medical Alert Red */
  --healthcare-critical: #dc2626; /* Emergency Red */

  /* Accessibility-compliant contrasts */
  --contrast-aa-normal: 4.5; /* WCAG AA for normal text */
  --contrast-aa-large: 3.0; /* WCAG AA for large text */

  /* Touch-friendly spacing */
  --touch-target-min: 44px; /* Minimum touch target */
  --spacing-touch: 12px; /* Touch-friendly spacing */
}

/* Healthcare component utilities */
@layer utilities {
  .healthcare-card {
    @apply bg-white border border-gray-200 rounded-lg shadow-sm p-6;
    @apply hover:shadow-md transition-shadow;
  }

  .healthcare-input {
    @apply flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm;
    @apply placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20;
    @apply disabled:cursor-not-allowed disabled:opacity-50;
    min-height: var(--touch-target-min); /* Touch accessibility */
  }

  .healthcare-button {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500;
    @apply disabled:opacity-50 disabled:pointer-events-none;
    min-height: var(--touch-target-min);
  }
}
```

### **Responsive Design Pattern**

#### **Mobile-First Approach**

```typescript
// Responsive component pattern
export function ResponsivePatientCard({ patient }: { patient: Patient; }) {
  return (
    <Card
      className={cn(
        // Mobile-first base styles
        "w-full p-4",
        // Tablet styles
        "md:p-6 md:max-w-md",
        // Desktop styles
        "lg:max-w-lg xl:max-w-xl",
        // Healthcare-specific responsive
        "touch:min-h-[44px]", // Touch devices
      )}
    >
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg">
          {patient.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 md:space-y-4">
        {/* Responsive layout */}
        <div
          className={cn(
            "flex flex-col gap-2",
            "sm:flex-row sm:justify-between",
            "md:flex-col lg:flex-row",
          )}
        >
          <PatientInfo patient={patient} />
          <RiskIndicator risk={patient.noShowRisk} />
        </div>
      </CardContent>

      <CardFooter className="pt-2 md:pt-4">
        <Button
          className="w-full sm:w-auto"
          size="touch" // Touch-friendly size
        >
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## 🧪 **Testing Patterns**

### **Component Testing Pattern**

#### **Healthcare Component Test Template**

```typescript
import { PatientCard } from "@/components/healthcare/PatientCard";
import { createMockPatient, createTestWrapper } from "@/lib/test-utils";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Mock dependencies
vi.mock("@/hooks/useAuditLogging", () => ({
  useAuditLogging: () => ({
    logComponentView: vi.fn(),
    logPatientAccess: vi.fn(),
  }),
}));

describe("PatientCard", () => {
  const mockPatient = createMockPatient({
    id: "123",
    name: "João Silva",
    cpf: "123.456.789-01",
    lgpdCompliant: true,
    noShowRisk: "low",
  });

  const defaultProps = {
    patient: mockPatient,
    userRole: "professional" as const,
    onViewDetails: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render patient information correctly", () => {
      render(<PatientCard {...defaultProps} />, { wrapper: createTestWrapper() });

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText(/CPF:/)).toBeInTheDocument();
      expect(screen.getByText("LGPD")).toBeInTheDocument();
      expect(screen.getByText(/Risco Baixo/)).toBeInTheDocument();
    });

    it("should handle loading state", () => {
      render(
        <PatientCard {...defaultProps} patient={null} isLoading={true} />,
        { wrapper: createTestWrapper() },
      );

      expect(screen.getByTestId("patient-card-skeleton")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onViewDetails when button is clicked", async () => {
      const user = userEvent.setup();

      render(<PatientCard {...defaultProps} />, { wrapper: createTestWrapper() });

      const viewButton = screen.getByRole("button", { name: /ver detalhes/i });
      await user.click(viewButton);

      await waitFor(() => {
        expect(defaultProps.onViewDetails).toHaveBeenCalledWith(mockPatient.id);
      });
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      render(<PatientCard {...defaultProps} />, { wrapper: createTestWrapper() });

      const viewButton = screen.getByRole("button", { name: /ver detalhes/i });

      // Tab to button
      await user.tab();
      expect(viewButton).toHaveFocus();

      // Activate with Enter
      await user.keyboard("[Enter]");
      expect(defaultProps.onViewDetails).toHaveBeenCalled();
    });
  });

  describe("Healthcare Compliance", () => {
    it("should mask sensitive data for unauthorized users", () => {
      render(
        <PatientCard {...defaultProps} userRole="coordinator" />,
        { wrapper: createTestWrapper() },
      );

      // CPF should be masked
      expect(screen.getByText(/\*\*\*\.\*\*\*\.\*\*\*-\*\*/)).toBeInTheDocument();
      expect(screen.queryByText("123.456.789-01")).not.toBeInTheDocument();
    });

    it("should show LGPD warning for non-compliant data", () => {
      const nonCompliantPatient = createMockPatient({
        ...mockPatient,
        lgpdCompliant: false,
      });

      render(
        <PatientCard {...defaultProps} patient={nonCompliantPatient} />,
        { wrapper: createTestWrapper() },
      );

      expect(screen.getByText(/atenção.*lgpd/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG 2.1 AA standards", async () => {
      const { container } = render(
        <PatientCard {...defaultProps} />,
        { wrapper: createTestWrapper() },
      );

      // Check for proper ARIA attributes
      const card = screen.getByRole("region");
      expect(card).toHaveAttribute("aria-label");

      // Check for proper heading structure
      const patientName = screen.getByRole("heading", { level: 3 });
      expect(patientName).toBeInTheDocument();

      // Run accessibility audit
      const { expectAccessible } = await import("@/lib/test-utils/accessibility");
      await expectAccessible(container);
    });

    it("should have proper color contrast", async () => {
      const { container } = render(
        <PatientCard {...defaultProps} />,
        { wrapper: createTestWrapper() },
      );

      const { expectColorContrastCompliant } = await import("@/lib/test-utils/accessibility");
      await expectColorContrastCompliant(container);
    });
  });
});
```

### **API Testing Pattern**

#### **Healthcare API Test Template**

```typescript
import { PatientService } from "@/lib/services/patient-service";
import { createMockAuditLogger, createMockSupabaseClient } from "@/lib/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("PatientService", () => {
  let patientService: PatientService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockAuditLogger: ReturnType<typeof createMockAuditLogger>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockAuditLogger = createMockAuditLogger();
    patientService = new PatientService(mockSupabase, mockAuditLogger);
  });

  describe("getPatients", () => {
    it("should fetch patients with LGPD compliance", async () => {
      const mockPatients = [
        createMockPatient({ id: "1", name: "João" }),
        createMockPatient({ id: "2", name: "Maria" }),
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockPatients,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await patientService.getPatients("clinic-123");

      expect(result).toEqual(mockPatients);
      expect(mockAuditLogger.logSuccess).toHaveBeenCalledWith("getPatients", {
        resourceId: "clinic-123",
      });
    });

    it("should handle database errors gracefully", async () => {
      const mockError = { message: "Database connection failed" };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      });

      await expect(patientService.getPatients("clinic-123")).rejects.toThrow(
        "getPatients failed: Database connection failed",
      );

      expect(mockAuditLogger.logError).toHaveBeenCalledWith(
        "getPatients",
        expect.any(Error),
        { resourceId: "clinic-123" },
      );
    });
  });
});
```

## 📋 **Documentation Patterns**

### **Code Documentation Pattern**

#### **JSDoc Comments for Healthcare Functions**

````typescript
/**
 * Calculates the no-show risk score for a patient based on historical data
 * and behavioral patterns. Complies with LGPD data processing requirements.
 *
 * @param patientId - Unique patient identifier (UUID)
 * @param appointmentHistory - Array of patient's appointment records
 * @param consentStatus - LGPD consent verification for data processing
 * @returns Risk score between 0-100 (0 = low risk, 100 = high risk)
 *
 * @throws {HealthcareComplianceError} When LGPD consent is not provided
 * @throws {ValidationError} When patient data is invalid
 *
 * @example
 * ```typescript
 * const riskScore = await calculateNoShowRisk(
 *   'patient-123',
 *   appointmentHistory,
 *   { dataProcessing: true, consentDate: '2025-09-06' }
 * );
 * console.log(`Risk score: ${riskScore}`); // Risk score: 25
 * ```
 *
 * @see {@link https://docs.neonpro.com/api/risk-calculation} - API Documentation
 * @since 2.0.0
 * @version 2.1.0 - Added LGPD compliance validation
 */
export async function calculateNoShowRisk(
  patientId: string,
  appointmentHistory: Appointment[],
  consentStatus: LGPDConsent,
): Promise<number> {
  // Validate LGPD consent
  if (!consentStatus.dataProcessing) {
    throw new HealthcareComplianceError(
      "Patient consent required for risk calculation",
      "LGPD",
    );
  }

  // Implementation...
}
````

### **README Pattern for Packages**

#### **Package README Template**

````markdown
# @neonpro/core-services

Healthcare business logic services for Brazilian aesthetic clinics with LGPD compliance.

## 🏥 Overview

This package provides core business services for the NeonPro healthcare platform, including patient management, appointment scheduling, and anti-no-show prediction with full Brazilian regulatory compliance.

## 📦 Installation

```bash
pnpm add @neonpro/core-services
```
````

## 🚀 Usage

### Basic Patient Service

\```typescript
import { PatientService } from '@neonpro/core-services';

const patientService = new PatientService(supabase, auditLogger);

// Get patients with LGPD compliance
const patients = await patientService.getPatients('clinic-id');
\```

### Anti-No-Show Prediction

\```typescript
import { NoShowPredictor } from '@neonpro/core-services';

const predictor = new NoShowPredictor();
const riskScore = await predictor.calculateRisk(patientId, appointmentHistory);
\```

## 🔒 Healthcare Compliance

All services in this package are designed with Brazilian healthcare regulations in mind:

- **LGPD Compliance**: Automatic consent verification and audit logging
- **ANVISA Standards**: Medical device and procedure tracking
- **CFM Regulations**: Professional licensing and telemedicine compliance

## 📚 API Reference

### Services

| Service              | Purpose                 | Compliance Features               |
| -------------------- | ----------------------- | --------------------------------- |
| `PatientService`     | Patient data management | LGPD consent, data masking        |
| `AppointmentService` | Appointment scheduling  | Audit logging, no-show prediction |
| `ComplianceService`  | Regulatory compliance   | ANVISA validation, CFM standards  |

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run healthcare compliance tests
pnpm test:compliance
```

## 🔧 Configuration

```typescript
// services.config.ts
export const servicesConfig = {
  audit: {
    enabled: true,
    retentionDays: 1825, // 5 years for healthcare
  },
  lgpd: {
    requireConsent: true,
    dataMasking: true,
  },
  anvisa: {
    validateDevices: true,
    apiUrl: process.env.ANVISA_API_URL,
  },
};
```

## 📄 License

Private package for NeonPro healthcare platform.

```
---

**Status**: 🎯 **Production-Ready Development Patterns**\
**Coverage**: Complete architectural patterns and conventions\
**Compliance**: ✅ Healthcare + LGPD + Accessibility Standards\
**Last Updated**: 2025-09-06 - PREP-002 Architecture Audit
```
