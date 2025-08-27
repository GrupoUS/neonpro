/**
 * Supabase Real-time Metrics Streamer for NeonPro Healthcare
 * ==========================================================
 * 
 * Streams performance metrics to Supabase in real-time for:
 * - Live dashboard updates
 * - Healthcare compliance audit trails
 * - Multi-clinic metric aggregation
 * - Alert and threshold monitoring
 */

import { createClient } from '@neonpro/database';
import type { 
  PerformanceMetric, 
  HealthcareContext, 
  RealtimeMetricEvent,
  SupabaseStreamingConfig,
  PerformanceAlert 
} from '../types';

export class SupabaseMetricsStreamer {
  private readonly supabase: any;
  private readonly config: SupabaseStreamingConfig;
  private healthcareContext: HealthcareContext = {};
  private metricBuffer: PerformanceMetric[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(config: SupabaseStreamingConfig) {
    this.config = {
      tableName: 'performance_metrics',
      enableCompression: true,
      batchSize: 50,
      flushInterval: 5000, // 5 seconds
      ...config
    };

    this.supabase = createClient();
  }

  /**
   * Connect to Supabase and setup real-time subscriptions
   */
  async connect(): Promise<void> {
    try {
      // Test connection
      const { data, error } = await this.supabase
        .from('performance_metrics')
        .select('count(*)')
        .limit(1);

      if (error && !error.message?.includes('relation "performance_metrics" does not exist')) {
        throw error;
      }

      // Setup metric buffer flushing
      this.setupPeriodicFlush();
      
      // Subscribe to real-time updates for alerts
      this.setupRealtimeSubscriptions();

      this.isConnected = true;
      console.log('✅ Supabase metrics streamer connected');

    } catch (error) {
      console.error('❌ Failed to connect Supabase metrics streamer:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Supabase and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush any remaining metrics
    if (this.metricBuffer.length > 0) {
      await this.flushMetrics();
    }

    this.isConnected = false;
    console.log('🛑 Supabase metrics streamer disconnected');
  }

  /**
   * Stream a single performance metric
   */
  async streamMetric(metric: PerformanceMetric): Promise<void> {
    if (!this.isConnected) {
      console.warn('⚠️ Metrics streamer not connected, buffering metric');
    }

    // Enrich metric with healthcare context
    const enrichedMetric = {
      ...metric,
      ...this.healthcareContext,
      streamed_at: new Date().toISOString(),
      clinic_id: this.config.clinicId || this.healthcareContext.clinicId,
      user_id: this.healthcareContext.userId
    };

    // Add to buffer
    this.metricBuffer.push(enrichedMetric);

    // Immediate flush for critical metrics
    if (this.isCriticalMetric(metric)) {
      await this.flushMetrics();
    }

    // Flush if buffer is full
    if (this.metricBuffer.length >= (this.config.batchSize || 50)) {
      await this.flushMetrics();
    }
  }

  /**
   * Stream multiple metrics in batch
   */
  async streamMetrics(metrics: PerformanceMetric[]): Promise<void> {
    for (const metric of metrics) {
      await this.streamMetric(metric);
    }
  }

  /**
   * Set healthcare context for metric enrichment
   */
  setHealthcareContext(context: HealthcareContext): void {
    this.healthcareContext = { ...this.healthcareContext, ...context };
  }

  /**
   * Send real-time alert/event
   */
  async sendRealtimeEvent(event: RealtimeMetricEvent): Promise<void> {
    if (!this.isConnected) return;

    try {
      // Insert event into alerts table for real-time dashboard updates
      const { error } = await this.supabase
        .from('performance_alerts')
        .insert({
          type: event.type,
          severity: event.severity,
          metric_name: event.metric.name,
          metric_value: event.metric.value,
          metric_category: event.metric.category,
          message: `${event.metric.name} ${event.severity}: ${event.metric.value}${event.metric.unit || ''}`,
          metadata: {
            metric: event.metric,
            healthcare_context: this.healthcareContext,
            event_data: event
          },
          clinic_id: this.config.clinicId || this.healthcareContext.clinicId,
          user_id: this.healthcareContext.userId,
          timestamp: event.timestamp,
          acknowledged: false
        });

      if (error) {
        console.error('❌ Failed to send real-time event:', error);
      } else {
        console.log(`📡 Real-time event sent: ${event.type} - ${event.severity}`);
      }

    } catch (error) {
      console.error('❌ Error sending real-time event:', error);
    }
  }

  /**
   * Get recent metrics for dashboard
   */
  async getRecentMetrics(
    category?: PerformanceMetric['category'], 
    limit = 100,
    timeframe = '1 hour'
  ): Promise<PerformanceMetric[]> {
    try {
      let query = this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - this.parseTimeframe(timeframe)).toISOString())
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      if (this.config.clinicId || this.healthcareContext.clinicId) {
        query = query.eq('clinic_id', this.config.clinicId || this.healthcareContext.clinicId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('❌ Failed to get recent metrics:', error);
      return [];
    }
  }

  /**
   * Setup periodic metric buffer flushing
   */
  private setupPeriodicFlush(): void {
    this.flushTimer = setInterval(async () => {
      if (this.metricBuffer.length > 0) {
        await this.flushMetrics();
      }
    }, this.config.flushInterval);
  }

  /**
   * Flush buffered metrics to Supabase
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricBuffer.length === 0) return;

    const metricsToFlush = [...this.metricBuffer];
    this.metricBuffer = [];

    try {
      // Prepare metrics for insertion
      const formattedMetrics = metricsToFlush.map(metric => ({
        name: metric.name,
        value: metric.value,
        unit: metric.unit || null,
        category: metric.category,
        timestamp: metric.timestamp,
        metadata: metric.metadata || {},
        clinic_id: this.config.clinicId || this.healthcareContext.clinicId || null,
        user_id: this.healthcareContext.userId || null,
        workflow_type: this.healthcareContext.workflowType || null,
        device_type: this.healthcareContext.deviceType || null,
        network_connection: this.healthcareContext.networkConnection || null,
        created_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('performance_metrics')
        .insert(formattedMetrics);

      if (error) {
        console.error('❌ Failed to flush metrics to Supabase:', error);
        // Re-add metrics to buffer for retry
        this.metricBuffer.unshift(...metricsToFlush);
      } else {
        console.log(`📊 Flushed ${formattedMetrics.length} metrics to Supabase`);
      }

    } catch (error) {
      console.error('❌ Error flushing metrics:', error);
      // Re-add metrics to buffer for retry
      this.metricBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Setup real-time subscriptions for dashboard updates
   */
  private setupRealtimeSubscriptions(): void {
    // Subscribe to performance alerts for real-time dashboard updates
    this.supabase
      .channel('performance_monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'performance_alerts'
        },
        (payload: any) => {
          console.log('📡 Real-time alert received:', payload.new);
          // Could emit to dashboard or notification system
        }
      )
      .subscribe();
  }

  /**
   * Check if metric requires immediate streaming
   */
  private isCriticalMetric(metric: PerformanceMetric): boolean {
    const criticalMetrics = [
      'system-down',
      'error-rate',
      'database-connection-failure',
      'memory-exhaustion',
      'security-violation'
    ];

    return criticalMetrics.includes(metric.name) || 
           (metric.metadata?.severity === 'critical');
  }

  /**
   * Parse timeframe string to milliseconds
   */
  private parseTimeframe(timeframe: string): number {
    const units = {
      'minute': 60 * 1000,
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000
    };

    const match = timeframe.match(/(\d+)\s*(minute|hour|day|week)s?/);
    if (!match) return units.hour; // default 1 hour

    const [, num, unit] = match;
    return parseInt(num) * (units[unit as keyof typeof units] || units.hour);
  }
}