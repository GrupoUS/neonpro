import * as React from "react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TreatmentGuidelinesViewer } from "@/components/ai-clinical-support/TreatmentGuidelinesViewer";

// Define loader data type
interface TreatmentGuidelinesLoaderData {
  procedureId?: string;
  category?: string;
  searchQuery?: string;
}

export const Route = createFileRoute("/ai-clinical-support/guidelines/")({
  component: TreatmentGuidelinesPage,
  loader: async ({ search }) => {
    const procedureId = search.procedureId as string;
    const category = search.category as string;
    const searchQuery = search.searchQuery as string;

    return {
      procedureId,
      category,
      searchQuery,
    } as TreatmentGuidelinesLoaderData;
  },
});

function TreatmentGuidelinesPage() {
  const loaderData = useLoaderData({ from: "/ai-clinical-support/guidelines/" });
  
  const { data: procedures } = useQuery({
    queryKey: ["aesthetic-procedures"],
    queryFn: () => api.aestheticScheduling.getAestheticProcedures(),
  });

  const { data: categories } = useQuery({
    queryKey: ["guideline-categories"],
    queryFn: () => api.aestheticScheduling.getGuidelineCategories(),
  });

  return (
    <TreatmentGuidelinesViewer
      procedureId={loaderData.procedureId}
      category={loaderData.category}
      searchQuery={loaderData.searchQuery}
      onGuidelineSelect={async (guideline) => {
        try {
          // Handle guideline selection (e.g., track usage, bookmark, etc.)
          console.log("Guideline selected:", guideline);
          return guideline;
        } catch (error) {
          console.error("Error selecting guideline:", error);
          throw error;
        }
      }}
    />
  );
}