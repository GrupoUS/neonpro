import type { useCallback, useEffect, useState } from "react";
import type { toast } from "sonner";
import type {
  CreateDocumentRequest,
  ListDocumentsResponse,
  RegulatoryDocument,
  UpdateDocumentRequest,
  UseDocumentsOptions,
} from "@/types/regulatory-documents";

interface UseRegulatoryDocumentsReturn {
  documents: RegulatoryDocument[];
  loading: boolean;
  error: string | null;
  pagination: ListDocumentsResponse["pagination"] | null;
  refetch: () => void;
  createDocument: (data: CreateDocumentRequest) => Promise<RegulatoryDocument | null>;
  updateDocument: (id: string, data: UpdateDocumentRequest) => Promise<RegulatoryDocument | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  loadMore: () => void;
  hasMore: boolean;
}

export function useRegulatoryDocuments(
  options: UseDocumentsOptions = {},
): UseRegulatoryDocumentsReturn {
  const [documents, setDocuments] = useState<RegulatoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ListDocumentsResponse["pagination"] | null>(null);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();

    if (options.page) params.set("page", options.page.toString());
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.category) params.set("category", options.category);
    if (options.status) params.set("status", options.status);
    if (options.search) params.set("search", options.search);

    return params.toString();
  }, [options]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = buildQuery();
      const response = await fetch(`/api/regulatory-documents?${query}`);

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data: ListDocumentsResponse = await response.json();

      if (options.page && options.page > 1) {
        // Load more - append to existing documents
        setDocuments((prev) => [...prev, ...data.documents]);
      } else {
        // Fresh load - replace documents
        setDocuments(data.documents);
      }

      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      toast.error("Erro ao carregar documentos regulatórios");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, options.page]);

  const createDocument = useCallback(
    async (data: CreateDocumentRequest): Promise<RegulatoryDocument | null> => {
      try {
        const response = await fetch("/api/regulatory-documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create document");
        }

        const result = await response.json();
        const newDocument = result.document;

        // Add to local state
        setDocuments((prev) => [newDocument, ...prev]);

        toast.success("Documento regulatório criado com sucesso");
        return newDocument;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(`Erro ao criar documento: ${message}`);
        return null;
      }
    },
    [],
  );

  const updateDocument = useCallback(
    async (id: string, data: UpdateDocumentRequest): Promise<RegulatoryDocument | null> => {
      try {
        const response = await fetch(`/api/regulatory-documents/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update document");
        }

        const result = await response.json();
        const updatedDocument = result.document;

        // Update local state
        setDocuments((prev) => prev.map((doc) => (doc.id === id ? updatedDocument : doc)));

        toast.success("Documento regulatório atualizado com sucesso");
        return updatedDocument;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(`Erro ao atualizar documento: ${message}`);
        return null;
      }
    },
    [],
  );

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/regulatory-documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

      toast.success("Documento regulatório excluído com sucesso");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao excluir documento: ${message}`);
      return false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pagination?.hasNextPage) {
      fetchDocuments();
    }
  }, [fetchDocuments, pagination?.hasNextPage]);

  const refetch = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    pagination,
    refetch,
    createDocument,
    updateDocument,
    deleteDocument,
    loadMore,
    hasMore: pagination?.hasNextPage ?? false,
  };
}
