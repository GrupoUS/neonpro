/**
 * Patient Documents Hooks
 * React Query hooks for patient document management
 */

import { useAuth } from '@/hooks/useAuth';
import {
    patientDocumentsService,
    type DocumentFilters,
    type PatientDocument,
    type UploadDocumentRequest,
} from '@/services/patient-documents.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys
export const patientDocumentKeys = {
    all: ['patient-documents'] as const,
    list: (patientId: string) => [...patientDocumentKeys.all, 'list', patientId] as const,
    listFiltered: (patientId: string, filters?: DocumentFilters) =>
        [...patientDocumentKeys.list(patientId), filters] as const,
    detail: (documentId: string) => [...patientDocumentKeys.all, 'detail', documentId] as const,
    stats: (patientId: string) => [...patientDocumentKeys.all, 'stats', patientId] as const,
};

/**
 * Hook to get patient documents by patient ID
 * Note: Internally looks up patient email first
 */
export function usePatientDocuments(patientId: string, filters?: DocumentFilters) {
    const { user } = useAuth();
    const clinicId = (user as any)?.user_metadata?.clinic_id || (user as any)?.clinic_id;

    return useQuery({
        queryKey: patientDocumentKeys.listFiltered(patientId, filters),
        queryFn: () => patientDocumentsService.getPatientDocumentsByPatientId(patientId, clinicId, filters),
        enabled: !!patientId,
        staleTime: 30000, // 30 seconds
    });
}

/**
 * Hook to get a single document
 */
export function usePatientDocument(documentId: string) {
    return useQuery({
        queryKey: patientDocumentKeys.detail(documentId),
        queryFn: () => patientDocumentsService.getDocument(documentId),
        enabled: !!documentId,
    });
}

/**
 * Hook to upload a document
 */
export function useUploadDocument() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({
            patientId,
            patientEmail,
            clinicId,
            request,
        }: {
            patientId: string;
            patientEmail: string;
            clinicId: string;
            request: UploadDocumentRequest;
        }) => {
            if (!user?.id) {
                throw new Error('Usuário não autenticado');
            }
            return patientDocumentsService.uploadDocument(patientEmail, clinicId, user.id, request);
        },
        onSuccess: (document, { patientId }) => {
            // Invalidate and refetch documents list
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.list(patientId) });
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.stats(patientId) });

            const filename = document.upload?.original_filename || document.metadata?.original_filename || 'Arquivo';
            toast.success(`${filename} enviado com sucesso!`);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao enviar documento');
        },
    });
}

/**
 * Hook to delete a document (soft delete)
 */
export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            documentId,
            patientId,
            reason,
        }: {
            documentId: string;
            patientId: string;
            reason?: string;
        }) => {
            await patientDocumentsService.deleteDocument(documentId, reason);
            return { documentId, patientId };
        },
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.list(patientId) });
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.stats(patientId) });
            toast.success('Documento excluído com sucesso');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao excluir documento');
        },
    });
}

/**
 * Hook to delete multiple documents
 */
export function useDeleteDocuments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            documentIds,
            patientId,
            reason,
        }: {
            documentIds: string[];
            patientId: string;
            reason?: string;
        }) => {
            await patientDocumentsService.deleteDocuments(documentIds, reason);
            return { documentIds, patientId };
        },
        onSuccess: ({ documentIds }, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.list(patientId) });
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.stats(patientId) });
            toast.success(`${documentIds.length} documento(s) excluído(s) com sucesso`);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao excluir documentos');
        },
    });
}

/**
 * Hook to archive a document
 */
export function useArchiveDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            documentId,
            patientId,
            reason,
        }: {
            documentId: string;
            patientId: string;
            reason?: string;
        }) => {
            await patientDocumentsService.archiveDocument(documentId, reason);
            return { documentId, patientId };
        },
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.list(patientId) });
            toast.success('Documento arquivado com sucesso');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao arquivar documento');
        },
    });
}

/**
 * Hook to get download URL
 */
export function useDocumentDownloadUrl() {
    return useMutation({
        mutationFn: (documentId: string) => patientDocumentsService.getDownloadUrl(documentId),
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao gerar link de download');
        },
    });
}

/**
 * Hook to update document metadata
 */
export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            documentId,
            patientId,
            updates,
        }: {
            documentId: string;
            patientId: string;
            updates: Partial<Pick<PatientDocument, 'notes' | 'tags' | 'document_type' | 'classification'>>;
        }) => {
            return patientDocumentsService.updateDocument(documentId, updates);
        },
        onSuccess: (document, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.list(patientId) });
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.detail(document.id) });
            toast.success('Documento atualizado com sucesso');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao atualizar documento');
        },
    });
}

/**
 * Hook to review a document
 */
export function useReviewDocument() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({
            documentId,
            patientId,
        }: {
            documentId: string;
            patientId: string;
        }) => {
            if (!user?.id) {
                throw new Error('Usuário não autenticado');
            }
            await patientDocumentsService.reviewDocument(documentId, user.id);
            return { documentId, patientId };
        },
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientDocumentKeys.list(patientId) });
            toast.success('Documento marcado como revisado');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao revisar documento');
        },
    });
}
