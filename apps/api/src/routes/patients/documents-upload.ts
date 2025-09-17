/**
 * POST /api/v2/patients/:id/documents (FR-003)
 * Minimal placeholder implementation to satisfy initial TDD failing tests.
 * - Auth required
 * - Accepts multipart/form-data with single 'file' field
 * - Validates presence of file and basic MIME allowlist
 * - Size limit enforcement will be added later (bodyLimit middleware)
 * - Persists nothing yet (service layer to be wired next)
 */
import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../../middleware/authn';

const app = new Hono();

// Allowed MIME types (initial subset) - full list to be expanded
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ParamsSchema = z.object({ id: z.string().uuid() });

app.post('/:id/documents', requireAuth, async c => {
  // Validate patient id param
  const params = ParamsSchema.safeParse(c.req.param());
  if (!params.success) {
    return c.json({ success: false, error: 'Parâmetros inválidos' }, 400);
  }

  // Parse multipart form
  let form: FormData;
  try {
    form = await c.req.formData();
  } catch (e) {
    return c.json({ success: false, error: 'Formato multipart inválido' }, 400);
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return c.json({ success: false, error: 'Arquivo é obrigatório (campo file)' }, 400);
  }

  // Basic size check (10MB) - refine later with bodyLimit middleware
  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return c.json({ success: false, error: 'Arquivo excede tamanho máximo (10MB)' }, 413);
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return c.json({ success: false, error: 'Tipo de arquivo não suportado', mimeType: file.type }, 415);
  }

  // Placeholder document metadata (service integration pending)
  const now = new Date().toISOString();
  const docId = crypto.randomUUID();
  const patientId = params.data.id;

  // TODO: integrate with storage + patient_documents insertion + audit trail
  return c.json({
    success: true,
    data: {
      id: docId,
      patientId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      createdAt: now,
      // storagePath, checksum, scanStatus will come after service integration
    },
  }, 201);
});

export default app;