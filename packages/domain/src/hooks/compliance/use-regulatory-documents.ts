/**
 * Placeholder regulatory documents hook
 */
import { useState } from "react";

export const useRegulatoryDocuments = () => {
  const [documents, setDocuments] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return {
    documents,
    isLoading,
    loadDocuments: async () => {
      setIsLoading(true);
      setTimeout(() => {
        setDocuments([
          { id: "1", title: "LGPD Compliance Guide", type: "guide" },
          { id: "2", title: "ANVISA Requirements", type: "regulation" },
        ]);
        setIsLoading(false);
      }, 1000);
    },
    uploadDocument: async (_file: File) => {
      return { id: "placeholder" };
    },
  };
};
