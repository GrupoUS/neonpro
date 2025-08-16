/**
 * 🔐 Configurações do Sistema de Gerenciamento de Sessões
 *
 * Este arquivo centraliza todas as configurações do sistema de sessões,
 * incluindo timeouts, limites de segurança, configurações de notificação
 * e parâmetros de limpeza de dados.
 */

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type SessionConfig = {
  timeout: {
    defaultMinutes: number;
    extendThresholdMinutes: number;
    warningMinutes: number;
    maxExtensions: number;
  };
  security: {
    maxConcurrentSessions: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    requireDeviceVerification: boolean;
    enableRiskAssessment: boolean;
  };
  activity: {
    trackingEnabled: boolean;
    debounceMs: number;
    batchSize: number;
    flushIntervalMs: number;
  };
};

export type DeviceConfig = {
  fingerprinting: {
    enabled: boolean;
    includeCanvas: boolean;
    includeWebGL: boolean;
    includeAudio: boolean;
    includeScreen: boolean;
  };
  trust: {
    autoTrustAfterDays: number;
    requireManualApproval: boolean;
    maxTrustedDevices: number;
  };
  risk: {
    enabled: boolean;
    factors: {
      newDevice: number;
      locationChange: number;
      timeAnomaly: number;
      browserChange: number;
    };
    thresholds: {
      low: number;
      medium: number;
      high: number;
    };
  };
};

export type SecurityConfig = {
  events: {
    retentionDays: number;
    maxEventsPerUser: number;
    alertThresholds: {
      loginFailures: number;
      suspiciousActivity: number;
      securityViolations: number;
    };
  };
  monitoring: {
    enabled: boolean;
    realTimeAlerts: boolean;
    batchProcessing: boolean;
    analysisIntervalMinutes: number;
  };
  response: {
    autoBlock: boolean;
    autoNotify: boolean;
    escalationLevels: string[];
  };
};

export type NotificationConfig = {
  channels: {
    email: {
      enabled: boolean;
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
      templates: {
        sessionExpiring: string;
        newDevice: string;
        securityAlert: string;
        loginFailure: string;
      };
    };
    sms: {
      enabled: boolean;
      provider: string;
      apiKey: string;
      templates: {
        securityAlert: string;
        newDevice: string;
      };
    };
    push: {
      enabled: boolean;
      vapidKeys: {
        publicKey: string;
        privateKey: string;
      };
    };
    inApp: {
      enabled: boolean;
      maxNotifications: number;
      autoMarkRead: boolean;
    };
  };
  preferences: {
    defaultChannels: string[];
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    priorities: {
      low: string[];
      medium: string[];
      high: string[];
      critical: string[];
    };
  };
};

export type CleanupConfig = {
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    timezone: string;
  };
  retention: {
    sessions: {
      activeDays: number;
      expiredDays: number;
    };
    activities: {
      days: number;
      maxRecordsPerUser: number;
    };
    securityEvents: {
      days: number;
      resolvedEventsDays: number;
    };
    notifications: {
      readDays: number;
      unreadDays: number;
    };
    auditLogs: {
      days: number;
    };
  };
  optimization: {
    enabled: boolean;
    vacuumTables: boolean;
    reindexTables: boolean;
    analyzeStatistics: boolean;
  };
  safety: {
    dryRun: boolean;
    backupBeforeCleanup: boolean;
    maxRecordsPerBatch: number;
    batchDelayMs: number;
  };
};

export type DatabaseConfig = {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  tables: {
    sessions: string;
    devices: string;
    activities: string;
    securityEvents: string;
    notifications: string;
    auditLogs: string;
  };
  indexes: {
    sessions: string[];
    devices: string[];
    activities: string[];
    securityEvents: string[];
  };
  performance: {
    connectionPoolSize: number;
    queryTimeout: number;
    batchSize: number;
  };
};

// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================

/**
 * Configurações padrão do sistema de sessões
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  timeout: {
    defaultMinutes: 30,
    extendThresholdMinutes: 5,
    warningMinutes: 2,
    maxExtensions: 3,
  },
  security: {
    maxConcurrentSessions: 3,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    requireDeviceVerification: true,
    enableRiskAssessment: true,
  },
  activity: {
    trackingEnabled: true,
    debounceMs: 1000,
    batchSize: 10,
    flushIntervalMs: 30_000,
  },
};

/**
 * Configurações padrão de dispositivos
 */
export const DEFAULT_DEVICE_CONFIG: DeviceConfig = {
  fingerprinting: {
    enabled: true,
    includeCanvas: true,
    includeWebGL: true,
    includeAudio: false,
    includeScreen: true,
  },
  trust: {
    autoTrustAfterDays: 30,
    requireManualApproval: false,
    maxTrustedDevices: 10,
  },
  risk: {
    enabled: true,
    factors: {
      newDevice: 0.3,
      locationChange: 0.2,
      timeAnomaly: 0.2,
      browserChange: 0.3,
    },
    thresholds: {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
    },
  },
};

/**
 * Configurações padrão de segurança
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  events: {
    retentionDays: 180,
    maxEventsPerUser: 1000,
    alertThresholds: {
      loginFailures: 3,
      suspiciousActivity: 5,
      securityViolations: 1,
    },
  },
  monitoring: {
    enabled: true,
    realTimeAlerts: true,
    batchProcessing: false,
    analysisIntervalMinutes: 15,
  },
  response: {
    autoBlock: false,
    autoNotify: true,
    escalationLevels: ['low', 'medium', 'high', 'critical'],
  },
};

/**
 * Configurações padrão de notificações
 */
export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  channels: {
    email: {
      enabled: true,
      smtp: {
        host: process.env.SMTP_HOST || 'localhost',
        port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      },
      templates: {
        sessionExpiring: 'session-expiring',
        newDevice: 'new-device',
        securityAlert: 'security-alert',
        loginFailure: 'login-failure',
      },
    },
    sms: {
      enabled: false,
      provider: process.env.SMS_PROVIDER || 'twilio',
      apiKey: process.env.SMS_API_KEY || '',
      templates: {
        securityAlert: 'security-alert-sms',
        newDevice: 'new-device-sms',
      },
    },
    push: {
      enabled: true,
      vapidKeys: {
        publicKey: process.env.VAPID_PUBLIC_KEY || '',
        privateKey: process.env.VAPID_PRIVATE_KEY || '',
      },
    },
    inApp: {
      enabled: true,
      maxNotifications: 50,
      autoMarkRead: false,
    },
  },
  preferences: {
    defaultChannels: ['email', 'inApp'],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'America/Sao_Paulo',
    },
    priorities: {
      low: ['inApp'],
      medium: ['email', 'inApp'],
      high: ['email', 'push', 'inApp'],
      critical: ['email', 'sms', 'push', 'inApp'],
    },
  },
};

/**
 * Configurações padrão de limpeza
 */
export const DEFAULT_CLEANUP_CONFIG: CleanupConfig = {
  schedule: {
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    timezone: 'America/Sao_Paulo',
  },
  retention: {
    sessions: {
      activeDays: 30,
      expiredDays: 7,
    },
    activities: {
      days: 90,
      maxRecordsPerUser: 10_000,
    },
    securityEvents: {
      days: 180,
      resolvedEventsDays: 30,
    },
    notifications: {
      readDays: 30,
      unreadDays: 90,
    },
    auditLogs: {
      days: 365,
    },
  },
  optimization: {
    enabled: true,
    vacuumTables: true,
    reindexTables: false,
    analyzeStatistics: true,
  },
  safety: {
    dryRun: false,
    backupBeforeCleanup: true,
    maxRecordsPerBatch: 1000,
    batchDelayMs: 100,
  },
};

/**
 * Configurações padrão do banco de dados
 */
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  tables: {
    sessions: 'user_sessions',
    devices: 'user_devices',
    activities: 'session_activities',
    securityEvents: 'security_events',
    notifications: 'user_notifications',
    auditLogs: 'audit_logs',
  },
  indexes: {
    sessions: ['user_id', 'session_token', 'expires_at', 'is_active'],
    devices: ['user_id', 'fingerprint', 'is_trusted', 'last_used'],
    activities: ['session_id', 'user_id', 'created_at'],
    securityEvents: ['user_id', 'type', 'severity', 'created_at', 'resolved'],
  },
  performance: {
    connectionPoolSize: 10,
    queryTimeout: 30_000,
    batchSize: 100,
  },
};

// ============================================================================
// CONFIGURAÇÕES DERIVADAS DO AMBIENTE
// ============================================================================

/**
 * Obtém configurações baseadas em variáveis de ambiente
 */
export function getEnvironmentConfig(): Partial<SessionConfig> {
  return {
    timeout: {
      defaultMinutes: Number.parseInt(
        process.env.SESSION_TIMEOUT_MINUTES || '30',
        10,
      ),
      extendThresholdMinutes: Number.parseInt(
        process.env.SESSION_EXTEND_THRESHOLD_MINUTES || '5',
        10,
      ),
      warningMinutes: Number.parseInt(
        process.env.SESSION_WARNING_MINUTES || '2',
        10,
      ),
      maxExtensions: Number.parseInt(
        process.env.SESSION_MAX_EXTENSIONS || '3',
        10,
      ),
    },
    security: {
      maxConcurrentSessions: Number.parseInt(
        process.env.MAX_CONCURRENT_SESSIONS || '3',
        10,
      ),
      maxLoginAttempts: Number.parseInt(
        process.env.MAX_LOGIN_ATTEMPTS || '5',
        10,
      ),
      lockoutDurationMinutes: Number.parseInt(
        process.env.LOCKOUT_DURATION_MINUTES || '15',
        10,
      ),
      requireDeviceVerification:
        process.env.REQUIRE_DEVICE_VERIFICATION === 'true',
      enableRiskAssessment: process.env.ENABLE_RISK_ASSESSMENT !== 'false',
    },
  };
}

/**
 * Mescla configurações padrão com configurações do ambiente
 */
export function getMergedConfig(): SessionConfig {
  const envConfig = getEnvironmentConfig();
  return {
    ...DEFAULT_SESSION_CONFIG,
    ...envConfig,
    timeout: {
      ...DEFAULT_SESSION_CONFIG.timeout,
      ...envConfig.timeout,
    },
    security: {
      ...DEFAULT_SESSION_CONFIG.security,
      ...envConfig.security,
    },
  };
}

// ============================================================================
// VALIDAÇÃO DE CONFIGURAÇÕES
// ============================================================================

/**
 * Valida se as configurações são válidas
 */
export function validateConfig(config: SessionConfig): string[] {
  const errors: string[] = [];

  // Validar timeouts
  if (config.timeout.defaultMinutes <= 0) {
    errors.push('Timeout padrão deve ser maior que 0');
  }
  if (config.timeout.extendThresholdMinutes >= config.timeout.defaultMinutes) {
    errors.push('Threshold de extensão deve ser menor que timeout padrão');
  }
  if (config.timeout.warningMinutes >= config.timeout.extendThresholdMinutes) {
    errors.push('Aviso deve ser menor que threshold de extensão');
  }

  // Validar segurança
  if (config.security.maxConcurrentSessions <= 0) {
    errors.push('Máximo de sessões concorrentes deve ser maior que 0');
  }
  if (config.security.maxLoginAttempts <= 0) {
    errors.push('Máximo de tentativas de login deve ser maior que 0');
  }
  if (config.security.lockoutDurationMinutes <= 0) {
    errors.push('Duração do bloqueio deve ser maior que 0');
  }

  // Validar atividade
  if (config.activity.debounceMs < 0) {
    errors.push('Debounce não pode ser negativo');
  }
  if (config.activity.batchSize <= 0) {
    errors.push('Tamanho do batch deve ser maior que 0');
  }
  if (config.activity.flushIntervalMs <= 0) {
    errors.push('Intervalo de flush deve ser maior que 0');
  }

  return errors;
}

/**
 * Valida configurações de dispositivo
 */
export function validateDeviceConfig(config: DeviceConfig): string[] {
  const errors: string[] = [];

  if (config.trust.autoTrustAfterDays < 0) {
    errors.push('Dias para confiança automática não pode ser negativo');
  }
  if (config.trust.maxTrustedDevices <= 0) {
    errors.push('Máximo de dispositivos confiáveis deve ser maior que 0');
  }

  // Validar fatores de risco
  const factors = Object.values(config.risk.factors);
  if (factors.some((f) => f < 0 || f > 1)) {
    errors.push('Fatores de risco devem estar entre 0 e 1');
  }

  // Validar thresholds
  const { low, medium, high } = config.risk.thresholds;
  if (low >= medium || medium >= high || high > 1) {
    errors.push('Thresholds de risco devem estar em ordem crescente e <= 1');
  }

  return errors;
}

// ============================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ============================================================================

/**
 * Obtém configuração específica por chave
 */
export function getConfigValue<T>(key: string, defaultValue: T): T {
  const envKey = key.toUpperCase().replace(/\./g, '_');
  const envValue = process.env[envKey];

  if (envValue === undefined) {
    return defaultValue;
  }

  // Tentar converter para o tipo apropriado
  if (typeof defaultValue === 'boolean') {
    return (envValue === 'true') as unknown as T;
  }

  if (typeof defaultValue === 'number') {
    const parsed = Number.parseInt(envValue, 10);
    return (Number.isNaN(parsed) ? defaultValue : parsed) as unknown as T;
  }

  return envValue as unknown as T;
}

/**
 * Cria configuração personalizada
 */
export function createCustomConfig(
  overrides: Partial<SessionConfig>,
): SessionConfig {
  const baseConfig = getMergedConfig();
  return {
    ...baseConfig,
    ...overrides,
    timeout: {
      ...baseConfig.timeout,
      ...overrides.timeout,
    },
    security: {
      ...baseConfig.security,
      ...overrides.security,
    },
    activity: {
      ...baseConfig.activity,
      ...overrides.activity,
    },
  };
}

/**
 * Exporta todas as configurações como um objeto único
 */
export const CONFIG = {
  session: getMergedConfig(),
  device: DEFAULT_DEVICE_CONFIG,
  security: DEFAULT_SECURITY_CONFIG,
  notification: DEFAULT_NOTIFICATION_CONFIG,
  cleanup: DEFAULT_CLEANUP_CONFIG,
  database: DEFAULT_DATABASE_CONFIG,
} as const;

/**
 * Tipos para configurações específicas
 */
export type SessionConfigKey = keyof SessionConfig;
export type DeviceConfigKey = keyof DeviceConfig;
export type SecurityConfigKey = keyof SecurityConfig;
export type NotificationConfigKey = keyof NotificationConfig;
export type CleanupConfigKey = keyof CleanupConfig;
export type DatabaseConfigKey = keyof DatabaseConfig;

/**
 * Configurações de desenvolvimento vs produção
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

export const DEV_CONFIG_OVERRIDES: Partial<SessionConfig> = {
  timeout: {
    defaultMinutes: 60, // Sessões mais longas em dev
    extendThresholdMinutes: 10,
    warningMinutes: 5,
    maxExtensions: 5,
  },
  security: {
    maxLoginAttempts: 10, // Mais tentativas em dev
    lockoutDurationMinutes: 5, // Bloqueio mais curto
    requireDeviceVerification: false, // Menos restritivo
  },
};

export const PROD_CONFIG_OVERRIDES: Partial<SessionConfig> = {
  security: {
    requireDeviceVerification: true,
    enableRiskAssessment: true,
  },
};

/**
 * Obtém configuração baseada no ambiente
 */
export function getEnvironmentSpecificConfig(): SessionConfig {
  const baseConfig = getMergedConfig();

  if (isDevelopment) {
    return createCustomConfig(DEV_CONFIG_OVERRIDES);
  }

  if (isProduction) {
    return createCustomConfig(PROD_CONFIG_OVERRIDES);
  }

  return baseConfig;
}

// Exportar configuração final baseada no ambiente
export const FINAL_CONFIG = getEnvironmentSpecificConfig();
