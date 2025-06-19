// Authentication configuration for NeonPro
export interface AuthConfig {
  // Two-Factor Authentication
  twoFactor: {
    enabled: boolean
    required: boolean // If true, users must enable 2FA
    issuer: string
    allowRecoveryCodes: boolean
    recoveryCodeCount: number
  }

  // Password Policy
  passwordPolicy: {
    minLength: number
    maxLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    checkBreaches: boolean
    preventCommonPatterns: boolean
  }

  // Magic Links
  magicLinks: {
    enabled: boolean
    expirationMinutes: number
    allowMultipleActive: boolean
    customDomain?: string
  }

  // Rate Limiting
  rateLimiting: {
    login: {
      attempts: number
      windowMinutes: number
    }
    signup: {
      attempts: number
      windowMinutes: number
    }
    passwordReset: {
      attempts: number
      windowMinutes: number
    }
    magicLink: {
      attempts: number
      windowMinutes: number
    }
  }

  // Session Management
  sessions: {
    maxConcurrentSessions: number
    sessionDurationDays: number
    allowRememberMe: boolean
    rememberMeDurationDays: number
    trackDevices: boolean
    alertNewDevice: boolean
  }

  // Security
  security: {
    enforceHttps: boolean
    sameSiteCookie: 'strict' | 'lax' | 'none'
    secureCookie: boolean
    csrfProtection: boolean
    allowedOrigins: string[]
  }

  // Audit
  audit: {
    enabled: boolean
    retentionDays: number
    trackFailedAttempts: boolean
    trackSuccessfulLogins: boolean
    trackPasswordChanges: boolean
    track2FAEvents: boolean
  }

  // OAuth Providers
  oauth: {
    google: {
      enabled: boolean
      clientId?: string
      allowSignup: boolean
      allowedDomains?: string[]
    }
    github: {
      enabled: boolean
      clientId?: string
      allowSignup: boolean
      allowedOrgs?: string[]
    }
  }
}

// Default configuration
export const defaultAuthConfig: AuthConfig = {
  twoFactor: {
    enabled: true,
    required: false, // Optional by default
    issuer: 'NeonPro',
    allowRecoveryCodes: true,
    recoveryCodeCount: 10,
  },

  passwordPolicy: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    checkBreaches: true,
    preventCommonPatterns: true,
  },

  magicLinks: {
    enabled: true,
    expirationMinutes: 15,
    allowMultipleActive: false,
  },

  rateLimiting: {
    login: {
      attempts: 5,
      windowMinutes: 1,
    },
    signup: {
      attempts: 3,
      windowMinutes: 1,
    },
    passwordReset: {
      attempts: 3,
      windowMinutes: 15,
    },
    magicLink: {
      attempts: 5,
      windowMinutes: 5,
    },
  },

  sessions: {
    maxConcurrentSessions: 5,
    sessionDurationDays: 30,
    allowRememberMe: true,
    rememberMeDurationDays: 90,
    trackDevices: true,
    alertNewDevice: true,
  },

  security: {
    enforceHttps: true,
    sameSiteCookie: 'lax',
    secureCookie: true,
    csrfProtection: true,
    allowedOrigins: [],
  },

  audit: {
    enabled: true,
    retentionDays: 90,
    trackFailedAttempts: true,
    trackSuccessfulLogins: true,
    trackPasswordChanges: true,
    track2FAEvents: true,
  },

  oauth: {
    google: {
      enabled: false,
      allowSignup: true,
    },
    github: {
      enabled: false,
      allowSignup: true,
    },
  },
}

// Get auth configuration (can be extended to read from database/env)
export async function getAuthConfig(): Promise<AuthConfig> {
  // In production, this could read from database or environment
  // For now, return default config with env overrides

  const config = { ...defaultAuthConfig }

  // Override from environment variables if available
  if (process.env.AUTH_2FA_REQUIRED === 'true') {
    config.twoFactor.required = true
  }

  if (process.env.AUTH_MAGIC_LINKS_ENABLED === 'false') {
    config.magicLinks.enabled = false
  }

  if (process.env.AUTH_GOOGLE_CLIENT_ID) {
    config.oauth.google.enabled = true
    config.oauth.google.clientId = process.env.AUTH_GOOGLE_CLIENT_ID
  }

  if (process.env.AUTH_GITHUB_CLIENT_ID) {
    config.oauth.github.enabled = true
    config.oauth.github.clientId = process.env.AUTH_GITHUB_CLIENT_ID
  }

  return config
}

// Validate auth configuration
export function validateAuthConfig(config: Partial<AuthConfig>): string[] {
  const errors: string[] = []

  // Validate password policy
  if (config.passwordPolicy) {
    const { minLength, maxLength } = config.passwordPolicy
    if (minLength && maxLength && minLength > maxLength) {
      errors.push('Password minimum length cannot be greater than maximum length')
    }
    if (minLength && minLength < 8) {
      errors.push('Password minimum length should be at least 8 characters')
    }
  }

  // Validate rate limiting
  if (config.rateLimiting) {
    Object.entries(config.rateLimiting).forEach(([key, limits]) => {
      if (limits.attempts < 1) {
        errors.push(`Rate limiting ${key} attempts must be at least 1`)
      }
      if (limits.windowMinutes < 1) {
        errors.push(`Rate limiting ${key} window must be at least 1 minute`)
      }
    })
  }

  // Validate sessions
  if (config.sessions) {
    if (config.sessions.maxConcurrentSessions < 1) {
      errors.push('Maximum concurrent sessions must be at least 1')
    }
    if (config.sessions.sessionDurationDays < 1) {
      errors.push('Session duration must be at least 1 day')
    }
  }

  return errors
}

// Check if a feature is enabled
export async function isFeatureEnabled(feature: keyof AuthConfig): Promise<boolean> {
  const config = await getAuthConfig()
  const featureConfig = config[feature]

  if (typeof featureConfig === 'object' && 'enabled' in featureConfig) {
    return featureConfig.enabled
  }

  return false
}

// Get rate limit settings for a specific action
export async function getRateLimitSettings(
  action: keyof AuthConfig['rateLimiting']
): Promise<{ attempts: number; windowMinutes: number }> {
  const config = await getAuthConfig()
  return config.rateLimiting[action]
}
