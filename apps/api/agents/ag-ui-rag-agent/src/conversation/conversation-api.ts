import { WebSocket } from 'ws';
import { SupabaseConnector } from '../database/supabase-connector';
import { HealthcareLogger } from '../logging/healthcare-logger';
import { SessionManager } from '../session/session-manager';
import {
  ConversationRequest,
  ConversationResponse,
  ConversationService,
} from './conversation-service';

export interface ConversationAPIRequest {
  type:
    | 'start_conversation'
    | 'continue_conversation'
    | 'get_history'
    | 'get_details'
    | 'delete'
    | 'search';
  payload: any;
  requestId: string;
}

export interface ConversationAPIResponse {
  type: 'conversation_response' | 'conversation_history' | 'conversation_details' | 'error';
  payload: any;
  requestId: string;
  success: boolean;
  error?: string;
}

export class ConversationAPI {
  private conversationService: ConversationService;
  private logger: HealthcareLogger;
  private sessionManager: SessionManager;
  private supabaseConnector: SupabaseConnector;

  constructor(
    conversationService: ConversationService,
    logger: HealthcareLogger,
    sessionManager: SessionManager,
    supabaseConnector: SupabaseConnector,
  ) {
    this.conversationService = conversationService;
    this.logger = logger;
    this.sessionManager = sessionManager;
    this.supabaseConnector = supabaseConnector;
  }

  async handleRequest(
    request: ConversationAPIRequest,
    ws?: WebSocket,
  ): Promise<ConversationAPIResponse> {
    const { type, payload, requestId } = request;

    try {
      switch (type) {
        case 'start_conversation':
          return await this.handleStartConversation(payload, requestId, ws);

        case 'continue_conversation':
          return await this.handleContinueConversation(payload, requestId, ws);

        case 'get_history':
          return await this.handleGetHistory(payload, requestId);

        case 'get_details':
          return await this.handleGetDetails(payload, requestId);

        case 'delete':
          return await this.handleDeleteConversation(payload, requestId);

        case 'search':
          return await this.handleSearchConversations(payload, requestId);

        default:
          throw new Error(`Unknown request type: ${type}`);
      }
    } catch (error) {
      await this.logger.logError('conversation_api_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestType: type,
        payload,
        requestId,
        timestamp: new Date().toISOString(),
      });

      return {
        type: 'error',
        payload: null,
        requestId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async handleStartConversation(
    payload: ConversationRequest,
    requestId: string,
    ws?: WebSocket,
  ): Promise<ConversationAPIResponse> {
    try {
      // Validate required fields
      const requiredFields = ['sessionId', 'userId', 'clinicId', 'message'];
      for (const field of requiredFields) {
        if (!payload[field as keyof ConversationRequest]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const response = await this.conversationService.startConversation(payload);

      // Send real-time updates if WebSocket is available
      if (ws && ws.readyState === WebSocket.OPEN) {
        this.sendRealTimeUpdate(ws, {
          type: 'conversation_started',
          conversationId: response.conversationId,
          timestamp: new Date().toISOString(),
        });
      }

      await this.logger.logDataAccess(payload.userId, payload.clinicId, {
        action: 'api_start_conversation',
        resource: 'conversation_api',
        requestId,
        conversationId: response.conversationId,
        success: true,
      });

      return {
        type: 'conversation_response',
        payload: response,
        requestId,
        success: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to start conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleContinueConversation(
    payload: {
      conversationId: string;
      userId: string;
      message: string;
      context?: any;
    },
    requestId: string,
    ws?: WebSocket,
  ): Promise<ConversationAPIResponse> {
    try {
      // Validate required fields
      const requiredFields = ['conversationId', 'userId', 'message'];
      for (const field of requiredFields) {
        if (!payload[field as keyof typeof payload]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const response = await this.conversationService.continueConversation(
        payload.conversationId,
        payload.userId,
        payload.message,
        payload.context,
      );

      // Send real-time updates if WebSocket is available
      if (ws && ws.readyState === WebSocket.OPEN) {
        this.sendRealTimeUpdate(ws, {
          type: 'conversation_continued',
          conversationId: payload.conversationId,
          timestamp: new Date().toISOString(),
        });
      }

      await this.logger.logDataAccess(payload.userId, 'unknown', {
        action: 'api_continue_conversation',
        resource: 'conversation_api',
        requestId,
        conversationId: payload.conversationId,
        success: true,
      });

      return {
        type: 'conversation_response',
        payload: response,
        requestId,
        success: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to continue conversation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private async handleGetHistory(
    payload: {
      userId: string;
      clinicId: string;
      patientId?: string;
      limit?: number;
      offset?: number;
      status?: 'active' | 'archived';
    },
    requestId: string,
  ): Promise<ConversationAPIResponse> {
    try {
      // Validate required fields
      if (!payload.userId || !payload.clinicId) {
        throw new Error('Missing required fields: userId, clinicId');
      }

      const result = await this.conversationService.getConversationHistory(payload);

      await this.logger.logDataAccess(payload.userId, payload.clinicId, {
        action: 'api_get_history',
        resource: 'conversation_api',
        requestId,
        resultCount: result.conversations.length,
        success: true,
      });

      return {
        type: 'conversation_history',
        payload: result,
        requestId,
        success: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to get conversation history: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private async handleGetDetails(
    payload: {
      conversationId: string;
      userId: string;
    },
    requestId: string,
  ): Promise<ConversationAPIResponse> {
    try {
      // Validate required fields
      if (!payload.conversationId || !payload.userId) {
        throw new Error('Missing required fields: conversationId, userId');
      }

      const conversation = await this.conversationService.getConversationDetails(
        payload.conversationId,
        payload.userId,
      );

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await this.logger.logDataAccess(payload.userId, 'unknown', {
        action: 'api_get_details',
        resource: 'conversation_api',
        requestId,
        conversationId: payload.conversationId,
        success: true,
      });

      return {
        type: 'conversation_details',
        payload: conversation,
        requestId,
        success: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to get conversation details: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private async handleDeleteConversation(
    payload: {
      conversationId: string;
      userId: string;
    },
    requestId: string,
  ): Promise<ConversationAPIResponse> {
    try {
      // Validate required fields
      if (!payload.conversationId || !payload.userId) {
        throw new Error('Missing required fields: conversationId, userId');
      }

      await this.conversationService.deleteConversation(payload.conversationId, payload.userId);

      await this.logger.logDataAccess(payload.userId, 'unknown', {
        action: 'api_delete_conversation',
        resource: 'conversation_api',
        requestId,
        conversationId: payload.conversationId,
        success: true,
      });

      return {
        type: 'conversation_details',
        payload: { deleted: true, conversationId: payload.conversationId },
        requestId,
        success: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete conversation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private async handleSearchConversations(
    payload: {
      userId: string;
      clinicId: string;
      query: string;
      filters?: {
        patientId?: string;
        dateFrom?: string;
        dateTo?: string;
        status?: 'active' | 'archived';
      };
    },
    requestId: string,
  ): Promise<ConversationAPIResponse> {
    try {
      // Validate required fields
      if (!payload.userId || !payload.clinicId || !payload.query) {
        throw new Error('Missing required fields: userId, clinicId, query');
      }

      // Parse date filters if provided
      const filters = payload.filters ? { ...payload.filters } : undefined;
      if (filters?.dateFrom) {
        filters.dateFrom = new Date(filters.dateFrom);
      }
      if (filters?.dateTo) {
        filters.dateTo = new Date(filters.dateTo);
      }

      const conversations = await this.conversationService.searchConversations(
        payload.userId,
        payload.clinicId,
        payload.query,
        filters,
      );

      await this.logger.logDataAccess(payload.userId, payload.clinicId, {
        action: 'api_search_conversations',
        resource: 'conversation_api',
        requestId,
        query: payload.query,
        resultCount: conversations.length,
        success: true,
      });

      return {
        type: 'conversation_history',
        payload: { conversations, total: conversations.length },
        requestId,
        success: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to search conversations: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private sendRealTimeUpdate(ws: WebSocket, update: any): void {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'realtime_update',
          payload: update,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (error) {
      this.logger.logError('realtime_update_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        update,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Helper method to validate session from request payload
  private async validateSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      return session && session.userId === userId;
    } catch (error) {
      return false;
    }
  }

  // Helper method to check user permissions for conversation operations
  private async checkConversationPermissions(
    userId: string,
    clinicId: string,
    action: string,
  ): Promise<boolean> {
    try {
      return await this.supabaseConnector.validateDataAccess({
        userId,
        clinicId,
        action: action as any,
        resource: 'ai_conversation_contexts',
      });
    } catch (error) {
      return false;
    }
  }

  // Get API statistics
  getStatistics(): any {
    return {
      ...this.conversationService.getStatistics(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
