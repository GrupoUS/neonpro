/**
 * Supabase Storage Utility Functions
 * Secure file management for medical images with LGPD compliance
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

type PhotoMetadata = {
  date: Date;
  treatmentType: string;
  category: 'before' | 'after' | 'during';
  notes: string;
  tags: string[];
  anatomicalArea: string;
};

type UploadResult = {
  success: boolean;
  data?: {
    id: string;
    filePath: string;
    publicUrl: string;
  };
  error?: string;
};

type CompressionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
};

export class SupabaseStorageManager {
  private readonly supabase = createClientComponentClient<Database>();
  private readonly BUCKET_NAME = 'patient-photos';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/webp',
  ];

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido: ${file.type}. Use apenas JPG, PNG, HEIC ou WebP.`,
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 10MB.`,
      };
    }

    return { valid: true };
  }

  /**
   * Compress image while maintaining quality
   */
  private compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = file.type as 'image/jpeg' | 'image/png' | 'image/webp',
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Canvas context não disponível'));
        return;
      }

      img.onload = () => {
        try {
          // Calculate dimensions maintaining aspect ratio
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.fillStyle = '#FFFFFF'; // White background for transparency handling
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Falha na compressão da imagem'));
              }
            },
            format,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate unique file path
   */
  private generateFilePath(patientId: string, fileName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg';

    return `${patientId}/${timestamp}-${randomSuffix}.${fileExt}`;
  }

  /**
   * Check LGPD consent for photo storage
   */
  async checkPhotoConsent(patientId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('lgpd_consents')
        .eq('id', patientId)
        .single();

      if (error) {
        throw error;
      }

      const consents = data?.lgpd_consents as any;
      return consents?.photo_consent === true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Upload single photo with metadata
   */
  async uploadPhoto(
    file: File,
    patientId: string,
    metadata: PhotoMetadata,
    options: CompressionOptions = {}
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check LGPD consent
      const hasConsent = await this.checkPhotoConsent(patientId);
      if (!hasConsent) {
        return {
          success: false,
          error:
            'Paciente não possui consentimento LGPD para armazenamento de fotos',
        };
      }

      // Compress image
      const compressedBlob = await this.compressImage(file, options);

      // Generate unique file path
      const filePath = this.generateFilePath(patientId, file.name);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await this.supabase.storage
          .from(this.BUCKET_NAME)
          .upload(filePath, compressedBlob, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          });

      if (uploadError) {
        return { success: false, error: 'Erro no upload para storage' };
      }

      // Save metadata to database
      const { data: photoData, error: dbError } = await this.supabase
        .from('patient_photos')
        .insert({
          patient_id: patientId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          metadata: metadata as any,
          lgpd_consented: hasConsent,
        })
        .select()
        .single();

      if (dbError) {
        // Cleanup: remove uploaded file if database insert fails
        await this.supabase.storage
          .from(this.BUCKET_NAME)
          .remove([uploadData.path]);
        return { success: false, error: 'Erro ao salvar metadados' };
      }

      // Get public URL
      const { data: urlData } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(uploadData.path, 3600); // 1 hour

      return {
        success: true,
        data: {
          id: photoData.id,
          filePath: uploadData.path,
          publicUrl: urlData?.signedUrl || '',
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido no upload',
      };
    }
  }

  /**
   * Upload multiple photos with progress callback
   */
  async uploadMultiplePhotos(
    files: File[],
    patientId: string,
    metadata: PhotoMetadata,
    onProgress?: (progress: number) => void,
    options: CompressionOptions = {}
  ): Promise<{
    success: boolean;
    results: UploadResult[];
    successCount: number;
    errorCount: number;
  }> {
    const results: UploadResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadPhoto(file, patientId, metadata, options);

      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Update progress
      if (onProgress) {
        const progress = ((i + 1) / files.length) * 100;
        onProgress(progress);
      }
    }

    return {
      success: successCount > 0,
      results,
      successCount,
      errorCount,
    };
  }

  /**
   * Get patient photos with pagination
   */
  async getPatientPhotos(
    patientId: string,
    options: {
      page?: number;
      limit?: number;
      category?: 'before' | 'after' | 'during';
      treatmentType?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, category, treatmentType } = options;
    const offset = (page - 1) * limit;

    try {
      let query = this.supabase
        .from('patient_photos')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId)
        .eq('lgpd_consented', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (category) {
        query = query.eq('metadata->category', category);
      }

      if (treatmentType) {
        query = query.eq('metadata->treatmentType', treatmentType);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Generate signed URLs for each photo
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: urlData } = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .createSignedUrl(photo.file_path, 3600);

          return {
            ...photo,
            publicUrl: urlData?.signedUrl || '',
            metadata: photo.metadata as PhotoMetadata,
          };
        })
      );

      return {
        success: true,
        data: photosWithUrls,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar fotos',
      };
    }
  }

  /**
   * Delete photo (both storage and database)
   */
  async deletePhoto(
    photoId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get file path first
      const { data: photo, error: fetchError } = await this.supabase
        .from('patient_photos')
        .select('file_path')
        .eq('id', photoId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .remove([photo.file_path]);

      if (storageError) {
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('patient_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        throw dbError;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar foto',
      };
    }
  }

  /**
   * Download photo as blob
   */
  async downloadPhoto(
    filePath: string
  ): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        throw error;
      }

      return { success: true, blob: data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao baixar foto',
      };
    }
  }

  /**
   * Create signed URL for secure access
   */
  async createSignedUrl(
    filePath: string,
    expiresIn = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw error;
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro ao gerar URL assinada',
      };
    }
  }

  /**
   * Get storage statistics for a patient
   */
  async getPatientStorageStats(patientId: string) {
    try {
      const { data, error } = await this.supabase
        .from('patient_photo_stats')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          totalPhotos: data.total_photos || 0,
          beforePhotos: data.before_photos || 0,
          afterPhotos: data.after_photos || 0,
          duringPhotos: data.during_photos || 0,
          totalStorageBytes: data.total_storage_bytes || 0,
          firstPhotoDate: data.first_photo_date
            ? new Date(data.first_photo_date)
            : null,
          lastPhotoDate: data.last_photo_date
            ? new Date(data.last_photo_date)
            : null,
          treatmentTypes: data.treatment_types || [],
          anatomicalAreas: data.anatomical_areas || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao buscar estatísticas',
      };
    }
  }

  /**
   * Bulk delete photos by criteria
   */
  async bulkDeletePhotos(
    patientId: string,
    criteria: {
      category?: 'before' | 'after' | 'during';
      treatmentType?: string;
      beforeDate?: Date;
      afterDate?: Date;
    }
  ): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
      let query = this.supabase
        .from('patient_photos')
        .select('id, file_path')
        .eq('patient_id', patientId);

      // Apply filters
      if (criteria.category) {
        query = query.eq('metadata->category', criteria.category);
      }

      if (criteria.treatmentType) {
        query = query.eq('metadata->treatmentType', criteria.treatmentType);
      }

      if (criteria.beforeDate) {
        query = query.lte('created_at', criteria.beforeDate.toISOString());
      }

      if (criteria.afterDate) {
        query = query.gte('created_at', criteria.afterDate.toISOString());
      }

      const { data: photos, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (!photos || photos.length === 0) {
        return { success: true, deletedCount: 0 };
      }

      // Delete from storage
      const filePaths = photos.map((photo) => photo.file_path);
      const { error: storageError } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);

      if (storageError) {
        // Continue with database deletion
      }

      // Delete from database
      const photoIds = photos.map((photo) => photo.id);
      const { error: dbError } = await this.supabase
        .from('patient_photos')
        .delete()
        .in('id', photoIds);

      if (dbError) {
        throw dbError;
      }

      return { success: true, deletedCount: photos.length };
    } catch (error) {
      return {
        success: false,
        deletedCount: 0,
        error:
          error instanceof Error ? error.message : 'Erro na exclusão em lote',
      };
    }
  }
}

// Export singleton instance
export const storageManager = new SupabaseStorageManager();

// Export utility functions for direct use
export const uploadPatientPhoto =
  storageManager.uploadPhoto.bind(storageManager);
export const uploadMultiplePatientPhotos =
  storageManager.uploadMultiplePhotos.bind(storageManager);
export const getPatientPhotos =
  storageManager.getPatientPhotos.bind(storageManager);
export const deletePatientPhoto =
  storageManager.deletePhoto.bind(storageManager);
export const downloadPatientPhoto =
  storageManager.downloadPhoto.bind(storageManager);
export const createPhotoSignedUrl =
  storageManager.createSignedUrl.bind(storageManager);
export const getPatientPhotoStats =
  storageManager.getPatientStorageStats.bind(storageManager);
export const checkPatientPhotoConsent =
  storageManager.checkPhotoConsent.bind(storageManager);

// Type exports
export type { PhotoMetadata, UploadResult, CompressionOptions };
