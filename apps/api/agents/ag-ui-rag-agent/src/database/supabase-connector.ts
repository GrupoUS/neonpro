/**
 * Supabase connector for healthcare agent
 * LGPD compliant database access with audit logging
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthcareLogger } from '../logging/healthcare-logger.js';
import { z } from 'zod';

// Database configuration schema
const SupabaseConfigSchema = z.object({
  url: z.string().url(),
  serviceKey: z.string().min(1),
  connectionPool: z.object({
    min: z.number().min(1),
    max: z.number().min(1),
  }),
  security: z.object({
    auditLogging: z.boolean(),
    dataClassification: z.string(),
  }),
});

export type SupabaseConfig = z.infer<typeof SupabaseConfigSchema>;

// Healthcare data access interfaces
export interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentData {
  id: string;
  clientId: string;
  providerId: string;
  datetime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type: string;
  notes?: string;
  domain: string;
  createdAt: string;
}

export interface FinancialData {
  id: string;
  clientId?: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'invoice' | 'expense';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  paymentMethod?: string;
  timestamp: string;
  domain: string;
}

export interface QueryPermissions {
  userId: string;
  domain: string;
  role: string;
  allowedEntities: string[];
  restrictedFields: string[];
}

/**
 * Supabase connector with healthcare compliance
 */
export class SupabaseConnector {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig;
  private logger: HealthcareLogger;
  private isInitialized = false;

  constructor(config: SupabaseConfig) {
    this.config = SupabaseConfigSchema.parse(config);
    this.logger = HealthcareLogger.getInstance();
  }

  /**
   * Initialize the Supabase connection
   */
  async initialize(): Promise<void> {
    try {
      this.client = createClient(this.config.url, this.config.serviceKey, {
        auth: {
          persistSession: false, // Service role doesn't need sessions
          autoRefreshToken: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'User-Agent': 'NeonPro-HealthcareAgent/1.0.0',
            'X-Data-Classification': this.config.security.dataClassification,
          },
        },
      });

      // Test connection
      const { data, error } = await this.client.from('healthcheck').select('1').limit(1);
      
      if (error && !error.message.includes('relation "healthcheck" does not exist')) {
        throw error;
      }

      this.isInitialized = true;
      this.logger.info('Supabase connector initialized successfully', {
        url: this.config.url,
        dataClassification: this.config.security.dataClassification,
      });

    } catch (error) {
      this.logger.error('Failed to initialize Supabase connector', error);
      throw error;
    }
  }

  /**
   * Disconnect from Supabase
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      // Supabase client doesn't have explicit disconnect
      this.client = null;
      this.isInitialized = false;
      this.logger.info('Supabase connector disconnected');
    }
  }

  /**
   * Execute healthcare query with permission validation
   */
  private async executeHealthcareQuery<T>(
    tableName: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    permissions: QueryPermissions,
    queryFn: (client: SupabaseClient) => Promise<{ data: T; error: any }>
  ): Promise<T> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Supabase connector not initialized');
    }

    // Log data access attempt
    if (this.config.security.auditLogging) {
      await this.logDataAccess({
        userId: permissions.userId,
        tableName,
        operation,
        domain: permissions.domain,
        role: permissions.role,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate permissions
    if (!permissions.allowedEntities.includes(tableName)) {
      throw new Error(`Access denied to entity: ${tableName}`);
    }

    try {
      const { data, error } = await queryFn(this.client);
      
      if (error) {
        this.logger.error('Database query failed', error, {
          tableName,
          operation,
          userId: permissions.userId,
          domain: permissions.domain,
        });
        throw error;
      }

      // Filter restricted fields from results
      const filteredData = this.filterRestrictedFields(data, permissions.restrictedFields);

      this.logger.debug('Healthcare query executed successfully', {
        tableName,
        operation,
        userId: permissions.userId,
        domain: permissions.domain,
        recordCount: Array.isArray(filteredData) ? filteredData.length : 1,
      });

      return filteredData;

    } catch (error) {
      this.logger.error('Healthcare query execution failed', error, {
        tableName,
        operation,
        userId: permissions.userId,
        domain: permissions.domain,
      });
      throw error;
    }
  }

  /**
   * Get clients by name pattern
   */
  async getClientsByName(
    namePattern: string,
    permissions: QueryPermissions
  ): Promise<ClientData[]> {
    return this.executeHealthcareQuery(
      'clients',
      'select',
      permissions,
      async (client) => {
        return client
          .from('clients')
          .select('*')
          .eq('domain', permissions.domain)
          .ilike('name', `%${namePattern}%`)
          .order('name')
          .limit(50);
      }
    );
  }

  /**
   * Get appointments by date range
   */
  async getAppointmentsByDate(
    startDate: string,
    endDate: string,
    permissions: QueryPermissions
  ): Promise<AppointmentData[]> {
    return this.executeHealthcareQuery(
      'appointments',
      'select',
      permissions,
      async (client) => {
        return client
          .from('appointments')
          .select('*')
          .eq('domain', permissions.domain)
          .gte('datetime', startDate)
          .lte('datetime', endDate)
          .order('datetime');
      }
    );
  }

  /**
   * Get financial summary
   */
  async getFinancialSummary(
    startDate: string,
    endDate: string,
    permissions: QueryPermissions
  ): Promise<FinancialData[]> {
    return this.executeHealthcareQuery(
      'financial_records',
      'select',
      permissions,
      async (client) => {
        return client
          .from('financial_records')
          .select('*')
          .eq('domain', permissions.domain)
          .gte('timestamp', startDate)
          .lte('timestamp', endDate)
          .order('timestamp', { ascending: false });
      }
    );
  }

  /**
   * Log data access for audit trail
   */
  private async logDataAccess(accessLog: {
    userId: string;
    tableName: string;
    operation: string;
    domain: string;
    role: string;
    timestamp: string;
  }): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.from('audit_logs').insert([{
        user_id: accessLog.userId,
        table_name: accessLog.tableName,
        operation: accessLog.operation,
        domain: accessLog.domain,
        user_role: accessLog.role,
        timestamp: accessLog.timestamp,
        source: 'healthcare_agent',
        data_classification: this.config.security.dataClassification,
      }]);
    } catch (error) {
      this.logger.error('Failed to log data access', error, accessLog);
      // Don't throw - audit logging failure shouldn't break the query
    }
  }

  /**
   * Filter restricted fields from query results
   */
  private filterRestrictedFields<T>(data: T, restrictedFields: string[]): T {
    if (!data || restrictedFields.length === 0) {
      return data;
    }

    const filterObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(filterObject);
      }
      
      if (obj && typeof obj === 'object') {
        const filtered = { ...obj };
        for (const field of restrictedFields) {
          if (field in filtered) {
            delete filtered[field];
          }
        }
        return filtered;
      }
      
      return obj;
    };

    return filterObject(data);
  }

  /**
   * Get connection status
   */
  getStatus(): {
    isInitialized: boolean;
    config: {
      url: string;
      dataClassification: string;
      auditLogging: boolean;
    };
  } {
    return {
      isInitialized: this.isInitialized,
      config: {
        url: this.config.url,
        dataClassification: this.config.security.dataClassification,
        auditLogging: this.config.security.auditLogging,
      },
    };
  }
}