import { SupabaseClient } from "@supabase/supabase-js";
import { 
  ConsentRepository as IConsentRepository,
  ConsentRecord,
  ConsentRequest,
  ConsentStatus,
  ConsentType,
  ConsentFilter,
  ConsentSearchResult,
  ConsentQueryOptions 
} from "@neonpro/domain";
import { DatabasePerformanceService } from "../services/database-performance.service.js";

/**
 * Supabase implementation of ConsentRepository
 * Handles all consent data access operations with LGPD compliance
 */
export class ConsentRepository implements IConsentRepository {
  private performanceService: DatabasePerformanceService;

  constructor(private supabase: SupabaseClient) {
    this.performanceService = new DatabasePerformanceService(supabase, {
      enableQueryCaching: true,
      cacheTTL: 300000, // 5 minutes
      slowQueryThreshold: 1000,
      enablePerformanceLogging: true,
    });
  }

  async findById(id: string): Promise<ConsentRecord | null> {
    try {
      return await this.performanceService.optimizedQuery(_"consent_records",_"select",_async (client) => {
          const { data, error } = await client
            .from("consent_records")
            .select(`
              id, patient_id, clinic_id, consent_type, purpose, legal_basis, status,
              given_at, withdrawn_at, expires_at, collection_method, ip_address,
              user_agent, evidence, data_categories, created_at, updated_at,
              patient:patients(id, full_name, cpf)
            `)
            .eq("id", id)
            .single();

          if (error) throw error;
          if (!data) return null;
          return this.mapDatabaseConsentToDomain(data);
        },
        {
          cacheKey: `findById:${id}`,
          columns: "id, patient_id, consent_type, status, expires_at, patient:patients(id, full_name, cpf)",
        }
      );
    } catch (_error) {
      console.error("ConsentRepository.findById error:", error);
      return null;
    }
  }

  async findByPatientId(patientId: string): Promise<ConsentRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from("consent_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("granted_at", { ascending: false });

      if (error) {
        console.error("ConsentRepository.findByPatientId error:", error);
        return [];
      }

      if (!data) return [];

      return data.map(this.mapDatabaseConsentToDomain);
    } catch (_error) {
      console.error("ConsentRepository.findByPatientId error:", error);
      return [];
    }
  }

  async findWithFilter(filter: ConsentFilter, options?: ConsentQueryOptions): Promise<ConsentSearchResult> {
    try {
      let query = this.supabase
        .from("consent_records")
        .select("*", { count: "exact" });

      // Apply filters
      if (filter.patientId) {
        query = query.eq("patient_id", filter.patientId);
      }

      if (filter.consentType) {
        query = query.eq("consent_type", filter.consentType);
      }

      if (filter.status) {
        query = query.eq("status", filter.status);
      }

      if (filter.dateRange) {
        query = query
          .gte("granted_at", filter.dateRange.start.toISOString())
          .lte("granted_at", filter.dateRange.end.toISOString());
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        query = query.order(options.sortBy, { ascending: sortOrder });
      } else {
        query = query.order("granted_at", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("ConsentRepository.findWithFilter error:", error);
        return { consents: [], total: 0 };
      }

      const consents = data ? data.map(this.mapDatabaseConsentToDomain) : [];

      return {
        consents,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (_error) {
      console.error("ConsentRepository.findWithFilter error:", error);
      return { consents: [], total: 0 };
    }
  }

  async create(consentData: ConsentRequest, grantedBy: string): Promise<ConsentRecord> {
    try {
      const dbConsent = {
        patient_id: consentData.patientId,
        consent_type: consentData.consentType,
        purpose: consentData.purpose,
        data_types: consentData.dataTypes,
        expires_at: consentData.expiration,
        metadata: consentData.metadata,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        status: ConsentStatus.ACTIVE
      };

      const { data, error } = await this.supabase
        .from("consent_records")
        .insert(dbConsent)
        .select()
        .single();

      if (error) {
        console.error("ConsentRepository.create error:", error);
        throw new Error(`Failed to create consent: ${error.message}`);
      }

      return this.mapDatabaseConsentToDomain(data);
    } catch (_error) {
      console.error("ConsentRepository.create error:", error);
      throw error;
    }
  }

  async update(id: string, updateData: Partial<ConsentRecord>): Promise<ConsentRecord> {
    try {
      const dbUpdate = this.mapUpdateRequestToDatabase(updateData);

      const { data, error } = await this.supabase
        .from("consent_records")
        .update(dbUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("ConsentRepository.update error:", error);
        throw new Error(`Failed to update consent: ${error.message}`);
      }

      return this.mapDatabaseConsentToDomain(data);
    } catch (_error) {
      console.error("ConsentRepository.update error:", error);
      throw error;
    }
  }

  async revoke(id: string, revokedBy: string): Promise<ConsentRecord> {
    try {
      const { data, error } = await this.supabase
        .from("consent_records")
        .update({
          status: ConsentStatus.REVOKED,
          revoked_at: new Date().toISOString(),
          revoked_by: revokedBy
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("ConsentRepository.revoke error:", error);
        throw new Error(`Failed to revoke consent: ${error.message}`);
      }

      return this.mapDatabaseConsentToDomain(data);
    } catch (_error) {
      console.error("ConsentRepository.revoke error:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("consent_records")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("ConsentRepository.delete error:", error);
        return false;
      }

      return true;
    } catch (_error) {
      console.error("ConsentRepository.delete error:", error);
      return false;
    }
  }

  async checkExpiration(): Promise<ConsentRecord[]> {
    try {
      // Use optimized single-operation expiration check
      const result = await this.performanceService.optimizeExpirationCheck(
        "consent_records",
        "expires_at",
        "status",
        ConsentStatus.ACTIVE,
        ConsentStatus.EXPIRED
      );

      if (result.updatedCount === 0) {
        return [];
      }

      // Fetch the updated records
      return await this.performanceService.optimizedQuery(_"consent_records",_"select",_async (client) => {
          const { data, error } = await client
            .from("consent_records")
            .select(`
              id, patient_id, consent_type, purpose, status, 
              given_at, expires_at, withdrawn_at, created_at
            `)
            .in("id", result.expiredIds)
            .order("expires_at", { ascending: false });

          if (error) throw error;
          return data ? data.map(this.mapDatabaseConsentToDomain) : [];
        },
        {
          cacheKey: `checkExpiration:${Date.now()}`,
          columns: "id, patient_id, consent_type, status, expires_at",
        }
      );
    } catch (_error) {
      console.error("ConsentRepository.checkExpiration error:", error);
      return [];
    }
  }

  async getActiveConsents(patientId: string): Promise<ConsentRecord[]> {
    try {
      return await this.performanceService.optimizedQuery(_"consent_records",_"select",_async (client) => {
          const _now = new Date().toISOString();
          const { data, error } = await client
            .from("consent_records")
            .select(`
              id, patient_id, consent_type, purpose, status, 
              granted_at, expires_at, created_at, data_types
            `)
            .eq("patient_id", patientId)
            .eq("status", ConsentStatus.ACTIVE)
            .or("expires_at.is.null,expires_at.gt." + now)
            .order("granted_at", { ascending: false });

          if (error) throw error;
          return data ? data.map(this.mapDatabaseConsentToDomain) : [];
        },
        {
          cacheKey: `getActiveConsents:${patientId}`,
          columns: "id, patient_id, consent_type, status, expires_at, granted_at",
        }
      );
    } catch (_error) {
      console.error("ConsentRepository.getActiveConsents error:", error);
      return [];
    }
  }

  async hasActiveConsent(patientId: string, consentType: ConsentType): Promise<boolean> {
    try {
      return await this.performanceService.optimizedQuery(_"consent_records",_"select",_async (client) => {
          const _now = new Date().toISOString();
          const { data, error } = await client
            .from("consent_records")
            .select("id")
            .eq("patient_id", patientId)
            .eq("consent_type", consentType)
            .eq("status", ConsentStatus.ACTIVE)
            .or("expires_at.is.null,expires_at.gt." + now)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            throw error;
          }
          
          return !!data;
        },
        {
          cacheKey: `hasActiveConsent:${patientId}:${consentType}`,
          columns: "id",
        }
      );
    } catch (_error) {
      console.error("ConsentRepository.hasActiveConsent error:", error);
      return false;
    }
  }

  /**
   * Maps database consent to domain consent
   */
  private mapDatabaseConsentToDomain(dbConsent: any): ConsentRecord {
    return {
      id: dbConsent.id,
      patientId: dbConsent.patient_id,
      consentType: dbConsent.consent_type as ConsentType,
      status: dbConsent.status as ConsentStatus,
      purpose: dbConsent.purpose,
      dataTypes: dbConsent.data_types || [],
      grantedAt: dbConsent.granted_at,
      expiresAt: dbConsent.expires_at,
      revokedAt: dbConsent.revoked_at,
      grantedBy: dbConsent.granted_by,
      revokedBy: dbConsent.revoked_by,
      metadata: dbConsent.metadata || {},
      auditTrail: dbConsent.audit_trail || []
    };
  }

  /**
   * Maps update request to database format
   */
  private mapUpdateRequestToDatabase(updateData: Partial<ConsentRecord>): any {
    const dbUpdate: any = {};

    if (updateData.purpose !== undefined) dbUpdate.purpose = updateData.purpose;
    if (updateData.dataTypes !== undefined) dbUpdate.data_types = updateData.dataTypes;
    if (updateData.expiresAt !== undefined) dbUpdate.expires_at = updateData.expiresAt;
    if (updateData.metadata !== undefined) dbUpdate.metadata = updateData.metadata;
    if (updateData.status !== undefined) dbUpdate.status = updateData.status;

    return dbUpdate;
  }
}