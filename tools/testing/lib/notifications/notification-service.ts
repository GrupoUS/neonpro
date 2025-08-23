/**
 * Notification Service Mock - Healthcare notification system
 * Implements TASK-003 communication requirements for medical alerts and updates
 */

export type NotificationChannel = {
	id: string;
	type: "email" | "sms" | "push" | "webhook" | "in_app";
	endpoint: string;
	enabled: boolean;
	priority: "low" | "medium" | "high" | "critical";
	retryAttempts: number;
	cooldownPeriod: number; // seconds
};

export type NotificationTemplate = {
	id: string;
	name: string;
	type:
		| "medical_alert"
		| "appointment_reminder"
		| "system_notification"
		| "compliance_alert";
	subject: string;
	body: string;
	variables: string[]; // Available template variables
	channels: NotificationChannel["type"][];
	priority: NotificationChannel["priority"];
};

export type NotificationMessage = {
	id: string;
	templateId?: string;
	recipient: {
		userId?: string;
		email?: string;
		phone?: string;
		deviceToken?: string;
	};
	channel: NotificationChannel["type"];
	priority: NotificationChannel["priority"];
	subject: string;
	body: string;
	metadata: Record<string, any>;
	scheduledAt?: Date;
	sentAt?: Date;
	deliveredAt?: Date;
	readAt?: Date;
	status: "pending" | "sent" | "delivered" | "read" | "failed";
	retryCount: number;
	errors: string[];
};

export type NotificationPreferences = {
	userId: string;
	channels: {
		[K in NotificationChannel["type"]]: {
			enabled: boolean;
			endpoint?: string;
			quietHours?: {
				start: string; // HH:mm format
				end: string; // HH:mm format
				timezone: string;
			};
		};
	};
	categories: {
		medical_alerts: boolean;
		appointment_reminders: boolean;
		system_notifications: boolean;
		compliance_alerts: boolean;
	};
};

export type NotificationStats = {
	totalSent: number;
	totalDelivered: number;
	totalRead: number;
	totalFailed: number;
	deliveryRate: number; // percentage
	readRate: number; // percentage
	errorRate: number; // percentage
	byChannel: Record<
		NotificationChannel["type"],
		{
			sent: number;
			delivered: number;
			failed: number;
			deliveryRate: number;
		}
	>;
	byPriority: Record<
		NotificationChannel["priority"],
		{
			sent: number;
			delivered: number;
			failed: number;
		}
	>;
};

class MockNotificationService {
	private readonly channels: Map<string, NotificationChannel> = new Map();
	private readonly templates: Map<string, NotificationTemplate> = new Map();
	private readonly messages: NotificationMessage[] = [];
	private readonly preferences: Map<string, NotificationPreferences> =
		new Map();

	constructor() {
		this.initializeDefaultChannels();
		this.initializeDefaultTemplates();
	}

	/**
	 * Send a notification using a template
	 */
	async sendNotification(request: {
		templateId: string;
		recipient: NotificationMessage["recipient"];
		variables?: Record<string, string>;
		priority?: NotificationChannel["priority"];
		scheduledAt?: Date;
		metadata?: Record<string, any>;
	}): Promise<NotificationMessage> {
		const template = this.templates.get(request.templateId);
		if (!template) {
			throw new Error(`Template not found: ${request.templateId}`);
		}

		// Get user preferences
		const userPrefs = request.recipient.userId
			? this.preferences.get(request.recipient.userId)
			: null;

		// Determine best channel based on preferences and template
		const availableChannels = template.channels;
		const preferredChannel = this.selectOptimalChannel(
			availableChannels,
			userPrefs,
		);

		// Process template variables
		const processedSubject = this.processTemplate(
			template.subject,
			request.variables || {},
		);
		const processedBody = this.processTemplate(
			template.body,
			request.variables || {},
		);

		const message: NotificationMessage = {
			id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
			templateId: request.templateId,
			recipient: request.recipient,
			channel: preferredChannel,
			priority: request.priority || template.priority,
			subject: processedSubject,
			body: processedBody,
			metadata: request.metadata || {},
			scheduledAt: request.scheduledAt,
			status: "pending",
			retryCount: 0,
			errors: [],
		};

		// Store message
		this.messages.push(message);

		// Simulate sending
		await this.processPendingMessage(message);

		return message;
	} /**
	 * Send a custom notification without template
	 */
	async sendCustomNotification(request: {
		recipient: NotificationMessage["recipient"];
		channel: NotificationChannel["type"];
		subject: string;
		body: string;
		priority?: NotificationChannel["priority"];
		scheduledAt?: Date;
		metadata?: Record<string, any>;
	}): Promise<NotificationMessage> {
		const message: NotificationMessage = {
			id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
			recipient: request.recipient,
			channel: request.channel,
			priority: request.priority || "medium",
			subject: request.subject,
			body: request.body,
			metadata: request.metadata || {},
			scheduledAt: request.scheduledAt,
			status: "pending",
			retryCount: 0,
			errors: [],
		};

		// Store message
		this.messages.push(message);

		// Simulate sending
		await this.processPendingMessage(message);

		return message;
	}

	/**
	 * Get notification status
	 */
	async getNotificationStatus(
		messageId: string,
	): Promise<NotificationMessage | null> {
		return this.messages.find((msg) => msg.id === messageId) || null;
	}

	/**
	 * Get user notification preferences
	 */
	async getUserPreferences(userId: string): Promise<NotificationPreferences> {
		let prefs = this.preferences.get(userId);

		if (!prefs) {
			// Create default preferences
			prefs = this.createDefaultPreferences(userId);
			this.preferences.set(userId, prefs);
		}

		return prefs;
	}

	/**
	 * Update user notification preferences
	 */
	async updateUserPreferences(
		userId: string,
		updates: Partial<NotificationPreferences>,
	): Promise<NotificationPreferences> {
		const currentPrefs = await this.getUserPreferences(userId);
		const updatedPrefs = {
			...currentPrefs,
			...updates,
			userId,
		};

		this.preferences.set(userId, updatedPrefs);
		return updatedPrefs;
	}

	/**
	 * Get notification history for user
	 */
	async getUserNotifications(
		userId: string,
		options?: {
			limit?: number;
			status?: NotificationMessage["status"];
			channel?: NotificationChannel["type"];
			priority?: NotificationChannel["priority"];
		},
	): Promise<NotificationMessage[]> {
		let userMessages = this.messages.filter(
			(msg) => msg.recipient.userId === userId,
		);

		// Apply filters
		if (options?.status) {
			userMessages = userMessages.filter(
				(msg) => msg.status === options.status,
			);
		}
		if (options?.channel) {
			userMessages = userMessages.filter(
				(msg) => msg.channel === options.channel,
			);
		}
		if (options?.priority) {
			userMessages = userMessages.filter(
				(msg) => msg.priority === options.priority,
			);
		}

		// Sort by most recent first
		userMessages.sort((a, b) => {
			const aTime = a.sentAt || a.scheduledAt || new Date(0);
			const bTime = b.sentAt || b.scheduledAt || new Date(0);
			return bTime.getTime() - aTime.getTime();
		});

		// Apply limit
		if (options?.limit) {
			userMessages = userMessages.slice(0, options.limit);
		}

		return userMessages;
	}

	/**
	 * Mark notification as read
	 */
	async markAsRead(messageId: string): Promise<boolean> {
		const message = this.messages.find((msg) => msg.id === messageId);
		if (message && message.status === "delivered") {
			message.status = "read";
			message.readAt = new Date();
			return true;
		}
		return false;
	}

	/**
	 * Get notification statistics
	 */
	async getNotificationStats(timeRange?: {
		start: Date;
		end: Date;
	}): Promise<NotificationStats> {
		let filteredMessages = this.messages;

		if (timeRange) {
			filteredMessages = this.messages.filter((msg) => {
				const msgTime = msg.sentAt || msg.scheduledAt;
				return (
					msgTime && msgTime >= timeRange.start && msgTime <= timeRange.end
				);
			});
		}

		const totalSent = filteredMessages.filter(
			(msg) => msg.status !== "pending",
		).length;
		const totalDelivered = filteredMessages.filter(
			(msg) => msg.status === "delivered" || msg.status === "read",
		).length;
		const totalRead = filteredMessages.filter(
			(msg) => msg.status === "read",
		).length;
		const totalFailed = filteredMessages.filter(
			(msg) => msg.status === "failed",
		).length;

		const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
		const readRate =
			totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
		const errorRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

		// Calculate stats by channel
		const channels: NotificationChannel["type"][] = [
			"email",
			"sms",
			"push",
			"webhook",
			"in_app",
		];
		const byChannel = channels.reduce(
			(acc, channel) => {
				const channelMessages = filteredMessages.filter(
					(msg) => msg.channel === channel,
				);
				const sent = channelMessages.filter(
					(msg) => msg.status !== "pending",
				).length;
				const delivered = channelMessages.filter(
					(msg) => msg.status === "delivered" || msg.status === "read",
				).length;
				const failed = channelMessages.filter(
					(msg) => msg.status === "failed",
				).length;

				acc[channel] = {
					sent,
					delivered,
					failed,
					deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
				};
				return acc;
			},
			{} as NotificationStats["byChannel"],
		);

		// Calculate stats by priority
		const priorities: NotificationChannel["priority"][] = [
			"low",
			"medium",
			"high",
			"critical",
		];
		const byPriority = priorities.reduce(
			(acc, priority) => {
				const priorityMessages = filteredMessages.filter(
					(msg) => msg.priority === priority,
				);
				const sent = priorityMessages.filter(
					(msg) => msg.status !== "pending",
				).length;
				const delivered = priorityMessages.filter(
					(msg) => msg.status === "delivered" || msg.status === "read",
				).length;
				const failed = priorityMessages.filter(
					(msg) => msg.status === "failed",
				).length;

				acc[priority] = {
					sent,
					delivered,
					failed,
				};
				return acc;
			},
			{} as NotificationStats["byPriority"],
		);

		return {
			totalSent,
			totalDelivered,
			totalRead,
			totalFailed,
			deliveryRate,
			readRate,
			errorRate,
			byChannel,
			byPriority,
		};
	} /**
	 * Create or update a notification template
	 */
	async createTemplate(
		template: Omit<NotificationTemplate, "id">,
	): Promise<NotificationTemplate> {
		const newTemplate: NotificationTemplate = {
			...template,
			id: `tpl_${Date.now()}_${Math.random().toString(36).substring(2)}`,
		};

		this.templates.set(newTemplate.id, newTemplate);
		return newTemplate;
	}

	/**
	 * Get all notification templates
	 */
	async getTemplates(): Promise<NotificationTemplate[]> {
		return Array.from(this.templates.values());
	}

	/**
	 * Delete a notification template
	 */
	async deleteTemplate(templateId: string): Promise<boolean> {
		return this.templates.delete(templateId);
	}

	/**
	 * Process pending notifications (simulates background processing)
	 */
	async processPendingNotifications(): Promise<void> {
		const pendingMessages = this.messages.filter(
			(msg) =>
				msg.status === "pending" &&
				(!msg.scheduledAt || msg.scheduledAt <= new Date()),
		);

		for (const message of pendingMessages) {
			await this.processPendingMessage(message);
		}
	}

	// Private helper methods

	private initializeDefaultChannels(): void {
		const defaultChannels: NotificationChannel[] = [
			{
				id: "email_primary",
				type: "email",
				endpoint: "smtp://localhost:587",
				enabled: true,
				priority: "medium",
				retryAttempts: 3,
				cooldownPeriod: 300,
			},
			{
				id: "sms_primary",
				type: "sms",
				endpoint: "sms://api.provider.com",
				enabled: true,
				priority: "high",
				retryAttempts: 2,
				cooldownPeriod: 60,
			},
			{
				id: "push_primary",
				type: "push",
				endpoint: "fcm://googleapis.com",
				enabled: true,
				priority: "medium",
				retryAttempts: 3,
				cooldownPeriod: 120,
			},
			{
				id: "webhook_primary",
				type: "webhook",
				endpoint: "https://api.webhook.site",
				enabled: true,
				priority: "low",
				retryAttempts: 5,
				cooldownPeriod: 180,
			},
			{
				id: "in_app_primary",
				type: "in_app",
				endpoint: "internal://notifications",
				enabled: true,
				priority: "low",
				retryAttempts: 1,
				cooldownPeriod: 0,
			},
		];

		defaultChannels.forEach((channel) => {
			this.channels.set(channel.id, channel);
		});
	}

	private initializeDefaultTemplates(): void {
		const defaultTemplates: Omit<NotificationTemplate, "id">[] = [
			{
				name: "Medical Alert - Critical",
				type: "medical_alert",
				subject: "URGENT: Critical Medical Alert - {{patientName}}",
				body: "Critical medical alert for patient {{patientName}} (ID: {{patientId}}).\n\nAlert: {{alertMessage}}\n\nImmediate attention required.\n\nTime: {{timestamp}}\nProvider: {{providerName}}",
				variables: [
					"patientName",
					"patientId",
					"alertMessage",
					"timestamp",
					"providerName",
				],
				channels: ["sms", "email", "push"],
				priority: "critical",
			},
			{
				name: "Appointment Reminder",
				type: "appointment_reminder",
				subject: "Appointment Reminder - {{appointmentDate}}",
				body: "Hello {{patientName}},\n\nThis is a reminder for your upcoming appointment:\n\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nProvider: {{providerName}}\nLocation: {{location}}\n\nPlease confirm your attendance or reschedule if needed.",
				variables: [
					"patientName",
					"appointmentDate",
					"appointmentTime",
					"providerName",
					"location",
				],
				channels: ["email", "sms", "in_app"],
				priority: "medium",
			},
			{
				name: "System Maintenance Notice",
				type: "system_notification",
				subject: "System Maintenance - {{maintenanceDate}}",
				body: "Dear User,\n\nScheduled system maintenance will occur on {{maintenanceDate}} from {{startTime}} to {{endTime}}.\n\nDuring this time, the system may be unavailable.\n\nWe apologize for any inconvenience.",
				variables: ["maintenanceDate", "startTime", "endTime"],
				channels: ["email", "in_app"],
				priority: "low",
			},
			{
				name: "Compliance Alert",
				type: "compliance_alert",
				subject: "Compliance Alert - Action Required",
				body: "Compliance alert detected:\n\nType: {{complianceType}}\nSeverity: {{severity}}\nDescription: {{description}}\n\nAction required by: {{dueDate}}\n\nPlease review and take appropriate action.",
				variables: ["complianceType", "severity", "description", "dueDate"],
				channels: ["email", "webhook"],
				priority: "high",
			},
		];

		defaultTemplates.forEach((template) => {
			this.createTemplate(template);
		});
	}

	private createDefaultPreferences(userId: string): NotificationPreferences {
		return {
			userId,
			channels: {
				email: { enabled: true },
				sms: { enabled: true },
				push: { enabled: true },
				webhook: { enabled: false },
				in_app: { enabled: true },
			},
			categories: {
				medical_alerts: true,
				appointment_reminders: true,
				system_notifications: true,
				compliance_alerts: true,
			},
		};
	}

	private selectOptimalChannel(
		availableChannels: NotificationChannel["type"][],
		userPrefs?: NotificationPreferences | null,
	): NotificationChannel["type"] {
		if (userPrefs) {
			// Use user preferences
			for (const channel of availableChannels) {
				if (userPrefs.channels[channel]?.enabled) {
					return channel;
				}
			}
		} else {
			// Default priority: push > email > sms > in_app > webhook
			const priorityOrder: NotificationChannel["type"][] = [
				"push",
				"email",
				"sms",
				"in_app",
				"webhook",
			];
			for (const channel of priorityOrder) {
				if (availableChannels.includes(channel)) {
					return channel;
				}
			}
		}

		// Fallback to first available channel
		return availableChannels[0] || "email";
	}

	private processTemplate(
		template: string,
		variables: Record<string, string>,
	): string {
		let processed = template;

		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`{{${key}}}`, "g");
			processed = processed.replace(regex, value);
		}

		return processed;
	}

	private async processPendingMessage(
		message: NotificationMessage,
	): Promise<void> {
		try {
			// Simulate network delay
			await new Promise((resolve) =>
				setTimeout(resolve, Math.random() * 100 + 50),
			);

			// Simulate delivery success/failure (95% success rate)
			const success = Math.random() > 0.05;

			if (success) {
				message.status = "sent";
				message.sentAt = new Date();

				// Simulate delivery confirmation (90% of sent messages)
				if (Math.random() > 0.1) {
					setTimeout(
						() => {
							message.status = "delivered";
							message.deliveredAt = new Date();
						},
						Math.random() * 5000 + 1000,
					); // 1-6 seconds
				}
			} else {
				message.status = "failed";
				message.errors.push("Simulated delivery failure");
			}
		} catch (error) {
			message.status = "failed";
			message.errors.push(
				error instanceof Error ? error.message : "Unknown error",
			);
		}
	}
}

// Export singleton instance
export const mockNotificationService = new MockNotificationService();

// Export class for custom instances
export { MockNotificationService };

// Export types
export type {
	NotificationChannel,
	NotificationTemplate,
	NotificationMessage,
	NotificationPreferences,
	NotificationStats,
};
