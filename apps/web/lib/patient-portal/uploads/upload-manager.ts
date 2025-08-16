import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditLogger } from '../../audit/audit-logger';
import type { LGPDManager } from '../../lgpd/lgpd-manager';
import type { EncryptionService } from '../../security/encryption-service';
import type { SessionManager } from '../auth/session-manager';

/**
 * Configuration for upload manager
 */
export type UploadConfig = {
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  maxFilesPerUpload: number;
  virusScanEnabled: boolean;
  autoProcessingEnabled: boolean;
  retentionDays: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  thumbnailGeneration: boolean;
};

/**
 * File upload request
 */
export type UploadRequest = {
  patientId: string;
  files: File[];
  category:
    | 'medical_records'
    | 'insurance'
    | 'identification'
    | 'treatment_photos'
    | 'other';
  description?: string;
  isPrivate: boolean;
  tags?: string[];
  expirationDate?: Date;
};

/**
 * Upload result
 */
export type UploadResult = {
  success: boolean;
  uploadId?: string;
  files?: UploadedFile[];
  message: string;
  errors?: UploadError[];
};

/**
 * Uploaded file information
 */
export type UploadedFile = {
  id: string;
  originalName: string;
  storedName: string;
  size: number;
  mimeType: string;
  category: string;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'quarantined';
  virusScanResult?: 'clean' | 'infected' | 'pending';
  thumbnailUrl?: string;
  downloadUrl?: string;
  metadata?: Record<string, any>;
};

/**
 * Upload error
 */
export type UploadError = {
  fileName: string;
  error: string;
  code: string;
};

/**
 * File processing status
 */
export type ProcessingStatus = {
  uploadId: string;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTimeRemaining?: number;
};

/**
 * Upload statistics
 */
export type UploadStats = {
  totalUploads: number;
  totalSize: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  recentActivity: UploadActivity[];
};

/**
 * Upload activity
 */
export type UploadActivity = {
  id: string;
  action: 'uploaded' | 'downloaded' | 'deleted' | 'shared';
  fileName: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
};

/**
 * Patient upload manager
 */
export class UploadManager {
  private readonly supabase: SupabaseClient;
  private readonly auditLogger: AuditLogger;
  private readonly sessionManager: SessionManager;
  private readonly encryptionService: EncryptionService;
  private readonly config: UploadConfig;

  constructor(
    supabase: SupabaseClient,
    auditLogger: AuditLogger,
    lgpdManager: LGPDManager,
    sessionManager: SessionManager,
    encryptionService: EncryptionService,
    config: UploadConfig
  ) {
    this.supabase = supabase;
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.sessionManager = sessionManager;
    this.encryptionService = encryptionService;
    this.config = config;
  }

  /**
   * Upload files for a patient
   */
  async uploadFiles(
    request: UploadRequest,
    sessionToken: string
  ): Promise<UploadResult> {
    try {
      // Validate session
      const sessionValidation =
        await this.sessionManager.validateSession(sessionToken);
      if (
        !sessionValidation.isValid ||
        sessionValidation.session?.patientId !== request.patientId
      ) {
        throw new Error('Invalid session or unauthorized access');
      }

      // Validate upload request
      const validationResult = this.validateUploadRequest(request);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message,
          errors: validationResult.errors,
        };
      }

      // Create upload record
      const { data: uploadRecord, error: uploadError } = await this.supabase
        .from('patient_uploads')
        .insert({
          patient_id: request.patientId,
          category: request.category,
          description: request.description,
          is_private: request.isPrivate,
          tags: request.tags,
          expiration_date: request.expirationDate?.toISOString(),
          status: 'uploading',
          total_files: request.files.length,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (uploadError) {
        throw uploadError;
      }

      const uploadedFiles: UploadedFile[] = [];
      const errors: UploadError[] = [];

      // Process each file
      for (const file of request.files) {
        try {
          const uploadedFile = await this.processFile(
            file,
            uploadRecord.id,
            request
          );
          uploadedFiles.push(uploadedFile);
        } catch (error) {
          errors.push({
            fileName: file.name,
            error: error.message,
            code: 'PROCESSING_FAILED',
          });
        }
      }

      // Update upload record status
      const finalStatus =
        errors.length === 0
          ? 'completed'
          : errors.length === request.files.length
            ? 'failed'
            : 'partial';

      await this.supabase
        .from('patient_uploads')
        .update({
          status: finalStatus,
          processed_files: uploadedFiles.length,
          failed_files: errors.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', uploadRecord.id);

      // Log upload activity
      await this.auditLogger.log({
        action: 'files_uploaded',
        userId: request.patientId,
        userType: 'patient',
        details: {
          uploadId: uploadRecord.id,
          category: request.category,
          totalFiles: request.files.length,
          successfulFiles: uploadedFiles.length,
          failedFiles: errors.length,
        },
      });

      return {
        success: errors.length < request.files.length,
        uploadId: uploadRecord.id,
        files: uploadedFiles,
        message:
          errors.length === 0
            ? 'Todos os arquivos foram enviados com sucesso!'
            : `${uploadedFiles.length} de ${request.files.length} arquivos enviados com sucesso.`,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      await this.auditLogger.log({
        action: 'upload_failed',
        userId: request.patientId,
        userType: 'patient',
        details: { error: error.message },
      });
      throw error;
    }
  }
  /**
   * Process individual file
   */
  private async processFile(
    file: File,
    uploadId: string,
    request: UploadRequest
  ): Promise<UploadedFile> {
    // Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const storedName = `${uploadId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `uploads/${request.patientId}/${request.category}/${storedName}`;

    // Convert file to buffer for processing
    const fileBuffer = await file.arrayBuffer();
    let processedBuffer = new Uint8Array(fileBuffer);

    // Encrypt file if enabled
    if (this.config.encryptionEnabled) {
      processedBuffer =
        await this.encryptionService.encryptFile(processedBuffer);
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('patient-files')
      .upload(filePath, processedBuffer, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadId,
          category: request.category,
          patientId: request.patientId,
          encrypted: this.config.encryptionEnabled,
        },
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create file record
    const { data: fileRecord, error: fileError } = await this.supabase
      .from('patient_files')
      .insert({
        upload_id: uploadId,
        patient_id: request.patientId,
        original_name: file.name,
        stored_name: storedName,
        file_path: filePath,
        size: file.size,
        mime_type: file.type,
        category: request.category,
        status: 'processing',
        is_encrypted: this.config.encryptionEnabled,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (fileError) {
      throw fileError;
    }

    // Start background processing
    if (this.config.autoProcessingEnabled) {
      this.processFileBackground(fileRecord.id, filePath, file.type);
    }

    return {
      id: fileRecord.id,
      originalName: file.name,
      storedName,
      size: file.size,
      mimeType: file.type,
      category: request.category,
      uploadDate: new Date(),
      status: 'processing',
    };
  }
  /**
   * Validate upload request
   */
  private validateUploadRequest(request: UploadRequest): {
    isValid: boolean;
    message: string;
    errors?: UploadError[];
  } {
    const errors: UploadError[] = [];

    // Check file count
    if (request.files.length > this.config.maxFilesPerUpload) {
      return {
        isValid: false,
        message: `Máximo de ${this.config.maxFilesPerUpload} arquivos por upload.`,
      };
    }

    // Validate each file
    for (const file of request.files) {
      // Check file size
      if (file.size > this.config.maxFileSize) {
        errors.push({
          fileName: file.name,
          error: `Arquivo excede o tamanho máximo de ${this.formatFileSize(this.config.maxFileSize)}.`,
          code: 'FILE_TOO_LARGE',
        });
      }

      // Check file type
      if (!this.config.allowedFileTypes.includes(file.type)) {
        errors.push({
          fileName: file.name,
          error: 'Tipo de arquivo não permitido.',
          code: 'INVALID_FILE_TYPE',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      message:
        errors.length === 0
          ? 'Validação bem-sucedida'
          : 'Alguns arquivos não passaram na validação.',
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  /**
   * Process file in background
   */
  private async processFileBackground(
    fileId: string,
    filePath: string,
    mimeType: string
  ): Promise<void> {
    try {
      let virusScanResult: 'clean' | 'infected' | 'pending' = 'pending';
      let thumbnailUrl: string | undefined;

      // Virus scan if enabled
      if (this.config.virusScanEnabled) {
        virusScanResult = await this.performVirusScan(filePath);

        if (virusScanResult === 'infected') {
          await this.quarantineFile(fileId);
          return;
        }
      } else {
        virusScanResult = 'clean';
      }

      // Generate thumbnail for images
      if (this.config.thumbnailGeneration && mimeType.startsWith('image/')) {
        thumbnailUrl = await this.generateThumbnail(filePath);
      }

      // Update file status
      await this.supabase
        .from('patient_files')
        .update({
          status: 'completed',
          virus_scan_result: virusScanResult,
          thumbnail_url: thumbnailUrl,
          processed_at: new Date().toISOString(),
        })
        .eq('id', fileId);
    } catch (error) {
      // Mark file as failed
      await this.supabase
        .from('patient_files')
        .update({
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString(),
        })
        .eq('id', fileId);
    }
  }
  /**
   * Perform virus scan (placeholder - integrate with actual antivirus service)
   */
  private async performVirusScan(
    _filePath: string
  ): Promise<'clean' | 'infected' | 'pending'> {
    // This would integrate with an actual antivirus service
    // For now, return clean as placeholder
    return 'clean';
  }

  /**
   * Generate thumbnail for image files
   */
  private async generateThumbnail(
    _filePath: string
  ): Promise<string | undefined> {
    // This would integrate with image processing service
    // For now, return undefined as placeholder
    return;
  }

  /**
   * Quarantine infected file
   */
  private async quarantineFile(fileId: string): Promise<void> {
    await this.supabase
      .from('patient_files')
      .update({
        status: 'quarantined',
        virus_scan_result: 'infected',
        processed_at: new Date().toISOString(),
      })
      .eq('id', fileId);
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) {
      return '0 Bytes';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Get upload statistics for a patient
   */
  async getUploadStats(
    patientId: string,
    sessionToken: string
  ): Promise<UploadStats> {
    // Validate session
    const sessionValidation =
      await this.sessionManager.validateSession(sessionToken);
    if (
      !sessionValidation.isValid ||
      sessionValidation.session?.patientId !== patientId
    ) {
      throw new Error('Invalid session or unauthorized access');
    }

    const { data: uploads, error } = await this.supabase
      .from('patient_uploads')
      .select(
        `
        *,
        patient_files(*)
      `
      )
      .eq('patient_id', patientId);

    if (error) {
      throw error;
    }

    const stats: UploadStats = {
      totalUploads: uploads.length,
      totalSize: 0,
      byCategory: {},
      byStatus: {},
      recentActivity: [],
    };

    uploads.forEach((upload) => {
      // Count by category
      stats.byCategory[upload.category] =
        (stats.byCategory[upload.category] || 0) + 1;

      // Count by status
      stats.byStatus[upload.status] = (stats.byStatus[upload.status] || 0) + 1;

      // Calculate total size
      if (upload.patient_files) {
        upload.patient_files.forEach((file: any) => {
          stats.totalSize += file.size || 0;
        });
      }
    });

    return stats;
  }
}
