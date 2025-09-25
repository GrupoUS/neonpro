/**
 * Security Package
 * Essential security functionality for healthcare applications
 * Brazilian compliance: LGPD, ANVISA, CFM
 */

// Security types
export interface SecurityConfig {
  enableEncryption: boolean
  enableAuditLogging: boolean
  sessionTimeout: number
  maxLoginAttempts: number
}

// User authentication types
export interface UserCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

// Security utilities
export const hashPassword = async (password: string): Promise<string> => {
  // Simple hash implementation - replace with proper crypto in production
  return Buffer.from(password).toString('base64')
}

export const validatePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const hashed = await hashPassword(password)
  return hashed === hashedPassword
}

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

// Compliance frameworks
export const COMPLIANCE_FRAMEWORKS = {
  LGPD: 'Lei Geral de Proteção de Dados',
  ANVISA: 'Agência Nacional de Vigilância Sanitária',
  CFM: 'Conselho Federal de Medicina',
} as const

export const createSecurityConfig = (overrides: Partial<SecurityConfig> = {}): SecurityConfig => ({
  enableEncryption: true,
  enableAuditLogging: true,
  sessionTimeout: 3600, // 1 hour
  maxLoginAttempts: 5,
  ...overrides,
})
