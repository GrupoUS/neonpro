/**
 * Patient Documents Route - File Management with LGPD Compliance
 * Features: Upload, organize, preview, secure sharing, audit trail
 */

import { useAuth } from '@/hooks/useAuth';
import { usePatient } from '@/hooks/usePatients';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Separator } from '@neonpro/ui';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { z } from 'zod';
import {
  ArrowLeft,
  Upload,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Share2,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Lock,
  AlertCircle,
  FolderOpen,
  Plus,
  MoreVertical,
  Shield,
  Clock,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// Type-safe params schema
const patientParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Search params for filtering documents
const documentsSearchSchema = z.object({
  category: z.enum(['all', 'medical', 'insurance', 'consent', 'exams', 'photos']).optional().default('all'),
  sortBy: z.enum(['name', 'date', 'size', 'type']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Document interface
interface PatientDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  category: 'medical' | 'insurance' | 'consent' | 'exams' | 'photos';
  uploadedAt: string;
  uploadedBy: string;
  isSecure: boolean;
  url?: string;
  preview?: string;
  description?: string;
  tags?: string[];
}

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
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded w-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Error boundary
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Erro ao Carregar Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Não foi possível carregar os documentos do paciente.
          </p>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              Tentar Novamente
            </Button>
            <Button asChild>
              <Link to="/patients">Voltar</Link>
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
  const { category, sortBy, sortOrder } = Route.useSearch();
  const navigate = useNavigate();

  // Data fetching
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Mock documents data (replace with real data)
  const mockDocuments: PatientDocument[] = [
    {
      id: '1',
      name: 'Exame de Sangue - Janeiro 2024.pdf',
      type: 'application/pdf',
      size: 1234567,
      category: 'exams',
      uploadedAt: '2024-01-15T10:30:00Z',
      uploadedBy: 'Dr. Carlos Silva',
      isSecure: true,
      description: 'Hemograma completo e bioquímica',
      tags: ['laboratório', 'rotina'],
    },
    {
      id: '2',
      name: 'Termo de Consentimento - Botox.pdf',
      type: 'application/pdf',
      size: 456789,
      category: 'consent',
      uploadedAt: '2024-01-10T14:20:00Z',
      uploadedBy: 'Dra. Ana Santos',
      isSecure: true,
      description: 'Consentimento informado para aplicação de toxina botulínica',
      tags: ['botox', 'estético', 'consentimento'],
    },
    {
      id: '3',
      name: 'Foto Antes - Tratamento Facial.jpg',
      type: 'image/jpeg',
      size: 2345678,
      category: 'photos',
      uploadedAt: '2024-01-08T16:45:00Z',
      uploadedBy: 'Dra. Ana Santos',
      isSecure: true,
      preview: '/api/documents/3/preview',
      description: 'Foto antes do procedimento estético',
      tags: ['antes', 'facial', 'estético'],
    },
    {
      id: '4',
      name: 'Carteirinha do Plano de Saúde.pdf',
      type: 'application/pdf',
      size: 123456,
      category: 'insurance',
      uploadedAt: '2024-01-05T09:15:00Z',
      uploadedBy: 'Recepção',
      isSecure: false,
      description: 'Documento do plano de saúde',
      tags: ['plano', 'saúde'],
    },
  ];

  // File upload handler
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const fileId = Math.random().toString(36).substr(2, 9);
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = (prev[fileId] || 0) + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(prev => {
                const { [fileId]: _, ...rest } = prev;
                return rest;
              });
              toast.success(`${file.name} enviado com sucesso!`);
            }, 500);
            return { ...prev, [fileId]: 100 };
          }
          return { ...prev, [fileId]: newProgress };
        });
      }, 200);
    });
  }, []);

  // Filter documents based on search and category
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = category === 'all' || doc.category === category;
    
    return matchesSearch && matchesCategory;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  if (patientLoading) {
    return <Route.pendingComponent />;
  }

  if (!patient) {
    return <Route.errorComponent error={new Error('Paciente não encontrado')} reset={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link to="/patients" className="hover:text-foreground transition-colors">
              Pacientes
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link 
              to="/patients/$patientId" 
              params={{ patientId }}
              className="hover:text-foreground transition-colors"
            >
              {patient.fullName}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium" aria-current="page">
            Documentos
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Documentos do Paciente
          </h1>
          <p className="text-muted-foreground">
            Gerencie documentos médicos de {patient.fullName} com segurança LGPD
          </p>
        </div>

        {/* Upload button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Enviar Documentos
            </label>
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Enviando Arquivos...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Upload {fileId}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => navigate({
            to: '/patients/$patientId/documents',
            params: { patientId },
            search: { category: e.target.value as typeof category, sortBy, sortOrder },
          })}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <option value="all">Todas as categorias</option>
          <option value="medical">Médicos</option>
          <option value="exams">Exames</option>
          <option value="consent">Termos de Consentimento</option>
          <option value="insurance">Convênios</option>
          <option value="photos">Fotos</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
            navigate({
              to: '/patients/$patientId/documents',
              params: { patientId },
              search: { category, sortBy: newSortBy, sortOrder: newSortOrder },
            });
          }}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <option value="date-desc">Mais recentes</option>
          <option value="date-asc">Mais antigos</option>
          <option value="name-asc">Nome A-Z</option>
          <option value="name-desc">Nome Z-A</option>
          <option value="size-desc">Maior tamanho</option>
          <option value="size-asc">Menor tamanho</option>
        </select>

        {/* Results count */}
        <div className="flex items-center justify-center px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
          {sortedDocuments.length} documento(s)
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-6">
        {sortedDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDocuments.map((document) => (
              <DocumentCard 
                key={document.id} 
                document={document}
                isSelected={selectedDocuments.includes(document.id)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedDocuments(prev => [...prev, document.id]);
                  } else {
                    setSelectedDocuments(prev => prev.filter(id => id !== document.id));
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 
                  'Não há documentos que correspondam aos filtros aplicados.' :
                  'Este paciente ainda não possui documentos anexados.'
                }
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                {searchQuery ? 'Limpar filtros' : 'Enviar primeiro documento'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedDocuments.length} documento(s) selecionado(s)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
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
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Proteção de Dados - LGPD</h4>
              <p className="text-xs text-muted-foreground">
                Todos os documentos são criptografados e armazenados com segurança. 
                O acesso é auditado e registrado. Pacientes têm direito ao acesso, 
                correção e exclusão de seus documentos.
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
  onSelect 
}: { 
  document: PatientDocument;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      medical: { label: 'Médico', variant: 'default' as const },
      exams: { label: 'Exame', variant: 'secondary' as const },
      consent: { label: 'Consentimento', variant: 'outline' as const },
      insurance: { label: 'Convênio', variant: 'outline' as const },
      photos: { label: 'Foto', variant: 'secondary' as const },
    };
    
    return categoryMap[category as keyof typeof categoryMap] || { label: category, variant: 'outline' as const };
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const FileIcon = getFileIcon(document.type);
  const categoryInfo = getCategoryBadge(document.category);

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with checkbox and icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(e.target.checked)}
                className="rounded"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <FileIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {document.isSecure && (
                <Lock className="w-4 h-4 text-blue-600" title="Documento protegido" />
              )}
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* File info */}
          <div className="space-y-2">
            <div className="space-y-1">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {document.name}
              </h3>
              {document.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {document.description}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(document.size)}</span>
              <Badge variant={categoryInfo.variant}>
                {categoryInfo.label}
              </Badge>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {document.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{document.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Upload info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{document.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(document.uploadedAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              Baixar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}