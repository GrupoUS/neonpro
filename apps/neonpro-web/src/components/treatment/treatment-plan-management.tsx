/**
 * Treatment Plan Management Dashboard
 * FHIR-compliant treatment plan creation and management interface
 * Includes LGPD compliance and Brazilian healthcare standards
 * 
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, User, FileText, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  TreatmentPlan, 
  TreatmentPlanStatus, 
  TreatmentPlanIntent,
  TreatmentPlanSearchFilters,
  TreatmentStatistics
} from '@/lib/types/treatment';
import { Patient } from '@/lib/types/fhir';
import { 
  searchTreatmentPlans, 
  getTreatmentStatistics,
  deleteTreatmentPlan 
} from '@/lib/supabase/treatments';
import { searchPatients } from '@/lib/supabase/patients';

interface TreatmentPlanManagementProps {
  onSelectTreatmentPlan?: (treatmentPlan: TreatmentPlan) => void;
}

const statusColors: Record<TreatmentPlanStatus, string> = {
  'draft': 'bg-gray-100 text-gray-800',
  'active': 'bg-green-100 text-green-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  'revoked': 'bg-red-100 text-red-800',
  'completed': 'bg-blue-100 text-blue-800',
  'entered-in-error': 'bg-gray-100 text-gray-600',
  'unknown': 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<TreatmentPlanStatus, string> = {
  'draft': 'Rascunho',
  'active': 'Ativo',
  'on-hold': 'Em Pausa',
  'revoked': 'Cancelado',
  'completed': 'Concluído',
  'entered-in-error': 'Erro',
  'unknown': 'Desconhecido',
};

const intentLabels: Record<TreatmentPlanIntent, string> = {
  'proposal': 'Proposta',
  'plan': 'Plano',
  'order': 'Ordem',
  'option': 'Opção',
  'directive': 'Diretiva',
};

export function TreatmentPlanManagement({ onSelectTreatmentPlan }: TreatmentPlanManagementProps) {
  const { toast } = useToast();
  
  // State management
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statistics, setStatistics] = useState<TreatmentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<TreatmentPlanSearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const perPage = 10;

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadPatients();
    loadStatistics();
  }, []);

  // Reload treatment plans when filters change
  useEffect(() => {
    loadTreatmentPlans();
  }, [filters, currentPage, searchText]);

  const loadData = async () => {
    await Promise.all([
      loadTreatmentPlans(),
      loadStatistics(),
    ]);
  };

  const loadTreatmentPlans = async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        search_text: searchText || undefined,
      };
      
      const response = await searchTreatmentPlans(searchFilters, currentPage, perPage);
      setTreatmentPlans(response.treatment_plans);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error('Erro ao carregar planos de tratamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos de tratamento.',
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

  const loadStatistics = async () => {
    try {
      const stats = await getTreatmentStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof TreatmentPlanSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleDeleteTreatmentPlan = async (treatmentPlan: TreatmentPlan) => {
    try {
      await deleteTreatmentPlan(treatmentPlan.id);
      toast({
        title: 'Sucesso',
        description: 'Plano de tratamento excluído com sucesso.',
      });
      loadTreatmentPlans();
      loadStatistics();
    } catch (error) {
      console.error('Erro ao excluir plano de tratamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plano de tratamento.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_treatment_plans}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.active_treatment_plans} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planos Concluídos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.completed_treatment_plans}</div>
              <p className="text-xs text-muted-foreground">
                Finalizados com sucesso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Procedimentos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_procedures}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.procedures_this_month} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.average_treatment_duration_days}</div>
              <p className="text-xs text-muted-foreground">
                dias por tratamento
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planos de Tratamento</h1>
          <p className="text-muted-foreground">
            Gerencie planos de tratamento seguindo padrões HL7 FHIR R4
          </p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar planos de tratamento..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
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

          <Select
            value={filters.status?.[0] || 'all'}
            onValueChange={(value) => 
              handleFilterChange('status', value === 'all' ? undefined : [value as TreatmentPlanStatus])
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Treatment Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Tratamento</CardTitle>
          <CardDescription>
            Lista de todos os planos de tratamento criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : treatmentPlans.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum plano encontrado</h3>
                <p className="text-muted-foreground">
                  Comece criando um novo plano de tratamento.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Intenção</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatmentPlans.map((treatmentPlan) => (
                  <TableRow 
                    key={treatmentPlan.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectTreatmentPlan?.(treatmentPlan)}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {/* @ts-ignore - patient relation from Supabase */}
                        {treatmentPlan.patient?.given_name?.[0]} {treatmentPlan.patient?.family_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate font-medium">
                        {treatmentPlan.title}
                      </div>
                      {treatmentPlan.description && (
                        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {treatmentPlan.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[treatmentPlan.status]}>
                        {statusLabels[treatmentPlan.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {intentLabels[treatmentPlan.intent]}
                    </TableCell>
                    <TableCell>
                      {treatmentPlan.period_start && treatmentPlan.period_end ? (
                        <div className="text-sm">
                          <div>{formatDate(treatmentPlan.period_start)}</div>
                          <div className="text-muted-foreground">
                            até {formatDate(treatmentPlan.period_end)}
                          </div>
                        </div>
                      ) : treatmentPlan.period_start ? (
                        <div className="text-sm">
                          Início: {formatDate(treatmentPlan.period_start)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(treatmentPlan.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTreatmentPlan?.(treatmentPlan);
                            }}
                          >
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit functionality would go here
                            }}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTreatmentPlan(treatmentPlan);
                            }}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
