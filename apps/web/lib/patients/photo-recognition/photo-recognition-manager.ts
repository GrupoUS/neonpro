/**
 * Photo Recognition Manager
 * Handles patient photo recognition, verification, and biometric matching
 *
 * Features:
 * - Facial recognition for patient identification
 * - Photo verification workflow
 * - Privacy controls and LGPD compliance
 * - Photo quality validation and enhancement
 * - Biometric comparison for security
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */

import type { AuditLogger } from '../../audit/audit-logger';
import type { LGPDManager } from '../../security/lgpd-manager';

// Types and Interfaces
export type PhotoRecognitionConfig = {
  enabled: boolean;
  confidenceThreshold: number; // 0.0 to 1.0
  maxPhotosPerPatient: number;
  allowedFormats: string[];
  maxFileSize: number; // in bytes
  qualityThreshold: number; // 0.0 to 1.0
  privacyMode: 'strict' | 'standard' | 'minimal';
  retentionDays: number;
};

export type PhotoMetadata = {
  id: string;
  patientId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  quality: number;
  uploadDate: Date;
  lastAccessed?: Date;
};

export type FacialFeatures = {
  landmarks: number[][];
  encoding: number[];
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type RecognitionResult = {
  success: boolean;
  patientId?: string;
  confidence: number;
  matches: PatientMatch[];
  features?: FacialFeatures;
  error?: string;
};

export type PatientMatch = {
  patientId: string;
  patientName: string;
  confidence: number;
  lastSeen: Date;
  photoId: string;
};

export type VerificationRequest = {
  photoFile: File | Buffer;
  patientId: string;
  verificationContext: 'check_in' | 'appointment' | 'security' | 'registration';
  metadata?: Record<string, any>;
};

export type VerificationResult = {
  verified: boolean;
  confidence: number;
  patientMatch?: PatientMatch;
  securityFlags: string[];
  recommendations: string[];
  processingTime: number;
};

export type PhotoQualityAssessment = {
  overall: number; // 0.0 to 1.0
  sharpness: number;
  lighting: number;
  faceVisibility: number;
  resolution: number;
  recommendations: string[];
};

export type PrivacyControls = {
  allowFacialRecognition: boolean;
  allowBiometricStorage: boolean;
  allowPhotoSharing: boolean;
  dataRetentionDays: number;
  anonymizeAfterDays?: number;
};

export class PhotoRecognitionManager {
  private readonly supabase: any;
  private readonly auditLogger: AuditLogger;
  private readonly lgpdManager: LGPDManager;
  private readonly config: PhotoRecognitionConfig;

  constructor(
    supabase: any,
    auditLogger: AuditLogger,
    lgpdManager: LGPDManager,
    config: PhotoRecognitionConfig
  ) {
    this.supabase = supabase;
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.config = config;
  }

  /**
   * Upload and process patient photo with recognition
   */
  async uploadPatientPhoto(
    patientId: string,
    photoFile: File | Buffer,
    photoType: 'profile' | 'before' | 'after' | 'document' | 'verification',
    userId: string
  ): Promise<{
    photoId: string;
    metadata: PhotoMetadata;
    recognition?: RecognitionResult;
  }> {
    try {
      // Validate LGPD consent
      const hasConsent = await this.lgpdManager.checkConsent(
        patientId,
        'photo_processing'
      );

      if (!hasConsent) {
        throw new Error('Patient consent required for photo processing');
      }

      // Validate photo quality
      const qualityAssessment = await this.assessPhotoQuality(photoFile);
      if (qualityAssessment.overall < this.config.qualityThreshold) {
        throw new Error(
          `Photo quality too low: ${qualityAssessment.recommendations.join(', ')}`
        );
      }

      // Generate unique filename
      const fileExtension = this.getFileExtension(photoFile);
      const filename = `${patientId}/${photoType}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await this.supabase.storage
          .from('patient-photos')
          .upload(filename, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Extract photo metadata
      const metadata: PhotoMetadata = {
        id: crypto.randomUUID(),
        patientId,
        filename,
        originalName:
          photoFile instanceof File ? photoFile.name : 'uploaded_photo',
        mimeType: photoFile instanceof File ? photoFile.type : 'image/jpeg',
        size:
          photoFile instanceof File
            ? photoFile.size
            : Buffer.byteLength(photoFile as Buffer),
        width: 0, // Will be extracted from image
        height: 0, // Will be extracted from image
        quality: qualityAssessment.overall,
        uploadDate: new Date(),
      };

      // Extract image dimensions
      const dimensions = await this.extractImageDimensions(photoFile);
      metadata.width = dimensions.width;
      metadata.height = dimensions.height;

      // Perform facial recognition if enabled
      let recognitionResult: RecognitionResult | undefined;
      if (this.config.enabled && photoType === 'profile') {
        recognitionResult = await this.performFacialRecognition(
          photoFile,
          patientId
        );
      }

      // Store photo metadata in database
      const { error: dbError } = await this.supabase
        .from('patient_photos')
        .insert({
          id: metadata.id,
          patient_id: patientId,
          filename: metadata.filename,
          original_name: metadata.originalName,
          mime_type: metadata.mimeType,
          size: metadata.size,
          width: metadata.width,
          height: metadata.height,
          quality: metadata.quality,
          photo_type: photoType,
          recognition_data: recognitionResult?.features || null,
          upload_date: metadata.uploadDate,
          uploaded_by: userId,
        });

      if (dbError) {
        // Cleanup uploaded file
        await this.supabase.storage.from('patient-photos').remove([filename]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: 'photo_upload',
        userId,
        resourceType: 'patient_photo',
        resourceId: metadata.id,
        details: {
          patientId,
          photoType,
          fileSize: metadata.size,
          quality: metadata.quality,
          recognitionEnabled: this.config.enabled,
        },
      });

      return {
        photoId: metadata.id,
        metadata,
        recognition: recognitionResult,
      };
    } catch (error) {
      await this.auditLogger.log({
        action: 'photo_upload_failed',
        userId,
        resourceType: 'patient_photo',
        details: {
          patientId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Verify patient identity using photo
   */
  async verifyPatientIdentity(
    request: VerificationRequest,
    userId: string
  ): Promise<VerificationResult> {
    const startTime = Date.now();

    try {
      // Check LGPD consent
      const hasConsent = await this.lgpdManager.checkConsent(
        request.patientId,
        'biometric_verification'
      );

      if (!hasConsent) {
        throw new Error('Patient consent required for biometric verification');
      }

      // Assess photo quality
      const qualityAssessment = await this.assessPhotoQuality(
        request.photoFile
      );
      if (qualityAssessment.overall < this.config.qualityThreshold) {
        return {
          verified: false,
          confidence: 0,
          securityFlags: ['low_photo_quality'],
          recommendations: qualityAssessment.recommendations,
          processingTime: Date.now() - startTime,
        };
      }

      // Perform facial recognition
      const recognitionResult = await this.performFacialRecognition(
        request.photoFile,
        request.patientId
      );

      if (!recognitionResult.success) {
        return {
          verified: false,
          confidence: 0,
          securityFlags: ['recognition_failed'],
          recommendations: [
            'Please ensure face is clearly visible',
            'Try better lighting',
          ],
          processingTime: Date.now() - startTime,
        };
      }

      // Find best match
      const bestMatch = recognitionResult.matches
        .filter((match) => match.patientId === request.patientId)
        .sort((a, b) => b.confidence - a.confidence)[0];

      const verified =
        bestMatch && bestMatch.confidence >= this.config.confidenceThreshold;
      const securityFlags: string[] = [];
      const recommendations: string[] = [];

      // Security analysis
      if (bestMatch && bestMatch.confidence < 0.8) {
        securityFlags.push('low_confidence_match');
        recommendations.push('Consider additional verification methods');
      }

      if (recognitionResult.matches.length > 1) {
        securityFlags.push('multiple_matches_found');
        recommendations.push('Manual verification recommended');
      }

      // Log verification attempt
      await this.auditLogger.log({
        action: 'patient_verification',
        userId,
        resourceType: 'patient',
        resourceId: request.patientId,
        details: {
          context: request.verificationContext,
          verified,
          confidence: bestMatch?.confidence || 0,
          securityFlags,
          processingTime: Date.now() - startTime,
        },
      });

      return {
        verified,
        confidence: bestMatch?.confidence || 0,
        patientMatch: bestMatch,
        securityFlags,
        recommendations,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      await this.auditLogger.log({
        action: 'verification_failed',
        userId,
        resourceType: 'patient',
        resourceId: request.patientId,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          context: request.verificationContext,
        },
      });

      return {
        verified: false,
        confidence: 0,
        securityFlags: ['verification_error'],
        recommendations: ['Please try again or contact support'],
        processingTime: Date.now() - startTime,
      };
    }
  } /**
   * Perform facial recognition on photo
   */
  private async performFacialRecognition(
    photoFile: File | Buffer,
    patientId?: string
  ): Promise<RecognitionResult> {
    try {
      // Convert photo to base64 for processing
      const photoBase64 = await this.convertToBase64(photoFile);

      // Extract facial features (placeholder for actual ML implementation)
      const features = await this.extractFacialFeatures(photoBase64);

      if (!features) {
        return {
          success: false,
          confidence: 0,
          matches: [],
          error: 'No face detected in photo',
        };
      }

      // Search for matches in database
      const matches = await this.searchFacialMatches(features, patientId);

      // Find best match
      const bestMatch = matches.length > 0 ? matches[0] : null;

      return {
        success: true,
        patientId: bestMatch?.patientId,
        confidence: bestMatch?.confidence || 0,
        matches,
        features,
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        matches: [],
        error: error instanceof Error ? error.message : 'Recognition failed',
      };
    }
  }

  /**
   * Extract facial features from photo (ML placeholder)
   */
  private async extractFacialFeatures(
    _photoBase64: string
  ): Promise<FacialFeatures | null> {
    // Placeholder implementation - in production, integrate with:
    // - AWS Rekognition
    // - Azure Face API
    // - Google Cloud Vision
    // - OpenCV with face_recognition library

    try {
      // Simulate ML processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Mock facial features extraction
      const mockFeatures: FacialFeatures = {
        landmarks: [
          [100, 120],
          [150, 120], // Eyes
          [125, 140], // Nose
          [110, 160],
          [140, 160], // Mouth corners
        ],
        encoding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
        confidence: 0.85 + Math.random() * 0.1,
        boundingBox: {
          x: 80,
          y: 100,
          width: 90,
          height: 120,
        },
      };

      return mockFeatures;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Search for facial matches in database
   */
  private async searchFacialMatches(
    features: FacialFeatures,
    excludePatientId?: string
  ): Promise<PatientMatch[]> {
    try {
      // Query stored facial encodings
      let query = this.supabase
        .from('patient_photos')
        .select(
          `
          id,
          patient_id,
          recognition_data,
          upload_date,
          patients!inner(id, name)
        `
        )
        .not('recognition_data', 'is', null)
        .eq('photo_type', 'profile');

      if (excludePatientId) {
        query = query.neq('patient_id', excludePatientId);
      }

      const { data: storedPhotos, error } = await query;

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      const matches: PatientMatch[] = [];

      // Compare with stored encodings
      for (const photo of storedPhotos || []) {
        if (!photo.recognition_data?.encoding) {
          continue;
        }

        const similarity = this.calculateFacialSimilarity(
          features.encoding,
          photo.recognition_data.encoding
        );

        if (similarity >= this.config.confidenceThreshold) {
          matches.push({
            patientId: photo.patient_id,
            patientName: photo.patients.name,
            confidence: similarity,
            lastSeen: new Date(photo.upload_date),
            photoId: photo.id,
          });
        }
      }

      // Sort by confidence (highest first)
      return matches.sort((a, b) => b.confidence - a.confidence);
    } catch (_error) {
      return [];
    }
  }

  /**
   * Calculate facial similarity between two encodings
   */
  private calculateFacialSimilarity(
    encoding1: number[],
    encoding2: number[]
  ): number {
    if (encoding1.length !== encoding2.length) {
      return 0;
    }

    // Calculate Euclidean distance
    let distance = 0;
    for (let i = 0; i < encoding1.length; i++) {
      distance += (encoding1[i] - encoding2[i]) ** 2;
    }
    distance = Math.sqrt(distance);

    // Convert distance to similarity (0-1 scale)
    // Lower distance = higher similarity
    const maxDistance = Math.sqrt(encoding1.length * 4); // Theoretical max
    const similarity = Math.max(0, 1 - distance / maxDistance);

    return Math.min(1, similarity);
  }

  /**
   * Assess photo quality
   */
  private async assessPhotoQuality(
    photoFile: File | Buffer
  ): Promise<PhotoQualityAssessment> {
    try {
      // Placeholder implementation - in production, use image analysis libraries
      const fileSize =
        photoFile instanceof File
          ? photoFile.size
          : Buffer.byteLength(photoFile as Buffer);
      const recommendations: string[] = [];

      // Basic quality checks
      const sharpness = 0.8 + Math.random() * 0.2; // Mock sharpness score
      const lighting = 0.7 + Math.random() * 0.3; // Mock lighting score
      const faceVisibility = 0.85 + Math.random() * 0.15; // Mock face visibility
      const resolution = fileSize > 100_000 ? 0.9 : 0.6; // Basic resolution check

      // Generate recommendations
      if (sharpness < 0.7) {
        recommendations.push('Image appears blurry - ensure camera is steady');
      }
      if (lighting < 0.6) {
        recommendations.push('Poor lighting - use better illumination');
      }
      if (faceVisibility < 0.8) {
        recommendations.push('Face not clearly visible - center face in frame');
      }
      if (resolution < 0.7) {
        recommendations.push('Low resolution - use higher quality camera');
      }

      const overall = (sharpness + lighting + faceVisibility + resolution) / 4;

      return {
        overall,
        sharpness,
        lighting,
        faceVisibility,
        resolution,
        recommendations,
      };
    } catch (_error) {
      return {
        overall: 0.5,
        sharpness: 0.5,
        lighting: 0.5,
        faceVisibility: 0.5,
        resolution: 0.5,
        recommendations: ['Unable to assess photo quality - please try again'],
      };
    }
  }

  /**
   * Extract image dimensions
   */
  private async extractImageDimensions(
    photoFile: File | Buffer
  ): Promise<{ width: number; height: number }> {
    try {
      // Placeholder implementation - in production, use image processing library
      // like sharp, jimp, or canvas

      // Mock dimensions based on file size
      const fileSize =
        photoFile instanceof File
          ? photoFile.size
          : Buffer.byteLength(photoFile as Buffer);

      if (fileSize > 500_000) {
        return { width: 1920, height: 1080 };
      }
      if (fileSize > 200_000) {
        return { width: 1280, height: 720 };
      }
      return { width: 640, height: 480 };
    } catch (_error) {
      return { width: 640, height: 480 }; // Default dimensions
    }
  }

  /**
   * Convert file to base64
   */
  private async convertToBase64(file: File | Buffer): Promise<string> {
    if (file instanceof Buffer) {
      return file.toString('base64');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:image/... prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get file extension from file
   */
  private getFileExtension(file: File | Buffer): string {
    if (file instanceof File) {
      const name = file.name;
      return name.substring(name.lastIndexOf('.') + 1).toLowerCase();
    }
    return 'jpg'; // Default for Buffer
  }

  /**
   * Get patient photos with privacy controls
   */
  async getPatientPhotos(
    patientId: string,
    photoType?: string,
    userId?: string
  ): Promise<PhotoMetadata[]> {
    try {
      // Check privacy controls
      const privacyControls = await this.getPatientPrivacyControls(patientId);

      let query = this.supabase
        .from('patient_photos')
        .select('*')
        .eq('patient_id', patientId)
        .order('upload_date', { ascending: false });

      if (photoType) {
        query = query.eq('photo_type', photoType);
      }

      const { data: photos, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch photos: ${error.message}`);
      }

      // Apply privacy filters
      const filteredPhotos =
        photos?.filter((photo) => {
          // Check if photo sharing is allowed
          if (
            !privacyControls.allowPhotoSharing &&
            userId !== photo.uploaded_by
          ) {
            return false;
          }

          // Check retention period
          const uploadDate = new Date(photo.upload_date);
          const daysSinceUpload =
            (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceUpload > privacyControls.dataRetentionDays) {
            return false;
          }

          return true;
        }) || [];

      return filteredPhotos.map((photo) => ({
        id: photo.id,
        patientId: photo.patient_id,
        filename: photo.filename,
        originalName: photo.original_name,
        mimeType: photo.mime_type,
        size: photo.size,
        width: photo.width,
        height: photo.height,
        quality: photo.quality,
        uploadDate: new Date(photo.upload_date),
        lastAccessed: photo.last_accessed
          ? new Date(photo.last_accessed)
          : undefined,
      }));
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get patient privacy controls
   */
  async getPatientPrivacyControls(patientId: string): Promise<PrivacyControls> {
    try {
      const { data: controls, error } = await this.supabase
        .from('patient_privacy_controls')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error || !controls) {
        // Return default privacy controls
        return {
          allowFacialRecognition: false,
          allowBiometricStorage: false,
          allowPhotoSharing: false,
          dataRetentionDays: 365,
        };
      }

      return {
        allowFacialRecognition: controls.allow_facial_recognition,
        allowBiometricStorage: controls.allow_biometric_storage,
        allowPhotoSharing: controls.allow_photo_sharing,
        dataRetentionDays: controls.data_retention_days,
        anonymizeAfterDays: controls.anonymize_after_days,
      };
    } catch (_error) {
      // Return restrictive defaults
      return {
        allowFacialRecognition: false,
        allowBiometricStorage: false,
        allowPhotoSharing: false,
        dataRetentionDays: 365,
      };
    }
  }

  /**
   * Update patient privacy controls
   */
  async updatePatientPrivacyControls(
    patientId: string,
    controls: Partial<PrivacyControls>,
    userId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('patient_privacy_controls')
      .upsert({
        patient_id: patientId,
        allow_facial_recognition: controls.allowFacialRecognition,
        allow_biometric_storage: controls.allowBiometricStorage,
        allow_photo_sharing: controls.allowPhotoSharing,
        data_retention_days: controls.dataRetentionDays,
        anonymize_after_days: controls.anonymizeAfterDays,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to update privacy controls: ${error.message}`);
    }

    // Log privacy update
    await this.auditLogger.log({
      action: 'privacy_controls_updated',
      userId,
      resourceType: 'patient_privacy',
      resourceId: patientId,
      details: { controls },
    });
  }

  /**
   * Delete patient photo with privacy compliance
   */
  async deletePatientPhoto(
    photoId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    // Get photo details
    const { data: photo, error: fetchError } = await this.supabase
      .from('patient_photos')
      .select('*')
      .eq('id', photoId)
      .single();

    if (fetchError || !photo) {
      throw new Error('Photo not found');
    }

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from('patient-photos')
      .remove([photo.filename]);

    if (storageError) {
    }

    // Delete from database
    const { error: dbError } = await this.supabase
      .from('patient_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }

    // Log deletion
    await this.auditLogger.log({
      action: 'photo_deleted',
      userId,
      resourceType: 'patient_photo',
      resourceId: photoId,
      details: {
        patientId: photo.patient_id,
        reason,
        filename: photo.filename,
      },
    });
  }

  /**
   * Get photo recognition statistics
   */
  async getRecognitionStats(patientId?: string): Promise<{
    totalPhotos: number;
    recognizedPhotos: number;
    averageConfidence: number;
    lastRecognition: Date | null;
  }> {
    try {
      let query = this.supabase
        .from('patient_photos')
        .select('recognition_data, upload_date');

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data: photos, error } = await query;

      if (error) {
        throw new Error(`Stats query failed: ${error.message}`);
      }

      const totalPhotos = photos?.length || 0;
      const recognizedPhotos =
        photos?.filter((p) => p.recognition_data).length || 0;

      const confidenceScores =
        photos
          ?.filter((p) => p.recognition_data?.confidence)
          .map((p) => p.recognition_data.confidence) || [];

      const averageConfidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((sum, score) => sum + score, 0) /
            confidenceScores.length
          : 0;

      const lastRecognition = photos
        ?.filter((p) => p.recognition_data)
        .sort(
          (a, b) =>
            new Date(b.upload_date).getTime() -
            new Date(a.upload_date).getTime()
        )[0]?.upload_date;

      return {
        totalPhotos,
        recognizedPhotos,
        averageConfidence,
        lastRecognition: lastRecognition ? new Date(lastRecognition) : null,
      };
    } catch (_error) {
      return {
        totalPhotos: 0,
        recognizedPhotos: 0,
        averageConfidence: 0,
        lastRecognition: null,
      };
    }
  }
}

// Default configuration
export const defaultPhotoRecognitionConfig: PhotoRecognitionConfig = {
  enabled: true,
  confidenceThreshold: 0.75,
  maxPhotosPerPatient: 50,
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  qualityThreshold: 0.6,
  privacyMode: 'standard',
  retentionDays: 365,
};
