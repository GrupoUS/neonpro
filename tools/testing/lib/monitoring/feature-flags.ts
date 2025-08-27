// Feature flags utilities for NeonPro Healthcare System
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  variants?: Record<string, unknown>;
}

export class FeatureFlagsService {
  private static flags: Map<string, boolean> = new Map([
    ["webauthn_enabled", true],
    ["advanced_monitoring", true],
    ["ml_risk_assessment", true],
    ["real_time_notifications", true],
  ]);

  static isEnabled(flagName: string): boolean {
    return FeatureFlagsService.flags.get(flagName) ?? false;
  }

  static setFlag(flagName: string, enabled: boolean): void {
    FeatureFlagsService.flags.set(flagName, enabled);
  }

  static getAllFlags(): Record<string, boolean> {
    return Object.fromEntries(FeatureFlagsService.flags);
  }
}

export default FeatureFlagsService;
