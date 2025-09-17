import { randomUUID } from 'crypto';
import { createHash } from 'crypto';


/** Minimal implementation for TDD GREEN phase.
 * NOTE: Persistence (Supabase storage + DB insert + audit event) will be added in next iterations.
 */

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export interface UploadPatientDocumentParams {
  patientId: string;
  originalName: string;
  mimeType: string;
  size: number;
  data: Uint8Array;
  uploadedBy: string;
}

export interface PatientDocumentDTO {
  documentId: string;
  patient_id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  checksum_sha256: string;
  storage_path: string; // planned future physical path
  created_at: string;
}

export interface PatientDocumentServiceOptions {
  supabaseClient?: any; // SupabaseClient (typed lazily to avoid import cost in phase 1 tests)
  bucketName?: string;
  tableName?: string; // patient_documents
  enablePersistence?: boolean; // explicit switch
  auditService?: { logActivity: (args: any) => Promise<any> };
}

export class PatientDocumentService {
  private supabase?: any;
  private bucket: string;
  private table: string;
  private persist: boolean;
  private audit?: { logActivity: (args: any) => Promise<any> };

  constructor(options: PatientDocumentServiceOptions = {}) {
    this.supabase = options.supabaseClient;
    this.bucket = options.bucketName || 'patient-documents';
    this.table = options.tableName || 'patient_documents';
    this.audit = options.auditService;
    // persist only if both flag true (default true) and client provided
    this.persist = options.enablePersistence !== false && !!this.supabase;
  }

  async uploadPatientDocument(
    params: UploadPatientDocumentParams,
  ): Promise<{ success: boolean; data: PatientDocumentDTO }> {
    const { patientId, originalName, mimeType, size, data } = params;

    if (!ALLOWED_MIME.includes(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    // Basic size sanity (future: configurable limit already enforced at route level)
    if (size !== data.byteLength) {
      throw new Error('Size mismatch');
    }

    const documentId = randomUUID();
    const checksum_sha256 = createHash('sha256').update(data).digest('hex');
    const storage_path = `${patientId}/${documentId}-${originalName}`; // normalized path inside bucket
    const created_at = new Date().toISOString();

    if (!this.persist) {
      // in-memory fallback (current tests rely on this path)
      return {
        success: true,
        data: {
          documentId,
          patient_id: patientId,
          original_name: originalName,
          mime_type: mimeType,
          size_bytes: size,
          checksum_sha256,
          storage_path: `in-memory://${storage_path}`,
          created_at,
        },
      };
    }

    // Real persistence path
    // 1. Upload to storage bucket
    const uploadRes = await this.supabase.storage
      .from(this.bucket)
      .upload(storage_path, data, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadRes.error) {
      throw new Error(`Falha ao armazenar documento: ${uploadRes.error.message}`);
    }

    // 2. Insert metadata row
    const insertPayload: any = {
      id: documentId,
      patient_id: patientId,
      original_name: originalName,
      mime_type: mimeType,
      size_bytes: size,
      checksum_sha256,
      storage_path,
      created_at,
    };

    const { error: dbError } = await this.supabase
      .from(this.table)
      .insert(insertPayload);

    if (dbError) {
      // best-effort rollback (ignore deletion error)
      await this.supabase.storage.from(this.bucket).remove([storage_path]);
      throw new Error(`Falha ao persistir metadados: ${dbError.message}`);
    }

    const dto: PatientDocumentDTO = {
      documentId,
      patient_id: patientId,
      original_name: originalName,
      mime_type: mimeType,
      size_bytes: size,
      checksum_sha256,
      storage_path: `supabase://${this.bucket}/${storage_path}`,
      created_at,
    };

    // 3. Audit trail (non-blocking)
    if (this.audit) {
      this.audit.logActivity({
        userId: params.uploadedBy,
        action: 'upload',
        resourceType: 'patient_document',
        resourceId: documentId,
        details: {
          patientId,
          mimeType,
          sizeBytes: size,
          checksum: checksum_sha256,
        },
      }).catch(() => {/* swallow audit errors */});
    }

    return { success: true, data: dto };
  }

  async getDocument(_documentId: string, _userId: string): Promise<PatientDocumentDTO | null> {
    console.warn('In-memory mode: getDocument not implemented');
    return null;
  }

  async getFileContent(_storagePath: string): Promise<ArrayBuffer> {
    console.warn('In-memory mode: returning mock file content');
    const encoder = new TextEncoder();
    return encoder.encode('Mock file content for testing').buffer;
  }
}

export default PatientDocumentService;
