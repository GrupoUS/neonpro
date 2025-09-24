// Minimal CSP report collector (Report-Only)
// Accepts POST with application/reports+json or application/csp-report
// Logs minimal non-PII details and returns 204 No Content

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  const contentType = req.headers.get('content-type') || ''
  let body: unknown = null

  try {
    if (
      contentType.includes('application/reports+json') ||
      contentType.includes('application/json')
    ) {
      body = await req.json()
    } else if (contentType.includes('application/csp-report')) {
      // Old spec sends {"csp-report": {...}}
      body = await req.json()
    } else if (contentType.includes('text/plain')) {
      body = await req.text()
    }
  } catch {
    // Ignore parse errors but acknowledge
  }

  try {
    // Redact potentially sensitive fields and log minimal info (avoid PHI)
    const now = new Date().toISOString()
    const reportSummary = summarizeCspReport(body)
    console.warn('[CSP-REPORT]', now, reportSummary)
  } catch {
    // Swallow logging errors
  }

  return new Response(null, { status: 204 })
}

function summarizeCspReport(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return { type: 'unknown' }

  // Support both Reporting API ("type":"csp-violation") and legacy {"csp-report": {...}}
  // Try common shapes conservatively
  const p = payload as any

  if (Array.isArray(p) && p.length > 0) {
    const first = p[0]
    return pickCommonFields(first)
  }

  if (p.type === 'csp-violation' && p.body) {
    return pickCommonFields(p.body)
  }

  if (p['csp-report']) {
    return pickCommonFields(p['csp-report'])
  }

  return pickCommonFields(p)
}

function pickCommonFields(obj: any): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return { type: 'unknown' }
  const {
    'effective-directive': effectiveDirective,
    'violated-directive': violatedDirective,
    'blocked-uri': blockedUri,
    'document-uri': documentUri,
    disposition,
    'line-number': lineNumber,
    'source-file': sourceFile,
    referrer,
    'status-code': statusCode,
    _originalPolicy,
  } = obj

  return {
    type: 'csp',
    effectiveDirective: effectiveDirective || violatedDirective,
    blockedUri,
    documentUri: sanitizeUrl(documentUri),
    sourceFile: sanitizeUrl(sourceFile),
    referrer: sanitizeUrl(referrer),
    disposition,
    lineNumber,
    statusCode,
    // Do not log originalPolicy as it may contain hashes
    // Keep payload size minimal
  }
}

function sanitizeUrl(url?: string) {
  if (!url || typeof url !== 'string') return undefined
  try {
    const u = new URL(url)
    // Strip query and hash to avoid leaking PII
    return `${u.protocol}//${u.host}${u.pathname}`
  } catch {
    return undefined
  }
}
