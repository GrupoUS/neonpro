import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
  errors: any[];
}

export class RealtimeService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  subscribeToAppointments(
    clinicId: string, 
    callback: (payload: RealtimePayload) => void
  ): RealtimeChannel {
    const channel = this.supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`,
        },
        callback
      )
      .subscribe();
    
    this.subscriptions.set(`appointments-${clinicId}`, channel);
    return channel;
  }

  subscribeToMessages(
    clinicId: string,
    callback: (payload: RealtimePayload) => void
  ): RealtimeChannel {
    const channel = this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `clinic_id=eq.${clinicId}`,
        },
        callback
      )
      .subscribe();
    
    this.subscriptions.set(`messages-${clinicId}`, channel);
    return channel;
  }

  subscribeToLeads(
    clinicId: string,
    callback: (payload: RealtimePayload) => void
  ): RealtimeChannel {
    const channel = this.supabase
      .channel('leads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `clinic_id=eq.${clinicId}`,
        },
        callback
      )
      .subscribe();
    
    this.subscriptions.set(`leads-${clinicId}`, channel);
    return channel;
  }

  unsubscribe(key: string): void {
    const channel = this.subscriptions.get(key);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();
  }
}