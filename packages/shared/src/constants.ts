// Healthcare platform constants
export const HEALTHCARE_CONSTANTS = {
  // Brazilian healthcare system
  BRAZIL: {
    CPF_LENGTH: 11,
    CEP_LENGTH: 8,
    CRM_PATTERN: /^\d{4,6}\/[A-Z]{2}$/,
    COREN_PATTERN: /^\d{6}\/[A-Z]{2}$/,
  },
  
  // LGPD compliance
  LGPD: {
    CONSENT_VERSION: '1.0',
    DEFAULT_RETENTION_DAYS: 2555, // ~7 years for medical records
    MINOR_AGE_THRESHOLD: 18,
    DATA_CATEGORIES: [
      'medical',
      'personal', 
      'administrative',
      'financial'
    ] as const,
  },
  
  // ANVISA compliance
  ANVISA: {
    DEVICE_CLASSES: ['I', 'II', 'III', 'IV'] as const,
    REGISTRATION_PATTERN: /^\d{13}$/,
  },
  
  // CFM (Medical Council) compliance
  CFM: {
    TELEMEDICINE_RULES: {
      MIN_DURATION_MINUTES: 15,
      MAX_DURATION_HOURS: 2,
      RECORD_RETENTION_YEARS: 20,
    },
    PROFESSIONAL_CATEGORIES: [
      'medico',
      'enfermeiro',
      'fisioterapeuta',
      'psicologo',
      'nutricionista'
    ] as const,
  },
  
  // Application limits
  LIMITS: {
    MAX_FILE_SIZE_MB: 10,
    MAX_UPLOAD_FILES: 5,
    MAX_SEARCH_RESULTS: 100,
    SESSION_TIMEOUT_MINUTES: 30,
    PASSWORD_MIN_LENGTH: 8,
  },
  
  // Date formats
  DATE_FORMATS: {
    BR_DATE: 'dd/MM/yyyy',
    BR_DATETIME: 'dd/MM/yyyy HH:mm',
    ISO_DATE: 'yyyy-MM-dd',
    ISO_DATETIME: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
  },
  
  // API configuration
  API: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    TIMEOUT_MS: 30000,
    RETRY_ATTEMPTS: 3,
  },
  
  // UI constants
  UI: {
    BREAKPOINTS: {
      SM: 640,
      MD: 768, 
      LG: 1024,
      XL: 1280,
      '2XL': 1536,
    },
    DEBOUNCE_MS: 300,
    TOAST_DURATION_MS: 5000,
  },
} as const;

// Status options
export const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'pending', label: 'Pendente' },
  { value: 'archived', label: 'Arquivado' },
] as const;

// Priority options
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa', color: 'green' },
  { value: 'medium', label: 'Média', color: 'yellow' },
  { value: 'high', label: 'Alta', color: 'orange' },
  { value: 'urgent', label: 'Urgente', color: 'red' },
] as const;

// Brazilian states
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
] as const;

// Error codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  INSUFFICIENT_PERMISSIONS: 'AUTH_003',
  
  // Validation
  INVALID_CPF: 'VAL_001',
  INVALID_EMAIL: 'VAL_002',
  REQUIRED_FIELD: 'VAL_003',
  INVALID_DATE: 'VAL_004',
  
  // LGPD
  CONSENT_REQUIRED: 'LGPD_001',
  DATA_RETENTION_EXPIRED: 'LGPD_002',
  UNAUTHORIZED_DATA_ACCESS: 'LGPD_003',
  
  // Business logic
  PATIENT_NOT_FOUND: 'BIZ_001',
  APPOINTMENT_CONFLICT: 'BIZ_002',
  PROFESSIONAL_UNAVAILABLE: 'BIZ_003',
  
  // System
  DATABASE_ERROR: 'SYS_001',
  EXTERNAL_SERVICE_ERROR: 'SYS_002',
  RATE_LIMIT_EXCEEDED: 'SYS_003',
} as const;