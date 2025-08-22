"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import type { Database } from "@/types/supabase";

type Patient = Database["public"]["Tables"]["patients"]["Row"];

type PatientsHook = {
	patients: Patient[];
	recentPatients: Patient[];
	totalCount: number;
	loading: boolean;
	error: Error | null;
	searchPatients: (query: string) => void;
	getPatientById: (id: string) => Patient | null;
	refreshPatients: () => Promise<void>;
};

export function usePatients(): PatientsHook {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const supabase = createClient();

	const fetchPatients = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			let query = supabase.from("patients").select("*").order("created_at", { ascending: false });

			// Aplicar filtro de busca se existir
			if (searchQuery.trim()) {
				query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
			}

			const { data, error: fetchError } = await query;

			if (fetchError) {
				throw new Error(fetchError.message);
			}

			setPatients(data || []);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	}, [supabase, searchQuery]);

	// Pacientes recentes (últimos 10 criados)
	const recentPatients = useMemo(() => {
		return patients.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
	}, [patients]);

	// Total count
	const totalCount = patients.length;

	// Função para buscar paciente por ID
	const getPatientById = useCallback(
		(id: string): Patient | null => {
			return patients.find((patient) => patient.id === id) || null;
		},
		[patients]
	);

	// Função para pesquisar pacientes
	const searchPatients = useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	// Função para atualizar a lista de pacientes
	const refreshPatients = useCallback(async () => {
		await fetchPatients();
	}, [fetchPatients]);

	// Effect para buscar pacientes
	useEffect(() => {
		fetchPatients();
	}, [fetchPatients]);

	// Setup real-time subscription para pacientes
	useEffect(() => {
		const channel = supabase
			.channel("patients-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "patients",
				},
				(payload) => {
					if (payload.eventType === "INSERT") {
						setPatients((prev) => [payload.new as Patient, ...prev]);
					} else if (payload.eventType === "UPDATE") {
						setPatients((prev) =>
							prev.map((patient) => (patient.id === payload.new.id ? (payload.new as Patient) : patient))
						);
					} else if (payload.eventType === "DELETE") {
						setPatients((prev) => prev.filter((patient) => patient.id !== payload.old.id));
					}
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [supabase]);

	return {
		patients,
		recentPatients,
		totalCount,
		loading,
		error,
		searchPatients,
		getPatientById,
		refreshPatients,
	};
}
