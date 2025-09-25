# Healthcare UI Components

A comprehensive suite of accessible, LGPD-compliant UI components specifically designed for Brazilian aesthetic clinics and healthcare applications.

## 🏥 Overview

This component library provides specialized healthcare UI patterns that address:

- **Brazilian Healthcare Requirements**: LGPD compliance, Portuguese localization, medical workflows
- **Accessibility**: WCAG 2.1 AA+ compliance with screen reader and keyboard navigation support
- **Aesthetic Clinic Workflows**: Treatment scheduling, patient management, consent handling
- **Emergency Management**: Medical emergency protocols and response systems

## 🚀 Components

### 1. TreatmentScheduler (`TreatmentScheduler`)

A comprehensive treatment scheduling interface for aesthetic clinics.

**Features:**
- Interactive calendar with Brazilian Portuguese localization
- Real-time availability tracking
- Treatment catalog integration
- Patient information display
- LGPD-compliant data handling
- Mobile-responsive design

```tsx
import { TreatmentScheduler } from '@/components/healthcare'

const MyScheduler = () => (
  <TreatmentScheduler
    patient={selectedPatient}
    treatments={availableTreatments}
    availableSlots={timeSlots}
    onSchedule={handleSchedule}
    healthcareContext="aesthetic"
  />
)
```

**Props:**
```typescript
interface TreatmentSchedulerProps {
  patient?: PatientData
  treatments: AestheticTreatment[]
  availableSlots: TreatmentTimeSlot[]
  onSchedule: (session: TreatmentSession) => void
  onCancel?: (sessionId: string) => void
  className?: string
  healthcareContext?: HealthcareContext
}
```

### 2. PatientRecordsViewer (`PatientRecordsViewer`)

Comprehensive patient records management with LGPD compliance.

**Features:**
- Multi-tab patient information display
- Sensitive data masking with audit logging
- LGPD right exercise (access, export, deletion)
- Treatment history visualization
- Medical records management
- Portuguese-optimized interface

```tsx
import { PatientRecordsViewer } from '@/components/healthcare'

const PatientRecords = () => (
  <PatientRecordsViewer
    patient={currentPatient}
    treatmentSessions={sessions}
    lgpdRecords={consentRecords}
    onUpdatePatient={handleUpdate}
    onExportData={handleExport}
    onRequestDataDeletion={handleDeletion}
  />
)
```

**Security Features:**
- Automatic sensitive data masking
- Audit logging for all data access
- LGPD-compliant export/deletion workflows
- Role-based access control

### 3. LGPDConsentManager (`LGPDConsentManager`)

Complete LGPD consent management system for Brazilian healthcare.

**Features:**
- Granular consent purposes
- Time-based validity controls
- Data retention preferences
- Automated audit trails
- Portuguese-optimized consent forms
- Electronic signature support

```tsx
import { LGPDConsentManager } from '@/components/healthcare'

const ConsentManagement = () => (
  <LGPDConsentManager
    patient={patient}
    consentRecords={records}
    onUpdateConsent={updateConsent}
    onGenerateReport={generateReport}
    onRequestRectification={requestRectification}
  />
)
```

**Consent Purposes:**
- Treatment execution (mandatory)
- Medical record keeping (mandatory)
- Communication (optional)
- Marketing (optional)
- Research (optional)

### 4. HealthcareDashboard (`HealthcareDashboard`)

Comprehensive clinic management dashboard with real-time metrics.

**Features:**
- Real-time clinic performance metrics
- Patient retention analytics
- Financial reporting with Brazilian Real (BRL)
- Treatment popularity tracking
- Emergency alert integration
- Mobile-responsive layout

```tsx
import { HealthcareDashboard } from '@/components/healthcare'

const ClinicDashboard = () => (
  <HealthcareDashboard
    patients={patientList}
    treatments={treatmentCatalog}
    sessions={scheduledSessions}
    onScheduleSession={scheduleNewSession}
    onPatientSelect={selectPatient}
    onEmergencyAlert={handleEmergency}
  />
)
```

**Metrics Include:**
- Patient acquisition and retention
- Session completion rates
- Revenue tracking and forecasting
- Treatment popularity analysis
- Staff performance metrics

### 5. EmergencyAlertSystem (`EmergencyAlertSystem`)

Comprehensive emergency management system for healthcare facilities.

**Features:**
- Multi-type emergency support (medical, facility, security)
- Automated emergency protocols
- Real-time alert broadcasting
- Evacuation mode management
- Emergency contact integration
- Audit trail for compliance

```tsx
import { EmergencyAlertSystem } from '@/components/healthcare'

const EmergencyManagement = () => (
  <EmergencyAlertSystem
    patients={allPatients}
    activeAlerts={currentAlerts}
    onCreateAlert={createNewAlert}
    onUpdateAlert={updateAlertStatus}
    onResolveAlert={resolveAlert}
    onContactEmergency={contactServices}
  />
)
```

**Emergency Types:**
- **Medical**: Adverse reactions, fainting, intense pain
- **Facility**: Fire, leaks, power outages
- **Security**: Threats, intrusions, safety risks

## 🎨 Design System

### Color Palette

Healthcare-optimized colors following Brazilian accessibility standards:

```css
/* Primary Healthcare Colors */
--healthcare-primary: #AC9469;     /* Golden Primary - Aesthetic Luxury */
--healthcare-deep-blue: #112031;     /* Professional Trust */
--healthcare-accent: #d2aa60ff;      /* Gold Accent */
--healthcare-neutral: #B4AC9C;        /* Calming Light Beige */
--healthcare-background: #D2D0C8;    /* Soft Gray Background */

/* Emergency Colors */
--emergency-critical: #dc2626;       /* Critical - Red */
--emergency-high: #ef4444;            /* High - Red-500 */
--emergency-medium: #f97316;          /* Medium - Orange */
--emergency-low: #eab308;             /* Low - Yellow */
```

### Typography

```css
/* Brazilian-optimized typography */
.healthcare-text {
  font-family: 'Inter', 'Roboto', sans-serif;
  line-height: 1.6;
}

.healthcare-header {
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--healthcare-deep-blue);
}

.healthcare-body {
  font-size: 1rem;
  color: var(--healthcare-neutral);
}
```

## 🔒 Security & Compliance

### LGPD Compliance

All components implement comprehensive LGPD (Lei Geral de Proteção de Dados) compliance:

- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Clear, specific data purposes
- **Consent Management**: Granular, revocable consent
- **Access Rights**: Patient data access, portability, deletion
- **Audit Logging**: Complete data access trails
- **Retention Policies**: Automated data lifecycle management

### Healthcare Standards

- **ANS 41**: Brazilian healthcare standards
- **LGPD**: Data protection compliance
- **HIPAA-Local**: Brazilian healthcare privacy
- **WCAG 2.1 AA+**: Accessibility compliance
- **ISO 27001**: Information security management

## 🏗️ Architecture

### Component Structure

```
src/components/healthcare/
├── treatment-scheduler.tsx      # Treatment scheduling interface
├── patient-records-viewer.tsx   # Patient records management
├── lgpd-consent-manager.tsx     # LGPD compliance system
├── healthcare-dashboard.tsx     # Clinic analytics dashboard
├── emergency-alert-system.tsx    # Emergency management
├── index.ts                     # Component exports
└── README.md                    # This documentation
```

### Type Safety

Comprehensive TypeScript interfaces for healthcare data:

```typescript
// Core healthcare types
interface PatientData {
  personalInfo: BrazilianPersonalInfo
  address: BrazilianAddress
  emergencyContact: EmergencyContact
  medicalHistory: MedicalHistory
  consent: LGPDConsent
  createdAt: string
  updatedAt: string
}

// Brazilian-specific types
interface BrazilianPersonalInfo {
  fullName: string
  cpf: string
  rg?: string
  dateOfBirth: string
  age: number
  gender: string
  email: string
  phone: string
  maritalStatus?: string
}
```

## 📱 Mobile Optimization

### Touch Targets

All interactive elements follow WCAG 2.1 AA+ touch target guidelines:

- **Minimum touch target**: 44px × 44px
- **Recommended touch target**: 56px × 56px
- **Spacing**: Minimum 8px between touch targets

### Responsive Design

Mobile-first responsive breakpoints:

```css
/* Mobile devices */
@media (max-width: 768px) {
  .healthcare-component {
    padding: 1rem;
    font-size: 0.875rem;
  }
}

/* Tablet devices */
@media (min-width: 769px) and (max-width: 1024px) {
  .healthcare-component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop devices */
@media (min-width: 1025px) {
  .healthcare-component {
    padding: 2rem;
    font-size: 1rem;
  }
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run component tests
npm test src/components/healthcare/

# Run accessibility tests
npm test:accessibility

# Run LGPD compliance tests
npm test:lgpd-compliance
```

### Integration Tests

```typescript
// Example integration test
describe('TreatmentScheduler', () => {
  it('should schedule treatment with LGPD compliance', async () => {
    const patient = mockPatient()
    const treatment = mockTreatment()
    
    render(
      <TreatmentScheduler
        patient={patient}
        treatments={[treatment]}
        availableSlots={mockSlots()}
        onSchedule={mockOnSchedule}
      />
    )
    
    // Test scheduling workflow
    await userEvent.click(screen.getByText('Agendar Tratamento'))
    
    expect(mockOnSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: patient.personalInfo.cpf,
        treatmentId: treatment.id,
        status: 'scheduled'
      })
    )
  })
})
```

## 🚀 Usage Examples

### Complete Clinic Management

```tsx
import { HealthcareComponents } from '@/components/healthcare'

const ClinicManagementSystem = () => {
  const [currentView, setCurrentView] = React.useState('dashboard')
  
  return (
    <div className="clinic-management">
      <nav>
        <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentView('scheduler')}>Agendar</button>
        <button onClick={() => setCurrentView('patients')}>Pacientes</button>
        <button onClick={() => setCurrentView('emergency')}>Emergência</button>
      </nav>
      
      {currentView === 'dashboard' && (
        <HealthcareComponents.Dashboard
          patients={patients}
          treatments={treatments}
          sessions={sessions}
          onScheduleSession={handleSchedule}
        />
      )}
      
      {currentView === 'scheduler' && (
        <HealthcareComponents.Scheduler
          patient={selectedPatient}
          treatments={treatments}
          availableSlots={availableSlots}
          onSchedule={handleSchedule}
        />
      )}
      
      {currentView === 'patients' && (
        <HealthcareComponents.PatientRecords
          patient={selectedPatient}
          treatmentSessions={sessions}
          lgpdRecords={consentRecords}
        />
      )}
      
      {currentView === 'emergency' && (
        <HealthcareComponents.EmergencySystem
          patients={patients}
          activeAlerts={alerts}
          onCreateAlert={createAlert}
        />
      )}
    </div>
  )
}
```

## 📚 API Reference

### Common Props

All healthcare components share common props for consistency:

```typescript
interface HealthcareComponentProps {
  className?: string
  healthcareContext?: 'medical' | 'emergency' | 'admin' | 'patient' | 'aesthetic'
  auditLog?: (action: string, details?: any) => void
  lgpdCompliant?: boolean
}
```

### Event Handlers

```typescript
// Common event handlers
type ScheduleHandler = (session: TreatmentSession) => void
type PatientHandler = (patient: PatientData) => void
type EmergencyHandler = (type: EmergencyType) => void
type LGPDHandler = (action: LGPDAction) => void
```

## 🔧 Customization

### Theming

```tsx
import { ThemeProvider } from '@/components/theme-provider'

const ThemedHealthcareApp = () => (
  <ThemeProvider
    theme="healthcare"
    colors={{
      primary: '#AC9469',
      secondary: '#112031',
      accent: '#d2aa60ff'
    }}
  >
    <HealthcareComponents.Dashboard {...props} />
  </ThemeProvider>
)
```

### Localization

```tsx
import { HealthcareLocalizationProvider } from '@/components/localization'

const LocalizedApp = () => (
  <HealthcareLocalizationProvider locale="pt-BR">
    <HealthcareComponents.PatientRecordsViewer {...props} />
  </HealthcareLocalizationProvider>
)
```

## 🐛 Troubleshooting

### Common Issues

**Problem**: Components not rendering
```typescript
// Solution: Check imports
import { TreatmentScheduler } from '@/components/healthcare'
// NOT: import { TreatmentScheduler } from '@/components/ui'
```

**Problem**: LGPD compliance errors
```typescript
// Solution: Ensure proper consent handling
const handleDataAccess = () => {
  if (!patient.consent.hasConsented) {
    showConsentRequired()
    return
  }
  // Proceed with data access
}
```

**Problem**: Accessibility violations
```typescript
// Solution: Use proper ARIA attributes
<button
  aria-label="Agendar tratamento"
  aria-describedby="treatment-description"
  role="button"
>
  Agendar
</button>
```

## 📝 Contributing

1. **LGPD Compliance**: All new components must be LGPD-compliant
2. **Accessibility**: WCAG 2.1 AA+ compliance required
3. **TypeScript**: Strict type checking enabled
4. **Testing**: Minimum 90% test coverage
5. **Documentation**: JSDoc comments for all public APIs

## 📄 License

This component library is part of the NeonPro aesthetic clinic management system and is subject to the same license terms.

## 🤝 Support

For support, questions, or feature requests:

1. **Documentation**: Check this README and inline code comments
2. **Type Definitions**: Review TypeScript interfaces in `/types/healthcare.ts`
3. **Examples**: See implementation in the main application
4. **Compliance**: Consult LGPD and healthcare regulation documentation

---

**Version**: 2.0.0  
**Last Updated**: September 2024  
**Framework**: React 18+ with TypeScript  
**Compatibility**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)