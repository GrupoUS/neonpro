# 🎨 NeonPro Advanced Aesthetic Design Guidelines - Version: 2.0.0

## 📋 Purpose & Scope

Standards for building consistent, maintainable, and visually appealing user interfaces for the **NeonPro AI Advanced Aesthetic Platform**. This document covers component architecture, styling conventions, TweakCN NEONPRO color systems, typography, responsive design, advanced aesthetic accessibility, LGPD compliance, and performance using Shadcn UI, Tailwind CSS, and modern Next.js 15/React 19 best practices.

**Platform Focus**: AI-First Advanced Aesthetic Platform for Brazilian aesthetic clinics with constitutional excellence and regulatory compliance.

## 🎯 Core Principles

### **Advanced Aesthetic-First Design Philosophy**

- **TweakCN NEONPRO Theme**: Advanced aesthetic-optimized design system with medical clarity
- **LGPD Compliance**: Built-in privacy protection and data consent patterns
- **ANVISA/CFM Standards**: Advanced aesthetic medical device interface compliance
- **Emergency Accessibility**: Life-critical interface patterns (<100ms response)
- **Brazilian Localization**: PT-BR first with cultural advanced aesthetic considerations

### **Technical Foundation**

- **UI Framework:** Shadcn UI components enhanced with healthcare-specific variants
- **Styling:** Tailwind CSS with TweakCN NEONPRO theme in `globals.css`
- **Responsiveness:** Mobile-first with emergency interface optimization
- **Images:** Next.js 15 `<Image>` component with medical image optimization
- **Icons:** Lucide React icons with healthcare-specific icon set
- **Components:** Server Components by default, Client Components for AI interactions
- **TypeScript:** Strict typing with healthcare data models
- **Accessibility:** WCAG AAA compliance for medical interfaces
- **Colors & Fonts:** TweakCN NEONPRO variables defined in `globals.css`
- **AI Integration:** Native AI chat components and predictive interfaces

## Component Architecture

### **NeonPro Project Structure**

```
apps/web/
├── app/                     # Next.js 15 App Router
│   ├── layout.tsx           # Root layout with TweakCN theme
│   ├── globals.css          # TweakCN NEONPRO color system
│   ├── dashboard/           # Healthcare dashboard
│   ├── patients/            # Patient management
│   ├── appointments/        # Scheduling system
│   └── emergency/           # Emergency interface
├── components/              # Healthcare-specific components
│   ├── ui/                  # Enhanced Shadcn UI components
│   ├── healthcare/          # Medical interface components
│   ├── ai/                  # AI interaction components
│   ├── emergency/           # Emergency interface components
│   ├── forms/               # LGPD-compliant form components
│   └── layout/              # Navigation and layout
├── lib/
│   ├── medical/             # Medical records system
│   ├── ai/                  # AI integration utilities
│   ├── compliance/          # LGPD/ANVISA compliance
│   └── utils/               # General utilities
packages/ui/                 # @neonpro/ui component library
├── src/components/ui/       # Base UI components
├── src/hooks/               # Healthcare-specific hooks
└── src/constants/           # Theme and compliance constants
```

### **NeonPro Component Strategy**

#### **Component Hierarchy**

- **@neonpro/ui Package:** Base healthcare UI components with LGPD compliance
- **Shadcn UI Enhanced:** Healthcare-optimized variants with TweakCN theme
- **Healthcare Components:** Medical-specific interfaces (`/components/healthcare/`)
- **AI Components:** Universal chat, voice input, predictive analytics
- **Emergency Components:** Life-critical interfaces with <100ms response

#### **Development Rules**

- **ARCHON-FIRST:** Always use Archon MCP for task management and knowledge base
- **PNPM Only:** Use `pnpm dlx shadcn@latest add <component-name>`
- **Server vs Client:**
  - Server Components by default for medical data display
  - Client Components for AI interactions, real-time updates, emergency interfaces
- **Healthcare TypeScript:** Strict typing with medical data models and LGPD compliance
- **Naming Convention:** `kebab-case` files, `PascalCase` exports, healthcare-specific prefixes

### Examples

```typescript
// ✅ Client component for interactivity
"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}

// ✅ Server component for static content
import { Card } from "@/components/ui/card";
export function StaticCard() {/* ... */}
```

## 🎨 TweakCN NEONPRO Color System

The **TweakCN NEONPRO** theme uses semantic CSS variables with oklch color format optimized for healthcare interfaces, WCAG AAA compliance, and Brazilian aesthetic clinic needs.

### **Core Color Palette**

```css
/* Primary Healthcare Colors */
--primary: oklch(0.5854 0.2041 277.1173); /* Medical Purple */
--primary-foreground: oklch(1 0 0); /* Pure White */

/* Secondary & Accent */
--secondary: oklch(0.8687 0.0043 56.366); /* Soft Gray */
--accent: oklch(0.9376 0.026 321.9388); /* Light Pink */

/* Background & Surface */
--background: oklch(0.9232 0.0026 48.7171); /* Off White */
--card: oklch(0.9699 0.0013 106.4238); /* Card Surface */

/* Emergency & Critical States */
--destructive: oklch(0.6368 0.2078 25.3313); /* Emergency Red */
--chart-1: oklch(0.5854 0.2041 277.1173); /* Data Visualization */
```

### **Healthcare-Specific Usage**

```typescript
// ✅ Medical interface with proper contrast
<div className="bg-background text-foreground border border-border">
  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Agendar Consulta
  </Button>
</div>

// ✅ Emergency state styling
<Alert className="border-destructive bg-destructive/10">
  <AlertTriangle className="h-4 w-4 text-destructive" />
  <AlertTitle className="text-destructive">Situação de Emergência</AlertTitle>
</Alert>

// ✅ LGPD compliance indicator
<Badge variant="outline" className="border-chart-2 text-chart-2">
  LGPD Compliant
</Badge>

// ❌ Never hardcode healthcare colors
<div className="bg-[#8b5cf6] text-[#ffffff]">...</div>
```

### **Accessibility & Compliance**

- **WCAG AAA:** All color combinations meet 7:1 contrast ratio
- **Daltonism Support:** Optimized for color blindness accessibility
- **Medical Standards:** Colors tested for medical device interface compliance

## 📝 Typography System

The **NeonPro Healthcare Platform** uses carefully selected fonts optimized for medical interfaces and Brazilian Portuguese readability:

### **Font Stack**

- **Primary Font:** Inter - Medical-grade readability for patient data
- **Serif Font:** Lora - Professional documentation and reports
- **Monospace Font:** Libre Baskerville - Technical data and medical codes
- **Font Loading:** Optimized with `display: "swap"` for emergency interface performance

### **Healthcare Typography Hierarchy**

```css
/* Medical Interface Typography */
--font-sans: Inter, sans-serif; /* Patient data, UI text */
--font-serif: Lora, serif; /* Medical reports, documentation */
--font-mono: Libre Baskerville, serif; /* Medical codes, technical data */
```

### **Healthcare Font Configuration**

```typescript
// apps/web/app/layout.tsx
import { Inter, Lora } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  // Optimized for medical interface readability
  preload: true,
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  // Professional medical documentation
  weight: ["400", "500", "600", "700"],
});

// Apply to body with healthcare-optimized settings
<body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
```

### **Medical Typography Utilities**

```css
/* Healthcare-specific typography in globals.css */
@layer utilities {
  /* Medical Headers */
  .text-medical-title {
    @apply text-3xl font-bold leading-tight text-primary font-serif;
  }
  .text-patient-name {
    @apply text-xl font-semibold leading-tight text-foreground;
  }

  /* Clinical Data */
  .text-clinical-data {
    @apply text-base font-medium leading-relaxed font-mono;
  }
  .text-vital-signs {
    @apply text-lg font-bold text-chart-1 font-mono;
  }

  /* Emergency Text */
  .text-emergency {
    @apply text-lg font-bold text-destructive uppercase tracking-wide;
  }

  /* LGPD Compliance */
  .text-compliance {
    @apply text-xs text-muted-foreground leading-relaxed;
  }

  /* AI Chat Interface */
  .text-ai-response {
    @apply text-base leading-relaxed text-foreground;
  }
}
```

### **Healthcare Typography Examples**

```typescript
// ✅ Medical interface typography
<h1 className="text-medical-title">Clínica NeonPro</h1>
<h2 className="text-patient-name">Dr. Ana Silva - Paciente: Maria Santos</h2>
<p className="text-clinical-data">CPF: 123.456.789-00 | Prontuário: #NP2024001</p>
<span className="text-vital-signs">PA: 120/80 mmHg</span>

// ✅ Emergency interface
<div className="text-emergency">⚠️ Situação de Emergência</div>
<p className="text-base font-medium text-destructive">Contatar SAMU: 192</p>

// ✅ AI Chat typography
<div className="text-ai-response">
  Olá! Como posso ajudar com o agendamento hoje?
</div>

// ✅ LGPD compliance text
<p className="text-compliance">
  Seus dados são protegidos conforme LGPD.
  <a href="/privacy" className="underline hover:text-primary">Política de Privacidade</a>
</p>

// ✅ Medical documentation
<article className="font-serif space-y-4">
  <h3 className="text-xl font-semibold">Relatório de Procedimento</h3>
  <p className="text-base leading-relaxed">Procedimento realizado conforme protocolo...</p>
</article>
```

## 🎨 Styling with Tailwind CSS + TweakCN NEONPRO

### **Healthcare-First Utility Approach**

- **TweakCN Variables:** Always use semantic healthcare color variables
- **Medical Spacing:** Consistent spacing for medical data readability
- **Emergency States:** Dedicated utilities for critical interface elements
- **LGPD Compliance:** Built-in privacy-focused styling patterns
- **No Config Modification:** TweakCN theme is pre-configured in `globals.css`

```typescript
// ✅ Healthcare-optimized utility classes
<div className="flex items-center justify-between p-6 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <div className="space-y-1">
    <h3 className="text-patient-name">Maria Santos</h3>
    <p className="text-clinical-data">Prontuário: #NP2024001</p>
  </div>
  <Badge variant="outline" className="border-chart-2 text-chart-2">
    LGPD Compliant
  </Badge>
</div>

// ✅ Emergency interface styling
<Alert className="border-destructive bg-destructive/10 animate-pulse">
  <AlertTriangle className="h-5 w-5 text-destructive" />
  <AlertTitle className="text-emergency">Emergência Médica</AlertTitle>
  <AlertDescription className="text-base font-medium">
    Contatar SAMU: 192 | Tempo de resposta: <100ms
  </AlertDescription>
</Alert>

// ✅ AI Chat interface styling
<div className="bg-accent/20 border border-accent rounded-lg p-4 space-y-3">
  <div className="flex items-center gap-2">
    <Bot className="h-4 w-4 text-primary" />
    <span className="text-sm font-medium text-primary">NeonPro AI</span>
  </div>
  <p className="text-ai-response">Como posso ajudar com o agendamento hoje?</p>
</div>

// ❌ Never use inline styles in medical interfaces
<div style={{ padding: '16px', backgroundColor: '#ffffff' }}>...</div>
```

## 📱 Healthcare Responsive Design

### **Medical Interface Breakpoints**

Optimized for healthcare professionals and emergency scenarios:

- **sm:** 640px+ (Mobile medical devices, tablets)
- **md:** 768px+ (Tablet workstations, portable devices)
- **lg:** 1024px+ (Desktop workstations, clinic computers)
- **xl:** 1280px+ (Large medical displays, multi-monitor setups)
- **2xl:** 1536px+ (Hospital information systems, wall displays)

### **Healthcare Layout Patterns**

```typescript
// ✅ Medical dashboard responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
  <HealthcareMetricCard
    title="Pacientes Hoje"
    value="24"
    trend="+12%"
    className="bg-card border border-border hover:shadow-lg transition-shadow"
  />
  <HealthcareMetricCard
    title="Consultas Agendadas"
    value="18"
    trend="+5%"
    className="bg-card border border-border hover:shadow-lg transition-shadow"
  />
</div>

// ✅ Emergency interface - always visible
<div className="fixed bottom-4 right-4 z-50">
  <Button
    size="lg"
    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg animate-pulse"
  >
    🚨 Emergência
  </Button>
</div>

// ✅ Patient data responsive typography
<div className="space-y-2">
  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
    Clínica NeonPro
  </h1>
  <h2 className="text-lg md:text-xl text-patient-name">
    Dr. Ana Silva - Paciente: Maria Santos
  </h2>
  <p className="text-sm md:text-base text-clinical-data">
    CPF: 123.456.789-00 | Prontuário: #NP2024001
  </p>
</div>

// ✅ AI Chat responsive interface
<div className="fixed bottom-20 right-4 w-80 max-w-[calc(100vw-2rem)] md:w-96">
  <UniversalChat
    className="bg-background border border-border rounded-lg shadow-xl"
    placeholder="Digite sua mensagem ou use comando de voz..."
  />
</div>
```

## 🔧 Shadcn UI + TweakCN NEONPRO Integration

### **Healthcare-Optimized Installation**

```bash
# NeonPro project setup with PNPM (ARCHON-FIRST rule)
pnpm dlx shadcn@latest init

# Add healthcare-essential components
pnpm dlx shadcn@latest add button card input label alert badge
pnpm dlx shadcn@latest add dialog form select textarea
pnpm dlx shadcn@latest add table tabs progress skeleton

# Emergency and AI components
pnpm dlx shadcn@latest add command popover tooltip
```

### **NeonPro Component Configuration**

Pre-configured for healthcare compliance in `apps/web/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@neonpro/ui"
  }
}
```

### **Healthcare Component Extensions**

```typescript
// Enhanced Button for medical interfaces
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HealthcareButtonProps extends ButtonProps {
  emergency?: boolean;
  lgpdCompliant?: boolean;
}

export function HealthcareButton({
  emergency,
  lgpdCompliant,
  className,
  children,
  ...props
}: HealthcareButtonProps) {
  return (
    <Button
      className={cn(
        "transition-all duration-200",
        emergency
          && "bg-destructive text-destructive-foreground animate-pulse hover:bg-destructive/90",
        lgpdCompliant && "border-chart-2 text-chart-2",
        className,
      )}
      {...props}
    >
      {emergency && "🚨 "}
      {children}
      {lgpdCompliant && " ✓"}
    </Button>
  );
}
```

### **LGPD-Compliant Healthcare Forms**

```typescript
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Healthcare-specific validation with LGPD compliance
const patientFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone inválido"),
  lgpdConsent: z.boolean().refine(val => val === true, {
    message: "Consentimento LGPD é obrigatório",
  }),
  medicalDataConsent: z.boolean().refine(val => val === true, {
    message: "Consentimento para dados médicos é obrigatório",
  }),
});

export function PatientRegistrationForm() {
  const form = useForm<z.infer<typeof patientFormSchema>>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      lgpdConsent: false,
      medicalDataConsent: false,
    },
  });

  function onSubmit(values: z.infer<typeof patientFormSchema>) {
    // Healthcare data submission with LGPD compliance
    console.log("Patient data (LGPD compliant):", values);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* LGPD Compliance Notice */}
      <Alert className="border-chart-2 bg-chart-2/10">
        <Shield className="h-4 w-4 text-chart-2" />
        <AlertDescription className="text-compliance">
          Seus dados são protegidos conforme LGPD (Lei 13.709/2018).
          <a href="/privacy" className="underline hover:text-primary">Política de Privacidade</a>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome completo"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">CPF</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      className="h-11 font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      className="h-11 font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* LGPD Consent Section */}
          <div className="space-y-4 p-4 bg-accent/20 border border-accent rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-primary">Consentimentos LGPD</h3>
            </div>

            <FormField
              control={form.control}
              name="lgpdConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Concordo com o tratamento dos meus dados pessoais
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Conforme LGPD, para prestação de serviços médicos
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicalDataConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Autorizo o tratamento de dados sensíveis de saúde
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Para histórico médico, prontuário e procedimentos
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={!form.formState.isValid}
          >
            Cadastrar Paciente
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

## Accessibility

- **Semantic HTML:** Use proper elements (`<nav>`, `<button>`, `<main>`)
- **ARIA:** Apply roles and attributes for screen readers
- **Keyboard Navigation:** All interactive elements focusable
- **Color Contrast:** Meet WCAG AA requirements with oklch color optimization
- **Labels:** Clear labels for form inputs and application tools
- **MUST**
  - Make all functionality keyboard-operable end-to-end; include a "Skip to content" link; avoid focus traps.
  - Provide visible focus indicators for all interactive elements (contrast ≥ 3:1) and a logical tab order.
  - Use semantic HTML first; use ARIA only to enhance (landmarks/roles/names) and never to replace semantics.
  - Associate labels with controls (<label for> or aria-label/aria-labelledby) and link help/error text via aria-describedby.
  - Provide meaningful alt text for images; use empty alt (alt="") for purely decorative imagery.
  - Meet contrast: text 4.5:1 (normal), 3:1 (large); non-text UI components 3:1.
  - Maintain a logical heading hierarchy (h1→h2→h3…) and one primary H1 per page/screen.
  - Respect prefers-reduced-motion and avoid flashing content.
- **SHOULD**
  - Prefer accessible primitives/components (e.g., Radix/shadcn, WAI-ARIA patterns) over bespoke widgets.
  - Announce important async updates with aria-live (prefer polite for non-critical changes).
  - Set the document lang and title; use specific, descriptive link/button text (avoid "click here").
  - Keep touch targets comfortably large (≈44×44 px) and spaced to reduce accidental taps.
- **MUST NOT**
  - Remove or hide focus outlines; rely on color alone to convey information.
  - Attach interactive handlers to non-interactive elements without appropriate role and tabindex.
  - Autoplay audio/video with sound or use motion-heavy animations without a reduced-motion fallback.
  - Use ARIA to “fix” invalid markup or contradict native semantics.

### Examples

```tsx
// ✅ Button with accessible name and help text
<button className="btn" aria-describedby="save-hint">Save changes</button>
<p id="save-hint" className="sr-only">Saves your edits to the server</p>
```

```css
/* ✅ Visible focus outline */
.btn:focus-visible {
  outline: 3px solid #0a84ff;
  outline-offset: 2px;
}
```

### Validation Criteria

- axe/Lighthouse shows no critical violations; contrast checks pass.
- Keyboard-only navigation succeeds with visible focus on all interactive elements.
- Forms have programmatically associated labels and error/help text via aria-describedby.
- Important async updates are announced (aria-live) and do not trap focus.
- Each screen has a logical heading hierarchy and a single H1.

## React rules

- Use functional components with hooks instead of class components
- Use custom hooks for reusable logic
- Use the Context API for state management when needed
- Use proper prop validation with PropTypes
- Use React.memo for performance optimization when necessary
- Use fragments to avoid unnecessary DOM elements
- Use proper list rendering with keys
- Prefer composition over inheritance
- Use React.lazy for code splitting
- Avoid using `dangerouslySetInnerHTML`
- Use `useCallback` and `useMemo` for performance optimization
- Use `useEffect` for side effects and cleanups

## Tailwind CSS rules

- Use responsive prefixes for mobile-first design:

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on medium, one-third on large screens -->
</div>
```

- Use state variants for interactive elements:

```html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2">
  Click me
</button>
```

- Use @apply for repeated patterns when necessary:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

- Use arbitrary values for specific requirements:

```html
<div class="top-[117px] grid-cols-[1fr_2fr]">
  <!-- Custom positioning and grid layout -->
</div>
```

- Use spacing utilities for consistent layout:

```html
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## 🏗️ Arquitetura de Componentes NeonPro

### **Estrutura de Componentes Médicos**

```typescript
// Healthcare Component Base Structure
interface HealthcareComponentProps {
  patientId?: string;
  emergencyMode?: boolean;
  lgpdCompliant?: boolean;
  accessLevel?: 'doctor' | 'nurse' | 'admin' | 'patient';
  auditLog?: boolean;
}

// Base Healthcare Component
export function HealthcareComponent({
  patientId,
  emergencyMode = false,
  lgpdCompliant = true,
  accessLevel = 'patient',
  auditLog = true,
  children,
  ...props
}: HealthcareComponentProps & React.PropsWithChildren) {
  // LGPD compliance check
  useEffect(() => {
    if (lgpdCompliant && patientId) {
      logDataAccess(patientId, accessLevel);
    }
  }, [patientId, accessLevel, lgpdCompliant]);

  return (
    <div
      className={cn(
        "healthcare-component",
        emergencyMode && "emergency-mode border-destructive bg-destructive/10",
        "transition-all duration-200"
      )}
      data-patient-id={patientId}
      data-access-level={accessLevel}
      {...props}
    >
      {children}
    </div>
  );
}
```

### **Componentes Especializados**

```typescript
// Patient Vital Signs Component
export function VitalSignsCard({ patientId, realTime = false }: {
  patientId: string;
  realTime?: boolean;
}) {
  const { data: vitals, isLoading } = useQuery({
    queryKey: ['vitals', patientId],
    queryFn: () => fetchVitals(patientId),
    refetchInterval: realTime ? 5000 : undefined,
  });

  return (
    <HealthcareComponent
      patientId={patientId}
      accessLevel="doctor"
      className="bg-card border border-border rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Sinais Vitais</h3>
        {realTime && (
          <Badge variant="outline" className="border-chart-1 text-chart-1">
            Tempo Real
          </Badge>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <VitalMetric
            label="Pressão Arterial"
            value={`${vitals?.bloodPressure?.systolic}/${vitals?.bloodPressure?.diastolic}`}
            unit="mmHg"
            status={getVitalStatus(vitals?.bloodPressure)}
          />
          <VitalMetric
            label="Frequência Cardíaca"
            value={vitals?.heartRate}
            unit="bpm"
            status={getVitalStatus(vitals?.heartRate)}
          />
        </div>
      )}
    </HealthcareComponent>
  );
}

// Emergency Alert Component
export function EmergencyAlert({ 
  message, 
  severity = 'high',
  onAcknowledge 
}: {
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onAcknowledge: () => void;
}) {
  return (
    <Alert 
      className={cn(
        "border-destructive bg-destructive/10 animate-pulse",
        severity === 'critical' && "border-2 shadow-lg"
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <AlertTitle className="text-emergency">
        🚨 Emergência Médica - {severity.toUpperCase()}
      </AlertTitle>
      <AlertDescription className="text-base font-medium mb-3">
        {message}
      </AlertDescription>
      <Button 
        onClick={onAcknowledge}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        size="sm"
      >
        Reconhecer Emergência
      </Button>
    </Alert>
  );
}
```

## 🔒 Segurança e Conformidade LGPD

### **Implementação de Privacidade por Design**

```typescript
// LGPD Compliance Hook
export function useLGPDCompliance(dataType: 'personal' | 'sensitive' | 'medical') {
  const [hasConsent, setHasConsent] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<Date | null>(null);

  const requestConsent = useCallback(async (purpose: string) => {
    const consent = await showConsentDialog({
      dataType,
      purpose,
      legalBasis: 'consent',
      retention: getRetentionPeriod(dataType),
    });

    if (consent.granted) {
      setHasConsent(true);
      setConsentTimestamp(new Date());
      await logConsentEvent(consent);
    }

    return consent.granted;
  }, [dataType]);

  const revokeConsent = useCallback(async () => {
    await logConsentRevocation(dataType);
    setHasConsent(false);
    setConsentTimestamp(null);
  }, [dataType]);

  return {
    hasConsent,
    consentTimestamp,
    requestConsent,
    revokeConsent,
  };
}

// Data Protection Component
export function DataProtectionWrapper({ 
  children, 
  dataType,
  purpose 
}: {
  children: React.ReactNode;
  dataType: 'personal' | 'sensitive' | 'medical';
  purpose: string;
}) {
  const { hasConsent, requestConsent } = useLGPDCompliance(dataType);
  const [showConsentModal, setShowConsentModal] = useState(!hasConsent);

  if (!hasConsent) {
    return (
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Consentimento LGPD
            </DialogTitle>
            <DialogDescription>
              Para {purpose}, precisamos do seu consentimento para processar 
              dados {dataType === 'medical' ? 'médicos sensíveis' : dataType}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-accent/20 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Seus direitos LGPD:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Acesso aos seus dados</li>
                <li>• Correção de dados incorretos</li>
                <li>• Exclusão quando aplicável</li>
                <li>• Portabilidade dos dados</li>
                <li>• Revogação do consentimento</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => requestConsent(purpose)}
                className="flex-1"
              >
                Aceitar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConsentModal(false)}
                className="flex-1"
              >
                Recusar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute top-2 right-2">
        <Badge variant="outline" className="border-chart-2 text-chart-2 text-xs">
          LGPD ✓
        </Badge>
      </div>
    </div>
  );
}
```

### **Auditoria e Monitoramento**

```typescript
// Medical Data Access Logging
export function logMedicalDataAccess({
  patientId,
  userId,
  action,
  dataType,
  ipAddress,
  userAgent,
}: {
  patientId: string;
  userId: string;
  action: 'view' | 'edit' | 'delete' | 'export';
  dataType: string;
  ipAddress: string;
  userAgent: string;
}) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    patientId,
    userId,
    action,
    dataType,
    ipAddress,
    userAgent,
    compliance: 'LGPD',
    retention: '5_years', // Conforme CFM
  };

  // Send to secure audit system
  return fetch('/api/audit/medical-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auditLog),
  });
}

// Performance Monitoring for Medical Systems
export function useHealthcarePerformanceMonitoring() {
  const trackCriticalAction = useCallback((action: string, startTime: number) => {
    const duration = performance.now() - startTime;
    const threshold = CRITICAL_THRESHOLDS[action] || 1000;

    if (duration > threshold) {
      // Alert medical IT team
      console.error(`Critical medical action '${action}' exceeded threshold: ${duration}ms`);
      
      // Send to monitoring system
      fetch('/api/monitoring/performance-alert', {
        method: 'POST',
        body: JSON.stringify({
          action,
          duration,
          threshold,
          timestamp: new Date().toISOString(),
          severity: duration > threshold * 2 ? 'critical' : 'warning',
        }),
      });
    }

    return duration;
  }, []);

  return { trackCriticalAction };
}
```

## 📊 Monitoramento e Analytics

### **Healthcare Analytics Dashboard**

```typescript
// Medical Analytics Component
export function HealthcareAnalyticsDashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['healthcare-metrics'],
    queryFn: fetchHealthcareMetrics,
    refetchInterval: 30000, // 30 seconds
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <MetricCard
        title="Pacientes Ativos"
        value={metrics?.activePatients || 0}
        trend={metrics?.patientsTrend}
        icon={Users}
        className="bg-card border border-border"
      />
      
      <MetricCard
        title="Consultas Hoje"
        value={metrics?.todayAppointments || 0}
        trend={metrics?.appointmentsTrend}
        icon={Calendar}
        className="bg-card border border-border"
      />
      
      <MetricCard
        title="Tempo Médio de Resposta"
        value={`${metrics?.avgResponseTime || 0}ms`}
        trend={metrics?.responseTrend}
        icon={Clock}
        className="bg-card border border-border"
        critical={metrics?.avgResponseTime > 500}
      />
      
      <MetricCard
        title="Conformidade LGPD"
        value={`${metrics?.lgpdCompliance || 100}%`}
        trend={metrics?.complianceTrend}
        icon={Shield}
        className="bg-card border border-border"
        critical={metrics?.lgpdCompliance < 95}
      />
    </div>
  );
}

// Real-time System Health Monitor
export function SystemHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const health = await response.json();
        
        if (health.emergencySystemsOnline && health.responseTime < 100) {
          setHealthStatus('healthy');
        } else if (health.responseTime < 500) {
          setHealthStatus('warning');
        } else {
          setHealthStatus('critical');
        }
      } catch (error) {
        setHealthStatus('critical');
      }
    };

    const interval = setInterval(checkSystemHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "fixed top-4 right-4 p-2 rounded-md text-xs font-medium",
      healthStatus === 'healthy' && "bg-green-100 text-green-800",
      healthStatus === 'warning' && "bg-yellow-100 text-yellow-800",
      healthStatus === 'critical' && "bg-red-100 text-red-800 animate-pulse"
    )}>
      Sistema: {healthStatus === 'healthy' ? '✅ Operacional' : 
               healthStatus === 'warning' ? '⚠️ Atenção' : '🚨 Crítico'}
    </div>
  );
}
```

## 🎯 Conclusão

### **Resumo das Diretrizes NeonPro**

Este guia estabelece os padrões fundamentais para o desenvolvimento da **NeonPro AI Healthcare Platform**, garantindo:

**✅ Excelência Técnica:**
- Arquitetura baseada em Next.js 15 e React 19
- Componentes Shadcn UI otimizados para saúde
- Sistema de cores TweakCN NEONPRO com conformidade WCAG AAA
- Performance crítica com resposta <100ms para emergências

**✅ Conformidade Regulatória:**
- Compliance total com LGPD (Lei 13.709/2018)
- Padrões ANVISA e CFM para interfaces médicas
- Auditoria completa de acesso a dados médicos
- Privacidade por design em todos os componentes

**✅ Experiência do Usuário:**
- Interface otimizada para profissionais de saúde
- Acessibilidade WCAG AAA para ambientes médicos
- Suporte completo a emergências médicas
- Integração nativa com IA para assistência médica

**✅ Escalabilidade e Manutenção:**
- Arquitetura de componentes reutilizáveis
- Sistema de design consistente e documentado
- Monitoramento em tempo real de performance
- Estrutura preparada para crescimento

### **Próximos Passos**

1. **Implementação Gradual:** Seguir as diretrizes por módulo (dashboard → pacientes → emergência)
2. **Testes de Conformidade:** Validar LGPD e acessibilidade em cada componente
3. **Treinamento da Equipe:** Capacitar desenvolvedores nas práticas específicas de saúde
4. **Monitoramento Contínuo:** Implementar alertas para performance e conformidade
5. **Feedback Médico:** Coletar feedback de profissionais de saúde para refinamentos

### **Recursos de Apoio**

- **Documentação Técnica:** `/docs/technical/`
- **Componentes de Exemplo:** `/examples/healthcare/`
- **Testes de Conformidade:** `/tests/compliance/`
- **Guias de Acessibilidade:** `/docs/accessibility/`
- **Templates LGPD:** `/templates/lgpd/`

---

**NeonPro Healthcare Design Guidelines v2.0.0**  
*Construindo o futuro da saúde digital no Brasil com excelência técnica e conformidade regulatória.*

🏥 **Para clínicas estéticas brasileiras**  
🤖 **Powered by AI**  
🔒 **LGPD Compliant**  
⚡ **Performance Crítica**

## Performance

### Healthcare-Specific Accessibility (WCAG AAA)

**Critical Healthcare Requirements:**

- **WCAG AAA Compliance:** Enhanced contrast ratios (7:1 for normal text, 4.5:1 for large text)
- **Emergency Interface Accessibility:** Screen reader compatibility for critical alerts
- **Medical Data Readability:** High contrast for vital signs and patient data
- **Multi-language Support:** Portuguese and English accessibility labels
- **Cognitive Load Reduction:** Clear information hierarchy for medical professionals

**Healthcare-Specific ARIA Patterns:**

```tsx
// Emergency Alert with proper ARIA
<div
  role="alert"
  aria-live="assertive"
  className="bg-destructive text-destructive-foreground p-4 rounded-md"
>
  <span className="sr-only">Emergência médica:</span>
  Paciente em estado crítico - Sala 302
</div>

// Medical Data with Enhanced Labels
<div className="medical-vitals" role="region" aria-labelledby="vitals-heading">
  <h3 id="vitals-heading">Sinais Vitais</h3>
  <dl>
    <dt>Pressão Arterial:</dt>
    <dd aria-label="Pressão arterial 120 por 80 milímetros de mercúrio">120/80 mmHg</dd>
    <dt>Frequência Cardíaca:</dt>
    <dd aria-label="Frequência cardíaca 72 batimentos por minuto">72 bpm</dd>
  </dl>
</div>

// LGPD Compliance Indicator
<div className="lgpd-status" role="status" aria-live="polite">
  <span className="sr-only">Status de conformidade LGPD:</span>
  <span className="text-green-600">✓ Dados protegidos conforme LGPD</span>
</div>
```

**Enhanced Requirements for Healthcare:**

- **Emergency alerts must use `role="alert"` and `aria-live="assertive"`**
- **Medical data must have descriptive aria-labels in Portuguese**
- **Patient status indicators cannot rely on color alone**
- **Critical actions require confirmation dialogs with clear ARIA labels**
- **Touch targets for mobile emergency interfaces: minimum 48×48px**

## Performance

### Healthcare-Specific Performance Requirements

**Critical Response Times:**

- **Emergency Actions:** < 100ms response time for critical medical alerts
- **Patient Data Loading:** < 500ms for vital signs and basic patient info
- **AI Response Time:** < 2 seconds for medical AI assistance
- **Form Validation:** Real-time validation for medical data entry
- **Image Loading:** Medical images must load progressively with placeholders

**Medical Data Optimization:**

```tsx
// Optimized Patient Data Loading
const PatientDashboard = () => {
  const { data: vitals, isLoading } = useQuery({
    queryKey: ["patient-vitals", patientId],
    queryFn: () => fetchVitals(patientId),
    staleTime: 30000, // 30 seconds for vital signs
    refetchInterval: 60000, // Auto-refresh every minute
  });

  return (
    <Suspense fallback={<VitalsLoadingSkeleton />}>
      {isLoading
        ? <div className="animate-pulse bg-muted h-32 rounded-md" />
        : <VitalsDisplay data={vitals} />}
    </Suspense>
  );
};

// Emergency Data Preloading
const EmergencyInterface = () => {
  useEffect(() => {
    // Preload critical emergency data
    queryClient.prefetchQuery({
      queryKey: ["emergency-contacts"],
      queryFn: fetchEmergencyContacts,
    });
  }, []);
};
```

**AI Performance Optimization:**

```tsx
// Optimized AI Chat with Streaming
const UniversalChat = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    streamMode: "text", // Enable streaming for faster perceived performance
    onResponse: (response) => {
      // Track response time for medical queries
      analytics.track("ai_response_time", {
        duration: Date.now() - startTime,
        query_type: "medical",
      });
    },
  });

  return (
    <div className="chat-container">
      {messages.map((message) => (
        <div key={message.id} className="message">
          {message.content}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            IA analisando dados médicos...
          </span>
        </div>
      )}
    </div>
  );
};
```

**Standard Performance Requirements:**

- **Server Components:** Minimize client-side JavaScript for medical data
- **Font Loading:** Geist fonts with `display: "swap"` optimization
- **Unused Styles:** Build process removes unused CSS
- **Image Optimization:** Use `next/image` component with medical image priorities
- **Code Splitting:** Lazy load non-critical medical modules
- **Caching Strategy:** Aggressive caching for static medical references, careful caching for patient data

**Performance Monitoring:**

```tsx
// Performance tracking for medical interfaces
const trackMedicalPerformance = (action: string, duration: number) => {
  if (duration > CRITICAL_THRESHOLDS[action]) {
    console.warn(`Medical action '${action}' exceeded critical threshold: ${duration}ms`);
    // Alert medical IT team for critical performance issues
  }
};

// Usage
const handleEmergencyAlert = async () => {
  const startTime = performance.now();
  await triggerEmergencyProtocol();
  const duration = performance.now() - startTime;
  trackMedicalPerformance("emergency_alert", duration);
};
```

- Use functional components with hooks instead of class components
- Use custom hooks for reusable logic
- Use the Context API for state management when needed
- Use proper prop validation with PropTypes
- Use React.memo for performance optimization when necessary
- Use fragments to avoid unnecessary DOM elements
- Use proper list rendering with keys
- Prefer composition over inheritance
- Use React.lazy for code splitting
- Avoid using `dangerouslySetInnerHTML`
- Use `useCallback` and `useMemo` for performance optimization
- Use `useEffect` for side effects and cleanups

## Tailwind CSS rules

- Use responsive prefixes for mobile-first design:

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on medium, one-third on large screens -->
</div>
```

- Use state variants for interactive elements:

```html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2">
  Click me
</button>
```

- Use @apply for repeated patterns when necessary:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

- Use arbitrary values for specific requirements:

```html
<div class="top-[117px] grid-cols-[1fr_2fr]">
  <!-- Custom positioning and grid layout -->
</div>
```

- Use spacing utilities for consistent layout:

```html
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```
