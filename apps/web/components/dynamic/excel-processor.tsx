"use client";

import dynamic from "next/dynamic";
import { LoadingWithMessage } from "@/components/ui/loading-skeleton";
import { Suspense, useCallback, useState } from "react";

// Dynamic imports for Excel libraries
const ExcelImporter = dynamic(
  () => import("../excel/excel-importer").then((mod) => mod.ExcelImporter),
  {
    loading: () => <LoadingWithMessage variant="excel" message="Carregando importador Excel..." />,
    ssr: false,
  }
);

const ExcelExporter = dynamic(
  () => import("../excel/excel-exporter").then((mod) => mod.ExcelExporter),
  {
    loading: () => <LoadingWithMessage variant="excel" message="Carregando exportador Excel..." />,
    ssr: false,
  }
);

const CSVProcessor = dynamic(
  () => import("../excel/csv-processor").then((mod) => mod.CSVProcessor),
  {
    loading: () => <LoadingWithMessage variant="excel" message="Carregando processador CSV..." />,
    ssr: false,
  }
);

// Interfaces
interface ExcelData {
  headers: string[];
  rows: unknown[][];
  metadata?: {
    fileName?: string;
    sheetName?: string;
    totalRows?: number;
    processedAt?: Date;
  };
}

interface ExcelImporterProps {
  onDataLoaded: (data: ExcelData) => void;
  onError?: (error: Error) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in bytes
  template?: "patients" | "appointments" | "financial" | "inventory";
}

interface ExcelExporterProps {
  data: ExcelData;
  filename?: string;
  format?: "xlsx" | "csv";
  template?: "patients" | "appointments" | "financial" | "inventory";
}

interface CSVProcessorProps {
  data: string | File;
  delimiter?: "," | ";" | "\t";
  encoding?: "utf-8" | "latin1";
  onProcessed: (data: ExcelData) => void;
  onError?: (error: Error) => void;
}

// Dynamic Excel Importer
export function DynamicExcelImporter(props: ExcelImporterProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="excel" message="Carregando importador..." />}>
      <ExcelImporter {...props} />
    </Suspense>
  );
}

// Dynamic Excel Exporter
export function DynamicExcelExporter(props: ExcelExporterProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="excel" message="Carregando exportador..." />}>
      <ExcelExporter {...props} />
    </Suspense>
  );
}

// Dynamic CSV Processor
export function DynamicCSVProcessor(props: CSVProcessorProps) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="excel" message="Processando CSV..." />}>
      <CSVProcessor {...props} />
    </Suspense>
  );
}

// Hook para Excel processing com lazy loading
export function useExcelProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Import Excel file
  const importExcel = useCallback(async (file: File, template?: string, maxFileSize?: number): Promise<ExcelData> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Check file size before processing
      if (maxFileSize && file.size > maxFileSize) {
        const errorMsg = `Arquivo muito grande (${Math.round(file.size / 1024 / 1024)}MB). Tamanho máximo permitido: ${Math.round(maxFileSize / 1024 / 1024)}MB`;
        setError(new Error(errorMsg));
        setIsProcessing(false);
        setProgress(0);
        throw new Error(errorMsg);
      }

      // Lazy load xlsx library
      const XLSX = await import("xlsx");
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            setProgress(30);
            
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            setProgress(60);
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1) as unknown[][];
            
            setProgress(90);
            
            const result: ExcelData = {
              headers,
              rows,
              metadata: {
                fileName: file.name,
                sheetName,
                totalRows: rows.length,
                processedAt: new Date(),
              },
            };
            
            setProgress(100);
            resolve(result);
          } catch (err) {
            reject(new Error(`Erro ao processar arquivo Excel: ${(err as Error).message}`));
          }
        };
        
        reader.onerror = () => {
          reject(new Error("Erro ao ler arquivo"));
        };
        
        reader.readAsArrayBuffer(file);
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  // Export to Excel
  const exportToExcel = useCallback(async (data: ExcelData, filename = "export.xlsx") => {
    setIsProcessing(true);
    setError(null);

    try {
      // Lazy load xlsx library
      const XLSX = await import("xlsx");
      
      const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      
      // Generate file and trigger download
      XLSX.writeFile(wb, filename);
      
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process CSV with lazy loading
  const processCSV = useCallback(async (csvData: string, delimiter = ","): Promise<ExcelData> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Lazy load csv-parse library
      const { parse } = await import("csv-parse/sync");
      
      const records = parse(csvData, {
        delimiter,
        skip_empty_lines: true,
        trim: true,
      });
      
      const headers = records[0];
      const rows = records.slice(1);
      
      return {
        headers,
        rows,
        metadata: {
          totalRows: rows.length,
          processedAt: new Date(),
        },
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    importExcel,
    exportToExcel,
    processCSV,
    isProcessing,
    progress,
    error,
  };
}

// Template validation for healthcare data
export const ExcelTemplates = {
  patients: {
    requiredHeaders: ["nome", "cpf", "telefone", "email"],
    optionalHeaders: ["data_nascimento", "endereco", "observacoes"],
    validation: (data: ExcelData) => {
      // Validate patient data structure - ensure all required headers are present
      if (!data.headers) {return false;}
      const requiredHeaders = ["nome", "cpf"];
      const normalizedHeaders = new Set(data.headers.map(h => h.toLowerCase().trim()));
      return requiredHeaders.every(h => normalizedHeaders.has(h));
    },
  },
  appointments: {
    requiredHeaders: ["paciente", "data", "horario", "procedimento"],
    optionalHeaders: ["observacoes", "valor", "status"],
    validation: (data: ExcelData) => {
      // Validate appointment data structure - ensure all required headers are present
      if (!data.headers) {return false;}
      const requiredHeaders = ["data", "horario", "paciente", "procedimento"];
      const normalizedHeaders = new Set(data.headers.map(h => h.toLowerCase().trim()));
      return requiredHeaders.every(h => normalizedHeaders.has(h));
    },
  },
  financial: {
    requiredHeaders: ["descricao", "valor", "data", "tipo"],
    optionalHeaders: ["categoria", "observacoes", "paciente"],
    validation: (data: ExcelData) => {
      // Validate financial data structure - ensure all required headers are present
      if (!data.headers) {return false;}
      const requiredHeaders = ["descricao", "valor", "data", "tipo"];
      const normalizedHeaders = new Set(data.headers.map(h => h.toLowerCase().trim()));
      return requiredHeaders.every(h => normalizedHeaders.has(h));
    },
  },
} as const;