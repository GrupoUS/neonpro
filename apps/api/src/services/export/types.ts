export interface ExportFormat {
  format: 'csv' | 'xlsx';
  mimeType: string;
  extension: string;
}

export const EXPORT_FORMATS: Record<string, ExportFormat> = {
  csv: {
    format: 'csv',
    mimeType: 'text/csv',
    extension: 'csv',
  },
  xlsx: {
    format: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
  },
};

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  includeHeaders: boolean;
  delimiter?: string;
  encoding?: string;
  compression?: boolean;
}

export interface ExportFilter {
  search?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  fields?: string[];
}

export interface ExportPagination {
  page: number;
  limit: number;
  offset: number;
}

export interface ExportConfig {
  maxRecords: number;
  chunkSize: number;
  timeout: number;
  rateLimit: number;
}

export interface ExportJob {
  id: string;
  userId: string;
  format: 'csv' | 'xlsx';
  filters: ExportFilter;
  pagination: ExportPagination;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  result?: {
    url: string;
    size: number;
    recordCount: number;
    expiresAt: Date;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ExportMetrics {
  totalRecords: number;
  exportedRecords: number;
  processingTime: number;
  fileSize: number;
  averageSpeed: number;
}

export interface LGPDComplianceOptions {
  anonymizeSensitiveFields: boolean;
  excludeRestrictedFields: boolean;
  purpose: string;
  retentionDays: number;
  consentRequired: boolean;
}

export interface PatientExportField {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  sensitive: boolean;
  required: boolean;
  formatter?: (value: any) => string;
}

export const DEFAULT_EXPORT_FIELDS: PatientExportField[] = [
  {
    field: 'id',
    label: 'ID',
    type: 'string',
    sensitive: false,
    required: true,
  },
  {
    field: 'name',
    label: 'Nome Completo',
    type: 'string',
    sensitive: true,
    required: true,
  },
  {
    field: 'email',
    label: 'Email',
    type: 'string',
    sensitive: true,
    required: true,
  },
  {
    field: 'phone',
    label: 'Telefone',
    type: 'string',
    sensitive: true,
    required: false,
  },
  {
    field: 'cpf',
    label: 'CPF',
    type: 'string',
    sensitive: true,
    required: false,
    formatter: (value: string) =>
      value ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '',
  },
  {
    field: 'dateOfBirth',
    label: 'Data de Nascimento',
    type: 'date',
    sensitive: true,
    required: false,
    formatter: (value: Date) => value ? new Date(value).toLocaleDateString('pt-BR') : '',
  },
  {
    field: 'gender',
    label: 'Gênero',
    type: 'string',
    sensitive: true,
    required: false,
  },
  {
    field: 'bloodType',
    label: 'Tipo Sanguíneo',
    type: 'string',
    sensitive: false,
    required: false,
  },
  {
    field: 'allergies',
    label: 'Alergias',
    type: 'array',
    sensitive: true,
    required: false,
    formatter: (value: string[]) => Array.isArray(value) ? value.join('; ') : '',
  },
  {
    field: 'medications',
    label: 'Medicamentos',
    type: 'array',
    sensitive: true,
    required: false,
    formatter: (value: string[]) => Array.isArray(value) ? value.join('; ') : '',
  },
  {
    field: 'emergencyContact',
    label: 'Contato de Emergência',
    type: 'string',
    sensitive: true,
    required: false,
  },
  {
    field: 'status',
    label: 'Status',
    type: 'string',
    sensitive: false,
    required: true,
  },
  {
    field: 'createdAt',
    label: 'Data de Cadastro',
    type: 'date',
    sensitive: false,
    required: true,
    formatter: (value: Date) => value ? new Date(value).toLocaleDateString('pt-BR') : '',
  },
  {
    field: 'updatedAt',
    label: 'Última Atualização',
    type: 'date',
    sensitive: false,
    required: true,
    formatter: (value: Date) => value ? new Date(value).toLocaleDateString('pt-BR') : '',
  },
];
