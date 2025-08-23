import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { patientApi, patientKeys } from "../lib/api/patients";

// Hook to get all patients
export function usePatients() {
	return useQuery({
		queryKey: patientKeys.lists(),
		queryFn: patientApi.getPatients,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Hook to get a single patient
export function usePatient(id: string) {
	return useQuery({
		queryKey: patientKeys.detail(id),
		queryFn: () => patientApi.getPatient(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Hook to create a new patient
export function useCreatePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: patientApi.createPatient,
		onSuccess: (newPatient) => {
			// Invalidate and refetch patients list
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

			// Optionally add the new patient to the cache
			queryClient.setQueryData(patientKeys.detail(newPatient.id), newPatient);

			toast.success("Paciente criado com sucesso!");
		},
		onError: (_error) => {
			toast.error("Erro ao criar paciente. Tente novamente.");
		},
	});
}

// Hook to update a patient
export function useUpdatePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: patientApi.updatePatient,
		onSuccess: (updatedPatient) => {
			// Update the patient in the cache
			queryClient.setQueryData(
				patientKeys.detail(updatedPatient.id),
				updatedPatient,
			);

			// Invalidate the patients list to refetch
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

			toast.success("Paciente atualizado com sucesso!");
		},
		onError: (_error) => {
			toast.error("Erro ao atualizar paciente. Tente novamente.");
		},
	});
}

// Hook to delete a patient
export function useDeletePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: patientApi.deletePatient,
		onSuccess: (_, deletedId) => {
			// Remove the patient from the cache
			queryClient.removeQueries({ queryKey: patientKeys.detail(deletedId) });

			// Invalidate the patients list to refetch
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

			toast.success("Paciente removido com sucesso!");
		},
		onError: (_error) => {
			toast.error("Erro ao remover paciente. Tente novamente.");
		},
	});
}
