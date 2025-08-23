/**
 * Supabase Realtime Connection Manager
 * Gerencia conexões real-time com retry logic robusto e authentication
 * Otimizado para ambiente healthcare com alta disponibilidade
 */

import type { Database } from "@neonpro/db";
import {
	createClient,
	type RealtimeChannel,
	type SupabaseClient,
} from "@supabase/supabase-js";

export type ConnectionConfig = {
	url: string;
	anonKey: string;
	serviceRoleKey?: string;
	maxRetries: number;
	retryDelay: number;
	heartbeatInterval: number;
	reconnectOnFocus: boolean;
	enableLogging: boolean;
};

export type ChannelSubscription = {
	channelName: string;
	channel: RealtimeChannel;
	isActive: boolean;
	retryCount: number;
	lastError?: Error;
	callbacks: Map<string, (payload: any) => void>;
	config?: {
		table?: string;
		schema?: string;
		filter?: string;
		event?: "INSERT" | "UPDATE" | "DELETE" | "*";
	};
};

export type ConnectionStatus = {
	isConnected: boolean;
	connectionId: string | null;
	lastConnected: Date | null;
	totalRetries: number;
	activeChannels: number;
	healthScore: number; // 0-100
};

/**
 * MANDATORY Supabase Realtime Connection Manager
 * Implementa conexão robusta com healthcare-grade reliability
 */
export class SupabaseRealtimeManager {
	private readonly client: SupabaseClient<Database>;
	private readonly config: ConnectionConfig;
	private readonly subscriptions = new Map<string, ChannelSubscription>();
	private connectionStatus: ConnectionStatus;
	private heartbeatTimer?: NodeJS.Timeout | null;
	private reconnectTimer?: NodeJS.Timeout | null;
	private readonly statusListeners = new Set<
		(status: ConnectionStatus) => void
	>();
	private isDestroyed = false;

	constructor(config: ConnectionConfig) {
		this.config = config;
		this.connectionStatus = {
			isConnected: false,
			connectionId: null,
			lastConnected: null,
			totalRetries: 0,
			activeChannels: 0,
			healthScore: 0,
		};

		// Initialize Supabase client with realtime configuration
		this.client = createClient<Database>(config.url, config.anonKey, {
			realtime: {
				params: {
					eventsPerSecond: 10,
					heartbeatIntervalMs: config.heartbeatInterval,
				},
			},
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: false,
			},
		});

		this.initializeConnection();
		this.setupHeartbeat();
		this.setupVisibilityHandlers();
	} /**
	 * Initialize connection with retry logic
	 */
	private initializeConnection(): void {
		if (this.isDestroyed) {
			return;
		}

		try {
			// Setup connection event handlers using a monitoring channel
			const monitorChannel = this.client.channel("system_monitor");

			monitorChannel.subscribe((status) => {
				if (status === "SUBSCRIBED") {
					this.handleConnectionOpen();
				} else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
					this.handleConnectionError(new Error(`Connection status: ${status}`));
				} else if (status === "CLOSED") {
					this.handleConnectionClose();
				}
			});

			if (this.config.enableLogging) {
			}
		} catch (error) {
			this.handleConnectionError(error as Error);
		}
	}

	/**
	 * Handle successful connection
	 */
	private handleConnectionOpen(): void {
		this.connectionStatus = {
			...this.connectionStatus,
			isConnected: true,
			connectionId: this.generateConnectionId(),
			lastConnected: new Date(),
			healthScore: 100,
		};

		if (this.config.enableLogging) {
		}

		// Resubscribe to all channels
		this.resubscribeAllChannels();
		this.notifyStatusListeners();

		// Clear reconnect timer
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	} /**
	 * Handle connection close
	 */
	private handleConnectionClose(): void {
		this.connectionStatus = {
			...this.connectionStatus,
			isConnected: false,
			connectionId: null,
			healthScore: 0,
		};

		if (this.config.enableLogging) {
		}

		this.markAllChannelsInactive();
		this.notifyStatusListeners();
		this.scheduleReconnect();
	}

	/**
	 * Handle connection errors
	 */
	private handleConnectionError(_error: Error): void {
		this.connectionStatus.totalRetries++;

		if (this.config.enableLogging) {
		}

		// Calculate health score based on errors
		this.updateHealthScore();
		this.notifyStatusListeners();

		// Schedule reconnect if not at max retries
		if (this.connectionStatus.totalRetries < this.config.maxRetries) {
			this.scheduleReconnect();
		}
	} /**
	 * Schedule reconnection with exponential backoff
	 */
	private scheduleReconnect(): void {
		if (this.isDestroyed || this.reconnectTimer) {
			return;
		}

		const delay = Math.min(
			this.config.retryDelay * 2 ** this.connectionStatus.totalRetries,
			30_000, // Max 30 seconds
		);

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			this.initializeConnection();
		}, delay);

		if (this.config.enableLogging) {
		}
	}

	/**
	 * Setup heartbeat monitoring
	 */
	private setupHeartbeat(): void {
		this.heartbeatTimer = setInterval(() => {
			this.performHealthCheck();
		}, this.config.heartbeatInterval);
	}

	/**
	 * Setup window focus/blur handlers for reconnection
	 */
	private setupVisibilityHandlers(): void {
		if (typeof window === "undefined" || !this.config.reconnectOnFocus) {
			return;
		}

		window.addEventListener("focus", this.handleWindowFocus.bind(this));
		window.addEventListener("blur", this.handleWindowBlur.bind(this));
	} /**
	 * Subscribe to a realtime channel
	 */
	public subscribe<T = any>(
		channelName: string,
		config: {
			table?: string;
			schema?: string;
			filter?: string;
			event?: "INSERT" | "UPDATE" | "DELETE" | "*";
		},
		callback: (payload: T) => void,
	): () => void {
		// Create or get existing subscription
		let subscription = this.subscriptions.get(channelName);

		if (!subscription) {
			// Create channel with empty options (Supabase will handle postgres_changes via .on())
			const channel = this.client.channel(channelName);

			subscription = {
				channelName,
				channel,
				isActive: false,
				retryCount: 0,
				callbacks: new Map(),
				config, // Store config for retry scenarios
			};

			this.subscriptions.set(channelName, subscription);
		}

		// Add callback
		const callbackId = this.generateCallbackId();
		subscription.callbacks.set(callbackId, callback);

		// Setup channel if not active
		if (!subscription.isActive) {
			this.activateChannel(subscription, config);
		}

		// Return unsubscribe function
		return () => {
			this.unsubscribeCallback(channelName, callbackId);
		};
	}

	/**
	 * Activate a channel subscription
	 */
	private activateChannel(
		subscription: ChannelSubscription,
		config?: {
			table?: string;
			schema?: string;
			filter?: string;
			event?: "INSERT" | "UPDATE" | "DELETE" | "*";
		},
	): void {
		const { channel, callbacks } = subscription;

		// Setup postgres changes listener with configuration
		if (config?.table) {
			channel.on(
				"postgres_changes" as any,
				{
					event: config.event || "*",
					schema: config.schema || "public",
					table: config.table,
					filter: config.filter,
				},
				(payload: any) => {
					callbacks.forEach((callback) => {
						try {
							callback(payload);
						} catch (_error) {}
					});
				},
			);
		} else {
			// Setup generic postgres changes listener for backwards compatibility
			channel.on(
				"postgres_changes" as any,
				{ event: "*", schema: "public" },
				(payload: any) => {
					callbacks.forEach((callback) => {
						try {
							callback(payload);
						} catch (_error) {}
					});
				},
			);
		}

		// Subscribe to channel
		channel.subscribe((status) => {
			subscription.isActive = status === "SUBSCRIBED";

			if (status === "SUBSCRIBED") {
				subscription.retryCount = 0;
				this.connectionStatus.activeChannels = this.subscriptions.size;
			} else if (status === "CHANNEL_ERROR") {
				this.handleChannelError(subscription);
			}

			this.notifyStatusListeners();
		});
	} /**
	 * Unsubscribe callback from channel
	 */
	private unsubscribeCallback(channelName: string, callbackId: string): void {
		const subscription = this.subscriptions.get(channelName);
		if (!subscription) {
			return;
		}

		subscription.callbacks.delete(callbackId);

		// Remove subscription if no more callbacks
		if (subscription.callbacks.size === 0) {
			subscription.channel.unsubscribe();
			this.subscriptions.delete(channelName);
			this.connectionStatus.activeChannels = this.subscriptions.size;
			this.notifyStatusListeners();
		}
	}

	/**
	 * Handle channel errors
	 */
	private handleChannelError(subscription: ChannelSubscription): void {
		subscription.retryCount++;
		subscription.lastError = new Error(
			`Channel ${subscription.channelName} error`,
		);

		if (this.config.enableLogging) {
		}

		// Retry channel subscription if under limit
		if (subscription.retryCount < this.config.maxRetries) {
			setTimeout(() => {
				this.activateChannel(subscription, subscription.config);
			}, this.config.retryDelay * subscription.retryCount);
		}
	}

	/**
	 * Resubscribe all channels after reconnection
	 */
	private resubscribeAllChannels(): void {
		this.subscriptions.forEach((subscription) => {
			if (!subscription.isActive) {
				this.activateChannel(subscription, subscription.config);
			}
		});
	} /**
	 * Mark all channels as inactive
	 */
	private markAllChannelsInactive(): void {
		this.subscriptions.forEach((subscription) => {
			subscription.isActive = false;
		});
		this.connectionStatus.activeChannels = 0;
	}

	/**
	 * Perform health check
	 */
	private performHealthCheck(): void {
		const healthScore = this.calculateHealthScore();
		this.connectionStatus.healthScore = healthScore;

		// Trigger reconnection if health is too low
		if (healthScore < 50 && this.connectionStatus.isConnected) {
			this.client.realtime.disconnect();
		}
	}

	/**
	 * Calculate connection health score
	 */
	private calculateHealthScore(): number {
		if (!this.connectionStatus.isConnected) {
			return 0;
		}

		const maxScore = 100;
		const retryPenalty = this.connectionStatus.totalRetries * 10;
		const inactiveChannelPenalty =
			(this.subscriptions.size - this.connectionStatus.activeChannels) * 5;

		return Math.max(0, maxScore - retryPenalty - inactiveChannelPenalty);
	}

	/**
	 * Update health score based on errors
	 */
	private updateHealthScore(): void {
		this.connectionStatus.healthScore = this.calculateHealthScore();
	}

	/**
	 * Handle window focus event
	 */
	private handleWindowFocus(): void {
		if (!(this.connectionStatus.isConnected || this.isDestroyed)) {
			this.initializeConnection();
		}
	}

	/**
	 * Handle window blur event
	 */
	private handleWindowBlur(): void {
		// Reduce heartbeat frequency when window is not in focus
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = setInterval(() => {
				this.performHealthCheck();
			}, this.config.heartbeatInterval * 3);
		}
	} /**
	 * Add status change listener
	 */
	public onStatusChange(
		listener: (status: ConnectionStatus) => void,
	): () => void {
		this.statusListeners.add(listener);

		// Immediately call with current status
		listener(this.connectionStatus);

		// Return unsubscribe function
		return () => {
			this.statusListeners.delete(listener);
		};
	}

	/**
	 * Get current connection status
	 */
	public getStatus(): ConnectionStatus {
		return { ...this.connectionStatus };
	}

	/**
	 * Get Supabase client instance
	 */
	public getClient(): SupabaseClient<Database> {
		return this.client;
	}

	/**
	 * Manually reconnect
	 */
	public reconnect(): void {
		if (this.connectionStatus.isConnected) {
			this.client.realtime.disconnect();
		}
		this.initializeConnection();
	}

	/**
	 * Destroy connection manager
	 */
	public destroy(): void {
		this.isDestroyed = true;

		// Clear timers
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
		}
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		// Unsubscribe all channels
		this.subscriptions.forEach((subscription) => {
			subscription.channel.unsubscribe();
		});
		this.subscriptions.clear();

		// Disconnect client
		this.client.realtime.disconnect();

		// Remove event listeners
		if (typeof window !== "undefined") {
			window.removeEventListener("focus", this.handleWindowFocus.bind(this));
			window.removeEventListener("blur", this.handleWindowBlur.bind(this));
		}

		// Clear status listeners
		this.statusListeners.clear();
	} /**
	 * Notify all status listeners
	 */
	private notifyStatusListeners(): void {
		this.statusListeners.forEach((listener) => {
			try {
				listener(this.connectionStatus);
			} catch (_error) {}
		});
	}

	/**
	 * Generate unique connection ID
	 */
	private generateConnectionId(): string {
		return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Generate unique callback ID
	 */
	private generateCallbackId(): string {
		return `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}

/**
 * Default configuration for healthcare applications
 */
export const DEFAULT_CONFIG: ConnectionConfig = {
	url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
	anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
	maxRetries: 5,
	retryDelay: 1000, // 1 second base delay
	heartbeatInterval: 30_000, // 30 seconds
	reconnectOnFocus: true,
	enableLogging: process.env.NODE_ENV === "development",
};

/**
 * Singleton instance for global realtime management
 */
let globalRealtimeManager: SupabaseRealtimeManager | null = null;

/**
 * Get or create global realtime manager instance
 */
export function getRealtimeManager(
	config?: Partial<ConnectionConfig>,
): SupabaseRealtimeManager {
	if (!globalRealtimeManager) {
		const fullConfig = { ...DEFAULT_CONFIG, ...config };
		globalRealtimeManager = new SupabaseRealtimeManager(fullConfig);
	}
	return globalRealtimeManager;
}

/**
 * Destroy global realtime manager
 */
export function destroyRealtimeManager(): void {
	if (globalRealtimeManager) {
		globalRealtimeManager.destroy();
		globalRealtimeManager = null;
	}
}
