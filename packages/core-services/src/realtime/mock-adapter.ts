/**
 * Mock Realtime Event Adapter (T102.5)
 * Testing implementation for local development and unit tests
 *
 * Features:
 * - Full interface compliance for testing
 * - Simulated network delays and errors
 * - Healthcare event patterns
 * - Local state management
 * - Deterministic behavior for tests
 */

import { logHealthcareError, realtimeLogger } from '@neonpro/shared';
import type {
  RealtimeAdapterConfig,
  RealtimeChannelState,
  RealtimeEvent,
  RealtimeEventAdapter,
  RealtimeEventHandlers,
  RealtimeParticipant,
} from './event-adapter.js';
import { createRealtimeEvent, validateParticipant } from './event-adapter.js';

export class MockRealtimeAdapter implements RealtimeEventAdapter {
  private channelStates = new Map<string, RealtimeChannelState>();
  private eventHandlers: RealtimeEventHandlers = {};
  private config: RealtimeAdapterConfig;
  private isInitialized = false;
  private simulatedLatency = 50; // ms
  private errorRate = 0; // 0-1 probability of random errors
  private eventLog: RealtimeEvent[] = [];

  constructor(config: RealtimeAdapterConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Simulate initialization delay
    await this.delay(this.simulatedLatency);

    this.isInitialized = true;
    realtimeLogger.info('MockRealtimeAdapter initialized', {
      timestamp: new Date().toISOString(),
      component: 'mock-adapter',
    });
  }

  async cleanup(): Promise<void> {
    this.channelStates.clear();
    this.eventHandlers = {};
    this.eventLog = [];
    this.isInitialized = false;

    realtimeLogger.info('MockRealtimeAdapter cleaned up', {
      timestamp: new Date().toISOString(),
      component: 'mock-adapter',
    });
  }

  async joinChannel(
    channelId: string,
    participant: Omit<RealtimeParticipant, 'metadata'>,
    initialState?: Record<string, any>,
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Adapter not initialized');
    }

    await this.delay(this.simulatedLatency);
    this.throwRandomError('JOIN_CHANNEL_FAILED');

    // Create full participant with metadata
    const fullParticipant: RealtimeParticipant = {
      ...participant,
      metadata: {
        clinicId: initialState?.clinicId || 'mock-clinic-123',
        sessionId: initialState?.sessionId || `mock-session-${Date.now()}`,
        deviceType: initialState?.deviceType || 'desktop',
        connectionQuality: 'excellent',
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      },
    };

    if (!validateParticipant(fullParticipant)) {
      throw new Error('Invalid participant data');
    }

    // Initialize channel state if not exists
    if (!this.channelStates.has(channelId)) {
      this.channelStates.set(channelId, {
        channelId,
        participants: new Map(),
        metadata: {
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          totalParticipants: 0,
          maxParticipants: this.config.performance.maxParticipantsPerChannel,
          channelType: 'consultation',
        },
      });
    }

    // Add participant to channel
    const channelState = this.channelStates.get(channelId)!;
    channelState.participants.set(fullParticipant.id, fullParticipant);
    channelState.metadata.totalParticipants = channelState.participants.size;
    channelState.metadata.lastActivity = new Date().toISOString();

    // Create and emit join event
    const joinEvent = this.createRealtimeEvent(
      'join',
      channelId,
      fullParticipant,
      {
        welcomeMessage: `${fullParticipant.name} joined the mock session`,
      },
    );

    this.logEvent(joinEvent);
    await this.emitEvent(joinEvent);

    realtimeLogger.info(`Participant joined channel`, {
      participantId: fullParticipant.id,
      channelId,
      timestamp: new Date().toISOString(),
      component: 'mock-adapter',
    });
  }

  async leaveChannel(
    channelId: string,
    participantId: string,
    reason?: string,
  ): Promise<void> {
    await this.delay(this.simulatedLatency);
    this.throwRandomError('LEAVE_CHANNEL_FAILED');

    const channelState = this.channelStates.get(channelId);
    if (!channelState) {
      realtimeLogger.warn(`Channel not found`, {
        channelId,
        timestamp: new Date().toISOString(),
        component: 'mock-adapter',
      });
      return;
    }

    const participant = channelState.participants.get(participantId);
    if (!participant) {
      realtimeLogger.warn(`Participant not found in channel`, {
        participantId,
        channelId,
        timestamp: new Date().toISOString(),
        component: 'mock-adapter',
      });
      return;
    }

    // Calculate session duration
    const joinedAt = new Date(participant.metadata.joinedAt);
    const duration = Math.floor((Date.now() - joinedAt.getTime()) / 1000);

    // Remove participant from channel
    channelState.participants.delete(participantId);
    channelState.metadata.totalParticipants = channelState.participants.size;
    channelState.metadata.lastActivity = new Date().toISOString();

    // Create and emit leave event
    const leaveEvent = this.createRealtimeEvent(
      'leave',
      channelId,
      participant,
      {
        reason: reason || 'Mock user left',
        duration,
      },
    );

    this.logEvent(leaveEvent);
    await this.emitEvent(leaveEvent);

    // Clean up empty channels
    if (channelState.participants.size === 0) {
      this.channelStates.delete(channelId);
    }

    realtimeLogger.info(`Participant left channel`, {
      participantId,
      channelId,
      timestamp: new Date().toISOString(),
      component: 'mock-adapter',
    });
  }

  async updateParticipantStatus(
    channelId: string,
    participantId: string,
    status: RealtimeParticipant['status'],
  ): Promise<void> {
    await this.delay(this.simulatedLatency / 2);

    const channelState = this.channelStates.get(channelId);
    if (!channelState) return;

    const participant = channelState.participants.get(participantId);
    if (!participant) return;

    const previousStatus = participant.status;
    participant.status = status;
    participant.metadata.lastActivity = new Date().toISOString();

    // Create and emit status change event
    const statusEvent = this.createRealtimeEvent(
      'status_change',
      channelId,
      participant,
      {
        previousStatus,
        newStatus: status,
      },
    );

    this.logEvent(statusEvent);
    await this.emitEvent(statusEvent);

    realtimeLogger.info(`Participant status changed`, {
      participantId,
      status,
      timestamp: new Date().toISOString(),
      component: 'mock-adapter',
    });
  }

  getChannelState(channelId: string): RealtimeChannelState | null {
    return this.channelStates.get(channelId) || null;
  }

  getActiveChannels(): string[] {
    return Array.from(this.channelStates.keys());
  }

  setEventHandlers(handlers: RealtimeEventHandlers): void {
    this.eventHandlers = { ...handlers };
  }

  async subscribeToChannel(channelId: string): Promise<void> {
    await this.delay(this.simulatedLatency);
    realtimeLogger.info(`Subscribed to channel`, {
      channelId,
      timestamp: new Date().toISOString(),
      component: 'mock-adapter',
    });

    // Simulate presence sync after subscription
    setTimeout(() => {
      this.simulatePresenceSync(channelId);
    }, 100);
  }

  async unsubscribeFromChannel(channelId: string): Promise<void> {
    await this.delay(this.simulatedLatency);
    realtimeLogger.info(`Unsubscribed from channel`, {
      channelId,
      timestamp: new Date().toISOString(),
      component: 'mock-adapter',
    });
  }

  async getHealth() {
    await this.delay(10); // Quick health check

    return {
      status: 'healthy' as const,
      latency: this.simulatedLatency,
      activeChannels: this.channelStates.size,
      totalParticipants: Array.from(this.channelStates.values()).reduce(
        (total, _state) => total + _state.participants.size,
        0,
      ),
      lastHeartbeat: new Date().toISOString(),
    };
  }

  // ============================================================================
  // Mock-Specific Testing Methods
  // ============================================================================

  /** Set simulated network latency for testing */
  setSimulatedLatency(latency: number): void {
    this.simulatedLatency = latency;
  }

  /** Set error rate for testing error scenarios */
  setErrorRate(rate: number): void {
    this.errorRate = Math.max(0, Math.min(1, rate));
  }

  /** Get event log for testing verification */
  getEventLog(): RealtimeEvent[] {
    return [...this.eventLog];
  }

  /** Clear event log */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /** Simulate a participant disconnection */
  async simulateDisconnection(
    channelId: string,
    participantId: string,
  ): Promise<void> {
    await this.updateParticipantStatus(
      channelId,
      participantId,
      'disconnected',
    );

    // Simulate automatic leave after disconnection
    setTimeout(() => {
      this.leaveChannel(channelId, participantId, 'Connection lost');
    }, 5000);
  }

  /** Simulate network reconnection */
  async simulateReconnection(
    channelId: string,
    participantId: string,
  ): Promise<void> {
    await this.updateParticipantStatus(
      channelId,
      participantId,
      'reconnecting',
    );

    setTimeout(async () => {
      await this.updateParticipantStatus(channelId, participantId, 'connected');
    }, 2000);
  }

  /** Create a mock participant for testing */
  createMockParticipant(
    overrides: Partial<RealtimeParticipant> = {},
  ): RealtimeParticipant {
    const id = overrides.id || `mock-participant-${Date.now()}`;

    return {
      id,
      _role: 'patient',
      name: `Mock User ${id.slice(-4)}`,
      status: 'connected',
      capabilities: {
        audio: true,
        video: true,
        screenShare: false,
        chat: true,
      },
      metadata: {
        clinicId: 'mock-clinic-123',
        sessionId: `mock-session-${Date.now()}`,
        deviceType: 'desktop',
        connectionQuality: 'excellent',
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      },
      ...overrides,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private createRealtimeEvent: typeof createRealtimeEvent = (
    _type,
    channelId,
    _participant,
    data,
  ) => {
    return {
      type: _type,
      timestamp: new Date().toISOString(),
      channelId,
      participant: _participant,
      data,
      metadata: {
        source: 'local',
        eventId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        compliance: {
          lgpdLogged: this.config.healthcare.lgpdCompliance,
          auditRequired: _type === 'join' || _type === 'leave',
          sensitiveData: false,
        },
      },
    };
  };

  private async emitEvent(event: RealtimeEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'join':
          await this.eventHandlers.onJoin?.(event);
          break;
        case 'leave':
          await this.eventHandlers.onLeave?.(event);
          break;
        case 'status_change':
          await this.eventHandlers.onStatusChange?.(event);
          break;
        case 'presence_sync':
          await this.eventHandlers.onPresenceSync?.(event);
          break;
      }
    } catch (error) {
      logHealthcareError('mock-adapter', error as Error, {
        method: 'emitEvent',
        eventType: event.type,
      });
    }
  }

  private logEvent(event: RealtimeEvent): void {
    this.eventLog.push(event);

    // Keep log size manageable
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-500);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private throwRandomError(code: string): void {
    if (Math.random() < this.errorRate) {
      throw new Error(`[MOCK] Simulated error: ${code}`);
    }
  }

  private simulatePresenceSync(channelId: string): void {
    const channelState = this.channelStates.get(channelId);
    if (!channelState) return;

    const participants = Array.from(channelState.participants.values());
    if (participants.length === 0) return;

    const syncEvent = this.createRealtimeEvent(
      'presence_sync',
      channelId,
      participants[0]!,
      {
        participants,
      },
    );

    this.logEvent(syncEvent);
    this.emitEvent(syncEvent);
  }
}
