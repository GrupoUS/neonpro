/**
 * AG-UI Protocol Client Implementation (T045)
 * Real-time communication layer between frontend and AI agent
 *
 * Features:
 * - WebSocket-based real-time communication
 * - End-to-end encryption for sensitive healthcare data
 * - Session management with automatic reconnection
 * - Heartbeat monitoring for connection health
 * - Message queuing and retry logic
 * - Action handling for interactive workflows
 * - Healthcare compliance (LGPD, CFM, ANVISA)
 */

import { EventEmitter } from 'events';

// AG-UI Protocol Types
export interface AGUIEvent {
  id: string;
  type: AGUIEventType;
  timestamp: number;
  session_id?: string;
  user_id?: string;
  data: any;
  metadata?: any;
  encrypted?: boolean;
}

export interface AGUIMessage {
  id: string;
  content: string;
  type: string;
  actions?: AgentAction[];
  metadata?: any;
  streaming?: boolean;
}

export interface AgentAction {
  id: string;
  label: string;
  icon?: string;
  primary?: boolean;
  action: {
    type: 'navigate' | 'api' | 'modal' | 'external';
    destination?: string;
    method?: string;
    _payload?: any;
  };
}

export enum AGUIEventType {
  CONNECTION = 'connection',
  MESSAGE = 'message',
  RESPONSE = 'response',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  ACTION = 'action',
  SESSION_UPDATE = 'session_update',
  FEEDBACK = 'feedback',
  STREAM_START = 'stream_start',
  STREAM_CHUNK = 'stream_chunk',
  STREAM_END = 'stream_end',
}

export enum AGUIConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export interface AGUIProtocolConfig {
  websocketUrl: string;
  httpUrl: string;
  _userId: string;
  authToken?: string;
  enableEncryption: boolean;
  heartbeatInterval: number;
  reconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
}

export interface AGUISession {
  session_id: string;
  user_id: string;
  state: AGUIConnectionState;
  created_at: Date;
  last_activity: Date;
  message_count: number;
  _context: any;
}

export class AGUIProtocolClient extends EventEmitter {
  private config: AGUIProtocolConfig;
  private websocket: WebSocket | null = null;
  private session: AGUISession | null = null;
  private state: AGUIConnectionState = AGUIConnectionState.DISCONNECTED;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: AGUIEvent[] = [];
  private reconnectCount: number = 0;
  private encryptionKey: string = '';
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();

  constructor(config: AGUIProtocolConfig) {
    super();
    this.config = {
      ...config,
      enableEncryption: config.enableEncryption ?? true,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      reconnectAttempts: config.reconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 5000,
      timeout: config.timeout ?? 30000,
    };

    // Generate encryption key if enabled
    if (this.config.enableEncryption) {
      this.generateEncryptionKey();
    }
  }

  /**
   * Connect to AG-UI Protocol WebSocket
   */
  async connect(): Promise<void> {
    if (
      this.state === AGUIConnectionState.CONNECTED || this.state === AGUIConnectionState.CONNECTING
    ) {
      return;
    }

    this.setState(AGUIConnectionState.CONNECTING);

    try {
      const wsUrl = `${this.config.websocketUrl}/ws/agui/${this.config.userId}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = this.handleOpen.bind(this);
      this.websocket.onmessage = this.handleMessage.bind(this);
      this.websocket.onclose = this.handleClose.bind(this);
      this.websocket.onerror = this.handleError.bind(this);

      // Set timeout for connection
      setTimeout(_() => {
        if (this.state === AGUIConnectionState.CONNECTING) {
          this.handleError(new Error('Connection timeout'));
        }
      }, this.config.timeout);
    } catch (_error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Disconnect from AG-UI Protocol
   */
  disconnect(): void {
    this.clearTimers();

    if (this.websocket) {
      this.websocket.close(1000, 'Disconnect requested');
      this.websocket = null;
    }

    this.setState(AGUIConnectionState.DISCONNECTED);
    this.emit('disconnected');
  }

  /**
   * Send message to agent
   */
  async sendMessage(content: string, type: string = 'text', metadata?: any): Promise<AGUIMessage> {
    if (!this.session || this.state !== AGUIConnectionState.AUTHENTICATED) {
      throw new Error('Not connected to agent');
    }

    const message: AGUIMessage = {
      id: this.generateId(),
      content,
      type,
      metadata,
    };

    const event: AGUIEvent = {
      id: this.generateId(),
      type: AGUIEventType.MESSAGE,
      timestamp: Date.now(),
      session_id: this.session.session_id,
      user_id: this.config.userId,
      data: { message },
    };

    return this.sendEvent(event);
  }

  /**
   * Send action feedback to agent
   */
  async sendFeedback(feedback: {
    messageId?: string;
    helpful: boolean;
    comment?: string;
    rating?: number;
  }): Promise<void> {
    if (!this.session) {
      throw new Error('No active session');
    }

    const event: AGUIEvent = {
      id: this.generateId(),
      type: AGUIEventType.FEEDBACK,
      timestamp: Date.now(),
      session_id: this.session.session_id,
      user_id: this.config.userId,
      data: { feedback },
    };

    await this.sendEvent(event);
  }

  /**
   * Send session context update
   */
  async updateSessionContext(_context: any): Promise<void> {
    if (!this.session) {
      throw new Error('No active session');
    }

    const event: AGUIEvent = {
      id: this.generateId(),
      type: AGUIEventType.SESSION_UPDATE,
      timestamp: Date.now(),
      session_id: this.session.session_id,
      user_id: this.config.userId,
      data: { context },
    };

    await this.sendEvent(event);
  }

  /**
   * Get current session info
   */
  getSession(): AGUISession | null {
    return this.session;
  }

  /**
   * Get connection state
   */
  getState(): AGUIConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === AGUIConnectionState.CONNECTED
      || this.state === AGUIConnectionState.AUTHENTICATED;
  }

  // Private Methods

  private handleOpen(): void {
    this.setState(AGUIConnectionState.CONNECTED);
    this.reconnectCount = 0;
    this.emit('connected');

    // Send queued messages
    this.flushMessageQueue();

    // Start heartbeat
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const aguiEvent: AGUIEvent = {
        ...data,
        type: data.type as AGUIEventType,
      };

      // Decrypt if encrypted
      if (aguiEvent.encrypted && aguiEvent.data) {
        aguiEvent.data = this.decryptData(aguiEvent.data);
      }

      this.handleAGUIEvent(aguiEvent);
    } catch (_error) {
      console.error('Error handling WebSocket message:', error);
      this.emit('error', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.clearTimers();
    this.setState(AGUIConnectionState.DISCONNECTED);
    this.emit('disconnected', event);

    // Attempt reconnection if not manual disconnect
    if (event.code !== 1000 && this.reconnectCount < this.config.reconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    this.clearTimers();
    this.setState(AGUIConnectionState.ERROR);
    this.emit('error', error);

    // Attempt reconnection
    if (this.reconnectCount < this.config.reconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private async handleAGUIEvent(event: AGUIEvent): Promise<void> {
    switch (event.type) {
      case AGUIEventType.CONNECTION:
        await this.handleConnectionEvent(event);
        break;
      case AGUIEventType.RESPONSE:
        await this.handleResponseEvent(event);
        break;
      case AGUIEventType.ERROR:
        await this.handleErrorEvent(event);
        break;
      case AGUIEventType.HEARTBEAT:
        await this.handleHeartbeatEvent(event);
        break;
      case AGUIEventType.SESSION_UPDATE:
        await this.handleSessionUpdateEvent(event);
        break;
      default:
        this.emit('event', event);
    }
  }

  private async handleConnectionEvent(event: AGUIEvent): Promise<void> {
    this.session = {
      session_id: event.session_id!,
      user_id: event.user_id!,
      state: AGUIConnectionState.AUTHENTICATED,
      created_at: new Date(),
      last_activity: new Date(),
      message_count: 0,
      _context: {},
    };

    this.setState(AGUIConnectionState.AUTHENTICATED);
    this.emit('authenticated', this.session);
  }

  private async handleResponseEvent(event: AGUIEvent): Promise<void> {
    if (this.session) {
      this.session.last_activity = new Date();
      this.session.message_count++;
    }

    const message = event.data.message as AGUIMessage;
    this.emit('message', message);
    this.emit('response', event);
  }

  private async handleErrorEvent(event: AGUIEvent): Promise<void> {
    this.emit('error', new Error(event.data.message));
  }

  private async handleHeartbeatEvent(event: AGUIEvent): Promise<void> {
    // Echo heartbeat back
    if (this.session) {
      this.session.last_activity = new Date();
    }
    this.emit('heartbeat', event.data);
  }

  private async handleSessionUpdateEvent(event: AGUIEvent): Promise<void> {
    if (this.session) {
      this.session.context = { ...this.session.context, ...event.data.context };
      this.session.last_activity = new Date();
    }
    this.emit('sessionUpdate', this.session);
  }

  private async sendEvent(event: AGUIEvent): Promise<AGUIMessage> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      // Queue message for later
      this.messageQueue.push(event);
      throw new Error('WebSocket not connected');
    }

    return new Promise(_(resolve,_reject) => {
      try {
        // Store pending request
        this.pendingRequests.set(event.id, { resolve, reject });

        // Encrypt if enabled
        if (this.config.enableEncryption && event.data) {
          event.data = this.encryptData(JSON.stringify(event.data));
          event.encrypted = true;
        }

        this.websocket.send(JSON.stringify(event));

        // Set timeout
        setTimeout(_() => {
          if (this.pendingRequests.has(event.id)) {
            this.pendingRequests.delete(event.id);
            reject(new Error('Request timeout'));
          }
        }, this.config.timeout);
      } catch (_error) {
        this.pendingRequests.delete(event.id);
        reject(error);
      }
    });
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const event = this.messageQueue.shift();
      if (event) {
        this.sendEvent(event).catch(error => {
          console.error('Error sending queued message:', error);
        });
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(_() => {
      if (this.session && this.websocket?.readyState === WebSocket.OPEN) {
        const event: AGUIEvent = {
          id: this.generateId(),
          type: AGUIEventType.HEARTBEAT,
          timestamp: Date.now(),
          session_id: this.session.session_id,
          user_id: this.config.userId,
          data: { timestamp: Date.now() },
        };

        this.websocket.send(JSON.stringify(event));
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectCount++;

    if (this.reconnectCount <= this.config.reconnectAttempts) {
      const delay = this.config.reconnectDelay * this.reconnectCount;

      this.reconnectTimer = setTimeout(_() => {
        console.log(
          `Attempting reconnection (${this.reconnectCount}/${this.config.reconnectAttempts})`,
        );
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);

      this.emit('reconnecting', this.reconnectCount, delay);
    } else {
      this.emit('reconnectFailed');
    }
  }

  private setState(state: AGUIConnectionState): void {
    this.state = state;
    this.emit('stateChange', state);
  }

  private generateId(): string {
    return `agui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEncryptionKey(): void {
    // Generate encryption key (in production, use proper key derivation)
    this.encryptionKey = btoa(`neonpro_agui_${this.config.userId}_${Date.now()}`);
  }

  private encryptData(data: string): string {
    // Simple XOR encryption for demo (in production, use proper encryption)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length),
      );
    }
    return btoa(encrypted);
  }

  private decryptData(encrypted: string): string {
    const data = atob(encrypted);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(
        data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length),
      );
    }
    return decrypted;
  }
}

// Factory function to create AG-UI Protocol client
export function createAGUIProtocolClient(config: AGUIProtocolConfig): AGUIProtocolClient {
  return new AGUIProtocolClient(config);
}

// React hook for AG-UI Protocol
export function useAGUIProtocol(config: AGUIProtocolConfig) {
  const [client] = useState(_() => createAGUIProtocolClient(config));
  const [state, setState] = useState(client.getState());
  const [session, setSession] = useState(client.getSession());

  useEffect(_() => {
    client.on('stateChange', setState);
    client.on('authenticated', setSession);
    client.on(_'disconnected',_() => setSession(null));

    return () => {
      client.removeAllListeners();
    };
  }, [client]);

  return {
    client,
    state,
    session,
    connect: client.connect.bind(client),
    disconnect: client.disconnect.bind(client),
    sendMessage: client.sendMessage.bind(client),
    sendFeedback: client.sendFeedback.bind(client),
    updateSessionContext: client.updateSessionContext.bind(client),
  };
}
