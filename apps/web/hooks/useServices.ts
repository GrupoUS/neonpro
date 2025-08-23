"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import type { Database } from "@/types/supabase";

type Service = Database["public"]["Tables"]["services"]["Row"];

type ServicesHook = {
	services: Service[];
	activeServices: Service[];
	servicesByCategory: Record<string, Service[]>;
	serviceById: (id: string) => Service | null;
	popularServices: Service[];
	totalServices: number;
	activeServicesCount: number;
	loading: boolean;
	error: Error | null;
	refreshServices: () => Promise<void>;
};

export function useServices(): ServicesHook {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const supabase = createClient();

	const fetchServices = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const { data, error: fetchError } = await supabase
				.from("services")
				.select("*")
				.order("name", { ascending: true });

			if (fetchError) {
				throw new Error(fetchError.message);
			}

			setServices(data || []);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	// Serviços ativos
	const activeServices = useMemo(() => {
		return services.filter((service) => service.status === "active");
	}, [services]);

	// Serviços agrupados por categoria
	const servicesByCategory = useMemo(() => {
		const grouped: Record<string, Service[]> = {};

		services.forEach((service) => {
			const category = service.category || "General";
			if (!grouped[category]) {
				grouped[category] = [];
			}
			grouped[category].push(service);
		});

		return grouped;
	}, [services]);

	// Função para buscar serviço por ID
	const serviceById = useCallback(
		(id: string): Service | null => {
			return services.find((service) => service.id === id) || null;
		},
		[services],
	);

	// Serviços mais populares (baseado no preço mais alto, poderia ser baseado em uso)
	const popularServices = useMemo(() => {
		return activeServices
			.sort((a, b) => (b.price || 0) - (a.price || 0))
			.slice(0, 5);
	}, [activeServices]);

	// Total de serviços
	const totalServices = services.length;

	// Total de serviços ativos
	const activeServicesCount = activeServices.length;

	// Função para atualizar a lista de serviços
	const refreshServices = useCallback(async () => {
		await fetchServices();
	}, [fetchServices]);

	// Effect para buscar serviços
	useEffect(() => {
		fetchServices();
	}, [fetchServices]);

	// Setup real-time subscription para serviços
	useEffect(() => {
		const channel = supabase
			.channel("services-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "services",
				},
				(payload) => {
					if (payload.eventType === "INSERT") {
						setServices((prev) => [...prev, payload.new as Service]);
					} else if (payload.eventType === "UPDATE") {
						setServices((prev) =>
							prev.map((service) =>
								service.id === payload.new.id
									? (payload.new as Service)
									: service,
							),
						);
					} else if (payload.eventType === "DELETE") {
						setServices((prev) =>
							prev.filter((service) => service.id !== payload.old.id),
						);
					}
				},
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [supabase]);

	return {
		services,
		activeServices,
		servicesByCategory,
		serviceById,
		popularServices,
		totalServices,
		activeServicesCount,
		loading,
		error,
		refreshServices,
	};
}
