/**
 * Simplified Vitest Setup - NeonPro Healthcare
 * ===========================================
 *
 * Essential mocks only - no complex async operations or extensive logging
 */

// CRITICAL: Polyfill HTMLFormElement.requestSubmit BEFORE any DOM setup
// This must happen before jsdom loads to prevent the "Not implemented" error
(globalThis as any).HTMLFormElement = (globalThis as any).HTMLFormElement || class {};
if (!(globalThis as any).HTMLFormElement.prototype.requestSubmit) {
  (globalThis as any).HTMLFormElement.prototype.requestSubmit = function(
    submitter?: HTMLElement,
  ) {
    // Create and dispatch submit event
    const event = new Event('submit', { bubbles: true, cancelable: true });

    if (submitter) {
      Object.defineProperty(event, 'submitter', {
        value: submitter,
        enumerable: true,
        writable: false,
        configurable: true,
      });
    }

    return this.dispatchEvent(event);
  };
}

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { beforeEach, vi } from 'vitest';

// Make React globally available
Object.defineProperty(global, 'React', { value: React });
Object.defineProperty(globalThis, 'React', { value: React });

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_ENVIRONMENT: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
};

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
  notFound: vi.fn(),
}));

// Remove TanStack Query global mocks - let tests handle their own QueryClient setup
// This follows official TanStack Query testing documentation which recommends
// using real QueryClient + QueryClientProvider with test-specific configuration

// Mock API client with all required methods
vi.mock('@neonpro/shared/api-client', () => ({
  ApiHelpers: {
    formatError: vi.fn((error: any) => {
      if (typeof error === 'string') {
        return error;
      }
      if (error instanceof Error) {
        return error.message;
      }
      if (typeof error === 'object' && error && 'message' in error) {
        return String(error.message);
      }
      if (typeof error === 'object' && error && 'error' in error) {
        const apiError = error as any;
        if (apiError.error?.validation_errors?.length > 0) {
          return apiError.error.validation_errors
            .map((ve: any) => `${ve.field}: ${ve.message}`)
            .join(', ');
        }
        return apiError.message || 'API error occurred';
      }
      return 'An unexpected error occurred';
    }),
    handleResponse: vi.fn(async (response: any, validator?: any) => {
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'API_ERROR',
            details: data.error?.details,
            validation_errors: data.error?.validation_errors,
          },
          message: data.message || 'Unknown error occurred',
          meta: {
            request_id: response.headers.get('X-Request-ID') || 'unknown',
            timestamp: new Date().toISOString(),
            duration: 0,
          },
        };
      }

      let validatedData = data;
      if (validator) {
        try {
          validatedData = validator(data);
        } catch (validationError) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              details: { validation_error: String(validationError) },
            },
            message: 'Response validation failed',
            meta: {
              request_id: response.headers.get('X-Request-ID') || 'unknown',
              timestamp: new Date().toISOString(),
              duration: 0,
            },
          };
        }
      }

      return {
        success: true,
        data: validatedData,
        message: data.message || 'Success',
        meta: {
          request_id: response.headers.get('X-Request-ID') || 'unknown',
          timestamp: new Date().toISOString(),
          duration: 0,
          cached: response.headers.get('X-Cache') === 'HIT',
        },
      };
    }),
    createQueryKey: vi.fn((endpoint: string, params?: any, userId?: string) => {
      const key = ['api', endpoint];
      if (userId) {
        key.push('user', userId);
      }
      if (params && Object.keys(params).length > 0) {
        key.push(JSON.stringify(params));
      }
      return key;
    }),
    isNetworkError: vi.fn((error: any) => {
      if (error instanceof Error) {
        return (
          error.message.includes('fetch')
          || error.message.includes('network')
          || error.message.includes('timeout')
          || error.name === 'AbortError'
          || error.name === 'NetworkError'
        );
      }
      return false;
    }),
    isAuthError: vi.fn((error: any) => {
      if (typeof error === 'object' && error && 'error' in error) {
        const errorCode = error.error?.code;
        return [
          'UNAUTHORIZED',
          'FORBIDDEN',
          'TOKEN_EXPIRED',
          'INVALID_CREDENTIALS',
          'SESSION_EXPIRED',
        ].includes(errorCode);
      }
      return false;
    }),
    isValidationError: vi.fn((error: any) => {
      if (typeof error === 'object' && error && 'error' in error) {
        const apiError = error as any;
        return (
          apiError.error?.code === 'VALIDATION_ERROR'
          || apiError.error?.validation_errors?.length > 0
        );
      }
      return false;
    }),
    isRateLimitError: vi.fn((error: any) => {
      if (typeof error === 'object' && error && 'error' in error) {
        const errorCode = error.error?.code;
        return errorCode === 'RATE_LIMIT_EXCEEDED';
      }
      return false;
    }),
  },
  apiClient: {
    auth: {
      setTokens: vi.fn(),
      getAccessToken: vi.fn(() => 'mock-token'),
      getRefreshToken: vi.fn(() => 'mock-refresh'),
      getSessionId: vi.fn(() => 'mock-session-id'),
      getUser: vi.fn(() => ({
        id: 'user-1',
        role: 'doctor',
        email: 'test@example.com',
      })),
      isAuthenticated: vi.fn(() => true),
      clearTokens: vi.fn(),
      shouldRefresh: vi.fn(() => false),
      refreshToken: vi.fn(() => Promise.resolve({ success: true })),
    },
    api: {
      v1: {
        auth: {
          login: { $post: vi.fn(() => Promise.resolve({ success: true })) },
          refresh: { $post: vi.fn(() => Promise.resolve({ success: true })) },
          logout: { $post: vi.fn(() => Promise.resolve({ success: true })) },
        },
        patients: {
          $post: vi.fn(() =>
            Promise.resolve({
              success: true,
              data: { id: 'patient-1', name: 'Test Patient' },
            })
          ),
          $get: vi.fn(() => Promise.resolve({ success: true, data: [] })),
        },
      },
    },
    audit: {
      log: vi.fn(() => Promise.resolve({ success: true })),
    },
    utils: {
      getUserAgent: vi.fn(() => 'test-agent'),
    },
  },
}));

// Mock shared schemas (empty for now)
vi.mock('@neonpro/shared/schemas', () => ({}));

// Essential browser API mocks
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'fetch', {
  value: vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  ),
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
};

// Enhanced browser API mocks
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

// Enhanced form submission polyfill for JSDOM compatibility
if (typeof HTMLFormElement !== 'undefined') {
  // Polyfill requestSubmit method
  if (!HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function(
      submitter?: HTMLElement,
    ) {
      // Validate submitter if provided
      if (submitter) {
        if (submitter.form !== this) {
          throw new DOMException(
            'The specified element is not a form-associated element.',
            'NotFoundError',
          );
        }
        if (submitter.type === 'submit' || submitter.type === 'image') {
          // Valid submitter types
        } else {
          throw new DOMException(
            'The specified element is not a submit button.',
            'InvalidStateError',
          );
        }
      }

      // Create synthetic submit event
      const event = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      // Set submitter property
      if (submitter) {
        Object.defineProperty(event, 'submitter', {
          value: submitter,
          enumerable: true,
          writable: false,
          configurable: true,
        });
      }

      // Dispatch the event
      const shouldContinue = this.dispatchEvent(event);

      // If not cancelled and no action, do nothing (as per spec)
      return shouldContinue;
    };
  }

  // Enhanced form validation polyfills
  if (!HTMLFormElement.prototype.checkValidity) {
    HTMLFormElement.prototype.checkValidity = function() {
      const formControls = this.querySelectorAll('input, select, textarea');
      let allValid = true;

      for (const control of formControls) {
        const element = control as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement;
        if (element.checkValidity && !element.checkValidity()) {
          allValid = false;
        }
      }

      return allValid;
    };
  }

  if (!HTMLFormElement.prototype.reportValidity) {
    HTMLFormElement.prototype.reportValidity = function() {
      return this.checkValidity();
    };
  }
}

// Also polyfill form elements if needed
if (
  typeof HTMLInputElement !== 'undefined'
  && !HTMLInputElement.prototype.checkValidity
) {
  HTMLInputElement.prototype.checkValidity = function() {
    // Basic validation for required fields
    if (this.required && !this.value.trim()) {
      return false;
    }
    return true;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Global mock services for integration tests
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'doctor',
            lgpd_consent_date: new Date().toISOString(),
          },
        },
        error: null,
      });
    }),
    getSession: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        data: { session: null },
        error: null,
      });
    }),
    getSessionId: vi.fn(() => 'test-session-id'),
    signInWithPassword: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        data: { session: null, user: null },
        error: null,
      });
    }),
    signUp: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        data: { user: null, session: null },
        error: null,
      });
    }),
    signOut: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        error: null,
      });
    }),
    onAuthStateChange: vi.fn().mockImplementation((_callback) => {
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn().mockImplementation(() => {}),
          },
        },
      };
    }),
    refreshSession: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
    setSession: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
    updateUser: vi
      .fn()
      .mockResolvedValue({ data: { user: null }, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
  },
  from: vi.fn().mockImplementation((_tableName: string) => {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
        single: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'new-id' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'updated-id' },
              error: null,
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    };
  }),
  storage: {
    from: vi.fn().mockImplementation((bucketName: string) => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: `https://example.com/${bucketName}/file.jpg` },
      }),
    })),
  },
};

const mockNotificationService = {
  sendEmergencyAlert: vi.fn().mockResolvedValue({
    alert_sent: true,
    recipients: ['emergency_supervisor', 'head_doctor', 'security'],
    timestamp: new Date().toISOString(),
  }),
  sendNotification: vi.fn().mockResolvedValue({
    notification_sent: true,
    notification_id: 'notif-123',
  }),
  getNotificationHistory: vi.fn().mockResolvedValue({
    notifications: [],
    total: 0,
  }),
  notifyMedicalStaff: vi.fn().mockResolvedValue({
    medical_team_alerted: true,
    specialists_contacted: ['cardiologist', 'anesthesiologist'],
    notification_sent: true,
  }),
  logEmergencyNotification: vi.fn().mockResolvedValue({
    notification_logged: true,
    audit_id: 'notification-audit-123',
    log_entry_created: true,
  }),
};

const mockLGPDService = {
  validatePurposeLimitation: vi.fn().mockResolvedValue({
    valid: true,
    purposes: ['healthcare', 'emergency'],
  }),
  processDataSubjectRequest: vi.fn().mockResolvedValue({
    success: true,
    request_id: 'req-123',
    status: 'processed',
  }),
  getAuditTrail: vi.fn().mockResolvedValue({
    success: true,
    audit_report: {
      total_entries: 0,
      entries: [],
    },
  }),
  checkRetentionPolicy: vi.fn().mockResolvedValue({
    policy_compliant: true,
    retention_periods: {
      medical_records: '10_years',
      appointment_history: '5_years',
      audit_logs: '7_years',
    },
  }),
  anonymizePatientData: vi.fn().mockResolvedValue({
    success: true,
    patient_id: 'anonymized',
    fields_anonymized: ['name', 'cpf', 'address'],
  }),
  recordConsent: vi.fn().mockResolvedValue({
    success: true,
    consent_id: 'consent-123',
  }),
  revokeConsent: vi.fn().mockResolvedValue({
    success: true,
    revocation_effective: true,
  }),
  createAuditEntry: vi.fn().mockResolvedValue({
    success: true,
    audit_id: 'audit-123',
    entry_created: true,
  }),
};

const mockCpfValidator = {
  isValid: vi.fn().mockReturnValue(true),
  format: vi.fn().mockImplementation((cpf: string) => cpf),
  validate: vi.fn().mockReturnValue({
    isValid: true,
    formatted: '123.456.789-00',
  }),
};

// Make global mocks available
Object.defineProperty(globalThis, 'mockSupabaseClient', {
  value: mockSupabaseClient,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'mockNotificationService', {
  value: mockNotificationService,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'mockLGPDService', {
  value: mockLGPDService,
  writable: true,
  configurable: true,
});

// Also lowercase for compatibility
Object.defineProperty(globalThis, 'mockLgpdService', {
  value: mockLGPDService,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'mockCpfValidator', {
  value: mockCpfValidator,
  writable: true,
  configurable: true,
});

// Also make them available on global for Node.js compatibility
Object.defineProperty(global, 'mockSupabaseClient', {
  value: mockSupabaseClient,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'mockNotificationService', {
  value: mockNotificationService,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'mockLGPDService', {
  value: mockLGPDService,
  writable: true,
  configurable: true,
});

// Also lowercase for compatibility
Object.defineProperty(global, 'mockLgpdService', {
  value: mockLGPDService,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'mockCpfValidator', {
  value: mockCpfValidator,
  writable: true,
  configurable: true,
});
