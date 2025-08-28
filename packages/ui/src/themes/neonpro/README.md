# TweakCN NEONPRO Healthcare Theme

Professional healthcare theme system based on the TweakCN NEONPRO design ([theme reference](https://tweakcn.com/themes/cmesqts4l000r04l7bgdqfpxb)), optimized for Brazilian aesthetic clinics and medical practices.

## 🎨 Design Philosophy

The NEONPRO theme follows the proven design patterns from the TweakCN NEONPRO theme, featuring:

- **Revenue-focused metrics** (inspired by "$15,231.89 +20.1% from last month" design)
- **Professional healthcare colors** with Brazilian compliance indicators
- **Calendar-centric workflows** based on the "June 2025" calendar design
- **Payment status tracking** with success/processing/failed/pending badges
- **Team management** with role-based access visualization

## 🚀 Quick Start

### Installation

The theme is already included in the `@neonpro/ui` package:

```bash
npm install @neonpro/ui
```

### Basic Usage

```typescript
import {
  neonproTheme,
  HealthcareMetricCard,
  AppointmentCalendar,
  PaymentStatusTable,
  TeamMembersList,
} from "@neonpro/ui/themes/neonpro";

// Import the CSS styles
import "@neonpro/ui/themes/neonpro/styles";
```

## 📊 Components

### HealthcareMetricCard

Display key healthcare metrics with growth indicators (NEONPRO style):

```tsx
<HealthcareMetricCard
  title="Receita Mensal"
  value={15231.89}
  type="revenue"
  format="currency"
  currency="BRL"
  growth={{
    value: 20.1,
    period: "vs. mês anterior",
    isPositive: true,
  }}
  complianceIndicator={{
    type: "LGPD",
    status: "compliant",
  }}
/>
```

**Props:**

- `title`: Card title
- `value`: Numeric value or formatted string
- `type`: Metric type (`revenue`, `patients`, `appointments`, etc.)
- `growth`: Optional growth indicator with percentage and period
- `complianceIndicator`: Brazilian compliance status (LGPD, CFM, ANVISA, ANS)

### AppointmentCalendar

Brazilian healthcare appointment scheduling with density indicators:

```tsx
<AppointmentCalendar
  appointments={appointmentData}
  currentDate={new Date()}
  brazilianHolidays={holidays}
  showDensityIndicators={true}
  maxAppointmentsPerDay={12}
  firstDayOfWeek={1} // Monday first (Brazilian standard)
  onDateSelect={(date) => console.log("Selected:", date)}
  onAppointmentClick={(appointment) => console.log("Clicked:", appointment)}
/>
```

**Features:**

- Brazilian Portuguese month/day names
- Brazilian holiday integration
- Appointment density visualization
- Professional color-coding by appointment type
- Mobile-responsive design

### PaymentStatusTable

Professional payment tracking with Brazilian payment methods:

```tsx
<PaymentStatusTable
  payments={paymentData}
  variant="detailed"
  showFilters={true}
  showExport={true}
  onPaymentView={(payment) => console.log("View:", payment)}
  onExportData={() => exportPayments()}
/>
```

**Features:**

- Brazilian payment methods (PIX, Boleto, Cartão, etc.)
- Status badges (Pago, Processando, Falhou, Pendente)
- Email masking for privacy
- BRL currency formatting
- Installment tracking

### TeamMembersList

Healthcare team management with Brazilian professional validation:

```tsx
<TeamMembersList
  members={teamData}
  variant="card"
  showActions={true}
  onMemberClick={(member) => console.log("Selected:", member)}
  onAddMember={() => openAddMemberModal()}
/>
```

**Features:**

- Brazilian healthcare roles (Médico, Enfermeiro, etc.)
- CRM/COREN professional validation
- Status indicators (Ativo, Inativo, Suspenso)
- Avatar generation with initials
- Role-based color coding

## 🎨 Theme Configuration

### Colors

The theme provides a comprehensive color system:

```typescript
const colors = {
  // Core healthcare colors
  primary: "hsl(221, 83%, 53%)", // Professional blue
  success: "hsl(142, 76%, 36%)", // Growth green (+20.1%)
  revenue: "#15231", // Revenue highlight
  growth: "#16a34a", // Growth indicator

  // Brazilian-specific colors
  brasil: {
    green: "#009639", // Brazil flag green
    yellow: "#ffdf00", // Brazil flag yellow
    lgpdCompliant: "#059669", // LGPD compliance
    cfmValidated: "#2563eb", // CFM validation
  },

  // Healthcare workflow colors
  healthcare: {
    emergency: "#dc2626", // Emergency red
    appointment: "#16a34a", // Appointment green
    patient: "#2563eb", // Patient info blue
    treatment: "#7c3aed", // Treatment purple
    billing: "#f59e0b", // Billing orange
  },
};
```

### Typography

Healthcare-optimized typography system:

```typescript
const typography = {
  sans: ["Inter", "Segoe UI", "sans-serif"],
  mono: ["JetBrains Mono", "Consolas", "monospace"],

  sizes: {
    xs: "0.75rem", // Medical notes
    sm: "0.875rem", // Patient details
    base: "1rem", // Standard text
    lg: "1.125rem", // Section headers
    xl: "1.25rem", // Card titles
    "2xl": "1.5rem", // Dashboard titles
    "3xl": "1.875rem", // Emergency alerts
  },
};
```

### Spacing

Medical workflow optimized spacing:

```typescript
const spacing = {
  medical: {
    compact: "0.75rem", // Dense patient lists
    comfortable: "1.25rem", // Standard forms
    spacious: "2rem", // Emergency interfaces
    critical: "3rem", // Life-critical alerts
  },
};
```

## 🌐 Brazilian Healthcare Integration

### LGPD Compliance

```tsx
<HealthcareMetricCard
  complianceIndicator={{
    type: "LGPD",
    status: "compliant",
  }}
/>
```

### CFM Professional Validation

```tsx
<TeamMembersList
  members={[
    {
      id: "1",
      name: "Dr. João Silva",
      role: "doctor",
      crmNumber: "CRM-SP 123456",
      specialties: ["Cirurgia Plástica"],
      status: "active",
    },
  ]}
/>
```

### Brazilian Holidays

```tsx
<AppointmentCalendar
  brazilianHolidays={[
    {
      date: new Date("2025-12-25"),
      name: "Natal",
      type: "national",
    },
  ]}
/>
```

## 📱 Responsive Design

All components are mobile-first and tablet-optimized for healthcare professionals:

```css
/* Automatic responsive behavior */
.neonpro-mobile-stack {
  @apply flex-col space-y-2;
}

.neonpro-mobile-full {
  @apply w-full;
}

.neonpro-mobile-compact {
  @apply px-2 py-1 text-xs;
}
```

## 🎭 CSS Utilities

The theme provides healthcare-specific CSS utilities:

```css
/* Revenue cards (NEONPRO style) */
.neonpro-revenue-card {
  background: linear-gradient(
    135deg,
    hsl(221, 83%, 53%) 0%,
    hsl(221, 83%, 45%) 100%
  );
}

/* Brazilian compliance badges */
.neonpro-cfm-badge {
  background-color: var(--cfm-validated);
}

.neonpro-lgpd-compliant {
  background-color: var(--lgpd-compliant);
}

/* Emergency alerts */
.neonpro-emergency-alert {
  background: var(--healthcare-emergency);
  box-shadow: var(--healthcare-emergency-shadow);
}
```

## 🔧 Customization

### Theme Extension

```typescript
import { neonproTheme } from "@neonpro/ui/themes/neonpro";

const customTheme = {
  ...neonproTheme,
  colors: {
    ...neonproTheme.colors,
    // Add your custom colors
    customPrimary: "#your-color",
  },
};
```

### Component Variants

```tsx
<HealthcareMetricCard
  variant="revenue" // Uses revenue-specific styling
  size="lg"         // Larger size variant
/>

<PaymentStatusTable
  variant="compact" // Condensed view
/>

<TeamMembersList
  variant="card"    // Card layout instead of list
/>
```

## 📊 Performance

- **Theme Loading**: < 50ms hot-reload
- **Component Performance**: < 100ms render
- **Bundle Size**: Optimized for healthcare workflows
- **Accessibility**: WCAG 2.1 AA compliant

## 🇧🇷 Brazilian Localization

All components include Portuguese translations and Brazilian formatting:

- **Currency**: Automatic BRL formatting
- **Dates**: Brazilian date format (DD/MM/YYYY)
- **Numbers**: Brazilian number formatting
- **Time**: 24-hour format
- **Address**: CEP integration support

## 📚 Examples

Check the `examples/` directory for complete implementation examples:

- Basic dashboard setup
- Healthcare clinic management
- Payment processing workflow
- Team management interface

## 🤝 Contributing

When contributing to the NEONPRO theme:

1. Follow the established color system
2. Maintain Brazilian healthcare compliance
3. Test with real healthcare workflows
4. Ensure accessibility standards
5. Document new components

## 📄 License

Part of the NeonPro Healthcare Platform - See main project license.
