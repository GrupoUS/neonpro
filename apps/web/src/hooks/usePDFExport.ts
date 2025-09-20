import {
  type DocumentProps as PDFDocumentProps,
  pdf,
} from "@react-pdf/renderer";
// Use local shim to avoid CI resolution issues with file-saver on Vercel
import { saveAs } from "@/shims/file-saver";

/**
 * Narrow PDF Document props type.
 * If the upstream library changes its export name or structure, adjust here centrally.
 */
export type DocumentProps = PDFDocumentProps;
import { useState } from "react";
import { toast } from "sonner";

interface UsePDFExportOptions {
  filename?: string;
  autoDownload?: boolean;
  showPreview?: boolean;
}

interface UsePDFExportReturn {
  isGenerating: boolean;
  generatePDF: (
    component: React.ReactElement<PDFDocumentProps>,
    options?: UsePDFExportOptions,
  ) => Promise<Blob | null>;
  downloadPDF: (
    component: React.ReactElement<PDFDocumentProps>,
    filename: string,
  ) => Promise<void>;
  previewPDF: (
    component: React.ReactElement<PDFDocumentProps>,
  ) => Promise<void>;
  error: string | null;
}

export const usePDFExport = (): UsePDFExportReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async (
    component: React.ReactElement<PDFDocumentProps>,
    options?: UsePDFExportOptions,
  ): Promise<Blob | null> => {
    try {
      setIsGenerating(true);
      setError(null);

      const startTime = performance.now();

      // Gerar o PDF
      const blob = await pdf(component).toBlob();

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;

      // Log de performance (deve ser <2s conforme critério de aceite)
      if (duration > 2) {
        console.warn(
          `PDF generation took ${duration.toFixed(2)}s (>2s threshold)`,
        );
      }

      // Auto download se especificado
      if (options?.autoDownload && options?.filename) {
        saveAs(blob, options.filename);
        toast.success(`PDF "${options.filename}" baixado com sucesso!`);
      }

      // Preview se especificado
      if (options?.showPreview) {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // Cleanup URL após um tempo
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }

      return blob;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido na geração do PDF";
      setError(errorMessage);
      toast.error(`Erro ao gerar PDF: ${errorMessage}`);
      console.error("PDF generation error:", err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async (
    component: React.ReactElement<PDFDocumentProps>,
    filename: string,
  ): Promise<void> => {
    await generatePDF(component, {
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      autoDownload: true,
    });
  };

  const previewPDF = async (
    component: React.ReactElement<any>,
  ): Promise<void> => {
    await generatePDF(component, { showPreview: true });
  };

  return {
    isGenerating,
    generatePDF,
    downloadPDF,
    previewPDF,
    error,
  };
};

// Utility functions para nomes de arquivo padronizados
const normalizeNameForFilename = (name: string): string => {
  return name
    .normalize("NFD") // Decompõe acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas diacríticas (acentos)
    .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove caracteres especiais, mantendo espaços e hífens
    .replace(/[-\s]+/g, "_") // Substitui espaços e hífens por underscore
    .replace(/_+/g, "_") // Remove underscores duplicados
    .toLowerCase();
};

export const generatePDFFilename = (
  type: "assessment" | "treatment" | "consent",
  patientName: string,
  date?: Date,
): string => {
  const now = date || new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const cleanName = normalizeNameForFilename(patientName);

  const typeMap = {
    assessment: "avaliacao_estetica",
    treatment: "plano_tratamento",
    consent: "termo_consentimento",
  };

  return `${typeMap[type]}_${cleanName}_${dateStr}.pdf`;
};

export default usePDFExport;
