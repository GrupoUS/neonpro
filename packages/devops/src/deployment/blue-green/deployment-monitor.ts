/**
 * @fileoverview Deployment Monitor
 * Monitors deployment progress and metrics for NeonPro healthcare platform
 */

export interface DeploymentMetrics {
  deploymentId: string;
  environment: "blue" | "green";
  startTime: Date;
  endTime?: Date;
  status: "pending" | "in-progress" | "completed" | "failed";
  version: string;
  healthScore: number;
  errorCount: number;
}

export interface MonitorConfig {
  maxDeploymentHistory: number;
  metricsInterval: number;
}

export class DeploymentMonitor {
  private readonly deploymentHistory: DeploymentMetrics[] = [];
  private currentDeployment: DeploymentMetrics | null = undefined;

  constructor(private readonly config: MonitorConfig) {}

  /**
   * Start monitoring a new deployment
   */
  startDeployment(
    deploymentId: string,
    environment: "blue" | "green",
    version: string,
  ): void {
    this.currentDeployment = {
      deploymentId,
      environment,
      startTime: new Date(),
      status: "in-progress",
      version,
      healthScore: 0,
      errorCount: 0,
    };
  }

  /**
   * Update deployment metrics
   */
  updateMetrics(healthScore: number, errorCount: number): void {
    if (this.currentDeployment) {
      this.currentDeployment.healthScore = healthScore;
      this.currentDeployment.errorCount = errorCount;
    }
  }

  /**
   * Complete current deployment
   */
  completeDeployment(success: boolean): DeploymentMetrics | null {
    if (!this.currentDeployment) {
      return;
    }

    this.currentDeployment.endTime = new Date();
    this.currentDeployment.status = success ? "completed" : "failed";

    // Add to history
    this.deploymentHistory.push(this.currentDeployment);

    // Limit history size
    if (this.deploymentHistory.length > this.config.maxDeploymentHistory) {
      this.deploymentHistory.shift();
    }

    const { currentDeployment: completed } = this;
    this.currentDeployment = undefined;
    return completed;
  }

  /**
   * Get current deployment metrics
   */
  getCurrentMetrics(): DeploymentMetrics | null {
    return this.currentDeployment;
  }

  /**
   * Get deployment history
   */
  getDeploymentHistory(): DeploymentMetrics[] {
    return [...this.deploymentHistory];
  }

  /**
   * Get deployment statistics
   */
  getStatistics(): {
    totalDeployments: number;
    successRate: number;
    averageDeploymentTime: number;
    lastDeployment?: DeploymentMetrics;
  } {
    const total = this.deploymentHistory.length;
    const successful = this.deploymentHistory.filter(
      (d) => d.status === "completed",
    ).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    const completedDeployments = this.deploymentHistory.filter(
      (d) => d.endTime,
    );
    const averageTime =
      completedDeployments.length > 0
        ? completedDeployments.reduce((sum, d) => {
            const duration =
              (d.endTime?.getTime() ?? 0) - d.startTime.getTime();
            return sum + duration;
          }, 0) / completedDeployments.length
        : 0;

    return {
      totalDeployments: total,
      successRate,
      averageDeploymentTime: averageTime,
      lastDeployment: this.deploymentHistory.at(-1),
    };
  }
}
