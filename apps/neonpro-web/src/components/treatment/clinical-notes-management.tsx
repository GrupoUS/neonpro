/**
 * Clinical Notes Management Component
 * FHIR R4 compliant component for clinical documentation and notes
 * Follows Brazilian healthcare standards and LGPD compliance
 * 
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  User,
  Clock,
  Edit,
  Trash,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

import { 
  ClinicalNote, 
  ClinicalNoteSearchFilters,
  CreateClinicalNoteData,
  createClinicalNoteSchema
} from '@/lib/types/treatment';
import { Patient } from '@/lib/types/fhir';
import { 
  searchClinicalNotes, 
  createClinicalNote, 
  updateClinicalNote, 
  deleteClinicalNote 
} from '@/lib/supabase/treatments';
import { searchPatients } from '@/lib/supabase/patients';

interface ClinicalNotesManagementProps {
  treatmentPlanId?: string;
  patientId?: string;
  onSelectNote?: (note: ClinicalNote) => void;
}

const noteTypes = [
  { value: 'progress', label: 'Evolução', color: 'bg-blue-100 text-blue-800' },
  { value: 'assessment', label: 'Avaliação', color: 'bg-green-100 text-green-800' },
  { value: 'plan', label: 'Plano', color: 'bg-purple-100 text-purple-800' },
  { value: 'consultation', label: 'Consulta', color: 'bg-orange-100 text-orange-800' },
  { value: 'procedure', label: 'Procedimento', color: 'bg-pink-100 text-pink-800' },
  { value: 'follow-up', label: 'Acompanhamento', color: 'bg-teal-100 text-teal-800' },
  { value: 'adverse-event', label: 'Evento Adverso', color: 'bg-red-100 text-red-800' },
  { value: 'education', label: 'Orientação', color: 'bg-yellow-100 text-yellow-800' },
];

const commonTemplates = [
  {
    title: 'Evolução pós-procedimento',
    content: 'Paciente retorna para avaliação pós-procedimento. Apresenta:\n- Estado geral:\n- Área tratada:\n- Sintomas/reações:\n- Orientações fornecidas:\n- Próximos passos:'
  },
  {
    title: 'Avaliação inicial',
    content: 'Primeira consulta para avaliação estética:\n- Queixa principal:\n- Histórico:\n- Exame físico:\n- Hipótese diagnóstica:\n- Plano proposto:'
  },
  {
    title: 'Consulta de retorno',
    content: 'Retorno para acompanhamento:\n- Evolução desde último atendimento:\n- Satisfação com resultados:\n- Necessidade de ajustes:\n- Planejamento futuro:'
  },
];

export function ClinicalNotesManagement({ 
  treatmentPlanId, 
  patientId, 
  onSelectNote 
}: ClinicalNotesManagementProps) {
  const { toast } = useToast();
  
  // State management
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<ClinicalNoteSearchFilters>({
    treatment_plan_id: treatmentPlanId,
    patient_id: patientId,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);

  const perPage = 10;

  // Form setup
  const form = useForm<CreateClinicalNoteData>({
    resolver: zodResolver(createClinicalNoteSchema),
    defaultValues: {
      treatment_plan_id: treatmentPlanId || '',
      patient_id: patientId || '',
      title: '',
      content: '',
      note_type: 'progress',
      created_date: new Date().toISOString().split('T')[0],
      author_id: '',
      tags: [],
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadPatients();
  }, []);

  // Reload notes when filters change
  useEffect(() => {
    loadClinicalNotes();
  }, [filters, currentPage, searchText]);

  const loadData = async () => {
    await loadClinicalNotes();
  };

  const loadClinicalNotes = async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        search_text: searchText || undefined,
      };
      
      const response = await searchClinicalNotes(searchFilters, currentPage, perPage);
      setNotes(response.clinical_notes);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error('Erro ao carregar notas clínicas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as notas clínicas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await searchPatients({}, 1, 100);
      setPatients(response.patients);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ClinicalNoteSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const openCreateDialog = () => {
    setEditingNote(null);
    form.reset({
      treatment_plan_id: treatmentPlanId || '',
      patient_id: patientId || '',
      title: '',
      content: '',
      note_type: 'progress',
      created_date: new Date().toISOString().split('T')[0],
      author_id: '',
      tags: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (note: ClinicalNote) => {
    setEditingNote(note);
    form.reset({
      treatment_plan_id: note.treatment_plan_id,
      patient_id: note.patient_id,
      title: note.title,
      content: note.content,
      note_type: note.note_type,
      created_date: note.created_date,
      author_id: note.author_id || '',
      tags: note.tags || [],
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CreateClinicalNoteData) => {
    try {
      if (editingNote) {
        await updateClinicalNote(editingNote.id, data);
        toast({
          title: 'Sucesso',
          description: 'Nota clínica atualizada com sucesso.',
        });
      } else {
        await createClinicalNote(data);
        toast({
          title: 'Sucesso',
          description: 'Nota clínica criada com sucesso.',
        });
      }

      setIsDialogOpen(false);
      loadClinicalNotes();
    } catch (error) {
      console.error('Erro ao salvar nota clínica:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a nota clínica.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (note: ClinicalNote) => {
    try {
      await deleteClinicalNote(note.id);
      toast({
        title: 'Sucesso',
        description: 'Nota clínica excluída com sucesso.',
      });
      loadClinicalNotes();
    } catch (error) {
      console.error('Erro ao excluir nota clínica:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a nota clínica.',
        variant: 'destructive',
      });
    }
  };

  const applyTemplate = (template: { title: string; content: string }) => {
    form.setValue('title', template.title);
    form.setValue('content', template.content);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getNoteType = (type: string) => {
    return noteTypes.find(nt => nt.value === type);
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas Clínicas</h1>
          <p className="text-muted-foreground">
            Documentação clínica seguindo padrões HL7 FHIR R4
          </p>
        </div>
        
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar notas clínicas..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          {!patientId && (
            <Select
              value={filters.patient_id || 'all'}
              onValueChange={(value) => 
                handleFilterChange('patient_id', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os pacientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pacientes</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.given_name?.[0]} {patient.family_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.note_type || 'all'}
            onValueChange={(value) => 
              handleFilterChange('note_type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {noteTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>      {/* Clinical Notes Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma nota encontrada</h3>
              <p className="text-muted-foreground">
                Comece criando uma nova nota clínica.
              </p>
            </div>
          </div>
        ) : (
          notes.map((note) => {
            const noteType = getNoteType(note.note_type);
            return (
              <Card 
                key={note.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectNote?.(note)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        {noteType && (
                          <Badge className={noteType.color}>
                            {noteType.label}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {/* @ts-ignore - patient relation from Supabase */}
                          {note.patient?.given_name?.[0]} {note.patient?.family_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(note.created_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(note.created_at), "HH:mm", { locale: ptBR })}
                        </span>
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectNote?.(note);
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(note);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * perPage) + 1} a {Math.min(currentPage * perPage, totalCount)} de {totalCount} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="text-sm">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Clinical Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Editar Nota Clínica' : 'Nova Nota Clínica'}
            </DialogTitle>
            <DialogDescription>
              Documente observações clínicas seguindo padrões HL7 FHIR R4
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Templates Quick Selection */}
              <div className="space-y-3">
                <Label>Modelos de Nota</Label>
                <div className="flex flex-wrap gap-2">
                  {commonTemplates.map((template, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => applyTemplate(template)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {template.title}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Nota *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Evolução pós-procedimento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Nota *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {noteTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Patient Selection */}
              {!patientId && (
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.given_name?.[0]} {patient.family_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Date */}
              <FormField
                control={form.control}
                name="created_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Data da observação clínica
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo da Nota *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva suas observações clínicas..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Inclua observações detalhadas sobre o estado do paciente, evolução, procedimentos realizados, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: botox, preenchimento, pós-operatório (separadas por vírgula)"
                        value={field.value?.join(', ') || ''}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(',')
                            .map(tag => tag.trim())
                            .filter(tag => tag.length > 0);
                          field.onChange(tags);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Tags para facilitar a busca e organização das notas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingNote ? 'Atualizar' : 'Criar'} Nota
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}