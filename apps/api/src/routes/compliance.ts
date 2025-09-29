import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ComplianceService } from '@neonpro/security/compliance-service';
import { authMiddleware } from '../middleware/auth';

const compliance = new Hono();
const complianceService = new ComplianceService();

// Authentication middleware
compliance.use('*', authMiddleware);

// Schemas for validation
const clinicIdSchema = z.object({
  clinicId: z.string().uuid()
});

const reportSchema = z.object({
  format: z.enum(['pdf', 'json', 'csv']).default('pdf'),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
  includeAudit: z.boolean().default(true),
  includeMetrics: z.boolean().default(true)
});

const rightsRequestSchema = z.object({
  patientId: z.string().uuid(),
  requestType: z.enum(['access', 'correction', 'deletion', 'portability', 'objection', 'automated_decision']),
  details: z.string().min(10)
});

// Get compliance metrics for a clinic
compliance.get('/metrics/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    
    // Check if user has access to this clinic
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const metrics = await complianceService.generateComplianceMetrics(clinicId);
    
    return c.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching compliance metrics:', error);
    return c.json({ error: 'Erro ao buscar métricas de compliance' }, 500);
  }
});

// Get consent statistics for a clinic
compliance.get('/stats/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const stats = await complianceService.generateConsentStats(clinicId);
    
    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching consent stats:', error);
    return c.json({ error: 'Erro ao buscar estatísticas de consentimento' }, 500);
  }
});

// Generate compliance report
compliance.post('/report/:clinicId', zValidator('param', clinicIdSchema), zValidator('json', reportSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    const options = c.req.valid('json');
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const report = await complianceService.generateReport(clinicId, options);
    
    return c.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    return c.json({ error: 'Erro ao gerar relatório de compliance' }, 500);
  }
});

// Process data subject rights request
compliance.post('/rights-request', zValidator('json', rightsRequestSchema), async (c) => {
  try {
    const requestData = c.req.valid('json');
    
    const user = c.get('user');
    
    // Verify user can access this patient's data
    const hasAccess = await complianceService.verifyPatientAccess(user.id, requestData.patientId);
    if (!hasAccess) {
      return c.json({ error: 'Acesso não autorizado aos dados do paciente' }, 403);
    }

    const request = {
      id: `rights_${Date.now()}`,
      ...requestData,
      status: 'pending' as const,
      requestedAt: new Date().toISOString()
    };

    const processedRequest = await complianceService.processDataSubjectRightsRequest(request);
    
    return c.json({
      success: true,
      data: processedRequest
    });
  } catch (error) {
    console.error('Error processing rights request:', error);
    return c.json({ error: 'Erro ao processar solicitação de direitos' }, 500);
  }
});

// Get data subject rights requests for a clinic
compliance.get('/rights-requests/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    const status = c.req.query('status') as string;
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const requests = await complianceService.getRightsRequests(clinicId, status);
    
    return c.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching rights requests:', error);
    return c.json({ error: 'Erro ao buscar solicitações de direitos' }, 500);
  }
});

// Get compliance alerts for a clinic
compliance.get('/alerts/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    const severity = c.req.query('severity') as string;
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const alerts = await complianceService.getComplianceAlerts(clinicId, severity);
    
    return c.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching compliance alerts:', error);
    return c.json({ error: 'Erro ao buscar alertas de compliance' }, 500);
  }
});

// Acknowledge compliance alert
compliance.post('/alerts/:alertId/acknowledge', async (c) => {
  try {
    const { alertId } = c.req.param();
    const user = c.get('user');
    
    const result = await complianceService.acknowledgeAlert(alertId, user.id);
    
    if (!result) {
      return c.json({ error: 'Alerta não encontrado' }, 404);
    }
    
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return c.json({ error: 'Erro ao confirmar alerta' }, 500);
  }
});

// Get compliance settings for a clinic
compliance.get('/settings/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const settings = await complianceService.getComplianceSettings(clinicId);
    
    return c.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching compliance settings:', error);
    return c.json({ error: 'Erro ao buscar configurações de compliance' }, 500);
  }
});

// Update compliance settings for a clinic
compliance.put('/settings/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    const settings = await c.req.json();
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const updatedSettings = await complianceService.updateComplianceSettings(clinicId, settings);
    
    return c.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error updating compliance settings:', error);
    return c.json({ error: 'Erro ao atualizar configurações de compliance' }, 500);
  }
});

// Export compliance data
compliance.get('/export/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    const format = c.req.query('format') as 'json' | 'csv' || 'json';
    const startDate = c.req.query('startDate') as string;
    const endDate = c.req.query('endDate') as string;
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const exportData = await complianceService.exportComplianceData(clinicId, {
      format,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });
    
    if (format === 'csv') {
      return new Response(exportData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="compliance-export-${clinicId}.csv"`
        }
      });
    }
    
    return c.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting compliance data:', error);
    return c.json({ error: 'Erro ao exportar dados de compliance' }, 500);
  }
});

// Get compliance dashboard data (combined endpoint)
compliance.get('/dashboard/:clinicId', zValidator('param', clinicIdSchema), async (c) => {
  try {
    const { clinicId } = c.req.param();
    
    const user = c.get('user');
    if (!user.clinics?.includes(clinicId)) {
      return c.json({ error: 'Acesso não autorizado a esta clínica' }, 403);
    }

    const [metrics, stats, alerts, settings] = await Promise.all([
      complianceService.generateComplianceMetrics(clinicId),
      complianceService.generateConsentStats(clinicId),
      complianceService.getComplianceAlerts(clinicId),
      complianceService.getComplianceSettings(clinicId)
    ]);
    
    return c.json({
      success: true,
      data: {
        metrics,
        stats,
        alerts,
        settings,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return c.json({ error: 'Erro ao buscar dados do dashboard' }, 500);
  }
});

export default compliance;