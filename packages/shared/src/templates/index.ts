/**
 * Healthcare Implementation Templates
 * Standardized patterns for AI agents implementing healthcare features
 * with Brazilian regulatory compliance and LGPD audit logging.
 */

// Core templates
export {
  createHealthcareFeature,
  HealthcareFeaturePresets,
  HealthcareFeatureTemplate,
} from './healthcare-feature-template'

export type {
  AuditMetadata,
  FeatureConfigType,
  FeaturePresetKey,
  HealthcareContext,
  HealthcareFeatureConfig,
  HealthcarePatient,
  HealthcarePatientSchema,
} from './healthcare-feature-template'

export {
  BrazilianHealthcareSchemas,
  createHealthcareApi,
  HealthcareApiTemplate,
} from './healthcare-api-template'

export type {
  HealthcareApiResponse,
  HealthcareErrorCode,
  HealthcareErrorCodes,
  PaginatedResponse,
  PaginationParams,
} from './healthcare-api-template'

export {
  BrazilianHealthcareFields,
  createHealthcareComponent,
  createHealthcareComponentWithPreset,
  HealthcareComponentPresets,
  HealthcareComponentTemplate,
} from './healthcare-component-template'

export type {
  ComponentPresetKey,
  HealthcareComponentActions,
  HealthcareComponentConfig,
  HealthcareComponentProps,
  HealthcareComponentState,
  ValidationState,
} from './healthcare-component-template'

// Template usage patterns for AI agents
export const TemplatePatternsGuide = {
  /**
   * Quick Start Guide for AI Agents
   *
   * 1. Backend Feature Implementation:
   *    - Import HealthcareFeatureTemplate
   *    - Extend the template class
   *    - Implement abstract methods (validateCreateInput, performCreate, etc.)
   *    - Use HealthcareFeaturePresets for common configurations
   *
   * 2. API Endpoint Implementation:
   *    - Import createHealthcareApi helper function
   *    - Provide a feature instance and list handler
   *    - The template handles all CRUD operations automatically
   *    - Add custom routes using addCustomRoute if needed
   *
   * 3. React Component Implementation:
   *    - Import createHealthcareComponent helper function
   *    - Provide loadData and renderContent functions
   *    - Template handles LGPD consent, loading states, and errors
   *    - Use HealthcareComponentPresets for common configurations
   */

  examples: {
    // Example: Patient feature implementation
    patientFeature: `
      import { HealthcareFeatureTemplate, HealthcareFeaturePresets } from '@neonpro/shared/templates';
      
      class PatientFeature extends HealthcareFeatureTemplate<Patient, CreatePatientInput, UpdatePatientInput> {
        constructor() {
          super(HealthcareFeaturePresets.PatientData);
        }
        
        async validateCreateInput(input: CreatePatientInput) {
          return HealthcarePatientSchema.safeParse(input);
        }
        
        async performCreate(input: CreatePatientInput, context: HealthcareContext) {
          // Implementation with automatic encryption, audit logging, and compliance
          const encryptedCPF = await this.encryptSensitiveData(input.cpf, input.id);
          // ... create patient logic
        }
        
        // ... implement other abstract methods
      }
    `,

    // Example: Patient API implementation
    patientApi: `
      import { createHealthcareApi } from '@neonpro/shared/templates';
      
      const patientFeature = new PatientFeature();
      
      const patientApi = createHealthcareApi(
        '/patients',
        patientFeature,
        async (context, pagination) => {
          // List patients with pagination
          return await patientService.list(context, pagination);
        },
        { enableHealthCheck: true }
      );
    `,

    // Example: Patient component implementation
    patientComponent: `
      import { createHealthcareComponentWithPreset } from '@neonpro/shared/templates';
      
      export const PatientProfile = createHealthcareComponentWithPreset(
        'PatientProfile',
        {
          loadData: async () => {
            return await patientApi.get(patientId);
          },
          
          validateData: (patient) => {
            return patient && patient.id && patient.cpf;
          },
          
          renderContent: (patient, actions) => (
            <div>
              <h1>{patient.fullName}</h1>
              <p>CPF: {patient.cpf}</p>
              {/* Component automatically handles LGPD consent and professional license checks */}
              <button onClick={actions.refresh}>Atualizar</button>
            </div>
          )
        }
      );
    `,
  },

  // Brazilian healthcare compliance checklist
  complianceChecklist: {
    lgpd: [
      'LGPD consent checking implemented',
      'Data encryption for sensitive information',
      'Audit logging for all data access',
      'User consent withdrawal handling',
      'Data retention policy compliance',
    ],

    healthcareRegulation: [
      'Professional license validation (CRM/CRF/CREFITO)',
      'Emergency access controls with justification',
      'Patient data access restrictions',
      'Medical record confidentiality',
      'Brazilian healthcare data format validation',
    ],

    accessibility: [
      'WCAG 2.1 AA compliance minimum',
      'Portuguese language support',
      'Screen reader compatibility',
      'Keyboard navigation support',
      'High contrast mode support',
    ],
  },

  // Common error patterns and solutions
  troubleshooting: {
    'Professional license required': 'User role is physician but no professionalLicense in context',
    'LGPD consent required': 'Feature requires consent but lgpdConsent is false in context',
    'Emergency access denied': 'Emergency access requested but allowsEmergencyAccess is false',
    'Encryption failed': 'Check encryption keys and patient ID for data encryption',
    'Validation failed': 'Input data does not match Brazilian healthcare format requirements',
  },
}

// AI Prompt Templates
export * from './ai-prompt-templates'
export * from './lgpd-compliance-templates'
export * from './template-manager'

// Common types are already exported above - no need to re-export

// Version and metadata
export const TEMPLATES_VERSION = '1.0.0'
export const TEMPLATES_COMPATIBILITY = {
  nextjs: '>=15.0.0',
  react: '>=19.0.0',
  typescript: '>=5.6.0',
  hono: '>=4.0.0',
  zod: '>=3.0.0',
}

export const BRAZILIAN_HEALTHCARE_STANDARDS = {
  cpfFormat: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  phoneFormat: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  cepFormat: /^\d{5}-\d{3}$/,
  crmFormat: /^\d{4,6}\/[A-Z]{2}$/,
  crfFormat: /^\d{4,6}-[A-Z]{2}$/,
  crefitoFormat: /^\d{5,6}-F$/,
  supportedStates: [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ],
}
