import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { z } from 'zod'
import { ExportService } from '../../services/export/export-service'
import { ExportFilter, ExportPagination, LGPDComplianceOptions } from '../../services/export/types'

const exportRouter = new Hono()

const exportSchema = z.object({
  format: z.enum(['csv', 'xlsx']).default('csv'),
  filters: z
    .object({
      search: z.string().optional(),
      status: z.string().optional(),
      dateRange: z
        .object({
          start: z.string(),
          end: z.string(),
        })
        .optional(),
      fields: z.array(z.string()).optional(),
    })
    .optional(),
  pagination: z
    .object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(1000).default(100),
    })
    .default({
      page: 1,
      limit: 100,
    }),
  lgpdOptions: z
    .object({
      anonymizeSensitiveFields: z.boolean().default(true),
      excludeRestrictedFields: z.boolean().default(false),
      purpose: z.string().default('DATA_EXPORT'),
      retentionDays: z.number().min(1).max(365).default(30),
      consentRequired: z.boolean().default(true),
    })
    .default({
      anonymizeSensitiveFields: true,
      excludeRestrictedFields: false,
      purpose: 'DATA_EXPORT',
      retentionDays: 30,
      consentRequired: true,
    }),
})

exportRouter.post(
  '/export',
  jwt({ secret: process.env.JWT_SECRET || 'default-secret' }),
  async c => {
    try {
      const _userId = c.get('jwtPayload').sub
      if (!_userId) {
        return c.json({ error: 'Usuário não autenticado' }, 401)
      }

      const body = await c.req.json()
      const validatedData = exportSchema.parse(body)

      const filters: ExportFilter = {
        search: validatedData.filters?.search,
        status: validatedData.filters?.status,
        dateRange: validatedData.filters?.dateRange
          ? {
            start: new Date(validatedData.filters.dateRange.start),
            end: new Date(validatedData.filters.dateRange.end),
          }
          : undefined,
        fields: validatedData.filters?.fields,
      }

      const pagination: ExportPagination = {
        page: validatedData.pagination.page,
        limit: validatedData.pagination.limit,
        offset: (validatedData.pagination.page - 1) * validatedData.pagination.limit,
      }

      const lgpdOptions: LGPDComplianceOptions = validatedData.lgpdOptions

      const job = await ExportService.createExportJob(
        _userId,
        validatedData.format,
        filters,
        pagination,
        lgpdOptions,
      )

      return c.json(
        {
          success: true,
          data: {
            jobId: job.id,
            status: job.status,
            message: 'Exportação iniciada com sucesso',
            estimatedTime: '2-5 minutos',
          },
        },
        202,
      )
    } catch (error) {
      console.error('Erro ao iniciar exportação:', error)

      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: 'Dados inválidos',
            details: error.errors,
          },
          400,
        )
      }

      return c.json(
        {
          error: 'Erro ao iniciar exportação',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        500,
      )
    }
  },
)

exportRouter.get(
  '/export/:jobId',
  jwt({ secret: process.env.JWT_SECRET || 'default-secret' }),
  async c => {
    try {
      const _userId = c.get('jwtPayload').sub
      if (!_userId) {
        return c.json({ error: 'Usuário não autenticado' }, 401)
      }

      const jobId = c.req.param('jobId')
      const job = await ExportService.getExportJob(jobId)

      if (!job) {
        return c.json({ error: 'Exportação não encontrada' }, 404)
      }

      if (job.userId !== _userId) {
        return c.json({ error: 'Acesso não autorizado' }, 403)
      }

      return c.json({
        success: true,
        data: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          result: job.result,
          error: job.error,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          completedAt: job.completedAt,
        },
      })
    } catch (error) {
      console.error('Erro ao buscar status da exportação:', error)
      return c.json(
        {
          error: 'Erro ao buscar status da exportação',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        500,
      )
    }
  },
)

exportRouter.delete(
  '/export/:jobId',
  jwt({ secret: process.env.JWT_SECRET || 'default-secret' }),
  async c => {
    try {
      const _userId = c.get('jwtPayload').sub
      if (!_userId) {
        return c.json({ error: 'Usuário não autenticado' }, 401)
      }

      const jobId = c.req.param('jobId')
      const success = await ExportService.cancelExportJob(jobId, _userId)

      if (!success) {
        return c.json(
          { error: 'Exportação não encontrada ou não pode ser cancelada' },
          404,
        )
      }

      return c.json({
        success: true,
        message: 'Exportação cancelada com sucesso',
      })
    } catch (error) {
      console.error('Erro ao cancelar exportação:', error)
      return c.json(
        {
          error: 'Erro ao cancelar exportação',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        500,
      )
    }
  },
)

exportRouter.get(
  '/export/:jobId/download',
  jwt({ secret: process.env.JWT_SECRET || 'default-secret' }),
  async c => {
    try {
      const _userId = c.get('jwtPayload').sub
      if (!_userId) {
        return c.json({ error: 'Usuário não autenticado' }, 401)
      }

      const jobId = c.req.param('jobId')
      const job = await ExportService.getExportJob(jobId)

      if (!job) {
        return c.json({ error: 'Exportação não encontrada' }, 404)
      }

      if (job.userId !== _userId) {
        return c.json({ error: 'Acesso não autorizado' }, 403)
      }

      if (job.status !== 'completed' || !job.result) {
        return c.json({ error: 'Exportação não concluída' }, 400)
      }

      if (new Date() > job.result.expiresAt) {
        return c.json({ error: 'Link de download expirado' }, 410)
      }

      return c.json({
        success: true,
        data: {
          downloadUrl: job.result.url,
          filename: `pacientes_${jobId}.${job.format}`,
          size: job.result.size,
          recordCount: job.result.recordCount,
          expiresAt: job.result.expiresAt,
        },
      })
    } catch {
      console.error('Erro ao gerar link de download:', error)
      return c.json(
        {
          error: 'Erro ao gerar link de download',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        500,
      )
    }
  },
)

exportRouter.get(
  '/export',
  jwt({ secret: process.env.JWT_SECRET || 'default-secret' }),
  async c => {
    try {
      const _userId = c.get('jwtPayload').sub
      if (!_userId) {
        return c.json({ error: 'Usuário não autenticado' }, 401)
      }

      const limit = parseInt(c.req.query('limit') || '10')
      const history = await ExportService.getExportHistory(userId, limit)

      return c.json({
        success: true,
        data: history,
      })
    } catch {
      console.error('Erro ao buscar histórico de exportações:', error)
      return c.json(
        {
          error: 'Erro ao buscar histórico de exportações',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        500,
      )
    }
  },
)

exportRouter.get(
  '/export/:jobId/metrics',
  jwt({ secret: process.env.JWT_SECRET || 'default-secret' }),
  async c => {
    try {
      const _userId = c.get('jwtPayload').sub
      if (!_userId) {
        return c.json({ error: 'Usuário não autenticado' }, 401)
      }

      const jobId = c.req.param('jobId')
      const job = await ExportService.getExportJob(jobId)

      if (!job || job.userId !== _userId) {
        return c.json({ error: 'Exportação não encontrada' }, 404)
      }

      const metrics = await ExportService.getExportMetrics(jobId)

      if (!metrics) {
        return c.json({ error: 'Métricas não encontradas' }, 404)
      }

      return c.json({
        success: true,
        data: metrics,
      })
    } catch {
      console.error('Erro ao buscar métricas:', error)
      return c.json(
        {
          error: 'Erro ao buscar métricas',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        500,
      )
    }
  },
)

exportRouter.get('/export/meta/formats', async c => {
  try {
    const formats = await ExportService.getExportFormats()
    return c.json({
      success: true,
      data: formats,
    })
  } catch {
    console.error('Erro ao buscar formatos:', error)
    return c.json(
      {
        error: 'Erro ao buscar formatos',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      500,
    )
  }
})

exportRouter.get(
  '/export/meta/fields',
  jwt({ secret: process.env.JWT_SECRET || 'default-secret' }),
  async c => {
    try {
      const fields = await ExportService.getExportFields()
      return c.json({
        success: true,
        data: fields,
      })
    } catch {
      console.error('Erro ao buscar campos:', error)
      return c.json(
        {
          error: 'Erro ao buscar campos',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        500,
      )
    }
  },
)

export { exportRouter as patientsExportRouter }
