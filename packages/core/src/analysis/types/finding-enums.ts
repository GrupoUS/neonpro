// Enums and type definitions for findings and analysis
// Healthcare compliance focused for Brazilian aesthetic clinics

export enum FindingType {
  CODE_DUPLICATION = 'CODE_DUPLICATION',
  ARCHITECTURAL_VIOLATION = 'ARCHITECTURAL_VIOLATION',
  PERFORMANCE_ISSUE = 'PERFORMANCE_ISSUE',
  TYPE_SAFETY_ISSUE = 'TYPE_SAFETY_ISSUE',
  DEPENDENCY_ISSUE = 'DEPENDENCY_ISSUE',
  ORGANIZATIONAL_ISSUE = 'ORGANIZATIONAL_ISSUE',
  SECURITY_VULNERABILITY = 'SECURITY_VULNERABILITY',
  HEALTHCARE_COMPLIANCE = 'HEALTHCARE_COMPLIANCE',
  LGPD_VIOLATION = 'LGPD_VIOLATION',
  ANVISA_VIOLATION = 'ANVISA_VIOLATION',
  PROFESSIONAL_COUNCIL_VIOLATION = 'PROFESSIONAL_COUNCIL_VIOLATION',
  PATIENT_DATA_VIOLATION = 'PATIENT_DATA_VIOLATION',
  CLINICAL_SAFETY_ISSUE = 'CLINICAL_SAFETY_ISSUE',
  ACCESSIBILITY_VIOLATION = 'ACCESSIBILITY_VIOLATION'
}

export enum SeverityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ViolatedPrinciple {
  SINGLE_RESPONSIBILITY = 'SINGLE_RESPONSIBILITY',
  OPEN_CLOSED = 'OPEN_CLOSED',
  LISKOV_SUBSTITUTION = 'LISKOV_SUBSTITUTION',
  INTERFACE_SEGREGATION = 'INTERFACE_SEGREGATION',
  DEPENDENCY_INVERSION = 'DEPENDENCY_INVERSION',
  DRY_PRINCIPLE = 'DRY_PRINCIPLE',
  SEPARATION_OF_CONCERNS = 'SEPARATION_OF_CONCERNS'
}

export enum ComplianceRegulation {
  LGPD = 'LGPD',
  ANVISA = 'ANVISA',
  CFM = 'CFM',  // Conselho Federal de Medicina
  COREN = 'COREN',  // Conselho Regional de Enfermagem
  CFO = 'CFO',  // Conselho Federal de Odontologia
  CNO = 'CNO',  // Conselho de Odontologia
  CNEP = 'CNEP'  // Cadastro Nacional de Estabelecimentos de Saúde
}

export enum HealthcareDomain {
  PATIENT_MANAGEMENT = 'PATIENT_MANAGEMENT',
  CLINICAL_WORKFLOW = 'CLINICAL_WORKFLOW',
  TREATMENT_PLANNING = 'TREATMENT_PLANNING',
  APPOINTMENT_SCHEDULING = 'APPOINTMENT_SCHEDULING',
  BILLING_AND_FINANCE = 'BILLING_AND_FINANCE',
  INVENTORY_MANAGEMENT = 'INVENTORY_MANAGEMENT',
  STAFF_MANAGEMENT = 'STAFF_MANAGEMENT',
  COMPLIANCE_AND_AUDIT = 'COMPLIANCE_AND_AUDIT',
  REPORTING_AND_ANALYTICS = 'REPORTING_AND_ANALYTICS',
  COMMUNICATION_AND_NOTIFICATIONS = 'COMMUNICATION_AND_NOTIFICATIONS'
}

export enum PatientDataCategory {
  PERSONAL_DATA = 'PERSONAL_DATA',
  HEALTH_DATA = 'HEALTH_DATA',
  FINANCIAL_DATA = 'FINANCIAL_DATA',
  TREATMENT_DATA = 'TREATMENT_DATA',
  APPOINTMENT_DATA = 'APPOINTMENT_DATA',
  PAYMENT_DATA = 'PAYMENT_DATA',
  CONSENT_DATA = 'CONSENT_DATA',
  AUDIT_DATA = 'AUDIT_DATA'
}

export enum SecurityRiskLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum PerformanceImpact {
  NONE = 'NONE',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  SIGNIFICANT = 'SIGNIFICANT',
  CRITICAL = 'CRITICAL'
}

export enum MobilePerformanceTier {
  EXCELLENT = 'EXCELLENT',  // <2s on 3G
  GOOD = 'GOOD',          // 2-4s on 3G
  ACCEPTABLE = 'ACCEPTABLE', // 4-6s on 3G
  POOR = 'POOR',         // >6s on 3G
  VERY_POOR = 'VERY_POOR' // >10s on 3G
}

export enum AccessibilityCompliance {
  FULLY_COMPLIANT = 'FULLY_COMPLIANT',     // WCAG 2.1 AA+
  MOSTLY_COMPLIANT = 'MOSTLY_COMPLIANT',   // Minor violations
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT', // Significant violations
  NON_COMPLIANT = 'NON_COMPLIANT'        // Major violations
}

// Finding severity mapping
export const SEVERITY_WEIGHTS = {
  [SeverityLevel.CRITICAL]: 100,
  [SeverityLevel.HIGH]: 75,
  [SeverityLevel.MEDIUM]: 50,
  [SeverityLevel.LOW]: 25,
} as const;

// Healthcare compliance requirements
export const HEALTHCARE_COMPLIANCE_REQUIREMENTS = {
  [ComplianceRegulation.LGDP]: {
    description: 'Lei Geral de Proteção de Dados Pessoais',
    keyRequirements: [
      'Explicit consent for data processing',
      'Data minimization principle',
      'Purpose limitation',
      'Data retention policies',
      'Security measures implementation',
      'Data breach notification procedures',
      'International data transfer controls'
    ],
    penalties: 'Up to 50 million BRL or 2% of global revenue',
    enforcementAgency: 'ANPD (Autoridade Nacional de Proteção de Dados)'
  },
  [ComplianceRegulation.ANVISA]: {
    description: 'Agência Nacional de Vigilância Sanitária',
    keyRequirements: [
      'Medical device safety and efficacy',
      'Clinical trial protocols and reporting',
      'Good manufacturing practices',
      'Post-market surveillance',
      'Adverse event reporting',
      'Quality management systems'
    ],
    penalties: 'Fines, product suspension, facility closure',
    enforcementAgency: 'ANVISA (Agência Nacional de Vigilância Sanitária)'
  },
  [ComplianceRegulation.CFM]: {
    description: 'Conselho Federal de Medicina',
    keyRequirements: [
      'Medical ethics compliance',
      'Professional conduct standards',
      'Patient safety protocols',
      'Medical record documentation',
      'Continuing education requirements',
      'Advertising regulations'
    ],
    penalties: 'Warning, suspension, revocation of medical license',
    enforcementAgency: 'CFM (Conselho Federal de Medicina)'
  },
  [ComplianceRegulation.COREN]: {
    description: 'Conselho Regional de Enfermagem',
    keyRequirements: [
      'Nursing ethics compliance',
      'Professional responsibility',
      'Patient care standards',
      'Documentation requirements',
      'Team collaboration protocols',
      'Continuing competence'
    ],
    penalties: 'Warning, suspension, revocation of nursing license',
    enforcementAgency: 'COREN (Conselho Regional de Enfermagem)'
  }
} as const;

// Brazilian healthcare terminology
export const BRAZILIAN_HEALTHCARE_TERMINOLOGY = {
  patientTerms: [
    'paciente', 'cliente', 'usuário', 'assistido',
    'prontuário', 'ficha', 'registro', 'histórico'
  ],
  clinicalTerms: [
    'consulta', 'avaliação', 'diagnóstico', 'tratamento',
    'procedimento', 'cirurgia', 'terapia', 'reabilitação'
  ],
  administrativeTerms: [
    'agendamento', 'marcação', 'cancelamento', 'remarcação',
    'cobrança', 'pagamento', 'fatura', 'recibo'
  ],
  medicalSpecialties: [
    'dermatologia', 'plástica', 'estética', 'cosmética',
    'clínico geral', 'cirurgião plástico', 'dermatologista'
  ]
} as const;

// Portuguese language patterns for analysis
export const PORTUGUESE_LANGUAGE_PATTERNS = {
  patientData: [
    'dados do paciente', 'informações do paciente',
    'prontuário médico', 'histórico clínico',
    'dados pessoais', 'informações de saúde'
  ],
  clinicalProcedures: [
    'procedimento estético', 'tratamento cosmético',
    'aplicação', 'injeção', 'laser', 'peeling'
  ],
  administrativeActions: [
    'agendar consulta', 'marcar horário',
    'confirmar atendimento', 'cancelar agendamento'
  ],
  complianceTerms: [
    'consentimento informado', 'termo de consentimento',
    'política de privacidade', 'lei de proteção de dados'
  ]
} as const;

// Security vulnerability types for healthcare
export const HEALTHCARE_SECURITY_VULNERABILITIES = {
  dataBreaches: {
    patterns: ['sql injection', 'data leak', 'unauthorized access'],
    impact: 'Exposure of patient health information',
    severity: 'CRITICAL'
  },
  authenticationIssues: {
    patterns: ['weak passwords', 'session hijacking', 'credential theft'],
    impact: 'Unauthorized access to patient records',
    severity: 'HIGH'
  },
  encryptionIssues: {
    patterns: ['weak encryption', 'missing encryption', 'plaintext data'],
    impact: 'Patient data exposure in transit or at rest',
    severity: 'HIGH'
  },
  accessControlIssues: {
    patterns: ['privilege escalation', 'broken access control'],
    impact: 'Unauthorized access to sensitive healthcare data',
    severity: 'HIGH'
  },
  loggingIssues: {
    patterns: ['missing audit logs', 'insufficient logging'],
    impact: 'Lack of healthcare compliance audit trail',
    severity: 'MEDIUM'
  }
} as const;

// Performance thresholds for healthcare applications
export const HEALTHCARE_PERFORMANCE_THRESHOLDS = {
  loadTime: {
    excellent: 2000,    // 2s
    good: 3000,          // 3s
    acceptable: 5000,    // 5s
    poor: 8000,          // 8s
    veryPoor: 10000      // 10s
  },
  bundleSize: {
    excellent: 500,     // 500KB
    good: 750,           // 750KB
    acceptable: 1000,     // 1MB
    poor: 1500,          // 1.5MB
    veryPoor: 2000       // 2MB
  },
  memoryUsage: {
    excellent: 100,     // 100MB
    good: 150,           // 150MB
    acceptable: 200,     // 200MB
    poor: 300,           // 300MB
    veryPoor: 500        // 500MB
  }
} as const;

// Accessibility requirements for Brazilian healthcare
export const HEALTHCARE_ACCESSIBILITY_REQUIREMENTS = {
  visual: [
    'WCAG 2.1 AA+ compliance',
    'High contrast mode support',
    'Screen reader compatibility',
    'Font size scaling (200%)',
    'Keyboard navigation support'
  ],
  motor: [
    '44px minimum touch target size',
    'Keyboard-only navigation',
    'Voice control support',
    'Reduced motion options',
    'Alternative input methods'
  ],
  cognitive: [
    'Clear language and instructions',
    'Consistent navigation patterns',
    'Error prevention and clear error messages',
    'Time limits for user input',
    'Help and documentation availability'
  ],
  language: [
    'Portuguese (Brazil) support',
    'Clear medical terminology',
    'Plain language explanations',
    'Cultural adaptation',
    'Regional variations support'
  ]
} as const;