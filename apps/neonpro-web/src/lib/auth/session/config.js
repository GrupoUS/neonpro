"use strict";
/**
 * 🔐 Configurações do Sistema de Gerenciamento de Sessões
 *
 * Este arquivo centraliza todas as configurações do sistema de sessões,
 * incluindo timeouts, limites de segurança, configurações de notificação
 * e parâmetros de limpeza de dados.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionConfig = exports.FINAL_CONFIG = exports.PROD_CONFIG_OVERRIDES = exports.DEV_CONFIG_OVERRIDES = exports.isProduction = exports.isDevelopment = exports.CONFIG = exports.DEFAULT_DATABASE_CONFIG = exports.DEFAULT_CLEANUP_CONFIG = exports.DEFAULT_NOTIFICATION_CONFIG = exports.DEFAULT_SECURITY_CONFIG = exports.DEFAULT_DEVICE_CONFIG = exports.DEFAULT_SESSION_CONFIG = void 0;
exports.getEnvironmentConfig = getEnvironmentConfig;
exports.getMergedConfig = getMergedConfig;
exports.validateConfig = validateConfig;
exports.validateDeviceConfig = validateDeviceConfig;
exports.getConfigValue = getConfigValue;
exports.createCustomConfig = createCustomConfig;
exports.getEnvironmentSpecificConfig = getEnvironmentSpecificConfig;
// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================
/**
 * Configurações padrão do sistema de sessões
 */
exports.DEFAULT_SESSION_CONFIG = {
    timeout: {
        defaultMinutes: 30,
        extendThresholdMinutes: 5,
        warningMinutes: 2,
        maxExtensions: 3
    },
    security: {
        maxConcurrentSessions: 3,
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 15,
        requireDeviceVerification: true,
        enableRiskAssessment: true
    },
    activity: {
        trackingEnabled: true,
        debounceMs: 1000,
        batchSize: 10,
        flushIntervalMs: 30000
    }
};
/**
 * Configurações padrão de dispositivos
 */
exports.DEFAULT_DEVICE_CONFIG = {
    fingerprinting: {
        enabled: true,
        includeCanvas: true,
        includeWebGL: true,
        includeAudio: false,
        includeScreen: true
    },
    trust: {
        autoTrustAfterDays: 30,
        requireManualApproval: false,
        maxTrustedDevices: 10
    },
    risk: {
        enabled: true,
        factors: {
            newDevice: 0.3,
            locationChange: 0.2,
            timeAnomaly: 0.2,
            browserChange: 0.3
        },
        thresholds: {
            low: 0.3,
            medium: 0.6,
            high: 0.8
        }
    }
};
/**
 * Configurações padrão de segurança
 */
exports.DEFAULT_SECURITY_CONFIG = {
    events: {
        retentionDays: 180,
        maxEventsPerUser: 1000,
        alertThresholds: {
            loginFailures: 3,
            suspiciousActivity: 5,
            securityViolations: 1
        }
    },
    monitoring: {
        enabled: true,
        realTimeAlerts: true,
        batchProcessing: false,
        analysisIntervalMinutes: 15
    },
    response: {
        autoBlock: false,
        autoNotify: true,
        escalationLevels: ['low', 'medium', 'high', 'critical']
    }
};
/**
 * Configurações padrão de notificações
 */
exports.DEFAULT_NOTIFICATION_CONFIG = {
    channels: {
        email: {
            enabled: true,
            smtp: {
                host: process.env.SMTP_HOST || 'localhost',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || ''
                }
            },
            templates: {
                sessionExpiring: 'session-expiring',
                newDevice: 'new-device',
                securityAlert: 'security-alert',
                loginFailure: 'login-failure'
            }
        },
        sms: {
            enabled: false,
            provider: process.env.SMS_PROVIDER || 'twilio',
            apiKey: process.env.SMS_API_KEY || '',
            templates: {
                securityAlert: 'security-alert-sms',
                newDevice: 'new-device-sms'
            }
        },
        push: {
            enabled: true,
            vapidKeys: {
                publicKey: process.env.VAPID_PUBLIC_KEY || '',
                privateKey: process.env.VAPID_PRIVATE_KEY || ''
            }
        },
        inApp: {
            enabled: true,
            maxNotifications: 50,
            autoMarkRead: false
        }
    },
    preferences: {
        defaultChannels: ['email', 'inApp'],
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
            timezone: 'America/Sao_Paulo'
        },
        priorities: {
            low: ['inApp'],
            medium: ['email', 'inApp'],
            high: ['email', 'push', 'inApp'],
            critical: ['email', 'sms', 'push', 'inApp']
        }
    }
};
/**
 * Configurações padrão de limpeza
 */
exports.DEFAULT_CLEANUP_CONFIG = {
    schedule: {
        enabled: true,
        frequency: 'daily',
        time: '02:00',
        timezone: 'America/Sao_Paulo'
    },
    retention: {
        sessions: {
            activeDays: 30,
            expiredDays: 7
        },
        activities: {
            days: 90,
            maxRecordsPerUser: 10000
        },
        securityEvents: {
            days: 180,
            resolvedEventsDays: 30
        },
        notifications: {
            readDays: 30,
            unreadDays: 90
        },
        auditLogs: {
            days: 365
        }
    },
    optimization: {
        enabled: true,
        vacuumTables: true,
        reindexTables: false,
        analyzeStatistics: true
    },
    safety: {
        dryRun: false,
        backupBeforeCleanup: true,
        maxRecordsPerBatch: 1000,
        batchDelayMs: 100
    }
};
/**
 * Configurações padrão do banco de dados
 */
exports.DEFAULT_DATABASE_CONFIG = {
    supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    },
    tables: {
        sessions: 'user_sessions',
        devices: 'user_devices',
        activities: 'session_activities',
        securityEvents: 'security_events',
        notifications: 'user_notifications',
        auditLogs: 'audit_logs'
    },
    indexes: {
        sessions: ['user_id', 'session_token', 'expires_at', 'is_active'],
        devices: ['user_id', 'fingerprint', 'is_trusted', 'last_used'],
        activities: ['session_id', 'user_id', 'created_at'],
        securityEvents: ['user_id', 'type', 'severity', 'created_at', 'resolved']
    },
    performance: {
        connectionPoolSize: 10,
        queryTimeout: 30000,
        batchSize: 100
    }
};
// ============================================================================
// CONFIGURAÇÕES DERIVADAS DO AMBIENTE
// ============================================================================
/**
 * Obtém configurações baseadas em variáveis de ambiente
 */
function getEnvironmentConfig() {
    return {
        timeout: {
            defaultMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30'),
            extendThresholdMinutes: parseInt(process.env.SESSION_EXTEND_THRESHOLD_MINUTES || '5'),
            warningMinutes: parseInt(process.env.SESSION_WARNING_MINUTES || '2'),
            maxExtensions: parseInt(process.env.SESSION_MAX_EXTENSIONS || '3')
        },
        security: {
            maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '3'),
            maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
            lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15'),
            requireDeviceVerification: process.env.REQUIRE_DEVICE_VERIFICATION === 'true',
            enableRiskAssessment: process.env.ENABLE_RISK_ASSESSMENT !== 'false'
        }
    };
}
/**
 * Mescla configurações padrão com configurações do ambiente
 */
function getMergedConfig() {
    var envConfig = getEnvironmentConfig();
    return __assign(__assign(__assign({}, exports.DEFAULT_SESSION_CONFIG), envConfig), { timeout: __assign(__assign({}, exports.DEFAULT_SESSION_CONFIG.timeout), envConfig.timeout), security: __assign(__assign({}, exports.DEFAULT_SESSION_CONFIG.security), envConfig.security) });
}
// ============================================================================
// VALIDAÇÃO DE CONFIGURAÇÕES
// ============================================================================
/**
 * Valida se as configurações são válidas
 */
function validateConfig(config) {
    var errors = [];
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
function validateDeviceConfig(config) {
    var errors = [];
    if (config.trust.autoTrustAfterDays < 0) {
        errors.push('Dias para confiança automática não pode ser negativo');
    }
    if (config.trust.maxTrustedDevices <= 0) {
        errors.push('Máximo de dispositivos confiáveis deve ser maior que 0');
    }
    // Validar fatores de risco
    var factors = Object.values(config.risk.factors);
    if (factors.some(function (f) { return f < 0 || f > 1; })) {
        errors.push('Fatores de risco devem estar entre 0 e 1');
    }
    // Validar thresholds
    var _a = config.risk.thresholds, low = _a.low, medium = _a.medium, high = _a.high;
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
function getConfigValue(key, defaultValue) {
    var envKey = key.toUpperCase().replace(/\./g, '_');
    var envValue = process.env[envKey];
    if (envValue === undefined) {
        return defaultValue;
    }
    // Tentar converter para o tipo apropriado
    if (typeof defaultValue === 'boolean') {
        return (envValue === 'true');
    }
    if (typeof defaultValue === 'number') {
        var parsed = parseInt(envValue);
        return (isNaN(parsed) ? defaultValue : parsed);
    }
    return envValue;
}
/**
 * Cria configuração personalizada
 */
function createCustomConfig(overrides) {
    var baseConfig = getMergedConfig();
    return __assign(__assign(__assign({}, baseConfig), overrides), { timeout: __assign(__assign({}, baseConfig.timeout), overrides.timeout), security: __assign(__assign({}, baseConfig.security), overrides.security), activity: __assign(__assign({}, baseConfig.activity), overrides.activity) });
}
/**
 * Exporta todas as configurações como um objeto único
 */
exports.CONFIG = {
    session: getMergedConfig(),
    device: exports.DEFAULT_DEVICE_CONFIG,
    security: exports.DEFAULT_SECURITY_CONFIG,
    notification: exports.DEFAULT_NOTIFICATION_CONFIG,
    cleanup: exports.DEFAULT_CLEANUP_CONFIG,
    database: exports.DEFAULT_DATABASE_CONFIG
};
/**
 * Configurações de desenvolvimento vs produção
 */
exports.isDevelopment = process.env.NODE_ENV === 'development';
exports.isProduction = process.env.NODE_ENV === 'production';
exports.DEV_CONFIG_OVERRIDES = {
    timeout: {
        defaultMinutes: 60, // Sessões mais longas em dev
        extendThresholdMinutes: 10,
        warningMinutes: 5,
        maxExtensions: 5
    },
    security: {
        maxLoginAttempts: 10, // Mais tentativas em dev
        lockoutDurationMinutes: 5, // Bloqueio mais curto
        requireDeviceVerification: false // Menos restritivo
    }
};
exports.PROD_CONFIG_OVERRIDES = {
    security: {
        requireDeviceVerification: true,
        enableRiskAssessment: true
    }
};
/**
 * Obtém configuração baseada no ambiente
 */
function getEnvironmentSpecificConfig() {
    var baseConfig = getMergedConfig();
    if (exports.isDevelopment) {
        return createCustomConfig(exports.DEV_CONFIG_OVERRIDES);
    }
    if (exports.isProduction) {
        return createCustomConfig(exports.PROD_CONFIG_OVERRIDES);
    }
    return baseConfig;
}
// Exportar configuração final baseada no ambiente
exports.FINAL_CONFIG = getEnvironmentSpecificConfig();
// Export para compatibilidade com imports existentes
exports.sessionConfig = __assign(__assign({}, exports.FINAL_CONFIG), { cleanup: exports.DEFAULT_CLEANUP_CONFIG, device: exports.DEFAULT_DEVICE_CONFIG, security: exports.DEFAULT_SECURITY_CONFIG, notification: exports.DEFAULT_NOTIFICATION_CONFIG, database: exports.DEFAULT_DATABASE_CONFIG });
