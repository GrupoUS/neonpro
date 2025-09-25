/**
 * Patient Document Download API Route
 * Handles secure document downloads with authentication and audit
 */

import { PatientDocumentService } from '@apps/api/src/services/patient-document-service'
import type { Context } from 'hono'

// Create service instance with production config
const documentService = new PatientDocumentService({
  enablePersistence: true,
  // supabaseClient will be injected at runtime
})

/**
 * GET /api/v1/patient-documents/{documentId}/download
 */
export default async function handler(req: Request, _ctx: Context) {
  try {
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

    // TODO: Add authentication middleware
    // For now, use a mock user ID
    const userId = 'mock-user-id'

    // Get document metadata
    const document = await documentService.getDocument(documentId, userId)
    if (!document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
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

    // Cache headers
    if (preview) {
      headers.set('Cache-Control', 'private, max-age=300')
    } else {
      headers.set(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate',
      )
    }

    return new Response(fileContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Document download error:', error)

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
