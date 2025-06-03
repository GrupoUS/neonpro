import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];

export const useRealtime = <T extends keyof Tables>(tableName: T, initialData: Tables[T]['Row'][] = []) => {
  const [data, setData] = useState<Tables[T]['Row'][]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channel = supabase
      .channel(`public:${String(tableName)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: String(tableName) },
        (payload) => {
          // Handle inserts, updates, and deletes
          // This is a simplified example, you might need more complex logic
          // based on your specific needs and payload structure
          console.log('Change received!', payload);
          // For simplicity, refetching all data on any change
          supabase.from(tableName).select('*')
            .then(({ data: newData, error: newError }) => {
              if (newError) {
                setError(newError.message);
              } else {
                setData(newData as Tables[T]['Row'][]);
              }
            });
        }
      )
      .subscribe();

    // Initial fetch
    supabase.from(tableName).select('*')
      .then(({ data: initialFetchData, error: initialFetchError }) => {
        if (initialFetchError) {
          setError(initialFetchError.message);
        } else {
          setData(initialFetchData as Tables[T]['Row'][]);
        }
        setLoading(false);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName]);

  return { data, loading, error };
};
