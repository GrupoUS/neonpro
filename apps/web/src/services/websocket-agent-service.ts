/**
 * WebSocket Agent Service
 * Real-time communication with Python AI Agent using AG-UI protocol
 */

import { WebSocketService } from '@/lib/websocket';
import { AgentAction } from '@neonpro/types';
import React from 'react';

export interface WebSocketAgentConfig {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  timeout?: number;
}

export class WebSocketAgentService {
  private ws: WebSocketService | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: Map<string, Function[]> = new Map();
  private connectionHandlers: Function[] = [];
  private disconnectionHandlers: Function[] = [];
  private pendingMessages: any[] = [];

  constructor(config: WebSocketAgentConfig = {}) {
    this.maxReconnectAttempts = config.reconnectAttempts || this.maxReconnectAttempts;
    this.reconnectInterval = config.reconnectInterval || this.reconnectInterval;

    // Use environment variable or default
    const wsUrl = config.url || process.env.NEXT_PUBLIC_AI_AGENT_WS_URL
      || 'ws://localhost:8001/ws/agent';

    this.ws = new WebSocketService({
      url: wsUrl,
      onOpen: this.handleOpen.bind(this),
      onMessage: this.handleMessage.bind(this),
      onClose: this.handleClose.bind(this),
      onError: this.handleError.bind(this),
      timeout: config.timeout || 10000,
    });
  }

  // Connect to WebSocket
  connect() {
    if (this.isConnected) return;

    this.ws?.connect();
  }

  // Disconnect from WebSocket
  disconnect() {
    this.ws?.disconnect();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // Send query to agent
  async sendQuery(_query: string, _context?: any): Promise<AgentResponse> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'query',
      query,
      context,
      timestamp: new Date().toISOString(),
    };

    return this.sendMessageWithResponse(message);
  }

  // Send action to agent
  async sendAction(actionType: string, _payload: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'action',
      action_type: actionType,
      payload,
      timestamp: new Date().toISOString(),
    };

    return this.sendMessageWithResponse(message);
  }

  // Send feedback to agent
  sendFeedback(feedbackType: string, data: any) {
    if (!this.isConnected) return;

    const message = {
      type: 'feedback',
      feedback_type: feedbackType,
      data,
      timestamp: new Date().toISOString(),
    };

    this.ws?.send(message);
  }

  // Register message handler
  on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);
  }

  // Remove message handler
  off(event: string, handler: Function) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Register connection handler
  onConnection(handler: Function) {
    this.connectionHandlers.push(handler);
  }

  // Register disconnection handler
  onDisconnection(handler: Function) {
    this.disconnectionHandlers.push(handler);
  }

  // Private methods
  private handleOpen() {
    console.log('WebSocket agent connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Send pending messages
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      this.ws?.send(message);
    }

    // Notify connection handlers
    this.connectionHandlers.forEach(handler => handler());
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const messageType = data.type;

      // Emit to specific handlers
      const handlers = this.messageHandlers.get(messageType) || [];
      handlers.forEach(handler => handler(data));

      // Emit to wildcard handlers
      const wildcardHandlers = this.messageHandlers.get('*') || [];

      wildcardHandlers.forEach(handler => handler(data));
    } catch (_error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket agent disconnected');
    this.isConnected = false;

    // Notify disconnection handlers
    this.disconnectionHandlers.forEach(handler => handler(event));

    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private sendMessageWithResponse(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      // Generate unique message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      message.id = messageId;

      // Set up response handler
      const timeout = setTimeout(() => {
        this.off('response', responseHandler);
        reject(new Error('Request timeout'));
      }, 30000); // 30 second timeout

      const responseHandler = (response: any) => {
        if (response.id === messageId || response.in_reply_to === messageId) {
          clearTimeout(timeout);
          this.off('response', responseHandler);
          resolve(response);
        }
      };

      this.on('response', responseHandler);

      // Send message
      if (this.isConnected) {
        this.ws?.send(message);
      } else {
        this.pendingMessages.push(message);
      }
    });
  }
}

// Singleton instance
let wsAgentService: WebSocketAgentService | null = null;

export function getWebSocketAgentService(config?: WebSocketAgentConfig): WebSocketAgentService {
  if (!wsAgentService) {
    wsAgentService = new WebSocketAgentService(config);
  }
  return wsAgentService;
}

// React hook for WebSocket agent
export function useWebSocketAgent(config?: WebSocketAgentConfig) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [lastMessage, setLastMessage] = React.useState<any>(null);

  React.useEffect(() => {
    const service = getWebSocketAgentService(config);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleMessage = (message: any) => setLastMessage(message);

    service.onConnection(handleConnect);
    service.onDisconnection(handleDisconnect);
    service.on('*', handleMessage);

    // Connect if not already connected
    if (!service['isConnected']) {
      service.connect();
    }

    return () => {
      service.offConnection(handleConnect);
      service.offDisconnection(handleDisconnect);
      service.off('*', handleMessage);
    };
  }, [config]);

  const sendQuery = React.useCallback(async (_query: string, _context?: any) => {
    const service = getWebSocketAgentService(config);
    return service.sendQuery(query, _context);
  }, [config]);

  const sendAction = React.useCallback(async (actionType: string, _payload: any) => {
    const service = getWebSocketAgentService(config);
    return service.sendAction(actionType, _payload);
  }, [config]);

  const sendFeedback = React.useCallback((feedbackType: string, data: any) => {
    const service = getWebSocketAgentService(config);
    service.sendFeedback(feedbackType, data);
  }, [config]);

  return {
    isConnected,
    lastMessage,
    sendQuery,
    sendAction,
    sendFeedback,
  };
}
