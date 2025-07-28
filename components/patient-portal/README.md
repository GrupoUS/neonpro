# Patient Portal Components Documentation
## NeonPro Healthcare System - Brazilian LGPD Compliant

> **🏥 Healthcare-First Design**: Components specifically designed for Brazilian aesthetic clinics with LGPD, ANVISA, and CFM compliance built-in.

---

## 📋 **Component Overview**

### **Core Components**
| Component | Purpose | Compliance | Mobile-First |
|-----------|---------|------------|--------------|
| `portal-layout.tsx` | Main layout wrapper | ✅ LGPD | ✅ Responsive |
| `patient-dashboard.tsx` | Patient overview | ✅ All Standards | ✅ Mobile-First |
| `self-booking.tsx` | Appointment booking | ✅ CFM/ANVISA | ✅ Touch-Optimized |
| `treatment-history.tsx` | Medical records | ✅ Medical Privacy | ✅ Timeline UI |
| `profile-management.tsx` | Account settings | ✅ LGPD Rights | ✅ Form Responsive |
| `document-center.tsx` | File management | ✅ Document Security | ✅ List/Grid Hybrid |
| `consent-preferences.tsx` | LGPD consent | ✅ Legal Compliance | ✅ Clear Toggles |
| `notification-settings.tsx` | Communication | ✅ Marketing Consent | ✅ Settings UI |

### **Supporting Files**
| File | Purpose | Integration |
|------|---------|-------------|
| `use-patient-auth.ts` | Authentication hook | Supabase + LGPD |
| `use-patient-data.ts` | Data management hook | Patient records |
| `loading-spinner.tsx` | Loading states | Consistent UX |
| `accessibility-validation-report.md` | WCAG compliance | Testing guide |

---

## 🚀 **Quick Start Guide**

### **1. Installation & Setup**
```bash
# Install required dependencies
npm install @supabase/supabase-js
npm install react-hook-form @hookform/resolvers
npm install zod date-fns
npm install lucide-react

# Ensure shadcn/ui components are installed
npx shadcn-ui@latest add card button input textarea
npx shadcn-ui@latest add avatar badge progress separator
npx shadcn-ui@latest add switch select alert dialog
```

### **2. Environment Configuration**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Brazilian healthcare compliance
NEXT_PUBLIC_LGPD_COMPLIANCE_MODE=true
NEXT_PUBLIC_CFM_TELEMEDICINE_ENABLED=true
NEXT_PUBLIC_ANVISA_DEVICE_TRACKING=true
```

### **3. Basic Implementation**
```tsx
// app/patient-portal/page.tsx
import PatientDashboard from '@/components/patient-portal/patient-dashboard'
import PortalLayout from '@/components/patient-portal/portal-layout'

export default function PatientPortalPage() {
  return (
    <PortalLayout>
      <PatientDashboard />
    </PortalLayout>
  )
}
```

---

## 🏗️ **Architecture & Design Patterns**

### **Component Architecture**
```
app/patient-portal/
├── page.tsx                    # Main entry point
└── components/patient-portal/
    ├── portal-layout.tsx       # Layout wrapper
    ├── patient-dashboard.tsx   # Dashboard view
    ├── self-booking.tsx        # Appointment booking
    ├── treatment-history.tsx   # Medical history
    ├── profile-management.tsx  # Account settings
    ├── document-center.tsx     # File management
    ├── consent-preferences.tsx # LGPD compliance
    └── notification-settings.tsx # Communication prefs
```

### **Responsive Design Pattern**
All components follow the mobile-first responsive pattern:

```css
/* Standard responsive grid pattern used throughout */
.responsive-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

.responsive-flex {  
  @apply flex flex-col md:flex-row;
}

/* Touch-optimized buttons for mobile */
.mobile-touch-target {
  @apply min-h-[44px] min-w-[44px];
}
```

### **State Management Pattern**
```tsx
// Consistent state management across components
const [loading, setLoading] = useState(false)
const [data, setData] = useState<DataType[]>([])
const [error, setError] = useState<string | null>(null)

// LGPD compliance tracking
const [consentGiven, setConsentGiven] = useState(false)
const [dataAccessLog, setDataAccessLog] = useState<AccessLog[]>([])
```

---

## 📱 **Mobile-First Implementation**

### **Responsive Breakpoints**
```css
/* Mobile-first breakpoint strategy */
/* Mobile: 0px - 767px (base styles) */
/* Tablet: 768px+ (md:) */  
/* Desktop: 1024px+ (lg:) */
/* Large: 1280px+ (xl:) */
```

### **Mobile-Optimized Components**

#### **Patient Dashboard**
- ✅ Collapsible cards for small screens
- ✅ Swipeable appointment carousel
- ✅ Touch-optimized quick actions
- ✅ Progressive disclosure of information

#### **Self-Booking System**
- ✅ Step-by-step wizard for mobile
- ✅ Large touch targets for time selection
- ✅ Gesture-friendly calendar navigation
- ✅ Mobile-optimized form validation

#### **Document Center**
- ✅ List view for mobile, grid for desktop
- ✅ Swipe gestures for document actions
- ✅ Mobile-friendly preview modal
- ✅ Touch-optimized download buttons

---

## 🏥 **Healthcare Compliance Features**

### **LGPD (Lei Geral de Proteção de Dados)**

#### **Consent Management**
```tsx
// Built-in LGPD consent tracking
interface LGPDConsent {
  marketing: boolean
  whatsapp: boolean
  research: boolean
  photography: boolean
  grantedAt: Date
  ipAddress: string
  userAgent: string
}
```

#### **Data Rights Implementation**
- ✅ **Right to Access**: Complete data export functionality
- ✅ **Right to Correction**: Profile editing with audit trail
- ✅ **Right to Deletion**: Data removal requests
- ✅ **Right to Portability**: Structured data export
- ✅ **Data Processing Transparency**: Clear usage explanations

### **CFM (Conselho Federal de Medicina)**

#### **Telemedicine Compliance**
- ✅ Patient identification verification
- ✅ Secure medical data transmission
- ✅ Digital consent for teleconsultations
- ✅ Medical record integrity maintenance

#### **Medical Documentation**
```tsx
// CFM-compliant medical record structure
interface MedicalRecord {
  patientId: string
  professionalCRM: string
  treatmentDate: Date
  procedures: Procedure[]
  digitalSignature: string
  cfmCompliant: true
}
```

### **ANVISA Compliance**

#### **Medical Device Integration**
- ✅ Device tracking and registration
- ✅ Adverse event reporting
- ✅ Equipment maintenance logs
- ✅ Regulatory compliance monitoring

---

## 🎨 **UI/UX Design System**

### **Color Palette**
```css
/* Healthcare-optimized color system */
:root {
  --medical-primary: #3b82f6;      /* Professional blue */
  --medical-success: #10b981;      /* Treatment success */
  --medical-warning: #f59e0b;      /* Caution/attention */
  --medical-danger: #ef4444;       /* Emergency/critical */
  --wellness-accent: #8b5cf6;      /* Wellness/beauty */
  --lgpd-compliant: #6366f1;       /* LGPD indicators */
}
```

### **Typography Scale**
```css
/* Healthcare-readable typography */
.medical-heading-1 { @apply text-3xl font-bold tracking-tight; }
.medical-heading-2 { @apply text-2xl font-semibold; }
.medical-heading-3 { @apply text-xl font-medium; }
.medical-body { @apply text-base leading-relaxed; }
.medical-small { @apply text-sm text-muted-foreground; }
```

### **Component Variants**
```tsx
// Medical-specific component styling
<Card className="medical-card"> // Enhanced shadow and border
<Button className="medical-primary"> // Healthcare blue theme
<Badge className="lgpd-compliant"> // LGPD compliance indicator
<Alert className="medical-warning"> // Healthcare alert styling
```

---

## 🔧 **API Integration**

### **Supabase Database Schema**
```sql
-- Patient portal required tables
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  avatar_url VARCHAR,
  lgpd_consent JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  professional_id UUID,
  service_type VARCHAR NOT NULL,
  appointment_date TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'pending',
  cfm_compliant BOOLEAN DEFAULT true
);

CREATE TABLE treatment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  treatment_date TIMESTAMP NOT NULL,
  procedure_name VARCHAR NOT NULL,
  professional_crm VARCHAR,
  anvisa_device_id VARCHAR,
  progress_photos JSONB DEFAULT '[]'
);
```

### **Authentication Hook Usage**
```tsx
// Use patient authentication
import { usePatientAuth } from '@/lib/hooks/use-patient-auth'

function MyComponent() {
  const { patient, loading, signIn, signOut, updateProfile } = usePatientAuth()
  
  if (loading) return <LoadingSpinner />
  if (!patient) return <LoginForm onSignIn={signIn} />
  
  return <PatientDashboard patient={patient} />
}
```

### **Data Management Hook Usage**
```tsx
// Use patient data management
import { usePatientData } from '@/lib/hooks/use-patient-data'

function TreatmentHistory() {
  const { 
    treatments, 
    appointments, 
    documents,
    loading,
    error,
    refreshData 
  } = usePatientData()
  
  return (
    <div>
      {treatments.map(treatment => (
        <TreatmentCard key={treatment.id} treatment={treatment} />
      ))}
    </div>
  )
}
```

---

## 🧪 **Testing & Quality Assurance**

### **Component Testing**
```tsx
// Example test structure
import { render, screen } from '@testing-library/react'
import { PatientDashboard } from './patient-dashboard'

describe('PatientDashboard', () => {
  it('displays patient information correctly', () => {
    render(<PatientDashboard patient={mockPatient} />)
    expect(screen.getByText('Bem-vindo')).toBeInTheDocument()
  })
  
  it('meets WCAG 2.1 AA accessibility standards', async () => {
    const { container } = render(<PatientDashboard patient={mockPatient} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### **LGPD Compliance Testing**
```tsx
// Test LGPD consent mechanisms
describe('LGPD Compliance', () => {
  it('records consent properly', () => {
    const consentData = recordConsent({
      type: 'marketing',
      granted: true,
      timestamp: new Date(),
      ipAddress: '192.168.1.1'
    })
    
    expect(consentData.lgpdCompliant).toBe(true)
  })
})
```

### **Mobile Responsiveness Testing**
```tsx
// Test responsive behavior
describe('Mobile Responsiveness', () => {
  it('adapts to mobile viewport', () => {
    global.innerWidth = 375
    global.innerHeight = 667
    
    render(<PatientDashboard />)
    expect(screen.getByTestId('mobile-layout')).toBeVisible()
  })
})
```

---

## 📈 **Performance Optimization**

### **Loading Strategies**
```tsx
// Implemented loading patterns
- Skeleton loading for dashboard cards
- Progressive image loading for avatars
- Lazy loading for treatment history
- Suspense boundaries for async components
```

### **Caching & Optimization**
```tsx
// Data caching strategy
const { data: treatments } = useSWR(
  `/api/patients/${patientId}/treatments`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutes
  }
)
```

---

## 🔒 **Security Considerations**

### **Data Protection**
- ✅ All patient data encrypted at rest
- ✅ HTTPS-only communication
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Audit logging for all data access

### **LGPD Security**
```tsx
// Security headers for LGPD compliance
headers: {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

---

## 🚀 **Deployment & Production**

### **Environment Setup**
```bash
# Production deployment checklist
□ LGPD compliance review completed
□ CFM medical standards verified  
□ ANVISA device integrations tested
□ Accessibility audit passed (WCAG 2.1 AA)
□ Mobile responsiveness validated
□ Security penetration testing completed
□ Performance benchmarks met
□ Brazilian healthcare legal review approved
```

### **Monitoring & Analytics**
```tsx
// Healthcare-specific monitoring
- Patient portal usage analytics
- LGPD consent tracking
- Medical appointment completion rates
- Treatment progress monitoring
- Security incident logging
- Performance metrics tracking
```

---

## 📞 **Support & Maintenance**

### **Technical Support**
- **Email**: dev@neonpro.com.br
- **Documentation**: Available in `/docs` directory
- **Issue Tracking**: GitHub Issues
- **Compliance Questions**: compliance@neonpro.com.br

### **Update Schedule**
- **Security Updates**: Immediate
- **LGPD Compliance Updates**: As legislation changes
- **Feature Updates**: Monthly release cycle
- **Healthcare Standard Updates**: As required by CFM/ANVISA

---

## 📚 **Additional Resources**

### **Brazilian Healthcare Compliance**
- [LGPD Official Guide](https://www.gov.br/anpd/pt-br)
- [CFM Telemedicine Resolution](https://www.cfm.org.br/)
- [ANVISA Medical Device Regulations](https://www.gov.br/anvisa/pt-br)

### **Accessibility Resources**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Brazilian Digital Government Accessibility](https://www.gov.br/governodigital/pt-br/acessibilidade-digital)

### **Technical Documentation**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)

---

**Documentation Version**: 1.0  
**Last Updated**: January 2025  
**Compliance Standards**: LGPD + CFM + ANVISA + WCAG 2.1 AA  
**Framework**: Next.js 15 + React 19 + TypeScript 5.6+

> **⚕️ Healthcare Notice**: These components are designed for Brazilian healthcare applications and include specific compliance features for LGPD, CFM, and ANVISA requirements. Always consult with legal and medical compliance experts before deployment in production healthcare environments.