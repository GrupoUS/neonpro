# Mobile-First Design Guidelines (T083)

## Overview

This guide outlines the mobile-first design principles and implementation patterns for the Patient Dashboard, optimized for Brazilian healthcare professionals with varying device capabilities and network conditions.

## Design Philosophy

**Mobile-first means designing for the smallest screen first, then progressively enhancing for larger screens.** This approach ensures:

- Fast load times on mobile networks (<500ms target)
- Touch-friendly interfaces for medical professionals on-the-go
- Accessible design for users with disabilities
- Responsive layouts that work on any device

## Performance Targets

### Load Time Targets
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.0s
- **Cumulative Layout Shift**: <0.1

### Network Considerations
- 3G network optimization
- Offline functionality for critical features
- Progressive loading of non-essential features
- Smart caching strategies

## Responsive Breakpoints

```scss
// Mobile-first breakpoints
$breakpoint-sm: 640px;   // Small phones
$breakpoint-md: 768px;   // Large phones, small tablets
$breakpoint-lg: 1024px;  // Tablets, small desktops
$breakpoint-xl: 1280px;  // Desktops
$breakpoint-2xl: 1536px; // Large desktops
```

## Design Patterns

### 1. Navigation

#### Mobile Navigation
```typescript
import { MobileNavigation } from '../components/layout/mobile-navigation';

// Usage: Bottom navigation for mobile
<MobileNavigation
  items={[
    { label: 'Pacientes', icon: 'users', to: '/patients' },
    { label: 'Agenda', icon: 'calendar', to: '/appointments' },
    { label: 'Chat IA', icon: 'message-circle', to: '/ai/chat' },
    { label: 'Mais', icon: 'more-horizontal', to: '/more' }
  ]}
/>
```

**Key Features:**
- Bottom navigation bar for thumb accessibility
- Maximum 5 items for clarity
- Active state indication
- Badge notifications
- Touch target: 48x48px minimum

#### Desktop Navigation
```typescript
import { Sidebar } from '../components/layout/sidebar';

// Usage: Sidebar for desktop
<Sidebar
  collapsed={isCollapsed}
  onCollapse={setCollapsed}
  items={[
    {
      title: 'Cadastros',
      items: [
        { label: 'Pacientes', to: '/patients', icon: 'user' },
        { label: 'Profissionais', to: '/professionals', icon: 'stethoscope' }
      ]
    }
  ]}
/>
```

### 2. Forms

#### Mobile Form Strategy
```typescript
import { SteppedForm } from '../components/forms/stepped-form';

// Multi-step form for mobile
const PatientRegistrationForm = () => {
  return (
    <SteppedForm
      steps={[
        {
          title: 'Dados Básicos',
          fields: ['name', 'cpf', 'birthDate', 'gender']
        },
        {
          title: 'Contato',
          fields: ['email', 'phone', 'address']
        },
        {
          title: 'Plano de Saúde',
          fields: ['insuranceProvider', 'planNumber']
        },
        {
          title: 'Consentimentos',
          fields: ['lgpdConsent', 'termsAcceptance']
        }
      ]}
      onSubmit={handleSubmit}
    />
  );
};
```

**Form Guidelines:**
- Single column layout on mobile
- Large touch targets (44px minimum)
- Clear field labels above inputs
- Real-time validation feedback
- Auto-save progress
- Keyboard with appropriate input types

### 3. Data Display

#### Mobile Cards
```typescript
import { PatientCard } from '../components/patient/patient-card';

// Compact patient card for mobile
const PatientListItem = ({ patient }) => {
  return (
    <PatientCard
      patient={patient}
      variant="compact"
      actions={[
        { icon: 'phone', onPress: handleCall },
        { icon: 'message', onPress: handleMessage },
        { icon: 'more-vertical', onPress: handleMenu }
      ]}
    />
  );
};
```

#### Table Alternatives
```typescript
// Convert tables to cards on mobile
const ResponsivePatientTable = ({ patients }) => {
  return (
    <div className="space-y-4">
      {patients.map(patient => (
        <PatientCard
          key={patient.id}
          patient={patient}
          variant="detailed"
          showActions
        />
      ))}
    </div>
  );
};
```

### 4. Search and Filters

#### Mobile Search
```typescript
import { MobileSearch } from '../components/search/mobile-search';

// Full-screen search interface
const PatientSearch = () => {
  return (
    <MobileSearch
      placeholder="Buscar pacientes por nome, CPF ou email..."
      filters={{
        status: {
          type: 'select',
          options: ['Todos', 'Ativos', 'Inativos']
        },
        dateRange: {
          type: 'daterange',
          label: 'Período'
        }
      }}
      onSearch={handleSearch}
    />
  );
};
```

## Component Library

### Base Components

#### Button
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// Usage
<Button
  variant="primary"
  size="lg"
  fullWidth
  loading={isSubmitting}
  icon={<SaveIcon />}
  onClick={handleSubmit}
>
  Salvar Paciente
</Button>
```

#### Input Field
```typescript
interface InputFieldProps {
  label: string;
  error?: string;
  helper?: string;
  mask?: string;
  disabled?: boolean;
  required?: boolean;
}

// CPF input with mask
<InputField
  label="CPF"
  mask="999.999.999-99"
  error={errors.cpf?.message}
  helper="Digite apenas números"
  required
  {...register('cpf')}
/>
```

### Layout Components

#### Container
```typescript
// Responsive container
<Container className="px-4 py-6 max-w-7xl mx-auto">
  <h1 className="text-2xl font-bold mb-6">Lista de Pacientes</h1>
  <PatientSearch />
  <PatientList />
</Container>
```

#### Grid System
```typescript
// Mobile-first grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {patients.map(patient => (
    <PatientCard key={patient.id} patient={patient} />
  ))}
</div>
```

## Touch Interactions

### Gesture Support
```typescript
import { useSwipeable } from 'react-swipeable';

const SwipeableCard = ({ patient }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => handleAction(patient, 'edit'),
    onSwipedRight: () => handleAction(patient, 'delete'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  return (
    <div {...handlers}>
      <PatientCard patient={patient} />
    </div>
  );
};
```

### Touch Targets
- Minimum 44x44px for all interactive elements
- 8px spacing between touch targets
- Visual feedback on touch
- No hover-dependent interactions on mobile

## Accessibility Considerations

### Font Sizes
```css
:root {
  --font-size-xs: 0.75rem;  /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem;   /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem;  /* 20px */
  --font-size-2xl: 1.5rem;  /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
}

/* Responsive font scaling */
@media (max-width: 640px) {
  :root {
    font-size: 14px;
  }
}
```

### Color Contrast
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 for large text (18px+)
- Test with Brazilian color blindness patterns

### Focus Management
- Visible focus indicators
- Logical tab order
- Skip to content links
- Modal focus traps

## Performance Optimization

### Image Handling
```typescript
import { Image } from '../components/ui/image';

// Lazy loading with placeholder
<Image
  src={patient.photo}
  alt={`Foto de ${patient.name}`}
  placeholder={<PatientAvatar initials={getInitials(patient.name)} />}
  loading="lazy"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="rounded-full w-16 h-16"
/>
```

### Code Splitting
```typescript
// Route-based code splitting
const PatientDashboard = lazy(() => 
  import('./pages/patients/dashboard').then(module => ({
    default: module.PatientDashboard
  }))
);

// Component-level code splitting
const HeavyChart = lazy(() => 
  import('../components/charts/heavy-chart')
);
```

### Virtualization
```typescript
import { VirtualList } from '../components/ui/virtual-list';

// For long patient lists
<VirtualList
  data={patients}
  renderItem={patient => <PatientCard patient={patient} />}
  itemHeight={120}
  overscan={5}
/>
```

## Brazilian Context

### Date and Time
```typescript
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Brazilian date format
const formatDate = (date: Date) => {
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  // Ex: 15 de janeiro de 2024
};

// Brazilian time format
const formatTime = (date: Date) => {
  return format(date, 'HH:mm', { locale: ptBR });
  // Ex: 14:30
};
```

### Currency
```typescript
import { formatCurrency } from '../utils/format-currency';

const formatBRL = (value: number) => {
  return formatCurrency(value, {
    locale: 'pt-BR',
    currency: 'BRL'
  });
  // Ex: R$ 1.234,56
};
```

### Phone Numbers
```typescript
import { formatPhone } from '../utils/format-phone';

const formatBrazilianPhone = (phone: string) => {
  return formatPhone(phone);
  // (11) 99999-8888 or (11) 2555-1234
};
```

## Testing Guidelines

### Device Testing Matrix
- **Small Mobile**: iPhone SE, Samsung Galaxy S
- **Large Mobile**: iPhone 14 Pro, Samsung Galaxy S23
- **Tablet**: iPad, Samsung Galaxy Tab
- **Desktop**: Various screen sizes

### Network Conditions
- 3G (1 Mbps download, 750 kbps upload, 300ms latency)
- 4G (4 Mbps download, 3 Mbps upload, 100ms latency)
- Offline mode for critical features

### User Testing Scenarios
1. **Doctor on Rounds**: Quick patient lookup, one-handed operation
2. **Receptionist**: Rapid patient registration, form completion
3. **Specialist**: Detailed patient history review, data analysis
4. **Emergency Nurse**: Fast access to critical information

## Implementation Checklist

### Mobile Optimizations
- [ ] Touch targets ≥44px
- [ ] Single column layout on mobile
- [ ] Optimized images and lazy loading
- [ ] Fast load times (<500ms)
- [ ] Offline capability for critical features
- [ ] Gesture support where appropriate
- [ ] Large, readable fonts
- [ ] Responsive typography
- [ ] Progressive enhancement

### Brazilian Adaptations
- [ ] Portuguese (pt-BR) language
- [ ] Brazilian date/time formats
- [ ] CPF/CNPJ masking and validation
- [ ] Phone number formatting
- [ ] Address format (CEP lookup)
- [ ] Healthcare terminology
- [ ] Currency formatting (BRL)
- [ ] Regional healthcare considerations

### Accessibility
- [ ] WCAG 2.1 AA+ compliance
- [ ] Screen reader testing
- [ ] Keyboard navigation
- [ ] Sufficient color contrast
- [ ] Focus management
- [ ] ARIA labels and roles
- [ ] Reduced motion support

## Resources

### Tools
- Chrome DevTools Device Mode
- BrowserStack for cross-device testing
- Lighthouse for performance auditing
- Axe DevTools for accessibility testing
- WebPageTest for network simulation

### Libraries
- React Native Web for mobile components
- Hammer.js for touch gestures
- Intersection Observer API for lazy loading
- date-fns for date manipulation
- react-virtualized for large lists

### Design Resources
- [Material Design](https://material.io/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Fluent Design](https://www.microsoft.com/design/fluent/)
- [Brazilian Digital Government Guidelines](https://www.gov.br/design/pt-br)

## Conclusion

Mobile-first design is not just about making things work on small screens—it's about creating the best possible experience for healthcare professionals who rely on mobile devices in their daily work. By following these guidelines, we ensure that our application is fast, accessible, and delightful to use across all devices and contexts.