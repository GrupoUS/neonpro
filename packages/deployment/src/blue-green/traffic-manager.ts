/**
 * @fileoverview Traffic Manager
 * Manages traffic routing during blue-green deployments for NeonPro healthcare platform
 */

export type TrafficConfig = {
  blueWeight: number;
  greenWeight: number;
  environment: string;
  gradualRollout?: boolean;
  rolloutSteps?: number[];
};

export type TrafficStatus = {
  currentDistribution: {
    blue: number;
    green: number;
  };
  activeEnvironment: 'blue' | 'green' | 'mixed';
  lastUpdate: Date;
};

export class TrafficManager {
  private currentConfig: TrafficConfig | null = null;
  private readonly trafficHistory: TrafficStatus[] = [];

  constructor(private readonly config: { maxHistorySize: number }) {}

  /**
   * Route traffic between blue and green environments
   */
  async routeTraffic(config: TrafficConfig): Promise<TrafficStatus> {
    // Validate weights
    if (config.blueWeight + config.greenWeight !== 100) {
      throw new Error('Traffic weights must sum to 100');
    }

    this.currentConfig = config;

    const status: TrafficStatus = {
      currentDistribution: {
        blue: config.blueWeight,
        green: config.greenWeight,
      },
      activeEnvironment: this.determineActiveEnvironment(config),
      lastUpdate: new Date(),
    };

    // Add to history
    this.trafficHistory.push(status);

    // Limit history size
    if (this.trafficHistory.length > this.config.maxHistorySize) {
      this.trafficHistory.shift();
    }

    // Simulate traffic routing
    await this.applyTrafficRouting(config);

    return status;
  }

  /**
   * Gradually shift traffic from blue to green
   */
  async gradualShift(
    steps: number[] = [10, 25, 50, 75, 100]
  ): Promise<TrafficStatus[]> {
    const results: TrafficStatus[] = [];

    for (const greenWeight of steps) {
      const config: TrafficConfig = {
        blueWeight: 100 - greenWeight,
        greenWeight,
        environment: this.currentConfig?.environment || 'production',
        gradualRollout: true,
      };

      const status = await this.routeTraffic(config);
      results.push(status);

      // Wait between steps
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * Switch all traffic to specified environment
   */
  async switchToEnvironment(
    environment: 'blue' | 'green'
  ): Promise<TrafficStatus> {
    const config: TrafficConfig = {
      blueWeight: environment === 'blue' ? 100 : 0,
      greenWeight: environment === 'green' ? 100 : 0,
      environment: this.currentConfig?.environment || 'production',
    };

    return this.routeTraffic(config);
  }

  /**
   * Get current traffic status
   */
  getCurrentStatus(): TrafficStatus | null {
    return this.trafficHistory.at(-1) || null;
  }

  /**
   * Get traffic history
   */
  getTrafficHistory(): TrafficStatus[] {
    return [...this.trafficHistory];
  }

  /**
   * Get current active environment
   */
  async getCurrentEnvironment(): Promise<'blue' | 'green'> {
    const status = this.getCurrentStatus();
    if (!status) {
      return 'blue'; // Default to blue if no status available
    }

    if (status.activeEnvironment === 'mixed') {
      // If mixed, return the environment with higher weight
      return status.currentDistribution.blue > status.currentDistribution.green
        ? 'blue'
        : 'green';
    }

    return status.activeEnvironment as 'blue' | 'green';
  }

  private determineActiveEnvironment(
    config: TrafficConfig
  ): 'blue' | 'green' | 'mixed' {
    if (config.blueWeight === 100) {
      return 'blue';
    }
    if (config.greenWeight === 100) {
      return 'green';
    }
    return 'mixed';
  }

  private async applyTrafficRouting(_config: TrafficConfig): Promise<void> {
    // Implementation would depend on load balancer/proxy configuration
    // This is a placeholder for the actual traffic routing logic
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
