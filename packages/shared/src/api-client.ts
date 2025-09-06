/**
 * 🔗 Enhanced API Client - NeonPro Healthcare
 * ============================================
 *
 * Type-safe Hono RPC client with Zod validation, audit logging,
 * automatic retry, authentication management, and LGPD compliance.
 */

import type { Hono } from "hono";
import { hc } from "hono/client";
import type { z } from "zod";
// Import validation schemas
import {
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
} from "./schemas";
import type { AuditActionSchema, UserBaseSchema } from "./schemas";
import type { RpcClient } from "./types";
import type {
  SendWhatsappMessageRequest,
  WhatsappConfig,
  WhatsappConversation,
  WhatsappConversationFilters,
  WhatsappMessage,
  WhatsappMessageFilters,
} from "./types/whatsapp.types";

// API Error types
interface ApiValidationError {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    validation_errors?: ApiValidationError[];
  };
  message?: string;
}

interface ApiErrorObject {
  message?: string;
  error?: ApiErrorResponse;
}

// Enhanced API Client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  enableAuditLogging?: boolean;
  enableRequestValidation?: boolean;
  enableResponseValidation?: boolean;
  onRequest?: (context: RequestContext) => Promise<RequestInit> | RequestInit;
  onResponse?: (context: ResponseContext) => Promise<Response> | Response;
  onError?: (context: ErrorContext) => void;
  onAuditLog?: (log: AuditLogEntry) => void;
}

// Request/Response context types
export interface RequestContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  init: RequestInit;
  attempt: number;
}

export interface ResponseContext {
  request: RequestContext;
  response: Response;
  duration: number;
}

export interface ErrorContext {
  request: RequestContext;
  error: Error;
  attempt: number;
  isRetryable: boolean;
}

// Audit logging
export interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  sessionId?: string;
  action: z.infer<typeof AuditActionSchema>;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  request_duration?: number;
  request_size?: number;
  response_size?: number;
}

// API Response wrapper with enhanced error handling
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    code: string;
    details?: Record<string, unknown>;
    validation_errors?: {
      field: string;
      message: string;
      code: string;
    }[];
  };
  meta?: {
    request_id: string;
    timestamp: string;
    duration: number;
    cached?: boolean;
  };
}

// Default configuration
const DEFAULT_CONFIG: Required<
  Omit<ApiClientConfig, "onRequest" | "onResponse" | "onError" | "onAuditLog">
> = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30_000, // 30 seconds
  retries: 3,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Version": process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  },
  enableAuditLogging: true,
  enableRequestValidation: true,
  enableResponseValidation: true,
};

// Enhanced Auth Token Manager with session tracking
class AuthTokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private sessionId: string | null = null;
  private user: z.infer<typeof UserBaseSchema> | null = null;
  private refreshPromise: Promise<string> | null = null;
  private tokenExpiry: Date | null = null;

  setTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn?: number,
    user?: z.infer<typeof UserBaseSchema>,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user || null;

    // Calculate expiry time
    if (expiresIn) {
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    }

    // Generate session ID if not present
    if (!this.sessionId) {
      this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    // Store in localStorage if available (browser)
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("neonpro_access_token", accessToken);
      localStorage.setItem("neonpro_refresh_token", refreshToken);
      localStorage.setItem("neonpro_session_id", this.sessionId);
      if (user) {
        localStorage.setItem("neonpro_user", JSON.stringify(user));
      }
      if (this.tokenExpiry) {
        localStorage.setItem(
          "neonpro_token_expiry",
          this.tokenExpiry.toISOString(),
        );
      }
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken && this.isTokenValid()) {
      return this.accessToken;
    }

    // Try to restore from localStorage (browser)
    if (typeof localStorage !== "undefined") {
      this.accessToken = localStorage.getItem("neonpro_access_token");
      const expiryStr = localStorage.getItem("neonpro_token_expiry");
      if (expiryStr) {
        this.tokenExpiry = new Date(expiryStr);
      }

      if (this.accessToken && this.isTokenValid()) {
        return this.accessToken;
      }
    }

    return null;
  }

  getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    }

    // Try to get from localStorage (browser)
    if (typeof localStorage !== "undefined") {
      this.refreshToken = localStorage.getItem("neonpro_refresh_token");
    }

    return this.refreshToken;
  }

  getSessionId(): string | null {
    if (this.sessionId) {
      return this.sessionId;
    }

    // Try to get from localStorage (browser)
    if (typeof localStorage !== "undefined") {
      this.sessionId = localStorage.getItem("neonpro_session_id");
    }

    return this.sessionId;
  }

  getUser(): z.infer<typeof UserBaseSchema> | null {
    if (this.user) {
      return this.user;
    }

    // Try to restore from localStorage (browser)
    if (typeof localStorage !== "undefined") {
      const userStr = localStorage.getItem("neonpro_user");
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
          return this.user;
        } catch {
          // Invalid JSON, ignore
        }
      }
    }

    return null;
  }

  isTokenValid(): boolean {
    if (!this.tokenExpiry) {
      return true; // Assume valid if no expiry info
    }

    // Check if token expires in the next 5 minutes (refresh proactively)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return this.tokenExpiry > fiveMinutesFromNow;
  }

  shouldRefresh(): boolean {
    return Boolean(this.refreshToken) && !this.isTokenValid();
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.sessionId = null;
    this.user = null;
    this.tokenExpiry = null;
    this.refreshPromise = null;

    // Clear from localStorage (browser)
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("neonpro_access_token");
      localStorage.removeItem("neonpro_refresh_token");
      localStorage.removeItem("neonpro_session_id");
      localStorage.removeItem("neonpro_user");
      localStorage.removeItem("neonpro_token_expiry");
    }
  }

  async refreshAccessToken(config: { baseUrl: string; }): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    this.refreshPromise = (async () => {
      try {
        // Validate request
        const request = RefreshTokenRequestSchema.parse({
          refresh_token: refreshToken,
        });

        const response = await fetch(`${config.baseUrl}/api/v1/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to refresh token`);
        }

        const result = await response.json();

        // Validate response
        const validatedResponse = RefreshTokenResponseSchema.parse(result);

        if (validatedResponse.success && validatedResponse.data) {
          this.setTokens(
            validatedResponse.data.access_token,
            validatedResponse.data.refresh_token,
            validatedResponse.data.expires_in,
          );
          return validatedResponse.data.access_token;
        }

        throw new Error("Invalid refresh response");
      } catch (error) {
        this.clearTokens();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

// Create token manager instance
const tokenManager = new AuthTokenManager();

// Request validator using Zod schemas
class RequestValidator {
  static validateLoginRequest(data: unknown) {
    return LoginRequestSchema.parse(data);
  }

  static validateRefreshTokenRequest(data: unknown) {
    return RefreshTokenRequestSchema.parse(data);
  }

  // Add more validation methods as needed for other schemas
  // These can be dynamically generated based on the schema exports
}

// Response validator using Zod schemas
class ResponseValidator {
  static validateLoginResponse(data: unknown) {
    return LoginResponseSchema.parse(data);
  }

  static validateRefreshTokenResponse(data: unknown) {
    return RefreshTokenResponseSchema.parse(data);
  }

  // Add more validation methods as needed
}

// Audit logger for compliance
class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private readonly maxLogs = 1000; // Keep last 1000 logs in memory

  log(entry: AuditLogEntry) {
    // Validate audit entry
    try {
      const validatedEntry = {
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
      };

      this.logs.unshift(validatedEntry);

      // Keep only maxLogs entries
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }

      // Send to external audit system if configured
      // This could be sent to your backend audit endpoint
      if (typeof window !== "undefined" && window.navigator.sendBeacon) {
        // Use sendBeacon for reliable audit logging
        const auditData = JSON.stringify(validatedEntry);
        window.navigator.sendBeacon("/api/v1/audit-log", auditData);
      }
    } catch {}
  }

  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

// Create audit logger instance
const auditLogger = new AuditLogger();

// Utility functions
export const ApiUtils = {
  // Get client IP (best effort)
  getClientIP: (): string => {
    if (typeof window === "undefined") {
      return "unknown";
    }

    // In production, this would typically come from headers set by your proxy/CDN
    return "client-ip"; // Placeholder
  },

  // Generate request ID
  generateRequestId: (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  },

  // Check if running in browser
  isBrowser: (): boolean => {
    return (
      typeof window !== "undefined" && typeof window.navigator !== "undefined"
    );
  },

  // Get user agent
  getUserAgent: (): string => {
    if (ApiUtils.isBrowser()) {
      return window.navigator.userAgent;
    }
    return "NeonPro-Client/1.0.0";
  },

  // Format bytes
  formatBytes: (bytes: number): string => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  },

  // Check if error is a network error that should be retried
  isNetworkError: (error: Error): boolean => {
    // Network errors that should be retried
    return (
      error.name === "TypeError"
      || error.name === "NetworkError"
      || error.message.includes("fetch")
      || error.message.includes("network")
      || error.message.includes("timeout")
      || error.message.includes("connection")
    );
  },
};

// Create enhanced API client factory
export function createApiClient(config: Partial<ApiClientConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Create Hono RPC client - using generic Hono type for now
  const client = hc<Hono>(finalConfig.baseUrl, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestStart = Date.now();
      const requestId = ApiUtils.generateRequestId();
      const token = tokenManager.getAccessToken();

      // Check if we should refresh the token proactively
      if (tokenManager.shouldRefresh()) {
        try {
          await tokenManager.refreshAccessToken(finalConfig);
        } catch {}
      }

      // Build headers
      const authHeaders: Record<string, string> = {
        ...finalConfig.headers,
        "X-Request-ID": requestId,
        "X-Timestamp": new Date().toISOString(),
      };

      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }

      const sessionId = tokenManager.getSessionId();
      if (sessionId) {
        authHeaders["X-Session-ID"] = sessionId;
      }

      // Add user context
      const user = tokenManager.getUser();
      if (user) {
        authHeaders["X-User-ID"] = user.id;
        authHeaders["X-User-Role"] = user.role;
      }

      // Merge headers with init
      init = {
        ...init,
        headers: {
          ...init?.headers,
          ...authHeaders,
        },
        signal: AbortSignal.timeout(finalConfig.timeout),
      };

      let response: Response;
      let lastError: Error | null = null;
      const url = typeof input === "string" ? input : input.toString();

      // Extract resource info for audit logging
      const urlParts = url.split("/");
      const resourceType = urlParts.at(-2) || "unknown";
      const action = (init?.method?.toLowerCase() as unknown) || "read";

      // Retry logic
      for (let attempt = 0; attempt <= finalConfig.retries; attempt++) {
        try {
          const requestContext: RequestContext = {
            url,
            method: init?.method || "GET",
            headers: (init?.headers as Record<string, string>) || {},
            body: init?.body,
            init: init || {},
            attempt,
          };

          response = await fetch(input, init);
          const duration = Date.now() - requestStart;

          // Handle 401 (token expired) - try to refresh
          if (response.status === 401 && attempt === 0) {
            try {
              const newToken = await tokenManager.refreshAccessToken(finalConfig);

              // Retry with new token
              const newInit = {
                ...init,
                headers: {
                  ...init?.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              };

              response = await fetch(input, newInit);
            } catch {
              // Refresh failed, clear tokens and continue with original response
              tokenManager.clearTokens();
            }
          }

          // Create response context
          const responseContext: ResponseContext = {
            request: requestContext,
            response: response.clone(), // Clone to avoid body consumption issues
            duration,
          };

          // Apply custom response transformation
          if (config.onResponse) {
            response = await config.onResponse(responseContext);
          }

          // Log successful request for audit
          if (finalConfig.enableAuditLogging) {
            const user = tokenManager.getUser();
            auditLogger.log({
              timestamp: new Date().toISOString(),
              userId: user?.id || "",
              sessionId: tokenManager.getSessionId() || "",
              action: action as z.infer<typeof AuditActionSchema>,
              resource_type: resourceType,
              ip_address: ApiUtils.getClientIP(),
              user_agent: ApiUtils.getUserAgent(),
              success: response.ok,
              error_message: response.ok ? "" : `HTTP ${response.status}`,
              request_duration: duration,
              request_size: init?.body ? JSON.stringify(init.body).length : 0,
              response_size: Number.parseInt(
                response.headers.get("content-length") || "0",
                10,
              ),
            });
          }

          return response;
        } catch (error) {
          lastError = error as Error;
          const duration = Date.now() - requestStart;

          // Log failed request for audit
          if (finalConfig.enableAuditLogging) {
            const user = tokenManager.getUser();
            auditLogger.log({
              timestamp: new Date().toISOString(),
              userId: user?.id || "",
              sessionId: tokenManager.getSessionId() || "",
              action: action as z.infer<typeof AuditActionSchema>,
              resource_type: resourceType,
              ip_address: ApiUtils.getClientIP(),
              user_agent: ApiUtils.getUserAgent(),
              success: false,
              error_message: lastError.message,
              request_duration: duration,
            });
          }

          // Create error context
          const errorContext: ErrorContext = {
            request: {
              url,
              method: init?.method || "GET",
              headers: (init?.headers as Record<string, string>) || {},
              body: init?.body,
              init: init || {},
              attempt,
            },
            error: lastError,
            attempt,
            isRetryable: attempt < finalConfig.retries
              && !lastError.message.includes("AbortError"),
          };

          if (config.onError) {
            config.onError(errorContext);
          }

          // Don't retry on timeout or abort errors on last attempt
          if (attempt === finalConfig.retries) {
            break;
          }

          // Don't retry non-network errors
          if (!ApiUtils.isNetworkError(lastError)) {
            break;
          }

          // Exponential backoff delay
          const delay = Math.min(1000 * 2 ** attempt, 10_000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // If we get here, all retries failed
      throw lastError || new Error("All retry attempts failed");
    },
  });

  // Return enhanced client with additional methods
  return {
    ...(client as Record<string, unknown>),

    // Authentication methods
    auth: {
      setTokens: (
        accessToken: string,
        refreshToken: string,
        expiresIn?: number,
        user?: z.infer<typeof UserBaseSchema>,
      ) => {
        tokenManager.setTokens(accessToken, refreshToken, expiresIn, user);
      },

      getAccessToken: () => tokenManager.getAccessToken(),

      getRefreshToken: () => tokenManager.getRefreshToken(),

      getSessionId: () => tokenManager.getSessionId(),

      getUser: () => tokenManager.getUser(),

      clearTokens: () => tokenManager.clearTokens(),

      isAuthenticated: () => Boolean(tokenManager.getAccessToken()),

      shouldRefresh: () => tokenManager.shouldRefresh(),

      refreshToken: () => tokenManager.refreshAccessToken(finalConfig),
    },

    // Audit and compliance methods
    audit: {
      getLogs: () => auditLogger.getLogs(),
      clearLogs: () => auditLogger.clearLogs(),
      log: (entry: AuditLogEntry) => auditLogger.log(entry),
    },

    // Utility methods
    utils: ApiUtils,

    // Validation methods (for use in hooks)
    validators: {
      request: RequestValidator,
      response: ResponseValidator,
    },

    // WhatsApp Business API methods
    whatsapp: {
      // Send WhatsApp message
      sendMessage: async (
        params: SendWhatsappMessageRequest,
      ): Promise<ApiResponse<{ messageId: string; status: string; }>> => {
        const response = await fetch(`${finalConfig.baseUrl}/api/v1/whatsapp/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenManager.getAccessToken()}`,
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to send WhatsApp message`);
        }

        return response.json();
      },

      // Get WhatsApp messages for a conversation
      getMessages: async (
        params: WhatsappMessageFilters,
      ): Promise<ApiResponse<{ messages: WhatsappMessage[]; }>> => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });

        const response = await fetch(
          `${finalConfig.baseUrl}/api/v1/whatsapp/messages?${searchParams}`,
          {
            headers: {
              Authorization: `Bearer ${tokenManager.getAccessToken()}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to get WhatsApp messages`);
        }

        return response.json();
      },

      // Get WhatsApp conversations
      getConversations: async (
        params: WhatsappConversationFilters,
      ): Promise<ApiResponse<{ conversations: WhatsappConversation[]; }>> => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });

        const response = await fetch(
          `${finalConfig.baseUrl}/api/v1/whatsapp/conversations?${searchParams}`,
          {
            headers: {
              Authorization: `Bearer ${tokenManager.getAccessToken()}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to get WhatsApp conversations`);
        }

        return response.json();
      },

      // Get WhatsApp configuration for clinic
      getConfig: async (clinicId: string) => {
        const response = await fetch(
          `${finalConfig.baseUrl}/api/v1/whatsapp/config/${clinicId}`,
          {
            headers: {
              Authorization: `Bearer ${tokenManager.getAccessToken()}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to get WhatsApp config`);
        }

        return response.json();
      },

      // Update WhatsApp configuration
      updateConfig: async (clinicId: string, config: Partial<WhatsappConfig>) => {
        const response = await fetch(
          `${finalConfig.baseUrl}/api/v1/whatsapp/config/${clinicId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenManager.getAccessToken()}`,
            },
            body: JSON.stringify(config),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to update WhatsApp config`);
        }

        return response.json();
      },

      // Get WhatsApp analytics
      getAnalytics: async (params: {
        clinicId: string;
        dateFrom?: string;
        dateTo?: string;
        period?: "day" | "week" | "month";
      }) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });

        const response = await fetch(
          `${finalConfig.baseUrl}/api/v1/whatsapp/analytics?${searchParams}`,
          {
            headers: {
              Authorization: `Bearer ${tokenManager.getAccessToken()}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to get WhatsApp analytics`);
        }

        return response.json();
      },

      // Check WhatsApp health status
      checkHealth: async () => {
        const response = await fetch(`${finalConfig.baseUrl}/api/v1/whatsapp/health`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: WhatsApp health check failed`);
        }

        return response.json();
      },
    },
  };
}

// Default API client instance
export const apiClient = createApiClient();

// Type exports
export type ApiClient = ReturnType<typeof createApiClient>;
export type { RpcClient };

// Export utilities and classes for advanced usage
export {
  AuditLogger,
  auditLogger,
  AuthTokenManager,
  RequestValidator,
  ResponseValidator,
  tokenManager,
};

// Helper functions for common patterns
export const ApiHelpers = {
  // Handle API response with enhanced error checking and validation
  handleResponse: async <T>(
    response: Response,
    validator?: (data: unknown) => T,
  ): Promise<ApiResponse<T>> => {
    try {
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || "API_ERROR",
            details: data.error?.details,
            validation_errors: data.error?.validation_errors,
          },
          message: data.message || "Unknown error occurred",
          meta: {
            request_id: response.headers.get("X-Request-ID") || "unknown",
            timestamp: new Date().toISOString(),
            duration: 0, // Would need to be calculated from calling context
          },
        };
      }

      // Validate response if validator provided
      let validatedData: T | undefined;
      if (validator) {
        try {
          validatedData = validator(data);
        } catch (error) {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              details: { validation_error: String(error) },
            },
            message: "Response validation failed",
            meta: {
              request_id: response.headers.get("X-Request-ID") || "unknown",
              timestamp: new Date().toISOString(),
              duration: 0,
            },
          };
        }
      } else {
        validatedData = data as T;
      }

      return {
        success: true,
        data: validatedData,
        message: data.message || "Success",
        meta: {
          request_id: response.headers.get("X-Request-ID") || "unknown",
          timestamp: new Date().toISOString(),
          duration: 0, // Would need to be calculated from calling context
          cached: response.headers.get("X-Cache") === "HIT",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PARSE_ERROR",
          details: { parse_error: String(error) },
        },
        message: "Failed to parse response",
        meta: {
          request_id: response.headers.get("X-Request-ID") || "unknown",
          timestamp: new Date().toISOString(),
          duration: 0,
        },
      };
    }
  },

  // Create query key for TanStack Query with enhanced structure
  createQueryKey: (
    endpoint: string,
    params?: Record<string, unknown>,
    userId?: string,
  ): string[] => {
    const key = ["api", endpoint];
    if (userId) {
      key.push("user", userId);
    }
    if (params && Object.keys(params).length > 0) {
      key.push(JSON.stringify(params));
    }
    return key;
  },

  // Format error message for display with validation details
  formatError: (error: unknown): string => {
    if (typeof error === "string") {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "object" && error && "message" in error) {
      return String((error as { message: unknown; }).message);
    }

    if (typeof error === "object" && error && "error" in error) {
      const apiError = error as ApiErrorObject;
      const nested = apiError.error?.error;
      const topLevel = apiError.error;

      const nestedValidations = (nested as any)?.validation_errors;
      const topValidations = (topLevel as any)?.validation_errors;

      const validations = Array.isArray(nestedValidations) && nestedValidations.length > 0
        ? nestedValidations
        : Array.isArray(topValidations) && topValidations.length > 0
        ? topValidations
        : [];

      if (validations.length > 0) {
        return (validations as any[]).map((ve: any) => `${ve.field}: ${ve.message}`).join(", ");
      }

      return String(topLevel?.message || apiError.message || "API error occurred");
    }

    return "An unexpected error occurred";
  },

  // Check if error is network/connectivity issue
  isNetworkError: (error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes("fetch")
        || error.message.includes("network")
        || error.message.includes("timeout")
        || error.name === "AbortError"
        || error.name === "NetworkError"
      );
    }
    return false;
  },

  // Check if error is authentication issue
  isAuthError: (error: unknown): boolean => {
    // Accept either nested error.error.code or top-level error.code (as tests use)
    if (typeof error === "object" && error) {
      const maybeObj = error as any;
      const nestedCode = maybeObj?.error?.error?.code;
      const topLevelCode = maybeObj?.error?.code || maybeObj?.code;
      const code = nestedCode || topLevelCode;
      return code
        ? [
          "UNAUTHORIZED",
          "FORBIDDEN",
          "TOKEN_EXPIRED",
          "INVALID_CREDENTIALS",
          "SESSION_EXPIRED",
        ].includes(code)
        : false;
    }
    return false;
  },

  // Check if error is validation issue
  isValidationError: (error: unknown): boolean => {
    if (typeof error === "object" && error) {
      const maybeObj = error as any;
      const nested = maybeObj?.error?.error;
      const topLevel = maybeObj?.error;
      return (
        nested?.code === "VALIDATION_ERROR"
        || topLevel?.code === "VALIDATION_ERROR"
        || Array.isArray(nested?.validation_errors) && nested.validation_errors.length > 0
        || Array.isArray(topLevel?.validation_errors) && topLevel.validation_errors.length > 0
      );
    }
    return false;
  },

  // Check if error is rate limit issue
  isRateLimitError: (error: unknown): boolean => {
    if (typeof error === "object" && error && "error" in error) {
      const apiError = error as ApiErrorObject;
      const errorCode = apiError.error?.error?.code;
      return errorCode === "RATE_LIMIT_EXCEEDED";
    }
    return false;
  },
};

// ApiHelpers is already exported above, no need for redundant export
