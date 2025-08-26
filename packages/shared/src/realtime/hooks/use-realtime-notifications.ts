/**
 * Enhanced React Hook para Real-time System Notifications
 * Sistema crítico de notificações para ambiente healthcare
 * Integra com toast system e audio alerts para urgências médicas
 */

import type { Notification } from "@neonpro/db";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { getRealtimeManager } from "../connection-manager";

// Using the actual notifications table
type NotificationRow = Notification;

// Extended notification interface with additional properties
export interface ExtendedNotification extends NotificationRow {
	priority?: keyof NotificationPriority;
}

export type NotificationPriority = {
	EMERGENCY: "emergency"; // Emergências médicas
	HIGH: "high"; // Alterações críticas
	MEDIUM: "medium"; // Lembretes importantes
	LOW: "low"; // Informações gerais
};

export type RealtimeNotificationPayload = {
	eventType: "INSERT" | "UPDATE" | "DELETE";
	new?: ExtendedNotification;
	old?: ExtendedNotification;
	errors?: string[];
};

export type UseRealtimeNotificationsOptions = {
	tenantId: string;
	userId?: string;
	priority?: keyof NotificationPriority | "ALL";
	enabled?: boolean;
	enableAudio?: boolean;
	enableToast?: boolean;
	onNotification?: (payload: RealtimeNotificationPayload) => void;
	onEmergencyNotification?: (payload: RealtimeNotificationPayload) => void;
	onError?: (error: Error) => void;
};

export type UseRealtimeNotificationsReturn = {
	isConnected: boolean;
	connectionHealth: number;
	unreadCount: number;
	lastNotification: NotificationRow | null;
	emergencyCount: number;
	subscribe: () => void;
	unsubscribe: () => void;
	markAsRead?: (notificationId: string) => void;
	markAllAsRead?: () => void;
	playNotificationSound?: (priority: keyof NotificationPriority) => void;
};

/**
 * MANDATORY Real-time Notification Hook
 * Sistema crítico para notificações healthcare com audio alerts
 */
export function useRealtimeNotifications(
	options: UseRealtimeNotificationsOptions,
): UseRealtimeNotificationsReturn {
	const {
		tenantId,
		userId,
		priority,
		enabled = true,
		enableAudio = true,
		enableToast = true,
		onNotification,
		onEmergencyNotification,
		onError,
	} = options;

	const queryClient = useQueryClient();
	const [isConnected, setIsConnected] = useState(false);
	const [connectionHealth, setConnectionHealth] = useState(0);
	const [unreadCount, setUnreadCount] = useState(0);
	const [lastNotification, setLastNotification] =
		useState<NotificationRow | null>(null);
	const [emergencyCount, setEmergencyCount] = useState(0);
	const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	/**
	 * Play notification sound based on priority
	 */
	const playNotificationSound = useCallback(
		(priority: keyof NotificationPriority) => {
			if (!enableAudio || typeof window === "undefined") {
				return;
			}

			try {
				// Different sounds for different priorities
				const soundMap = {
					EMERGENCY: "/sounds/emergency-alert.mp3", // Critical medical alerts
					HIGH: "/sounds/urgent-notification.mp3", // Important changes
					MEDIUM: "/sounds/standard-notification.mp3", // Regular updates
					LOW: "/sounds/soft-notification.mp3", // Info notifications
				};

				const soundUrl = soundMap[priority] || soundMap.LOW;

				if (!audioRef.current) {
					audioRef.current = new Audio();
				}

				audioRef.current.src = soundUrl;
				audioRef.current.volume = priority === "EMERGENCY" ? 1.0 : 0.7;

				// Play sound with fallback
				const playPromise = audioRef.current.play();
				if (playPromise !== undefined) {
					playPromise.catch((_error) => {
						// Fallback to system notification sound
						if (
							"Notification" in window &&
							Notification.permission === "granted"
						) {
							new Notification("NeonPro Healthcare", {
								body: "Nova notificação recebida",
								icon: "/icons/healthcare-notification.png",
								silent: false,
							});
						}
					});
				}
			} catch (_error) {}
		},
		[enableAudio],
	);

	/**
	 * Show toast notification
	 */
	const showToastNotification = useCallback(
		(_notification: ExtendedNotification) => {
			if (!enableToast || typeof window === "undefined") {
				return;
			}
		},
		[enableToast],
	);

	/**
	 * Update TanStack Query cache para notifications
	 */
	const updateNotificationCache = useCallback(
		(payload: RealtimeNotificationPayload) => {
			const { eventType, new: newData, old: oldData } = payload;

			// Update notifications cache
			queryClient.setQueryData(
				["notifications", tenantId, userId],
				(oldCache: NotificationRow[] | undefined) => {
					if (!oldCache) {
						return oldCache;
					}

					switch (eventType) {
						case "INSERT":
							if (newData && newData.user_id === userId) {
								return [newData, ...oldCache].slice(0, 500); // Keep manageable
							}
							return oldCache;

						case "UPDATE":
							if (newData) {
								return oldCache.map((notification) =>
									notification.id === newData.id ? newData : notification,
								);
							}
							return oldCache;

						case "DELETE":
							if (oldData) {
								return oldCache.filter(
									(notification) => notification.id !== oldData.id,
								);
							}
							return oldCache;

						default:
							return oldCache;
					}
				},
			);

			// Update unread count
			queryClient.invalidateQueries({
				queryKey: ["notifications-unread", tenantId, userId],
			});
		},
		[queryClient, tenantId, userId],
	);

	/**
	 * Handle realtime notification changes
	 */
	const handleNotificationChange = useCallback(
		(payload: any) => {
			try {
				const realtimePayload: RealtimeNotificationPayload = {
					eventType: payload.eventType,
					new: payload.new as ExtendedNotification,
					old: payload.old as ExtendedNotification,
				};

				// Update state metrics
				if (realtimePayload.eventType === "INSERT" && realtimePayload.new) {
					setUnreadCount((prev) => prev + 1);
					setLastNotification(realtimePayload.new as NotificationRow);

					// Track emergency notifications
					if (realtimePayload.new.priority === "EMERGENCY") {
						setEmergencyCount((prev) => prev + 1);

						// Trigger emergency callback
						if (onEmergencyNotification) {
							onEmergencyNotification(realtimePayload);
						}
					}

					// Play audio alert based on priority
					if (enableAudio) {
						playNotificationSound(realtimePayload.new.priority || "LOW");
					}

					// Show toast notification
					if (enableToast) {
						showToastNotification(realtimePayload.new);
					}
				}

				// Update TanStack Query cache
				updateNotificationCache(realtimePayload);

				// Call user callback
				if (onNotification) {
					onNotification(realtimePayload);
				}
			} catch (error) {
				if (onError) {
					onError(error as Error);
				}
			}
		},
		[
			onNotification,
			onEmergencyNotification,
			onError,
			enableAudio,
			enableToast,
			playNotificationSound,
			showToastNotification,
			updateNotificationCache,
		],
	);

	/**
	 * Subscribe to realtime notifications
	 */
	const subscribe = useCallback(() => {
		if (!enabled || unsubscribeFn) {
			return;
		}

		const realtimeManager = getRealtimeManager();

		let filter = `user_id=eq.${userId}`;
		if (tenantId) {
			filter += `,tenant_id=eq.${tenantId}`;
		}
		if (priority && priority !== "ALL") {
			filter += `,priority=eq.${priority}`;
		}

		const unsubscribe = realtimeManager.subscribe(
			`notifications:${filter}`,
			{
				table: "notifications",
				filter,
			},
			handleNotificationChange,
		);

		setUnsubscribeFn(() => unsubscribe);
		setIsConnected(true);
		setConnectionHealth(100);
	}, [
		enabled,
		tenantId,
		userId,
		priority,
		unsubscribeFn,
		handleNotificationChange,
	]);

	/**
	 * Unsubscribe from realtime notifications
	 */
	const unsubscribe = useCallback(() => {
		if (unsubscribeFn) {
			unsubscribeFn();
			setUnsubscribeFn(null);
			setIsConnected(false);
			setConnectionHealth(0);
		}
	}, [unsubscribeFn]);

	// Auto subscribe/unsubscribe
	useEffect(() => {
		if (enabled) {
			subscribe();
		} else {
			unsubscribe();
		}

		return () => {
			unsubscribe();
		};
	}, [enabled, subscribe, unsubscribe]);

	return {
		isConnected,
		connectionHealth,
		unreadCount,
		lastNotification,
		emergencyCount,
		subscribe,
		unsubscribe,
		playNotificationSound,
	};
}
