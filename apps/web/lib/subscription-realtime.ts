/**
 * Real-time Subscription Status Validation System
 *
 * This module provides WebSocket integration for real-time subscription status
 * updates, enabling instant UI synchronization without page refreshes.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '../app/utils/supabase/client';
import type { SubscriptionStatus } from './subscription-status';

// Real-time event types
export type SubscriptionEvent =
  | 'subscription_activated'
  | 'subscription_cancelled'
  | 'subscription_expired'
  | 'subscription_trial_ended'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'subscription_renewed'
  | 'payment_failed'
  | 'payment_succeeded';

export type SubscriptionRealtimeUpdate = {
  event: SubscriptionEvent;
  userId: string;
  subscriptionId: string;
  status: SubscriptionStatus;
  previousStatus?: SubscriptionStatus;
  timestamp: string;
  metadata?: {
    tier?: string;
    features?: string[];
    gracePeriodEnd?: string;
    nextBilling?: string;
    reason?: string;
  };
};

export type RealtimeConfig = {
  channel?: string;
  heartbeatInterval?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enableLogging?: boolean;
};

export type RealtimeMetrics = {
  connectionsActive: number;
  messagesReceived: number;
  messagesSent: number;
  reconnectAttempts: number;
  lastConnected: string;
  uptime: number;
  latency: number;
};

export class SubscriptionRealtimeManager {
  private readonly supabase = createClient();
  private channel: RealtimeChannel | null = null;
  private readonly listeners: Map<
    string,
    ((update: SubscriptionRealtimeUpdate) => void)[]
  > = new Map();
  private readonly config: Required<RealtimeConfig>;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly metrics: RealtimeMetrics = {
    connectionsActive: 0,
    messagesReceived: 0,
    messagesSent: 0,
    reconnectAttempts: 0,
    lastConnected: '',
    uptime: 0,
    latency: 0,
  };
  private readonly connectionStartTime = 0;
  private lastHeartbeat = 0;

  constructor(config: RealtimeConfig = {}) {
    this.config = {
      channel: config.channel || 'subscription_updates',
      heartbeatInterval: config.heartbeatInterval || 30_000, // 30 seconds
      reconnectInterval: config.reconnectInterval || 5000, // 5 seconds
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      enableLogging: config.enableLogging ?? true,
    };

    // Auto-connect on instantiation
    this.connect();
  }

  /**
   * Establish real-time connection to subscription updates
   */
  public async connect(): Promise<boolean> {
    try {
      if (this.isConnected) {
        this.log('Already connected to real-time subscription updates');
        return true;
      }

      this.connectionStartTime = Date.now();
      this.log('Connecting to real-time subscription updates...');

      // Create channel for subscription updates
      this.channel = this.supabase.channel(this.config.channel, {
        config: {
          broadcast: { self: false },
          presence: { key: 'subscription_status' },
        },
      });

      // Listen to subscription table changes
      this.channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
          },
          (payload) => this.handleSubscriptionChange(payload),
        )
        .on('broadcast', { event: 'subscription_event' }, (payload) =>
          this.handleBroadcastEvent(payload),
        )
        .on('presence', { event: 'sync' }, () => this.handlePresenceSync())
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.metrics.connectionsActive = 1;
            this.metrics.lastConnected = new Date().toISOString();
            this.log('Successfully connected to real-time updates');
            this.startHeartbeat();
          } else if (status === 'CLOSED') {
            this.handleDisconnection();
          } else if (err) {
            this.log(`Connection error: ${err.message}`, 'error');
            this.scheduleReconnect();
          }
        });

      return true;
    } catch (error) {
      this.log(
        `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Disconnect from real-time updates
   */
  public async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.isConnected = false;
    this.metrics.connectionsActive = 0;
    this.stopHeartbeat();
    this.log('Disconnected from real-time updates');
  }

  /**
   * Subscribe to subscription status updates for a specific user
   */
  public subscribe(
    userId: string,
    callback: (update: SubscriptionRealtimeUpdate) => void,
  ): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }

    this.listeners.get(userId)?.push(callback);
    this.log(`Subscribed user ${userId} to real-time updates`);

    // Return unsubscribe function
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        const index = userListeners.indexOf(callback);
        if (index > -1) {
          userListeners.splice(index, 1);
          if (userListeners.length === 0) {
            this.listeners.delete(userId);
          }
        }
      }
      this.log(`Unsubscribed user ${userId} from real-time updates`);
    };
  }

  /**
   * Broadcast a subscription event to all connected clients
   */
  public async broadcast(event: SubscriptionRealtimeUpdate): Promise<boolean> {
    try {
      if (!(this.channel && this.isConnected)) {
        this.log(
          'Cannot broadcast: not connected to real-time channel',
          'warning',
        );
        return false;
      }

      await this.channel.send({
        type: 'broadcast',
        event: 'subscription_event',
        payload: event,
      });

      this.metrics.messagesSent++;
      this.log(`Broadcasted event: ${event.event} for user ${event.userId}`);
      return true;
    } catch (error) {
      this.log(
        `Failed to broadcast event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
      return false;
    }
  }

  /**
   * Force refresh subscription status for a user
   */
  public async forceRefresh(userId: string): Promise<void> {
    try {
      // Fetch current subscription status from database
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        this.log(
          `Failed to refresh subscription for user ${userId}: ${error.message}`,
          'error',
        );
        return;
      }

      if (subscription) {
        const update: SubscriptionRealtimeUpdate = {
          event: 'subscription_renewed',
          userId,
          subscriptionId: subscription.id,
          status: subscription.status,
          timestamp: new Date().toISOString(),
          metadata: {
            tier: subscription.tier,
            gracePeriodEnd: subscription.current_period_end,
            nextBilling: subscription.current_period_end,
          },
        };

        this.notifyListeners(update);
        this.log(`Force refreshed subscription status for user ${userId}`);
      }
    } catch (error) {
      this.log(
        `Failed to force refresh: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
    }
  }

  /**
   * Get current real-time connection metrics
   */
  public getMetrics(): RealtimeMetrics {
    if (this.connectionStartTime > 0) {
      this.metrics.uptime = Date.now() - this.connectionStartTime;
    }
    return { ...this.metrics };
  }

  /**
   * Get connection status
   */
  public isConnectedToRealtime(): boolean {
    return this.isConnected;
  }

  /**
   * Handle postgres subscription table changes
   */
  private handleSubscriptionChange(payload: any): void {
    try {
      this.metrics.messagesReceived++;
      const { eventType, new: newRecord, old: oldRecord } = payload;

      let event: SubscriptionEvent = 'subscription_renewed';
      let status = newRecord?.status || oldRecord?.status;

      // Map postgres events to subscription events
      switch (eventType) {
        case 'INSERT':
          event = 'subscription_activated';
          break;
        case 'UPDATE':
          if (oldRecord?.status !== newRecord?.status) {
            switch (newRecord.status) {
              case 'active':
                event = 'subscription_activated';
                break;
              case 'cancelled':
                event = 'subscription_cancelled';
                break;
              case 'expired':
                event = 'subscription_expired';
                break;
              case 'trialing':
                event = 'subscription_trial_ended';
                break;
            }
          } else if (oldRecord?.tier !== newRecord?.tier) {
            event =
              newRecord.tier > oldRecord.tier
                ? 'subscription_upgraded'
                : 'subscription_downgraded';
          }
          break;
        case 'DELETE':
          event = 'subscription_cancelled';
          status = 'cancelled';
          break;
      }

      const record = newRecord || oldRecord;
      if (record) {
        const update: SubscriptionRealtimeUpdate = {
          event,
          userId: record.user_id,
          subscriptionId: record.id,
          status,
          previousStatus: oldRecord?.status,
          timestamp: new Date().toISOString(),
          metadata: {
            tier: record.tier,
            gracePeriodEnd: record.current_period_end,
            nextBilling: record.current_period_end,
          },
        };

        this.notifyListeners(update);
        this.log(
          `Processed subscription change: ${event} for user ${record.user_id}`,
        );
      }
    } catch (error) {
      this.log(
        `Failed to handle subscription change: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
    }
  }

  /**
   * Handle broadcast events from other clients
   */
  private handleBroadcastEvent(payload: any): void {
    try {
      this.metrics.messagesReceived++;
      const update = payload.payload as SubscriptionRealtimeUpdate;
      this.notifyListeners(update);
      this.log(
        `Received broadcast event: ${update.event} for user ${update.userId}`,
      );
    } catch (error) {
      this.log(
        `Failed to handle broadcast event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
      );
    }
  }

  /**
   * Handle presence sync events
   */
  private handlePresenceSync(): void {
    if (this.channel) {
      const presenceState = this.channel.presenceState();
      const activeClients = Object.keys(presenceState).length;
      this.log(`Presence sync: ${activeClients} active clients`);
    }
  }

  /**
   * Notify registered listeners of subscription updates
   */
  private notifyListeners(update: SubscriptionRealtimeUpdate): void {
    const listeners = this.listeners.get(update.userId);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(update);
        } catch (error) {
          this.log(
            `Listener error for user ${update.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'error',
          );
        }
      });
    }
  }

  /**
   * Handle connection loss and attempt reconnection
   */
  private handleDisconnection(): void {
    this.isConnected = false;
    this.metrics.connectionsActive = 0;
    this.stopHeartbeat();
    this.log('Connection lost, scheduling reconnect...');
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log(
        `Max reconnection attempts (${this.config.maxReconnectAttempts}) reached`,
        'error',
      );
      return;
    }

    this.reconnectAttempts++;
    this.metrics.reconnectAttempts++;

    setTimeout(() => {
      this.log(
        `Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`,
      );
      this.connect();
    }, this.config.reconnectInterval * this.reconnectAttempts); // Exponential backoff
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.lastHeartbeat = Date.now();

    const heartbeatCheck = () => {
      if (this.isConnected) {
        const now = Date.now();
        this.metrics.latency = now - this.lastHeartbeat;
        this.lastHeartbeat = now;

        // Send heartbeat
        if (this.channel) {
          this.channel.send({
            type: 'broadcast',
            event: 'heartbeat',
            payload: { timestamp: now },
          });
        }

        setTimeout(heartbeatCheck, this.config.heartbeatInterval);
      }
    };

    setTimeout(heartbeatCheck, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    this.lastHeartbeat = 0;
  }

  /**
   * Internal logging utility
   */
  private log(
    _message: string,
    level: 'info' | 'warning' | 'error' = 'info',
  ): void {
    if (this.config.enableLogging) {
      const _timestamp = new Date().toISOString();
      const _prefix = `[SubscriptionRealtime:${level.toUpperCase()}]`;

      switch (level) {
        case 'error':
          break;
        case 'warning':
          break;
        default:
      }
    }
  }
}

// Singleton instance for application-wide use
export const subscriptionRealtimeManager = new SubscriptionRealtimeManager({
  enableLogging: process.env.NODE_ENV === 'development',
});

// Helper functions for common operations
export async function subscribeToUserUpdates(
  userId: string,
  callback: (update: SubscriptionRealtimeUpdate) => void,
): Promise<() => void> {
  return subscriptionRealtimeManager.subscribe(userId, callback);
}

export async function broadcastSubscriptionEvent(
  event: SubscriptionRealtimeUpdate,
): Promise<boolean> {
  return subscriptionRealtimeManager.broadcast(event);
}

export function getRealtimeMetrics(): RealtimeMetrics {
  return subscriptionRealtimeManager.getMetrics();
}

export function isRealtimeConnected(): boolean {
  return subscriptionRealtimeManager.isConnectedToRealtime();
}
