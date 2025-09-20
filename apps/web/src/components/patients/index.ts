/**
 * NeonPro Mobile-First Healthcare UI Components
 *
 * LGPD-compliant patient management interfaces for Brazilian aesthetic clinics
 * Built with shadcn/ui, React Hook Form, and Valibot validation
 *
 * Features:
 * - Mobile-first responsive design (70%+ smartphone usage in Brazil)
 * - LGPD compliance with progressive data disclosure
 * - Brazilian healthcare document validation (CPF, CNS, etc.)
 * - Touch-optimized interfaces (44px+ touch targets)
 * - Full accessibility support (WCAG 2.1 AA+)
 * - Healthcare error boundaries with audit logging
 * - Portuguese language interface
 */

// Core Patient Management Components
export { default as ConsentManagementDialog } from "./ConsentManagementDialog";
export { default as EnhancedPatientRegistrationForm } from "./EnhancedPatientRegistrationForm";
export { default as GlobalPatientSearch } from "./GlobalPatientSearch";
export { default as HealthcareSearch } from "./HealthcareSearch";
export { default as MobilePatientCard } from "./MobilePatientCard";
export { default as MobilePatientList } from "./MobilePatientList";

// Error Handling & Safety
export {
  PatientErrorBoundary as default,
  usePatientErrorHandler,
  withPatientErrorBoundary,
} from "./PatientErrorBoundary";

// Accessibility & Compliance
export {
  AccessibilityProvider,
  useAccessibility,
  useFocusManagement,
  useKeyboardNavigation,
  withAccessibility,
} from "./AccessibilityProvider";

// Brazilian Healthcare Validation
export {
  // TypeScript types
  type BasicPatient,
  // Validation schemas
  BasicPatientSchema,
  type BrazilianAddress,
  BrazilianAddressSchema,
  BrazilianPhoneSchema,
  BrazilianStateSchema,
  CepSchema,
  CnsSchema,
  type CompletePatientRegistration,
  CompletePatientRegistrationSchema,
  CpfSchema,
  type PatientConsent,
  PatientConsentSchema,
  validateBrazilianPhone,
  validateCns,
  // Validation functions
  validateCpf,
  validatePatientData,
} from "./validation/brazilian-healthcare-schemas";

// Component Props Types
export interface PatientComponentProps {
  userRole: "admin" | "aesthetician" | "coordinator";
  className?: string;
}

export interface MobilePatientData {
  id: string;
  name: string;
  maskedCpf: string;
  phone: string;
  email: string;
  birthDate: Date;
  status: "active" | "inactive" | "pending";
  lastVisit?: Date;
  consentStatus: "granted" | "pending" | "withdrawn";
  dataVisibilityLevel: "minimal" | "standard" | "full";
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  consentType:
    | "data_processing"
    | "marketing"
    | "third_party_sharing"
    | "research"
    | "telehealth";
  granted: boolean;
  purpose: string;
  dataCategories: string[];
  retentionPeriod: string;
  grantedAt?: Date;
  revokedAt?: Date;
  lastUpdated: Date;
  legalBasis:
    | "consent"
    | "legitimate_interest"
    | "legal_obligation"
    | "vital_interests";
  processingDetails?: string;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  cpf: string;
  cns?: string;
  rg?: string;
  phone: string;
  email: string;
  birthDate: Date;
  address: {
    city: string;
    state: string;
    zipCode: string;
  };
  status: "active" | "inactive" | "pending";
  lastVisit?: Date;
  consentStatus: "granted" | "pending" | "withdrawn";
  matchScore: number;
  matchReasons: string[];
}

// Utility functions for Brazilian formatting
export const formatters = {
  cpf: (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  cns: (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
  },

  phone: (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return value;
  },

  cep: (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  },
};

// Brazilian states list
export const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

// LGPD consent purposes for aesthetic clinics
export const LGPD_CONSENT_PURPOSES = {
  data_processing: {
    title: "Processamento de Dados Pessoais",
    description:
      "Coleta, armazenamento e processamento de dados pessoais para prestação de serviços estéticos",
    required: true,
  },
  marketing: {
    title: "Marketing e Comunicação",
    description:
      "Envio de materiais promocionais, novidades sobre tratamentos e ofertas especiais",
    required: false,
  },
  third_party_sharing: {
    title: "Compartilhamento com Terceiros",
    description:
      "Compartilhamento de dados com parceiros, laboratórios e fornecedores de equipamentos",
    required: false,
  },
  research: {
    title: "Pesquisa e Desenvolvimento",
    description:
      "Uso de dados anonimizados para pesquisas científicas e desenvolvimento de novos tratamentos",
    required: false,
  },
  telehealth: {
    title: "Telemedicina",
    description:
      "Consultas online, monitoramento remoto e acompanhamento de tratamentos à distância",
    required: false,
  },
} as const;

// Performance and accessibility standards
export const NEONPRO_STANDARDS = {
  performance: {
    LCP: "≤2.5s", // Largest Contentful Paint
    INP: "≤200ms", // Interaction to Next Paint
    CLS: "≤0.1", // Cumulative Layout Shift
    mobileLoadTime: "<2s on 3G networks",
    bundleSize: "<650kB initial bundle",
  },
  accessibility: {
    wcagLevel: "AA", // WCAG 2.1 AA minimum
    touchTargets: "≥44px for mobile",
    contrastRatio: "4.5:1 minimum",
    keyboardNavigation: "100% accessible",
    screenReaderSupport: "Complete ARIA implementation",
  },
  compliance: {
    lgpd: "100% compliance with progressive disclosure",
    anvisa: "Brazilian healthcare regulation compliance",
    cfm: "Medical council standards adherence",
    auditTrail: "Complete interaction logging",
  },
  mobile: {
    responsiveBreakpoints: "Mobile-first design approach",
    touchOptimization: "Gesture support and haptic feedback",
    offlineCapability: "PWA features for appointment booking",
    performanceTarget: "Optimized for 3G/4G networks",
  },
} as const;

/**
 * Usage Examples:
 *
 * ```tsx
 * import {
 *   MobilePatientList,
 *   MobilePatientCard,
 *   ConsentManagementDialog,
 *   HealthcareSearch,
 *   EnhancedPatientRegistrationForm,
 *   AccessibilityProvider,
 *   PatientErrorBoundary,
 *   validateCpf,
 *   formatters
 * } from '@/components/patients';
 *
 * // Wrap your app with providers
 * function App() {
 *   return (
 *     <AccessibilityProvider>
 *       <PatientErrorBoundary>
 *         <PatientManagement />
 *       </PatientErrorBoundary>
 *     </AccessibilityProvider>
 *   );
 * }
 *
 * // Use mobile-first patient list
 * function PatientManagement() {
 *   const [patients, setPatients] = useState<MobilePatientData[]>([]);
 *
 *   return (
 *     <MobilePatientList
 *       patients={patients}
 *       onPatientSelect={(id) => console.log('Selected:', id)}
 *       userRole="aesthetician"
 *     />
 *   );
 * }
 *
 * // Validate Brazilian documents
 * const isValidCpf = validateCpf('123.456.789-00');
 * const formattedPhone = formatters.phone('11999999999');
 * ```
 */

export default {
  components: {
    MobilePatientList,
    MobilePatientCard,
    HealthcareSearch,
    ConsentManagementDialog,
    EnhancedPatientRegistrationForm,
    PatientErrorBoundary,
    AccessibilityProvider,
  },
  validation: {
    validateCpf,
    validateCns,
    validateBrazilianPhone,
    validatePatientData,
  },
  formatters,
  constants: {
    BRAZILIAN_STATES,
    LGPD_CONSENT_PURPOSES,
    NEONPRO_STANDARDS,
  },
};
