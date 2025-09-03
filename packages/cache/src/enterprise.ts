import type { MultiLayerCacheManager } from "./cache-manager";
import { CacheLayer } from "./types";

export interface OperationMetadata {
  healthcareData?: boolean;
  patientId?: string;
  auditContext?: string;
  tags?: string[];
}

export class EnterpriseCacheFacade {
  constructor(private readonly cacheManager: MultiLayerCacheManager) {}

  async getPatientData<T>(
    patientId: string,
    key: string,
    layers?: CacheLayer[],
  ): Promise<T | null> {
    const cacheKey = `patient_${patientId}:${key}`;
    return await this.cacheManager.get<T>(cacheKey, layers);
  }

  async setPatientData<T>(
    patientId: string,
    key: string,
    value: T,
    layers?: CacheLayer[],
    options?: OperationMetadata,
  ): Promise<void> {
    const cacheKey = `patient_${patientId}:${key}`;
    await this.cacheManager.set(cacheKey, value, undefined, layers, {
      auditRequired: !!options?.auditContext,
      requiresConsent: !!options?.healthcareData,
      dataClassification: options?.healthcareData ? "CONFIDENTIAL" : "INTERNAL",
      tags: options?.tags,
    });
  }

  async invalidateByPatient(patientId: string): Promise<void> {
    // Invalidate patient data across all cache layers
    await this.cacheManager.delete(`patient_${patientId}`);
  }
}
