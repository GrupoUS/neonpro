
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  Paciente, 
  CreatePacienteData, 
  UpdatePacienteData, 
  PatientFilters,
  PatientStats 
} from '@/types/patient';

export const usePatients = (filters?: PatientFilters) => {
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar quando a tabela pacientes for criada no banco de dados
      console.log('Pacientes não implementado - tabela não existe no banco de dados');
      setPatients([]);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [filters]);

  const createPatient = async (patientData: CreatePacienteData): Promise<Paciente | null> => {
    try {
      setError(null);

      // TODO: Implementar quando a tabela pacientes for criada no banco de dados
      console.log('Create patient não implementado - tabela não existe no banco de dados');
      return null;
    } catch (err) {
      console.error('Error creating patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar paciente');
      return null;
    }
  };

  const updatePatient = async (patientData: UpdatePacienteData): Promise<Paciente | null> => {
    try {
      setError(null);

      // TODO: Implementar quando a tabela pacientes for criada no banco de dados
      console.log('Update patient não implementado - tabela não existe no banco de dados');
      return null;
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar paciente');
      return null;
    }
  };

  const deletePatient = async (patientId: string): Promise<boolean> => {
    try {
      setError(null);

      // TODO: Implementar quando a tabela pacientes for criada no banco de dados
      console.log('Delete patient não implementado - tabela não existe no banco de dados');
      return false;
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar paciente');
      return false;
    }
  };

  const getPatientById = async (patientId: string): Promise<Paciente | null> => {
    try {
      setError(null);

      // TODO: Implementar quando a tabela pacientes for criada no banco de dados
      console.log('Get patient by ID não implementado - tabela não existe no banco de dados');
      return null;
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar paciente');
      return null;
    }
  };

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    refetch: fetchPatients
  };
};

export const usePatientStats = () => {
  const [stats, setStats] = useState<PatientStats>({
    total: 0,
    ativos: 0,
    inativos: 0,
    novosEstesMes: 0,
    comConvenio: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar quando a tabela pacientes for criada no banco de dados
      console.log('Patient stats não implementado - tabela não existe no banco de dados');

      setStats({
        total: 0,
        ativos: 0,
        inativos: 0,
        novosEstesMes: 0,
        comConvenio: 0
      });
    } catch (err) {
      console.error('Error fetching patient stats:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
