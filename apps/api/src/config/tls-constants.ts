/**
 * TLS and HTTPS Configuration Constants
 *
 * This file contains all magic numbers, timeouts, and configuration values
 * used throughout the TLS and HTTPS server implementations.
 * Centralizing these values improves maintainability and makes configuration
 * changes easier to manage.
 */

// TLS Configuration Constants
export const TLS_CONSTANTS = {
  // Cipher suites organized by TLS version
  CIPHERS: {
    TLS_1_3: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'TLS_AES_256_CCM_8_SHA384',
      'TLS_AES_128_CCM_SHA256',
    ] as const,

    TLS_1_2: [
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305',
      'ECDHE-RSA-CHACHA20-POLY1305',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-SHA384',
      'ECDHE-RSA-AES256-SHA384',
    ] as const,
  },

  // Weak ciphers to detect and reject
  WEAK_CIPHERS: ['MD5', 'SHA1', 'RC4', 'DES', '3DES', 'NULL'] as const,

  // Security configuration values
  SECURITY: {
    MIN_TLS_VERSION: 'TLSv1.3' as const,
    HONOR_CIPHER_ORDER: true,
    SESSION_ID_TIMEOUT: 300, // 5 minutes in seconds
    SESSION_TIMEOUT: 3600, // 1 hour in seconds
    TICKET_KEY_SIZE: 48, // bytes for session ticket keys
    DH_PARAM_SIZE: 2048, // bits for Diffie-Hellman parameters
  },

  // Certificate validation defaults
  CERTIFICATE: {
    DEFAULT_VALIDITY_DAYS: 365,
    ISSUER_PLACEHOLDER: 'Certificate Authority Placeholder',
    SUBJECT_PLACEHOLDER: 'NeonPro Healthcare API',
  },
} as const;

// HTTPS Server Configuration Constants
export const HTTPS_CONSTANTS = {
  // Server configuration defaults
  SERVER: {
    DEFAULT_PORT: 443,
    DEFAULT_HTTP_PORT: 80,
    DEFAULT_HOST: '0.0.0.0',
    MAX_CONNECTIONS: 1000,
    TIMEOUT: 120000, // 2 minutes in milliseconds
    KEEP_ALIVE_TIMEOUT: 65000, // 65 seconds in milliseconds
    HEADERS_TIMEOUT: 60000, // 1 minute in milliseconds
  },

  // HSTS configuration
  HSTS: {
    MAX_AGE: 31536000, // 1 year in seconds
    INCLUDE_SUBDOMAINS: true,
    PRELOAD: false,
  },

  // Metrics and monitoring
  METRICS: {
    RESPONSE_TIME_SMOOTHING_FACTOR: 0.1, // Alpha for exponential moving average
    METRICS_RESET_INTERVAL: 3600000, // 1 hour in milliseconds
  },

  // Connection handling
  CONNECTION: {
    GRACEFUL_SHUTDOWN_TIMEOUT: 30000, // 30 seconds
    SOCKET_BACKLOG_SIZE: 511,
  },

  // Security headers
  SECURITY_HEADERS: {
    CONTENT_SECURITY_POLICY:
      'default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\';',
    X_FRAME_OPTIONS: 'DENY',
    X_CONTENT_TYPE_OPTIONS: 'nosniff',
    X_XSS_PROTECTION: '1; mode=block',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
  } as const,
} as const;

// Error handling constants
export const ERROR_CONSTANTS = {
  // Error types
  TYPES: {
    CONFIGURATION_ERROR: 'ConfigurationError',
    CERTIFICATE_ERROR: 'CertificateError',
    TLS_ERROR: 'TLSError',
    SERVER_ERROR: 'ServerError',
  } as const,

  // Error messages
  MESSAGES: {
    TLS_NOT_INITIALIZED: 'TLS configuration not initialized. Call initialize() first.',
    CERTIFICATE_LOAD_FAILED: 'Failed to load TLS certificates',
    CERTIFICATE_NOT_FOUND: 'Certificate file not found',
    SERVER_NOT_CREATED: 'HTTPS server not created. Call createServer() first.',
    INVALID_CONFIGURATION: 'Invalid configuration provided',
  } as const,

  // Error codes
  CODES: {
    CONFIGURATION_INVALID: 'E_CONFIG_INVALID',
    CERTIFICATE_MISSING: 'E_CERT_MISSING',
    TLS_INIT_FAILED: 'E_TLS_INIT_FAILED',
    SERVER_START_FAILED: 'E_SERVER_START_FAILED',
  } as const,
} as const;

// Logging constants
export const LOGGING_CONSTANTS = {
  // Event types
  EVENTS: {
    TLS_INITIALIZED: 'tls_configuration_initialized',
    TLS_VALIDATION_WARNING: 'tls_configuration_warnings',
    TLS_CONNECTION: 'tls_connection_established',
    HTTPS_SERVER_CREATED: 'https_server_created',
    HTTPS_SERVER_STARTED: 'https_server_started',
    HTTPS_SERVER_STOPPED: 'https_server_stopped',
    HTTP_REDIRECT: 'http_to_https_redirect',
    SERVER_ERROR: 'https_server_error',
    CLIENT_ERROR: 'https_client_error',
    CONNECTION_TIMEOUT: 'connection_timeout',
    SESSION_TICKETS_ROTATED: 'session_tickets_rotated',
    GRACEFUL_SHUTDOWN: 'server_shutdown_initiated',
  } as const,

  // Log levels
  LEVELS: {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    DEBUG: 'debug',
  } as const,
} as const;

// Type utilities for constants
export type TLSCipherSuite =
  | (typeof TLS_CONSTANTS.CIPHERS.TLS_1_3)[number]
  | (typeof TLS_CONSTANTS.CIPHERS.TLS_1_2)[number];
export type WeakCipher = (typeof TLS_CONSTANTS.WEAK_CIPHERS)[number];
export type ErrorType = (typeof ERROR_CONSTANTS.TYPES)[keyof typeof ERROR_CONSTANTS.TYPES];
export type LogEventType = (typeof LOGGING_CONSTANTS.EVENTS)[keyof typeof LOGGING_CONSTANTS.EVENTS];

// Utility functions for constants
export const getAllCiphers = (): TLSCipherSuite[] => [
  ...TLS_CONSTANTS.CIPHERS.TLS_1_3,
  ...TLS_CONSTANTS.CIPHERS.TLS_1_2,
];

export const isWeakCipher = (cipher: string): cipher is WeakCipher =>
  TLS_CONSTANTS.WEAK_CIPHERS.some(weak => cipher.includes(weak));

export const getDefaultTLSVersion = () => TLS_CONSTANTS.SECURITY.MIN_TLS_VERSION;

export const formatCipherList = (ciphers: TLSCipherSuite[]): string => ciphers.join(':');
