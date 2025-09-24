import { ExportLGPDCompliance } from './lgpd-compliance'
import {
  ExportConfig,
  ExportFilter,
  ExportJob,
  ExportMetrics,
  ExportPagination,
  LGPDComplianceOptions,
  PatientExportField,
} from './types'
import { DEFAULT_EXPORT_FIELDS } from './types'

export class ExportService {
  private static readonly DEFAULT_CONFIG: ExportConfig = {
    maxRecords: 10000,
    chunkSize: 1000,
    timeout: 300000, // 5 minutes
    rateLimit: 100, // requests per minute
  }

  private static readonly ACTIVE_JOBS = new Map<string, ExportJob>()

  static async createExportJob(
    _userId: string,
    format: 'csv' | 'xlsx',
    filters: ExportFilter,
    pagination: ExportPagination,
    lgpdOptions: LGPDComplianceOptions,
  ): Promise<ExportJob> {
    const jobId = this.generateJobId()

    const job: ExportJob = {
      id: jobId,
      userId,
      format,
      filters,
      pagination,
      status: 'pending',
      progress: {
        processed: 0,
        total: 0,
        percentage: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.ACTIVE_JOBS.set(jobId, job)

    this.processExportJob(jobId, lgpdOptions)

    return job
  }

  static async getExportJob(jobId: string): Promise<ExportJob | null> {
    return this.ACTIVE_JOBS.get(jobId) || null
  }

  static async cancelExportJob(
    jobId: string,
    _userId: string,
  ): Promise<boolean> {
    const job = this.ACTIVE_JOBS.get(jobId)

    if (!job || job.userId !== _userId) {
      return false
    }

    if (job.status === 'processing') {
      job.status = 'cancelled'
      job.updatedAt = new Date()
      return true
    }

    return false
  }

  static async getExportFormats(): Promise<
    Array<{ format: string; description: string }>
  > {
    return [
      {
        format: 'csv',
        description: 'Valores separados por vírgula, compatível com Excel',
      },
      {
        format: 'xlsx',
        description: 'Formato Excel nativo com múltiplas planilhas',
      },
    ]
  }

  static async getExportFields(): Promise<PatientExportField[]> {
    return DEFAULT_EXPORT_FIELDS
  }

  static async getExportHistory(
    _userId: string,
    limit: number = 10,
  ): Promise<ExportJob[]> {
    const userJobs = Array.from(this.ACTIVE_JOBS.values())
      .filter((job) => job.userId === _userId)
      .sort((a, _b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)

    return userJobs
  }

  private static async processExportJob(
    jobId: string,
    lgpdOptions: LGPDComplianceOptions,
  ): Promise<void> {
    const job = this.ACTIVE_JOBS.get(jobId)
    if (!job) return

    try {
      job.status = 'processing'
      job.updatedAt = new Date()

      const { data, total } = await this.fetchPatientData(
        job.filters,
        job.pagination,
      )

      job.progress.total = total

      const validated = await ExportLGPDCompliance.validateExportRequest(
        job.userId,
        lgpdOptions,
        total,
      )

      if (!validated.valid) {
        throw new Error(validated.error)
      }

      const processedData = ExportLGPDCompliance.anonymizeData(
        data,
        DEFAULT_EXPORT_FIELDS,
        lgpdOptions,
      )

      const exportUrl = await this.generateExportFile(
        processedData,
        job.format,
        job.id,
      )

      job.status = 'completed'
      job.result = {
        url: exportUrl,
        size: this.calculateFileSize(processedData, job.format),
        recordCount: processedData.length,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
      job.completedAt = new Date()

      await ExportLGPDCompliance.logDataAccess(
        job.userId,
        job.id,
        DEFAULT_EXPORT_FIELDS,
        processedData.length,
      )
    } catch {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Erro desconhecido'
      job.updatedAt = new Date()
    } finally {
      job.progress.processed = job.progress.total
      job.progress.percentage = 100
      job.updatedAt = new Date()
    }
  }

  private static async fetchPatientData(
    filters: ExportFilter,
    pagination: ExportPagination,
  ): Promise<{ data: any[]; total: number }> {
    const mockData = this.generateMockPatientData(pagination.limit)

    return {
      data: mockData,
      total: mockData.length,
    }
  }

  private static generateMockPatientData(count: number): any[] {
    const _data = []

    for (let i = 1; i <= count; i++) {
      data.push({
        id: `patient_${i}`,
        name: `Paciente ${i}`,
        email: `paciente${i}@email.com`,
        phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${
          Math.floor(Math.random() * 9000) + 1000
        }`,
        cpf: `${Math.floor(Math.random() * 900000000) + 100000000}${
          Math.floor(Math.random() * 90) + 10
        }`,
        dateOfBirth: new Date(
          1980 + Math.floor(Math.random() * 30),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        ),
        gender: ['Masculino', 'Feminino', 'Outro'][
          Math.floor(Math.random() * 3)
        ],
        bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][
          Math.floor(Math.random() * 8)
        ],
        allergies: ['Penicilina', 'Látex', 'Amendoim'][Math.floor(Math.random() * 3)]
          || [],
        medications: ['Dipirona', 'Paracetamol', 'Ibuprofeno'][
          Math.floor(Math.random() * 3)
        ] || [],
        emergencyContact: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${
          Math.floor(Math.random() * 9000) + 1000
        }`,
        status: ['ativo', 'inativo', 'pendente'][Math.floor(Math.random() * 3)],
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        ),
      })
    }

    return data
  }

  private static async generateExportFile(
    data: any[],
    format: 'csv' | 'xlsx',
    jobId: string,
  ): Promise<string> {
    if (format === 'csv') {
      return this.generateCSV(data, jobId)
    } else {
      return this.generateXLSX(data, jobId)
    }
  }

  private static async generateCSV(
    data: any[],
    jobId: string,
  ): Promise<string> {
    const Papa = await import('papaparse')

    const fields = DEFAULT_EXPORT_FIELDS.filter((f) => f.required)
    const headers = fields.map((f) => f.label)

    const csvData = data.map((record) => {
      return fields.map((field) => {
        const value = record[field.field]
        return field.formatter ? field.formatter(value) : value || ''
      })
    })

    /* const csv = */ Papa.unparse({
      fields: headers,
      data: csvData,
    })

    return `/api/exports/${jobId}/data.csv`
  }

  private static async generateXLSX(
    data: any[],
    jobId: string,
  ): Promise<string> {
    return `/api/exports/${jobId}/data.xlsx`
  }

  private static calculateFileSize(
    data: any[],
    format: 'csv' | 'xlsx',
  ): number {
    const estimatedSize = data.length * 500 // rough estimate
    return format === 'csv' ? estimatedSize : estimatedSize * 1.2
  }

  private static generateJobId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static async getExportMetrics(jobId: string): Promise<ExportMetrics | null> {
    const job = this.ACTIVE_JOBS.get(jobId)
    if (!job) return null

    return {
      totalRecords: job.progress.total,
      exportedRecords: job.progress.processed,
      processingTime: job.completedAt
        ? job.completedAt.getTime() - job.createdAt.getTime()
        : 0,
      fileSize: job.result?.size || 0,
      averageSpeed: job.progress.processed > 0
        ? job.progress.processed
          / ((job.updatedAt.getTime() - job.createdAt.getTime()) / 1000)
        : 0,
    }
  }

  static async cleanupExpiredJobs(): Promise<void> {
    const now = new Date()

    for (const [jobId, job] of this.ACTIVE_JOBS.entries()) {
      if (job.result && job.result.expiresAt < now) {
        this.ACTIVE_JOBS.delete(jobId)
      }
    }
  }
}
