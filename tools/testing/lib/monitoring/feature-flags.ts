// Feature flags utilities for NeonPro Healthcare System
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  variants?: Record<string, any>;
}

export class FeatureFlagsService {
  private static flags: Map<string, boolean> = new Map([
    ['webauthn_enabled', true],
    ['advanced_monitoring', true],
    ['ml_risk_assessment', true],
    ['real_time_notifications', true]
  ]);

  static isEnabled(flagName: string): boolean {
    return this.flags.get(flagName) ?? false;
  }

  static setFlag(flagName: string, enabled: boolean): void {
    this.flags.set(flagName, enabled);
  }

  static getAllFlags(): Record<string, boolean> {
    return Object.fromEntries(this.flags);
  }
}

export default FeatureFlagsService;