// Error tracking utilities for NeonPro Healthcare System
export interface ErrorEvent {
  error: Error;
  context?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: Date;
}

export class ErrorTrackingService {
  static captureError(error: Error, context?: Record<string, any>): void {
    // Mock implementation for testing
    console.error('Error captured:', error.message, context);
  }

  static captureException(
    exception: unknown,
    context?: Record<string, any>
  ): void {
    const error =
      exception instanceof Error ? exception : new Error(String(exception));
    ErrorTrackingService.captureError(error, context);
  }

  static setContext(key: string, value: any): void {
    // Mock implementation for testing
    console.log('Error context set:', key, value);
  }
}

export default ErrorTrackingService;
