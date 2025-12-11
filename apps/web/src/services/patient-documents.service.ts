/**
 * Patient Documents Service
 * Service layer for managing patient document records and file uploads
 * Uses Supabase Storage for file storage with LGPD compliance
 * 
 * Schema uses patient_email as reference and links to patient_uploads for file metadata
 */

import { supabase } from '@/integrations/supabase/client';

// Document types matching database schema
export interface PatientDocument {
    id: string;
    upload_id: string;
    patient_email: string;
    clinic_id: string | null;
    document_type: string;
    classification: 'standard' | 'restricted' | 'confidential';
    sensitivity_level: 'standard' | 'restricted' | 'confidential';
    status: 'active' | 'archived' | 'deleted' | 'expired' | 'pending_review';
    retention_policy: string | null;
    legal_basis: string | null;
    consent_id: string | null;
    uploaded_by: string | null;
    uploaded_by_name?: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    archived_at: string | null;
    deleted_at: string | null;
    reason_archived: string | null;
    reason_deleted: string | null;
    notes: string | null;
    tags: string[];
    metadata: Record<string, any>;
    version: number;
    checksum: string | null;
    created_at: string;
    updated_at: string;
    // Joined from patient_uploads
    upload?: {
        id: string;
        file_name: string;
        file_type: string;
        file_size_bytes: number;
        file_path: string;
        upload_purpose?: string;
        description?: string;
    };
}

export interface UploadDocumentRequest {
    file: File;
    documentType: string;
    classification?: 'standard' | 'restricted' | 'confidential';
    sensitivityLevel?: 'standard' | 'restricted' | 'confidential';
    notes?: string;
    tags?: string[];
    legalBasis?: string;
}

export interface DocumentFilters {
    documentType?: string;
    status?: PatientDocument['status'];
    classification?: PatientDocument['classification'];
    search?: string;
    sortBy?: 'created_at' | 'document_type' | 'status';
    sortOrder?: 'asc' | 'desc';
}

// Map document types to categories for display
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    medical: 'Médico',
    exam: 'Exame',
    consent: 'Consentimento',
    insurance: 'Convênio',
    photo: 'Foto',
    prescription: 'Receita',
    report: 'Laudo',
    other: 'Outro',
};

const STORAGE_BUCKET = 'patient-documents';

class PatientDocumentsService {
    /**
     * Get all documents for a patient by email
     */
    async getPatientDocuments(
        patientEmail: string,
        clinicId?: string,
        filters?: DocumentFilters,
    ): Promise<PatientDocument[]> {
        let query = supabase
            .from('patient_documents')
            .select(`
        *,
        upload:patient_uploads(
          id,
          file_name,
          file_type,
          file_size_bytes,
          file_path,
          upload_purpose,
          description
        ),
        uploader:profiles!patient_documents_uploaded_by_fkey(
          full_name
        )
      `)
            .eq('patient_email', patientEmail)
            .neq('status', 'deleted');

        // Filter by clinic if provided
        if (clinicId) {
            query = query.eq('clinic_id', clinicId);
        }

        // Apply document type filter
        if (filters?.documentType) {
            query = query.eq('document_type', filters.documentType);
        }

        // Apply status filter
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        // Apply classification filter
        if (filters?.classification) {
            query = query.eq('classification', filters.classification);
        }

        // Apply search filter
        if (filters?.search) {
            query = query.or(`notes.ilike.%${filters.search}%,document_type.ilike.%${filters.search}%`);
        }

        // Apply sorting
        const sortBy = filters?.sortBy || 'created_at';
        const sortOrder = filters?.sortOrder || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching patient documents:', error);
            throw new Error('Não foi possível carregar os documentos do paciente');
        }

        return (data || []).map(doc => ({
            ...doc,
            uploaded_by_name: (doc.uploader as any)?.full_name || 'Usuário',
            upload: doc.upload || undefined,
        })) as PatientDocument[];
    }

    /**
     * Get documents for a patient by patient ID (looks up email first)
     */
    async getPatientDocumentsByPatientId(
        patientId: string,
        clinicId?: string,
        filters?: DocumentFilters,
    ): Promise<PatientDocument[]> {
        // First get the patient's email
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('email')
            .eq('id', patientId)
            .single();

        if (patientError || !patient?.email) {
            console.warn('Patient email not found, returning empty documents');
            return [];
        }

        return this.getPatientDocuments(patient.email, clinicId, filters);
    }

    /**
     * Get a single document by ID
     */
    async getDocument(documentId: string): Promise<PatientDocument | null> {
        const { data, error } = await supabase
            .from('patient_documents')
            .select(`
        *,
        upload:patient_uploads(
          id,
          file_name,
          file_type,
          file_size_bytes,
          file_path,
          upload_purpose,
          description
        ),
        uploader:profiles!patient_documents_uploaded_by_fkey(
          full_name
        )
      `)
            .eq('id', documentId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error('Não foi possível carregar o documento');
        }

        return {
            ...data,
            uploaded_by_name: (data.uploader as any)?.full_name || 'Usuário',
            upload: data.upload || undefined,
        } as PatientDocument;
    }

    /**
     * Upload a new document for a patient
     */
    async uploadDocument(
        patientEmail: string,
        clinicId: string,
        userId: string,
        request: UploadDocumentRequest,
    ): Promise<PatientDocument> {
        const {
            file,
            documentType,
            classification = 'standard',
            sensitivityLevel = 'standard',
            notes,
            tags = [],
            legalBasis,
        } = request;

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `${clinicId}/${patientEmail}/${documentType}/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw new Error('Não foi possível fazer upload do arquivo');
        }

        // Create patient_uploads record first
        const { data: uploadRecord, error: uploadRecordError } = await supabase
            .from('patient_uploads')
            .insert({
                patient_email: patientEmail,
                clinic_id: clinicId,
                file_name: file.name,
                file_type: file.type.split('/')[1] || 'unknown', // Extract extension only
                file_size_bytes: file.size,
                file_path: storagePath,
                upload_purpose: documentType,
                description: notes || '',
                metadata: {
                    original_mime_type: file.type,
                    storage_bucket: STORAGE_BUCKET,
                },
            })
            .select()
            .single();

        if (uploadRecordError) {
            // Rollback: delete uploaded file
            await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
            console.error('Error creating upload record:', uploadRecordError);
            throw new Error('Não foi possível registrar o upload');
        }

        // Create patient_documents record
        const { data: docRecord, error: docError } = await supabase
            .from('patient_documents')
            .insert({
                upload_id: uploadRecord.id,
                patient_email: patientEmail,
                clinic_id: clinicId,
                document_type: documentType,
                classification,
                sensitivity_level: sensitivityLevel,
                notes,
                tags,
                legal_basis: legalBasis,
                uploaded_by: userId,
                status: 'active',
                metadata: {
                    original_filename: file.name,
                    file_type: file.type,
                    file_size: file.size,
                },
            })
            .select()
            .single();

        if (docError) {
            // Rollback: delete upload record and file
            await supabase.from('patient_uploads').delete().eq('id', uploadRecord.id);
            await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
            console.error('Error creating document record:', docError);
            throw new Error('Não foi possível registrar o documento');
        }

        return {
            ...docRecord,
            upload: uploadRecord,
        } as PatientDocument;
    }

    /**
     * Soft delete a document (marks as deleted)
     */
    async deleteDocument(documentId: string, reason?: string): Promise<void> {
        const { error } = await supabase
            .from('patient_documents')
            .update({
                status: 'deleted',
                deleted_at: new Date().toISOString(),
                reason_deleted: reason || 'Excluído pelo usuário',
            })
            .eq('id', documentId);

        if (error) {
            console.error('Error deleting document:', error);
            throw new Error('Não foi possível excluir o documento');
        }
    }

    /**
     * Soft delete multiple documents
     */
    async deleteDocuments(documentIds: string[], reason?: string): Promise<void> {
        const { error } = await supabase
            .from('patient_documents')
            .update({
                status: 'deleted',
                deleted_at: new Date().toISOString(),
                reason_deleted: reason || 'Excluído pelo usuário',
            })
            .in('id', documentIds);

        if (error) {
            throw new Error('Não foi possível excluir os documentos');
        }
    }

    /**
     * Archive a document
     */
    async archiveDocument(documentId: string, reason?: string): Promise<void> {
        const { error } = await supabase
            .from('patient_documents')
            .update({
                status: 'archived',
                archived_at: new Date().toISOString(),
                reason_archived: reason,
            })
            .eq('id', documentId);

        if (error) {
            throw new Error('Não foi possível arquivar o documento');
        }
    }

    /**
     * Get download URL for a document
     */
    async getDownloadUrl(documentId: string): Promise<string> {
        const document = await this.getDocument(documentId);
        if (!document?.upload?.file_path) {
            throw new Error('Documento não encontrado ou sem arquivo associado');
        }

        // Get bucket from metadata or use default
        const bucket = (document.upload as any)?.metadata?.storage_bucket || STORAGE_BUCKET;

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(document.upload.file_path, 3600); // 1 hour expiry

        if (error || !data?.signedUrl) {
            throw new Error('Não foi possível gerar o link de download');
        }

        return data.signedUrl;
    }

    /**
     * Update document metadata
     */
    async updateDocument(
        documentId: string,
        updates: Partial<Pick<PatientDocument, 'notes' | 'tags' | 'document_type' | 'classification'>>,
    ): Promise<PatientDocument> {
        const { data, error } = await supabase
            .from('patient_documents')
            .update(updates)
            .eq('id', documentId)
            .select()
            .single();

        if (error) {
            throw new Error('Não foi possível atualizar o documento');
        }

        return data as PatientDocument;
    }

    /**
     * Get document statistics for a patient
     */
    async getDocumentStats(patientEmail: string, clinicId?: string): Promise<{
        totalDocuments: number;
        totalSize: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
    }> {
        let query = supabase
            .from('patient_documents')
            .select(`
        id, 
        document_type, 
        status,
        metadata
      `)
            .eq('patient_email', patientEmail)
            .neq('status', 'deleted');

        if (clinicId) {
            query = query.eq('clinic_id', clinicId);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error('Não foi possível carregar estatísticas');
        }

        const stats = {
            totalDocuments: data?.length || 0,
            totalSize: 0,
            byType: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
        };

        data?.forEach(doc => {
            // Count by type
            stats.byType[doc.document_type] = (stats.byType[doc.document_type] || 0) + 1;
            // Count by status
            stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
            // Sum file sizes from metadata
            const size = (doc.metadata as any)?.file_size || 0;
            stats.totalSize += size;
        });

        return stats;
    }

    /**
     * Mark document as reviewed
     */
    async reviewDocument(documentId: string, reviewerId: string): Promise<void> {
        const { error } = await supabase
            .from('patient_documents')
            .update({
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
                status: 'active',
            })
            .eq('id', documentId);

        if (error) {
            throw new Error('Não foi possível marcar o documento como revisado');
        }
    }
}

export const patientDocumentsService = new PatientDocumentsService();
