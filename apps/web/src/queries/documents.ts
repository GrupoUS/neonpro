import { supabase } from '@/integrations/supabase/client';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

// Types for documents
export type PatientDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  description?: string;
  tags?: string[];
  isSecure: boolean;
  uploadedBy: string;
  uploadedAt: string;
  patientId: string;
  clinicId: string;
};

export type DocumentInsert = {
  name: string;
  type: string;
  size: number;
  category: string;
  description?: string;
  tags?: string[];
  patientId: string;
};

// Query options for patient documents
export const patientDocumentsQueryOptions = ({
  patientId,
  category,
  search,
}: {
  patientId: string;
  category?: string;
  search?: string;
}) =>
  queryOptions({
    queryKey: ['patient-documents', patientId, { category, search }],
    queryFn: async (): Promise<PatientDocument[]> => {
      let query = supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      // Transform the data to match our frontend interface
      return (data || []).map(doc => ({
        id: doc.id,
        name: doc.name || 'Untitled',
        type: doc.mime_type || 'application/octet-stream',
        size: doc.file_size || 0,
        category: doc.category || 'other',
        description: doc.description || undefined,
        tags: doc.tags || [],
        isSecure: doc.is_secure || false,
        uploadedBy: doc.uploaded_by || 'Unknown',
        uploadedAt: doc.uploaded_at || new Date().toISOString(),
        patientId: doc.patient_id,
        clinicId: doc.clinic_id,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

// Document upload mutation
export const useDocumentUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      file,
      category = 'other',
      description,
      tags,
    }: {
      patientId: string;
      file: File;
      category?: string;
      description?: string;
      tags?: string[];
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (description) formData.append('description', description);
      if (tags?.length) formData.append('tags', JSON.stringify(tags));

      const response = await fetch(
        `/api/v1/patients/${patientId}/documents/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (_, _variables) => {
      // Invalidate document list for this patient
      queryClient.invalidateQueries({
        queryKey: ['patient-documents', variables.patientId],
      });
    },
  });
};

// Document delete mutation
export const useDocumentDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      documentId,
    }: {
      patientId: string;
      documentId: string;
    }) => {
      const response = await fetch(
        `/api/v1/patients/${patientId}/documents/${documentId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${errorText}`);
      }

      return { success: true };
    },
    onSuccess: (_, _variables) => {
      // Invalidate document list for this patient
      queryClient.invalidateQueries({
        queryKey: ['patient-documents', variables.patientId],
      });
    },
  });
};

// Document download helper (not a mutation since it's a direct download)
export const downloadDocument = async (
  patientId: string,
  documentId: string,
  filename: string,
) => {
  try {
    const response = await fetch(
      `/api/v1/patients/${patientId}/documents/${documentId}/download`,
    );

    if (!response.ok) {
      throw new Error('Download failed');
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (_error) {
    console.error('Download error:', error);
    throw error;
  }
};
