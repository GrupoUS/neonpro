"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Calendar,
  User,
  Stethoscope,
  FileImage,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  History,
  Signature,
  Camera,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
interface MedicalRecord {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  recordType: MedicalRecordType;
  title: string;
  description?: string;
  content: Record<string, any>;
  status: MedicalRecordStatus;
  priority: number;
  isConfidential: boolean;
  isEmergency: boolean;
  appointmentId?: string;
  parentRecordId?: string;
  version: number;
  tags: string[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  signedBy?: string;
}

interface MedicalHistory {
  id: string;
  patientId: string;
  clinicId: string;
  category: string;
  subcategory?: string;
  conditionName: string;
  description?: string;
  severity?: string;
  status: string;
  onsetDate?: Date;
  resolutionDate?: Date;
  isChronic: boolean;
  isHereditary: boolean;
  notes?: string;
  relatedRecords: string[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MedicalAttachment {
  id: string;
  recordId?: string;
  patientId: string;
  clinicId: string;
  category: AttachmentCategory;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;
  thumbnailPath?: string;
  description?: string;
  isSensitive: boolean;
  accessLevel: AccessLevel;
  metadata: Record<string, any>;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type MedicalRecordType = 
  | 'consultation'
  | 'diagnosis'
  | 'treatment'
  | 'prescription'
  | 'lab_result'
  | 'imaging'
  | 'surgery'
  | 'vaccination'
  | 'allergy'
  | 'vital_signs'
  | 'progress_note'
  | 'discharge_summary'
  | 'referral'
  | 'emergency'
  | 'follow_up';

type MedicalRecordStatus = 
  | 'draft'
  | 'pending_review'
  | 'reviewed'
  | 'approved'
  | 'signed'
  | 'archived'
  | 'cancelled';

type AttachmentCategory = 
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'scan'
  | 'report'
  | 'form'
  | 'certificate';

type AccessLevel = 
  | 'public'
  | 'internal'
  | 'restricted'
  | 'confidential'
  | 'top_secret';

interface MedicalRecordsFormProps {
  patientId: string;
  clinicId: string;
  initialRecord?: Partial<MedicalRecord>;
  onSave?: (record: MedicalRecord) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
}

const RECORD_TYPES: { value: MedicalRecordType; label: string; icon: React.ReactNode }[] = [
  { value: 'consultation', label: 'Consulta', icon: <Stethoscope className="w-4 h-4" /> },
  { value: 'diagnosis', label: 'Diagnóstico', icon: <FileText className="w-4 h-4" /> },
  { value: 'treatment', label: 'Tratamento', icon: <Plus className="w-4 h-4" /> },
  { value: 'prescription', label: 'Prescrição', icon: <FileText className="w-4 h-4" /> },
  { value: 'lab_result', label: 'Resultado de Exame', icon: <FileText className="w-4 h-4" /> },
  { value: 'imaging', label: 'Imagem', icon: <FileImage className="w-4 h-4" /> },
  { value: 'surgery', label: 'Cirurgia', icon: <Plus className="w-4 h-4" /> },
  { value: 'vaccination', label: 'Vacinação', icon: <Shield className="w-4 h-4" /> },
  { value: 'allergy', label: 'Alergia', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'vital_signs', label: 'Sinais Vitais', icon: <Stethoscope className="w-4 h-4" /> },
  { value: 'progress_note', label: 'Nota de Progresso', icon: <FileText className="w-4 h-4" /> },
  { value: 'discharge_summary', label: 'Resumo de Alta', icon: <FileText className="w-4 h-4" /> },
  { value: 'referral', label: 'Encaminhamento', icon: <FileText className="w-4 h-4" /> },
  { value: 'emergency', label: 'Emergência', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'follow_up', label: 'Acompanhamento', icon: <Clock className="w-4 h-4" /> }
];

const STATUS_OPTIONS: { value: MedicalRecordStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending_review', label: 'Aguardando Revisão', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'reviewed', label: 'Revisado', color: 'bg-blue-100 text-blue-800' },
  { value: 'approved', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  { value: 'signed', label: 'Assinado', color: 'bg-purple-100 text-purple-800' },
  { value: 'archived', label: 'Arquivado', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 2, label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 3, label: 'Alta', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Urgente', color: 'bg-orange-100 text-orange-800' },
  { value: 5, label: 'Crítica', color: 'bg-red-100 text-red-800' }
];

export function MedicalRecordsForm({
  patientId,
  clinicId,
  initialRecord,
  onSave,
  onCancel,
  mode = 'create'
}: MedicalRecordsFormProps) {
  const [record, setRecord] = useState<Partial<MedicalRecord>>({
    clinicId,
    patientId,
    recordType: 'consultation',
    title: '',
    description: '',
    content: {},
    status: 'draft',
    priority: 2,
    isConfidential: false,
    isEmergency: false,
    version: 1,
    tags: [],
    metadata: {},
    ...initialRecord
  });

  const [attachments, setAttachments] = useState<MedicalAttachment[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadProgress, setUploadProgress] = useState(0);

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!record.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!record.recordType) {
      newErrors.recordType = 'Tipo de registro é obrigatório';
    }

    if (record.priority && (record.priority < 1 || record.priority > 5)) {
      newErrors.priority = 'Prioridade deve estar entre 1 e 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const recordData: MedicalRecord = {
        id: record.id || crypto.randomUUID(),
        clinicId: record.clinicId!,
        patientId: record.patientId!,
        doctorId: record.doctorId,
        recordType: record.recordType!,
        title: record.title!,
        description: record.description,
        content: record.content || {},
        status: record.status!,
        priority: record.priority || 2,
        isConfidential: record.isConfidential || false,
        isEmergency: record.isEmergency || false,
        appointmentId: record.appointmentId,
        parentRecordId: record.parentRecordId,
        version: record.version || 1,
        tags: record.tags || [],
        metadata: record.metadata || {},
        createdBy: record.createdBy || 'current-user',
        createdAt: record.createdAt || new Date(),
        updatedAt: new Date(),
        signedAt: record.signedAt,
        signedBy: record.signedBy
      };

      onSave?.(recordData);
    } catch (error) {
      console.error('Erro ao salvar registro médico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (newTag.trim() && !record.tags?.includes(newTag.trim())) {
      setRecord(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setRecord(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    setUploadProgress(0);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const attachment: MedicalAttachment = {
        id: crypto.randomUUID(),
        recordId: record.id,
        patientId: record.patientId!,
        clinicId: record.clinicId!,
        category: 'document',
        fileName: `${Date.now()}_${file.name}`,
        originalName: file.name,
        filePath: `/uploads/medical/${record.patientId}/${Date.now()}_${file.name}`,
        fileSize: file.size,
        mimeType: file.type,
        description: '',
        isSensitive: false,
        accessLevel: 'internal',
        metadata: {},
        uploadedBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setAttachments(prev => [...prev, attachment]);
    }
    
    setUploadProgress(0);
  };

  const getStatusBadge = (status: MedicalRecordStatus) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return (
      <Badge className={statusOption?.color}>
        {statusOption?.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    const priorityOption = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return (
      <Badge className={priorityOption?.color}>
        {priorityOption?.label}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Novo Registro Médico' : 
             mode === 'edit' ? 'Editar Registro Médico' : 'Visualizar Registro Médico'}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === 'create' ? 'Criar um novo registro médico para o paciente' :
             mode === 'edit' ? 'Editar informações do registro médico' :
             'Visualizar detalhes do registro médico'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {record.status && getStatusBadge(record.status)}
          {record.priority && getPriorityBadge(record.priority)}
          {record.isEmergency && (
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Emergência
            </Badge>
          )}
          {record.isConfidential && (
            <Badge className="bg-purple-100 text-purple-800">
              <Shield className="w-3 h-3 mr-1" />
              Confidencial
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
            <TabsTrigger value="metadata">Metadados</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </CardTitle>
                <CardDescription>
                  Informações principais do registro médico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recordType">Tipo de Registro *</Label>
                    <Select
                      value={record.recordType}
                      onValueChange={(value: MedicalRecordType) => 
                        setRecord(prev => ({ ...prev, recordType: value }))
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECORD_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.recordType && (
                      <p className="text-sm text-red-600">{errors.recordType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={record.status}
                      onValueChange={(value: MedicalRecordStatus) => 
                        setRecord(prev => ({ ...prev, status: value }))
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={record.title || ''}
                    onChange={(e) => setRecord(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título do registro"
                    disabled={isReadOnly}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={record.description || ''}
                    onChange={(e) => setRecord(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Digite uma descrição detalhada"
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={record.priority?.toString()}
                      onValueChange={(value) => 
                        setRecord(prev => ({ ...prev, priority: parseInt(value) }))
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(priority => (
                          <SelectItem key={priority.value} value={priority.value.toString()}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="isConfidential"
                      checked={record.isConfidential}
                      onCheckedChange={(checked) => 
                        setRecord(prev => ({ ...prev, isConfidential: !!checked }))
                      }
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="isConfidential" className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Confidencial</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="isEmergency"
                      checked={record.isEmergency}
                      onCheckedChange={(checked) => 
                        setRecord(prev => ({ ...prev, isEmergency: !!checked }))
                      }
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="isEmergency" className="flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Emergência</span>
                    </Label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {record.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {!isReadOnly && (
                    <div className="flex space-x-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nova tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Conteúdo do Registro</span>
                </CardTitle>
                <CardDescription>
                  Conteúdo detalhado e estruturado do registro médico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(record.content, null, 2)}
                  onChange={(e) => {
                    try {
                      const content = JSON.parse(e.target.value);
                      setRecord(prev => ({ ...prev, content }));
                    } catch {
                      // Invalid JSON, keep as string for now
                    }
                  }}
                  placeholder="Conteúdo em formato JSON"
                  rows={15}
                  className="font-mono text-sm"
                  disabled={isReadOnly}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Paperclip className="w-5 h-5" />
                  <span>Anexos</span>
                </CardTitle>
                <CardDescription>
                  Documentos, imagens e outros arquivos relacionados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isReadOnly && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Clique para fazer upload ou arraste arquivos aqui
                      </p>
                    </label>
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-gray-600 mt-1">
                          Upload em progresso: {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{attachment.originalName}</p>
                          <p className="text-sm text-gray-600">
                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB • {attachment.mimeType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {!isReadOnly && (
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Metadados e Auditoria</span>
                </CardTitle>
                <CardDescription>
                  Informações de auditoria e metadados do registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Versão</Label>
                    <Input value={record.version || 1} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Criado em</Label>
                    <Input 
                      value={record.createdAt ? format(record.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''} 
                      disabled 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Atualizado em</Label>
                    <Input 
                      value={record.updatedAt ? format(record.updatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''} 
                      disabled 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assinado em</Label>
                    <Input 
                      value={record.signedAt ? format(record.signedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Não assinado'} 
                      disabled 
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Metadados (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(record.metadata, null, 2)}
                    onChange={(e) => {
                      try {
                        const metadata = JSON.parse(e.target.value);
                        setRecord(prev => ({ ...prev, metadata }));
                      } catch {
                        // Invalid JSON, keep as string for now
                      }
                    }}
                    placeholder="Metadados em formato JSON"
                    rows={8}
                    className="font-mono text-sm"
                    disabled={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!isReadOnly && (
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Salvando...' : 'Salvar Registro'}</span>
            </Button>
          </div>
        )}
      </form>

      {record.signedAt && (
        <Alert>
          <Signature className="w-4 h-4" />
          <AlertDescription>
            Este registro foi assinado digitalmente em {format(record.signedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })} 
            {record.signedBy && ` por ${record.signedBy}`}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
