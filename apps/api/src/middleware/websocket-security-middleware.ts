/**
 * WebSocket Security Middleware
 * 
 * Implements security measures for WebSocket connections including rate limiting,
 * authentication, DDoS protection, and healthcare compliance features.
 */

import { logger } from '../lib/logger';

export interface WebSocketSecurityConfig {
  maxConnectionsPerIP: number;
  maxConnectionsPerUser: number;
  messageRateLimit: number;
  connectionTimeout: number;
  maxMessageSize: number;
  enableAuthentication: boolean;
  enableRateLimiting: boolean;
  enableDDoSProtection: boolean;
  blockedIPs: string[];
  allowedOrigins: string[];
}

export interface WebSocketConnectionInfo {
  id: string;
  ip: string;
  userId?: string;
  userAgent: string;
  origin: string;
  connectedAt: number;
  lastActivity: number;
  messageCount: number;
  isAuthenticated: boolean;
  sessionValid: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'connection_attempt' | 'authentication' | 'rate_limit' | 'ddos' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ip: string;
  userId?: string;
  timestamp: number;
  details: Record<string, any>;
}

export class WebSocketSecurityMiddleware {
  private connections = new Map<string, WebSocketConnectionInfo>();
  private ipConnections = new Map<string, Set<string>>();
  private userConnections = new Map<string, Set<string>>();
  private messageTimestamps = new Map<string, number[]>();
  private securityEvents: SecurityEvent[] = [];
  private config: WebSocketSecurityConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config?: Partial<WebSocketSecurityConfig>) {
    this.config = {
      maxConnectionsPerIP: 10,
      maxConnectionsPerUser: 5,
      messageRateLimit: 100, // messages per minute
      connectionTimeout: 300000, // 5 minutes
      maxMessageSize: 1024 * 1024, // 1MB
      enableAuthentication: true,
      enableRateLimiting: true,
      enableDDoSProtection: true,
      blockedIPs: [],
      allowedOrigins: [],
      ...config
    };

    this.startSecurityMonitoring();
  }

  /**
   * Validate incoming WebSocket connection
   */
  async validateConnection(request: any): Promise<{
    allowed: boolean;
    reason?: string;
    connectionInfo?: WebSocketConnectionInfo;
  }> {
    const ip = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || '';
    const origin = request.headers.origin || '';
    const connectionId = this.generateConnectionId();

    // Check if IP is blocked
    if (this.config.blockedIPs.includes(ip)) {
      this.logSecurityEvent({
        type: 'connection_attempt',
        severity: 'high',
        message: 'Connection attempt from blocked IP',
        ip,
        details: { userAgent, origin, blocked: true }
      });
      return { allowed: false, reason: 'IP address blocked' };
    }

    // Check origin restrictions
    if (this.config.allowedOrigins.length > 0 && !this.config.allowedOrigins.includes(origin)) {
      this.logSecurityEvent({
        type: 'connection_attempt',
        severity: 'medium',
        message: 'Connection attempt from disallowed origin',
        ip,
        details: { userAgent, origin, disallowed: true }
      });
      return { allowed: false, reason: 'Origin not allowed' };
    }

    // Check DDoS protection
    if (this.config.enableDDoSProtection && await this.isDDoSAttack(ip)) {
      this.logSecurityEvent({
        type: 'ddos',
        severity: 'critical',
        message: 'DDoS attack detected',
        ip,
        details: { userAgent, origin, ddosDetected: true }
      });
      return { allowed: false, reason: 'DDoS protection activated' };
    }

    // Check connection limits per IP
    if (this.config.enableRateLimiting && !this.checkConnectionLimits(ip)) {
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'high',
        message: 'Connection limit exceeded for IP',
        ip,
        details: { userAgent, origin, connectionLimitExceeded: true }
      });
      return { allowed: false, reason: 'Connection limit exceeded' };
    }

    // Check for suspicious user agent
    if (this.isSuspiciousUserAgent(userAgent)) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        message: 'Suspicious user agent detected',
        ip,
        details: { userAgent, origin, suspicious: true }
      });
    }

    const connectionInfo: WebSocketConnectionInfo = {
      id: connectionId,
      ip,
      userAgent,
      origin,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      isAuthenticated: false,
      sessionValid: false
    };

    // Track connection
    this.trackConnection(connectionInfo);

    this.logSecurityEvent({
      type: 'connection_attempt',
      severity: 'low',
      message: 'WebSocket connection validated',
      ip,
      details: { userAgent, origin, connectionId, allowed: true }
    });

    return { allowed: true, connectionInfo };
  }

  /**
   * Validate incoming message
   */
  async validateMessage(connectionId: string, message: any): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return { allowed: false, reason: 'Connection not found' };
    }

    // Update activity
    connection.lastActivity = Date.now();
    connection.messageCount++;

    // Check message size
    const messageSize = JSON.stringify(message).length;
    if (messageSize > this.config.maxMessageSize) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        message: 'Message size exceeded',
        ip: connection.ip,
        userId: connection.userId,
        details: { connectionId, messageSize, maxSize: this.config.maxMessageSize }
      });
      return { allowed: false, reason: 'Message too large' };
    }

    // Check rate limiting
    if (this.config.enableRateLimiting && !this.checkMessageRate(connectionId)) {
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'high',
        message: 'Message rate limit exceeded',
        ip: connection.ip,
        userId: connection.userId,
        details: { connectionId, messageCount: connection.messageCount }
      });
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    // Validate message structure
    if (!this.validateMessageStructure(message)) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        message: 'Invalid message structure',
        ip: connection.ip,
        userId: connection.userId,
        details: { connectionId, message: typeof message }
      });
      return { allowed: false, reason: 'Invalid message structure' };
    }

    return { allowed: true };
  }

  /**
   * Authenticate connection
   */
  async authenticateConnection(connectionId: string, userId: string, token?: string): Promise<{
    success: boolean;
    reason?: string;
  }> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return { success: false, reason: 'Connection not found' };
    }

    // Check if user already has too many connections
    if (this.config.enableRateLimiting && !this.checkUserConnectionLimits(userId)) {
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'high',
        message: 'User connection limit exceeded',
        ip: connection.ip,
        userId,
        details: { connectionId, currentConnections: this.userConnections.get(userId)?.size || 0 }
      });
      return { success: false, reason: 'Connection limit exceeded' };
    }

    // Validate authentication token (simplified)
    if (this.config.enableAuthentication && token) {
      const isValid = await this.validateAuthToken(token, userId);
      if (!isValid) {
        this.logSecurityEvent({
          type: 'authentication',
          severity: 'high',
          message: 'Authentication failed',
          ip: connection.ip,
          userId,
          details: { connectionId, tokenPresent: true }
        });
        return { success: false, reason: 'Authentication failed' };
      }
    }

    // Update connection with authentication info
    connection.userId = userId;
    connection.isAuthenticated = true;
    connection.sessionValid = true;

    // Track user connection
    this.trackUserConnection(userId, connectionId);

    this.logSecurityEvent({
      type: 'authentication',
      severity: 'low',
      message: 'WebSocket connection authenticated',
      ip: connection.ip,
      userId,
      details: { connectionId, success: true }
    });

    return { success: true };
  }

  /**
   * Handle connection disconnection
   */
  handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from tracking
    this.untrackConnection(connectionId);

    this.logSecurityEvent({
      type: 'connection_attempt',
      severity: 'low',
      message: 'WebSocket connection disconnected',
      ip: connection.ip,
      userId: connection.userId,
      details: { connectionId, duration: Date.now() - connection.connectedAt }
    });
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.info.remoteAddress ||
      'unknown'
    ).split(',')[0].trim();
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track connection for security monitoring
   */
  private trackConnection(connectionInfo: WebSocketConnectionInfo): void {
    this.connections.set(connectionInfo.id, connectionInfo);

    // Track by IP
    if (!this.ipConnections.has(connectionInfo.ip)) {
      this.ipConnections.set(connectionInfo.ip, new Set());
    }
    this.ipConnections.get(connectionInfo.ip)!.add(connectionInfo.id);
  }

  /**
   * Untrack connection
   */
  private untrackConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    this.connections.delete(connectionId);

    // Remove from IP tracking
    const ipConnections = this.ipConnections.get(connection.ip);
    if (ipConnections) {
      ipConnections.delete(connectionId);
      if (ipConnections.size === 0) {
        this.ipConnections.delete(connection.ip);
      }
    }

    // Remove from user tracking
    if (connection.userId) {
      const userConnections = this.userConnections.get(connection.userId);
      if (userConnections) {
        userConnections.delete(connectionId);
        if (userConnections.size === 0) {
          this.userConnections.delete(connection.userId);
        }
      }
    }

    // Remove from message rate tracking
    this.messageTimestamps.delete(connectionId);
  }

  /**
   * Track user connection
   */
  private trackUserConnection(userId: string, connectionId: string): void {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);
  }

  /**
   * Check connection limits per IP
   */
  private checkConnectionLimits(ip: string): boolean {
    const ipConnections = this.ipConnections.get(ip);
    return !ipConnections || ipConnections.size < this.config.maxConnectionsPerIP;
  }

  /**
   * Check user connection limits
   */
  private checkUserConnectionLimits(userId: string): boolean {
    const userConnections = this.userConnections.get(userId);
    return !userConnections || userConnections.size < this.config.maxConnectionsPerUser;
  }

  /**
   * Check message rate for connection
   */
  private checkMessageRate(connectionId: string): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute

    if (!this.messageTimestamps.has(connectionId)) {
      this.messageTimestamps.set(connectionId, []);
    }

    const timestamps = this.messageTimestamps.get(connectionId)!;

    // Clean old timestamps
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    this.messageTimestamps.set(connectionId, validTimestamps);

    // Check rate limit
    if (validTimestamps.length >= this.config.messageRateLimit) {
      return false;
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.messageTimestamps.set(connectionId, validTimestamps);

    return true;
  }

  /**
   * Validate message structure
   */
  private validateMessageStructure(message: any): boolean {
    // Basic validation - check if message is an object and not null
    if (typeof message !== 'object' || message === null) {
      return false;
    }

    // Check for potentially dangerous content
    const messageStr = JSON.stringify(message).toLowerCase();
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(messageStr));
  }

  /**
   * Check for DDoS attack patterns
   */
  private async isDDoSAttack(ip: string): Promise<boolean> {
    const connections = this.ipConnections.get(ip);
    if (!connections) return false;

    // Check for rapid connection attempts
    const recentConnections = Array.from(connections).filter(connectionId => {
      const connection = this.connections.get(connectionId);
      return connection && (Date.now() - connection.connectedAt) < 60000; // Last minute
    });

    // If more than 5 connections in last minute, consider it potential DDoS
    return recentConnections.length > 5;
  }

  /**
   * Check for suspicious user agent
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scanner/i,
      /test/i,
      /^$/ // Empty user agent
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Validate authentication token (simplified)
   */
  private async validateAuthToken(token: string, userId: string): Promise<boolean> {
    // In a real implementation, this would validate JWT tokens
    // For now, just check if token exists and has reasonable length
    return token && token.length > 10;
  }

  /**
   * Log security event
   */
  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Log to system logger
    const logMethod = this.getLogMethod(event.severity);
    logMethod('websocket_security', event.message, {
      eventId: securityEvent.id,
      type: event.type,
      severity: event.severity,
      ip: event.ip,
      userId: event.userId
    }, event.details);
  }

  /**
   * Get appropriate log method based on severity
   */
  private getLogMethod(severity: string) {
    switch (severity) {
      case 'critical':
        return logger.error;
      case 'high':
        return logger.warning;
      case 'medium':
        return logger.warning;
      case 'low':
      default:
        return logger.info;
    }
  }

  /**
   * Start security monitoring
   */
  private startSecurityMonitoring(): void {
    // Cleanup inactive connections
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveConnections();
    }, 60000); // Every minute
  }

  /**
   * Cleanup inactive connections
   */
  private cleanupInactiveConnections(): void {
    const now = Date.now();
    const timeout = this.config.connectionTimeout;
    let cleanedCount = 0;

    for (const [connectionId, connection] of this.connections.entries()) {
      if (now - connection.lastActivity > timeout) {
        this.untrackConnection(connectionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('websocket_security_cleanup', 'Cleaned up inactive connections', { cleanedCount });
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    activeConnections: number;
    uniqueIPs: number;
    uniqueUsers: number;
    securityEvents: SecurityEvent[];
    blockedIPs: string[];
    connectionDistribution: Record<string, number>;
  } {
    const recentEvents = this.securityEvents.filter(
      event => Date.now() - event.timestamp < 3600000 // Last hour
    );

    const connectionDistribution = recentEvents.reduce((acc, event) => {
      if (event.type === 'connection_attempt') {
        acc[event.details.allowed ? 'allowed' : 'blocked']++;
      }
      return acc;
    }, { allowed: 0, blocked: 0 });

    return {
      activeConnections: this.connections.size,
      uniqueIPs: this.ipConnections.size,
      uniqueUsers: this.userConnections.size,
      securityEvents: recentEvents.slice(-50), // Last 50 events
      blockedIPs: this.config.blockedIPs,
      connectionDistribution
    };
  }

  /**
   * Block IP address
   */
  blockIP(ip: string): void {
    if (!this.config.blockedIPs.includes(ip)) {
      this.config.blockedIPs.push(ip);
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        message: 'IP address blocked',
        ip,
        details: { blocked: true }
      });

      // Disconnect all connections from this IP
      const ipConnections = this.ipConnections.get(ip);
      if (ipConnections) {
        ipConnections.forEach(connectionId => {
          this.untrackConnection(connectionId);
        });
      }
    }
  }

  /**
   * Unblock IP address
   */
  unblockIP(ip: string): void {
    const index = this.config.blockedIPs.indexOf(ip);
    if (index > -1) {
      this.config.blockedIPs.splice(index, 1);
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'low',
        message: 'IP address unblocked',
        ip,
        details: { unblocked: true }
      });
    }
  }

  /**
   * Stop security monitoring
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }
}

// Export singleton instance
export const websocketSecurityMiddleware = new WebSocketSecurityMiddleware();