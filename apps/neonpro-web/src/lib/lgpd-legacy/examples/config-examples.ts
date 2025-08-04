/**
 * LGPD Compliance Automation System - Configuration Examples
 * Story 1.5: LGPD Compliance Automation
 * 
 * Exemplos de configuração para diferentes ambientes e cenários
 */

import type { LGPDConfig } from '../types';

// =====================================================
// CONFIGURAÇÕES POR AMBIENTE
// =====================================================

/**
 * Configuração para ambiente de desenvolvimento
 */
export const developmentConfig: LGPDConfig = {
  monitoring: {
    enabled: true,
    interval: 30000, // 30 segundos para testes rápidos
    alertThresholds: {
      consentExpiration: 7, // 7 dias para testes
      dsrOverdue: 3, // 3 dias para testes
      complianceScore: 70, // Score mais baixo para desenvolvimento
      breachDetection: 5, // Limite baixo para testes
      retentionViolation: 1 // 1 dia para testes
    },
    enableRealTimeAlerts: true,
    enablePerformanceMetrics: true
  },
  auditLogging: {
    enabled: true,
    logLevel: 'debug', // Log detalhado para desenvolvimento
    retentionDays: 30, // Retenção curta para desenvolvimento
    includeStackTrace: true,
    logToConsole: true,
    logToFile: false,
    sensitiveDataMasking: false // Desabilitado para debug
  },
  breachDetection: {
    enabled: true,
    rules: {
      multipleFailedLogins: {
        enabled: true,
        threshold: 3, // Limite baixo para testes
        timeWindow: 60000, // 1 minuto
        severity: 'medium'
      },
      unauthorizedDataAccess: {
        enabled: true,
        threshold: 1,
        timeWindow: 300000, // 5 minutos
        severity: 'high'
      },
      massDataExport: {
        enabled: true,
        threshold: 10, // Limite baixo para testes
        timeWindow: 600000, // 10 minutos
        severity: 'high'
      },
      adminPrivilegeEscalation: {
        enabled: true,
        threshold: 1,
        timeWindow: 3600000, // 1 hora
        severity: 'critical'
      },
      dataAnomalyDeletion: {
        enabled: true,
        threshold: 5, // Limite baixo para testes
        timeWindow: 1800000, // 30 minutos
        severity: 'high'
      }
    },
    autoNotification: false, // Desabilitado em desenvolvimento
    requireManualReview: true
  },
  dataRetention: {
    enabled: true,
    autoExecution: false, // Manual em desenvolvimento
    defaultPolicies: {
      healthData: {
        retentionPeriodMonths: 1, // Curto para testes
        action: 'archive'
      },
      personalData: {
        retentionPeriodMonths: 1,
        action: 'anonymize'
      },
      auditLogs: {
        retentionPeriodMonths: 1,
        action: 'delete'
      }
    },
    gracePeriodDays: 7,
    notifyBeforeAction: true
  },
  dataMinimization: {
    enabled: true,
    strictMode: false, // Modo flexível para desenvolvimento
    autoValidation: true,
    allowOverrides: true, // Permitir overrides em desenvolvimento
    logViolations: true
  },
  thirdPartyCompliance: {
    enabled: true,
    requireExplicitApproval: false, // Flexível para desenvolvimento
    autoRiskAssessment: true,
    defaultRiskLevel: 'medium'
  },
  legalDocumentation: {
    enabled: true,
    autoGeneration: true,
    templateVersion: 'latest',
    includeWatermark: true, // Marcar como desenvolvimento
    autoUpdate: false
  }
};

/**
 * Configuração para ambiente de homologação/staging
 */
export const stagingConfig: LGPDConfig = {
  monitoring: {
    enabled: true,
    interval: 60000, // 1 minuto
    alertThresholds: {
      consentExpiration: 15, // 15 dias
      dsrOverdue: 7, // 7 dias
      complianceScore: 80, // Score intermediário
      breachDetection: 10,
      retentionViolation: 3
    },
    enableRealTimeAlerts: true,
    enablePerformanceMetrics: true
  },
  auditLogging: {
    enabled: true,
    logLevel: 'info',
    retentionDays: 90, // 3 meses
    includeStackTrace: false,
    logToConsole: false,
    logToFile: true,
    sensitiveDataMasking: true
  },
  breachDetection: {
    enabled: true,
    rules: {
      multipleFailedLogins: {
        enabled: true,
        threshold: 5,
        timeWindow: 300000, // 5 minutos
        severity: 'medium'
      },
      unauthorizedDataAccess: {
        enabled: true,
        threshold: 2,
        timeWindow: 600000, // 10 minutos
        severity: 'high'
      },
      massDataExport: {
        enabled: true,
        threshold: 50,
        timeWindow: 1800000, // 30 minutos
        severity: 'high'
      },
      adminPrivilegeEscalation: {
        enabled: true,
        threshold: 1,
        timeWindow: 3600000, // 1 hora
        severity: 'critical'
      },
      dataAnomalyDeletion: {
        enabled: true,
        threshold: 20,
        timeWindow: 3600000, // 1 hora
        severity: 'high'
      }
    },
    autoNotification: true,
    requireManualReview: true
  },
  dataRetention: {
    enabled: true,
    autoExecution: false, // Ainda manual em staging
    defaultPolicies: {
      healthData: {
        retentionPeriodMonths: 12, // 1 ano para testes
        action: 'archive'
      },
      personalData: {
        retentionPeriodMonths: 6,
        action: 'anonymize'
      },
      auditLogs: {
        retentionPeriodMonths: 12,
        action: 'archive'
      }
    },
    gracePeriodDays: 15,
    notifyBeforeAction: true
  },
  dataMinimization: {
    enabled: true,
    strictMode: true, // Modo estrito em staging
    autoValidation: true,
    allowOverrides: false,
    logViolations: true
  },
  thirdPartyCompliance: {
    enabled: true,
    requireExplicitApproval: true,
    autoRiskAssessment: true,
    defaultRiskLevel: 'medium'
  },
  legalDocumentation: {
    enabled: true,
    autoGeneration: true,
    templateVersion: 'latest',
    includeWatermark: false,
    autoUpdate: false
  }
};

/**
 * Configuração para ambiente de produção
 */
export const productionConfig: LGPDConfig = {
  monitoring: {
    enabled: true,
    interval: 300000, // 5 minutos
    alertThresholds: {
      consentExpiration: 30, // 30 dias
      dsrOverdue: 15, // 15 dias conforme LGPD
      complianceScore: 85, // Score alto para produção
      breachDetection: 20,
      retentionViolation: 7
    },
    enableRealTimeAlerts: true,
    enablePerformanceMetrics: true
  },
  auditLogging: {
    enabled: true,
    logLevel: 'info',
    retentionDays: 2555, // 7 anos conforme LGPD
    includeStackTrace: false,
    logToConsole: false,
    logToFile: true,
    sensitiveDataMasking: true
  },
  breachDetection: {
    enabled: true,
    rules: {
      multipleFailedLogins: {
        enabled: true,
        threshold: 10, // Limite realista
        timeWindow: 900000, // 15 minutos
        severity: 'medium'
      },
      unauthorizedDataAccess: {
        enabled: true,
        threshold: 3,
        timeWindow: 1800000, // 30 minutos
        severity: 'high'
      },
      massDataExport: {
        enabled: true,
        threshold: 100, // Limite realista
        timeWindow: 3600000, // 1 hora
        severity: 'high'
      },
      adminPrivilegeEscalation: {
        enabled: true,
        threshold: 1,
        timeWindow: 3600000, // 1 hora
        severity: 'critical'
      },
      dataAnomalyDeletion: {
        enabled: true,
        threshold: 50,
        timeWindow: 7200000, // 2 horas
        severity: 'high'
      }
    },
    autoNotification: true,
    requireManualReview: true
  },
  dataRetention: {
    enabled: true,
    autoExecution: true, // Automático em produção
    defaultPolicies: {
      healthData: {
        retentionPeriodMonths: 240, // 20 anos (CFM)
        action: 'archive'
      },
      personalData: {
        retentionPeriodMonths: 60, // 5 anos
        action: 'anonymize'
      },
      auditLogs: {
        retentionPeriodMonths: 84, // 7 anos
        action: 'archive'
      }
    },
    gracePeriodDays: 30,
    notifyBeforeAction: true
  },
  dataMinimization: {
    enabled: true,
    strictMode: true,
    autoValidation: true,
    allowOverrides: false, // Sem overrides em produção
    logViolations: true
  },
  thirdPartyCompliance: {
    enabled: true,
    requireExplicitApproval: true,
    autoRiskAssessment: true,
    defaultRiskLevel: 'high' // Conservador em produção
  },
  legalDocumentation: {
    enabled: true,
    autoGeneration: true,
    templateVersion: 'stable',
    includeWatermark: false,
    autoUpdate: true
  }
};

// =====================================================
// CONFIGURAÇÕES POR TIPO DE CLÍNICA
// =====================================================

/**
 * Configuração para clínicas pequenas (até 50 pacientes/mês)
 */
export const smallClinicConfig: Partial<LGPDConfig> = {
  monitoring: {
    interval: 600000, // 10 minutos (menos frequente)
    alertThresholds: {
      consentExpiration: 45, // Mais tempo para pequenas clínicas
      dsrOverdue: 20,
      complianceScore: 80,
      breachDetection: 5,
      retentionViolation: 14
    }
  },
  breachDetection: {
    rules: {
      multipleFailedLogins: {
        threshold: 5,
        timeWindow: 1800000 // 30 minutos
      },
      massDataExport: {
        threshold: 20, // Limite menor
        timeWindow: 7200000 // 2 horas
      }
    }
  },
  dataMinimization: {
    strictMode: false, // Mais flexível
    allowOverrides: true
  }
};

/**
 * Configuração para clínicas médias (50-200 pacientes/mês)
 */
export const mediumClinicConfig: Partial<LGPDConfig> = {
  monitoring: {
    interval: 300000, // 5 minutos
    alertThresholds: {
      consentExpiration: 30,
      dsrOverdue: 15,
      complianceScore: 85,
      breachDetection: 15,
      retentionViolation: 7
    }
  },
  breachDetection: {
    rules: {
      multipleFailedLogins: {
        threshold: 8,
        timeWindow: 900000 // 15 minutos
      },
      massDataExport: {
        threshold: 50,
        timeWindow: 3600000 // 1 hora
      }
    }
  },
  dataMinimization: {
    strictMode: true,
    allowOverrides: false
  }
};

/**
 * Configuração para clínicas grandes (200+ pacientes/mês)
 */
export const largeClinicConfig: Partial<LGPDConfig> = {
  monitoring: {
    interval: 120000, // 2 minutos
    alertThresholds: {
      consentExpiration: 30,
      dsrOverdue: 10, // Mais rigoroso
      complianceScore: 90, // Score alto
      breachDetection: 25,
      retentionViolation: 3
    }
  },
  breachDetection: {
    rules: {
      multipleFailedLogins: {
        threshold: 15,
        timeWindow: 600000 // 10 minutos
      },
      massDataExport: {
        threshold: 100,
        timeWindow: 1800000 // 30 minutos
      }
    }
  },
  dataMinimization: {
    strictMode: true,
    allowOverrides: false
  },
  thirdPartyCompliance: {
    requireExplicitApproval: true,
    defaultRiskLevel: 'high'
  }
};

// =====================================================
// CONFIGURAÇÕES POR ESPECIALIDADE MÉDICA
// =====================================================

/**
 * Configuração para clínicas de psicologia/psiquiatria
 * (dados sensíveis de saúde mental)
 */
export const mentalHealthConfig: Partial<LGPDConfig> = {
  breachDetection: {
    rules: {
      unauthorizedDataAccess: {
        threshold: 1, // Zero tolerância
        severity: 'critical'
      },
      massDataExport: {
        threshold: 5, // Limite muito baixo
        severity: 'critical'
      }
    }
  },
  dataRetention: {
    defaultPolicies: {
      healthData: {
        retentionPeriodMonths: 300, // 25 anos (CFP)
        action: 'archive'
      }
    }
  },
  dataMinimization: {
    strictMode: true,
    allowOverrides: false
  },
  thirdPartyCompliance: {
    requireExplicitApproval: true,
    defaultRiskLevel: 'critical'
  }
};

/**
 * Configuração para clínicas pediátricas
 * (dados de menores de idade)
 */
export const pediatricConfig: Partial<LGPDConfig> = {
  breachDetection: {
    rules: {
      unauthorizedDataAccess: {
        threshold: 1,
        severity: 'critical'
      }
    }
  },
  dataRetention: {
    defaultPolicies: {
      healthData: {
        retentionPeriodMonths: 300, // Até maioridade + tempo adicional
        action: 'archive'
      }
    }
  },
  thirdPartyCompliance: {
    requireExplicitApproval: true,
    defaultRiskLevel: 'high'
  }
};

/**
 * Configuração para clínicas de medicina do trabalho
 * (dados ocupacionais)
 */
export const occupationalHealthConfig: Partial<LGPDConfig> = {
  dataRetention: {
    defaultPolicies: {
      healthData: {
        retentionPeriodMonths: 240, // 20 anos (NR-7)
        action: 'archive'
      },
      occupationalData: {
        retentionPeriodMonths: 240,
        action: 'archive'
      }
    }
  },
  thirdPartyCompliance: {
    requireExplicitApproval: true, // Empresas terceiras
    defaultRiskLevel: 'medium'
  }
};

// =====================================================
// CONFIGURAÇÕES ESPECIAIS
// =====================================================

/**
 * Configuração para modo de auditoria/compliance
 * (máximo rigor para auditorias)
 */
export const auditModeConfig: Partial<LGPDConfig> = {
  monitoring: {
    interval: 60000, // 1 minuto
    alertThresholds: {
      consentExpiration: 15,
      dsrOverdue: 5, // Muito rigoroso
      complianceScore: 95, // Score muito alto
      breachDetection: 1,
      retentionViolation: 1
    },
    enableRealTimeAlerts: true,
    enablePerformanceMetrics: true
  },
  auditLogging: {
    logLevel: 'debug', // Log detalhado
    includeStackTrace: true,
    logToConsole: true,
    logToFile: true
  },
  breachDetection: {
    rules: {
      multipleFailedLogins: {
        threshold: 3,
        timeWindow: 300000,
        severity: 'high'
      },
      unauthorizedDataAccess: {
        threshold: 1,
        timeWindow: 60000,
        severity: 'critical'
      },
      massDataExport: {
        threshold: 10,
        timeWindow: 600000,
        severity: 'critical'
      }
    },
    autoNotification: true,
    requireManualReview: true
  },
  dataMinimization: {
    strictMode: true,
    allowOverrides: false,
    logViolations: true
  },
  thirdPartyCompliance: {
    requireExplicitApproval: true,
    defaultRiskLevel: 'critical'
  }
};

/**
 * Configuração para modo de migração
 * (durante implementação inicial)
 */
export const migrationModeConfig: Partial<LGPDConfig> = {
  monitoring: {
    interval: 1800000, // 30 minutos (menos frequente)
    alertThresholds: {
      consentExpiration: 60, // Mais tempo durante migração
      dsrOverdue: 30,
      complianceScore: 70, // Score mais baixo durante migração
      breachDetection: 50,
      retentionViolation: 30
    }
  },
  breachDetection: {
    autoNotification: false, // Manual durante migração
    requireManualReview: true
  },
  dataRetention: {
    autoExecution: false, // Manual durante migração
    gracePeriodDays: 60 // Período maior
  },
  dataMinimization: {
    strictMode: false, // Flexível durante migração
    allowOverrides: true
  },
  legalDocumentation: {
    autoGeneration: false, // Manual durante migração
    autoUpdate: false
  }
};

// =====================================================
// FUNÇÕES UTILITÁRIAS DE CONFIGURAÇÃO
// =====================================================

/**
 * Mescla configurações base com configurações específicas
 */
export function mergeConfigs(
  baseConfig: LGPDConfig,
  ...overrideConfigs: Partial<LGPDConfig>[]
): LGPDConfig {
  return overrideConfigs.reduce((merged, override) => {
    return {
      ...merged,
      ...override,
      monitoring: {
        ...merged.monitoring,
        ...override.monitoring,
        alertThresholds: {
          ...merged.monitoring?.alertThresholds,
          ...override.monitoring?.alertThresholds
        }
      },
      auditLogging: {
        ...merged.auditLogging,
        ...override.auditLogging
      },
      breachDetection: {
        ...merged.breachDetection,
        ...override.breachDetection,
        rules: {
          ...merged.breachDetection?.rules,
          ...override.breachDetection?.rules
        }
      },
      dataRetention: {
        ...merged.dataRetention,
        ...override.dataRetention,
        defaultPolicies: {
          ...merged.dataRetention?.defaultPolicies,
          ...override.dataRetention?.defaultPolicies
        }
      },
      dataMinimization: {
        ...merged.dataMinimization,
        ...override.dataMinimization
      },
      thirdPartyCompliance: {
        ...merged.thirdPartyCompliance,
        ...override.thirdPartyCompliance
      },
      legalDocumentation: {
        ...merged.legalDocumentation,
        ...override.legalDocumentation
      }
    };
  }, baseConfig);
}

/**
 * Obtém configuração baseada no ambiente
 */
export function getConfigByEnvironment(env: string): LGPDConfig {
  switch (env.toLowerCase()) {
    case 'development':
    case 'dev':
      return developmentConfig;
    case 'staging':
    case 'homolog':
      return stagingConfig;
    case 'production':
    case 'prod':
      return productionConfig;
    default:
      console.warn(`Ambiente desconhecido: ${env}. Usando configuração de desenvolvimento.`);
      return developmentConfig;
  }
}

/**
 * Obtém configuração baseada no tamanho da clínica
 */
export function getConfigByClinicSize(
  baseConfig: LGPDConfig,
  size: 'small' | 'medium' | 'large'
): LGPDConfig {
  const sizeConfigs = {
    small: smallClinicConfig,
    medium: mediumClinicConfig,
    large: largeClinicConfig
  };

  return mergeConfigs(baseConfig, sizeConfigs[size]);
}

/**
 * Obtém configuração baseada na especialidade médica
 */
export function getConfigBySpecialty(
  baseConfig: LGPDConfig,
  specialty: 'mental_health' | 'pediatric' | 'occupational_health'
): LGPDConfig {
  const specialtyConfigs = {
    mental_health: mentalHealthConfig,
    pediatric: pediatricConfig,
    occupational_health: occupationalHealthConfig
  };

  return mergeConfigs(baseConfig, specialtyConfigs[specialty]);
}

/**
 * Valida configuração LGPD
 */
export function validateLGPDConfig(config: LGPDConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar monitoramento
  if (config.monitoring?.enabled) {
    if (!config.monitoring.interval || config.monitoring.interval < 60000) {
      warnings.push('Intervalo de monitoramento muito baixo (< 1 minuto)');
    }
    
    if (config.monitoring.alertThresholds?.complianceScore && 
        config.monitoring.alertThresholds.complianceScore < 70) {
      warnings.push('Threshold de compliance score muito baixo (< 70%)');
    }
  }

  // Validar auditoria
  if (config.auditLogging?.enabled) {
    if (config.auditLogging.retentionDays && config.auditLogging.retentionDays < 2555) {
      warnings.push('Retenção de logs de auditoria menor que 7 anos (recomendado pela LGPD)');
    }
  }

  // Validar detecção de violações
  if (config.breachDetection?.enabled) {
    const rules = config.breachDetection.rules;
    
    if (rules?.unauthorizedDataAccess?.threshold && 
        rules.unauthorizedDataAccess.threshold > 5) {
      warnings.push('Threshold para acesso não autorizado muito alto');
    }
  }

  // Validar retenção de dados
  if (config.dataRetention?.enabled) {
    const policies = config.dataRetention.defaultPolicies;
    
    if (policies?.healthData?.retentionPeriodMonths && 
        policies.healthData.retentionPeriodMonths < 240) {
      errors.push('Período de retenção de dados médicos menor que 20 anos (CFM)');
    }
  }

  // Validar minimização de dados
  if (config.dataMinimization?.enabled) {
    if (config.dataMinimization.allowOverrides && 
        config.dataMinimization.strictMode) {
      warnings.push('Modo estrito habilitado com overrides permitidos');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Gera configuração personalizada baseada em parâmetros
 */
export function generateCustomConfig(params: {
  environment: string;
  clinicSize: 'small' | 'medium' | 'large';
  specialty?: 'mental_health' | 'pediatric' | 'occupational_health';
  auditMode?: boolean;
  migrationMode?: boolean;
}): LGPDConfig {
  // Configuração base por ambiente
  let config = getConfigByEnvironment(params.environment);

  // Aplicar configuração por tamanho
  config = getConfigByClinicSize(config, params.clinicSize);

  // Aplicar configuração por especialidade
  if (params.specialty) {
    config = getConfigBySpecialty(config, params.specialty);
  }

  // Aplicar modo de auditoria
  if (params.auditMode) {
    config = mergeConfigs(config, auditModeConfig);
  }

  // Aplicar modo de migração
  if (params.migrationMode) {
    config = mergeConfigs(config, migrationModeConfig);
  }

  return config;
}

// =====================================================
// EXEMPLOS DE USO
// =====================================================

/**
 * Exemplo: Configuração para clínica pequena de psicologia em produção
 */
export const smallMentalHealthProductionConfig = generateCustomConfig({
  environment: 'production',
  clinicSize: 'small',
  specialty: 'mental_health'
});

/**
 * Exemplo: Configuração para clínica grande em modo de auditoria
 */
export const largeClinicAuditConfig = generateCustomConfig({
  environment: 'production',
  clinicSize: 'large',
  auditMode: true
});

/**
 * Exemplo: Configuração para migração de clínica pediátrica
 */
export const pediatricMigrationConfig = generateCustomConfig({
  environment: 'staging',
  clinicSize: 'medium',
  specialty: 'pediatric',
  migrationMode: true
});

// Export das configurações principais
export {
  developmentConfig,
  stagingConfig,
  productionConfig,
  smallClinicConfig,
  mediumClinicConfig,
  largeClinicConfig,
  mentalHealthConfig,
  pediatricConfig,
  occupationalHealthConfig,
  auditModeConfig,
  migrationModeConfig
};