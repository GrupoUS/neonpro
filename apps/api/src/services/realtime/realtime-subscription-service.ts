/**
 * Real-time Subscription Service for AI Agent
 * 
 * Manages real-time subscriptions for live data updates using Supabase Realtime
 * with healthcare compliance and security filtering.
 */

import { RealtimeChannel, RealtimeClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface RealtimeEvent {
  id: string;
  type: 'message' | 'session_update' | 'context_change' | 'system_event';
  sessionId?: string;
  userId?: string;
  patientId?: string;
  payload: any;
  timestamp: string;
  eventType: string;
  metadata?: {
    source: 'user' | 'assistant' | 'system';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  };
}

export interface SubscriptionOptions {
  sessionId?: string;
  userId?: string;
  patientId?: string;
  eventTypes?: RealtimeEvent['type'][];
  dataClassification?: RealtimeEvent['metadata']['dataClassification'][];
  filters?: {
    messageTypes?: string[];
    roles?: ('user' | 'assistant' | 'system')[];
    urgency?: RealtimeEvent['metadata']['urgency'][];
  };
  includeSystemEvents?: boolean;
  heartbeatInterval?: number;
  timeout?: number;
}

export interface SubscriptionHandle {
  id: string;
  userId: string;
  sessionId?: string;
  channels: Map<string, RealtimeChannel>;
  eventTypes: Set<RealtimeEvent['type']>;
  options: SubscriptionOptions;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
}

export interface RealtimeAnalytics {
  activeSubscriptions: number;
  totalEventsProcessed: number;
  eventsByType: Record<string, number>;
  averageLatency: number;
  errorRate: number;
  usersOnline: number;
}

export class RealtimeSubscriptionService extends EventEmitter {
  private supabase: RealtimeClient;
  private subscriptions: Map<string, SubscriptionHandle> = new Map();
  private eventQueue: RealtimeEvent[] = [];
  private isProcessing = false;
  private analytics = {
    totalEvents: 0,
    eventsByType: {} as Record<string, number>,
    errors: 0,
    startTime: Date.now(),
    latencies: [] as number[]
  };

  constructor(supabaseUrl: string, supabaseKey: string) {
    super();
    this.supabase = new RealtimeClient(supabaseUrl, {
      params: {
        apikey: supabaseKey,
      },
    });
    
    this.setupErrorHandling();
    this.startEventProcessor();
    this.startCleanupTask();
  }

  /**
   * Create a new real-time subscription
   */
  async createSubscription(
    userId: string,
    options: SubscriptionOptions = {}
  ): Promise<SubscriptionHandle> {
    try {
      const subscriptionId = uuidv4();
      const channels = new Map<string, RealtimeChannel>();
      
      // Default event types
      const eventTypes = new Set(options.eventTypes || [
        'message', 'session_update', 'context_change'
      ]);

      // Create channels for each event type
      for (const eventType of eventTypes) {
        const channelName = this.getChannelName(eventType, userId, options);
        const channel = this.supabase.channel(channelName);
        
        // Set up channel event handlers
        channel
          .on('broadcast', { event: eventType }, (payload) => {
            this.handleRealtimeEvent(payload.payload, eventType);
          })
          .on('presence', { event: 'sync' }, () => {
            this.handlePresenceSync(channelName);
          })
          .on('system', (event) => {
            this.handleSystemEvent(event, channelName);
          });

        channels.set(channelName, channel);
        
        // Subscribe to the channel
        await channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.emit('subscribed', { subscriptionId, channelName, eventType });
            this.logEvent('subscription_created', { subscriptionId, eventType, userId });
          } else if (status === 'CHANNEL_ERROR') {
            this.emit('error', { subscriptionId, channelName, error: 'Channel subscription failed' });
            this.logError('subscription_error', { subscriptionId, channelName, status });
          }
        });
      }

      const subscription: SubscriptionHandle = {
        id: subscriptionId,
        userId,
        sessionId: options.sessionId,
        channels,
        eventTypes,
        options,
        isActive: true,
        lastActivity: new Date(),
        createdAt: new Date()
      };

      this.subscriptions.set(subscriptionId, subscription);
      
      // Start heartbeat if configured
      if (options.heartbeatInterval) {
        this.startHeartbeat(subscriptionId, options.heartbeatInterval);
      }

      this.emit('subscription_created', subscription);
      return subscription;
    } catch (error) {
      this.logError('create_subscription_failed', { userId, options, error });
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Remove a subscription
   */
  async removeSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        return;
      }

      // Unsubscribe from all channels
      for (const [channelName, channel] of subscription.channels) {
        await this.supabase.removeChannel(channel);
      }

      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);

      this.emit('subscription_removed', { subscriptionId });
      this.logEvent('subscription_removed', { subscriptionId });
    } catch (error) {
      this.logError('remove_subscription_failed', { subscriptionId, error });
      throw new Error(`Failed to remove subscription: ${error.message}`);
    }
  }

  /**
   * Broadcast a real-time event
   */
  async broadcastEvent(
    event: Omit<RealtimeEvent, 'id' | 'timestamp'>,
    targetFilter?: {
      userIds?: string[];
      sessionIds?: string[];
      patientIds?: string[];
    }
  ): Promise<void> {
    try {
      const fullEvent: RealtimeEvent = {
        ...event,
        id: uuidv4(),
        timestamp: new Date().toISOString()
      };

      // Validate event
      if (!this.validateEvent(fullEvent)) {
        throw new Error('Invalid event structure');
      }

      // Apply security filtering
      if (!this.isEventAllowed(fullEvent)) {
        this.logError('event_blocked_security', { eventId: fullEvent.id, type: fullEvent.type });
        return;
      }

      // Queue event for processing
      this.eventQueue.push(fullEvent);
      
      // Broadcast to appropriate channels
      const channels = this.getTargetChannels(fullEvent, targetFilter);
      for (const channelName of channels) {
        const channel = this.supabase.getChannels().find(c => c.topic === channelName);
        if (channel) {
          await channel.send({
            type: 'broadcast',
            event: fullEvent.type,
            payload: fullEvent
          });
        }
      }

      this.logEvent('event_broadcast', { 
        eventId: fullEvent.id, 
        type: fullEvent.type,
        channelsCount: channels.length
      });
    } catch (error) {
      this.logError('broadcast_failed', { event, error });
      throw new Error(`Failed to broadcast event: ${error.message}`);
    }
  }

  /**
   * Get subscription analytics
   */
  getAnalytics(): RealtimeAnalytics {
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(s => s.isActive);
    const usersOnline = new Set(activeSubscriptions.map(s => s.userId)).size;

    return {
      activeSubscriptions: activeSubscriptions.length,
      totalEventsProcessed: this.analytics.totalEvents,
      eventsByType: { ...this.analytics.eventsByType },
      averageLatency: this.calculateAverageLatency(),
      errorRate: this.calculateErrorRate(),
      usersOnline
    };
  }

  /**
   * Get user subscriptions
   */
  getUserSubscriptions(userId: string): SubscriptionHandle[] {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.userId === userId && sub.isActive);
  }

  /**
   * Get session subscriptions
   */
  getSessionSubscriptions(sessionId: string): SubscriptionHandle[] {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.sessionId === sessionId && sub.isActive);
  }

  /**
   * Clean up inactive subscriptions
   */
  async cleanupInactiveSubscriptions(maxInactiveTime: number = 30 * 60 * 1000): Promise<number> {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [subscriptionId, subscription] of this.subscriptions) {
      const inactiveTime = now - subscription.lastActivity.getTime();
      if (inactiveTime > maxInactiveTime) {
        toRemove.push(subscriptionId);
      }
    }

    for (const subscriptionId of toRemove) {
      await this.removeSubscription(subscriptionId);
    }

    return toRemove.length;
  }

  /**
   * Handle incoming real-time events
   */
  private handleRealtimeEvent(payload: any, eventType: string): void {
    try {
      const event: RealtimeEvent = {
        ...payload,
        eventType
      };

      if (!this.validateEvent(event)) {
        this.logError('invalid_event_received', { payload, eventType });
        return;
      }

      // Check if event passes subscription filters
      const relevantSubscriptions = this.getRelevantSubscriptions(event);
      
      for (const subscription of relevantSubscriptions) {
        if (this.eventPassesFilters(event, subscription.options)) {
          subscription.lastActivity = new Date();
          this.emit('event', { subscriptionId: subscription.id, event });
        }
      }

      this.updateAnalytics(eventType);
    } catch (error) {
      this.logError('event_handling_failed', { payload, eventType, error });
    }
  }

  /**
   * Get relevant subscriptions for an event
   */
  private getRelevantSubscriptions(event: RealtimeEvent): SubscriptionHandle[] {
    return Array.from(this.subscriptions.values()).filter(sub => 
      sub.isActive && 
      sub.eventTypes.has(event.type) &&
      (!event.userId || sub.userId === event.userId) &&
      (!event.sessionId || sub.sessionId === event.sessionId)
    );
  }

  /**
   * Check if event passes subscription filters
   */
  private eventPassesFilters(event: RealtimeEvent, options: SubscriptionOptions): boolean {
    // Check data classification filter
    if (options.dataClassification?.length && 
        !options.dataClassification.includes(event.metadata?.dataClassification)) {
      return false;
    }

    // Check other filters
    if (options.filters) {
      const { filters } = options;
      
      // Check message types
      if (filters.messageTypes?.length && event.payload?.messageType) {
        if (!filters.messageTypes.includes(event.payload.messageType)) {
          return false;
        }
      }

      // Check urgency
      if (filters.urgency?.length && event.metadata?.urgency) {
        if (!filters.urgency.includes(event.metadata.urgency)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Generate channel name for subscription
   */
  private getChannelName(eventType: string, userId: string, options: SubscriptionOptions): string {
    const parts = [eventType, userId];
    
    if (options.sessionId) {
      parts.push(options.sessionId);
    }
    
    if (options.patientId) {
      parts.push(options.patientId);
    }

    return parts.join(':');
  }

  /**
   * Get target channels for event broadcasting
   */
  private getTargetChannels(event: RealtimeEvent, targetFilter?: any): string[] {
    const channels: string[] = [];

    if (targetFilter?.userIds?.length) {
      for (const userId of targetFilter.userIds) {
        channels.push(`${event.type}:${userId}`);
        if (event.sessionId) {
          channels.push(`${event.type}:${userId}:${event.sessionId}`);
        }
      }
    } else {
      // Broadcast to all relevant channels
      for (const subscription of this.subscriptions.values()) {
        if (subscription.eventTypes.has(event.type)) {
          const channelName = this.getChannelName(
            event.type, 
            subscription.userId, 
            subscription.options
          );
          channels.push(channelName);
        }
      }
    }

    return [...new Set(channels)]; // Remove duplicates
  }

  /**
   * Validate event structure
   */
  private validateEvent(event: RealtimeEvent): boolean {
    return (
      event.id &&
      event.type &&
      event.timestamp &&
      event.eventType &&
      event.payload &&
      (event.metadata ? event.metadata.dataClassification : true)
    );
  }

  /**
   * Check if event is allowed by security policies
   */
  private isEventAllowed(event: RealtimeEvent): boolean {
    // Check for sensitive data in public events
    if (event.metadata?.dataClassification === 'restricted') {
      // Restricted data should not be broadcast to public channels
      return false;
    }

    // Validate payload size (prevent large payloads)
    const payloadSize = JSON.stringify(event.payload).length;
    if (payloadSize > 1024 * 1024) { // 1MB limit
      return false;
    }

    return true;
  }

  /**
   * Start event processor
   */
  private startEventProcessor(): void {
    setInterval(() => {
      if (this.isProcessing || this.eventQueue.length === 0) {
        return;
      }

      this.isProcessing = true;
      const batch = this.eventQueue.splice(0, 100); // Process up to 100 events at once

      Promise.all(batch.map(event => this.processEvent(event)))
        .catch(error => {
          this.logError('event_batch_failed', { error, batchSize: batch.length });
        })
        .finally(() => {
          this.isProcessing = false;
        });
    }, 100); // Process every 100ms
  }

  /**
   * Process individual event
   */
  private async processEvent(event: RealtimeEvent): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Apply any additional processing logic here
      this.updateAnalytics(event.eventType);
      
      const processingTime = Date.now() - startTime;
      this.analytics.latencies.push(processingTime);
      
      // Keep only last 1000 latency measurements
      if (this.analytics.latencies.length > 1000) {
        this.analytics.latencies = this.analytics.latencies.slice(-1000);
      }
    } catch (error) {
      this.analytics.errors++;
      this.logError('event_processing_failed', { eventId: event.id, error });
    }
  }

  /**
   * Start cleanup task
   */
  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupInactiveSubscriptions()
        .then(count => {
          if (count > 0) {
            this.logEvent('cleanup_completed', { removedCount: count });
          }
        })
        .catch(error => {
          this.logError('cleanup_failed', { error });
        });
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  /**
   * Start heartbeat for subscription
   */
  private startHeartbeat(subscriptionId: string, interval: number): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    const heartbeat = setInterval(() => {
      if (!subscription.isActive) {
        clearInterval(heartbeat);
        return;
      }

      this.broadcastEvent({
        type: 'system_event',
        payload: { type: 'heartbeat', subscriptionId },
        metadata: {
          source: 'system',
          urgency: 'low',
          dataClassification: 'public'
        }
      });
    }, interval);

    // Store heartbeat interval for cleanup
    (subscription as any).heartbeatInterval = heartbeat;
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.supabase.onClose(() => {
      this.emit('connection_lost');
      this.logError('connection_lost', {});
    });

    this.supabase.onError((error) => {
      this.emit('connection_error', error);
      this.logError('connection_error', { error });
    });
  }

  /**
   * Handle presence sync
   */
  private handlePresenceSync(channelName: string): void {
    this.logEvent('presence_sync', { channelName });
  }

  /**
   * Handle system events
   */
  private handleSystemEvent(event: any, channelName: string): void {
    this.logEvent('system_event', { event, channelName });
  }

  /**
   * Update analytics
   */
  private updateAnalytics(eventType: string): void {
    this.analytics.totalEvents++;
    this.analytics.eventsByType[eventType] = (this.analytics.eventsByType[eventType] || 0) + 1;
  }

  /**
   * Calculate average latency
   */
  private calculateAverageLatency(): number {
    if (this.analytics.latencies.length === 0) return 0;
    
    const sum = this.analytics.latencies.reduce((acc, latency) => acc + latency, 0);
    return sum / this.analytics.latencies.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    if (this.analytics.totalEvents === 0) return 0;
    return this.analytics.errors / this.analytics.totalEvents;
  }

  /**
   * Log event for analytics
   */
  private logEvent(type: string, data: any): void {
    this.emit('log', { type, data, timestamp: new Date().toISOString() });
  }

  /**
   * Log error
   */
  private logError(type: string, data: any): void {
    this.emit('error_log', { type, data, timestamp: new Date().toISOString() });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      // Remove all subscriptions
      const subscriptionIds = Array.from(this.subscriptions.keys());
      await Promise.all(subscriptionIds.map(id => this.removeSubscription(id)));

      // Close Supabase connection
      this.supabase.close();

      this.emit('shutdown');
    } catch (error) {
      this.logError('shutdown_failed', { error });
      throw error;
    }
  }
}