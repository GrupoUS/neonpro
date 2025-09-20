/**
 * AI Data Service
 * Handles database operations for AI agent queries with RLS enforcement
 */

import {
  AgentError,
  AppointmentData,
  ClientData,
  DataAccessError,
  FinancialData,
  QueryIntent,
} from '@neonpro/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class AIDataService {
  private supabase: SupabaseClient;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          persistSession: false,
        },
      },
    );
  }

  // =====================================
  // Client Operations
  // =====================================

  /**
   * Search patients by name with fuzzy matching
   */
  async getClientsByName(
    name: string,
    context?: { userId?: string; domain?: string; limit?: number },
  ): Promise<ClientData[]> {
    const cacheKey = `patients:${name}:${context?.domain || 'default'}:${context?.limit || 10}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.supabase
        .from('patients')
        .select(
          `
          id,
          full_name,
          email,
          phone,
          cpf,
          birth_date,
          clinic_id,
          lgpd_consent_given,
          created_at,
          updated_at
        `,
        )
        .ilike('full_name', `%${name}%`)
        .limit(context?.limit || 10);

      // Apply clinic filter (domain maps to clinic_id in multi-tenant setup)
      if (context?.domain) {
        query = query.eq('clinic_id', context.domain);
      }

      const { data, error } = await query;

      if (error) {
        throw new DataAccessError(
          `Failed to fetch patients: ${error.message}`,
          'patients',
        );
      }

      if (!data) {
        return [];
      }

      // Transform data to match ClientData interface
      const clients: ClientData[] = data.map((patient: any) => ({
        id: patient.id,
        name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        document: patient.cpf,
        birthDate: patient.birth_date,
        healthPlan: undefined, // Will be added to schema later
        status: patient.lgpd_consent_given ? 'active' : 'inactive',
        createdAt: patient.created_at,
        updatedAt: patient.updated_at,
      }));

      // Cache result
      this.setToCache(cacheKey, clients, 300000); // 5 minutes

      return clients;
    } catch (error) {
      if (error instanceof DataAccessError) {
        throw error;
      }
      throw new DataAccessError(
        `Unexpected error fetching patients: ${error}`,
        'patients',
      );
    }
  }

  /**
   * Get client by ID with full details
   */
  async getClientById(id: string): Promise<ClientData | null> {
    const cacheKey = `client:${id}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select(
          `
          id,
          name,
          email,
          phone,
          document,
          birth_date,
          gender,
          health_plan,
          health_plan_number,
          status,
          created_at,
          updated_at,
          addresses (
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            zip_code
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new DataAccessError(
          `Failed to fetch client: ${error.message}`,
          'client',
        );
      }

      if (!data) {
        return null;
      }

      const client: ClientData = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        birthDate: data.birth_date,
        gender: data.gender,
        healthPlan: data.health_plan,
        healthPlanNumber: data.health_plan_number,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        address: data.addresses?.[0]
          ? {
            street: data.addresses[0].street,
            number: data.addresses[0].number,
            complement: data.addresses[0].complement,
            neighborhood: data.addresses[0].neighborhood,
            city: data.addresses[0].city,
            state: data.addresses[0].state,
            zipCode: data.addresses[0].zip_code,
          }
          : undefined,
      };

      // Cache result
      this.setToCache(cacheKey, client, 300000); // 5 minutes

      return client;
    } catch (error) {
      if (error instanceof DataAccessError) {
        throw error;
      }
      throw new DataAccessError(
        `Unexpected error fetching client: ${error}`,
        'client',
      );
    }
  }

  // =====================================
  // Appointment Operations
  // =====================================

  /**
   * Get appointments by date range
   */
  async getAppointmentsByDate(
    startDate: string,
    endDate: string,
    context?: { userId?: string; domain?: string; limit?: number },
  ): Promise<AppointmentData[]> {
    const cacheKey = `appointments:${startDate}:${endDate}:${context?.domain || 'default'}:${
      context?.limit || 50
    }`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.supabase
        .from('appointments')
        .select(
          `
          id,
          client_id,
          client:clients(name),
          professional_id,
          professional:professionals(name),
          service_id,
          service:services(name),
          scheduled_at,
          duration,
          status,
          type,
          notes,
          location,
          telemedicine,
          created_at,
          updated_at
        `,
        )
        .gte('scheduled_at', startDate)
        .lte('scheduled_at', endDate)
        .order('scheduled_at', { ascending: true })
        .limit(context?.limit || 50);

      // Apply domain filter if provided
      if (context?.domain) {
        query = query.eq('domain', context.domain);
      }

      const { data, error } = await query;

      if (error) {
        throw new DataAccessError(
          `Failed to fetch appointments: ${error.message}`,
          'appointments',
        );
      }

      if (!data) {
        return [];
      }

      // Transform data to match AppointmentData interface
      const appointments: AppointmentData[] = data.map((apt: any) => ({
        id: apt.id,
        clientId: apt.client_id,
        clientName: apt.client?.name || 'Unknown',
        professionalId: apt.professional_id,
        professionalName: apt.professional?.name || 'Unknown',
        serviceId: apt.service_id,
        serviceName: apt.service?.name || 'Unknown',
        scheduledAt: apt.scheduled_at,
        duration: apt.duration,
        status: apt.status,
        type: apt.type,
        notes: apt.notes,
        location: apt.location,
        telemedicine: apt.telemedicine,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
      }));

      // Cache result
      this.setToCache(cacheKey, appointments, 60000); // 1 minute

      return appointments;
    } catch (error) {
      if (error instanceof DataAccessError) {
        throw error;
      }
      throw new DataAccessError(
        `Unexpected error fetching appointments: ${error}`,
        'appointments',
      );
    }
  }

  /**
   * Get appointments for a specific client
   */
  async getAppointmentsByClient(
    clientId: string,
    context?: {
      userId?: string;
      domain?: string;
      limit?: number;
      upcoming?: boolean;
    },
  ): Promise<AppointmentData[]> {
    const cacheKey = `client-appointments:${clientId}:${context?.upcoming ? 'upcoming' : 'all'}:${
      context?.domain || 'default'
    }`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.supabase
        .from('appointments')
        .select(
          `
          id,
          client_id,
          client:clients(name),
          professional_id,
          professional:professionals(name),
          service_id,
          service:services(name),
          scheduled_at,
          duration,
          status,
          type,
          notes,
          location,
          telemedicine,
          created_at,
          updated_at
        `,
        )
        .eq('client_id', clientId)
        .order('scheduled_at', { ascending: false })
        .limit(context?.limit || 20);

      // Filter for upcoming appointments if requested
      if (context?.upcoming) {
        query = query.gte('scheduled_at', new Date().toISOString());
      }

      // Apply domain filter if provided
      if (context?.domain) {
        query = query.eq('domain', context.domain);
      }

      const { data, error } = await query;

      if (error) {
        throw new DataAccessError(
          `Failed to fetch client appointments: ${error.message}`,
          'appointments',
        );
      }

      if (!data) {
        return [];
      }

      // Transform data
      const appointments: AppointmentData[] = data.map((apt: any) => ({
        id: apt.id,
        clientId: apt.client_id,
        clientName: apt.client?.name || 'Unknown',
        professionalId: apt.professional_id,
        professionalName: apt.professional?.name || 'Unknown',
        serviceId: apt.service_id,
        serviceName: apt.service?.name || 'Unknown',
        scheduledAt: apt.scheduled_at,
        duration: apt.duration,
        status: apt.status,
        type: apt.type,
        notes: apt.notes,
        location: apt.location,
        telemedicine: apt.telemedicine,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
      }));

      // Cache result
      this.setToCache(cacheKey, appointments, 120000); // 2 minutes

      return appointments;
    } catch (error) {
      if (error instanceof DataAccessError) {
        throw error;
      }
      throw new DataAccessError(
        `Unexpected error fetching client appointments: ${error}`,
        'appointments',
      );
    }
  }

  // =====================================
  // Financial Operations
  // =====================================

  /**
   * Get financial summary with filtering options
   */
  async getFinancialSummary(
    filters: {
      startDate?: string;
      endDate?: string;
      status?: string;
      clientId?: string;
      professionalId?: string;
    },
    context?: { userId?: string; domain?: string },
  ): Promise<{
    summary: {
      total: number;
      count: number;
      paid: number;
      pending: number;
      overdue: number;
    };
    transactions: FinancialData[];
  }> {
    const cacheKey = `financial:${JSON.stringify(filters)}:${context?.domain || 'default'}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.supabase
        .from('financial_transactions')
        .select(
          `
          id,
          appointment_id,
          patient_id,
          patient:patients(full_name),
          service_id,
          service:services(name),
          professional_id,
          professional:professionals(full_name),
          amount,
          status,
          payment_method,
          payment_date,
          due_date,
          invoice_id,
          description,
          created_at,
          updated_at
        `,
        )
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.clientId) {
        query = query.eq('patient_id', filters.clientId);
      }
      if (filters.professionalId) {
        query = query.eq('professional_id', filters.professionalId);
      }

      // Apply clinic filter if provided
      if (context?.domain) {
        query = query.eq('clinic_id', context.domain);
      }

      const { data, error } = await query;

      if (error) {
        throw new DataAccessError(
          `Failed to fetch financial data: ${error.message}`,
          'financial',
        );
      }

      if (!data) {
        return {
          summary: { total: 0, count: 0, paid: 0, pending: 0, overdue: 0 },
          transactions: [],
        };
      }

      // Transform data and calculate summary
      const transactions: FinancialData[] = data.map((record: any) => ({
        appointmentId: record.appointment_id,
        clientId: record.patient_id,
        clientName: record.patient?.full_name || 'Unknown',
        serviceId: record.service_id,
        serviceName: record.service?.name || 'Unknown',
        professionalId: record.professional_id,
        professionalName: record.professional?.full_name || 'Unknown',
        amount: record.amount,
        currency: 'BRL',
        status: record.status,
        paymentMethod: record.payment_method,
        paymentDate: record.payment_date,
        dueDate: record.due_date,
        invoiceId: record.invoice_id,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      }));

      const summary = {
        total: transactions.reduce((sum, t) => sum + t.amount, 0),
        count: transactions.length,
        paid: transactions
          .filter(t => t.status === 'paid')
          .reduce((sum, t) => sum + t.amount, 0),
        pending: transactions
          .filter(t => t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0),
        overdue: transactions
          .filter(t => t.status === 'overdue')
          .reduce((sum, t) => sum + t.amount, 0),
      };

      const result = { summary, transactions };

      // Cache result
      this.setToCache(cacheKey, result, 300000); // 5 minutes

      return result;
    } catch (error) {
      if (error instanceof DataAccessError) {
        throw error;
      }
      throw new DataAccessError(
        `Unexpected error fetching financial data: ${error}`,
        'financial',
      );
    }
  }

  /**
   * Get financial records for a specific client
   */
  async getFinancialByClient(
    clientId: string,
    context?: { userId?: string; domain?: string; limit?: number },
  ): Promise<FinancialData[]> {
    const cacheKey = `client-financial:${clientId}:${context?.domain || 'default'}:${
      context?.limit || 50
    }`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.supabase
        .from('financial_records')
        .select(
          `
          id,
          appointment_id,
          client_id,
          client:clients(name),
          service_id,
          service:services(name),
          professional_id,
          professional:professionals(name),
          amount,
          status,
          payment_method,
          payment_date,
          due_date,
          invoice_id,
          created_at,
          updated_at
        `,
        )
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(context?.limit || 50);

      // Apply domain filter if provided
      if (context?.domain) {
        query = query.eq('domain', context.domain);
      }

      const { data, error } = await query;

      if (error) {
        throw new DataAccessError(
          `Failed to fetch client financial records: ${error.message}`,
          'financial',
        );
      }

      if (!data) {
        return [];
      }

      // Transform data
      const transactions: FinancialData[] = data.map((record: any) => ({
        appointmentId: record.appointment_id,
        clientId: record.client_id,
        clientName: record.client?.name || 'Unknown',
        serviceId: record.service_id,
        serviceName: record.service?.name || 'Unknown',
        professionalId: record.professional_id,
        professionalName: record.professional?.name || 'Unknown',
        amount: record.amount,
        currency: 'BRL',
        status: record.status,
        paymentMethod: record.payment_method,
        paymentDate: record.payment_date,
        dueDate: record.due_date,
        invoiceId: record.invoice_id,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      }));

      // Cache result
      this.setToCache(cacheKey, transactions, 120000); // 2 minutes

      return transactions;
    } catch (error) {
      if (error instanceof DataAccessError) {
        throw error;
      }
      throw new DataAccessError(
        `Unexpected error fetching client financial records: ${error}`,
        'financial',
      );
    }
  }

  // =====================================
  // Utility Methods
  // =====================================

  /**
   * Check cache for data
   */
  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Store data in cache
   */
  private setToCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        console.error('Database health check failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database health check error:', error);
      return false;
    }
  }
}
