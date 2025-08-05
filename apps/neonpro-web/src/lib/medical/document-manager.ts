/**
 * NeonPro Medical Document Manager
 * Story 2.2: Medical History & Records - Document Management
 *
 * Sistema avançado de gerenciamento de documentos médicos:
 * - Upload e armazenamento seguro
 * - Fotos antes/depois com versionamento
 * - Processamento de imagens
 * - Organização por categorias
 * - Controle de acesso e permissões
 */

import type { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { AuditLogger } from "../audit/audit-logger";
import type { LGPDManager } from "../auth/lgpd/lgpd-manager";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MedicalDocument {
  id: string;
  patient_id: string;
  clinic_id: string;
  record_id?: string;
  document_type: DocumentType;
  category: DocumentCategory;
  title: string;
  description?: string;
  file_name: string;
  original_file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  checksum: string;
  thumbnail_url?: string;
  metadata?: DocumentMetadata;
  tags: string[];
  version: number;
  is_active: boolean;
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
  expires_at?: string;
  access_level: AccessLevel;
}

export interface BeforeAfterPair {
  id: string;
  patient_id: string;
  clinic_id: string;
  procedure_name: string;
  procedure_date: string;
  before_photo_id: string;
  after_photo_id: string;
  comparison_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_url: string;
  file_size: number;
  checksum: string;
  changes_description?: string;
  created_by: string;
  created_at: string;
}

export interface DocumentMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  author?: string;
  creation_date?: string;
  modification_date?: string;
  keywords?: string[];
  subject?: string;
  custom_fields?: Record<string, any>;
}

// Enums
export enum DocumentType {
  IMAGE = "image",
  PDF = "pdf",
  DOCUMENT = "document",
  VIDEO = "video",
  AUDIO = "audio",
  DICOM = "dicom",
  OTHER = "other",
}

export enum DocumentCategory {
  CONSENT_FORM = "consent_form",
  MEDICAL_REPORT = "medical_report",
  LAB_RESULT = "lab_result",
  IMAGING = "imaging",
  PRESCRIPTION = "prescription",
  BEFORE_PHOTO = "before_photo",
  AFTER_PHOTO = "after_photo",
  PROGRESS_PHOTO = "progress_photo",
  IDENTIFICATION = "identification",
  INSURANCE = "insurance",
  TREATMENT_PLAN = "treatment_plan",
  INVOICE = "invoice",
  OTHER = "other",
}

export enum AccessLevel {
  PUBLIC = "public",
  CLINIC_STAFF = "clinic_staff",
  DOCTOR_ONLY = "doctor_only",
  PATIENT_ONLY = "patient_only",
  RESTRICTED = "restricted",
}

export interface UploadOptions {
  category: DocumentCategory;
  title: string;
  description?: string;
  tags?: string[];
  accessLevel?: AccessLevel;
  expiresAt?: string;
  recordId?: string;
  generateThumbnail?: boolean;
  processImage?: boolean;
  beforeAfterPairId?: string;
}

export interface SearchFilters {
  documentType?: DocumentType;
  category?: DocumentCategory;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  accessLevel?: AccessLevel;
  hasExpiration?: boolean;
}

// ============================================================================
// MEDICAL DOCUMENT MANAGER
// ============================================================================

export class MedicalDocumentManager {
  private supabase;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private readonly STORAGE_BUCKET = "medical-documents";
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "video/avi",
    "video/mov",
    "audio/mp3",
    "audio/wav",
    "application/dicom",
  ];

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    this.auditLogger = new AuditLogger();
    this.lgpdManager = new LGPDManager();
  }

  // ========================================================================
  // DOCUMENT UPLOAD & MANAGEMENT
  // ========================================================================

  async uploadDocument(
    file: File,
    patientId: string,
    clinicId: string,
    options: UploadOptions,
    userId: string,
  ): Promise<{ success: boolean; data?: MedicalDocument; error?: string }> {
    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Check LGPD consent
      const consentCheck = await this.lgpdManager.checkConsent(patientId, "medical_data");

      if (!consentCheck.hasConsent) {
        return {
          success: false,
          error: "Patient consent required for document upload",
        };
      }

      const documentId = crypto.randomUUID();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${documentId}.${fileExtension}`;
      const filePath = `${clinicId}/${patientId}/${options.category}/${fileName}`;

      // Calculate file checksum
      const checksum = await this.calculateChecksum(file);

      // Check for duplicates
      const duplicateCheck = await this.checkDuplicate(checksum, patientId);
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          error: `Duplicate file detected. Original uploaded: ${duplicateCheck.originalDate}`,
        };
      }

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Process metadata
      const metadata = await this.extractMetadata(file);

      // Generate thumbnail if needed
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail && file.type.startsWith("image/")) {
        thumbnailUrl = await this.generateThumbnail(filePath, file);
      }

      // Determine document type
      const documentType = this.getDocumentType(file.mime_type);

      const document: MedicalDocument = {
        id: documentId,
        patient_id: patientId,
        clinic_id: clinicId,
        record_id: options.recordId,
        document_type: documentType,
        category: options.category,
        title: options.title,
        description: options.description,
        file_name: fileName,
        original_file_name: file.name,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        checksum,
        thumbnail_url: thumbnailUrl,
        metadata,
        tags: options.tags || [],
        version: 1,
        is_active: true,
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: options.expiresAt,
        access_level: options.accessLevel || AccessLevel.CLINIC_STAFF,
      };

      // Save to database
      const { data, error } = await this.supabase
        .from("medical_documents")
        .insert(document)
        .select()
        .single();

      if (error) throw error;

      // Process image if needed
      if (options.processImage && file.type.startsWith("image/")) {
        await this.processImage(documentId, filePath);
      }

      // Handle before/after pairing
      if (
        options.beforeAfterPairId &&
        (options.category === DocumentCategory.BEFORE_PHOTO ||
          options.category === DocumentCategory.AFTER_PHOTO)
      ) {
        await this.handleBeforeAfterPairing(
          documentId,
          options.beforeAfterPairId,
          options.category,
        );
      }

      // Log audit event
      await this.auditLogger.log({
        event_type: "medical_document_uploaded",
        user_id: userId,
        resource_type: "medical_document",
        resource_id: documentId,
        details: {
          patient_id: patientId,
          file_name: file.name,
          file_size: file.size,
          category: options.category,
          document_type: documentType,
        },
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error uploading document:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getDocument(
    documentId: string,
    userId: string,
  ): Promise<{ success: boolean; data?: MedicalDocument; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("medical_documents")
        .select("*")
        .eq("id", documentId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      if (!data) {
        return { success: false, error: "Document not found" };
      }

      // Check access permissions
      const hasAccess = await this.checkDocumentAccess(data, userId);
      if (!hasAccess) {
        return { success: false, error: "Access denied" };
      }

      // Log audit event
      await this.auditLogger.log({
        event_type: "medical_document_accessed",
        user_id: userId,
        resource_type: "medical_document",
        resource_id: documentId,
        details: {
          patient_id: data.patient_id,
          file_name: data.file_name,
        },
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error getting document:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getPatientDocuments(
    patientId: string,
    userId: string,
    filters?: SearchFilters,
    pagination?: { limit: number; offset: number },
  ): Promise<{ success: boolean; data?: MedicalDocument[]; total?: number; error?: string }> {
    try {
      let query = this.supabase
        .from("medical_documents")
        .select("*", { count: "exact" })
        .eq("patient_id", patientId)
        .eq("is_active", true);

      // Apply filters
      if (filters?.documentType) {
        query = query.eq("document_type", filters.documentType);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.accessLevel) {
        query = query.eq("access_level", filters.accessLevel);
      }
      if (filters?.dateFrom) {
        query = query.gte("uploaded_at", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("uploaded_at", filters.dateTo);
      }
      if (filters?.hasExpiration !== undefined) {
        if (filters.hasExpiration) {
          query = query.not("expires_at", "is", null);
        } else {
          query = query.is("expires_at", null);
        }
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      // Apply pagination
      if (pagination) {
        query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
      }

      // Order by upload date
      query = query.order("uploaded_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Filter by access permissions
      const accessibleDocuments = [];
      for (const doc of data || []) {
        const hasAccess = await this.checkDocumentAccess(doc, userId);
        if (hasAccess) {
          accessibleDocuments.push(doc);
        }
      }

      // Log audit event
      await this.auditLogger.log({
        event_type: "patient_documents_accessed",
        user_id: userId,
        resource_type: "medical_document",
        resource_id: patientId,
        details: {
          patient_id: patientId,
          document_count: accessibleDocuments.length,
          filters,
        },
      });

      return {
        success: true,
        data: accessibleDocuments,
        total: count || 0,
      };
    } catch (error) {
      console.error("Error getting patient documents:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateDocument(
    documentId: string,
    updates: Partial<
      Pick<MedicalDocument, "title" | "description" | "tags" | "access_level" | "expires_at">
    >,
    userId: string,
  ): Promise<{ success: boolean; data?: MedicalDocument; error?: string }> {
    try {
      // Get current document
      const currentDoc = await this.getDocument(documentId, userId);
      if (!currentDoc.success || !currentDoc.data) {
        return { success: false, error: "Document not found" };
      }

      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("medical_documents")
        .update(updatedData)
        .eq("id", documentId)
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await this.auditLogger.log({
        event_type: "medical_document_updated",
        user_id: userId,
        resource_type: "medical_document",
        resource_id: documentId,
        details: {
          patient_id: data.patient_id,
          changes: Object.keys(updates),
        },
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error updating document:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async deleteDocument(
    documentId: string,
    userId: string,
    permanent: boolean = false,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get document info
      const docResult = await this.getDocument(documentId, userId);
      if (!docResult.success || !docResult.data) {
        return { success: false, error: "Document not found" };
      }

      const document = docResult.data;

      if (permanent) {
        // Delete from storage
        await this.supabase.storage.from(this.STORAGE_BUCKET).remove([document.file_path]);

        // Delete thumbnail if exists
        if (document.thumbnail_url) {
          const thumbnailPath = document.file_path.replace(/\.[^/.]+$/, "_thumb.jpg");
          await this.supabase.storage.from(this.STORAGE_BUCKET).remove([thumbnailPath]);
        }

        // Delete from database
        const { error } = await this.supabase
          .from("medical_documents")
          .delete()
          .eq("id", documentId);

        if (error) throw error;
      } else {
        // Soft delete
        const { error } = await this.supabase
          .from("medical_documents")
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId);

        if (error) throw error;
      }

      // Log audit event
      await this.auditLogger.log({
        event_type: permanent
          ? "medical_document_deleted_permanent"
          : "medical_document_deleted_soft",
        user_id: userId,
        resource_type: "medical_document",
        resource_id: documentId,
        details: {
          patient_id: document.patient_id,
          file_name: document.file_name,
          permanent,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ========================================================================
  // BEFORE/AFTER PHOTO MANAGEMENT
  // ========================================================================

  async createBeforeAfterPair(
    patientId: string,
    clinicId: string,
    procedureName: string,
    procedureDate: string,
    beforePhotoId: string,
    afterPhotoId: string,
    userId: string,
    notes?: string,
  ): Promise<{ success: boolean; data?: BeforeAfterPair; error?: string }> {
    try {
      const pairId = crypto.randomUUID();
      const now = new Date().toISOString();

      const pair: BeforeAfterPair = {
        id: pairId,
        patient_id: patientId,
        clinic_id: clinicId,
        procedure_name: procedureName,
        procedure_date: procedureDate,
        before_photo_id: beforePhotoId,
        after_photo_id: afterPhotoId,
        comparison_notes: notes,
        created_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from("before_after_pairs")
        .insert(pair)
        .select()
        .single();

      if (error) throw error;

      // Update documents to reference the pair
      await this.supabase
        .from("medical_documents")
        .update({ metadata: { before_after_pair_id: pairId } })
        .in("id", [beforePhotoId, afterPhotoId]);

      // Log audit event
      await this.auditLogger.log({
        event_type: "before_after_pair_created",
        user_id: userId,
        resource_type: "before_after_pair",
        resource_id: pairId,
        details: {
          patient_id: patientId,
          procedure_name: procedureName,
          before_photo_id: beforePhotoId,
          after_photo_id: afterPhotoId,
        },
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error creating before/after pair:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getPatientBeforeAfterPairs(
    patientId: string,
    userId: string,
  ): Promise<{ success: boolean; data?: BeforeAfterPair[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("before_after_pairs")
        .select(`
          *,
          before_photo:medical_documents!before_after_pairs_before_photo_id_fkey(*),
          after_photo:medical_documents!before_after_pairs_after_photo_id_fkey(*)
        `)
        .eq("patient_id", patientId)
        .order("procedure_date", { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error getting before/after pairs:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ========================================================================
  // DOCUMENT VERSIONING
  // ========================================================================

  async createDocumentVersion(
    documentId: string,
    newFile: File,
    changesDescription: string,
    userId: string,
  ): Promise<{ success: boolean; data?: DocumentVersion; error?: string }> {
    try {
      // Get current document
      const currentDoc = await this.getDocument(documentId, userId);
      if (!currentDoc.success || !currentDoc.data) {
        return { success: false, error: "Document not found" };
      }

      const document = currentDoc.data;
      const versionId = crypto.randomUUID();
      const fileExtension = newFile.name.split(".").pop();
      const fileName = `${versionId}.${fileExtension}`;
      const filePath = `${document.clinic_id}/${document.patient_id}/versions/${fileName}`;

      // Upload new version
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, newFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Calculate checksum
      const checksum = await this.calculateChecksum(newFile);

      // Create version record
      const version: DocumentVersion = {
        id: versionId,
        document_id: documentId,
        version_number: document.version + 1,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: newFile.size,
        checksum,
        changes_description: changesDescription,
        created_by: userId,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("document_versions")
        .insert(version)
        .select()
        .single();

      if (error) throw error;

      // Update main document
      await this.supabase
        .from("medical_documents")
        .update({
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: newFile.size,
          checksum,
          version: document.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      // Log audit event
      await this.auditLogger.log({
        event_type: "document_version_created",
        user_id: userId,
        resource_type: "document_version",
        resource_id: versionId,
        details: {
          document_id: documentId,
          version_number: version.version_number,
          changes_description: changesDescription,
        },
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error creating document version:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getDocumentVersions(
    documentId: string,
    userId: string,
  ): Promise<{ success: boolean; data?: DocumentVersion[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error getting document versions:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private async validateFile(file: File): Promise<{ isValid: boolean; error?: string }> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { isValid: true };
  }

  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hash = crypto.createHash("sha256");
    hash.update(new Uint8Array(buffer));
    return hash.digest("hex");
  }

  private async checkDuplicate(
    checksum: string,
    patientId: string,
  ): Promise<{ isDuplicate: boolean; originalDate?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("medical_documents")
        .select("uploaded_at")
        .eq("checksum", checksum)
        .eq("patient_id", patientId)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      return {
        isDuplicate: !!data,
        originalDate: data?.uploaded_at,
      };
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return { isDuplicate: false };
    }
  }

  private getDocumentType(mimeType: string): DocumentType {
    if (mimeType.startsWith("image/")) return DocumentType.IMAGE;
    if (mimeType === "application/pdf") return DocumentType.PDF;
    if (mimeType.startsWith("video/")) return DocumentType.VIDEO;
    if (mimeType.startsWith("audio/")) return DocumentType.AUDIO;
    if (mimeType === "application/dicom") return DocumentType.DICOM;
    if (mimeType.includes("document") || mimeType.includes("word")) return DocumentType.DOCUMENT;
    return DocumentType.OTHER;
  }

  private async extractMetadata(file: File): Promise<DocumentMetadata> {
    const metadata: DocumentMetadata = {};

    if (file.type.startsWith("image/")) {
      // For images, we would typically use a library like exif-js
      // For now, we'll just set basic info
      metadata.creation_date = new Date().toISOString();
    }

    return metadata;
  }

  private async generateThumbnail(filePath: string, file: File): Promise<string | undefined> {
    try {
      // Simplified thumbnail generation
      // In production, use image processing service like Sharp or ImageMagick
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, "_thumb.jpg");

      // For now, return the same URL
      // TODO: Implement actual thumbnail generation
      const { data } = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(thumbnailPath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return undefined;
    }
  }

  private async processImage(documentId: string, filePath: string): Promise<void> {
    try {
      // Image processing tasks:
      // - Resize for web display
      // - Optimize compression
      // - Extract EXIF data
      // - Generate multiple sizes

      // TODO: Implement image processing pipeline
      console.log(`Processing image for document ${documentId} at ${filePath}`);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }

  private async handleBeforeAfterPairing(
    documentId: string,
    pairId: string,
    category: DocumentCategory,
  ): Promise<void> {
    try {
      // Update document metadata to include pair information
      await this.supabase
        .from("medical_documents")
        .update({
          metadata: { before_after_pair_id: pairId },
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);
    } catch (error) {
      console.error("Error handling before/after pairing:", error);
    }
  }

  private async checkDocumentAccess(document: MedicalDocument, userId: string): Promise<boolean> {
    try {
      // Simplified access control
      // In production, implement proper RBAC integration

      switch (document.access_level) {
        case AccessLevel.PUBLIC:
          return true;
        case AccessLevel.CLINIC_STAFF:
          // Check if user belongs to the same clinic
          return true; // TODO: Implement clinic membership check
        case AccessLevel.DOCTOR_ONLY:
          // Check if user is a doctor
          return true; // TODO: Implement role check
        case AccessLevel.PATIENT_ONLY:
          // Check if user is the patient
          return document.patient_id === userId;
        case AccessLevel.RESTRICTED:
          // Check specific permissions
          return false; // TODO: Implement specific permission check
        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking document access:", error);
      return false;
    }
  }

  // ========================================================================
  // SEARCH AND ANALYTICS
  // ========================================================================

  async searchDocuments(
    query: string,
    clinicId: string,
    userId: string,
    filters?: SearchFilters,
  ): Promise<{ success: boolean; data?: MedicalDocument[]; error?: string }> {
    try {
      let dbQuery = this.supabase
        .from("medical_documents")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("is_active", true)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,original_file_name.ilike.%${query}%`,
        );

      // Apply filters
      if (filters?.documentType) {
        dbQuery = dbQuery.eq("document_type", filters.documentType);
      }
      if (filters?.category) {
        dbQuery = dbQuery.eq("category", filters.category);
      }
      if (filters?.accessLevel) {
        dbQuery = dbQuery.eq("access_level", filters.accessLevel);
      }
      if (filters?.dateFrom) {
        dbQuery = dbQuery.gte("uploaded_at", filters.dateFrom);
      }
      if (filters?.dateTo) {
        dbQuery = dbQuery.lte("uploaded_at", filters.dateTo);
      }
      if (filters?.tags && filters.tags.length > 0) {
        dbQuery = dbQuery.overlaps("tags", filters.tags);
      }

      const { data, error } = await dbQuery.order("uploaded_at", { ascending: false }).limit(50);

      if (error) throw error;

      // Filter by access permissions
      const accessibleDocuments = [];
      for (const doc of data || []) {
        const hasAccess = await this.checkDocumentAccess(doc, userId);
        if (hasAccess) {
          accessibleDocuments.push(doc);
        }
      }

      // Log audit event
      await this.auditLogger.log({
        event_type: "documents_searched",
        user_id: userId,
        resource_type: "medical_document",
        resource_id: clinicId,
        details: {
          query,
          filters,
          results_count: accessibleDocuments.length,
        },
      });

      return { success: true, data: accessibleDocuments };
    } catch (error) {
      console.error("Error searching documents:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getDocumentStatistics(
    clinicId: string,
    userId: string,
    period?: { from: string; to: string },
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let query = this.supabase
        .from("medical_documents")
        .select("document_type, category, file_size, uploaded_at")
        .eq("clinic_id", clinicId)
        .eq("is_active", true);

      if (period) {
        query = query.gte("uploaded_at", period.from).lte("uploaded_at", period.to);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process statistics
      const stats = {
        total_documents: data?.length || 0,
        total_size: 0,
        by_type: {} as Record<string, number>,
        by_category: {} as Record<string, number>,
        by_month: {} as Record<string, number>,
        average_size: 0,
      };

      data?.forEach((doc) => {
        stats.total_size += doc.file_size;

        // Count by type
        stats.by_type[doc.document_type] = (stats.by_type[doc.document_type] || 0) + 1;

        // Count by category
        stats.by_category[doc.category] = (stats.by_category[doc.category] || 0) + 1;

        // Count by month
        const month = new Date(doc.uploaded_at).toISOString().slice(0, 7);
        stats.by_month[month] = (stats.by_month[month] || 0) + 1;
      });

      stats.average_size = stats.total_documents > 0 ? stats.total_size / stats.total_documents : 0;

      return { success: true, data: stats };
    } catch (error) {
      console.error("Error getting document statistics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const medicalDocumentManager = new MedicalDocumentManager();
export default medicalDocumentManager;
