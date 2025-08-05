/**
 * LGPD Compliance Reports API
 * API para geração e gerenciamento de relatórios de compliance LGPD
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 37, 38, 39 (Relatórios e Documentação)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { validateCSRF } from '@/lib/security/csrf';
import { rateLimit } from '@/lib/security/rate-limit';
import { requireAuth } from '@/lib/auth/middleware';
import { hasPermission } from '@/lib/rbac/permissions';
import { LGPDAuditTrail, AuditEventType } from '@/lib/compliance/audit-trail';
import { LGPDCore } from '@/lib/compliance/lgpd-core';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ReportRequestSchema = z.object({
  type: z.enum(['compliance', 'audit', 'consent', 'data_subject', 'security']),
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  format: z.enum(['json', 'pdf', 'csv', 'xlsx']).default('json'),
  filters: z.object({
    userId: z.string().uuid().optional(),
    eventType: z.nativeEnum(AuditEventType).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    status: z.enum(['success', 'failure', 'warning', 'error']).optional(),
    resourceType: z.string().optional()
  }).optional(),
  includeDetails: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true)
});

const ReportListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  type: z.enum(['compliance', 'audit', 'consent', 'data_subject', 'security']).optional(),
  sortBy: z.enum(['createdAt', 'type', 'period']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ============================================================================
// TYPES
// ============================================================================

interface ComplianceReport {
  id: string;
  clinicId: string;
  type: string;
  period: {
    start: Date;
    end: Date;
  };
  format: string;
  status: 'generating' | 'completed' | 'failed';
  summary: {
    totalEvents: number;
    complianceScore: number;
    criticalIssues: number;
    recommendations: string[];
  };
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  generatedBy: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function initializeServices() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const auditTrail = new LGPDAuditTrail(supabase);
  const lgpdCore = new LGPDCore(supabase);
  
  return { supabase, auditTrail, lgpdCore };
}

async function generateComplianceReport(
  clinicId: string,
  request: z.infer<typeof ReportRequestSchema>,
  userId: string
) {
  const { supabase, auditTrail, lgpdCore } = initializeServices();
  
  try {
    const period = {
      start: new Date(request.period.start),
      end: new Date(request.period.end)
    };

    // Generate base report
    const baseReport = await auditTrail.generateComplianceReport(
      clinicId,
      period,
      userId
    );

    // Add specific report type data
    let reportData = { ...baseReport };

    switch (request.type) {
      case 'audit':
        reportData = await generateAuditReport(auditTrail, clinicId, period, request.filters);
        break;
      case 'consent':
        reportData = await generateConsentReport(lgpdCore, clinicId, period);
        break;
      case 'data_subject':
        reportData = await generateDataSubjectReport(lgpdCore, clinicId, period);
        break;
      case 'security':
        reportData = await generateSecurityReport(auditTrail, clinicId, period);
        break;
      default:
        // Use base compliance report
        break;
    }

    // Format report based on requested format
    const formattedReport = await formatReport(reportData, request.format);
    
    return formattedReport;

  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    throw new Error('Falha ao gerar relatório de compliance');
  }
}

async function generateAuditReport(
  auditTrail: LGPDAuditTrail,
  clinicId: string,
  period: { start: Date; end: Date },
  filters?: any
) {
  const query = {
    clinicId,
    startDate: period.start,
    endDate: period.end,
    limit: 10000,
    ...filters
  };

  const { events } = await auditTrail.queryEvents(query);
  
  return {
    id: crypto.randomUUID(),
    type: 'audit',
    period,
    summary: {
      totalEvents: events.length,
      eventsByType: events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      eventsBySeverity: events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      timeRange: {
        start: period.start,
        end: period.end
      }
    },
    events: events.slice(0, 1000), // Limit for performance
    generatedAt: new Date()
  };
}

async function generateConsentReport(
  lgpdCore: LGPDCore,
  clinicId: string,
  period: { start: Date; end: Date }
) {
  // This would integrate with the consent management system
  return {
    id: crypto.randomUUID(),
    type: 'consent',
    period,
    summary: {
      totalConsents: 0,
      activeConsents: 0,
      withdrawnConsents: 0,
      expiredConsents: 0,
      consentsByPurpose: {},
      complianceRate: 100
    },
    details: [],
    generatedAt: new Date()
  };
}

async function generateDataSubjectReport(
  lgpdCore: LGPDCore,
  clinicId: string,
  period: { start: Date; end: Date }
) {
  // This would integrate with data subject rights system
  return {
    id: crypto.randomUUID(),
    type: 'data_subject',
    period,
    summary: {
      totalRequests: 0,
      pendingRequests: 0,
      completedRequests: 0,
      requestsByType: {},
      averageResponseTime: 0,
      complianceRate: 100
    },
    requests: [],
    generatedAt: new Date()
  };
}

async function generateSecurityReport(
  auditTrail: LGPDAuditTrail,
  clinicId: string,
  period: { start: Date; end: Date }
) {
  const securityEvents = await auditTrail.queryEvents({
    clinicId,
    startDate: period.start,
    endDate: period.end,
    eventType: AuditEventType.UNAUTHORIZED_ACCESS,
    limit: 1000
  });

  const breachEvents = await auditTrail.queryEvents({
    clinicId,
    startDate: period.start,
    endDate: period.end,
    eventType: AuditEventType.DATA_BREACH,
    limit: 1000
  });

  return {
    id: crypto.randomUUID(),
    type: 'security',
    period,
    summary: {
      totalSecurityEvents: securityEvents.events.length + breachEvents.events.length,
      unauthorizedAccess: securityEvents.events.length,
      dataBreaches: breachEvents.events.length,
      criticalEvents: [...securityEvents.events, ...breachEvents.events]
        .filter(e => e.severity === 'critical').length,
      riskLevel: breachEvents.events.length > 0 ? 'high' : 
                 securityEvents.events.length > 10 ? 'medium' : 'low'
    },
    events: [...securityEvents.events, ...breachEvents.events],
    generatedAt: new Date()
  };
}

async function formatReport(reportData: any, format: string) {
  switch (format) {
    case 'json':
      return {
        data: reportData,
        contentType: 'application/json'
      };
    
    case 'csv':
      // Convert to CSV format
      const csvData = convertToCSV(reportData);
      return {
        data: csvData,
        contentType: 'text/csv',
        filename: `compliance-report-${Date.now()}.csv`
      };
    
    case 'pdf':
      // Generate PDF (would use a PDF library)
      return {
        data: reportData, // Placeholder - would generate actual PDF
        contentType: 'application/pdf',
        filename: `compliance-report-${Date.now()}.pdf`
      };
    
    case 'xlsx':
      // Generate Excel file (would use an Excel library)
      return {
        data: reportData, // Placeholder - would generate actual Excel
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `compliance-report-${Date.now()}.xlsx`
      };
    
    default:
      return {
        data: reportData,
        contentType: 'application/json'
      };
  }
}

function convertToCSV(data: any): string {
  // Simple CSV conversion - would be more sophisticated in production
  if (data.events && Array.isArray(data.events)) {
    const headers = Object.keys(data.events[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.events.map((event: any) => 
        headers.map(header => 
          JSON.stringify(event[header] || '')
        ).join(',')
      )
    ];
    return csvRows.join('\n');
  }
  
  return JSON.stringify(data, null, 2);
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET /api/compliance/reports
 * List compliance reports
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000 // 15 minutes
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const authResult = await requireAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Authorization
    const hasAccess = await hasPermission(
      user.id,
      user.clinicId,
      'compliance.reports.read'
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const query = ReportListQuerySchema.parse(queryParams);

    // Initialize services
    const { supabase } = initializeServices();

    // Query reports
    const offset = (query.page - 1) * query.limit;
    let dbQuery = supabase
      .from('lgpd_compliance_reports')
      .select('*', { count: 'exact' })
      .eq('clinicId', user.clinicId)
      .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
      .range(offset, offset + query.limit - 1);

    if (query.type) {
      dbQuery = dbQuery.eq('type', query.type);
    }

    const { data: reports, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return NextResponse.json({
      reports: reports || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / query.limit)
      }
    });

  } catch (error) {
    console.error('GET /api/compliance/reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/reports
 * Generate new compliance report
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000 // 15 minutes
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // CSRF validation
    const csrfValid = await validateCSRF(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }

    // Authentication
    const authResult = await requireAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Authorization
    const hasAccess = await hasPermission(
      user.id,
      user.clinicId,
      'compliance.reports.create'
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const reportRequest = ReportRequestSchema.parse(body);

    // Initialize services
    const { supabase, auditTrail } = initializeServices();

    // Create report record
    const reportId = crypto.randomUUID();
    const reportRecord = {
      id: reportId,
      clinicId: user.clinicId,
      type: reportRequest.type,
      period: reportRequest.period,
      format: reportRequest.format,
      status: 'generating',
      createdAt: new Date().toISOString(),
      generatedBy: user.id,
      filters: reportRequest.filters || {}
    };

    const { error: insertError } = await supabase
      .from('lgpd_compliance_reports')
      .insert(reportRecord);

    if (insertError) {
      throw new Error(`Failed to create report record: ${insertError.message}`);
    }

    // Log audit event
    await auditTrail.logEvent({
      eventType: AuditEventType.DATA_EXPORT,
      severity: 'medium',
      status: 'success',
      userId: user.id,
      clinicId: user.clinicId,
      action: 'generate_compliance_report',
      description: `Generated ${reportRequest.type} compliance report`,
      details: {
        reportId,
        reportType: reportRequest.type,
        period: reportRequest.period,
        format: reportRequest.format
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Generate report asynchronously (in production, this would be a background job)
    try {
      const reportData = await generateComplianceReport(
        user.clinicId,
        reportRequest,
        user.id
      );

      // Update report with generated data
      await supabase
        .from('lgpd_compliance_reports')
        .update({
          status: 'completed',
          completedAt: new Date().toISOString(),
          summary: reportData.data.summary || {},
          downloadUrl: reportData.filename ? `/api/compliance/reports/${reportId}/download` : null
        })
        .eq('id', reportId);

      return NextResponse.json({
        reportId,
        status: 'completed',
        data: reportData.data,
        downloadUrl: reportData.filename ? `/api/compliance/reports/${reportId}/download` : null
      });

    } catch (generateError) {
      // Update report status to failed
      await supabase
        .from('lgpd_compliance_reports')
        .update({
          status: 'failed',
          completedAt: new Date().toISOString(),
          error: generateError instanceof Error ? generateError.message : 'Unknown error'
        })
        .eq('id', reportId);

      throw generateError;
    }

  } catch (error) {
    console.error('POST /api/compliance/reports error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

