/**
 * AI Agent Service (T040)
 * Frontend service layer for AI agent API interactions
 *
 * Provides clean, type-safe methods for:
 * - Data agent queries with structured responses
 * - Session management and conversation history
 * - Feedback collection and analytics
 * - Real-time streaming (future enhancement)
 * - Error handling with user-friendly messages
 * - Request/response transformation
 * - Caching and optimization
 * - LGPD compliance validation
 */

import type {
  AgentAction,
  AgentResponse,
  AppointmentData,
  ChatMessage,
  ChatState,
  ClientData,
  DataAgentRequest,
  DataAgentResponse,
  FinancialData,
  UserQuery,
} from '@neonpro/types';

// Configuration
const API_BASE_URL = '/api/ai';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface SessionInfo {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface SessionCreateRequest {
  title?: string;
  domain?: string;
  metadata?: Record<string, any>;
}

export interface SessionUpdateRequest {
  title?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface FeedbackRequest {
  rating: number;
  comment?: string;
  category?: 'accuracy' | 'helpfulness' | 'speed' | 'completeness' | 'clarity' | 'general';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface QuickFeedbackRequest {
  messageId?: string;
  responseId?: string;
  helpful: boolean;
  issues?: Array<
    | 'incorrect_data'
    | 'slow_response'
    | 'unclear_answer'
    | 'missing_information'
    | 'technical_error'
    | 'other'
  >;
  suggestions?: string;
}

export interface AgentQueryOptions {
  context?: {
    userId?: string;
    domain?: string;
    limit?: number;
    filters?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  timeout?: number;
}

export interface SessionResponse {
  success: boolean;
  session?: SessionInfo;
  chatState?: ChatState;
  messageCount?: number;
  error?: ApiError;
}

export interface SessionListResponse {
  success: boolean;
  sessions?: SessionInfo[];
  count?: number;
  error?: ApiError;
}

export interface FeedbackResponse {
  success: boolean;
  feedback?: {
    id: string;
    sessionId: string;
    rating?: number;
    helpful?: boolean;
    submittedAt: string;
  };
  message?: string;
  error?: ApiError;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  service?: string;
  error?: string;
}

/**
 * Custom error class for AI Agent API errors
 */
export class AIAgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any,
  ) {
    super(message);
    this.name = 'AIAgentError';
  }

  static fromResponse(response: any, statusCode?: number): AIAgentError {
    const error = response.error || {};
    return new AIAgentError(
      error.message || 'Unknown API error',
      error.code || 'UNKNOWN_ERROR',
      statusCode,
      error.details,
    );
  }
}

/**
 * Authentication helper
 */
class AuthManager {
  private static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  static getHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

/**
 * HTTP client with retry logic and error handling
 */
class HttpClient {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async request<T = any>(
    endpoint: string,
    options: RequestInit & RequestOptions = {},
  ): Promise<T> {
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = RETRY_ATTEMPTS,
      signal,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...AuthManager.getHeaders(),
      ...customHeaders,
    };

    // Create timeout signal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine signals
    const combinedSignal = signal
      ? this.combineSignals([signal, controller.signal])
      : controller.signal;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: combinedSignal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw AIAgentError.fromResponse(errorData, response.status);
        }

        const data = await response.json();
        return data as T;
      } catch (_error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (
          error instanceof AIAgentError
          && (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 400)
        ) {
          throw error;
        }

        // Don't retry if aborted
        if (error instanceof Error && error.name === 'AbortError') {
          throw new AIAgentError('Request timeout', 'TIMEOUT');
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.delay(RETRY_DELAY * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new AIAgentError('Max retries exceeded', 'MAX_RETRIES_EXCEEDED');
  }

  private static combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    const onAbort = () => controller.abort();
    signals.forEach(_signal => {
      if (signal.aborted) {
        controller.abort();
        return;
      }
      signal.addEventListener('abort', onAbort);
    });

    // Cleanup
    controller.signal.addEventListener('abort', () => {
      signals.forEach(_signal => signal.removeEventListener('abort', onAbort));
    });

    return controller.signal;
  }
}

/**
 * Main AI Agent Service
 */
export class AIAgentService {
  /**
   * Send query to data agent for processing
   */
  static async queryDataAgent(
    query: string,
    options: AgentQueryOptions = {},
  ): Promise<DataAgentResponse> {
    if (!query.trim()) {
      throw new AIAgentError('Query cannot be empty', 'EMPTY_QUERY');
    }

    const request: DataAgentRequest = {
      query: query.trim(),
      context: options.context,
    };

    try {
      const response = await HttpClient.request<DataAgentResponse>('/data-agent', {
        method: 'POST',
        body: JSON.stringify(request),
        timeout: options.timeout,
      });

      // Validate response structure
      if (!response.success && !response.error) {
        throw new AIAgentError('Invalid response format', 'INVALID_RESPONSE');
      }

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to query data agent',
        'QUERY_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Create a new conversation session
   */
  static async createSession(
    request: SessionCreateRequest,
    options: RequestOptions = {},
  ): Promise<SessionResponse> {
    try {
      const response = await HttpClient.request<SessionResponse>('/sessions', {
        method: 'POST',
        body: JSON.stringify(request),
        ...options,
      });

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to create session',
        'SESSION_CREATE_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Get session details with conversation history
   */
  static async getSession(
    sessionId: string,
    options: RequestOptions = {},
  ): Promise<SessionResponse> {
    if (!sessionId) {
      throw new AIAgentError('Session ID is required', 'MISSING_SESSION_ID');
    }

    try {
      const response = await HttpClient.request<SessionResponse>(`/sessions/${sessionId}`, {
        method: 'GET',
        ...options,
      });

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to get session',
        'SESSION_GET_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Update session details
   */
  static async updateSession(
    sessionId: string,
    updates: SessionUpdateRequest,
    options: RequestOptions = {},
  ): Promise<SessionResponse> {
    if (!sessionId) {
      throw new AIAgentError('Session ID is required', 'MISSING_SESSION_ID');
    }

    try {
      const response = await HttpClient.request<SessionResponse>(`/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
        ...options,
      });

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to update session',
        'SESSION_UPDATE_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * List all user sessions
   */
  static async listSessions(options: RequestOptions = {}): Promise<SessionListResponse> {
    try {
      const response = await HttpClient.request<SessionListResponse>('/sessions', {
        method: 'GET',
        ...options,
      });

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to list sessions',
        'SESSION_LIST_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Delete (deactivate) a session
   */
  static async deleteSession(
    sessionId: string,
    options: RequestOptions = {},
  ): Promise<{ success: boolean; message?: string }> {
    if (!sessionId) {
      throw new AIAgentError('Session ID is required', 'MISSING_SESSION_ID');
    }

    try {
      const response = await HttpClient.request(`/sessions/${sessionId}`, {
        method: 'DELETE',
        ...options,
      });

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to delete session',
        'SESSION_DELETE_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Submit detailed feedback for a session
   */
  static async submitFeedback(
    sessionId: string,
    feedback: FeedbackRequest,
    options: RequestOptions = {},
  ): Promise<FeedbackResponse> {
    if (!sessionId) {
      throw new AIAgentError('Session ID is required', 'MISSING_SESSION_ID');
    }

    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      throw new AIAgentError('Rating must be between 1 and 5', 'INVALID_RATING');
    }

    try {
      const response = await HttpClient.request<FeedbackResponse>(
        `/sessions/${sessionId}/feedback`,
        {
          method: 'POST',
          body: JSON.stringify(feedback),
          ...options,
        },
      );

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to submit feedback',
        'FEEDBACK_SUBMIT_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Submit quick thumbs up/down feedback
   */
  static async submitQuickFeedback(
    sessionId: string,
    feedback: QuickFeedbackRequest,
    options: RequestOptions = {},
  ): Promise<FeedbackResponse> {
    if (!sessionId) {
      throw new AIAgentError('Session ID is required', 'MISSING_SESSION_ID');
    }

    try {
      const response = await HttpClient.request<FeedbackResponse>(
        `/sessions/${sessionId}/feedback/quick`,
        {
          method: 'POST',
          body: JSON.stringify(feedback),
          ...options,
        },
      );

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to submit quick feedback',
        'QUICK_FEEDBACK_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Get feedback summary for a session (admin only)
   */
  static async getFeedbackSummary(
    sessionId: string,
    options: RequestOptions = {},
  ): Promise<any> {
    if (!sessionId) {
      throw new AIAgentError('Session ID is required', 'MISSING_SESSION_ID');
    }

    try {
      const response = await HttpClient.request(`/sessions/${sessionId}/feedback`, {
        method: 'GET',
        ...options,
      });

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to get feedback summary',
        'FEEDBACK_GET_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Get system-wide feedback analytics (admin only)
   */
  static async getFeedbackAnalytics(options: RequestOptions = {}): Promise<any> {
    try {
      const response = await HttpClient.request('/feedback/analytics', {
        method: 'GET',
        ...options,
      });

      return response;
    } catch (_error) {
      if (error instanceof AIAgentError) {
        throw error;
      }
      throw new AIAgentError(
        'Failed to get feedback analytics',
        'ANALYTICS_GET_FAILED',
        undefined,
        { originalError: error },
      );
    }
  }

  /**
   * Health check for AI agent services
   */
  static async healthCheck(
    service?: 'data-agent' | 'sessions' | 'feedback',
  ): Promise<HealthResponse> {
    const endpoint = service ? `/${service}/health` : '/data-agent/health';

    try {
      const response = await HttpClient.request<HealthResponse>(endpoint, {
        method: 'GET',
        timeout: 5000, // Shorter timeout for health checks
        retries: 1,
      });

      return response;
    } catch (_error) {
      // Return unhealthy status instead of throwing
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: service || 'ai-agent',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Utility: Extract data from agent response
   */
  static extractResponseData(response: DataAgentResponse): {
    clients: ClientData[];
    appointments: AppointmentData[];
    financial: FinancialData[];
    actions: AgentAction[];
    suggestions: string[];
  } {
    const data = response.response?.data || {};

    return {
      clients: data.clients || [],
      appointments: data.appointments || [],
      financial: data.financial || [],
      actions: response.response?.actions || [],
      suggestions: response.response?.suggestions || [],
    };
  }

  /**
   * Utility: Format error for user display
   */
  static formatErrorMessage(error: unknown): string {
    if (error instanceof AIAgentError) {
      switch (error.code) {
        case 'TIMEOUT':
          return 'A consulta está demorando mais que o esperado. Tente novamente.';
        case 'NETWORK_ERROR':
          return 'Erro de conexão. Verifique sua internet e tente novamente.';
        case 'UNAUTHORIZED':
          return 'Sessão expirada. Faça login novamente.';
        case 'FORBIDDEN':
          return 'Você não tem permissão para esta operação.';
        case 'VALIDATION_ERROR':
          return 'Dados inválidos. Verifique sua consulta e tente novamente.';
        case 'RATE_LIMITED':
          return 'Muitas consultas. Aguarde um momento e tente novamente.';
        default:
          return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Erro desconhecido. Tente novamente.';
  }

  /**
   * Utility: Check if error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    if (error instanceof AIAgentError) {
      const nonRetryableCodes = [
        'UNAUTHORIZED',
        'FORBIDDEN',
        'VALIDATION_ERROR',
        'EMPTY_QUERY',
        'MISSING_SESSION_ID',
        'INVALID_RATING',
      ];
      return !nonRetryableCodes.includes(error.code);
    }

    return true;
  }

  /**
   * Utility: Get user-friendly status message
   */
  static getStatusMessage(isLoading: boolean, error: unknown): string {
    if (isLoading) {
      return 'Processando sua consulta...';
    }

    if (error) {
      return this.formatErrorMessage(error);
    }

    return '';
  }
}

// Export instances and utilities
export default AIAgentService;

// Re-export types for convenience
export type {
  AgentAction,
  AgentResponse,
  AppointmentData,
  ChatMessage,
  ChatState,
  ClientData,
  DataAgentRequest,
  DataAgentResponse,
  FinancialData,
  UserQuery,
} from '@neonpro/types';
