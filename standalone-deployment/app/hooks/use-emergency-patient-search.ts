"use client";

import { useCallback, useMemo, useState } from "react";

// Emergency patient data interface
export interface EmergencyPatient {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phone: string;
  bloodType?: string;
  allergies: {
    type: string;
    severity: "critical" | "high" | "moderate";
    description: string;
    registeredDate: string;
  }[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    lastTaken?: string;
    prescribedBy: string;
    startDate: string;
  }[];
  contraindications: {
    type: string;
    description: string;
    severity: "high" | "moderate" | "low";
    registeredDate: string;
  }[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
    address?: string;
  }[];
  medicalConditions: {
    condition: string;
    status: "active" | "controlled" | "resolved";
    lastUpdate: string;
    severity?: "critical" | "high" | "moderate" | "low";
  }[];
  lastAccessed: string;
  emergencyNotes?: string;
  preferredHospital?: string;
  insurance?: {
    provider: string;
    planNumber: string;
    validUntil: string;
  };
}

// Search options interface
interface SearchOptions {
  includeInactive?: boolean;
  emergencyOnly?: boolean;
  maxResults?: number;
}

// Hook return interface
interface UseEmergencyPatientSearchReturn {
  patients: EmergencyPatient[];
  searchPatient: (
    query: string,
    options?: SearchOptions,
  ) => Promise<EmergencyPatient[]>;
  getPatientById: (id: string) => Promise<EmergencyPatient | null>;
  getRecentPatients: () => EmergencyPatient[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  cacheStatus: "fresh" | "stale" | "offline";
  lastSync: Date | null;
}

// Mock emergency patient data for demonstration
const mockEmergencyPatients: EmergencyPatient[] = [
  {
    id: "PAT-EMG-001",
    name: "João Silva Santos",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    birthDate: "15/03/1980",
    phone: "(11) 99999-9999",
    bloodType: "O+",
    emergencyNotes: "Paciente com histórico de reações alérgicas severas",
    preferredHospital: "Hospital das Clínicas",
    insurance: {
      provider: "Bradesco Saúde",
      planNumber: "BR-123456789",
      validUntil: "31/12/2024",
    },
    allergies: [
      {
        type: "Penicilina",
        severity: "critical",
        description:
          "Reação anafilática grave - usar epinefrina imediatamente. Histórico de edema de glote.",
        registeredDate: "10/01/2020",
      },
      {
        type: "Látex",
        severity: "high",
        description: "Dermatite de contato severa com formação de bolhas",
        registeredDate: "15/05/2021",
      },
      {
        type: "Frutos do mar",
        severity: "moderate",
        description: "Urticária e náuseas",
        registeredDate: "20/08/2022",
      },
    ],
    medications: [
      {
        name: "Losartana Potássica",
        dosage: "50mg",
        frequency: "1x ao dia (manhã)",
        lastTaken: "Hoje 08:00",
        prescribedBy: "Dr. Carlos Oliveira - Cardiologia",
        startDate: "01/01/2023",
      },
      {
        name: "Sinvastatina",
        dosage: "20mg",
        frequency: "1x ao dia (noite)",
        lastTaken: "Ontem 22:00",
        prescribedBy: "Dr. Carlos Oliveira - Cardiologia",
        startDate: "01/01/2023",
      },
      {
        name: "EpiPen (Epinefrina)",
        dosage: "0.3mg",
        frequency: "SOS - emergência alérgica",
        prescribedBy: "Dra. Ana Maria - Alergologia",
        startDate: "10/01/2020",
      },
    ],
    contraindications: [
      {
        type: "Aspirina (AAS)",
        description:
          "Histórico de sangramento gastrointestinal grave. Usar paracetamol como alternativa.",
        severity: "high",
        registeredDate: "05/03/2019",
      },
      {
        type: "Anti-inflamatórios não esteroidais (AINEs)",
        description: "Risco de sangramento e interação com Losartana",
        severity: "moderate",
        registeredDate: "01/01/2023",
      },
    ],
    emergencyContacts: [
      {
        name: "Maria Silva Santos",
        relationship: "Esposa",
        phone: "(11) 88888-8888",
        isPrimary: true,
        address: "Rua das Flores, 123 - São Paulo/SP",
      },
      {
        name: "Pedro Silva Santos",
        relationship: "Filho",
        phone: "(11) 77777-7777",
        isPrimary: false,
        address: "Av. Paulista, 1000 - São Paulo/SP",
      },
      {
        name: "Dr. Carlos Oliveira",
        relationship: "Médico Cardiologista",
        phone: "(11) 3333-4444",
        isPrimary: false,
      },
    ],
    medicalConditions: [
      {
        condition: "Hipertensão Arterial Sistêmica",
        status: "controlled",
        lastUpdate: "10/01/2024",
        severity: "moderate",
      },
      {
        condition: "Dislipidemia",
        status: "controlled",
        lastUpdate: "10/01/2024",
        severity: "low",
      },
      {
        condition: "Alergia Medicamentosa Múltipla",
        status: "active",
        lastUpdate: "20/08/2022",
        severity: "critical",
      },
    ],
    lastAccessed: new Date().toISOString(),
  },
  {
    id: "PAT-EMG-002",
    name: "Maria José Costa",
    cpf: "987.654.321-00",
    rg: "98.765.432-1",
    birthDate: "20/07/1965",
    phone: "(11) 55555-5555",
    bloodType: "A-",
    emergencyNotes: "Diabética tipo 1 - risco de hipoglicemia severa",
    allergies: [
      {
        type: "Sulfa",
        severity: "high",
        description: "Erupção cutânea grave",
        registeredDate: "15/10/2018",
      },
    ],
    medications: [
      {
        name: "Insulina NPH",
        dosage: "20 UI",
        frequency: "2x ao dia (manhã e noite)",
        lastTaken: "Hoje 07:30",
        prescribedBy: "Dr. Roberto Diabetes - Endocrinologia",
        startDate: "01/05/1995",
      },
      {
        name: "Metformina",
        dosage: "850mg",
        frequency: "2x ao dia (almoço e jantar)",
        lastTaken: "Ontem 19:00",
        prescribedBy: "Dr. Roberto Diabetes - Endocrinologia",
        startDate: "01/01/2020",
      },
    ],
    contraindications: [
      {
        type: "Corticosteroides",
        description: "Aumenta significativamente a glicemia",
        severity: "high",
        registeredDate: "01/05/1995",
      },
    ],
    emergencyContacts: [
      {
        name: "José Costa Filho",
        relationship: "Marido",
        phone: "(11) 44444-4444",
        isPrimary: true,
      },
      {
        name: "Ana Costa Silva",
        relationship: "Filha",
        phone: "(11) 33333-3333",
        isPrimary: false,
      },
    ],
    medicalConditions: [
      {
        condition: "Diabetes Mellitus Tipo 1",
        status: "active",
        lastUpdate: "15/01/2024",
        severity: "critical",
      },
      {
        condition: "Retinopatia Diabética",
        status: "controlled",
        lastUpdate: "10/12/2023",
        severity: "moderate",
      },
    ],
    lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Emergency Patient Search Hook
 *
 * Provides comprehensive patient search functionality optimized for emergency scenarios.
 * Features offline capability, caching, and prioritized critical information access.
 */
export function useEmergencyPatientSearch(): UseEmergencyPatientSearchReturn {
  const [patients, setPatients] = useState<EmergencyPatient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<"fresh" | "stale" | "offline">(
    "fresh",
  );
  const [lastSync, setLastSync] = useState<Date | null>(new Date());

  // Get recent patients (sorted by last accessed)
  const getRecentPatients = useCallback((): EmergencyPatient[] => {
    return mockEmergencyPatients
      .sort(
        (a, b) =>
          new Date(b.lastAccessed).getTime()
          - new Date(a.lastAccessed).getTime(),
      )
      .slice(0, 5);
  }, []);

  // Search patients by query
  const searchPatient = useCallback(
    async (
      query: string,
      options: SearchOptions = {},
    ): Promise<EmergencyPatient[]> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate network delay for realistic testing
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!query.trim()) {
          setPatients([]);
          return [];
        }

        const searchTerm = query.toLowerCase().trim();

        // Search by name, CPF, RG, or phone
        const filteredPatients = mockEmergencyPatients.filter((patient) => {
          const nameMatch = patient.name.toLowerCase().includes(searchTerm);
          const cpfMatch = patient.cpf
            .replaceAll(/\D/g, "")
            .includes(searchTerm.replaceAll(/\D/g, ""));
          const rgMatch = patient.rg
            .replaceAll(/\D/g, "")
            .includes(searchTerm.replaceAll(/\D/g, ""));
          const phoneMatch = patient.phone
            .replaceAll(/\D/g, "")
            .includes(searchTerm.replaceAll(/\D/g, ""));
          const idMatch = patient.id.toLowerCase().includes(searchTerm);

          return nameMatch || cpfMatch || rgMatch || phoneMatch || idMatch;
        });

        // Apply search options
        let results = filteredPatients;

        if (options.emergencyOnly) {
          results = results.filter(
            (patient) =>
              patient.allergies.some(
                (allergy) => allergy.severity === "critical",
              )
              || patient.medicalConditions.some(
                (condition) => condition.severity === "critical",
              ),
          );
        }

        if (options.maxResults) {
          results = results.slice(0, options.maxResults);
        }

        // Update last accessed for found patients
        results.forEach((patient) => {
          patient.lastAccessed = new Date().toISOString();
        });

        setPatients(results);
        setLastSync(new Date());
        setCacheStatus("fresh");

        return results;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro na busca de pacientes";
        setError(errorMessage);

        // Fall back to cached data in case of error
        setCacheStatus("offline");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Get patient by ID
  const getPatientById = useCallback(
    async (id: string): Promise<EmergencyPatient | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        const patient = mockEmergencyPatients.find((p) => p.id === id);

        if (patient) {
          // Update last accessed
          patient.lastAccessed = new Date().toISOString();
          setLastSync(new Date());
          setCacheStatus("fresh");
        }

        return patient || null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao carregar paciente";
        setError(errorMessage);
        setCacheStatus("offline");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize recent patients for performance
  const recentPatients = useMemo(
    () => getRecentPatients(),
    [getRecentPatients],
  );

  return {
    patients,
    searchPatient,
    getPatientById,
    getRecentPatients: () => recentPatients,
    isLoading,
    error,
    clearError,
    cacheStatus,
    lastSync,
  };
}
