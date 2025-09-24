/**
 * AG-UI Protocol Implementation
 *
 * Core protocol implementation for WebSocket-based communication
 * between frontend and backend agents.
 */

import {
  AguiMessage,
  AguiMessageType,
  AguiMessageMetadata,
  AguiConnectionStatus,
  AguiServiceConfig
} from './types';
import { getLogger } from '@neonpro/core-services';

export class AguiProtocol {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private config: AguiServiceConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageQueue: AguiMessage[] = [];
  private status: AguiConnectionStatus = { connected: false };

  constructor(config: AguiServiceConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Connect to the AG-UI service
   */
  async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(this.config.baseUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
      // Wait for connection
      await this.waitForConnection();
    } catch (error) {
      throw new Error(`Failed to connect to AG-UI service: ${error}`);
    }
  }

  /**
   * Disconnect from the AG-UI service
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status.connected = false;
  }

  /**
   * Send a message to the AG-UI service
   */
  async sendMessage<T = any>(
    type: AguiMessageType,
    payload: T,
    metadata?: Partial<AguiMessageMetadata>
  ): Promise<void> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      _payload: payload as Record<string, any>,
      metadata: metadata ? { ...metadata, version: '1.0.0', _userId: metadata._userId || 'system' } : undefined
    };

    if (this.status.connected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later delivery
      this.messageQueue.push(message);
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): AguiConnectionStatus {
    return { ...this.status };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.status.connected = true;
    this.status.sessionId = this.sessionId;
    this.reconnectAttempts = 0;
    
    // Send hello message
    this.sendMessage('hello', { version: '1.0.0' });
    
    // Send queued messages
    this.flushMessageQueue();
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: AguiMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'pong':
          this.status.lastPing = new Date().toISOString();
          break;
        case 'error':
          const logger = getLogger();
          logger.error('AG-UI Protocol Error', { component: 'agui-protocol', operation: 'handle_message', sessionId: this.sessionId, _payload: message._payload });
          break;
        default:
          // Handle other message types through event listeners
          this.emit('message', message);
      }
    } catch (error) {
      const logger = getLogger();
      logger.error('Failed to parse AG-UI message', { component: 'agui-protocol', operation: 'parse_message', sessionId: this.sessionId }, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(): void {
    this.status.connected = false;
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    this.status.error = `WebSocket error: ${event}`;
    const logger = getLogger();
    logger.error('AG-UI WebSocket Error', { component: 'agui-protocol', operation: 'handle_error', sessionId: this.sessionId, error: event.toString() });
  }

  /**
   * Wait for WebSocket connection
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (this.status.connected) {
          resolve();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Max reconnection attempts reached'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit events (simplified event system)
   */
  private emit(event: string, data: any): void {
    // In a real implementation, you'd use EventEmitter or similar
    const logger = getLogger();
    logger.info('AG-UI Event emitted', { component: 'agui-protocol', operation: 'emit_event', sessionId: this.sessionId, eventType: event, hasData: !!data });
  }
}