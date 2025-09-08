/**
 * 🩺 Patient Hooks - NeonPro Healthcare
 * =====================================
 *
 * Hooks customizados para gerenciamento de pacientes
 * com TanStack Query e integração Hono RPC.
 */

import { apiClient, } from '@neonpro/shared/api-client'
import type {
  CreatePatient,
  PaginatedResponse,
  Patient,
  PatientSearch,
  UpdatePatient,
} from '@neonpro/shared/types'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, } from '@tanstack/react-query'

// Query keys for patients
export const PATIENT_QUERY_KEYS = {
  all: ['patients',] as const,
  lists: () => [...PATIENT_QUERY_KEYS.all, 'list',] as const,
  list: (filters: PatientSearch,) => [...PATIENT_QUERY_KEYS.lists(), filters,] as const,
  details: () => [...PATIENT_QUERY_KEYS.all, 'detail',] as const,
  detail: (id: string,) => [...PATIENT_QUERY_KEYS.details(), id,] as const,
  search: (query: PatientSearch,) => [...PATIENT_QUERY_KEYS.all, 'search', query,] as const,
  stats: () => [...PATIENT_QUERY_KEYS.all, 'stats',] as const,
} as const

// 📋 Get patients list with pagination
export function usePatients(params: PatientSearch = {},) {
  return useQuery({
    queryKey: PATIENT_QUERY_KEYS.list(params,),
    queryFn: async (): Promise<PaginatedResponse<Patient>> => {
      const response = await apiClient.api.v1.patients.$get({
        query: {
          page: params.page?.toString() ?? '1',
          limit: params.limit?.toString() ?? '20',
          query: params.query ?? '',
          gender: params.gender ?? '',
          city: params.city ?? '',
          ...(params.ageRange && {
            minAge: params.ageRange.min.toString(),
            maxAge: params.ageRange.max.toString(),
          }),
        },
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch patients',)
      }

      return result as PaginatedResponse<Patient>
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  },)
}

// 🔍 Infinite scroll patients list
export function usePatientsInfinite(params: Omit<PatientSearch, 'page'> = {},) {
  return useInfiniteQuery({
    queryKey: [...PATIENT_QUERY_KEYS.lists(), 'infinite', params,],
    queryFn: async ({ pageParam = 1, },): Promise<PaginatedResponse<Patient>> => {
      const response = await apiClient.api.v1.patients.$get({
        query: {
          page: pageParam.toString(),
          limit: params.limit?.toString() ?? '20',
          query: params.query ?? '',
          gender: params.gender ?? '',
          city: params.city ?? '',
          ...(params.ageRange && {
            minAge: params.ageRange.min.toString(),
            maxAge: params.ageRange.max.toString(),
          }),
        },
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch patients',)
      }

      return result as PaginatedResponse<Patient>
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage,) => {
      const pagination = lastPage.meta?.pagination
      return pagination?.hasNext ? pagination.page + 1 : undefined
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  },)
}

// 👤 Get single patient by ID
export function usePatient(patientId: string | undefined,) {
  return useQuery({
    queryKey: patientId
      ? PATIENT_QUERY_KEYS.detail(patientId,)
      : ['patients', 'detail', 'unknown',],
    queryFn: async (): Promise<Patient> => {
      if (!patientId) {
        throw new Error('Missing patientId',)
      }
      const response = await apiClient.api.v1.patients[':id'].$get({
        param: { id: patientId, },
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch patient',)
      }

      return result.data as Patient
    },
    enabled: Boolean(patientId,),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },)
}

// ➕ Create patient mutation
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patientData: CreatePatient,): Promise<Patient> => {
      const response = await apiClient.api.v1.patients.$post({
        json: patientData,
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to create patient',)
      }

      return result.data as Patient
    },

    onSuccess: (newPatient,) => {
      // Add to patient lists cache
      queryClient.setQueryData(
        PATIENT_QUERY_KEYS.detail(newPatient.id,),
        newPatient,
      )

      // Invalidate lists to show new patient
      queryClient.invalidateQueries({
        queryKey: PATIENT_QUERY_KEYS.lists(),
      },)

      // Update stats
      queryClient.invalidateQueries({
        queryKey: PATIENT_QUERY_KEYS.stats(),
      },)
    },
  },)
}

// ✏️ Update patient mutation
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: UpdatePatient,): Promise<Patient> => {
      const { id, ...data } = updateData

      const response = await apiClient.api.v1.patients[':id'].$put({
        param: { id, },
        json: data,
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to update patient',)
      }

      return result.data as Patient
    },

    onSuccess: (updatedPatient,) => {
      // Update patient detail cache
      queryClient.setQueryData(
        PATIENT_QUERY_KEYS.detail(updatedPatient.id,),
        updatedPatient,
      )

      // Update patient in lists
      queryClient.setQueriesData(
        { queryKey: PATIENT_QUERY_KEYS.lists(), },
        (old: PaginatedResponse<Patient> | undefined,) => {
          if (!old?.data) {
            return old
          }

          return {
            ...old,
            data: old.data.map((patient,) =>
              patient.id === updatedPatient.id ? updatedPatient : patient
            ),
          }
        },
      )

      // Update infinite queries
      queryClient.setQueriesData(
        { queryKey: [...PATIENT_QUERY_KEYS.lists(), 'infinite',], },
        (old: unknown,) => {
          if (!old?.pages) {
            return old
          }

          return {
            ...old,
            pages: old.pages.map((page: PaginatedResponse<Patient>,) => ({
              ...page,
              data: page.data?.map((patient,) =>
                patient.id === updatedPatient.id ? updatedPatient : patient
              ),
            })),
          }
        },
      )
    },
  },)
}

// 🗑️ Delete patient mutation
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patientId: string,): Promise<void> => {
      const response = await apiClient.api.v1.patients[':id'].$delete({
        param: { id: patientId, },
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete patient',)
      }
    },

    onSuccess: (_, deletedPatientId,) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: PATIENT_QUERY_KEYS.detail(deletedPatientId,),
      },)

      // Remove from lists
      queryClient.setQueriesData(
        { queryKey: PATIENT_QUERY_KEYS.lists(), },
        (old: PaginatedResponse<Patient> | undefined,) => {
          if (!old?.data) {
            return old
          }

          return {
            ...old,
            data: old.data.filter((patient,) => patient.id !== deletedPatientId),
            meta: {
              ...old.meta,
              total: (old.meta?.total ?? 0) - 1,
            },
          }
        },
      )

      // Update infinite queries
      queryClient.setQueriesData(
        { queryKey: [...PATIENT_QUERY_KEYS.lists(), 'infinite',], },
        (old: unknown,) => {
          if (!old?.pages) {
            return old
          }

          return {
            ...old,
            pages: old.pages.map((page: PaginatedResponse<Patient>,) => ({
              ...page,
              data: page.data?.filter(
                (patient,) => patient.id !== deletedPatientId,
              ) ?? [],
              meta: {
                ...page.meta,
                total: (page.meta?.total ?? 0) - 1,
              },
            })),
          }
        },
      )

      // Update stats
      queryClient.invalidateQueries({
        queryKey: PATIENT_QUERY_KEYS.stats(),
      },)
    },
  },)
}

// 🔍 Search patients with debouncing
export function useSearchPatients(searchParams: PatientSearch,) {
  return useQuery({
    queryKey: PATIENT_QUERY_KEYS.search(searchParams,),
    queryFn: async (): Promise<PaginatedResponse<Patient>> => {
      const response = await apiClient.api.v1.patients.search.$get({
        query: {
          query: searchParams.query ?? '',
          page: searchParams.page?.toString() ?? '1',
          limit: searchParams.limit?.toString() ?? '20',
          gender: searchParams.gender ?? '',
          city: searchParams.city ?? '',
          ...(searchParams.ageRange && {
            minAge: searchParams.ageRange.min.toString(),
            maxAge: searchParams.ageRange.max.toString(),
          }),
        },
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to search patients',)
      }

      return result as PaginatedResponse<Patient>
    },
    enabled: Boolean(searchParams.query && searchParams.query.length >= 2,),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 3, // 3 minutes
  },)
}

// 📊 Patient statistics
export function usePatientsStats() {
  return useQuery({
    queryKey: PATIENT_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await apiClient.api.v1.patients.stats.$get()
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch patient stats',)
      }

      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },)
}

// 📥 Export patients
export function useExportPatients() {
  return useMutation({
    mutationFn: async (params: {
      format: 'csv' | 'xlsx' | 'pdf'
      filters?: PatientSearch
    },) => {
      const response = await apiClient.api.v1.patients.export.$post({
        json: {
          format: params.format,
          filters: params.filters ?? {},
        },
      },)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to export patients',)
      }

      return result.data
    },
  },)
}

// 🔧 Patient utilities
export function usePatientUtils() {
  const queryClient = useQueryClient()

  return {
    // Prefetch patient details
    prefetchPatient: async (patientId: string,) => {
      await queryClient.prefetchQuery({
        queryKey: PATIENT_QUERY_KEYS.detail(patientId,),
        queryFn: async () => {
          const response = await apiClient.api.v1.patients[':id'].$get({
            param: { id: patientId, },
          },)
          const result = await response.json()
          return result.data
        },
        staleTime: 1000 * 60 * 5,
      },)
    },

    // Invalidate all patient queries
    invalidateAllPatients: () => {
      queryClient.invalidateQueries({
        queryKey: PATIENT_QUERY_KEYS.all,
      },)
    },

    // Update patient in cache
    updatePatientCache: (
      patientId: string,
      updater: (old: Patient | undefined,) => Patient | undefined,
    ) => {
      queryClient.setQueryData(PATIENT_QUERY_KEYS.detail(patientId,), updater,)
    },
  }
}
