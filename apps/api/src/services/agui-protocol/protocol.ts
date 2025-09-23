/**
 * AG-UI Protocol Implementation
 *
 * Handles the WebSocket-based communication protocol for real-time agent interaction.
 * Implements message formatting, validation, and session management.
 */

import { EventEmitter } from "events";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { WebSocket } from "ws";
import {
  AguiContextUpdate,
  AguiErrorCode,
  AguiFeedbackMessage,
  AguiHealthStatus,
  AguiHelloMessage,
  AguiMessage,
  AguiProtocolInfo,
  AguiQueryMessage,
  AguiRateLimitInfo,
  AguiResponseMessage,
  AguiSession,
  AguiSessionUpdate,
  AguiStatusMessage,
  AguiStreamingChunk,
} from "./types";

export class AguiProtocol extends EventEmitter {
  private connections: Map<string, AguiConnection> = new Map();
  private sessions: Map<string, AguiSession> = new Map();
  private rateLimiter: Map<string, AguiRateLimitInfo> = new Map();
  private config: AguiProtocolConfig;

  constructor(config: AguiProtocolConfig) {
    super();
    this.config = config;

    // Start periodic cleanup
    setInterval(() => this.cleanup(), this.config.cleanupInterval);
    setInterval(() => this.updateRateLimits(), 60000); // Update every minute
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(ws: WebSocket, _request: any): Promise<void> {
    const connectionId = uuidv4();
    const clientIp = this.getClientIp(_request);

    try {
      // Check rate limits
      if (!this.checkRateLimit(clientIp)) {
        this.sendError(ws, "RATE_LIMITED", "Rate limit exceeded", {
          connectionId,
        });
        ws.close(1008, "Rate limit exceeded");
        return;
      }

      // Create connection
      const connection: AguiConnection = {
        id: connectionId,
        ws,
        clientIp,
        _userId: null,
        sessionId: null,
        authenticated: false,
        connectedAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
      };

      this.connections.set(connectionId, connection);

      // Set up message handler
      ws.on("message", (data) => this.handleMessage(connectionId, data));
      ws.on("close", () => this.handleDisconnect(connectionId));
      ws.on("error", (error) => this.handleError(connectionId, error));

      // Send hello message
      this.sendHello(connection);

      this.emit("connection", connection);
    } catch (error) {
      this.emit("connectionError", { connectionId, error });
      ws.close(1011, "Internal server error");
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(connectionId: string, data: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      // Parse message
      const message = this.parseMessage(data);
      if (!message) return;

      // Update activity
      connection.lastActivity = new Date();
      connection.messageCount++;

      // Validate message
      const validationError = this.validateMessage(message);
      if (validationError) {
        this.sendError(connection.ws, "INVALID_MESSAGE", validationError);
        return;
      }

      // Handle message based on type
      switch (message.type) {
        case "hello":
          await this.handleHello(connection, message);
          break;
        case "query":
          await this.handleQuery(connection, message);
          break;
        case "feedback":
          await this.handleFeedback(connection, message);
          break;
        case "ping":
          this.sendPong(connection);
          break;
        case "session_update":
          await this.handleSessionUpdate(connection, message);
          break;
        case "context_update":
          await this.handleContextUpdate(connection, message);
          break;
        default:
          this.sendError(
            connection.ws,
            "INVALID_MESSAGE",
            `Unknown message type: ${message.type}`,
          );
      }

      this.emit("message", { connection, message });
    } catch (error) {
      this.emit("messageError", { connectionId, error, data });
      this.sendError(
        connection.ws,
        "INTERNAL_ERROR",
        "Failed to process message",
      );
    }
  }

  /**
   * Parse and validate incoming message
   */
  private parseMessage(data: any): AguiMessage | null {
    try {
      const message = JSON.parse(data.toString());

      // Basic structure validation
      if (
        !message.id ||
        !message.type ||
        !message.timestamp ||
        !message.sessionId
      ) {
        return null;
      }

      return message as AguiMessage;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate message structure and content
   */
  private validateMessage(message: AguiMessage): string | null {
    // Validate timestamp (not too old or future)
    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - messageTime.getTime());

    if (timeDiff > this.config.maxMessageAge) {
      return "Message timestamp is too old or in the future";
    }

    // Validate session ID
    if (!this.isValidSessionId(message.sessionId)) {
      return "Invalid session ID format";
    }

    // Type-specific validation
    switch (message.type) {
      case "query":
        if (!message.payload?._query) {
          return "Query message must contain a query";
        }
        break;
      case "feedback":
        if (
          typeof message.payload?.rating !== "number" ||
          message.payload.rating < 1 ||
          message.payload.rating > 5
        ) {
          return "Feedback rating must be a number between 1 and 5";
        }
        break;
    }

    return null;
  }

  /**
   * Handle hello message (initial handshake)
   */
  private async handleHello(
    connection: AguiConnection,
    message: AguiMessage,
  ): Promise<void> {
    try {
      const hello = message.payload as AguiHelloMessage;

      // Validate protocol version
      if (!this.isVersionSupported(hello.version)) {
        this.sendError(
          connection.ws,
          "INVALID_MESSAGE",
          "Unsupported protocol version",
        );
        return;
      }

      // Authenticate if token provided
      if (hello.authentication) {
        const authResult = await this.authenticate(hello.authentication);
        if (!authResult.success) {
          this.sendError(
            connection.ws,
            "AUTHENTICATION_FAILED",
            authResult.error,
          );
          return;
        }

        connection.userId = authResult.userId;
        connection.authenticated = true;
      }

      // Store capabilities
      connection.capabilities = hello.capabilities;

      // Send hello response
      this.sendMessage(connection.ws, {
        id: uuidv4(),
        type: "hello",
        timestamp: new Date().toISOString(),
        sessionId: message.sessionId,
        _payload: {
          version: this.config.version,
          capabilities: this.getCapabilities(),
        },
      });

      this.emit("authenticated", { connection, _userId: connection.userId });
    } catch (error) {
      this.sendError(
        connection.ws,
        "INTERNAL_ERROR",
        "Failed to process hello message",
      );
    }
  }

  /**
   * Handle query message
   */
  private async handleQuery(
    connection: AguiConnection,
    message: AguiMessage,
  ): Promise<void> {
    if (!connection.authenticated) {
      this.sendError(
        connection.ws,
        "AUTHENTICATION_FAILED",
        "Authentication required",
      );
      return;
    }

    const query = message.payload as AguiQueryMessage;

    // Check session
    const session = await this.getOrCreateSession(
      message.sessionId,
      connection._userId,
    );
    connection.sessionId = session.id;

    // Emit query event for processing by the agent
    this.emit("query", {
      connection,
      session,
      _query: query.query,
      _context: query.context,
      options: query.options,
      messageId: message.id,
    });
  }

  /**
   * Handle feedback message
   */
  private async handleFeedback(
    connection: AguiConnection,
    message: AguiMessage,
  ): Promise<void> {
    const feedback = message.payload as AguiFeedbackMessage;

    this.emit("feedback", {
      sessionId: message.sessionId,
      messageId: feedback.messageId,
      rating: feedback.rating,
      feedback: feedback.feedback,
      category: feedback.category,
      _userId: connection.userId,
    });
  }

  /**
   * Handle session update
   */
  private async handleSessionUpdate(
    connection: AguiConnection,
    message: AguiMessage,
  ): Promise<void> {
    const update = message.payload as AguiSessionUpdate;

    const session = this.sessions.get(update.sessionId);
    if (!session || session.userId !== connection._userId) {
      this.sendError(
        connection.ws,
        "AUTHORIZATION_FAILED",
        "Session not found or access denied",
      );
      return;
    }

    // Update session
    Object.assign(session, update.updates, {
      updatedAt: new Date().toISOString(),
    });

    this.emit("sessionUpdated", { session, updates: update.updates });
  }

  /**
   * Handle context update
   */
  private async handleContextUpdate(
    connection: AguiConnection,
    message: AguiMessage,
  ): Promise<void> {
    const contextUpdate = message.payload as AguiContextUpdate;

    this.emit("contextUpdate", {
      sessionId: contextUpdate.sessionId,
      _context: contextUpdate.context,
      source: contextUpdate.source,
      _userId: connection.userId,
    });
  }

  /**
   * Send response to client
   */
  sendResponse(
    connectionId: string,
    response: AguiResponseMessage,
    messageId?: string,
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    this.sendMessage(connection.ws, {
      id: uuidv4(),
      type: "response",
      timestamp: new Date().toISOString(),
      sessionId: connection.sessionId || "",
      _payload: response,
      metadata: messageId ? { requestId: messageId } : undefined,
    });
  }

  /**
   * Send streaming response chunk
   */
  sendStreamingChunk(connectionId: string, chunk: AguiStreamingChunk): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    this.sendMessage(connection.ws, {
      id: uuidv4(),
      type: "streaming_chunk",
      timestamp: new Date().toISOString(),
      sessionId: connection.sessionId || "",
      _payload: chunk,
    });
  }

  /**
   * Send error message
   */
  sendError(
    ws: WebSocket,
    code: AguiErrorCode,
    message: string,
    details?: Record<string, any>,
  ): void {
    this.sendMessage(ws, {
      id: uuidv4(),
      type: "error",
      timestamp: new Date().toISOString(),
      sessionId: "",
      _payload: {
        code,
        message,
        details,
        retryable: this.isRetryableError(code),
      },
    });
  }

  /**
   * Send status update
   */
  sendStatus(connectionId?: string): void {
    const status: AguiStatusMessage = {
      status: "ready",
      uptime: process.uptime() * 1000,
      activeSessions: this.sessions.size,
      queueSize: 0,
      performance: this.getPerformanceMetrics(),
    };

    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        this.sendMessage(connection.ws, {
          id: uuidv4(),
          type: "status",
          timestamp: new Date().toISOString(),
          sessionId: connection.sessionId || "",
          _payload: status,
        });
      }
    } else {
      // Broadcast to all connections
      this.broadcast({
        id: uuidv4(),
        type: "status",
        timestamp: new Date().toISOString(),
        sessionId: "",
        _payload: status,
      });
    }
  }

  /**
   * Send hello message
   */
  private sendHello(connection: AguiConnection): void {
    this.sendMessage(connection.ws, {
      id: uuidv4(),
      type: "hello",
      timestamp: new Date().toISOString(),
      sessionId: "",
      _payload: {
        version: this.config.version,
        capabilities: this.getCapabilities(),
      },
    });
  }

  /**
   * Send pong response
   */
  private sendPong(connection: AguiConnection): void {
    this.sendMessage(connection.ws, {
      id: uuidv4(),
      type: "pong",
      timestamp: new Date().toISOString(),
      sessionId: connection.sessionId || "",
      _payload: { timestamp: new Date().toISOString() },
    });
  }

  /**
   * Send message to WebSocket
   */
  private sendMessage(ws: WebSocket, message: AguiMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      this.emit("sendError", { error, message });
    }
  }

  /**
   * Broadcast message to all connections
   */
  private broadcast(message: AguiMessage): void {
    for (const connection of this.connections.values()) {
      this.sendMessage(connection.ws, message);
    }
  }

  /**
   * Handle WebSocket disconnect
   */
  private handleDisconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      this.emit("disconnect", connection);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(connectionId: string, error: Error): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.emit("connectionError", { connection, error });
      this.handleDisconnect(connectionId);
    }
  }

  /**
   * Authenticate user
   */
  private async authenticate(
    auth: any,
  ): Promise<{ success: boolean; _userId?: string; error?: string }> {
    try {
      if (auth.type === "jwt") {
        const decoded = jwt.verify(auth.token, this.config.jwtSecret) as any;
        return { success: true, _userId: decoded.userId };
      }

      return { success: false, error: "Unsupported authentication type" };
    } catch (error) {
      return { success: false, error: "Invalid authentication token" };
    }
  }

  /**
   * Get or create session
   */
  private async getOrCreateSession(
    sessionId: string,
    _userId: string,
  ): Promise<AguiSession> {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        userId: userId,
        context: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        isActive: true,
        messageCount: 0,
        lastActivity: new Date().toISOString(),
      };

      this.sessions.set(sessionId, session);
      this.emit("sessionCreated", session);
    }

    return session;
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(clientIp: string): boolean {
    const limit = this.rateLimiter.get(clientIp) || this.getDefaultRateLimit();
    const now = Date.now();

    // Reset minute counter if needed
    if (now > new Date(limit.resetTimes.minute).getTime()) {
      limit.currentUsage.minute = 0;
      limit.resetTimes.minute = new Date(now + 60000).toISOString();
    }

    // Check if limit exceeded
    if (limit.currentUsage.minute >= limit.requestsPerMinute) {
      return false;
    }

    limit.currentUsage.minute++;
    this.rateLimiter.set(clientIp, limit);

    return true;
  }

  /**
   * Get default rate limit info
   */
  private getDefaultRateLimit(): AguiRateLimitInfo {
    return {
      requestsPerMinute: this.config.rateLimit.requestsPerMinute,
      requestsPerHour: this.config.rateLimit.requestsPerHour,
      currentUsage: { minute: 0, hour: 0 },
      resetTimes: {
        minute: new Date(Date.now() + 60000).toISOString(),
        hour: new Date(Date.now() + 3600000).toISOString(),
      },
    };
  }

  /**
   * Update rate limits (called every minute)
   */
  private updateRateLimits(): void {
    for (const [clientIp, limit] of this.rateLimiter.entries()) {
      const now = Date.now();

      // Reset counters if needed
      if (now > new Date(limit.resetTimes.minute).getTime()) {
        limit.currentUsage.minute = 0;
        limit.resetTimes.minute = new Date(now + 60000).toISOString();
      }

      if (now > new Date(limit.resetTimes.hour).getTime()) {
        limit.currentUsage.hour = 0;
        limit.resetTimes.hour = new Date(now + 3600000).toISOString();
      }

      // Remove old entries
      if (limit.currentUsage.minute === 0 && limit.currentUsage.hour === 0) {
        const lastActivity =
          new Date(limit.resetTimes.minute).getTime() - 60000;
        if (now - lastActivity > 3600000) {
          // 1 hour of inactivity
          this.rateLimiter.delete(clientIp);
        }
      }
    }
  }

  /**
   * Cleanup expired sessions and connections
   */
  private cleanup(): void {
    const now = Date.now();

    // Clean up expired sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt).getTime() < now) {
        this.sessions.delete(sessionId);
        this.emit("sessionExpired", session);
      }
    }

    // Clean up inactive connections
    for (const [connectionId, connection] of this.connections.entries()) {
      if (
        now - connection.lastActivity.getTime() >
        this.config.connectionTimeout
      ) {
        connection.ws.close(1000, "Connection timeout");
        this.connections.delete(connectionId);
      }
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(_request: any): string {
    return (
      request.headers["x-forwarded-for"] ||
      _request.connection.remoteAddress ||
      _request.socket.remoteAddress
    );
  }

  /**
   * Validate session ID format
   */
  private isValidSessionId(sessionId: string): boolean {
    return /^[a-zA-Z0-9\-_]{8,64}$/.test(sessionId);
  }

  /**
   * Check if protocol version is supported
   */
  private isVersionSupported(version: string): boolean {
    return this.config.supportedVersions.includes(version);
  }

  /**
   * Get server capabilities
   */
  private getCapabilities(): AguiCapability[] {
    return [
      {
        name: "query",
        version: "1.0.0",
        features: ["streaming", "context-aware", "multi-modal"],
      },
      {
        name: "session",
        version: "1.0.0",
        features: ["persistence", "context-sharing", "encryption"],
      },
      {
        name: "feedback",
        version: "1.0.0",
        features: ["rating", "comments", "categorization"],
      },
    ];
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): any {
    return {
      averageResponseTimeMs: 0, // Would track actual response times
      requestsPerSecond: 0, // Would calculate from request logs
      errorRate: 0, // Would calculate from error logs
      databaseConnections: 0, // Would get from database pool
      memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(code: AguiErrorCode): boolean {
    const retryableErrors = [
      "TIMEOUT",
      "RATE_LIMITED",
      "INTERNAL_ERROR",
      "AI_SERVICE_ERROR",
    ];
    return retryableErrors.includes(code);
  }

  /**
   * Get health status
   */
  getHealthStatus(): AguiHealthStatus {
    return {
      status: "healthy",
      components: {
        database: "healthy",
        ai_service: "healthy",
        vector_store: "healthy",
        websocket_server: "healthy",
      },
      metrics: this.getPerformanceMetrics(),
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Get protocol info
   */
  getProtocolInfo(): AguiProtocolInfo {
    return {
      version: this.config.version,
      supportedVersions: this.config.supportedVersions,
      compatibility: "full",
      features: ["query", "session", "feedback", "streaming", "encryption"],
    };
  }
}

// Type definitions
interface AguiConnection {
  id: string;
  ws: WebSocket;
  clientIp: string;
  _userId: string | null;
  sessionId: string | null;
  authenticated: boolean;
  capabilities?: any[];
  connectedAt: Date;
  lastActivity: Date;
  messageCount: number;
}

interface AguiProtocolConfig {
  version: string;
  supportedVersions: string[];
  jwtSecret: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  maxMessageAge: number;
  connectionTimeout: number;
  cleanupInterval: number;
}
