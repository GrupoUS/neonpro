
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Simplified realtime hook for specific table types
export const useRealtime = <T extends Record<string, any>>(
  tableName: string, 
  initialData: T[] = []
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          console.log('Realtime change received!', payload);
          // Refetch data on any change
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from(tableName)
          .select('*');

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(fetchedData as T[] || []);
        }
      } catch (err) {
        setError('Erro ao buscar dados');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName]);

  return { data, loading, error };
};

// Specific hooks for each table to ensure type safety
export const useRealtimeAgendamentos = () => {
  return useRealtime('agendamentos', []);
};

export const useRealtimeClients = () => {
  return useRealtime('clients', []);
};

export const useRealtimeServices = () => {
  return useRealtime('services', []);
};

export const useRealtimeProfessionals = () => {
  return useRealtime('professionals', []);
};

export const useRealtimeTransactions = () => {
  return useRealtime('transactions', []);
};
