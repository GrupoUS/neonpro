/**
 * POST /api/v2/patients/:id/documents (FR-003)
 * Phase 1 implementation: validation + dependency injection hooks (no persistence/storage yet).
 * Next phase will integrate Supabase storage + patient_documents insert + audit trail.
 */
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { requireAuth } from '../../middleware/authn';

const app = new Hono();

// Dependency Injection scaffold for forthcoming service layer
interface DocumentService {
  uploadPatientDocument(args: { patientId: string; file: File }): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
}

let documentService: DocumentService | null = null;
export function setDocumentService(svc: DocumentService) {
  documentService = svc;
}
export function getDocumentService() {
  return documentService;
}

// Allowed MIME types (initial subset) - will be expanded based on spec
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

// Apply body size limit (10MB)
app.use(
  '/:id/documents',
  bodyLimit({
    maxSize: 10 * 1024 * 1024,
    onError: c =>
      c.json(
        { success: false, error: 'Arquivo excede tamanho máximo (10MB)' },
        413,
      ),
  }),
);

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
  } catch {
    return c.json({ success: false, error: 'Formato multipart inválido' }, 400);
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return c.json(
      { success: false, error: 'Arquivo é obrigatório (campo file)' },
      400,
    );
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return c.json(
      {
        success: false,
        error: 'Tipo de arquivo não suportado',
        mimeType: file.type,
      },
      415,
    );
  }

  const now = new Date().toISOString();
  const docId = crypto.randomUUID();
  const patientId = params.data.id;

  // Instantiate default service lazily if not injected (production path)
  if (!documentService) {
    const { PatientDocumentService } = await import(
      '../../services/patient-document-service'
    );
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    let supabaseClient: any = undefined;
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    documentService = new PatientDocumentService({ supabaseClient });
  }

  // Delegate to service (injected or default)
  if (documentService) {
    try {
      const result = await documentService.uploadPatientDocument({
        patientId,
        file,
      });
      if (!result.success) {
        return c.json(
          { success: false, error: result.error || 'Falha no upload' },
          500,
        );
      }
      return c.json(result, 201);
    } catch {
      void _err;
      return c.json(
        { success: false, error: err?.message || 'Erro interno' },
        500,
      );
    }
  }

  // Default placeholder success response (no persistence yet)
  return c.json(
    {
      success: true,
      data: {
        id: docId,
        patientId,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: now,
      },
    },
    201,
  );
});

export default app;
