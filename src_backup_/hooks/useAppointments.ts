import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  Agendamento, 
  CreateAgendamentoData, 
  UpdateAgendamentoData, 
  AgendamentoFilters 
} from '@/types/appointment';

export const useAppointments = (filters?: AgendamentoFilters) => {
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments with optional filters
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          paciente:pacientes(
            id,
            nome,
            telefone,
            email
          )
        `)
        .order('data_agendamento', { ascending: true })
        .order('hora_inicio', { ascending: true });

      // Apply filters
      if (filters?.data_inicio) {
        query = query.gte('data_agendamento', filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte('data_agendamento', filters.data_fim);
      }
      if (filters?.medico_nome) {
        query = query.ilike('medico_nome', `%${filters.medico_nome}%`);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.tipo_consulta) {
        query = query.eq('tipo_consulta', filters.tipo_consulta);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Filter by patient name if specified (since it's a joined field)
      let filteredData = data || [];
      if (filters?.paciente_nome) {
        filteredData = filteredData.filter(appointment => 
          appointment.paciente?.nome?.toLowerCase().includes(filters.paciente_nome!.toLowerCase())
        );
      }

      setAppointments(filteredData);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create new appointment
  const createAppointment = useCallback(async (data: CreateAgendamentoData): Promise<Agendamento | null> => {
    try {
      setError(null);

      const { data: newAppointment, error } = await supabase
        .from('agendamentos')
        .insert([data])
        .select(`
          *,
          paciente:pacientes(
            id,
            nome,
            telefone,
            email
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      if (newAppointment) {
        setAppointments(prev => [...prev, newAppointment]);
        return newAppointment;
      }

      return null;
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
      return null;
    }
  }, []);

  // Update existing appointment
  const updateAppointment = useCallback(async (data: UpdateAgendamentoData): Promise<Agendamento | null> => {
    try {
      setError(null);

      const { id, ...updateData } = data;

      const { data: updatedAppointment, error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          paciente:pacientes(
            id,
            nome,
            telefone,
            email
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      if (updatedAppointment) {
        setAppointments(prev => 
          prev.map(appointment => 
            appointment.id === id ? updatedAppointment : appointment
          )
        );
        return updatedAppointment;
      }

      return null;
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar agendamento');
      return null;
    }
  }, []);

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir agendamento');
      return false;
    }
  }, []);

  // Get appointments for a specific date
  const getAppointmentsByDate = useCallback((date: string) => {
    return appointments.filter(appointment => appointment.data_agendamento === date);
  }, [appointments]);

  // Get appointments for today
  const getTodaysAppointments = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointmentsByDate(today);
  }, [getAppointmentsByDate]);

  // Check for time conflicts when scheduling
  const checkTimeConflict = useCallback((
    date: string, 
    startTime: string, 
    endTime: string, 
    excludeId?: string
  ): boolean => {
    const dayAppointments = appointments.filter(apt => 
      apt.data_agendamento === date && 
      apt.id !== excludeId &&
      apt.status !== 'cancelado'
    );

    return dayAppointments.some(apt => {
      const aptStart = apt.hora_inicio;
      const aptEnd = apt.hora_fim;
      
      // Check if times overlap
      return (
        (startTime >= aptStart && startTime < aptEnd) ||
        (endTime > aptStart && endTime <= aptEnd) ||
        (startTime <= aptStart && endTime >= aptEnd)
      );
    });
  }, [appointments]);

  // Get statistics
  const getStatistics = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

    return {
      total: appointments.length,
      today: appointments.filter(apt => apt.data_agendamento === today).length,
      thisMonth: appointments.filter(apt => apt.data_agendamento.startsWith(thisMonth)).length,
      byStatus: {
        agendado: appointments.filter(apt => apt.status === 'agendado').length,
        confirmado: appointments.filter(apt => apt.status === 'confirmado').length,
        em_andamento: appointments.filter(apt => apt.status === 'em_andamento').length,
        concluido: appointments.filter(apt => apt.status === 'concluido').length,
        cancelado: appointments.filter(apt => apt.status === 'cancelado').length,
        faltou: appointments.filter(apt => apt.status === 'faltou').length,
      },
      byType: {
        consulta: appointments.filter(apt => apt.tipo_consulta === 'consulta').length,
        retorno: appointments.filter(apt => apt.tipo_consulta === 'retorno').length,
        procedimento: appointments.filter(apt => apt.tipo_consulta === 'procedimento').length,
        emergencia: appointments.filter(apt => apt.tipo_consulta === 'emergencia').length,
      }
    };
  }, [appointments]);

  // Load appointments on mount and when filters change
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    
    // CRUD operations
    createAppointment,
    updateAppointment,
    deleteAppointment,
    
    // Utility functions
    refetch: fetchAppointments,
    getAppointmentsByDate,
    getTodaysAppointments,
    checkTimeConflict,
    getStatistics,
  };
};

export default useAppointments;
