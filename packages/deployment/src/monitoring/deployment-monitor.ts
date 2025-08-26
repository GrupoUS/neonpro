/**
 * @fileoverview Deployment Monitor
 * Monitors deployment progress and health for NeonPro healthcare platform
 */

export interface DeploymentMetrics {
  deploymentId: string;
  environment: string;
  version: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'rolled-back';
  healthScore: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

export interface DeploymentEvent {
  timestamp: Date;
  type:
    | 'start'
    | 'progress'
    | 'health-check'
    | 'error'
    | 'complete'
    | 'rollback';
  message: string;
  data?: any;
}

export interface MonitoringConfig {
  healthCheckInterval: number;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    healthScore: number;
  };
  retentionPeriod: number;
}

export class DeploymentMonitor {
  private readonly deployments: Map<string, DeploymentMetrics> = new Map();
  private readonly events: Map<string, DeploymentEvent[]> = new Map();
  private readonly monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly config: MonitoringConfig) {}

  /**
   * Start monitoring a deployment
   */
  startMonitoring(
    deploymentId: string,
    metrics: Omit<DeploymentMetrics, 'startTime' | 'status'>,
  ): void {
    const deployment: DeploymentMetrics = {
      ...metrics,
      deploymentId,
      startTime: new Date(),
      status: 'in-progress',
      healthScore: 100,
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
    };

    this.deployments.set(deploymentId, deployment);
    this.events.set(deploymentId, []);

    this.logEvent(deploymentId, {
      timestamp: new Date(),
      type: 'start',
      message: `Deployment ${deploymentId} started for ${metrics.environment}`,
      data: { version: metrics.version },
    });

    // Start health monitoring
    const interval = setInterval(() => {
      this.performHealthCheck(deploymentId);
    }, this.config.healthCheckInterval);

    this.monitoringIntervals.set(deploymentId, interval);
  }

  /**
   * Update deployment metrics
   */
  updateMetrics(
    deploymentId: string,
    updates: Partial<DeploymentMetrics>,
  ): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    Object.assign(deployment, updates);
    this.deployments.set(deploymentId, deployment);

    this.logEvent(deploymentId, {
      timestamp: new Date(),
      type: 'progress',
      message: `Metrics updated for deployment ${deploymentId}`,
      data: updates,
    });

    // Check alert thresholds
    this.checkAlertThresholds(deploymentId, deployment);
  }

  /**
   * Complete deployment monitoring
   */
  completeDeployment(deploymentId: string, success: boolean): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    deployment.status = success ? 'completed' : 'failed';
    deployment.endTime = new Date();
    this.deployments.set(deploymentId, deployment);

    this.logEvent(deploymentId, {
      timestamp: new Date(),
      type: 'complete',
      message: `Deployment ${deploymentId} ${success ? 'completed successfully' : 'failed'}`,
      data: {
        success,
        duration: deployment.endTime.getTime() - deployment.startTime.getTime(),
      },
    });

    // Stop monitoring
    this.stopMonitoring(deploymentId);
  }

  /**
   * Mark deployment as rolled back
   */
  rollbackDeployment(deploymentId: string, reason: string): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    deployment.status = 'rolled-back';
    deployment.endTime = new Date();
    this.deployments.set(deploymentId, deployment);

    this.logEvent(deploymentId, {
      timestamp: new Date(),
      type: 'rollback',
      message: `Deployment ${deploymentId} rolled back: ${reason}`,
      data: { reason },
    });

    this.stopMonitoring(deploymentId);
  }

  /**
   * Get deployment metrics
   */
  getDeploymentMetrics(deploymentId: string): DeploymentMetrics | undefined {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get deployment events
   */
  getDeploymentEvents(deploymentId: string): DeploymentEvent[] {
    return this.events.get(deploymentId) || [];
  }

  /**
   * Get all active deployments
   */
  getActiveDeployments(): DeploymentMetrics[] {
    return [...this.deployments.values()].filter(
      (d) => d.status === 'in-progress' || d.status === 'pending',
    );
  }

  /**
   * Get deployment history
   */
  getDeploymentHistory(environment?: string): DeploymentMetrics[] {
    const deployments = [...this.deployments.values()];

    if (environment) {
      return deployments.filter((d) => d.environment === environment);
    }

    return deployments;
  }

  private performHealthCheck(deploymentId: string): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment || deployment.status !== 'in-progress') {
      return;
    }

    // Simulate health check - in real implementation, this would check actual endpoints
    const healthScore = Math.max(0, deployment.healthScore - Math.random() * 5);
    const responseTime = deployment.responseTime + (Math.random() - 0.5) * 50;
    const errorRate = Math.max(
      0,
      deployment.errorRate + (Math.random() - 0.7) * 2,
    );
    const throughput = deployment.throughput + (Math.random() - 0.5) * 100;

    this.updateMetrics(deploymentId, {
      healthScore,
      responseTime: Math.max(0, responseTime),
      errorRate: Math.max(0, errorRate),
      throughput: Math.max(0, throughput),
    });

    this.logEvent(deploymentId, {
      timestamp: new Date(),
      type: 'health-check',
      message: `Health check completed for deployment ${deploymentId}`,
      data: { healthScore, responseTime, errorRate, throughput },
    });
  }

  private checkAlertThresholds(
    deploymentId: string,
    deployment: DeploymentMetrics,
  ): void {
    const { alertThresholds } = this.config;
    const alerts: string[] = [];

    if (deployment.errorRate > alertThresholds.errorRate) {
      alerts.push(
        `Error rate (${
          deployment.errorRate.toFixed(
            2,
          )
        }%) exceeds threshold (${alertThresholds.errorRate}%)`,
      );
    }

    if (deployment.responseTime > alertThresholds.responseTime) {
      alerts.push(
        `Response time (${
          deployment.responseTime.toFixed(
            2,
          )
        }ms) exceeds threshold (${alertThresholds.responseTime}ms)`,
      );
    }

    if (deployment.healthScore < alertThresholds.healthScore) {
      alerts.push(
        `Health score (${
          deployment.healthScore.toFixed(
            2,
          )
        }) below threshold (${alertThresholds.healthScore})`,
      );
    }

    if (alerts.length > 0) {
      this.logEvent(deploymentId, {
        timestamp: new Date(),
        type: 'error',
        message: `Alert thresholds exceeded for deployment ${deploymentId}`,
        data: { alerts },
      });
    }
  }

  private logEvent(deploymentId: string, event: DeploymentEvent): void {
    const events = this.events.get(deploymentId) || [];
    events.push(event);

    // Limit event history
    if (events.length > 1000) {
      events.shift();
    }

    this.events.set(deploymentId, events);
  }

  private stopMonitoring(deploymentId: string): void {
    const interval = this.monitoringIntervals.get(deploymentId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(deploymentId);
    }
  }

  /**
   * Cleanup old deployments based on retention period
   */
  cleanup(): void {
    const cutoff = new Date(Date.now() - this.config.retentionPeriod);

    for (const [deploymentId, deployment] of this.deployments.entries()) {
      if (deployment.endTime && deployment.endTime < cutoff) {
        this.deployments.delete(deploymentId);
        this.events.delete(deploymentId);
        this.stopMonitoring(deploymentId);
      }
    }
  }
}
