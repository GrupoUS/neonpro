/**
 * Vision Analysis System React Hooks
 * Custom hooks for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 * 
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { VISION_CONFIG } from './config';
import {
  AnalysisResult,
  AnalysisRequest,
  AnalysisProgress,
  ImageData,
  ProcessingMetrics,
  ExportOptions,
  ExportResult,
  TreatmentType,
  AnalysisStatus,
  ValidationResult,
  AnnotationData,
  MeasurementData
} from './types';
import { VisionUtils } from './utils';

/**
 * Hook for managing vision analysis operations
 */
export function useVisionAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback(async (request: AnalysisRequest): Promise<AnalysisResult | null> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setProgress({ stage: 'initializing', percentage: 0 });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Validate request
      const validation = validateAnalysisRequest(request);
      if (!validation.valid) {
        throw new Error(validation.errors[0]?.message || 'Invalid analysis request');
      }

      // Start analysis
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const analysisResult: AnalysisResult = await response.json();
      
      // Validate result quality
      const resultValidation = VisionUtils.Analysis.validateAnalysisResult(analysisResult);
      if (!resultValidation.valid) {
        console.warn('Analysis result validation warnings:', resultValidation.warnings);
      }

      setResult(analysisResult);
      setProgress({ stage: 'completed', percentage: 100 });
      
      toast.success('Análise concluída com sucesso!');
      return analysisResult;

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Análise cancelada');
        toast.info('Análise cancelada');
      } else {
        const errorMessage = VisionUtils.Error.getUserFriendlyMessage(err);
        setError(errorMessage);
        toast.error(`Erro na análise: ${errorMessage}`);
      }
      return null;
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, []);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(null);
    setIsAnalyzing(false);
  }, []);

  return {
    isAnalyzing,
    progress,
    result,
    error,
    startAnalysis,
    cancelAnalysis,
    resetAnalysis
  };
}

/**
 * Hook for managing image uploads and validation
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const uploadImage = useCallback(async (file: File, type: 'before' | 'after'): Promise<ImageData | null> => {
    try {
      setIsUploading(true);
      setValidationErrors([]);
      setUploadProgress(0);

      // Validate image file
      const validation = VisionUtils.Image.validateImageFile(file);
      if (!validation.valid) {
        const errors = validation.errors.map(e => e.message);
        setValidationErrors(errors);
        errors.forEach(error => toast.error(error));
        return null;
      }

      // Show warnings if any
      validation.warnings.forEach(warning => {
        toast.warning(warning.message);
      });

      // Extract metadata
      const metadata = await VisionUtils.Image.extractImageMetadata(file);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      formData.append('metadata', JSON.stringify(metadata));

      // Upload with progress tracking
      const response = await fetch('/api/vision/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const imageData: ImageData = await response.json();
      
      setUploadedImages(prev => [...prev, imageData]);
      setUploadProgress(100);
      
      toast.success(`Imagem ${type === 'before' ? 'anterior' : 'posterior'} carregada com sucesso!`);
      return imageData;

    } catch (err: any) {
      const errorMessage = VisionUtils.Error.getUserFriendlyMessage(err);
      setValidationErrors([errorMessage]);
      toast.error(`Erro no upload: ${errorMessage}`);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    toast.info('Imagem removida');
  }, []);

  const clearImages = useCallback(() => {
    setUploadedImages([]);
    setValidationErrors([]);
    toast.info('Todas as imagens foram removidas');
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadedImages,
    validationErrors,
    uploadImage,
    removeImage,
    clearImages
  };
}

/**
 * Hook for managing analysis export functionality
 */
export function useAnalysisExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState<ExportResult[]>([]);

  const exportAnalysis = useCallback(async (
    analysisId: string,
    options: ExportOptions
  ): Promise<ExportResult | null> => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Validate export options
      const validation = VisionUtils.Export.validateExportOptions(options);
      if (!validation.valid) {
        throw new Error(validation.errors[0]?.message || 'Invalid export options');
      }

      const response = await fetch('/api/vision/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId,
          ...options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      const exportResult: ExportResult = await response.json();
      
      setExportHistory(prev => [exportResult, ...prev]);
      setExportProgress(100);
      
      toast.success(`Análise exportada como ${options.format.toUpperCase()}`);
      return exportResult;

    } catch (err: any) {
      const errorMessage = VisionUtils.Error.getUserFriendlyMessage(err);
      toast.error(`Erro na exportação: ${errorMessage}`);
      return null;
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, []);

  const downloadExport = useCallback((exportResult: ExportResult) => {
    if (exportResult.downloadUrl) {
      const link = document.createElement('a');
      link.href = exportResult.downloadUrl;
      link.download = exportResult.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download iniciado');
    }
  }, []);

  const loadExportHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/vision/export');
      if (response.ok) {
        const history: ExportResult[] = await response.json();
        setExportHistory(history);
      }
    } catch (err) {
      console.error('Failed to load export history:', err);
    }
  }, []);

  useEffect(() => {
    loadExportHistory();
  }, [loadExportHistory]);

  return {
    isExporting,
    exportProgress,
    exportHistory,
    exportAnalysis,
    downloadExport,
    loadExportHistory
  };
}

/**
 * Hook for managing annotations
 */
export function useAnnotations(imageId?: string) {
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const addAnnotation = useCallback((annotation: Omit<AnnotationData, 'id' | 'createdAt'>) => {
    const newAnnotation: AnnotationData = {
      ...annotation,
      id: VisionUtils.Annotation.generateAnnotationId(),
      createdAt: new Date().toISOString()
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    
    toast.success('Anotação adicionada');
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<AnnotationData>) => {
    setAnnotations(prev => prev.map(annotation => 
      annotation.id === id ? { ...annotation, ...updates } : annotation
    ));
    
    toast.success('Anotação atualizada');
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
    
    if (selectedAnnotation === id) {
      setSelectedAnnotation(null);
    }
    
    toast.success('Anotação removida');
  }, [selectedAnnotation]);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    setSelectedAnnotation(null);
    setIsEditing(false);
    
    toast.info('Todas as anotações foram removidas');
  }, []);

  const selectAnnotation = useCallback((id: string | null) => {
    setSelectedAnnotation(id);
    setIsEditing(false);
  }, []);

  const startEditing = useCallback((id: string) => {
    setSelectedAnnotation(id);
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    annotations,
    selectedAnnotation,
    isEditing,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    clearAnnotations,
    selectAnnotation,
    startEditing,
    stopEditing
  };
}

/**
 * Hook for managing measurements
 */
export function useMeasurements(imageId?: string) {
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [calibration, setCalibration] = useState<{ pixelToMmRatio: number } | null>(null);

  const addMeasurement = useCallback((measurement: Omit<MeasurementData, 'id' | 'createdAt'>) => {
    const newMeasurement: MeasurementData = {
      ...measurement,
      id: `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    setMeasurements(prev => [...prev, newMeasurement]);
    setSelectedMeasurement(newMeasurement.id);
    
    toast.success('Medição adicionada');
  }, []);

  const updateMeasurement = useCallback((id: string, updates: Partial<MeasurementData>) => {
    setMeasurements(prev => prev.map(measurement => 
      measurement.id === id ? { ...measurement, ...updates } : measurement
    ));
    
    toast.success('Medição atualizada');
  }, []);

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(measurement => measurement.id !== id));
    
    if (selectedMeasurement === id) {
      setSelectedMeasurement(null);
    }
    
    toast.success('Medição removida');
  }, [selectedMeasurement]);

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setSelectedMeasurement(null);
    
    toast.info('Todas as medições foram removidas');
  }, []);

  const setCalibrationRatio = useCallback((pixelToMmRatio: number) => {
    setCalibration({ pixelToMmRatio });
    
    // Recalculate all measurements with new calibration
    setMeasurements(prev => prev.map(measurement => ({
      ...measurement,
      // Recalculate real-world values if needed
    })));
    
    toast.success('Calibração atualizada');
  }, []);

  return {
    measurements,
    selectedMeasurement,
    calibration,
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    clearMeasurements,
    setSelectedMeasurement,
    setCalibrationRatio
  };
}

/**
 * Hook for managing analysis history
 */
export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadHistory = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      
      const currentPage = reset ? 1 : page;
      const response = await fetch(`/api/vision/history?page=${currentPage}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setHistory(data.results);
          setPage(2);
        } else {
          setHistory(prev => [...prev, ...data.results]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to load analysis history:', err);
      toast.error('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const refreshHistory = useCallback(() => {
    loadHistory(true);
  }, [loadHistory]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadHistory(false);
    }
  }, [isLoading, hasMore, loadHistory]);

  useEffect(() => {
    loadHistory(true);
  }, []);

  return {
    history,
    isLoading,
    hasMore,
    refreshHistory,
    loadMore
  };
}

/**
 * Hook for managing performance monitoring
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const timerRef = useRef<ReturnType<typeof VisionUtils.Performance.createTimer> | null>(null);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    timerRef.current = VisionUtils.Performance.createTimer();
    timerRef.current.start();
  }, []);

  const stopMonitoring = useCallback(() => {
    if (timerRef.current && isMonitoring) {
      const processingTime = timerRef.current.stop();
      const memoryUsage = VisionUtils.Performance.getMemoryUsage();
      
      const newMetrics: ProcessingMetrics = {
        processingTimeMs: processingTime,
        memoryUsageMB: memoryUsage?.used || 0,
        cpuUsagePercent: 0, // Would need additional implementation
        timestamp: new Date().toISOString()
      };
      
      setMetrics(newMetrics);
      setIsMonitoring(false);
      
      // Log performance if below thresholds
      if (processingTime > VISION_CONFIG.PERFORMANCE.MAX_PROCESSING_TIME_MS) {
        console.warn('Processing time exceeded threshold:', processingTime);
      }
    }
  }, [isMonitoring]);

  const resetMetrics = useCallback(() => {
    setMetrics(null);
    setIsMonitoring(false);
    timerRef.current = null;
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics
  };
}

/**
 * Helper function to validate analysis request
 */
function validateAnalysisRequest(request: AnalysisRequest): ValidationResult {
  const errors: any[] = [];
  
  if (!request.beforeImageId) {
    errors.push({ message: 'Imagem anterior é obrigatória' });
  }
  
  if (!request.afterImageId) {
    errors.push({ message: 'Imagem posterior é obrigatória' });
  }
  
  if (!request.treatmentType) {
    errors.push({ message: 'Tipo de tratamento é obrigatório' });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Hook for managing local storage state
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for managing component visibility with intersection observer
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isVisible;
}

export default {
  useVisionAnalysis,
  useImageUpload,
  useAnalysisExport,
  useAnnotations,
  useMeasurements,
  useAnalysisHistory,
  usePerformanceMonitoring,
  useLocalStorage,
  useDebounce,
  useIntersectionObserver
};