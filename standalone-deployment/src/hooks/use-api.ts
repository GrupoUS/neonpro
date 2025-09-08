import { ApiContext } from "@/contexts/api-context";
import { useContext } from "react";

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}

// Re-export common React Query hooks for convenience
export { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
