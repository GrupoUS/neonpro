// Error tracking utilities for NeonPro Healthcare System
export type ErrorEvent = {
	error: Error;
	context?: Record<string, any>;
	severity?: "low" | "medium" | "high" | "critical";
	timestamp?: Date;
};

export class ErrorTrackingService {
	static captureError(_error: Error, _context?: Record<string, any>): void {}

	static captureException(exception: unknown, context?: Record<string, any>): void {
		const error = exception instanceof Error ? exception : new Error(String(exception));
		ErrorTrackingService.captureError(error, context);
	}

	static setContext(_key: string, _value: any): void {}
}

export default ErrorTrackingService;
