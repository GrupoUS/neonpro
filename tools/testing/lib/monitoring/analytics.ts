// Analytics monitoring utilities for NeonPro Healthcare System
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

// TODO: Convert to standalone functions
export class AnalyticsService {
  static track(_event: AnalyticsEvent): void {}

  static trackUserAction(
    action: string,
    userId: string,
    metadata?: Record<string, unknown>,
  ): void {
    AnalyticsService.track({
      name: "user_action",
      properties: {
        action,
        userId,
        ...metadata,
      },
    });
  }
}

export default AnalyticsService;
