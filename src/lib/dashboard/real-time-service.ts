/**
 * Real-Time Dashboard Service
 * 
 * Manages real-time updates for the executive dashboard using WebSocket connections,
 * Server-Sent Events (SSE), and intelligent caching strategies.
 */

import { 
  KPIMetric, 
  DashboardAlert, 
  ExecutiveDashboard,
  DashboardWidget,
  RealTimeUpdate,
  UpdateFrequency
} from './types';
import { kpiCalculator } from './kpi-calculator';

// ============================================================================
// REAL-TIME UPDATE TYPES
// ============================================================================

interface UpdateSubscription {
  id: string;
  clinicId: string;
  userId: string;
  widgets: string[];
  frequency: UpdateFrequency;
  lastUpdate: Date;
  callback: (update: RealTimeUpdate) => void;
}

interface WebSocketConnection {
  id: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  lastPing: Date;
  isAlive: boolean;
}

interface UpdateQueue {
  clinicId: string;
  type: 'kpi' | 'alert' | 'widget';
  data: any;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

// ============================================================================
// REAL-TIME SERVICE CLASS
// ============================================================================

export class RealTimeDashboardService {
  private subscriptions: Map<string, UpdateSubscription> = new Map();
  private connections: Map<string, WebSocketConnection> = new Map();
  private updateQueue: UpdateQueue[] = [];
  private isProcessingQueue = false;
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private eventSource: EventSource | null = null;

  // Configuration
  private readonly MAX_CONNECTIONS = 1000;
  private readonly PING_INTERVAL = 30000; // 30 seconds
  private readonly UPDATE_BATCH_SIZE = 10;
  private readonly QUEUE_PROCESS_INTERVAL = 1000; // 1 second

  constructor() {
    this.startQueueProcessor();
    this.startConnectionMonitor();
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Subscribe to real-time dashboard updates
   */
  subscribe(
    clinicId: string,
    userId: string,
    widgets: string[],
    frequency: UpdateFrequency = 'medium',
    callback: (update: RealTimeUpdate) => void
  ): string {
    const subscriptionId = this.generateSubscriptionId(clinicId, userId);
    
    const subscription: UpdateSubscription = {
      id: subscriptionId,
      clinicId,
      userId,
      widgets,
      frequency,
      lastUpdate: new Date(),
      callback
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.setupUpdateInterval(subscription);

    console.log(`Dashboard subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Unsubscribe from dashboard updates
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    // Clear update interval
    const intervalId = this.updateIntervals.get(subscriptionId);
    if (intervalId) {
      clearInterval(intervalId);
      this.updateIntervals.delete(subscriptionId);
    }

    // Remove subscription
    this.subscriptions.delete(subscriptionId);
    
    console.log(`Dashboard subscription removed: ${subscriptionId}`);
    return true;
  }

  /**
   * Update subscription settings
   */
  updateSubscription(
    subscriptionId: string,
    updates: Partial<Pick<UpdateSubscription, 'widgets' | 'frequency'>>
  ): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    // Update subscription
    if (updates.widgets) {
      subscription.widgets = updates.widgets;
    }
    if (updates.frequency) {
      subscription.frequency = updates.frequency;
      // Reset update interval with new frequency
      this.setupUpdateInterval(subscription);
    }

    this.subscriptions.set(subscriptionId, subscription);
    return true;
  }

  // ============================================================================
  // WEBSOCKET CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Establish WebSocket connection for real-time updates
   */
  connectWebSocket(url: string, subscriptionIds: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.connections.size >= this.MAX_CONNECTIONS) {
        reject(new Error('Maximum WebSocket connections reached'));
        return;
      }

      const socket = new WebSocket(url);
      const connectionId = this.generateConnectionId();

      socket.onopen = () => {
        const connection: WebSocketConnection = {
          id: connectionId,
          socket,
          subscriptions: new Set(subscriptionIds),
          lastPing: new Date(),
          isAlive: true
        };

        this.connections.set(connectionId, connection);
        
        // Send initial subscription message
        socket.send(JSON.stringify({
          type: 'subscribe',
          subscriptions: subscriptionIds
        }));

        console.log(`WebSocket connected: ${connectionId}`);
        resolve(connectionId);
      };

      socket.onmessage = (event) => {
        this.handleWebSocketMessage(connectionId, event.data);
      };

      socket.onclose = () => {
        this.connections.delete(connectionId);
        console.log(`WebSocket disconnected: ${connectionId}`);
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error for ${connectionId}:`, error);
        reject(error);
      };
    });
  }

  /**
   * Disconnect WebSocket connection
   */
  disconnectWebSocket(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.socket.close();
    this.connections.delete(connectionId);
    return true;
  }

  /**
   * Broadcast update to all connected WebSocket clients
   */
  private broadcastToWebSockets(update: RealTimeUpdate): void {
    this.connections.forEach((connection) => {
      if (connection.socket.readyState === WebSocket.OPEN) {
        try {
          connection.socket.send(JSON.stringify(update));
        } catch (error) {
          console.error(`Failed to send WebSocket message to ${connection.id}:`, error);
        }
      }
    });
  }

  // ============================================================================
  // SERVER-SENT EVENTS (SSE)
  // ============================================================================

  /**
   * Connect to Server-Sent Events for real-time updates
   */
  connectSSE(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        resolve();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          this.processRealTimeUpdate(update);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        reject(error);
      };
    });
  }

  /**
   * Disconnect from Server-Sent Events
   */
  disconnectSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE connection closed');
    }
  }

  // ============================================================================
  // UPDATE PROCESSING
  // ============================================================================

  /**
   * Process incoming real-time update
   */
  private processRealTimeUpdate(update: RealTimeUpdate): void {
    // Add to update queue for processing
    this.updateQueue.push({
      clinicId: update.clinicId,
      type: update.type as 'kpi' | 'alert' | 'widget',
      data: update.data,
      priority: this.determinePriority(update),
      timestamp: new Date()
    });

    // Sort queue by priority and timestamp
    this.updateQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  /**
   * Determine update priority based on content
   */
  private determinePriority(update: RealTimeUpdate): 'high' | 'medium' | 'low' {
    if (update.type === 'alert') {
      const alert = update.data as DashboardAlert;
      return alert.severity === 'critical' ? 'high' : 'medium';
    }
    
    if (update.type === 'kpi') {
      const kpi = update.data as KPIMetric;
      if (kpi.status === 'critical' || Math.abs(kpi.changePercent) > 20) {
        return 'high';
      }
      return 'medium';
    }

    return 'low';
  }

  /**
   * Start the update queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      if (!this.isProcessingQueue && this.updateQueue.length > 0) {
        this.processUpdateQueue();
      }
    }, this.QUEUE_PROCESS_INTERVAL);
  }

  /**
   * Process updates from the queue
   */
  private async processUpdateQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    try {
      const batch = this.updateQueue.splice(0, this.UPDATE_BATCH_SIZE);
      
      for (const queueItem of batch) {
        await this.distributeUpdate(queueItem);
      }
    } catch (error) {
      console.error('Error processing update queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Distribute update to relevant subscriptions
   */
  private async distributeUpdate(queueItem: UpdateQueue): Promise<void> {
    const relevantSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.clinicId === queueItem.clinicId);

    for (const subscription of relevantSubscriptions) {
      try {
        const update: RealTimeUpdate = {
          id: this.generateUpdateId(),
          type: queueItem.type,
          clinicId: queueItem.clinicId,
          data: queueItem.data,
          timestamp: queueItem.timestamp,
          metadata: {
            priority: queueItem.priority,
            subscriptionId: subscription.id
          }
        };

        subscription.callback(update);
        subscription.lastUpdate = new Date();
      } catch (error) {
        console.error(`Failed to deliver update to subscription ${subscription.id}:`, error);
      }
    }
  }

  // ============================================================================
  // PERIODIC UPDATES
  // ============================================================================

  /**
   * Setup periodic update interval for subscription
   */
  private setupUpdateInterval(subscription: UpdateSubscription): void {
    // Clear existing interval
    const existingInterval = this.updateIntervals.get(subscription.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Determine interval based on frequency
    const intervalMs = this.getUpdateInterval(subscription.frequency);
    
    const intervalId = setInterval(async () => {
      await this.performPeriodicUpdate(subscription);
    }, intervalMs);

    this.updateIntervals.set(subscription.id, intervalId);
  }

  /**
   * Get update interval in milliseconds based on frequency
   */
  private getUpdateInterval(frequency: UpdateFrequency): number {
    switch (frequency) {
      case 'real-time': return 5000;   // 5 seconds
      case 'high': return 15000;       // 15 seconds
      case 'medium': return 60000;     // 1 minute
      case 'low': return 300000;       // 5 minutes
      default: return 60000;
    }
  }

  /**
   * Perform periodic update for subscription
   */
  private async performPeriodicUpdate(subscription: UpdateSubscription): Promise<void> {
    try {
      // Calculate fresh KPIs for subscribed widgets
      const dateRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      };

      const kpis = await kpiCalculator.calculateAllKPIs(subscription.clinicId, dateRange);
      
      // Filter KPIs based on subscribed widgets
      const relevantKPIs = kpis.filter(kpi => 
        subscription.widgets.includes(kpi.id) || subscription.widgets.includes('all')
      );

      if (relevantKPIs.length > 0) {
        const update: RealTimeUpdate = {
          id: this.generateUpdateId(),
          type: 'kpi',
          clinicId: subscription.clinicId,
          data: relevantKPIs,
          timestamp: new Date(),
          metadata: {
            updateType: 'periodic',
            subscriptionId: subscription.id
          }
        };

        subscription.callback(update);
        subscription.lastUpdate = new Date();
      }
    } catch (error) {
      console.error(`Periodic update failed for subscription ${subscription.id}:`, error);
    }
  }

  // ============================================================================
  // CONNECTION MONITORING
  // ============================================================================

  /**
   * Start connection health monitoring
   */
  private startConnectionMonitor(): void {
    setInterval(() => {
      this.pingConnections();
      this.cleanupStaleConnections();
    }, this.PING_INTERVAL);
  }

  /**
   * Send ping to all WebSocket connections
   */
  private pingConnections(): void {
    this.connections.forEach((connection) => {
      if (connection.socket.readyState === WebSocket.OPEN) {
        try {
          connection.socket.send(JSON.stringify({ type: 'ping' }));
          connection.lastPing = new Date();
        } catch (error) {
          console.error(`Failed to ping connection ${connection.id}:`, error);
          connection.isAlive = false;
        }
      } else {
        connection.isAlive = false;
      }
    });
  }

  /**
   * Clean up stale connections
   */
  private cleanupStaleConnections(): void {
    const staleThreshold = Date.now() - (this.PING_INTERVAL * 3); // 3 missed pings
    
    this.connections.forEach((connection, connectionId) => {
      if (!connection.isAlive || connection.lastPing.getTime() < staleThreshold) {
        console.log(`Cleaning up stale connection: ${connectionId}`);
        this.disconnectWebSocket(connectionId);
      }
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleWebSocketMessage(connectionId: string, message: string): void {
    try {
      const data = JSON.parse(message);
      const connection = this.connections.get(connectionId);
      
      if (!connection) return;

      switch (data.type) {
        case 'pong':
          connection.isAlive = true;
          break;
        case 'subscribe':
          if (data.subscriptions) {
            data.subscriptions.forEach((subId: string) => {
              connection.subscriptions.add(subId);
            });
          }
          break;
        case 'unsubscribe':
          if (data.subscriptions) {
            data.subscriptions.forEach((subId: string) => {
              connection.subscriptions.delete(subId);
            });
          }
          break;
        default:
          console.log(`Unknown WebSocket message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`Failed to handle WebSocket message from ${connectionId}:`, error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateSubscriptionId(clinicId: string, userId: string): string {
    return `sub_${clinicId}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUpdateId(): string {
    return `upd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service statistics
   */
  getStats(): {
    subscriptions: number;
    connections: number;
    queueSize: number;
    activeIntervals: number;
  } {
    return {
      subscriptions: this.subscriptions.size,
      connections: this.connections.size,
      queueSize: this.updateQueue.length,
      activeIntervals: this.updateIntervals.size
    };
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    // Clear all intervals
    this.updateIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.updateIntervals.clear();

    // Close all WebSocket connections
    this.connections.forEach((connection) => {
      connection.socket.close();
    });
    this.connections.clear();

    // Disconnect SSE
    this.disconnectSSE();

    // Clear subscriptions
    this.subscriptions.clear();

    // Clear update queue
    this.updateQueue = [];

    console.log('Real-time dashboard service cleaned up');
  }
}

// Export singleton instance
export const realTimeService = new RealTimeDashboardService();
