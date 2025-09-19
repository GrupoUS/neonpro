/**
 * Enhanced Real-time Manager with Advanced Resilience Features
 * 
 * Extends the base realtime manager with:
 * - Intelligent cache invalidation strategies
 * - Fallback polling mechanisms
 * - Connection resilience for poor network conditions
 * - WebSocket health checks
 * - Real-time error recovery
 * - Performance metrics collection
 * - Healthcare-specific optimizations
 */

import {
  createClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient
} from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';
import { HealthcareResilienceService } from '../resilience';

// ============================================================================
// Enhanced Types
// ============================================================================

export interface EnhancedRealtimeOptions<T = any> {
  // Base options
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { old: T }) => void;
  queryKeys?: string[][];
  optimisticUpdates?: boolean;
  rateLimitMs?: number;

  // Enhanced options
  fallbackPollingEnabled?: boolean;
  fallbackPollingIntervalMs?: number;
  cacheInvalidationStrategy?: 'aggressive' | 'conservative' | 'smart';
  healthCheckEnabled?: boolean;
  latencyMonitoringEnabled?: boolean;
  retryOnFailure?: boolean;
  maxRetryAttempts?: number;

  // Healthcare-specific
  isEmergencyData?: boolean;
  dataClassification?: 'sensitive' | 'normal' | 'public';
  requiresImmediateSync?: boolean;
}

export interface RealtimeMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  averageLatency: number;
  connectionDrops: number;
  retryAttempts: number;
  fallbackPollingEvents: number;
  cacheInvalidations: number;
  lastHealthCheck: Date;
  isHealthy: boolean;
}

export interface ConnectionHealth {
  isConnected: boolean;
  latency: number;
  lastPing: Date;
  consecutiveFailures: number;
  retryBackoffMs: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

// ============================================================================
// Cache Invalidation Strategies
// ============================================================================

export class CacheInvalidationStrategy {
  constructor(
    private queryClient: QueryClient,
    private strategy: 'aggressive' | 'conservative' | 'smart' = 'smart'
  ) {}

  async invalidateForEvent(
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    tableName: string,
    payload: any,
    queryKeys: string[][]
  ): Promise<void> {
    switch (this.strategy) {
      case 'aggressive':
        await this.aggressiveInvalidation(tableName, queryKeys);
        break;
      case 'conservative':
        await this.conservativeInvalidation(eventType, tableName, payload, queryKeys);
        break;
      case 'smart':
        await this.smartInvalidation(eventType, tableName, payload, queryKeys);
        break;
    }
  }

  private async aggressiveInvalidation(tableName: string, queryKeys: string[][]): Promise<void> {
    // Invalidate all related queries aggressively
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: [tableName] }),
      ...queryKeys.map(queryKey => this.queryClient.invalidateQueries({ queryKey }))
    ]);

    // Also invalidate related queries (e.g., patient data changes affect appointments)
    const relatedTables = this.getRelatedTables(tableName);
    for (const relatedTable of relatedTables) {
      await this.queryClient.invalidateQueries({ queryKey: [relatedTable] });
    }
  }

  private async conservativeInvalidation(
    eventType: string,
    tableName: string,
    payload: any,
    queryKeys: string[][]
  ): Promise<void> {
    // Only invalidate specific affected queries
    if (eventType === 'UPDATE' && payload.id) {
      // Only invalidate the specific record and list views
      await Promise.all([
        this.queryClient.invalidateQueries({ queryKey: [tableName, payload.id] }),
        this.queryClient.invalidateQueries({ queryKey: [tableName] })
      ]);
    } else {
      // For INSERT/DELETE, invalidate list queries only
      await this.queryClient.invalidateQueries({ queryKey: [tableName] });
    }

    // Only invalidate explicitly provided query keys
    for (const queryKey of queryKeys) {
      await this.queryClient.invalidateQueries({ queryKey });
    }
  }

  private async smartInvalidation(
    eventType: string,
    tableName: string,
    payload: any,
    queryKeys: string[][]
  ): Promise<void> {
    // Use heuristics to determine optimal invalidation strategy
    const shouldAggressivelyInvalidate = this.shouldAggressivelyInvalidate(tableName, payload);

    if (shouldAggressivelyInvalidate) {
      await this.aggressiveInvalidation(tableName, queryKeys);
    } else {
      await this.conservativeInvalidation(eventType, tableName, payload, queryKeys);
    }
  }

  private getRelatedTables(tableName: string): string[] {
    // Define relationships between tables for smart invalidation
    const relationships: Record<string, string[]> = {
      'patients': ['appointments', 'patient_documents', 'medical_records'],
      'appointments': ['patients', 'professionals', 'services'],
      'professionals': ['appointments', 'schedules'],
      'services': ['appointments', 'pricing_rules']
    };

    return relationships[tableName] || [];
  }

  private shouldAggressivelyInvalidate(_tableName: string, payload: any): boolean {
    // Heuristics for when to use aggressive invalidation
    const criticalFields = ['status', 'priority', 'emergency', 'cancelled'];
    
    return criticalFields.some(field => 
      payload[field] !== undefined && 
      (payload[field] === 'emergency' || payload[field] === 'high_priority')
    );
  }
}

// ============================================================================
// Enhanced Real-time Manager
// ============================================================================

export class EnhancedRealtimeManager {
  private channels = new Map<string, RealtimeChannel>();
  private queryClient: QueryClient;
  private supabase: SupabaseClient;
  private resilienceService: HealthcareResilienceService;
  private rateLimitMap = new Map<string, number>();
  private fallbackIntervals = new Map<string, NodeJS.Timeout>();
  private healthCheckInterval?: NodeJS.Timeout;
  
  // Metrics and monitoring
  private metrics: RealtimeMetrics = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    averageLatency: 0,
    connectionDrops: 0,
    retryAttempts: 0,
    fallbackPollingEvents: 0,
    cacheInvalidations: 0,
    lastHealthCheck: new Date(),
    isHealthy: true
  };

  private connectionHealth: ConnectionHealth = {
    isConnected: false,
    latency: 0,
    lastPing: new Date(),
    consecutiveFailures: 0,
    retryBackoffMs: 1000,
    quality: 'disconnected'
  };

  private cacheInvalidationStrategy: CacheInvalidationStrategy;

  constructor(
    queryClient: QueryClient,
    resilienceService?: HealthcareResilienceService
  ) {
    this.queryClient = queryClient;
    this.cacheInvalidationStrategy = new CacheInvalidationStrategy(queryClient);
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      },
    );

    // Use provided resilience service or create default
    this.resilienceService = resilienceService || new HealthcareResilienceService(
      require('../resilience').DEFAULT_HEALTHCARE_RESILIENCE_SERVICE_CONFIG
    );

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Enhanced subscription with resilience features
   */
  subscribeToTable<T extends { id: string } = { id: string }>(
    tableName: string,
    filter?: string,
    options: EnhancedRealtimeOptions<T> = {}
  ): RealtimeChannel {
    const channelName = `${tableName}-${filter || 'all'}`;

    // Return existing channel if already subscribed
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    // Create enhanced channel with fallback polling
    const channel = this.createEnhancedChannel(tableName, filter, options);
    
    // Setup fallback polling if enabled
    if (options.fallbackPollingEnabled) {
      this.setupFallbackPolling(tableName, filter, options);
    }

    this.channels.set(channelName, channel);
    return channel;
  }

  private createEnhancedChannel<T extends { id: string }>(
    tableName: string,
    filter: string | undefined,
    options: EnhancedRealtimeOptions<T>
  ): RealtimeChannel {
    const channelName = `${tableName}-${filter || 'all'}`;

    return this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
          await this.handleEnhancedRealtimeEvent(payload, tableName, options);
        },
      )
      .subscribe(async (status) => {
        await this.handleSubscriptionStatus(status, channelName, tableName, filter, options);
      });
  }

  private async handleEnhancedRealtimeEvent<T extends { id: string }>(
    payload: RealtimePostgresChangesPayload<Record<string, any>>,
    tableName: string,
    options: EnhancedRealtimeOptions<T>
  ): Promise<void> {
    const startTime = Date.now();
    this.metrics.totalEvents++;

    try {
      // Apply rate limiting
      if (this.shouldRateLimit(`${tableName}-realtime`, options.rateLimitMs || 100)) {
        return;
      }

      // Handle the event
      await this.processRealtimeEvent(payload, tableName, options);

      // Update metrics
      this.metrics.successfulEvents++;
      const latency = Date.now() - startTime;
      this.updateAverageLatency(latency);

    } catch (error) {
      this.metrics.failedEvents++;
      console.error('Error handling enhanced realtime event:', error);
      
      // Attempt recovery for emergency data
      if (options.isEmergencyData) {
        await this.attemptEmergencyRecovery(tableName, options);
      }
    }
  }

  private async processRealtimeEvent<T extends { id: string }>(
    payload: RealtimePostgresChangesPayload<Record<string, any>>,
    tableName: string,
    options: EnhancedRealtimeOptions<T>
  ): Promise<void> {
    // Execute event handlers
    switch (payload.eventType) {
      case 'INSERT':
        await options.onInsert?.(payload.new as T);
        if (options.optimisticUpdates !== false) {
          await this.optimisticInsert(tableName, payload.new as T);
        }
        break;
      case 'UPDATE':
        await options.onUpdate?.(payload.new as T);
        if (options.optimisticUpdates !== false) {
          await this.optimisticUpdate(tableName, payload.new as T);
        }
        break;
      case 'DELETE':
        await options.onDelete?.({ old: payload.old as T });
        if (options.optimisticUpdates !== false) {
          await this.optimisticDelete(tableName, payload.old as T);
        }
        break;
    }

    // Smart cache invalidation
    if (options.queryKeys) {
      await this.cacheInvalidationStrategy.invalidateForEvent(
        payload.eventType,
        tableName,
        payload.new || payload.old,
        options.queryKeys
      );
      this.metrics.cacheInvalidations++;
    }

    // For emergency data, trigger immediate sync
    if (options.requiresImmediateSync) {
      await this.triggerImmediateSync(tableName, options.queryKeys);
    }
  }

  private async handleSubscriptionStatus<T extends { id: string }>(
    status: string,
    channelName: string,
    tableName: string,
    filter: string | undefined,
    options: EnhancedRealtimeOptions<T>
  ): Promise<void> {
    console.log(`Enhanced realtime subscription ${channelName} status:`, status);

    switch (status) {
      case 'SUBSCRIBED':
        this.connectionHealth.isConnected = true;
        this.connectionHealth.consecutiveFailures = 0;
        this.connectionHealth.quality = 'excellent';
        
        // Clear fallback polling when real-time connection is restored
        this.clearFallbackPolling(channelName);
        
        console.log(`✅ Successfully subscribed to enhanced ${tableName} changes`);
        break;

      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
        this.connectionHealth.isConnected = false;
        this.connectionHealth.consecutiveFailures++;
        this.metrics.connectionDrops++;
        
        console.error(`❌ Enhanced realtime error for ${tableName}:`, status);
        
        // Enable fallback polling if configured
        if (options.fallbackPollingEnabled) {
          this.ensureFallbackPolling(tableName, filter, options);
        }
        
        // Retry with exponential backoff
        if (options.retryOnFailure !== false) {
          await this.retryEnhancedSubscription(tableName, filter, options);
        }
        break;

      case 'CLOSED':
        this.connectionHealth.isConnected = false;
        this.connectionHealth.quality = 'disconnected';
        console.log(`📴 Enhanced realtime connection closed for ${tableName}`);
        break;
    }
  }

  private setupFallbackPolling<T extends { id: string }>(
    tableName: string,
    filter: string | undefined,
    options: EnhancedRealtimeOptions<T>
  ): void {
    const channelName = `${tableName}-${filter || 'all'}-fallback`;
    
    if (this.fallbackIntervals.has(channelName)) {
      return; // Already polling
    }

    const intervalMs = options.fallbackPollingIntervalMs || 5000;
    
    const interval = setInterval(async () => {
      try {
        await this.performFallbackPolling(tableName, filter, options);
        this.metrics.fallbackPollingEvents++;
      } catch (error) {
        console.error('Fallback polling error:', error);
      }
    }, intervalMs);

    this.fallbackIntervals.set(channelName, interval);
    console.log(`🔄 Started fallback polling for ${tableName} (${intervalMs}ms)`);
  }

  private async performFallbackPolling<T extends { id: string }>(
    tableName: string,
    filter: string | undefined,
    options: EnhancedRealtimeOptions<T>
  ): Promise<void> {
    // Simulate fetching latest data and triggering updates
    // In a real implementation, this would make API calls to check for changes
    
    const mockData = await this.fetchLatestData(tableName, filter);
    
    // Trigger update handlers with polled data
    if (options.onUpdate && mockData.length > 0) {
      for (const record of mockData) {
        await options.onUpdate(record as T);
      }
    }

    // Invalidate cache to ensure fresh data
    if (options.queryKeys) {
      for (const queryKey of options.queryKeys) {
        await this.queryClient.invalidateQueries({ queryKey });
      }
    }
  }

  private async fetchLatestData(_tableName: string, _filter?: string): Promise<any[]> {
    // Mock implementation - in real app, this would call the API
    // This is a placeholder for the actual polling logic
    return [];
  }

  private clearFallbackPolling(channelName: string): void {
    const interval = this.fallbackIntervals.get(channelName);
    if (interval) {
      clearInterval(interval);
      this.fallbackIntervals.delete(channelName);
      console.log(`⏹️ Stopped fallback polling for ${channelName.replace('-fallback', '')}`);
    }
  }

  private ensureFallbackPolling<T extends { id: string }>(
    tableName: string,
    filter: string | undefined,
    options: EnhancedRealtimeOptions<T>
  ): void {
    const channelName = `${tableName}-${filter || 'all'}-fallback`;
    
    if (!this.fallbackIntervals.has(channelName) && options.fallbackPollingEnabled) {
      this.setupFallbackPolling(tableName, filter, options);
    }
  }

  private async retryEnhancedSubscription<T extends { id: string }>(
    tableName: string,
    filter: string | undefined,
    options: EnhancedRealtimeOptions<T>,
    retryCount = 0
  ): Promise<void> {
    const maxRetries = options.maxRetryAttempts || 5;

    if (retryCount >= maxRetries) {
      console.error(`Max retries reached for enhanced ${tableName} subscription`);
      return;
    }

    this.metrics.retryAttempts++;
    
    // Calculate backoff with jitter
    const backoffMs = Math.min(
      this.connectionHealth.retryBackoffMs * Math.pow(2, retryCount),
      30000 // Max 30 seconds
    ) * (0.5 + Math.random() * 0.5); // Add jitter

    console.log(`🔄 Retrying enhanced subscription to ${tableName} (attempt ${retryCount + 1}) in ${backoffMs}ms`);

    // Remove failed channel
    const channelName = `${tableName}-${filter || 'all'}`;
    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      this.supabase.removeChannel(existingChannel);
      this.channels.delete(channelName);
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, backoffMs));

    // Retry subscription
    this.subscribeToTable(tableName, filter, options);
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Test connection with a simple health check
      const healthCheck = await this.resilienceService.executeHealthcareOperation(
        'supabase-realtime',
        async () => {
          // Test the Supabase connection
          const { data, error } = await this.supabase
            .from('health_checks')
            .select('count')
            .single();
          
          return !error && data !== null;
        },
        {
          operation: 'realtime_health_check',
          serviceName: 'supabase-realtime',
          isEmergency: false,
          requiresAudit: false,
          dataClassification: 'normal' as any,
          lgpdCategories: [],
          healthcareUseCase: 'system_health' as any,
          requiresPIIProtection: false,
          isLifeCritical: false,
          requiresConsent: false
        }
      );

      const latency = Date.now() - startTime;
      
      // Update connection health
      this.connectionHealth.isConnected = healthCheck;
      this.connectionHealth.latency = latency;
      this.connectionHealth.lastPing = new Date();

      // Determine connection quality
      if (latency < 100) {
        this.connectionHealth.quality = 'excellent';
      } else if (latency < 500) {
        this.connectionHealth.quality = 'good';
      } else if (latency < 1000) {
        this.connectionHealth.quality = 'fair';
      } else if (latency < 3000) {
        this.connectionHealth.quality = 'poor';
      } else {
        this.connectionHealth.quality = 'disconnected';
      }

      // Update metrics
      this.metrics.isHealthy = healthCheck;
      this.metrics.lastHealthCheck = new Date();

      if (healthCheck) {
        this.connectionHealth.consecutiveFailures = 0;
        this.connectionHealth.retryBackoffMs = Math.max(1000, this.connectionHealth.retryBackoffMs * 0.8);
      } else {
        this.connectionHealth.consecutiveFailures++;
        this.connectionHealth.retryBackoffMs = Math.min(30000, this.connectionHealth.retryBackoffMs * 1.5);
      }

    } catch (error) {
      console.error('Realtime health check failed:', error);
      this.connectionHealth.isConnected = false;
      this.connectionHealth.quality = 'disconnected';
      this.connectionHealth.consecutiveFailures++;
      this.metrics.isHealthy = false;
    }
  }

  private updateAverageLatency(newLatency: number): void {
    if (this.metrics.averageLatency === 0) {
      this.metrics.averageLatency = newLatency;
    } else {
      this.metrics.averageLatency = 
        (this.metrics.averageLatency * 0.9) + (newLatency * 0.1);
    }
  }

  private shouldRateLimit(channelName: string, rateLimitMs: number): boolean {
    const now = Date.now();
    const lastUpdate = this.rateLimitMap.get(channelName) || 0;

    if (now - lastUpdate < rateLimitMs) {
      return true;
    }

    this.rateLimitMap.set(channelName, now);
    return false;
  }

  // Optimistic update methods (from original manager)
  private async optimisticInsert<T extends { id: string }>(tableName: string, newRecord: T): Promise<void> {
    await this.queryClient.cancelQueries({ queryKey: [tableName] });
    this.queryClient.setQueryData([tableName], (old: T[] | undefined) => {
      return old ? [...old, newRecord] : [newRecord];
    });
    this.queryClient.setQueryData([tableName, newRecord.id], newRecord);
  }

  private async optimisticUpdate<T extends { id: string }>(tableName: string, updatedRecord: T): Promise<void> {
    await this.queryClient.cancelQueries({ queryKey: [tableName] });
    this.queryClient.setQueryData([tableName], (old: T[] | undefined) => {
      return old?.map(item => item.id === updatedRecord.id ? updatedRecord : item) || [];
    });
    this.queryClient.setQueryData([tableName, updatedRecord.id], updatedRecord);
  }

  private async optimisticDelete<T extends { id: string }>(tableName: string, deletedRecord: T): Promise<void> {
    await this.queryClient.cancelQueries({ queryKey: [tableName] });
    this.queryClient.setQueryData([tableName], (old: T[] | undefined) => {
      return old?.filter(item => item.id !== deletedRecord.id) || [];
    });
    this.queryClient.removeQueries({ queryKey: [tableName, deletedRecord.id] });
  }

  private async triggerImmediateSync(tableName: string, queryKeys?: string[][]): Promise<void> {
    // Force immediate refetch for critical data
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: [tableName] }),
      ...(queryKeys || []).map(queryKey => 
        this.queryClient.invalidateQueries({ queryKey })
      )
    ]);
  }

  private async attemptEmergencyRecovery<T extends { id: string }>(
    tableName: string,
    options: EnhancedRealtimeOptions<T>
  ): Promise<void> {
    console.warn(`🚨 Attempting emergency recovery for ${tableName}`);
    
    // Force immediate cache invalidation
    await this.triggerImmediateSync(tableName, options.queryKeys);
    
    // Ensure fallback polling is active
    this.ensureFallbackPolling(tableName, undefined, {
      ...options,
      fallbackPollingEnabled: true,
      fallbackPollingIntervalMs: 2000 // More frequent for emergencies
    });
  }

  // Public methods for monitoring and management
  getMetrics(): RealtimeMetrics {
    return { ...this.metrics };
  }

  getConnectionHealth(): ConnectionHealth {
    return { ...this.connectionHealth };
  }

  resetMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      averageLatency: 0,
      connectionDrops: 0,
      retryAttempts: 0,
      fallbackPollingEvents: 0,
      cacheInvalidations: 0,
      lastHealthCheck: new Date(),
      isHealthy: true
    };
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.rateLimitMap.delete(channelName);
      this.clearFallbackPolling(channelName);
      console.log(`Unsubscribed from enhanced ${channelName}`);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      this.supabase.removeChannel(channel);
      this.clearFallbackPolling(name);
      console.log(`Unsubscribed from enhanced ${name}`);
    });
    this.channels.clear();
    this.rateLimitMap.clear();
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  getConnectionStatus(): string {
    return this.connectionHealth.quality;
  }

  getActiveChannelsCount(): number {
    return this.channels.size;
  }
}