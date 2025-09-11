/**
 * NeonPro Audit System - Health Monitor
 *
 * Constitutional-grade health monitoring and alerting system.
 * Monitors system vitals and enforces constitutional compliance.
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import { performance } from 'perf_hooks';

export interface HealthMetrics {
  timestamp: number;
  uptime: number;
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number[];
    load: number[];
  };
  process: {
    pid: number;
    memory: NodeJS.MemoryUsage;
    uptime: number;
  };
  constitutional: {
    compliance: boolean;
    fileCount: number;
    memoryCompliance: boolean;
    timeCompliance: boolean;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  metrics: HealthMetrics;
  alerts: HealthAlert[];
}

export interface HealthAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  component: string;
  metric: string;
  value: number;
  threshold: number;
}

export class HealthMonitor extends EventEmitter {
  private startTime: number = Date.now();
  private alerts: HealthAlert[] = [];
  private metrics: HealthMetrics[] = [];
  private intervalId?: NodeJS.Timeout;

  // Constitutional limits
  private readonly CONSTITUTIONAL_MEMORY_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB
  private readonly CONSTITUTIONAL_TIME_LIMIT = 4 * 60 * 60 * 1000; // 4 hours
  private readonly MIN_FILE_COUNT = 10000;

  constructor(
    private config: {
      interval?: number;
      retentionCount?: number;
      memoryThreshold?: number;
      cpuThreshold?: number;
    } = {},
  ) {
    super();

    this.config = {
      interval: 30000, // 30 seconds
      retentionCount: 100,
      memoryThreshold: 0.8,
      cpuThreshold: 0.9,
      ...config,
    };
  }

  /**
   * Start health monitoring
   */
  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);

    this.emit('monitor:started');
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.emit('monitor:stopped');
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    const currentMetrics = this.getCurrentMetrics();
    const status = this.determineHealthStatus(currentMetrics);

    return {
      status,
      metrics: currentMetrics,
      alerts: this.getActiveAlerts(),
    };
  }

  private getCurrentMetrics(): HealthMetrics {
    const memoryUsage = process.memoryUsage();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    };

    const currentTime = Date.now();
    const processUptime = process.uptime() * 1000;

    return {
      timestamp: currentTime,
      uptime: currentTime - this.startTime,
      memory: {
        ...systemMemory,
        percentage: (systemMemory.used / systemMemory.total) * 100,
      },
      cpu: {
        usage: os.cpus().map(cpu => {
          const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
          const idle = cpu.times.idle;
          return ((total - idle) / total) * 100;
        }),
        load: os.loadavg(),
      },
      process: {
        pid: process.pid,
        memory: memoryUsage,
        uptime: processUptime,
      },
      constitutional: {
        compliance: this.checkConstitutionalCompliance(memoryUsage, processUptime),
        fileCount: 0, // Will be updated by external systems
        memoryCompliance: memoryUsage.heapUsed < this.CONSTITUTIONAL_MEMORY_LIMIT,
        timeCompliance: processUptime < this.CONSTITUTIONAL_TIME_LIMIT,
      },
    };
  }

  private checkConstitutionalCompliance(memoryUsage: NodeJS.MemoryUsage, uptime: number): boolean {
    return memoryUsage.heapUsed < this.CONSTITUTIONAL_MEMORY_LIMIT
      && uptime < this.CONSTITUTIONAL_TIME_LIMIT;
  }

  private collectMetrics(): void {
    const metrics = this.getCurrentMetrics();

    this.metrics.push(metrics);
    if (this.metrics.length > (this.config.retentionCount || 100)) {
      this.metrics.shift();
    }

    this.checkAlerts(metrics);
    this.emit('metrics:collected', metrics);
  }

  private determineHealthStatus(metrics: HealthMetrics): 'healthy' | 'warning' | 'critical' {
    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical');
    const warningAlerts = this.alerts.filter(a => a.severity === 'warning');

    if (criticalAlerts.length > 0 || !metrics.constitutional.compliance) {
      return 'critical';
    }

    if (warningAlerts.length > 0 || metrics.memory.percentage > 80) {
      return 'warning';
    }

    return 'healthy';
  }

  private checkAlerts(metrics: HealthMetrics): void {
    // Memory alerts
    if (metrics.memory.percentage > (this.config.memoryThreshold || 0.8) * 100) {
      this.createAlert({
        severity: metrics.memory.percentage > 95 ? 'critical' : 'warning',
        message: `High memory usage: ${metrics.memory.percentage.toFixed(1)}%`,
        component: 'memory',
        metric: 'memory.percentage',
        value: metrics.memory.percentage,
        threshold: (this.config.memoryThreshold || 0.8) * 100,
      });
    }

    // Constitutional compliance alerts
    if (!metrics.constitutional.memoryCompliance) {
      this.createAlert({
        severity: 'critical',
        message: `Constitutional memory limit exceeded: ${
          (metrics.process.memory.heapUsed / 1024 / 1024 / 1024).toFixed(2)
        }GB`,
        component: 'constitutional',
        metric: 'memory',
        value: metrics.process.memory.heapUsed,
        threshold: this.CONSTITUTIONAL_MEMORY_LIMIT,
      });
    }
  }

  private createAlert(alert: Omit<HealthAlert, 'id' | 'timestamp'>): void {
    const fullAlert: HealthAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...alert,
    };

    const existingAlert = this.alerts.find(a =>
      a.component === fullAlert.component
      && a.metric === fullAlert.metric
      && a.severity === fullAlert.severity
      && Date.now() - a.timestamp < 60000
    );

    if (!existingAlert) {
      this.alerts.push(fullAlert);
      this.emit('alert:created', fullAlert);
    }

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > oneHourAgo);
  }

  private getActiveAlerts(): HealthAlert[] {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return this.alerts.filter(a => a.timestamp > oneHourAgo);
  }

  getMetricsHistory(): HealthMetrics[] {
    return [...this.metrics];
  }

  clearAlerts(): void {
    this.alerts = [];
    this.emit('alerts:cleared');
  }

  updateFileCount(count: number): void {
    if (this.metrics.length > 0) {
      const lastMetrics = this.metrics[this.metrics.length - 1];
      lastMetrics.constitutional.fileCount = count;

      if (count < this.MIN_FILE_COUNT) {
        this.createAlert({
          severity: 'warning',
          message: `File count below constitutional minimum: ${count}`,
          component: 'constitutional',
          metric: 'fileCount',
          value: count,
          threshold: this.MIN_FILE_COUNT,
        });
      }
    }
  }
}

export default HealthMonitor;
