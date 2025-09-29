/**
 * Font Types for NEONPRO Theme System
 */

export interface FontInstallationRequest {
  sourceUrl: string;
  targetPath: string;
  weights: number[];
  brazilianOptimization?: boolean;
  aestheticClinicOptimized?: boolean;
}

export interface FontInstallationResponse {
  success: boolean;
  fontFiles: string[];
  fileSize: number;
  brazilianOptimized?: boolean;
}