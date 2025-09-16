// ============================================================================
// NeonPro Shared Package Exports
// ============================================================================

// Core library
export const shared = { version: '1.0.0' };

// Telemetry and observability models
export * from './models/telemetry-event';

// Existing exports
export * from './types/ai-insights';
export * from './types/api';
export * from './types/appointment';
export * from './types/contact';
export * from './types/lgpd-consent';
export * from './types/medical-history';
export * from './types/notifications';
export * from './types/patient';

// Validators
export * from './validators/brazilian';

// Environment configuration
export * from './env/ai';

// Authentication
export * from './auth/auth-provider';
export * from './auth/protected-route';

// Components
export * from './components/healthcare-base';

// API client
export * from './api-client';

// Hooks
export * from './hooks/useRealtimeQuery';

// Internationalization
export * from './i18n/ai-chat';