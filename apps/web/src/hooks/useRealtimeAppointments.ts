import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RealtimeService, RealtimePayload } from '@neonpro/core';
import { createEdgeClient } from '@neonpro/database';

export const useRealtimeAppointments = (clinicId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!clinicId) return;
    
    const supabase = createEdgeClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const realtime = new RealtimeService(supabase);
    
    const channel = realtime.subscribeToAppointments(clinicId, (payload: RealtimePayload) => {
      queryClient.setQueryData(['appointments', clinicId], (old: any[]) => {
        if (!old) return [];
        
        switch (payload.eventType) {
          case 'INSERT':
            return [...old, payload.new];
          case 'UPDATE':
            return old.map(item => 
              item.id === payload.new.id ? payload.new : item
            );
          case 'DELETE':
            return old.filter(item => item.id !== payload.old.id);
          default:
            return old;
        }
      });
    });
    
    return () => {
      realtime.unsubscribe(`appointments-${clinicId}`);
    };
  }, [clinicId, queryClient]);
};

export const useRealtimeMessages = (clinicId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!clinicId) return;
    
    const supabase = createEdgeClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const realtime = new RealtimeService(supabase);
    
    const channel = realtime.subscribeToMessages(clinicId, (payload: RealtimePayload) => {
      queryClient.setQueryData(['messages', clinicId], (old: any[]) => {
        if (!old) return [payload.new];
        return [payload.new, ...old];
      });
    });
    
    return () => {
      realtime.unsubscribe(`messages-${clinicId}`);
    };
  }, [clinicId, queryClient]);
};