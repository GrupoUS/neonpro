'use client'

import { useCallback, useEffect, useState, } from 'react'

interface Patient {
  id: string
  clinic_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth: string
  cpf?: string
  gender?: 'male' | 'female' | 'other'
  address?: {
    street: string
    city: string
    state: string
    zip_code: string
  }
  medical_history?: string[]
  allergies?: string[]
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  created_at: string
  updated_at: string
  last_visit?: string
  next_appointment?: string
}

interface PatientFilters {
  searchTerm?: string
  gender?: Patient['gender']
  ageRange?: {
    min: number
    max: number
  }
  lastVisit?: {
    from: string
    to: string
  }
}

interface UsePatientReturn {
  patients: Patient[]
  isLoading: boolean
  error: string | null
  totalCount: number
  fetchPatients: (filters?: PatientFilters,) => Promise<void>
  createPatient: (
    patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>,
  ) => Promise<Patient>
  updatePatient: (id: string, updates: Partial<Patient>,) => Promise<Patient>
  deletePatient: (id: string,) => Promise<void>
  getPatient: (id: string,) => Patient | undefined
}

export function usePatients(clinicId?: string,): UsePatientReturn {
  const [patients, setPatients,] = useState<Patient[]>([],)
  const [isLoading, setIsLoading,] = useState(false,)
  const [error, setError,] = useState<string | null>(null,)
  const [totalCount, setTotalCount,] = useState(0,)

  const fetchPatients = useCallback(
    async (filters?: PatientFilters,) => {
      if (!clinicId) {
        return
      }

      try {
        setIsLoading(true,)
        setError(null,)

        // TODO: Implement actual API call to fetch patients
        // const response = await api.patients.list({
        //   clinic_id: clinicId,
        //   ...filters,
        // });

        // Mock implementation for now
        const mockPatients: Patient[] = [
          {
            id: 'patient-1',
            clinic_id: clinicId,
            first_name: 'Maria',
            last_name: 'Silva',
            email: 'maria.silva@email.com',
            phone: '+55 (11) 99999-1111',
            date_of_birth: '1985-03-15',
            cpf: '123.456.789-01',
            gender: 'female',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_visit: '2024-08-15',
          },
          {
            id: 'patient-2',
            clinic_id: clinicId,
            first_name: 'João',
            last_name: 'Santos',
            email: 'joao.santos@email.com',
            phone: '+55 (11) 99999-2222',
            date_of_birth: '1978-07-22',
            cpf: '987.654.321-01',
            gender: 'male',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_visit: '2024-08-10',
          },
        ]

        // Apply filters to mock data
        let filteredPatients = mockPatients

        if (filters?.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase()
          filteredPatients = filteredPatients.filter(
            (patient,) =>
              patient.first_name.toLowerCase().includes(searchLower,)
              || patient.last_name.toLowerCase().includes(searchLower,)
              || patient.email?.toLowerCase().includes(searchLower,)
              || patient.phone?.includes(searchLower,),
          )
        }

        setPatients(filteredPatients,)
        setTotalCount(filteredPatients.length,)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch patients',
        )
      } finally {
        setIsLoading(false,)
      }
    },
    [clinicId,],
  )

  const createPatient = useCallback(
    async (
      patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>,
    ): Promise<Patient> => {
      try {
        setIsLoading(true,)
        setError(null,)

        // TODO: Implement actual API call to create patient
        // const response = await api.patients.create(patientData);

        // Mock implementation
        const newPatient: Patient = {
          ...patientData,
          id: `patient-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setPatients((prev,) => [newPatient, ...prev,])
        setTotalCount((prev,) => prev + 1)

        return newPatient
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create patient'
        setError(errorMessage,)
        throw new Error(errorMessage,)
      } finally {
        setIsLoading(false,)
      }
    },
    [],
  )

  const updatePatient = useCallback(
    async (id: string, updates: Partial<Patient>,): Promise<Patient> => {
      try {
        setIsLoading(true,)
        setError(null,)

        // TODO: Implement actual API call to update patient
        // const response = await api.patients.update(id, updates);

        // Mock implementation
        setPatients((prev,) =>
          prev.map((patient,) =>
            patient.id === id
              ? { ...patient, ...updates, updated_at: new Date().toISOString(), }
              : patient
          )
        )

        const updatedPatient = patients.find((p,) => p.id === id)
        if (!updatedPatient) {
          throw new Error('Patient not found',)
        }

        return {
          ...updatedPatient,
          ...updates,
          updated_at: new Date().toISOString(),
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update patient'
        setError(errorMessage,)
        throw new Error(errorMessage,)
      } finally {
        setIsLoading(false,)
      }
    },
    [patients,],
  )

  const deletePatient = useCallback(async (id: string,): Promise<void> => {
    try {
      setIsLoading(true,)
      setError(null,)

      // TODO: Implement actual API call to delete patient
      // await api.patients.delete(id);

      // Mock implementation
      setPatients((prev,) => prev.filter((patient,) => patient.id !== id))
      setTotalCount((prev,) => prev - 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient'
      setError(errorMessage,)
      throw new Error(errorMessage,)
    } finally {
      setIsLoading(false,)
    }
  }, [],)

  const getPatient = useCallback(
    (id: string,): Patient | undefined => {
      return patients.find((patient,) => patient.id === id)
    },
    [patients,],
  )

  // Load patients on mount if clinicId is provided
  useEffect(() => {
    if (clinicId) {
      fetchPatients()
    }
  }, [clinicId, fetchPatients,],)

  return {
    patients,
    isLoading,
    error,
    totalCount,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatient,
  }
}
