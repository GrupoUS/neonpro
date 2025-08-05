/**
 * NeonPro Medical File Processing Edge Service
 * High-performance medical document processing with OCR, AI analysis, and compliance
 * Handles: PDFs, Images, Word docs, Medical reports, Lab results, Prescriptions
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Types for Cloudflare Workers environment
type Bindings = {
  MEDICAL_DOCUMENTS: R2Bucket;
  PROCESSED_FILES: R2Bucket;
  FILE_PROCESSING_CACHE: KVNamespace;
  OCR_RESULTS_CACHE: KVNamespace;
  FILE_METADATA_DB: D1Database;
  FILE_PROCESSOR: DurableObjectNamespace;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  JWT_SECRET: string;
  OPENAI_API_KEY: string;
  ANTIVIRUS_API_KEY: string;
};

// File processing schemas
const FileUploadSchema = z.object({
  file: z.instanceof(File),
  patientId: z.string().uuid().optional(),
  documentType: z.enum([
    "medical_report",
    "lab_result",
    "prescription",
    "xray_image",
    "mri_scan",
    "ultrasound",
    "ct_scan",
    "blood_test",
    "pathology_report",
    "discharge_summary",
    "consent_form",
    "insurance_document",
    "other",
  ]),
  tags: z.array(z.string()).optional(),
  isUrgent: z.boolean().default(false),
  requiresOCR: z.boolean().default(true),
  requiresAIAnalysis: z.boolean().default(false),
});

// Create Hono app
const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        "https://neonpro.health",
        "https://app.neonpro.health",
        "http://localhost:3000",
        "http://localhost:4000",
      ];
      return allowedOrigins.includes(origin || "") || origin?.endsWith(".neonpro.health") || false;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Tenant-ID"],
    credentials: true,
  }),
);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "neonpro-file-processing-edge",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    capabilities: [
      "medical_document_upload",
      "ocr_text_extraction",
      "ai_document_analysis",
      "virus_scanning",
      "format_conversion",
      "metadata_extraction",
      "compliance_validation",
      "secure_storage",
    ],
    supported_formats: ["pdf", "jpg", "jpeg", "png", "doc", "docx", "csv", "txt"],
    max_file_size: "50MB",
    processing_locations: c.req.header("CF-IPColo") || "global",
  });
}); // Medical document upload endpoint
app.post("/api/v1/upload", zValidator("form", FileUploadSchema), async (c) => {
  const tenantId = c.req.header("X-Tenant-ID");
  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  try {
    const { file, patientId, documentType, tags, isUrgent, requiresOCR, requiresAIAnalysis } =
      c.req.valid("form");

    // Validate file size and type
    const maxSize = 52428800; // 50MB
    if (file.size > maxSize) {
      return c.json({ error: "File size exceeds 50MB limit" }, 400);
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Unsupported file type" }, 400);
    }

    // Generate unique file ID and path
    const fileId = crypto.randomUUID();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${tenantId}/${patientId || "general"}/${fileId}.${fileExtension}`;

    // Store original file in R2
    const fileBuffer = await file.arrayBuffer();
    await c.env.MEDICAL_DOCUMENTS.put(fileName, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`,
      },
      customMetadata: {
        tenantId,
        patientId: patientId || "",
        documentType,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        tags: tags?.join(",") || "",
        isUrgent: isUrgent.toString(),
      },
    });

    // Store file metadata in database
    await c.env.FILE_METADATA_DB.prepare(`
        INSERT INTO file_metadata (
          id, tenant_id, patient_id, file_name, original_name, 
          file_size, file_type, document_type, is_urgent, 
          requires_ocr, requires_ai_analysis, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded', ?)
      `)
      .bind(
        fileId,
        tenantId,
        patientId || null,
        fileName,
        file.name,
        file.size,
        file.type,
        documentType,
        isUrgent ? 1 : 0,
        requiresOCR ? 1 : 0,
        requiresAIAnalysis ? 1 : 0,
        new Date().toISOString(),
      )
      .run();

    // Queue for processing if OCR or AI analysis is required
    if (requiresOCR || requiresAIAnalysis) {
      const processorId = c.env.FILE_PROCESSOR.idFromName(fileId);
      const processor = c.env.FILE_PROCESSOR.get(processorId);

      await processor.fetch(c.req.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": tenantId,
        },
        body: JSON.stringify({
          fileId,
          fileName,
          documentType,
          requiresOCR,
          requiresAIAnalysis,
          isUrgent,
        }),
      });
    }

    return c.json(
      {
        fileId,
        fileName: file.name,
        size: file.size,
        documentType,
        status: "uploaded",
        processingQueued: requiresOCR || requiresAIAnalysis,
        estimatedProcessingTime: getEstimatedProcessingTime(
          file.size,
          requiresOCR,
          requiresAIAnalysis,
        ),
        uploadedAt: new Date().toISOString(),
      },
      201,
    );
  } catch (error) {
    console.error("File upload error:", error);
    return c.json({ error: "Failed to upload file" }, 500);
  }
}); // Get file processing status
app.get("/api/v1/files/:fileId/status", async (c) => {
  const fileId = c.param("fileId");
  const tenantId = c.req.header("X-Tenant-ID");

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  try {
    // Get file metadata from database
    const fileData = await c.env.FILE_METADATA_DB.prepare(`
      SELECT * FROM file_metadata 
      WHERE id = ? AND tenant_id = ?
    `)
      .bind(fileId, tenantId)
      .first();

    if (!fileData) {
      return c.json({ error: "File not found" }, 404);
    }

    // Check processing cache for results
    const processingResults = await c.env.FILE_PROCESSING_CACHE.get(`processing:${fileId}`);
    const ocrResults = await c.env.OCR_RESULTS_CACHE.get(`ocr:${fileId}`);

    return c.json({
      fileId,
      fileName: fileData.original_name,
      status: fileData.status,
      documentType: fileData.document_type,
      fileSize: fileData.file_size,
      createdAt: fileData.created_at,
      processing: processingResults ? JSON.parse(processingResults) : null,
      ocr: ocrResults ? JSON.parse(ocrResults) : null,
      downloadUrl: fileData.status === "processed" ? `/api/v1/files/${fileId}/download` : null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return c.json({ error: "Failed to get file status" }, 500);
  }
});

// Download processed file
app.get("/api/v1/files/:fileId/download", async (c) => {
  const fileId = c.param("fileId");
  const tenantId = c.req.header("X-Tenant-ID");

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  try {
    // Verify file belongs to tenant
    const fileData = await c.env.FILE_METADATA_DB.prepare(`
      SELECT file_name, original_name, file_type FROM file_metadata 
      WHERE id = ? AND tenant_id = ?
    `)
      .bind(fileId, tenantId)
      .first();

    if (!fileData) {
      return c.json({ error: "File not found" }, 404);
    }

    // Get file from R2 storage
    const fileObject = await c.env.MEDICAL_DOCUMENTS.get(fileData.file_name);

    if (!fileObject) {
      return c.json({ error: "File not found in storage" }, 404);
    }

    // Return file with appropriate headers
    return new Response(fileObject.body, {
      headers: {
        "Content-Type": fileData.file_type,
        "Content-Disposition": `attachment; filename="${fileData.original_name}"`,
        "Cache-Control": "private, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return c.json({ error: "Failed to download file" }, 500);
  }
});

// OCR text extraction endpoint
app.post("/api/v1/files/:fileId/ocr", async (c) => {
  const fileId = c.param("fileId");
  const tenantId = c.req.header("X-Tenant-ID");

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  try {
    // Check if OCR results already exist
    const cachedResults = await c.env.OCR_RESULTS_CACHE.get(`ocr:${fileId}`);
    if (cachedResults) {
      return c.json(JSON.parse(cachedResults));
    }

    // Queue OCR processing
    const processorId = c.env.FILE_PROCESSOR.idFromName(fileId);
    const processor = c.env.FILE_PROCESSOR.get(processorId);

    const response = await processor.fetch(c.req.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": tenantId,
      },
      body: JSON.stringify({
        action: "ocr",
        fileId,
      }),
    });

    return response;
  } catch (error) {
    console.error("OCR processing error:", error);
    return c.json({ error: "Failed to process OCR" }, 500);
  }
});
