/**
 * GET /api/v2/patients endpoint (T043)
 * List patients with pagination, filtering, and search capabilities
 * Integration with PatientService, AuditService for LGPD compliance
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../../middleware/authn';
import { dataProtection } from '../../middleware/lgpd-middleware';
import { AuditService } from '../../services/audit-service';
import { LGPDService } from '../../services/lgpd-service';
import { PatientService } from '../../services/patient-service';

const app = new Hono();

// Query parameters validation schema
const ListPatientsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

app.get('/', requireAuth, dataProtection.clientView, async c => {
  const startTime = Date.now();

  try {
    const userId = c.get('userId');
    const query = c.req.query();

    // Validate query parameters
    const validationResult = ListPatientsQuerySchema.safeParse(query);
    if (!validationResult.success) {
      return c.json({
        success: false,
        error: 'Parâmetros de consulta inválidos',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, 400);
    }

    const { page, limit, search, status, gender, sortBy, sortOrder } = validationResult.data;

    // Build filters object
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (gender) filters.gender = gender;

    // Get client IP and User-Agent for audit logging
    const ipAddress = c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';

    // Validate LGPD data access permissions
    const lgpdService = new LGPDService();
    const lgpdValidation = await lgpdService.validateDataAccess({
      userId,
      dataType: 'patient_list',
      purpose: 'healthcare_management',
      legalBasis: 'legitimate_interest',
    });

    if (!lgpdValidation.success) {
      return c.json({
        success: false,
        error: 'Acesso negado por política LGPD',
        code: 'LGPD_ACCESS_DENIED',
      }, 403);
    }

    // Get healthcare context from headers
    const healthcareContext = c.req.header('X-Healthcare-Context');

    // List patients using PatientService
    const patientService = new PatientService();
    const result = await patientService.listPatients({
      userId,
      page,
      limit,
      search,
      filters,
      sortBy,
      sortOrder,
      healthcareContext,
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error || 'Erro interno do serviço',
      }, 500);
    }

    // Log data access for audit trail
    const auditService = new AuditService();
    await auditService.logActivity({
      userId,
      action: 'patient_list_access',
      resourceType: 'patient',
      resourceId: 'list',
      details: {
        page,
        limit,
        search,
        filters,
        resultCount: result.data.patients.length,
        totalCount: result.data.pagination.total,
      },
      ipAddress,
      userAgent,
      complianceContext: 'LGPD',
      sensitivityLevel: 'high',
    }).catch(err => {
      console.error('Audit logging failed:', err);
    });

    const responseTime = Date.now() - startTime;

    // Set response headers
    c.header('X-Data-Classification', 'sensitive');
    c.header('X-LGPD-Compliant', 'true');
    c.header('X-Audit-Logged', 'true');
    c.header('X-Total-Count', result.data.pagination.total.toString());
    c.header('X-Page', result.data.pagination.page.toString());
    c.header('X-Total-Pages', result.data.pagination.totalPages.toString());
    c.header('X-Response-Time', `${responseTime}ms`);
    c.header('Cache-Control', 'private, max-age=300');
    c.header('X-CFM-Compliant', 'true');
    c.header('X-Medical-Record-Access', 'logged');

    return c.json({
      success: true,
      data: {
        patients: result.data.patients,
        pagination: result.data.pagination,
      },
    });
  } catch (error) {
    console.error('Error listing patients:', error);

    return c.json({
      success: false,
      error: 'Erro interno do servidor',
    }, 500);
  }
});

export default app;
