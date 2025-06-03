import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

      let query = supabase
        .from('pacientes')
        .select('*')
        .order('nome');

      // Apply filters
      if (filters?.search) {
        query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%,telefone.ilike.%${filters.search}%`);
      }

      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      if (filters?.convenio) {
        query = query.eq('convenio', filters.convenio);
      }

      if (filters?.dataInicio) {
        query = query.gte('created_at', filters.dataInicio);
      }

      if (filters?.dataFim) {
        query = query.lte('created_at', filters.dataFim);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPatients(data || []);
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

      const { data, error } = await supabase
        .from('pacientes')
        .insert([{ ...patientData, ativo: patientData.ativo ?? true }])
        .select()
        .single();

      if (error) throw error;

      await fetchPatients(); // Refresh list
      return data;
    } catch (err) {
      console.error('Error creating patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar paciente');
      return null;
    }
  };

  const updatePatient = async (patientData: UpdatePacienteData): Promise<Paciente | null> => {
    try {
      setError(null);

      const { id, ...updateData } = patientData;
      const { data, error } = await supabase
        .from('pacientes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchPatients(); // Refresh list
      return data;
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar paciente');
      return null;
    }
  };

  const deletePatient = async (patientId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      await fetchPatients(); // Refresh list
      return true;
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar paciente');
      return false;
    }
  };

  const getPatientById = async (patientId: string): Promise<Paciente | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;

      return data;
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

      // Get total patients
      const { count: total } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true });

      // Get active patients
      const { count: ativos } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Get patients with insurance
      const { count: comConvenio } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .not('convenio', 'is', null);

      // Get new patients this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: novosEstesMes } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        total: total || 0,
        ativos: ativos || 0,
        inativos: (total || 0) - (ativos || 0),
        novosEstesMes: novosEstesMes || 0,
        comConvenio: comConvenio || 0
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
