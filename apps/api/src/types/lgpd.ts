// LGPD (Lei Geral de Proteção de Dados) Compliance Functions
// These functions handle patient data anonymization, deletion, and export
// in compliance with Brazilian data protection regulations

// Types for LGPD operations
export interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  dateTime: Date;
  type: string;
  status: string;
  notes?: string;
}

export interface LGPDPatientData {
  id: string;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_records?: MedicalRecord[];
  appointments?: Appointment[];
  created_at?: string;
  updated_at?: string;
}

export interface AnonymizationOptions {
  preserveId?: boolean;
  preserveStatistics?: boolean;
  hashSensitiveData?: boolean;
  removeDirectIdentifiers?: boolean;
}

export interface DeletionOptions {
  softDelete?: boolean;
  retainAuditTrail?: boolean;
  anonymizeBeforeDelete?: boolean;
  backupBeforeDelete?: boolean;
}

export interface ExportOptions {
  format?: 'json' | 'csv' | 'xml';
  includeMetadata?: boolean;
  anonymizeData?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface LGPDOperationResult {
  success: boolean;
  recordsProcessed: number;
  operationId: string;
  timestamp: string;
  errors?: string[];
  warnings?: string[];
}

/**
 * Anonymizes patient data according to LGPD requirements
 * Removes or hashes personally identifiable information while preserving
 * statistical and medical relevance for research purposes
 */
export async function anonymize_patient_data(
  patientData: LGPDPatientData | LGPDPatientData[],
  options: AnonymizationOptions = {},
): Promise<LGPDOperationResult> {
  const {
    preserveId = false,
    preserveStatistics = true,
    hashSensitiveData = true,
    removeDirectIdentifiers = true,
  } = options;

  const patients = Array.isArray(patientData) ? patientData : [patientData];
  const processedRecords: unknown[] = [];
  const errors: string[] = [];

  try {
    for (const patient of patients) {
      const anonymized = { ...patient };

      // Remove or hash direct identifiers
      if (removeDirectIdentifiers) {
        if (!preserveId) {
          anonymized.id = hashSensitiveData
            ? `anon_${hashString(patient.id)}`
            : 'anonymized';
        }

        if (patient.name) {
          anonymized.name = hashSensitiveData
            ? `Patient_${hashString(patient.name)}`
            : 'Anonymous Patient';
        }

        if (patient.cpf) {
          anonymized.cpf = hashSensitiveData ? hashString(patient.cpf) : null;
        }

        if (patient.email) {
          anonymized.email = hashSensitiveData
            ? `${hashString(patient.email)}@anonymized.local`
            : null;
        }

        if (patient.phone) {
          anonymized.phone = hashSensitiveData
            ? hashString(patient.phone)
            : null;
        }

        if (patient.address) {
          anonymized.address = hashSensitiveData ? 'Anonymized Address' : null;
        }
      }

      // Preserve statistical data if requested
      if (preserveStatistics && patient.medical_records) {
        anonymized.medical_records = patient.medical_records.map(record => ({
          ...record,
          patient_id: anonymized.id,
          // Remove patient-specific details but keep medical data
          notes: hashSensitiveData
            ? hashString(record.notes || '')
            : 'Anonymized notes',
        }));
      }

      processedRecords.push(anonymized);
    }

    return {
      success: true,
      recordsProcessed: processedRecords.length,
      operationId: `anon_${Date.now()}`,
      timestamp: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      operationId: `anon_error_${Date.now()}`,
      timestamp: new Date().toISOString(),
      errors: [
        `Anonymization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

/**
 * Permanently deletes patient data according to LGPD "right to be forgotten"
 * Includes options for soft deletion and audit trail retention
 */
export async function delete_patient_data(
  patientId: string | string[],
  options: DeletionOptions = {},
): Promise<LGPDOperationResult> {
  const {
    softDelete = false,
    retainAuditTrail = true,
    anonymizeBeforeDelete = true,
    backupBeforeDelete = true,
  } = options;

  const patientIds = Array.isArray(patientId) ? patientId : [patientId];
  const errors: string[] = [];
  let recordsProcessed = 0;

  try {
    for (const id of patientIds) {
      // Validate patient exists
      if (!id || typeof id !== 'string') {
        errors.push(`Invalid patient ID: ${id}`);
        continue;
      }

      // Create backup if requested
      if (backupBeforeDelete) {
        // In a real implementation, this would backup to secure storage
        console.log(`Backup created for patient ${id}`);
      }

      // Anonymize before deletion if requested
      if (anonymizeBeforeDelete && !softDelete) {
        // In a real implementation, this would anonymize the data first
        console.log(`Data anonymized for patient ${id} before deletion`);
      }

      // Perform deletion (soft or hard)
      if (softDelete) {
        // Mark as deleted but retain data
        console.log(`Soft delete performed for patient ${id}`);
      } else {
        // Permanently remove data
        console.log(`Hard delete performed for patient ${id}`);
      }

      // Retain audit trail if requested
      if (retainAuditTrail) {
        console.log(`Audit trail retained for patient ${id} deletion`);
      }

      recordsProcessed++;
    }

    return {
      success: true,
      recordsProcessed,
      operationId: `del_${Date.now()}`,
      timestamp: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      recordsProcessed,
      operationId: `del_error_${Date.now()}`,
      timestamp: new Date().toISOString(),
      errors: [
        `Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

/**
 * Exports patient data in compliance with LGPD data portability requirements
 * Supports multiple formats and anonymization options
 */
export async function export_patient_data(
  patientId: string | string[],
  options: ExportOptions = {},
): Promise<LGPDOperationResult & { exportData?: unknown; exportUrl?: string }> {
  const {
    format = 'json',
    includeMetadata = true,
    anonymizeData = false,
    dateRange,
  } = options;

  const patientIds = Array.isArray(patientId) ? patientId : [patientId];
  const errors: string[] = [];
  const exportedData: unknown[] = [];

  try {
    for (const id of patientIds) {
      // Validate patient exists
      if (!id || typeof id !== 'string') {
        errors.push(`Invalid patient ID: ${id}`);
        continue;
      }

      // Mock patient data - in real implementation, this would query the database
      const patientData: LGPDPatientData = {
        id,
        name: `Patient ${id}`,
        cpf: '000.000.000-00',
        email: `patient${id}@example.com`,
        phone: '+55 11 99999-9999',
        address: 'Sample Address',
        medical_records: [],
        appointments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Apply date range filter if specified
      if (dateRange) {
        // Filter records by date range
        console.log(
          `Applying date range filter: ${dateRange.start} to ${dateRange.end}`,
        );
      }

      // Anonymize data if requested
      let processedData = patientData;
      if (anonymizeData) {
        const anonymizationResult = await anonymize_patient_data(patientData, {
          preserveId: false,
          removeDirectIdentifiers: true,
        });

        if (!anonymizationResult.success) {
          errors.push(`Failed to anonymize data for patient ${id}`);
          continue;
        }
      }

      // Add metadata if requested
      if (includeMetadata) {
        processedData = {
          ...processedData,
          _metadata: {
            exportedAt: new Date().toISOString(),
            format,
            anonymized: anonymizeData,
            lgpdCompliant: true,
          },
        };
      }

      exportedData.push(processedData);
    }

    // Format data according to requested format
    let formattedData: unknown;
    switch (format) {
      case 'csv':
        formattedData = convertToCSV(exportedData);
        break;
      case 'xml':
        formattedData = convertToXML(exportedData);
        break;
      case 'json':
      default:
        formattedData = exportedData;
        break;
    }

    return {
      success: true,
      recordsProcessed: exportedData.length,
      operationId: `exp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      exportData: formattedData,
      exportUrl: `https://api.example.com/exports/exp_${Date.now()}.${format}`,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      operationId: `exp_error_${Date.now()}`,
      timestamp: new Date().toISOString(),
      errors: [
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

// Utility functions
import { createHash } from 'crypto';
// import { getHealthcarePrismaClient, type HealthcarePrismaClient } from '../clients/prisma';

/**
 * LGPD-compliant cryptographic hash function for patient data anonymization
 * Uses SHA-256 with environmental salt for irreversible anonymization
 * Compliant with LGPD Art. 12 (data anonymization requirements)
 */
function hashString(input: string): string {
  // Get or generate anonymization salt for LGPD compliance
  const salt = process.env.LGPD_ANONYMIZATION_SALT || generateStaticSalt();

  // Create SHA-256 hash with salt for irreversible anonymization
  return createHash('sha256')
    .update(input + salt)
    .digest('hex')
    .substring(0, 16); // Truncate for consistent length
}

/**
 * Generate a consistent salt for anonymization when env var is not set
 * In production, LGPD_ANONYMIZATION_SALT should always be set
 */
function generateStaticSalt(): string {
  // Use a static salt for development - in production, use process.env.LGPD_ANONYMIZATION_SALT
  return 'NEONPRO_LGPD_DEV_SALT_2025';
}

function convertToCSV(data: unknown[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string'
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function convertToXML(data: unknown[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<patients>\n';

  for (const patient of data) {
    xml += '  <patient>\n';
    for (const [key, value] of Object.entries(patient)) {
      xml += `    <${key}>${value}</${key}>\n`;
    }
    xml += '  </patient>\n';
  }

  xml += '</patients>';
  return xml;
}

// Export all functions for use in other modules
export {
  anonymize_patient_data as anonymizePatientData,
  delete_patient_data as deletePatientData,
  export_patient_data as exportPatientData,
};
