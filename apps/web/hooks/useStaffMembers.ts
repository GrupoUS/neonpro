'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import type { Database } from '@/types/supabase';

type StaffMember = Database['public']['Tables']['staff_members']['Row'];

type StaffHook = {
  staffMembers: StaffMember[];
  activeStaff: StaffMember[];
  staffById: (id: string) => StaffMember | null;
  staffBySpecialty: Record<string, StaffMember[]>;
  totalStaff: number;
  activeStaffCount: number;
  loading: boolean;
  error: Error | null;
  refreshStaff: () => Promise<void>;
};

export function useStaffMembers(): StaffHook {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchStaffMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('staff_members')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setStaffMembers(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Staff ativo
  const activeStaff = useMemo(() => {
    return staffMembers.filter((staff) => staff.status === 'active');
  }, [staffMembers]);

  // Função para buscar staff por ID
  const staffById = useCallback(
    (id: string): StaffMember | null => {
      return staffMembers.find((staff) => staff.id === id) || null;
    },
    [staffMembers]
  );

  // Staff agrupado por especialidade
  const staffBySpecialty = useMemo(() => {
    const grouped: Record<string, StaffMember[]> = {};

    staffMembers.forEach((staff) => {
      const specialty = staff.specialty || 'General';
      if (!grouped[specialty]) {
        grouped[specialty] = [];
      }
      grouped[specialty].push(staff);
    });

    return grouped;
  }, [staffMembers]);

  // Total de funcionários
  const totalStaff = staffMembers.length;

  // Total de funcionários ativos
  const activeStaffCount = activeStaff.length;

  // Função para atualizar a lista de staff
  const refreshStaff = useCallback(async () => {
    await fetchStaffMembers();
  }, [fetchStaffMembers]);

  // Effect para buscar staff
  useEffect(() => {
    fetchStaffMembers();
  }, [fetchStaffMembers]);

  // Setup real-time subscription para staff
  useEffect(() => {
    const channel = supabase
      .channel('staff-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_members',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setStaffMembers((prev) => [...prev, payload.new as StaffMember]);
          } else if (payload.eventType === 'UPDATE') {
            setStaffMembers((prev) =>
              prev.map((staff) =>
                staff.id === payload.new.id
                  ? (payload.new as StaffMember)
                  : staff
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setStaffMembers((prev) =>
              prev.filter((staff) => staff.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  return {
    staffMembers,
    activeStaff,
    staffById,
    staffBySpecialty,
    totalStaff,
    activeStaffCount,
    loading,
    error,
    refreshStaff,
  };
}
