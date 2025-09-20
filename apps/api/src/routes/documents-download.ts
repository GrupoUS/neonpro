/**
 * Patient Document Download Route - Secure document retrieval with audit trail
 *
 * Features:
 * - Secure document download with authentication
 * - RLS enforcement and audit logging
 * - Stream-based response for large files
 * - Proper MIME type handling
 * - LGPD compliance with access logging
 *
 * @route GET /api/v1/patient-documents/{documentId}/download
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { PatientDocumentService } from '../services/patient-document-service';
import { auditLogger } from '../utils/audit-logger';

// Type definitions
interface DocumentDownloadContext {
  Variables: {
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

// Request validation schemas
const downloadParamsSchema = z.object({
  documentId: z.string().uuid('ID do documento deve ser um UUID válido'),
});

const downloadQuerySchema = z.object({
  disposition: z
    .enum(['inline', 'attachment'])
    .optional()
    .default('attachment'),
  preview: z.boolean().optional().default(false),
});

// Initialize service
const documentService = new PatientDocumentService();

// Create Hono app
const app = new Hono<DocumentDownloadContext>();

/**
 * GET /api/v1/patient-documents/{documentId}/download
 * Download a patient document securely
 */
app.get('/:documentId/download', requireAuth(), async c => {
  try {
    // Parse and validate parameters
    const rawParams = {
      documentId: c.req.param('documentId'),
    };

    const paramsResult = downloadParamsSchema.safeParse(rawParams);
    if (!paramsResult.success) {
      throw new HTTPException(400, {
        message: 'Parâmetros inválidos',
        cause: paramsResult.error.flatten(),
      });
    }

    const { documentId } = paramsResult.data;

    // Parse query parameters
    const rawQuery = {
      disposition: c.req.query('disposition'),
      preview: c.req.query('preview') === 'true',
    };

    const queryResult = downloadQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      throw new HTTPException(400, {
        message: 'Parâmetros de consulta inválidos',
        cause: queryResult.error.flatten(),
      });
    }

    const { disposition, preview } = queryResult.data;

    // Get authenticated user
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'Usuário não autenticado' });
    }

    // Get document metadata with RLS check
    const document = await documentService.getDocument(documentId, user.id);
    if (!document) {
      throw new HTTPException(404, { message: 'Documento não encontrado' });
    }

    // Audit log the download attempt
    await auditLogger.logDocumentAccess({
      action: 'download',
      documentId: document.id,
      patientId: document.patient_id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      metadata: {
        document_name: document.document_name,
        document_type: document.document_type,
        file_size: document.file_size,
        disposition,
        preview,
        ip_address: c.req.header('x-forwarded-for')
          || c.req.header('x-real-ip')
          || 'unknown',
        user_agent: c.req.header('user-agent') || 'unknown',
      },
    });

    // Get file content from storage
    let fileContent: ArrayBuffer;
    let contentType = document.document_type || 'application/octet-stream';

    try {
      fileContent = await documentService.getFileContent(document.file_path);
    } catch (error) {
      console.error('Error reading file:', error);

      // Log failed download
      await auditLogger.logDocumentAccess({
        action: 'download_failed',
        documentId: document.id,
        patientId: document.patient_id,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          document_name: document.document_name,
        },
      });

      throw new HTTPException(500, {
        message: 'Erro ao acessar o arquivo do documento',
      });
    }

    // Determine filename for download
    const filename = document.document_name;
    const encodedFilename = encodeURIComponent(filename);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', fileContent.byteLength.toString());

    // Handle disposition and filename
    if (disposition === 'attachment') {
      headers.set(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodedFilename}`,
      );
    } else if (disposition === 'inline') {
      headers.set(
        'Content-Disposition',
        `inline; filename*=UTF-8''${encodedFilename}`,
      );
    }

    // Security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Content-Security-Policy', 'default-src \'none\'');

    // Cache headers for preview mode
    if (preview) {
      headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    } else {
      headers.set(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate',
      );
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    }

    // Log successful download
    await auditLogger.logDocumentAccess({
      action: 'download_success',
      documentId: document.id,
      patientId: document.patient_id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      metadata: {
        document_name: document.document_name,
        file_size: document.file_size,
        bytes_served: fileContent.byteLength,
      },
    });

    // Return file content with proper headers
    return new Response(fileContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Document download error:', error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Erro interno do servidor no download do documento',
    });
  }
});

/**
 * GET /api/v1/patient-documents/{documentId}/preview
 * Get document preview/thumbnail
 */
app.get('/:documentId/preview', requireAuth(), async c => {
  try {
    const documentId = c.req.param('documentId');
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'Usuário não autenticado' });
    }

    // Validate document ID
    const paramsResult = z
      .object({
        documentId: z.string().uuid(),
      })
      .safeParse({ documentId });

    if (!paramsResult.success) {
      throw new HTTPException(400, { message: 'ID do documento inválido' });
    }

    // Get document with RLS check
    const document = await documentService.getDocument(documentId, user.id);
    if (!document) {
      throw new HTTPException(404, { message: 'Documento não encontrado' });
    }

    // Audit log preview access
    await auditLogger.logDocumentAccess({
      action: 'preview',
      documentId: document.id,
      patientId: document.patient_id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      metadata: {
        document_name: document.document_name,
        document_type: document.document_type,
      },
    });

    // For now, redirect to download with inline disposition
    // TODO: Implement actual thumbnail generation for images/PDFs
    const url = new URL(c.req.url);
    url.pathname = `/api/v1/patient-documents/${documentId}/download`;
    url.searchParams.set('disposition', 'inline');
    url.searchParams.set('preview', 'true');

    return c.redirect(url.toString(), 302);
  } catch (error) {
    console.error('Document preview error:', error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Erro interno do servidor na visualização do documento',
    });
  }
});

export default app;
