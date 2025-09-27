/**
 * Patient Document Download API Route
 * Handles secure document downloads with authentication and audit
 */

import { auth } from '@apps/api/src/middleware/auth'
import { PatientDocumentService } from '@apps/api/src/services/patient-document-service'
import { logger } from '@apps/api/src/utils/healthcare-errors'
import type { Context } from 'hono'

// Create service instance with production config
const documentService = new PatientDocumentService({
  enablePersistence: true,
  // supabaseClient will be injected at runtime
})

/**
 * GET /api/v1/patient-documents/{documentId}/download
 */
export default async function handler(req: Request, ctx: Context) {
  try {
    // Apply authentication middleware
    const authResult = await auth()(ctx, async () => {
      // This function won't be called if auth fails
      return { authenticated: true }
    })

    // Check if authentication succeeded
    if (!authResult.authenticated) {
      logger.warn('Unauthorized document download attempt', {
        path: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
      })

      return new Response(
        JSON.stringify({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Get authenticated user from context
    const userId = ctx.get('userId')
    const user = ctx.get('user')

    if (!userId || !user) {
      logger.error('Authentication context missing after auth check', {
        path: req.url,
      })

      return new Response(
        JSON.stringify({
          error: 'Authentication context missing',
          code: 'AUTH_CONTEXT_ERROR',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const documentId = pathParts[pathParts.length - 2] // Get documentId from path

    if (!documentId) {
      return new Response(JSON.stringify({ error: 'Document ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Extract query parameters
    const disposition = url.searchParams.get('disposition') || 'attachment'
    const preview = url.searchParams.get('preview') === 'true'

    // Log access attempt for audit trail
    logger.info('Document download requested', {
      documentId,
      userId,
      userRole: user._role,
      disposition,
      preview,
      path: req.url,
    })

    // Get document metadata
    const document = await documentService.getDocument(documentId, userId)
    if (!document) {
      logger.warn('Document download failed - document not found', {
        documentId,
        userId,
        userRole: user._role,
      })

      return new Response(
        JSON.stringify({
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Get file content
    const fileContent = await documentService.getFileContent(
      document.storage_path,
    )

    // Set response headers
    const headers = new Headers()
    headers.set('Content-Type', document.mime_type)
    headers.set('Content-Length', fileContent.byteLength.toString())

    // Set disposition and filename
    const encodedFilename = encodeURIComponent(document.original_name)
    if (disposition === 'attachment') {
      headers.set(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodedFilename}`,
      )
    } else {
      headers.set(
        'Content-Disposition',
        `inline; filename*=UTF-8''${encodedFilename}`,
      )
    }

    // Security headers
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('Content-Security-Policy', "default-src 'none'")
    headers.set('Referrer-Policy', 'no-referrer')

    // Cache headers
    if (preview) {
      headers.set('Cache-Control', 'private, max-age=300')
    } else {
      headers.set(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate',
      )
    }

    // Log successful document access
    logger.info('Document download successful', {
      documentId,
      userId,
      userRole: user._role,
      documentType: document.mime_type,
      disposition,
      preview,
      fileSize: fileContent.byteLength,
    })

    return new Response(fileContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    logger.error('Document download error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      documentId,
      userId: ctx.get('userId'),
      path: req.url,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: 'DOWNLOAD_ERROR',
        message: process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
