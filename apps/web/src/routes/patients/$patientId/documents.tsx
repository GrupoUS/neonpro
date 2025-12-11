/**
 * Patient Documents Route - File Management with LGPD Compliance
 * Features: Upload, organize, preview, secure sharing, audit trail
 */

import { useAuth } from '@/hooks/useAuth';
import {
  useDeleteDocument,
  useDeleteDocuments,
  useDocumentDownloadUrl,
  usePatientDocuments,
  useUploadDocument,
} from '@/hooks/usePatientDocuments';
import { usePatient } from '@/hooks/usePatients';
import type { PatientDocument } from '@/services/patient-documents.service';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  Clock,
  Download,
  Eye,
  File,
  FileText,
  FolderOpen,
  Image,
  Loader2,
  Lock,
  MoreVertical,
  Search,
  Share2,
  Shield,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

// Type-safe params schema
const patientParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Search params for filtering documents
const documentsSearchSchema = z.object({
  documentType: z.enum(['all', 'medical', 'exam', 'consent', 'insurance', 'photo', 'prescription', 'report', 'other']).optional()
    .default('all'),
  sortBy: z.enum(['created_at', 'document_type', 'status']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Route definition
export const Route = createFileRoute('/patients/$patientId/documents')({
  // Type-safe parameter validation
  params: {
    parse: params => patientParamsSchema.parse(params),
    stringify: params => params,
  },

  // Type-safe search parameter validation
  validateSearch: documentsSearchSchema,

  // Loading component
  pendingComponent: () => (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      <div className='animate-pulse space-y-6'>
        <div className='h-8 bg-muted rounded w-1/3'></div>
        <div className='flex gap-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-10 bg-muted rounded w-32'></div>
          ))}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-48 bg-muted rounded-lg'></div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Error boundary
  errorComponent: ({ error, reset }) => (
    <div className='container mx-auto p-4 md:p-6'>
      <Card className='max-w-lg mx-auto text-center'>
        <CardHeader>
          <div className='mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4'>
            <AlertCircle className='w-6 h-6 text-destructive' />
          </div>
          <CardTitle className='text-destructive'>Erro ao Carregar Documentos</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            Não foi possível carregar os documentos do paciente.
          </p>
          <p className='text-sm text-muted-foreground font-mono bg-muted p-2 rounded'>
            {error.message}
          </p>
          <div className='flex gap-2 justify-center'>
            <Button onClick={reset} variant='outline'>
              Tentar Novamente
            </Button>
            <Button asChild>
              <Link to='/patients'>Voltar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  component: PatientDocumentsPage,
});

function PatientDocumentsPage() {
  const { patientId } = Route.useParams();
  const { documentType, sortBy, sortOrder } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get clinic ID from user
  const clinicId = (user as any)?.user_metadata?.clinic_id || (user as any)?.clinic_id;

  // Data fetching
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const {
    data: documents = [],
    isLoading: documentsLoading,
    error: documentsError,
  } = usePatientDocuments(patientId, {
    documentType: documentType === 'all' ? undefined : documentType,
    sortBy,
    sortOrder,
  });

  // Mutations
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const deleteMultipleMutation = useDeleteDocuments();
  const downloadMutation = useDocumentDownloadUrl();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Filter documents by search query (additional client-side filtering)
  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents;

    const query = searchQuery.toLowerCase();
    return documents.filter(doc => {
      const filename = doc.upload?.file_name || '';
      return filename.toLowerCase().includes(query)
        || doc.notes?.toLowerCase().includes(query)
        || doc.document_type.toLowerCase().includes(query)
        || doc.tags?.some(tag => tag.toLowerCase().includes(query));
    });
  }, [documents, searchQuery]);

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || !clinicId || !patient?.email) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        await uploadMutation.mutateAsync({
          patientId,
          patientEmail: patient.email,
          clinicId,
          request: {
            file,
            documentType: documentType === 'all' ? 'other' : documentType,
            classification: 'standard',
            sensitivityLevel: 'standard',
          },
        });
      }
    } finally {
      setIsUploading(false);
    }
  }, [clinicId, patientId, patient?.email, documentType, uploadMutation]);

  // Handle document download
  const handleDownload = useCallback(async (documentId: string, fileName: string) => {
    try {
      const url = await downloadMutation.mutateAsync(documentId);
      // Create a temporary link to trigger download
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch {
      // Error is handled by the mutation
    }
  }, [downloadMutation]);

  // Handle document deletion
  const handleDelete = useCallback(async (documentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

    await deleteMutation.mutateAsync({ documentId, patientId });
    setSelectedDocuments(prev => prev.filter(id => id !== documentId));
  }, [deleteMutation, patientId]);

  // Handle bulk deletion
  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedDocuments.length} documento(s)?`)) return;

    await deleteMultipleMutation.mutateAsync({ documentIds: selectedDocuments, patientId });
    setSelectedDocuments([]);
  }, [deleteMultipleMutation, selectedDocuments, patientId]);

  if (patientLoading || documentsLoading) {
    return (
      <div className='container mx-auto p-4 md:p-6 space-y-6'>
        <div className='animate-pulse space-y-6'>
          <div className='h-8 bg-muted rounded w-1/3'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-48 bg-muted rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <Card className='max-w-lg mx-auto text-center'>
          <CardHeader>
            <AlertCircle className='w-12 h-12 text-destructive mx-auto mb-4' />
            <CardTitle>Paciente Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      {/* Breadcrumb Navigation */}
      <nav aria-label='Breadcrumb'>
        <ol className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <li>
            <Link to='/patients' className='hover:text-foreground transition-colors'>
              Pacientes
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              to='/patients/$patientId'
              params={{ patientId }}
              className='hover:text-foreground transition-colors'
            >
              {patient.fullName}
            </Link>
          </li>
          <li>/</li>
          <li className='text-foreground font-medium' aria-current='page'>
            Documentos
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2'>
            <FileText className='w-6 h-6' />
            Documentos do Paciente
          </h1>
          <p className='text-muted-foreground'>
            Gerencie documentos médicos de {patient.fullName} com segurança LGPD
          </p>
        </div>

        {/* Upload button */}
        <div className='flex items-center gap-2'>
          <input
            type='file'
            multiple
            accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
            onChange={e => handleFileUpload(e.target.files)}
            className='hidden'
            id='file-upload'
            disabled={isUploading || !clinicId}
          />
          <Button asChild disabled={isUploading || !clinicId}>
            <label htmlFor='file-upload' className='cursor-pointer'>
              {isUploading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className='w-4 h-4 mr-2' />
                  Enviar Documentos
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      {/* Error state for documents */}
      {documentsError && (
        <Card className='border-destructive bg-destructive/10'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='w-5 h-5' />
              <span>Erro ao carregar documentos: {(documentsError as Error).message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Buscar documentos...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Document Type Filter */}
        <select
          value={documentType}
          onChange={e =>
            navigate({
              to: '/patients/$patientId/documents',
              params: { patientId },
              search: { documentType: e.target.value as typeof documentType, sortBy, sortOrder },
            })}
          className='w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        >
          <option value='all'>Todos os tipos</option>
          <option value='medical'>Médicos</option>
          <option value='exam'>Exames</option>
          <option value='consent'>Consentimentos</option>
          <option value='insurance'>Convênios</option>
          <option value='photo'>Fotos</option>
          <option value='prescription'>Receitas</option>
          <option value='report'>Laudos</option>
          <option value='other'>Outros</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={e => {
            const [newSortBy, newSortOrder] = e.target.value.split('-') as [
              typeof sortBy,
              typeof sortOrder,
            ];
            navigate({
              to: '/patients/$patientId/documents',
              params: { patientId },
              search: { documentType, sortBy: newSortBy, sortOrder: newSortOrder },
            });
          }}
          className='w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        >
          <option value='created_at-desc'>Mais recentes</option>
          <option value='created_at-asc'>Mais antigos</option>
          <option value='document_type-asc'>Tipo A-Z</option>
          <option value='document_type-desc'>Tipo Z-A</option>
          <option value='status-asc'>Status A-Z</option>
          <option value='status-desc'>Status Z-A</option>
        </select>

        {/* Results count */}
        <div className='flex items-center justify-center px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground'>
          {filteredDocuments.length} documento(s)
        </div>
      </div>

      {/* Documents Grid */}
      <div className='space-y-6'>
        {filteredDocuments.length > 0
          ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredDocuments.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  isSelected={selectedDocuments.includes(document.id)}
                  onSelect={selected => {
                    if (selected) {
                      setSelectedDocuments(prev => [...prev, document.id]);
                    } else {
                      setSelectedDocuments(prev => prev.filter(id => id !== document.id));
                    }
                  }}
                  onDownload={() => handleDownload(document.id, document.upload?.file_name || 'documento')}
                  onDelete={() => handleDelete(document.id)}
                  isDeleting={deleteMutation.isLoading}
                />
              ))}
            </div>
          )
          : (
            <Card>
              <CardContent className='p-8 text-center'>
                <FolderOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Nenhum documento encontrado</h3>
                <p className='text-muted-foreground mb-4'>
                  {searchQuery
                    ? 'Não há documentos que correspondam aos filtros aplicados.'
                    : 'Este paciente ainda não possui documentos anexados.'}
                </p>
                <Button variant='outline' onClick={() => setSearchQuery('')}>
                  {searchQuery ? 'Limpar filtros' : 'Enviar primeiro documento'}
                </Button>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {selectedDocuments.length} documento(s) selecionado(s)
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm'>
                  <Download className='w-4 h-4 mr-2' />
                  Baixar
                </Button>
                <Button variant='outline' size='sm'>
                  <Share2 className='w-4 h-4 mr-2' />
                  Compartilhar
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={handleBulkDelete}
                  disabled={deleteMultipleMutation.isLoading}
                >
                  {deleteMultipleMutation.isLoading ? (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  ) : (
                    <Trash2 className='w-4 h-4 mr-2' />
                  )}
                  Excluir
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedDocuments([])}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LGPD Compliance Information */}
      <Card className='border-dashed bg-muted/30'>
        <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
            <Shield className='w-5 h-5 text-blue-600 mt-0.5' />
            <div className='space-y-1'>
              <h4 className='text-sm font-medium'>Proteção de Dados - LGPD</h4>
              <p className='text-xs text-muted-foreground'>
                Todos os documentos são criptografados e armazenados com segurança. O acesso é
                auditado e registrado. Pacientes têm direito ao acesso, correção e exclusão de seus
                documentos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Document Card Component
 */
function DocumentCard({
  document,
  isSelected,
  onSelect,
  onDownload,
  onDelete,
  isDeleting,
}: {
  document: PatientDocument;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onDownload: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  const getDocTypeBadge = (docType: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      medical: { label: 'Médico', variant: 'default' },
      exam: { label: 'Exame', variant: 'secondary' },
      consent: { label: 'Consentimento', variant: 'outline' },
      insurance: { label: 'Convênio', variant: 'outline' },
      photo: { label: 'Foto', variant: 'secondary' },
      prescription: { label: 'Receita', variant: 'default' },
      report: { label: 'Laudo', variant: 'default' },
      other: { label: 'Outro', variant: 'outline' },
    };

    return typeMap[docType] || { label: docType, variant: 'outline' as const };
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const fileType = document.upload?.file_type || (document.metadata as any)?.file_type || 'unknown';
  const fileSize = document.upload?.file_size_bytes || (document.metadata as any)?.file_size || 0;
  const fileName = document.upload?.file_name || (document.metadata as any)?.original_filename || 'Documento';

  const FileIcon = getFileIcon(fileType);
  const docTypeInfo = getDocTypeBadge(document.document_type);
  const isConfidential = document.sensitivity_level === 'confidential' || document.sensitivity_level === 'restricted';

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''
        }`}
    >
      <CardContent className='p-4'>
        <div className='space-y-3'>
          {/* Header with checkbox and icon */}
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <input
                type='checkbox'
                checked={isSelected}
                onChange={e => onSelect(e.target.checked)}
                className='rounded'
                onClick={e => e.stopPropagation()}
              />
              <div className='flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg'>
                <FileIcon className='w-5 h-5 text-primary' />
              </div>
            </div>

            <div className='flex items-center gap-1'>
              {isConfidential && (
                <Lock className='w-4 h-4 text-blue-600' aria-label='Documento protegido' />
              )}
              <Button variant='ghost' size='sm'>
                <MoreVertical className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {/* File info */}
          <div className='space-y-2'>
            <div className='space-y-1'>
              <h3 className='font-medium text-sm leading-tight line-clamp-2'>
                {fileName}
              </h3>
              {document.notes && (
                <p className='text-xs text-muted-foreground line-clamp-2'>
                  {document.notes}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>{formatFileSize(fileSize)}</span>
              <Badge variant={docTypeInfo.variant}>
                {docTypeInfo.label}
              </Badge>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {document.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant='outline' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
                {document.tags.length > 3 && (
                  <Badge variant='outline' className='text-xs'>
                    +{document.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Upload info */}
            <div className='flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t'>
              <div className='flex items-center gap-1'>
                <User className='w-3 h-3' />
                <span>{document.uploaded_by_name || 'Usuário'}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                <span>{format(new Date(document.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-1 pt-2'>
            <Button variant='outline' size='sm' className='flex-1'>
              <Eye className='w-3 h-3 mr-1' />
              Ver
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex-1'
              onClick={e => {
                e.stopPropagation();
                onDownload();
              }}
            >
              <Download className='w-3 h-3 mr-1' />
              Baixar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
