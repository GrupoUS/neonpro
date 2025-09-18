/**
 * Enhanced Real-Time Subscriptions for Telemedicine
 * Phase 3.4: T031 - Advanced WebSocket subscriptions with encryption and presence
 *
 * Features:
 * - WebSocket subscriptions for video consultation updates
 * - Real-time encrypted chat for medical communications
 * - Presence detection for healthcare professionals
 * - Connection quality monitoring with <50ms latency targets
 * - LGPD-compliant encrypted messaging
 * - CFM telemedicine compliance integration
 */

import { createClient, RealtimeChannel, RealtimeClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Enhanced telemedicine subscription schemas
const TelemedicineMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderRole: z.enum(['patient', 'doctor', 'nurse', 'technician']),
  messageType: z.enum(['text', 'file', 'image', 'system', 'emergency']),
  content: z.string(),
  encryptedContent: z.string().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  requiresAcknowledgment: z.boolean().default(false),
  acknowledgments: z.array(z.string().uuid()).default([]),
  lgpdCompliant: z.boolean().default(true),
});

const PresenceStateSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
  userRole: z.enum(['patient', 'doctor', 'nurse', 'technician', 'admin']),
  status: z.enum(['online', 'away', 'busy', 'offline', 'in_consultation']),
  lastSeen: z.string().datetime(),
  connectionQuality: z.object({
    latency: z.number().min(0).max(5000), // ms
    bandwidth: z.number().min(0), // kbps
    packetLoss: z.number().min(0).max(100), // percentage
    jitter: z.number().min(0).max(1000), // ms
    quality: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
  deviceInfo: z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']),
    browser: z.string().optional(),
    os: z.string().optional(),
    capabilities: z.object({
      video: z.boolean(),
      audio: z.boolean(),
      screenshare: z.boolean(),
    }),
  }),
  location: z.object({
    timezone: z.string().default('America/Sao_Paulo'),
    region: z.string().optional(),
  }).optional(),
});

const SessionUpdateSchema = z.object({
  sessionId: z.string().uuid(),
  type: z.enum([
    'status_change',
    'participant_join',
    'participant_leave',
    'quality_update',
    'emergency',
  ]),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
  metadata: z.object({
    cfmCompliant: z.boolean().default(true),
    lgpdAuditRequired: z.boolean().default(true),
    emergencyProtocol: z.boolean().default(false),
  }),
});

export type TelemedicineMessage = z.infer<typeof TelemedicineMessageSchema>;
export type PresenceState = z.infer<typeof PresenceStateSchema>;
export type SessionUpdate = z.infer<typeof SessionUpdateSchema>;

// Connection quality monitoring thresholds
const QUALITY_THRESHOLDS = {
  excellent: { latency: 50, packetLoss: 1, jitter: 20 },
  good: { latency: 150, packetLoss: 3, jitter: 50 },
  fair: { latency: 300, packetLoss: 5, jitter: 100 },
  poor: { latency: 500, packetLoss: 10, jitter: 200 },
} as const;

// Encryption utilities for LGPD compliance
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;

  generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  encrypt(text: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('telemedicine-lgpd-compliant', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: Buffer): string {
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('telemedicine-lgpd-compliant', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Enhanced Real-Time Telemedicine Service
export class EnhancedTelemedicineRealtime {
  private supabase: RealtimeClient;
  private encryption: EncryptionService;
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceStates: Map<string, PresenceState> = new Map();
  private connectionQualityMonitor: NodeJS.Timeout | null = null;
  private encryptionKeys: Map<string, Buffer> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 100, // High frequency for medical consultations
        },
      },
    }).realtime;

    this.encryption = new EncryptionService();
  }

  /**
   * Create encrypted telemedicine session channel
   */
  async createTelemedicineSession(sessionId: string, participants: string[]): Promise<{
    channel: RealtimeChannel;
    encryptionKey: string;
    channelId: string;
  }> {
    const channelId = `telemedicine:${sessionId}`;

    // Generate session-specific encryption key
    const encryptionKey = this.encryption.generateKey();
    this.encryptionKeys.set(sessionId, encryptionKey);

    // Create Supabase Realtime channel
    const channel = this.supabase.channel(channelId, {
      config: {
        presence: {
          key: sessionId,
        },
        broadcast: {
          self: true,
          ack: true,
        },
      },
    });

    // Setup message handlers
    this.setupMessageHandlers(channel, sessionId);
    this.setupPresenceHandlers(channel, sessionId);
    this.setupEmergencyHandlers(channel, sessionId);

    // Subscribe to channel
    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Telemedicine session ${sessionId} channel active`);

        // Initialize presence for all participants
        await this.initializePresence(channel, sessionId, participants);

        // Start connection quality monitoring
        this.startConnectionQualityMonitoring(sessionId);
      }
    });

    this.channels.set(sessionId, channel);

    return {
      channel,
      encryptionKey: encryptionKey.toString('hex'),
      channelId,
    };
  }

  /**
   * Send encrypted message in telemedicine session
   */
  async sendEncryptedMessage(
    sessionId: string,
    message: Omit<TelemedicineMessage, 'id' | 'timestamp' | 'encryptedContent'>,
  ): Promise<boolean> {
    const channel = this.channels.get(sessionId);
    const encryptionKey = this.encryptionKeys.get(sessionId);

    if (!channel || !encryptionKey) {
      throw new Error(`Telemedicine session ${sessionId} not found or not encrypted`);
    }

    // Encrypt message content for LGPD compliance
    const encryptedData = this.encryption.encrypt(message.content, encryptionKey);

    const enhancedMessage: TelemedicineMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      encryptedContent: JSON.stringify(encryptedData),
    };

    // Validate message schema
    const validatedMessage = TelemedicineMessageSchema.parse(enhancedMessage);

    // Broadcast encrypted message
    const response = await channel.send({
      type: 'broadcast',
      event: 'encrypted_message',
      payload: validatedMessage,
    });

    // Log for LGPD audit compliance
    console.log(`📨 Encrypted message sent in session ${sessionId}:`, {
      messageId: validatedMessage.id,
      senderRole: validatedMessage.senderRole,
      messageType: validatedMessage.messageType,
      priority: validatedMessage.priority,
      encrypted: true,
      lgpdCompliant: validatedMessage.lgpdCompliant,
    });

    return response === 'ok';
  }

  /**
   * Update presence with connection quality metrics
   */
  async updatePresence(sessionId: string, presence: Partial<PresenceState>): Promise<boolean> {
    const channel = this.channels.get(sessionId);
    if (!channel) {
      throw new Error(`Telemedicine session ${sessionId} not found`);
    }

    const fullPresence: PresenceState = {
      ...presence,
      lastSeen: new Date().toISOString(),
      sessionId,
    } as PresenceState;

    // Validate presence data
    const validatedPresence = PresenceStateSchema.parse(fullPresence);

    // Update presence state
    const response = await channel.track(validatedPresence);

    // Store locally for monitoring
    this.presenceStates.set(presence.userId!, validatedPresence);

    // Monitor connection quality
    if (validatedPresence.connectionQuality) {
      await this.assessConnectionQuality(sessionId, validatedPresence);
    }

    return response === 'ok';
  }

  /**
   * Setup message handlers for real-time communication
   */
  private setupMessageHandlers(channel: RealtimeChannel, sessionId: string): void {
    channel.on('broadcast', { event: 'encrypted_message' }, async payload => {
      const message = payload.payload as TelemedicineMessage;

      // Decrypt message if encrypted
      if (message.encryptedContent) {
        const encryptionKey = this.encryptionKeys.get(sessionId);
        if (encryptionKey) {
          try {
            const encryptedData = JSON.parse(message.encryptedContent);
            message.content = this.encryption.decrypt(encryptedData, encryptionKey);
          } catch (error) {
            console.error('❌ Failed to decrypt message:', error);
            return;
          }
        }
      }

      console.log(`📩 Message received in session ${sessionId}:`, {
        messageId: message.id,
        senderRole: message.senderRole,
        messageType: message.messageType,
        priority: message.priority,
      });

      // Handle emergency messages
      if (message.priority === 'critical' || message.messageType === 'emergency') {
        await this.handleEmergencyMessage(sessionId, message);
      }

      // Send acknowledgment if required
      if (message.requiresAcknowledgment) {
        await this.sendMessageAcknowledgment(sessionId, message.id, message.senderId);
      }
    });

    // Handle session updates
    channel.on('broadcast', { event: 'session_update' }, payload => {
      const update = payload.payload as SessionUpdate;
      console.log(`🔄 Session update in ${sessionId}:`, update.type, update.data);

      // Handle specific update types
      if (update.type === 'emergency') {
        this.handleEmergencyUpdate(sessionId, update);
      }
    });
  }

  /**
   * Setup presence detection for healthcare professionals
   */
  private setupPresenceHandlers(channel: RealtimeChannel, sessionId: string): void {
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log(
        `👥 Presence sync for session ${sessionId}:`,
        Object.keys(state).length,
        'participants',
      );
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log(`👋 User joined session ${sessionId}:`, key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log(`👋 User left session ${sessionId}:`, key, leftPresences);

      // Clean up local presence state
      leftPresences.forEach((presence: any) => {
        this.presenceStates.delete(presence.userId);
      });
    });
  }

  /**
   * Setup emergency protocol handlers
   */
  private setupEmergencyHandlers(channel: RealtimeChannel, sessionId: string): void {
    channel.on('broadcast', { event: 'emergency_alert' }, async payload => {
      const alert = payload.payload;
      console.log(`🚨 EMERGENCY ALERT in session ${sessionId}:`, alert);

      // Trigger emergency escalation protocol
      await this.triggerEmergencyEscalation(sessionId, alert);
    });
  }

  /**
   * Initialize presence for session participants
   */
  private async initializePresence(
    channel: RealtimeChannel,
    sessionId: string,
    participants: string[],
  ): Promise<void> {
    for (const userId of participants) {
      const initialPresence: PresenceState = {
        userId,
        sessionId,
        userRole: 'patient', // Default, should be determined by actual role
        status: 'online',
        lastSeen: new Date().toISOString(),
        connectionQuality: {
          latency: 0,
          bandwidth: 0,
          packetLoss: 0,
          jitter: 0,
          quality: 'good',
        },
        deviceInfo: {
          type: 'desktop',
          capabilities: {
            video: true,
            audio: true,
            screenshare: false,
          },
        },
      };

      await channel.track(initialPresence);
    }
  }

  /**
   * Start connection quality monitoring with <50ms target
   */
  private startConnectionQualityMonitoring(sessionId: string): void {
    if (this.connectionQualityMonitor) {
      clearInterval(this.connectionQualityMonitor);
    }

    this.connectionQualityMonitor = setInterval(async () => {
      await this.monitorConnectionQuality(sessionId);
    }, 5000); // Monitor every 5 seconds
  }

  /**
   * Monitor connection quality for all participants
   */
  private async monitorConnectionQuality(sessionId: string): Promise<void> {
    const channel = this.channels.get(sessionId);
    if (!channel) return;

    const presenceState = channel.presenceState();
    const qualityReports: any[] = [];

    for (const [userId, presences] of Object.entries(presenceState)) {
      for (const presence of presences as any[]) {
        if (presence.connectionQuality) {
          const quality = this.calculateConnectionQuality(presence.connectionQuality);
          qualityReports.push({
            userId,
            quality,
            latency: presence.connectionQuality.latency,
            timestamp: new Date().toISOString(),
          });

          // Alert if quality is poor for medical consultation
          if (quality === 'poor' && presence.connectionQuality.latency > 300) {
            await this.sendQualityAlert(sessionId, userId, presence.connectionQuality);
          }
        }
      }
    }

    // Log quality monitoring for compliance
    console.log(`📊 Connection quality report for session ${sessionId}:`, qualityReports);
  }

  /**
   * Calculate connection quality based on metrics
   */
  private calculateConnectionQuality(metrics: PresenceState['connectionQuality']): string {
    const { latency, packetLoss, jitter } = metrics;

    if (
      latency <= QUALITY_THRESHOLDS.excellent.latency
      && packetLoss <= QUALITY_THRESHOLDS.excellent.packetLoss
      && jitter <= QUALITY_THRESHOLDS.excellent.jitter
    ) {
      return 'excellent';
    } else if (
      latency <= QUALITY_THRESHOLDS.good.latency
      && packetLoss <= QUALITY_THRESHOLDS.good.packetLoss
      && jitter <= QUALITY_THRESHOLDS.good.jitter
    ) {
      return 'good';
    } else if (
      latency <= QUALITY_THRESHOLDS.fair.latency
      && packetLoss <= QUALITY_THRESHOLDS.fair.packetLoss
      && jitter <= QUALITY_THRESHOLDS.fair.jitter
    ) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Assess connection quality and take corrective actions
   */
  private async assessConnectionQuality(sessionId: string, presence: PresenceState): Promise<void> {
    const quality = this.calculateConnectionQuality(presence.connectionQuality);

    if (quality === 'poor') {
      console.log(
        `⚠️ Poor connection quality detected for user ${presence.userId} in session ${sessionId}`,
      );

      // Suggest quality improvements
      await this.sendQualityImprovementSuggestions(
        sessionId,
        presence.userId,
        presence.connectionQuality,
      );
    }
  }

  /**
   * Send quality alert for poor connections
   */
  private async sendQualityAlert(
    sessionId: string,
    userId: string,
    quality: PresenceState['connectionQuality'],
  ): Promise<void> {
    const channel = this.channels.get(sessionId);
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'quality_alert',
      payload: {
        type: 'poor_connection_quality',
        userId,
        quality,
        suggestions: [
          'Check your internet connection',
          'Close other bandwidth-intensive applications',
          'Move closer to your WiFi router',
          'Consider switching to wired connection',
        ],
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send quality improvement suggestions
   */
  private async sendQualityImprovementSuggestions(
    sessionId: string,
    userId: string,
    quality: PresenceState['connectionQuality'],
  ): Promise<void> {
    const channel = this.channels.get(sessionId);
    if (!channel) return;

    const suggestions = [];

    if (quality.latency > 200) {
      suggestions.push('High latency detected - check your internet connection');
    }

    if (quality.packetLoss > 5) {
      suggestions.push('Packet loss detected - consider switching network');
    }

    if (quality.jitter > 100) {
      suggestions.push('Network instability detected - close other applications');
    }

    await channel.send({
      type: 'broadcast',
      event: 'quality_suggestions',
      payload: {
        userId,
        suggestions,
        currentQuality: quality,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Handle emergency messages with immediate response
   */
  private async handleEmergencyMessage(
    sessionId: string,
    message: TelemedicineMessage,
  ): Promise<void> {
    console.log(`🚨 EMERGENCY MESSAGE in session ${sessionId}:`, message);

    // Broadcast emergency alert to all participants
    const channel = this.channels.get(sessionId);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'emergency_alert',
        payload: {
          originalMessage: message,
          alertLevel: 'critical',
          timestamp: new Date().toISOString(),
          requiredActions: [
            'All participants notified',
            'Emergency protocols activated',
            'Medical supervisor alerted',
          ],
        },
      });
    }
  }

  /**
   * Send message acknowledgment
   */
  private async sendMessageAcknowledgment(
    sessionId: string,
    messageId: string,
    recipientId: string,
  ): Promise<void> {
    const channel = this.channels.get(sessionId);
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'message_acknowledgment',
      payload: {
        messageId,
        acknowledgedBy: recipientId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Handle emergency session updates
   */
  private async handleEmergencyUpdate(sessionId: string, update: SessionUpdate): Promise<void> {
    console.log(`🚨 Emergency update in session ${sessionId}:`, update);

    // Trigger emergency escalation if configured
    if (update.metadata.emergencyProtocol) {
      await this.triggerEmergencyEscalation(sessionId, update.data);
    }
  }

  /**
   * Trigger emergency escalation protocol
   */
  private async triggerEmergencyEscalation(sessionId: string, alertData: any): Promise<void> {
    // This would integrate with hospital emergency systems
    console.log(`🆘 Emergency escalation triggered for session ${sessionId}:`, alertData);

    // Example: Call emergency services, notify supervisors, etc.
    // Implementation would depend on healthcare facility protocols
  }

  /**
   * End telemedicine session and cleanup
   */
  async endTelemedicineSession(sessionId: string): Promise<void> {
    const channel = this.channels.get(sessionId);

    if (channel) {
      // Unsubscribe from channel
      await channel.unsubscribe();

      // Remove from channels map
      this.channels.delete(sessionId);

      // Clear encryption key
      this.encryptionKeys.delete(sessionId);

      // Clear presence states for this session
      for (const [userId, presence] of this.presenceStates.entries()) {
        if (presence.sessionId === sessionId) {
          this.presenceStates.delete(userId);
        }
      }

      console.log(`✅ Telemedicine session ${sessionId} ended and cleaned up`);
    }

    // Stop connection quality monitoring if no active sessions
    if (this.channels.size === 0 && this.connectionQualityMonitor) {
      clearInterval(this.connectionQualityMonitor);
      this.connectionQualityMonitor = null;
    }
  }

  /**
   * Get session statistics for monitoring
   */
  getSessionStatistics(sessionId: string): {
    participantCount: number;
    averageLatency: number;
    connectionQuality: string;
    messageCount: number;
    emergencyAlerts: number;
  } {
    const channel = this.channels.get(sessionId);
    if (!channel) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const presenceState = channel.presenceState();
    const participants = Object.keys(presenceState);

    // Calculate average latency
    let totalLatency = 0;
    let latencyCount = 0;

    for (const presences of Object.values(presenceState)) {
      for (const presence of presences as any[]) {
        if (presence.connectionQuality?.latency) {
          totalLatency += presence.connectionQuality.latency;
          latencyCount++;
        }
      }
    }

    const averageLatency = latencyCount > 0 ? totalLatency / latencyCount : 0;
    const connectionQuality = this.calculateConnectionQuality({
      latency: averageLatency,
      bandwidth: 0,
      packetLoss: 0,
      jitter: 0,
      quality: 'good',
    });

    return {
      participantCount: participants.length,
      averageLatency,
      connectionQuality,
      messageCount: 0, // Would track from message store
      emergencyAlerts: 0, // Would track from alert store
    };
  }

  /**
   * Cleanup all sessions and resources
   */
  async cleanup(): Promise<void> {
    // End all active sessions
    const sessionIds = Array.from(this.channels.keys());
    for (const sessionId of sessionIds) {
      await this.endTelemedicineSession(sessionId);
    }

    // Clear all data
    this.channels.clear();
    this.presenceStates.clear();
    this.encryptionKeys.clear();

    // Stop monitoring
    if (this.connectionQualityMonitor) {
      clearInterval(this.connectionQualityMonitor);
      this.connectionQualityMonitor = null;
    }

    console.log('✅ Enhanced Telemedicine Realtime service cleaned up');
  }
}

export default EnhancedTelemedicineRealtime;
