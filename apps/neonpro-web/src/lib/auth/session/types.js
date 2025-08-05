"use strict";
/**
 * 🔐 Tipos e Interfaces do Sistema de Gerenciamento de Sessões
 *
 * Este arquivo define todos os tipos TypeScript utilizados no sistema
 * de gerenciamento de sessões, incluindo interfaces para sessões,
 * dispositivos, eventos de segurança, notificações e atividades.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_ACTIONS = exports.NOTIFICATION_TYPES = exports.SECURITY_EVENT_TYPES = exports.ACTIVITY_TYPES = exports.NOTIFICATION_PRIORITIES = exports.NOTIFICATION_CHANNELS = exports.RISK_LEVELS = exports.SEVERITY_LEVELS = exports.DEVICE_TYPES = void 0;
exports.isDeviceType = isDeviceType;
exports.isSeverityLevel = isSeverityLevel;
exports.isRiskLevel = isRiskLevel;
exports.isNotificationChannel = isNotificationChannel;
exports.isNotificationPriority = isNotificationPriority;
exports.isActivityType = isActivityType;
exports.isSecurityEventType = isSecurityEventType;
exports.isNotificationType = isNotificationType;
exports.isAuditAction = isAuditAction;
// ============================================================================
// CONSTANTES DE TIPOS
// ============================================================================
/**
 * Valores válidos para tipos de dispositivo
 */
exports.DEVICE_TYPES = ['desktop', 'mobile', 'tablet', 'unknown'];
/**
 * Valores válidos para níveis de severidade
 */
exports.SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
/**
 * Valores válidos para níveis de risco
 */
exports.RISK_LEVELS = ['low', 'medium', 'high'];
/**
 * Valores válidos para canais de notificação
 */
exports.NOTIFICATION_CHANNELS = ['email', 'sms', 'push', 'inApp'];
/**
 * Valores válidos para prioridades de notificação
 */
exports.NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'critical'];
/**
 * Valores válidos para tipos de atividade
 */
exports.ACTIVITY_TYPES = [
    'page_view', 'click', 'form_submit', 'api_call', 'download',
    'upload', 'search', 'login', 'logout', 'session_extend', 'custom'
];
/**
 * Valores válidos para tipos de evento de segurança
 */
exports.SECURITY_EVENT_TYPES = [
    'login_attempt', 'login_failure', 'login_success', 'logout',
    'session_timeout', 'session_hijack_attempt', 'suspicious_activity',
    'device_registered', 'device_blocked', 'password_change',
    'email_change', 'security_violation', 'brute_force_attempt',
    'account_lockout', 'unusual_location', 'concurrent_sessions',
    'api_abuse', 'data_breach_attempt'
];
/**
 * Valores válidos para tipos de notificação
 */
exports.NOTIFICATION_TYPES = [
    'session_expiring', 'session_expired', 'new_device', 'suspicious_login',
    'security_alert', 'password_change', 'email_change', 'account_locked',
    'device_blocked', 'unusual_activity', 'system_maintenance',
    'feature_update', 'custom'
];
/**
 * Valores válidos para ações de auditoria
 */
exports.AUDIT_ACTIONS = [
    'create', 'read', 'update', 'delete', 'login', 'logout',
    'register', 'verify', 'reset_password', 'change_password',
    'change_email', 'enable_2fa', 'disable_2fa', 'trust_device',
    'block_device', 'extend_session', 'revoke_session', 'admin_action'
];
// ============================================================================
// GUARDS DE TIPO
// ============================================================================
/**
 * Verifica se um valor é um tipo de dispositivo válido
 */
function isDeviceType(value) {
    return exports.DEVICE_TYPES.includes(value);
}
/**
 * Verifica se um valor é um nível de severidade válido
 */
function isSeverityLevel(value) {
    return exports.SEVERITY_LEVELS.includes(value);
}
/**
 * Verifica se um valor é um nível de risco válido
 */
function isRiskLevel(value) {
    return exports.RISK_LEVELS.includes(value);
}
/**
 * Verifica se um valor é um canal de notificação válido
 */
function isNotificationChannel(value) {
    return exports.NOTIFICATION_CHANNELS.includes(value);
}
/**
 * Verifica se um valor é uma prioridade de notificação válida
 */
function isNotificationPriority(value) {
    return exports.NOTIFICATION_PRIORITIES.includes(value);
}
/**
 * Verifica se um valor é um tipo de atividade válido
 */
function isActivityType(value) {
    return exports.ACTIVITY_TYPES.includes(value);
}
/**
 * Verifica se um valor é um tipo de evento de segurança válido
 */
function isSecurityEventType(value) {
    return exports.SECURITY_EVENT_TYPES.includes(value);
}
/**
 * Verifica se um valor é um tipo de notificação válido
 */
function isNotificationType(value) {
    return exports.NOTIFICATION_TYPES.includes(value);
}
/**
 * Verifica se um valor é uma ação de auditoria válida
 */
function isAuditAction(value) {
    return exports.AUDIT_ACTIONS.includes(value);
}
exports.default = {};
