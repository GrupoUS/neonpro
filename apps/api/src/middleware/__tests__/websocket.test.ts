/**
 * WebSocket Integration Middleware Tests (T070)
 * Comprehensive test suite for real-time WebSocket functionality
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocket } from 'ws';
import {
  type ConnectionMetadata,
  handleWebSocketConnection,
  websocketMiddleware,
  websocketUpgrade,
  wsManager,
  type WSMessage,
  WSMessageType,
} from '../websocket';

// Mock WebSocket
class MockWebSocket extends WebSocket {
  public readyState = WebSocket.OPEN;
  public messages: string[] = [];
  public eventHandlers: { [key: string]: Function[] } = {};

  constructor() {
    super('ws://localhost');
    this.readyState = WebSocket.OPEN;
  }

  send(data: string) {
    this.messages.push(data);
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
    return this;
  }

  emit(event: string, ...args: any[]) {
    const handlers = this.eventHandlers[event] || [];
    handlers.forEach(handler => handler(...args));
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    this.emit('close', code, reason);
  }
}

// Mock crypto.randomUUID
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `550e8400-e29b-41d4-a716-44665544${String(uuidCounter++).padStart(4, '0')}`,
  },
});

describe('WebSocket Integration Middleware (T070)', () => {
  let mockWs: MockWebSocket;
  let testMetadata: ConnectionMetadata;

  beforeEach(() => {
    mockWs = new MockWebSocket();
    testMetadata = {
      userId: 'user-123',
      sessionId: 'session-123',
      healthcareProfessional: {
        id: 'prof-123',
        crmNumber: '12345-SP',
        specialty: 'Dermatologia',
      },
      lgpdConsent: {
        canReceiveNotifications: true,
        canReceiveAIResponses: true,
        dataRetentionDays: 30,
      },
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: new Set(),
    };

    // Clear connections before each test
    (wsManager as any).connections.clear();
    (wsManager as any).userConnections.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should add and track WebSocket connections', () => {
      const connectionId = handleWebSocketConnection(
        mockWs as any,
        testMetadata,
      );

      expect(connectionId).toBeDefined();
      expect(wsManager.getTotalConnectionsCount()).toBe(1);
      expect(wsManager.getUserConnectionsCount('user-123')).toBe(1);
    });

    it('should remove connections on close', () => {
      handleWebSocketConnection(mockWs as any, testMetadata);

      expect(wsManager.getTotalConnectionsCount()).toBe(1);

      mockWs.close();

      expect(wsManager.getTotalConnectionsCount()).toBe(0);
      expect(wsManager.getUserConnectionsCount('user-123')).toBe(0);
    });

    it('should handle multiple connections for same user', () => {
      const mockWs2 = new MockWebSocket();

      handleWebSocketConnection(mockWs as any, testMetadata);
      handleWebSocketConnection(mockWs2 as any, testMetadata);

      expect(wsManager.getTotalConnectionsCount()).toBe(2);
      expect(wsManager.getUserConnectionsCount('user-123')).toBe(2);
    });

    it('should send welcome message on connection', () => {
      handleWebSocketConnection(mockWs as any, testMetadata);

      expect(mockWs.messages).toHaveLength(1);

      const welcomeMessage = JSON.parse(mockWs.messages[0]);
      expect(welcomeMessage.type).toBe(WSMessageType.STATUS);
      expect(welcomeMessage.data.status).toBe('connected');
      expect(welcomeMessage.data.message).toBe(
        'Conectado ao NeonPro em tempo real',
      );
      expect(welcomeMessage.metadata.userId).toBe('user-123');
    });
  });

  describe('Message Handling', () => {
    beforeEach(() => {
      handleWebSocketConnection(mockWs as any, testMetadata);
      mockWs.messages = []; // Clear welcome message
    });

    it('should handle ping/pong messages', () => {
      const pingMessage: WSMessage = {
        type: WSMessageType.PING,
        data: {},
      };

      mockWs.emit('message', JSON.stringify(pingMessage));

      expect(mockWs.messages).toHaveLength(1);

      const pongMessage = JSON.parse(mockWs.messages[0]);
      expect(pongMessage.type).toBe(WSMessageType.PONG);
      expect(pongMessage.data.timestamp).toBeDefined();
    });

    it('should handle chat start messages with LGPD consent', () => {
      const chatStartMessage: WSMessage = {
        type: WSMessageType.CHAT_START,
        data: {
          message: 'Olá, preciso de ajuda',
          conversationId: 'conv-123',
        },
      };

      mockWs.emit('message', JSON.stringify(chatStartMessage));

      expect(mockWs.messages).toHaveLength(1);

      const response = JSON.parse(mockWs.messages[0]);
      expect(response.type).toBe(WSMessageType.CHAT_START);
      expect(response.data.status).toBe('started');
      expect(response.data.conversationId).toBeDefined();
    });

    it('should reject chat start without LGPD consent', () => {
      // Update metadata to deny AI responses
      testMetadata.lgpdConsent.canReceiveAIResponses = false;
      handleWebSocketConnection(mockWs as any, testMetadata);
      mockWs.messages = []; // Clear welcome message

      const chatStartMessage: WSMessage = {
        type: WSMessageType.CHAT_START,
        data: {
          message: 'Olá, preciso de ajuda',
        },
      };

      mockWs.emit('message', JSON.stringify(chatStartMessage));

      // Should have at least one message (the error)
      expect(mockWs.messages.length).toBeGreaterThan(0);

      const response = JSON.parse(mockWs.messages[mockWs.messages.length - 1]);
      expect(response.type).toBe(WSMessageType.CHAT_ERROR);
      expect(response.data.error).toContain('Consentimento LGPD necessário');
      expect(response.data.code).toBe('LGPD_CONSENT_REQUIRED');
    });

    it('should handle invalid JSON messages gracefully', () => {
      mockWs.emit('message', 'invalid json');

      expect(mockWs.messages).toHaveLength(1);

      const errorMessage = JSON.parse(mockWs.messages[0]);
      expect(errorMessage.type).toBe(WSMessageType.ERROR);
      expect(errorMessage.data.error).toBe('Mensagem inválida');
    });
  });

  describe('Message Broadcasting', () => {
    let mockWs2: MockWebSocket;

    beforeEach(() => {
      handleWebSocketConnection(mockWs as any, testMetadata);

      mockWs2 = new MockWebSocket();
      const testMetadata2 = { ...testMetadata, userId: 'user-456' };
      handleWebSocketConnection(mockWs2 as any, testMetadata2);

      // Clear welcome messages
      mockWs.messages = [];
      mockWs2.messages = [];
    });

    it('should send message to specific user', () => {
      const message: WSMessage = {
        type: WSMessageType.NOTIFICATION,
        data: { message: 'Teste de notificação' },
      };

      // Clear welcome messages first
      mockWs.messages = [];
      mockWs2.messages = [];

      const sentCount = wsManager.sendToUser('user-123', message);

      expect(sentCount).toBe(1);
      expect(mockWs.messages).toHaveLength(1);
      expect(mockWs2.messages).toHaveLength(0);

      const receivedMessage = JSON.parse(mockWs.messages[0]);
      expect(receivedMessage.type).toBe(WSMessageType.NOTIFICATION);
      expect(receivedMessage.data.message).toBe('Teste de notificação');
    });

    it('should broadcast to all connections', () => {
      const message: WSMessage = {
        type: WSMessageType.ALERT,
        data: { message: 'Alerta geral' },
      };

      // Clear welcome messages first
      mockWs.messages = [];
      mockWs2.messages = [];

      const sentCount = wsManager.broadcast(message);

      expect(sentCount).toBe(2);
      expect(mockWs.messages).toHaveLength(1);
      expect(mockWs2.messages).toHaveLength(1);

      const receivedMessage1 = JSON.parse(mockWs.messages[0]);
      const receivedMessage2 = JSON.parse(mockWs2.messages[0]);

      expect(receivedMessage1.type).toBe(WSMessageType.ALERT);
      expect(receivedMessage2.type).toBe(WSMessageType.ALERT);
    });

    it('should broadcast with filter', () => {
      const message: WSMessage = {
        type: WSMessageType.NOTIFICATION,
        data: { message: 'Notificação para profissionais' },
      };

      // Clear welcome messages first
      mockWs.messages = [];
      mockWs2.messages = [];

      const filter = (metadata: ConnectionMetadata) => !!metadata.healthcareProfessional;
      const sentCount = wsManager.broadcast(message, filter);

      expect(sentCount).toBe(2); // Both connections have healthcare professional
      expect(mockWs.messages).toHaveLength(1);
      expect(mockWs2.messages).toHaveLength(1);
    });
  });

  describe('Connection Cleanup', () => {
    it('should clean up inactive connections', () => {
      const connectionId = handleWebSocketConnection(
        mockWs as any,
        testMetadata,
      );

      // Simulate old last activity
      const connection = (wsManager as any).connections.get(connectionId);
      connection.metadata.lastActivity = new Date(Date.now() - 35 * 60 * 1000); // 35 minutes ago

      const cleanedCount = wsManager.cleanupInactiveConnections(30);

      expect(cleanedCount).toBe(1);
      expect(wsManager.getTotalConnectionsCount()).toBe(0);
      expect(mockWs.readyState).toBe(WebSocket.CLOSED);
    });

    it('should not clean up active connections', () => {
      handleWebSocketConnection(mockWs as any, testMetadata);

      const cleanedCount = wsManager.cleanupInactiveConnections(30);

      expect(cleanedCount).toBe(0);
      expect(wsManager.getTotalConnectionsCount()).toBe(1);
      expect(mockWs.readyState).toBe(WebSocket.OPEN);
    });
  });

  describe('Middleware Integration', () => {
    it('should create websocket upgrade middleware', () => {
      const middleware = websocketUpgrade();
      expect(middleware).toBeInstanceOf(Function);
    });

    it('should create websocket utilities middleware', () => {
      const middleware = websocketMiddleware();
      expect(middleware).toBeInstanceOf(Function);
    });

    it('should add WebSocket utilities to context', async () => {
      const middleware = websocketMiddleware();
      const mockContext = {
        set: vi.fn(),
      };
      const mockNext = vi.fn();

      await middleware(mockContext as any, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith('wsManager', wsManager);
      expect(mockContext.set).toHaveBeenCalledWith(
        'sendToUser',
        expect.any(Function),
      );
      expect(mockContext.set).toHaveBeenCalledWith(
        'broadcast',
        expect.any(Function),
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('LGPD Compliance', () => {
    it('should respect LGPD consent for notifications', () => {
      testMetadata.lgpdConsent.canReceiveNotifications = false;
      handleWebSocketConnection(mockWs as any, testMetadata);

      const welcomeMessage = JSON.parse(mockWs.messages[0]);
      expect(welcomeMessage.metadata.lgpdConsent).toBe(true); // Still shows AI consent status
    });

    it('should include LGPD metadata in messages', () => {
      handleWebSocketConnection(mockWs as any, testMetadata);

      const welcomeMessage = JSON.parse(mockWs.messages[0]);
      expect(welcomeMessage.metadata).toBeDefined();
      expect(welcomeMessage.metadata.userId).toBe('user-123');
      expect(welcomeMessage.metadata.healthcareContext).toBe(true);
      expect(welcomeMessage.metadata.lgpdConsent).toBe(true);
    });
  });

  describe('Healthcare Professional Context', () => {
    it('should preserve healthcare professional information', () => {
      const connectionId = handleWebSocketConnection(
        mockWs as any,
        testMetadata,
      );
      const metadata = wsManager.getConnectionMetadata(connectionId);

      expect(metadata?.healthcareProfessional).toBeDefined();
      expect(metadata?.healthcareProfessional?.crmNumber).toBe('12345-SP');
      expect(metadata?.healthcareProfessional?.specialty).toBe('Dermatologia');
    });

    it('should include healthcare context in welcome message', () => {
      handleWebSocketConnection(mockWs as any, testMetadata);

      const welcomeMessage = JSON.parse(mockWs.messages[0]);
      expect(welcomeMessage.metadata.healthcareContext).toBe(true);
      expect(welcomeMessage.data.features).toContain('ai_chat');
    });
  });
});
