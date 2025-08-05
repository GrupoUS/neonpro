import type { useState, useEffect, useCallback } from "react";
import type { toast } from "sonner";
import type {
  RegulationCategory,
  ListCategoriesResponse,
  ListCategoriesRequest,
} from "@/types/regulatory-documents";

interface UseRegulatoryCategories {
  categories: RegulationCategory[];
  groupedCategories: Record<string, RegulationCategory[]>;
  authorities: Array<{ authority_name: string; authority_code: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRegulatoryCategories(
  options: ListCategoriesRequest = {},
): UseRegulatoryCategories {
  const [categories, setCategories] = useState<RegulationCategory[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<Record<string, RegulationCategory[]>>(
    {},
  );
  const [authorities, setAuthorities] = useState<
    Array<{ authority_name: string; authority_code: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();

    if (options.authority) params.set("authority", options.authority);
    if (options.search) params.set("search", options.search);

    return params.toString();
  }, [options]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = buildQuery();
      const response = await fetch(`/api/regulatory-documents/categories?${query}`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data: ListCategoriesResponse = await response.json();

      setCategories(data.categories);
      setGroupedCategories(data.groupedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      toast.error("Erro ao carregar categorias regulatórias");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const fetchAuthorities = useCallback(async () => {
    try {
      const response = await fetch("/api/regulatory-documents/categories", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch authorities");
      }

      const data = await response.json();
      setAuthorities(data.authorities);
    } catch (err) {
      console.error("Error fetching authorities:", err);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchCategories();
    fetchAuthorities();
  }, [fetchCategories, fetchAuthorities]);

  useEffect(() => {
    fetchCategories();
    fetchAuthorities();
  }, [fetchCategories, fetchAuthorities]);

  return {
    categories,
    groupedCategories,
    authorities,
    loading,
    error,
    refetch,
  };
}
