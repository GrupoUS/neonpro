"use strict";
/**
 * Supabase Storage Utility Functions
 * Secure file management for medical images with LGPD compliance
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
var _o;
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPatientPhotoConsent = exports.getPatientPhotoStats = exports.createPhotoSignedUrl = exports.downloadPatientPhoto = exports.deletePatientPhoto = exports.getPatientPhotos = exports.uploadMultiplePatientPhotos = exports.uploadPatientPhoto = exports.storageManager = exports.SupabaseStorageManager = void 0;
var SupabaseStorageManager = /** @class */ (function () {
    function SupabaseStorageManager() {
        this.supabase = createClient(ComponentClient(), private, readonly, BUCKET_NAME = 'patient-photos', private, readonly, MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
        , // 10MB
        private, readonly, ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']
        /**
         * Validate file before upload
         */
        , 
        /**
         * Validate file before upload
         */
        private, validateFile(file, File), { valid: boolean, error: string }, {
            : .ALLOWED_TYPES.includes(file.type)
        });
    }
    return SupabaseStorageManager;
}());
exports.SupabaseStorageManager = SupabaseStorageManager;
{
    return {
        valid: false,
        error: "Tipo de arquivo n\u00E3o permitido: ".concat(file.type, ". Use apenas JPG, PNG, HEIC ou WebP.")
    };
}
if (file.size > this.MAX_FILE_SIZE) {
    return {
        valid: false,
        error: "Arquivo muito grande: ".concat((file.size / 1024 / 1024).toFixed(2), "MB. M\u00E1ximo: 10MB.")
    };
}
return { valid: true };
compressImage(file, File, options, CompressionOptions = {});
Promise < Blob > {
    const: (_a = options.maxWidth, maxWidth = _a === void 0 ? 1920 : _a, _b = options.maxHeight, maxHeight = _b === void 0 ? 1080 : _b, _c = options.quality, quality = _c === void 0 ? 0.8 : _c, _d = options.format, format = _d === void 0 ? file.type : _d, options),
    return: new Promise(function (resolve, reject) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        if (!ctx) {
            reject(new Error('Canvas context não disponível'));
            return;
        }
        img.onload = function () {
            try {
                // Calculate dimensions maintaining aspect ratio
                var width = img.width, height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    var ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                canvas.width = width;
                canvas.height = height;
                // Draw and compress
                ctx.fillStyle = '#FFFFFF'; // White background for transparency handling
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(function (blob) {
                    if (blob) {
                        resolve(blob);
                    }
                    else {
                        reject(new Error('Falha na compressão da imagem'));
                    }
                }, format, quality);
            }
            catch (error) {
                reject(error);
            }
        };
        img.onerror = function () { return reject(new Error('Falha ao carregar imagem')); };
        img.src = URL.createObjectURL(file);
    })
};
generateFilePath(patientId, string, fileName, string);
string;
{
    var timestamp = Date.now();
    var randomSuffix = Math.random().toString(36).substring(2, 8);
    var fileExt = ((_o = fileName.split('.').pop()) === null || _o === void 0 ? void 0 : _o.toLowerCase()) || 'jpg';
    return "".concat(patientId, "/").concat(timestamp, "-").concat(randomSuffix, ".").concat(fileExt);
}
/**
 * Check LGPD consent for photo storage
 */
async;
checkPhotoConsent(patientId, string);
Promise < boolean > {
    try: {
        const: (_e = await this.supabase
            .from('profiles')
            .select('lgpd_consents')
            .eq('id', patientId)
            .single(), data = _e.data, error = _e.error, _e),
        if: function (error) { },
        throw: error,
        const: consents = data === null || data === void 0 ? void 0 : data.lgpd_consents,
        return: (consents === null || consents === void 0 ? void 0 : consents.photo_consent) === true
    },
    catch: function (error) {
        console.error('Erro ao verificar consentimento LGPD:', error);
        return false;
    }
};
/**
 * Upload single photo with metadata
 */
async;
uploadPhoto(file, File, patientId, string, metadata, PhotoMetadata, options, CompressionOptions = {});
Promise < UploadResult > {
    try: {
        // Validate file
        const: validation = this.validateFile(file),
        if: function (, validation) { },
        : .valid
    }
};
{
    return { success: false, error: validation.error };
}
// Check LGPD consent
var hasConsent = await this.checkPhotoConsent(patientId);
if (!hasConsent) {
    return {
        success: false,
        error: 'Paciente não possui consentimento LGPD para armazenamento de fotos'
    };
}
// Compress image
var compressedBlob = await this.compressImage(file, options);
// Generate unique file path
var filePath = this.generateFilePath(patientId, file.name);
// Upload to Supabase Storage
var _p = await this.supabase.storage
    .from(this.BUCKET_NAME)
    .upload(filePath, compressedBlob, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false
}), uploadData = _p.data, uploadError = _p.error;
if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return { success: false, error: 'Erro no upload para storage' };
}
// Save metadata to database
var _q = await this.supabase
    .from('patient_photos')
    .insert({
    patient_id: patientId,
    file_name: file.name,
    file_path: uploadData.path,
    file_size: file.size,
    mime_type: file.type,
    metadata: metadata,
    lgpd_consented: hasConsent
})
    .select()
    .single(), photoData = _q.data, dbError = _q.error;
if (dbError) {
    // Cleanup: remove uploaded file if database insert fails
    await this.supabase.storage
        .from(this.BUCKET_NAME)
        .remove([uploadData.path]);
    console.error('Database insert error:', dbError);
    return { success: false, error: 'Erro ao salvar metadados' };
}
// Get public URL
var urlData = (await this.supabase.storage
    .from(this.BUCKET_NAME)
    .createSignedUrl(uploadData.path, 3600)).data; // 1 hour
return {
    success: true,
    data: {
        id: photoData.id,
        filePath: uploadData.path,
        publicUrl: (urlData === null || urlData === void 0 ? void 0 : urlData.signedUrl) || ''
    }
};
try { }
catch (error) {
    console.error('Upload error:', error);
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
    };
}
/**
 * Upload multiple photos with progress callback
 */
async;
uploadMultiplePhotos(files, File[], patientId, string, metadata, PhotoMetadata, onProgress ?  : function (progress) { return void ; }, options, CompressionOptions = {});
Promise < {
    success: boolean,
    results: UploadResult[],
    successCount: number,
    errorCount: number
} > (_f = {
        const: results,
        UploadResult: UploadResult
    },
    _f[] =  = [],
    _f.let = let,
    _f.successCount = successCount,
    _f.let = let,
    _f.errorCount = errorCount,
    _f.for = function (let, i, i, , files) {
        if (i === void 0) { i = 0; }
    },
    _f. = .length,
    _f.i = i,
    _f)++;
{
    var file = files[i];
    var result = await this.uploadPhoto(file, patientId, metadata, options);
    results.push(result);
    if (result.success) {
        successCount++;
    }
    else {
        errorCount++;
    }
    // Update progress
    if (onProgress) {
        var progress = ((i + 1) / files.length) * 100;
        onProgress(progress);
    }
}
return {
    success: successCount > 0,
    results: results,
    successCount: successCount,
    errorCount: errorCount
};
/**
 * Get patient photos with pagination
 */
async;
(0, exports.getPatientPhotos)(patientId, string, options, (_g = {}, number = _g.page, number = _g.limit, 'before' | 'after' | 'during' = _g.category, string = _g.treatmentType, _g));
{
    var _r = options.page, page = _r === void 0 ? 1 : _r, _s = options.limit, limit = _s === void 0 ? 20 : _s, category = options.category, treatmentType = options.treatmentType;
    var offset = (page - 1) * limit;
    try {
        var query = this.supabase
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
        var _t = await query, data = _t.data, error = _t.error, count = _t.count;
        if (error)
            throw error;
        // Generate signed URLs for each photo
        var photosWithUrls = await Promise.all((data || []).map(function (photo) { return __awaiter(void 0, void 0, void 0, function () {
            var urlData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase.storage
                            .from(this.BUCKET_NAME)
                            .createSignedUrl(photo.file_path, 3600)];
                    case 1:
                        urlData = (_a.sent()).data;
                        return [2 /*return*/, __assign(__assign({}, photo), { publicUrl: (urlData === null || urlData === void 0 ? void 0 : urlData.signedUrl) || '', metadata: photo.metadata })];
                }
            });
        }); }));
        return {
            success: true,
            data: photosWithUrls,
            pagination: {
                page: page,
                limit: limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };
    }
    catch (error) {
        console.error('Error fetching photos:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao buscar fotos'
        };
    }
}
/**
 * Delete photo (both storage and database)
 */
async;
deletePhoto(photoId, string);
Promise < { success: boolean, error: string } > {
    try: {
        // Get file path first
        const: (_h = await this.supabase
            .from('patient_photos')
            .select('file_path')
            .eq('id', photoId)
            .single(), photo = _h.data, fetchError = _h.error, _h),
        if: function (fetchError) { },
        throw: fetchError
        // Delete from storage
        ,
        // Delete from storage
        const: (_j = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .remove([photo.file_path]), storageError = _j.error, _j),
        if: function (storageError) {
            console.error('Storage deletion error:', storageError);
            // Continue with database deletion even if storage fails
        }
        // Delete from database
        ,
        // Delete from database
        const: (_k = await this.supabase
            .from('patient_photos')
            .delete()
            .eq('id', photoId), dbError = _k.error, _k),
        if: function (dbError) { },
        throw: dbError,
        return: { success: true }
    },
    catch: function (error) {
        console.error('Delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao deletar foto'
        };
    }
};
/**
 * Download photo as blob
 */
async;
downloadPhoto(filePath, string);
Promise < { success: boolean, blob: Blob, error: string } > {
    try: {
        const: (_l = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .download(filePath), data = _l.data, error = _l.error, _l),
        if: function (error) { },
        throw: error,
        return: { success: true, blob: data }
    },
    catch: function (error) {
        console.error('Download error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao baixar foto'
        };
    }
};
/**
 * Create signed URL for secure access
 */
async;
createSignedUrl(filePath, string, expiresIn, number = 3600);
Promise < { success: boolean, url: string, error: string } > {
    try: {
        const: (_m = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .createSignedUrl(filePath, expiresIn), data = _m.data, error = _m.error, _m),
        if: function (error) { },
        throw: error,
        return: { success: true, url: data.signedUrl }
    },
    catch: function (error) {
        console.error('Signed URL error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao gerar URL assinada'
        };
    }
};
/**
 * Get storage statistics for a patient
 */
async;
getPatientStorageStats(patientId, string);
{
    try {
        var _u = await this.supabase
            .from('patient_photo_stats')
            .select('*')
            .eq('patient_id', patientId)
            .single(), data = _u.data, error = _u.error;
        if (error)
            throw error;
        return {
            success: true,
            data: {
                totalPhotos: data.total_photos || 0,
                beforePhotos: data.before_photos || 0,
                afterPhotos: data.after_photos || 0,
                duringPhotos: data.during_photos || 0,
                totalStorageBytes: data.total_storage_bytes || 0,
                firstPhotoDate: data.first_photo_date ? new Date(data.first_photo_date) : null,
                lastPhotoDate: data.last_photo_date ? new Date(data.last_photo_date) : null,
                treatmentTypes: data.treatment_types || [],
                anatomicalAreas: data.anatomical_areas || []
            }
        };
    }
    catch (error) {
        console.error('Stats error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
        };
    }
}
/**
 * Bulk delete photos by criteria
 */
async;
bulkDeletePhotos(patientId, string, criteria, {
    category: 'before' | 'after' | 'during',
    treatmentType: string,
    beforeDate: Date,
    afterDate: Date
});
Promise < { success: boolean, deletedCount: number, error: string } > {
    try: {
        let: let,
        query: query
        // Apply filters
        ,
        // Apply filters
        if: function (criteria) { },
        : .category
    }
};
{
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
var _v = await query, photos = _v.data, fetchError = _v.error;
if (fetchError)
    throw fetchError;
if (!photos || photos.length === 0) {
    return { success: true, deletedCount: 0 };
}
// Delete from storage
var filePaths = photos.map(function (photo) { return photo.file_path; });
var storageError = (await this.supabase.storage
    .from(this.BUCKET_NAME)
    .remove(filePaths)).error;
if (storageError) {
    console.error('Bulk storage deletion error:', storageError);
    // Continue with database deletion
}
// Delete from database
var photoIds = photos.map(function (photo) { return photo.id; });
var dbError = (await this.supabase
    .from('patient_photos')
    .delete()
    .in('id', photoIds)).error;
if (dbError)
    throw dbError;
return { success: true, deletedCount: photos.length };
try { }
catch (error) {
    console.error('Bulk delete error:', error);
    return {
        success: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Erro na exclusão em lote'
    };
}
// Export singleton instance
exports.storageManager = new SupabaseStorageManager();
// Export utility functions for direct use
exports.uploadPatientPhoto = exports.storageManager.uploadPhoto.bind(exports.storageManager);
exports.uploadMultiplePatientPhotos = exports.storageManager.uploadMultiplePhotos.bind(exports.storageManager);
exports.getPatientPhotos = exports.storageManager.getPatientPhotos.bind(exports.storageManager);
exports.deletePatientPhoto = exports.storageManager.deletePhoto.bind(exports.storageManager);
exports.downloadPatientPhoto = exports.storageManager.downloadPhoto.bind(exports.storageManager);
exports.createPhotoSignedUrl = exports.storageManager.createSignedUrl.bind(exports.storageManager);
exports.getPatientPhotoStats = exports.storageManager.getPatientStorageStats.bind(exports.storageManager);
exports.checkPatientPhotoConsent = exports.storageManager.checkPhotoConsent.bind(exports.storageManager);
