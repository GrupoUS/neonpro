// Analytics monitoring utilities for NeonPro Healthcare System
export type AnalyticsEvent = {
	name: string;
	properties?: Record<string, any>;
	timestamp?: Date;
};

export class AnalyticsService {
	static track(_event: AnalyticsEvent): void {}

	static trackUserAction(
		action: string,
		userId: string,
		metadata?: Record<string, any>,
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
