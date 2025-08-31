"use client";

import dynamic from "next/dynamic";
import { LoadingWithMessage } from "@/components/ui/loading-skeleton";
import { Suspense, useCallback, useState } from "react";

// Dynamic imports for image processing libraries
const ScreenshotCapture = dynamic(
  () => import("../imaging/screenshot-capture").then((mod) => mod.ScreenshotCapture),
  {
    loading: () => <LoadingWithMessage variant="chart" message="Carregando captura de tela..." />,
    ssr: false,
  }
);

const CanvasProcessor = dynamic(
  () => import("../imaging/canvas-processor").then((mod) => mod.CanvasProcessor),
  {
    loading: () => <LoadingWithMessage variant="chart" message="Carregando processador de canvas..." />,
    ssr: false,
  }
);

const SVGRenderer = dynamic(
  () => import("../imaging/svg-renderer").then((mod) => mod.SVGRenderer),
  {
    loading: () => <LoadingWithMessage variant="chart" message="Carregando renderizador SVG..." />,
    ssr: false,
  }
);

// Interfaces
interface ScreenshotOptions {
  element?: HTMLElement;
  selector?: string;
  filename?: string;
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  includeCSS?: boolean;
}

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "png" | "jpeg" | "webp";
  backgroundColor?: string;
}

interface SVGToImageOptions {
  width?: number;
  height?: number;
  format?: "png" | "jpeg";
  quality?: number;
}

// Healthcare-specific screenshot configurations
const HealthcareScreenshotConfig = {
  // High quality for medical reports
  medical: {
    quality: 1,
    scale: 2,
    format: "png" as const,
    backgroundColor: "#ffffff",
  },
  
  // Standard quality for general use
  standard: {
    quality: 0.8,
    scale: 1,
    format: "jpeg" as const,
    backgroundColor: "#ffffff",
  },
  
  // Compressed for sharing
  sharing: {
    quality: 0.6,
    scale: 1,
    format: "webp" as const,
    backgroundColor: "#ffffff",
  },
} as const;

// Dynamic Screenshot Capture
export function DynamicScreenshotCapture(props: any) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="chart" message="Preparando captura..." />}>
      <ScreenshotCapture {...props} />
    </Suspense>
  );
}

// Dynamic Canvas Processor
export function DynamicCanvasProcessor(props: any) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="chart" message="Processando canvas..." />}>
      <CanvasProcessor {...props} />
    </Suspense>
  );
}

// Dynamic SVG Renderer
export function DynamicSVGRenderer(props: any) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="chart" message="Renderizando SVG..." />}>
      <SVGRenderer {...props} />
    </Suspense>
  );
}

// Hook para image processing com lazy loading
export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Capture screenshot using html2canvas
  const captureScreenshot = useCallback(async (options: ScreenshotOptions = {}) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Lazy load html2canvas
      const html2canvas = (await import("html2canvas")).default;
      
      const element = options.element || 
                    (options.selector ? document.querySelector(options.selector) as HTMLElement : document.body);
      
      if (!element) {
        throw new Error("Elemento não encontrado para captura");
      }

      setProgress(30);

      const canvas = await html2canvas(element, {
        scale: options.scale || 1,
        quality: options.quality || 1,
        backgroundColor: options.backgroundColor || "#ffffff",
        useCORS: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      setProgress(60);

      // Convert to desired format
      const format = options.format || "png";
      const mimeType = `image/${format}`;
      const quality = format === "jpeg" ? (options.quality || 0.8) : undefined;
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob === null) {
              reject(new Error('canvas.toBlob returned null'));
            } else {
              resolve(blob);
            }
          },
          mimeType,
          quality
        );
      });

      setProgress(90);

      // Download if filename provided
      if (options.filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${options.filename}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      }

      setProgress(100);
      return blob;

    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  // Convert SVG to image
  const convertSVGToImage = useCallback(async (
    svgElement: SVGElement | string,
    options: SVGToImageOptions = {}
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Lazy load canvg
      const { Canvg } = await import("canvg");
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Failed to get 2D rendering context from canvas");
      }
      
      // Set canvas size
      canvas.width = options.width || 800;
      canvas.height = options.height || 600;
      
      // Get SVG string
      const svgString = typeof svgElement === "string" 
        ? svgElement 
        : new XMLSerializer().serializeToString(svgElement);
      
      // Render SVG to canvas
      const v = Canvg.fromString(ctx, svgString);
      await v.render();
      
      // Convert to blob
      const format = options.format || "png";
      const mimeType = `image/${format}`;
      const quality = format === "jpeg" ? (options.quality || 0.8) : undefined;
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob === null) {
              reject(new Error('canvas.toBlob returned null'));
            } else {
              resolve(blob);
            }
          },
          mimeType,
          quality
        );
      });

      return blob;

    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process medical chart screenshot
  const captureMedicalChart = useCallback(async (chartSelector: string) => {
    return await captureScreenshot({
      selector: chartSelector,
      ...HealthcareScreenshotConfig.medical,
      filename: `medical-chart-${Date.now()}`,
    });
  }, [captureScreenshot]);

  // Process patient report screenshot
  const capturePatientReport = useCallback(async (reportElement: HTMLElement) => {
    return await captureScreenshot({
      element: reportElement,
      ...HealthcareScreenshotConfig.medical,
      filename: `patient-report-${Date.now()}`,
    });
  }, [captureScreenshot]);

  // Capture appointment summary
  const captureAppointmentSummary = useCallback(async (summarySelector: string) => {
    return await captureScreenshot({
      selector: summarySelector,
      ...HealthcareScreenshotConfig.standard,
      filename: `appointment-summary-${Date.now()}`,
    });
  }, [captureScreenshot]);

  return {
    captureScreenshot,
    convertSVGToImage,
    captureMedicalChart,
    capturePatientReport,
    captureAppointmentSummary,
    isProcessing,
    progress,
    error,
  };
}

// Utility functions for healthcare imaging
export const HealthcareImageUtils = {
  // Generate filename with timestamp for medical records
  generateMedicalFilename: (type: "chart" | "report" | "summary" | "prescription", patientId?: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const patient = patientId ? `-patient-${patientId}` : "";
    return `medical-${type}${patient}-${timestamp}`;
  },

  // Validate image quality for medical use
  validateMedicalQuality: (canvas: HTMLCanvasElement): boolean => {
    // Check minimum resolution for medical images
    const minWidth = 800;
    const minHeight = 600;
    const minQuality = 0.8;
    
    if (canvas.width < minWidth || canvas.height < minHeight) {
      return false;
    }
    
    // Additional quality checks could be added here
    return true;
  },

  // Add watermark for medical compliance
  addComplianceWatermark: async (canvas: HTMLCanvasElement, clinicName: string): Promise<HTMLCanvasElement> => {
    const ctx = canvas.getContext("2d")!;
    
    // Add timestamp watermark
    const timestamp = new Date().toLocaleString("pt-BR");
    const watermarkText = `${clinicName} - ${timestamp}`;
    
    ctx.font = "12px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.textAlign = "right";
    ctx.fillText(watermarkText, canvas.width - 10, canvas.height - 10);
    
    return canvas;
  },

  // Compress image for LGPD compliance (reduce file size for storage)
  compressForStorage: async (blob: Blob, maxSizeKB: number = 500): Promise<Blob> => {
    if (blob.size <= maxSizeKB * 1024) {
      return blob;
    }

    // Create canvas for compression
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Calculate new dimensions to fit size limit
        const scale = Math.sqrt((maxSizeKB * 1024) / blob.size);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (compressedBlob) => resolve(compressedBlob!),
          "image/jpeg",
          0.7
        );
      };
      
      img.src = URL.createObjectURL(blob);
    });
  },
} as const;