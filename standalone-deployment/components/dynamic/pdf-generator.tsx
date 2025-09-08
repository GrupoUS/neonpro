"use client";

import { LoadingWithMessage } from "@/components/ui/loading-skeleton";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";

// Dynamic import for PDF generation libraries
const PDFGenerator = dynamic(
  () => import("../pdf/pdf-generator-core").then((mod) => mod.PDFGeneratorCore),
  {
    loading: () => <LoadingWithMessage variant="pdf" />,
    ssr: false, // PDFs são gerados client-side
  },
);

// Dynamic import for jsPDF specifically
const JSPDFGenerator = dynamic(
  () => import("../pdf/jspdf-generator").then((mod) => mod.JSPDFGenerator),
  {
    loading: () => <LoadingWithMessage variant="pdf" message="Carregando jsPDF..." />,
    ssr: false,
  },
);

// Dynamic import for React-PDF
const ReactPDFGenerator = dynamic(
  () => import("../pdf/react-pdf-generator").then((mod) => mod.ReactPDFGenerator),
  {
    loading: () => <LoadingWithMessage variant="pdf" message="Carregando React-PDF..." />,
    ssr: false,
  },
);

// Props interfaces
interface PDFGeneratorProps {
  data: unknown;
  template: "patient-report" | "financial-report" | "appointment-summary" | "prescription";
  onGenerated?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

interface JSPDFGeneratorProps {
  title: string;
  content: string | unknown[];
  filename?: string;
  orientation?: "portrait" | "landscape";
}

interface ReactPDFGeneratorProps {
  document: React.ReactElement;
  filename?: string;
}

// Main PDF Generator with automatic library selection
export function DynamicPDFGenerator(props: PDFGeneratorProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="pdf" />}>
      <PDFGenerator {...props} />
    </Suspense>
  );
}

// jsPDF specific generator
export function DynamicJSPDFGenerator(props: JSPDFGeneratorProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="pdf" message="Carregando jsPDF..." />}>
      <JSPDFGenerator {...props} />
    </Suspense>
  );
}

// React-PDF specific generator
export function DynamicReactPDFGenerator(props: ReactPDFGeneratorProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="pdf" message="Carregando React-PDF..." />}>
      <ReactPDFGenerator {...props} />
    </Suspense>
  );
}

// Hook para lazy loading de PDF libraries
export function usePDFGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generatePDF = useCallback(async (config: PDFGeneratorProps) => {
    setIsLoading(true);
    setError(null);

    try {
      // Lazy load PDF library based on template complexity
      if (config.template === "financial-report") {
        // Use jsPDF for complex tables
        const { generateFinancialReport } = await import("../pdf/financial-pdf");
        return await generateFinancialReport(config.data);
      } else {
        // Use React-PDF for styled documents
        const { generatePatientReport } = await import("../pdf/patient-pdf");
        return await generatePatientReport(config.data);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generatePDF,
    isLoading,
    error,
  };
}
