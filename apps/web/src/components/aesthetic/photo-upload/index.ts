/**
 * Photo Upload + AI Analysis System (T110)
 * Complete solution for aesthetic photo uploads with AI-powered analysis
 * 
 * This package includes:
 * - PhotoUpload: Main component with drag&drop functionality
 * - TreatmentSuggestions: AI-powered treatment recommendations
 * - LGPDConsentManager: Brazilian data protection compliance
 * - AI Analysis Service: OpenAI Vision API integration
 */

// Main Components
export { PhotoUpload } from './PhotoUpload';
export { TreatmentSuggestions, TreatmentComparison } from './TreatmentSuggestions';
export { LGPDConsentManager } from './LGPDConsentManager';

// Types
export type {
  AestheticPhoto,
  AestheticAnalysis,
  TreatmentSuggestion,
} from './PhotoUpload';

export type { LGPDConsentData, ConsentHistory } from './LGPDConsentManager';

// Services
export {
  AestheticAIAnalysisService,
  aestheticAIAnalysisService,
} from '@/services/aesthetic/ai-analysis';

// Utils and helpers
export { TREATMENT_DATABASE } from '@/services/aesthetic/ai-analysis';

// Version
export const PHOTO_UPLOAD_VERSION = '1.0.0';

// Feature flags
export const PHOTO_UPLOAD_FEATURES = {
  dragDrop: true,
  aiAnalysis: true,
  treatmentRecommendations: true,
  lgpdCompliance: true,
  batchUpload: true,
  photoPreview: true,
  treatmentComparison: true,
  exportResults: true,
} as const;

// Default configuration
export const DEFAULT_PHOTO_UPLOAD_CONFIG = {
  maxPhotos: 5,
  maxFileSize: 20, // MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxResolution: 4096,
  minResolution: 512,
  storagePath: 'aesthetic',
} as const;