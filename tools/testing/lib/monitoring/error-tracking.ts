// Error tracking utilities for NeonPro Healthcare System
export interface ErrorEvent {
  error: Error;
  context?: Record<string, unknown>;
  severity?: "low" | "medium" | "high" | "critical";
  timestamp?: Date;
}

// TODO: Convert to standalone functions
export class ErrorTrackingService {
  static captureError(_error: Error, _context?: Record<string, unknown>): void {}

  static captureException(
    exception: unknown,
    context?: Record<string, unknown>,
  ): void {
    const error = exception instanceof Error ? exception : new Error(String(exception));
    ErrorTrackingService.captureError(error, context);
  }

  static setContext(_key: string, _value: unknown): void {}
}

export default ErrorTrackingService;
