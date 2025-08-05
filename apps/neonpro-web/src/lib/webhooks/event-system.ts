/**
 * Event System Core
 * Story 7.3: Webhook & Event System Implementation
 *
 * This module provides the core event system functionality:
 * - Event creation and publishing
 * - Event queue management
 * - Event filtering and routing
 * - Event persistence and retrieval
 * - Real-time event streaming
 * - Event analytics and monitoring
 */

import type {
  BaseEvent,
  EventAnalytics,
  EventFilter,
  EventHandler,
  EventPriority,
  EventQueueItem,
  EventType,
} from "./types";

interface EventSystemConfig {
  supabaseUrl: string;
  supabaseKey: string;
  enableRealtime: boolean;
  enablePersistence: boolean;
  queueConfig: {
    maxSize: number;
    processingConcurrency: number;
    batchSize: number;
    processingInterval: number;
  };
  retentionDays: number;
}

export class EventSystem {
  private supabase;
  private config: EventSystemConfig;
  private eventQueue: EventQueueItem[] = [];
  private eventHandlers: Map<EventType, EventHandler[]> = new Map();
  private eventFilters: Map<string, EventFilter> = new Map();
  private isProcessing: boolean = false;
  private processingInterval?: NodeJS.Timeout;
  private realtimeChannel?: any;

  constructor(config: EventSystemConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Initialize the event system
   */
  async initialize(): Promise<void> {
    try {
      console.log("Initializing Event System...");

      // Setup database tables if needed
      await this.setupDatabase();

      // Load existing event handlers and filters
      await this.loadEventHandlers();
      await this.loadEventFilters();

      // Setup real-time subscriptions
      if (this.config.enableRealtime) {
        await this.setupRealtimeSubscriptions();
      }

      // Start queue processing
      this.startQueueProcessing();

      console.log("✅ Event System initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize event system:", error);
      throw new Error("Event system initialization failed");
    }
  }

  /**
   * Publish an event to the system
   */
  async publishEvent(eventData: Omit<BaseEvent, "id" | "timestamp">): Promise<string> {
    try {
      const event: BaseEvent = {
        id: this.generateEventId(),
        timestamp: new Date(),
        ...eventData,
      };

      console.log(`Publishing event: ${event.type} (${event.id})`);

      // Validate event
      this.validateEvent(event);

      // Apply filters
      const filteredEvent = await this.applyEventFilters(event);
      if (!filteredEvent) {
        console.log(`Event ${event.id} filtered out`);
        return event.id;
      }

      // Persist event if enabled
      if (this.config.enablePersistence) {
        await this.persistEvent(event);
      }

      // Add to processing queue
      await this.queueEvent(event);

      // Execute immediate handlers
      await this.executeImmediateHandlers(event);

      // Publish to real-time channel
      if (this.config.enableRealtime) {
        await this.publishToRealtime(event);
      }

      console.log(`✅ Event ${event.id} published successfully`);
      return event.id;
    } catch (error) {
      console.error("❌ Failed to publish event:", error);
      throw new Error(`Event publishing failed: ${error.message}`);
    }
  }

  /**
   * Register an event handler
   */
  registerEventHandler(handler: EventHandler): void {
    try {
      if (!this.eventHandlers.has(handler.eventType)) {
        this.eventHandlers.set(handler.eventType, []);
      }

      const handlers = this.eventHandlers.get(handler.eventType)!;
      handlers.push(handler);

      // Sort by priority (higher priority first)
      handlers.sort((a, b) => b.priority - a.priority);

      console.log(`✅ Event handler registered for ${handler.eventType}`);
    } catch (error) {
      console.error("❌ Failed to register event handler:", error);
      throw new Error(`Event handler registration failed: ${error.message}`);
    }
  }

  /**
   * Unregister an event handler
   */
  unregisterEventHandler(eventType: EventType, handlerFunction: Function): void {
    try {
      const handlers = this.eventHandlers.get(eventType);
      if (!handlers) return;

      const index = handlers.findIndex((h) => h.handler === handlerFunction);
      if (index !== -1) {
        handlers.splice(index, 1);
        console.log(`✅ Event handler unregistered for ${eventType}`);
      }
    } catch (error) {
      console.error("❌ Failed to unregister event handler:", error);
    }
  }

  /**
   * Add event filter
   */
  addEventFilter(filter: EventFilter): void {
    try {
      this.eventFilters.set(filter.id, filter);
      console.log(`✅ Event filter '${filter.name}' added`);
    } catch (error) {
      console.error("❌ Failed to add event filter:", error);
      throw new Error(`Event filter addition failed: ${error.message}`);
    }
  }

  /**
   * Remove event filter
   */
  removeEventFilter(filterId: string): void {
    try {
      this.eventFilters.delete(filterId);
      console.log(`✅ Event filter ${filterId} removed`);
    } catch (error) {
      console.error("❌ Failed to remove event filter:", error);
    }
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: EventType[];
    clinicId?: string;
  }): Promise<EventAnalytics> {
    try {
      console.log("Generating event analytics...");

      const period = {
        startDate: filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: filters?.endDate || new Date(),
      };

      // Build query
      let query = this.supabase
        .from("events")
        .select("*")
        .gte("timestamp", period.startDate.toISOString())
        .lte("timestamp", period.endDate.toISOString());

      if (filters?.eventTypes?.length) {
        query = query.in("type", filters.eventTypes);
      }

      if (filters?.clinicId) {
        query = query.eq("metadata->>clinicId", filters.clinicId);
      }

      const { data: events } = await query;

      if (!events) {
        throw new Error("Failed to fetch events for analytics");
      }

      // Calculate analytics
      const analytics: EventAnalytics = {
        period,
        totalEvents: events.length,
        eventsByType: this.calculateEventsByType(events),
        eventsByPriority: this.calculateEventsByPriority(events),
        eventsByStatus: this.calculateEventsByStatus(events),
        deliveryMetrics: await this.calculateDeliveryMetrics(events, period),
        webhookMetrics: await this.calculateWebhookMetrics(period),
        errorAnalysis: await this.calculateErrorAnalysis(events, period),
        performanceMetrics: await this.calculatePerformanceMetrics(period),
      };

      console.log("✅ Event analytics generated successfully");
      return analytics;
    } catch (error) {
      console.error("❌ Failed to generate event analytics:", error);
      throw new Error(`Event analytics generation failed: ${error.message}`);
    }
  }

  /**
   * Get events by criteria
   */
  async getEvents(criteria?: {
    eventTypes?: EventType[];
    startDate?: Date;
    endDate?: Date;
    clinicId?: string;
    limit?: number;
    offset?: number;
  }): Promise<BaseEvent[]> {
    try {
      let query = this.supabase.from("events").select("*").order("timestamp", { ascending: false });

      if (criteria?.eventTypes?.length) {
        query = query.in("type", criteria.eventTypes);
      }

      if (criteria?.startDate) {
        query = query.gte("timestamp", criteria.startDate.toISOString());
      }

      if (criteria?.endDate) {
        query = query.lte("timestamp", criteria.endDate.toISOString());
      }

      if (criteria?.clinicId) {
        query = query.eq("metadata->>clinicId", criteria.clinicId);
      }

      if (criteria?.limit) {
        query = query.limit(criteria.limit);
      }

      if (criteria?.offset) {
        query = query.range(criteria.offset, criteria.offset + (criteria.limit || 50) - 1);
      }

      const { data: events } = await query;

      return events?.map(this.convertDbRecordToEvent) || [];
    } catch (error) {
      console.error("❌ Failed to get events:", error);
      throw new Error(`Failed to get events: ${error.message}`);
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<BaseEvent | null> {
    try {
      const { data: event } = await this.supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      return event ? this.convertDbRecordToEvent(event) : null;
    } catch (error) {
      console.error("❌ Failed to get event by ID:", error);
      return null;
    }
  }

  /**
   * Delete old events based on retention policy
   */
  async cleanupOldEvents(): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);

      const { data, error } = await this.supabase
        .from("events")
        .delete()
        .lt("timestamp", cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      const deletedCount = Array.isArray(data) ? data.length : 0;
      console.log(`✅ Cleaned up ${deletedCount} old events`);

      return deletedCount;
    } catch (error) {
      console.error("❌ Failed to cleanup old events:", error);
      throw new Error(`Event cleanup failed: ${error.message}`);
    }
  }

  /**
   * Stop the event system
   */
  async stop(): Promise<void> {
    try {
      console.log("Stopping Event System...");

      // Stop queue processing
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
        this.processingInterval = undefined;
      }

      // Wait for current processing to complete
      while (this.isProcessing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Unsubscribe from real-time
      if (this.realtimeChannel) {
        await this.supabase.removeChannel(this.realtimeChannel);
      }

      console.log("✅ Event System stopped successfully");
    } catch (error) {
      console.error("❌ Failed to stop event system:", error);
    }
  }

  // Private Methods

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateEvent(event: BaseEvent): void {
    if (!event.type) {
      throw new Error("Event type is required");
    }

    if (!event.source) {
      throw new Error("Event source is required");
    }

    if (!event.metadata?.clinicId) {
      throw new Error("Clinic ID is required in event metadata");
    }
  }

  private async applyEventFilters(event: BaseEvent): Promise<BaseEvent | null> {
    try {
      for (const filter of this.eventFilters.values()) {
        if (!filter.isActive) continue;

        const matches = this.evaluateFilter(event, filter);
        if (!matches) {
          return null; // Event filtered out
        }
      }

      return event;
    } catch (error) {
      console.error("❌ Error applying event filters:", error);
      return event; // Return original event on filter error
    }
  }

  private evaluateFilter(event: BaseEvent, filter: EventFilter): boolean {
    try {
      const results = filter.conditions.map((condition) => {
        const fieldValue = this.getFieldValue(event, condition.field);
        return this.evaluateCondition(fieldValue, condition.operator, condition.value);
      });

      return filter.logic === "AND"
        ? results.every((result) => result)
        : results.some((result) => result);
    } catch (error) {
      console.error("❌ Error evaluating filter:", error);
      return true; // Allow event through on evaluation error
    }
  }

  private getFieldValue(event: BaseEvent, field: string): any {
    const parts = field.split(".");
    let value: any = event;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    return value;
  }

  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case "equals":
        return fieldValue === expectedValue;
      case "not_equals":
        return fieldValue !== expectedValue;
      case "contains":
        return String(fieldValue).includes(String(expectedValue));
      case "not_contains":
        return !String(fieldValue).includes(String(expectedValue));
      case "greater_than":
        return Number(fieldValue) > Number(expectedValue);
      case "less_than":
        return Number(fieldValue) < Number(expectedValue);
      case "in":
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      case "not_in":
        return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
      default:
        return true;
    }
  }

  private async persistEvent(event: BaseEvent): Promise<void> {
    try {
      const { error } = await this.supabase.from("events").insert({
        id: event.id,
        type: event.type,
        version: event.version,
        timestamp: event.timestamp.toISOString(),
        source: event.source,
        priority: event.priority,
        metadata: event.metadata,
        data: event.data,
        context: event.context,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("❌ Failed to persist event:", error);
      // Don't throw - event processing should continue even if persistence fails
    }
  }

  private async queueEvent(event: BaseEvent): Promise<void> {
    try {
      const queueItem: EventQueueItem = {
        id: `queue_${event.id}`,
        event,
        webhookIds: [], // Will be populated by webhook system
        priority: event.priority,
        scheduledAt: new Date(),
        attempts: 0,
        maxAttempts: 3,
        status: "queued",
      };

      this.eventQueue.push(queueItem);

      // Sort queue by priority and scheduled time
      this.eventQueue.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return a.scheduledAt.getTime() - b.scheduledAt.getTime();
      });

      // Trim queue if it exceeds max size
      if (this.eventQueue.length > this.config.queueConfig.maxSize) {
        this.eventQueue = this.eventQueue.slice(0, this.config.queueConfig.maxSize);
      }
    } catch (error) {
      console.error("❌ Failed to queue event:", error);
    }
  }

  private async executeImmediateHandlers(event: BaseEvent): Promise<void> {
    try {
      const handlers = this.eventHandlers.get(event.type) || [];
      const immediateHandlers = handlers.filter((h) => !h.async);

      for (const handler of immediateHandlers) {
        try {
          await handler.handler(event);
        } catch (error) {
          console.error(`❌ Immediate handler failed for ${event.type}:`, error);
        }
      }
    } catch (error) {
      console.error("❌ Failed to execute immediate handlers:", error);
    }
  }

  private async publishToRealtime(event: BaseEvent): Promise<void> {
    try {
      if (this.realtimeChannel) {
        await this.realtimeChannel.send({
          type: "broadcast",
          event: "event_published",
          payload: event,
        });
      }
    } catch (error) {
      console.error("❌ Failed to publish to realtime:", error);
    }
  }

  private async setupDatabase(): Promise<void> {
    // Database setup would be handled by migrations
    // This is a placeholder for any runtime setup needed
  }

  private async loadEventHandlers(): Promise<void> {
    // Load any persisted event handlers from database
    // This is a placeholder for future implementation
  }

  private async loadEventFilters(): Promise<void> {
    try {
      const { data: filters } = await this.supabase
        .from("event_filters")
        .select("*")
        .eq("is_active", true);

      if (filters) {
        filters.forEach((filter) => {
          this.eventFilters.set(filter.id, this.convertDbRecordToFilter(filter));
        });
      }
    } catch (error) {
      console.error("❌ Failed to load event filters:", error);
    }
  }

  private async setupRealtimeSubscriptions(): Promise<void> {
    try {
      this.realtimeChannel = this.supabase.channel("events");

      await this.realtimeChannel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Real-time event channel subscribed");
        }
      });
    } catch (error) {
      console.error("❌ Failed to setup realtime subscriptions:", error);
    }
  }

  private startQueueProcessing(): void {
    this.processingInterval = setInterval(
      () => this.processEventQueue(),
      this.config.queueConfig.processingInterval,
    );
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batchSize = Math.min(this.config.queueConfig.batchSize, this.eventQueue.length);

      const batch = this.eventQueue.splice(0, batchSize);

      await Promise.all(batch.map((item) => this.processQueueItem(item)));
    } catch (error) {
      console.error("❌ Error processing event queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processQueueItem(item: EventQueueItem): Promise<void> {
    try {
      item.status = "processing";
      item.processingStartedAt = new Date();

      // Execute async handlers
      const handlers = this.eventHandlers.get(item.event.type) || [];
      const asyncHandlers = handlers.filter((h) => h.async);

      await Promise.all(
        asyncHandlers.map(async (handler) => {
          try {
            await handler.handler(item.event);
          } catch (error) {
            console.error(`❌ Async handler failed for ${item.event.type}:`, error);
          }
        }),
      );

      item.status = "completed";
      item.completedAt = new Date();
    } catch (error) {
      console.error("❌ Failed to process queue item:", error);
      item.status = "failed";
      item.error = {
        message: error.message,
        details: error,
      };
    }
  }

  // Analytics calculation methods
  private calculateEventsByType(events: any[]): Record<EventType, number> {
    const result = {} as Record<EventType, number>;

    events.forEach((event) => {
      result[event.type as EventType] = (result[event.type as EventType] || 0) + 1;
    });

    return result;
  }

  private calculateEventsByPriority(events: any[]): Record<EventPriority, number> {
    const result = {} as Record<EventPriority, number>;

    events.forEach((event) => {
      result[event.priority as EventPriority] = (result[event.priority as EventPriority] || 0) + 1;
    });

    return result;
  }

  private calculateEventsByStatus(_events: any[]): Record<string, number> {
    // This would be calculated from event delivery records
    return {
      delivered: 0,
      failed: 0,
      pending: 0,
    };
  }

  private async calculateDeliveryMetrics(
    _events: any[],
    _period: { startDate: Date; endDate: Date },
  ): Promise<any> {
    // This would calculate delivery metrics from webhook delivery records
    return {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      averageDeliveryTime: 0,
      deliverySuccessRate: 0,
    };
  }

  private async calculateWebhookMetrics(_period: { startDate: Date; endDate: Date }): Promise<any> {
    // This would calculate webhook performance metrics
    return {
      totalWebhooks: 0,
      activeWebhooks: 0,
      averageResponseTime: 0,
      topPerformingWebhooks: [],
      failingWebhooks: [],
    };
  }

  private async calculateErrorAnalysis(
    _events: any[],
    _period: { startDate: Date; endDate: Date },
  ): Promise<any> {
    // This would analyze errors from delivery records
    return {
      totalErrors: 0,
      errorsByType: {},
      commonErrors: [],
    };
  }

  private async calculatePerformanceMetrics(_period: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    // This would calculate system performance metrics
    return {
      averageProcessingTime: 0,
      queueDepth: this.eventQueue.length,
      throughputPerSecond: 0,
      peakLoad: {
        timestamp: new Date(),
        eventsPerSecond: 0,
      },
    };
  }

  private convertDbRecordToEvent(record: any): BaseEvent {
    return {
      id: record.id,
      type: record.type,
      version: record.version,
      timestamp: new Date(record.timestamp),
      source: record.source,
      priority: record.priority,
      metadata: record.metadata,
      data: record.data,
      context: record.context,
    };
  }

  private convertDbRecordToFilter(record: any): EventFilter {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      conditions: record.conditions,
      logic: record.logic,
      isActive: record.is_active,
    };
  }
}

export default EventSystem;
