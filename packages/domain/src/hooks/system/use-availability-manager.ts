"use client";

import { useCallback, useEffect, useState } from "react";

export type TimeSlot = {
	id: string;
	professional_id: string;
	service_id: string;
	date: string;
	start_time: string;
	end_time: string;
	is_available: boolean;
	price?: number;
};

export type UseAvailabilityManagerOptions = {
	professionalId?: string;
	serviceId?: string;
	dateRange?: { start: Date; end: Date };
};

export type UseAvailabilityManagerReturn = {
	slots: TimeSlot[];
	isLoading: boolean;
	error: string | null;
	createSlot: (slot: Omit<TimeSlot, "id">) => Promise<string | null>;
	updateSlot: (slotId: string, updates: Partial<TimeSlot>) => Promise<boolean>;
	deleteSlot: (slotId: string) => Promise<boolean>;
	generateSlots: (pattern: any) => Promise<TimeSlot[]>;
	refreshSlots: () => Promise<void>;
};

export function useAvailabilityManager(
	options: UseAvailabilityManagerOptions = {},
): UseAvailabilityManagerReturn {
	const [slots, setSlots] = useState<TimeSlot[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refreshSlots = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			// Placeholder implementation
			const mockSlots: TimeSlot[] = [
				{
					id: "1",
					professional_id: options.professionalId || "prof-1",
					service_id: options.serviceId || "service-1",
					date: new Date().toISOString().split("T")[0],
					start_time: "09:00",
					end_time: "10:00",
					is_available: true,
					price: 100,
				},
			];

			setSlots(mockSlots);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to refresh slots";
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [options.professionalId, options.serviceId]);

	const createSlot = useCallback(
		async (slot: Omit<TimeSlot, "id">): Promise<string | null> => {
			try {
				const newId = `slot-${Date.now()}`;
				const newSlot: TimeSlot = { ...slot, id: newId };
				setSlots((prev) => [...prev, newSlot]);
				return newId;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to create slot";
				setError(errorMessage);
				return null;
			}
		},
		[],
	);

	const updateSlot = useCallback(
		async (slotId: string, updates: Partial<TimeSlot>): Promise<boolean> => {
			try {
				setSlots((prev) =>
					prev.map((slot) =>
						slot.id === slotId ? { ...slot, ...updates } : slot,
					),
				);
				return true;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to update slot";
				setError(errorMessage);
				return false;
			}
		},
		[],
	);

	const deleteSlot = useCallback(async (slotId: string): Promise<boolean> => {
		try {
			setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
			return true;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to delete slot";
			setError(errorMessage);
			return false;
		}
	}, []);

	const generateSlots = useCallback(
		async (_pattern: any): Promise<TimeSlot[]> => {
			try {
				// Placeholder implementation
				const generatedSlots: TimeSlot[] = [
					{
						id: `generated-${Date.now()}`,
						professional_id: options.professionalId || "prof-1",
						service_id: options.serviceId || "service-1",
						date: new Date().toISOString().split("T")[0],
						start_time: "09:00",
						end_time: "10:00",
						is_available: true,
						price: 100,
					},
				];

				setSlots((prev) => [...prev, ...generatedSlots]);
				return generatedSlots;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to generate slots";
				setError(errorMessage);
				return [];
			}
		},
		[options.professionalId, options.serviceId],
	);

	// Initialize data
	useEffect(() => {
		refreshSlots();
	}, [refreshSlots]);

	return {
		slots,
		isLoading,
		error,
		createSlot,
		updateSlot,
		deleteSlot,
		generateSlots,
		refreshSlots,
	};
}
