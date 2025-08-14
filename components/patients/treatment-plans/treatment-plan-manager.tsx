'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Target,
  Activity,
  Users,
  Clipboard,
  Timer,
  TrendingUp,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Treatment Plan Types based on FHIR R4 and existing schema
interface TreatmentPlan {
  id: string;
  patient_id: string;
  plan_name: string;
  plan_type: 'orthodontics' | 'implants' | 'periodontics' | 'endodontics' | 'oral_surgery' | 'general' | 'cosmetic';
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'revised';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  estimated_end_date: string;
  actual_end_date?: string;
  total_sessions: number;
  completed_sessions: number;
  estimated_cost: number;
  actual_cost?: number;
  description: string;
  objectives: string[];
  contraindications?: string[];
  prerequisites?: string[];
  success_criteria: string[];
  protocols: TreatmentProtocol[];
  assigned_professionals: ProfessionalAssignment[];
  progress_notes: ProgressNote[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  lgpd_consent: boolean;
  data_retention_date: string;
}

interface TreatmentProtocol {
  id: string;
  treatment_plan_id: string;
  protocol_name: string;
  protocol_type: 'standard' | 'custom' | 'emergency';
  category: string;
  sequence_order: number;
  estimated_duration: number; // in minutes
  required_materials: Material[];
  required_equipment: Equipment[];
  steps: ProtocolStep[];
  precautions: string[];
  post_care_instructions: string[];
  follow_up_requirements: FollowUpRequirement[];
  quality_metrics: QualityMetric[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  scheduled_date?: string;
  completed_date?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lgpd_consent: boolean;
}

interface ProtocolStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  estimated_time: number; // in minutes
  required_skills: string[];
  safety_notes?: string[];
  verification_points: string[];
  completion_criteria: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string;
  completed_by?: string;
  notes?: string;
}

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit?: number;
  supplier?: string;
  expiry_date?: string;
  batch_number?: string;
  required: boolean;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  calibration_date?: string;
  maintenance_due?: string;
  operator_certification_required: boolean;
  safety_protocols: string[];
}

interface ProfessionalAssignment {
  id: string;
  professional_id: string;
  professional_name: string;
  role: 'primary_dentist' | 'assistant' | 'hygienist' | 'specialist' | 'anesthesiologist';
  specialization?: string;
  license_number: string;
  assignment_date: string;
  responsibilities: string[];
  availability_schedule: AvailabilitySlot[];
}

interface AvailabilitySlot {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  location: string;
}

interface ProgressNote {
  id: string;
  treatment_plan_id: string;
  protocol_id?: string;
  note_type: 'progress' | 'complication' | 'modification' | 'completion';
  title: string;
  content: string;
  attachments?: Attachment[];
  created_at: string;
  created_by: string;
  professional_signature?: string;
  patient_acknowledgment?: boolean;
  lgpd_consent: boolean;
}

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  description?: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface FollowUpRequirement {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  assigned_to: string;
  status: 'pending' | 'completed' | 'overdue';
  completion_notes?: string;
}

interface QualityMetric {
  id: string;
  metric_name: string;
  target_value: number;
  actual_value?: number;
  unit: string;
  measurement_date?: string;
  measured_by?: string;
  notes?: string;
}

interface TreatmentPlanManagerProps {
  patientId: string;
  readOnly?: boolean;
  onPlanUpdate?: () => void;
}

export default function TreatmentPlanManager({ 
  patientId, 
  readOnly = false, 
  onPlanUpdate 
}: TreatmentPlanManagerProps) {
  // State management
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Dialog states
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showProtocolDialog, setShowProtocolDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [editingProtocol, setEditingProtocol] = useState<TreatmentProtocol | null>(null);

  useEffect(() => {
    loadTreatmentPlans();
  }, [patientId]);

  const loadTreatmentPlans = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Supabase queries
      // const { data: plansData } = await supabase
      //   .from('treatment_plans')
      //   .select(`
      //     *,
      //     protocols:treatment_protocols(*),
      //     assignments:professional_assignments(*),
      //     progress_notes(*)
      //   `)
      //   .eq('patient_id', patientId)
      //   .order('created_at', { ascending: false });
      
      // Mock data for demonstration
      setTreatmentPlans(generateMockTreatmentPlans());
      if (treatmentPlans.length > 0) {
        setSelectedPlan(treatmentPlans[0]);
      }
      
    } catch (error) {
      console.error('Error loading treatment plans:', error);
      toast.error('Erro ao carregar planos de tratamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (planData: Partial<TreatmentPlan>) => {
    try {
      const newPlan: TreatmentPlan = {
        id: `plan_${Date.now()}`,
        patient_id: patientId,
        ...planData,
        completed_sessions: 0,
        protocols: [],
        assigned_professionals: [],
        progress_notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user_id', // TODO: Get from auth
        updated_by: 'current_user_id',
        lgpd_consent: true,
        data_retention_date: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
      } as TreatmentPlan;
      
      setTreatmentPlans(prev => [newPlan, ...prev]);
      setSelectedPlan(newPlan);
      setShowPlanDialog(false);
      toast.success('Plano de tratamento criado com sucesso');
      onPlanUpdate?.();
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      toast.error('Erro ao criar plano de tratamento');
    }
  };

  const handleAddProtocol = async (protocolData: Partial<TreatmentProtocol>) => {
    if (!selectedPlan) return;
    
    try {
      const newProtocol: TreatmentProtocol = {
        id: `protocol_${Date.now()}`,
        treatment_plan_id: selectedPlan.id,
        ...protocolData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lgpd_consent: true
      } as TreatmentProtocol;
      
      const updatedPlan = {
        ...selectedPlan,
        protocols: [...selectedPlan.protocols, newProtocol]
      };
      
      setSelectedPlan(updatedPlan);
      setTreatmentPlans(prev => 
        prev.map(plan => plan.id === selectedPlan.id ? updatedPlan : plan)
      );
      setShowProtocolDialog(false);
      toast.success('Protocolo adicionado com sucesso');
      onPlanUpdate?.();
    } catch (error) {
      console.error('Error adding protocol:', error);
      toast.error('Erro ao adicionar protocolo');
    }
  };

  const handleStartProtocol = async (protocolId: string) => {
    if (!selectedPlan) return;
    
    try {
      const updatedProtocols = selectedPlan.protocols.map(protocol => 
        protocol.id === protocolId 
          ? { ...protocol, status: 'in_progress' as const, scheduled_date: new Date().toISOString() }
          : protocol
      );
      
      const updatedPlan = { ...selectedPlan, protocols: updatedProtocols };
      setSelectedPlan(updatedPlan);
      setTreatmentPlans(prev => 
        prev.map(plan => plan.id === selectedPlan.id ? updatedPlan : plan)
      );
      
      toast.success('Protocolo iniciado');
      onPlanUpdate?.();
    } catch (error) {
      console.error('Error starting protocol:', error);
      toast.error('Erro ao iniciar protocolo');
    }
  };

  const handleCompleteProtocol = async (protocolId: string, notes?: string) => {
    if (!selectedPlan) return;
    
    try {
      const updatedProtocols = selectedPlan.protocols.map(protocol => 
        protocol.id === protocolId 
          ? { 
              ...protocol, 
              status: 'completed' as const, 
              completed_date: new Date().toISOString(),
              notes: notes || protocol.notes
            }
          : protocol
      );
      
      const completedCount = updatedProtocols.filter(p => p.status === 'completed').length;
      
      const updatedPlan = { 
        ...selectedPlan, 
        protocols: updatedProtocols,
        completed_sessions: completedCount
      };
      
      setSelectedPlan(updatedPlan);
      setTreatmentPlans(prev => 
        prev.map(plan => plan.id === selectedPlan.id ? updatedPlan : plan)
      );
      
      toast.success('Protocolo concluído');
      onPlanUpdate?.();
    } catch (error) {
      console.error('Error completing protocol:', error);
      toast.error('Erro ao concluir protocolo');
    }
  };

  const calculatePlanProgress = (plan: TreatmentPlan) => {
    if (plan.total_sessions === 0) return 0;
    return Math.round((plan.completed_sessions / plan.total_sessions) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'revised': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'orthodontics': return <Target className="h-4 w-4" />;
      case 'implants': return <Award className="h-4 w-4" />;
      case 'periodontics': return <Activity className="h-4 w-4" />;
      case 'endodontics': return <Clipboard className="h-4 w-4" />;
      case 'oral_surgery': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planos de Tratamento</h2>
          <p className="text-muted-foreground">
            Gestão de planos de tratamento e protocolos padronizados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              // Export treatment plans with LGPD compliance
              console.log('Exporting treatment plans');
              toast.success('Planos exportados com conformidade LGPD');
            }}
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          {!readOnly && (
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Criar Plano de Tratamento</DialogTitle>
                  <DialogDescription>
                    Defina um novo plano de tratamento com protocolos padronizados
                  </DialogDescription>
                </DialogHeader>
                <TreatmentPlanForm
                  onSubmit={handleCreatePlan}
                  onCancel={() => setShowPlanDialog(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos de tratamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="on_hold">Em Espera</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="orthodontics">Ortodontia</SelectItem>
            <SelectItem value="implants">Implantes</SelectItem>
            <SelectItem value="periodontics">Periodontia</SelectItem>
            <SelectItem value="endodontics">Endodontia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Treatment Plans List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold">Planos Ativos</h3>
          <div className="space-y-3">
            {treatmentPlans.map((plan) => {
              const progress = calculatePlanProgress(plan);
              const isSelected = selectedPlan?.id === plan.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(plan.plan_type)}
                            <h4 className="font-semibold text-sm">{plan.plan_name}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(plan.status)} variant="secondary">
                              {plan.status}
                            </Badge>
                            <Badge className={getPriorityColor(plan.priority)} variant="secondary">
                              {plan.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{plan.completed_sessions}/{plan.total_sessions} sessões</span>
                          <span>{format(new Date(plan.start_date), 'dd/MM/yy', { locale: ptBR })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Plan Details */}
        <div className="lg:col-span-2">
          {selectedPlan ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="protocols">Protocolos</TabsTrigger>
                <TabsTrigger value="progress">Progresso</TabsTrigger>
                <TabsTrigger value="team">Equipe</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          {getTypeIcon(selectedPlan.plan_type)}
                          <span>{selectedPlan.plan_name}</span>
                        </CardTitle>
                        <CardDescription>{selectedPlan.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedPlan.status)}>
                          {selectedPlan.status}
                        </Badge>
                        <Badge className={getPriorityColor(selectedPlan.priority)}>
                          {selectedPlan.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Cronograma</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Início:</span>
                              <span>{format(new Date(selectedPlan.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Previsão de término:</span>
                              <span>{format(new Date(selectedPlan.estimated_end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                            {selectedPlan.actual_end_date && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Término real:</span>
                                <span>{format(new Date(selectedPlan.actual_end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Progresso</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Sessões concluídas</span>
                              <span className="font-medium">{selectedPlan.completed_sessions}/{selectedPlan.total_sessions}</span>
                            </div>
                            <Progress value={calculatePlanProgress(selectedPlan)} className="h-2" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Custos</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Estimado:</span>
                              <span>R$ {selectedPlan.estimated_cost.toLocaleString('pt-BR')}</span>
                            </div>
                            {selectedPlan.actual_cost && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Real:</span>
                                <span>R$ {selectedPlan.actual_cost.toLocaleString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Objetivos</h4>
                          <div className="space-y-1">
                            {selectedPlan.objectives.map((objective, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{objective}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedPlan.contraindications && selectedPlan.contraindications.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span>Contraindicações</span>
                        </h4>
                        <div className="space-y-1">
                          {selectedPlan.contraindications.map((contraindication, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-orange-700">
                              <AlertCircle className="h-3 w-3" />
                              <span>{contraindication}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Protocols Tab */}
              <TabsContent value="protocols" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Protocolos de Tratamento</h3>
                  {!readOnly && (
                    <Dialog open={showProtocolDialog} onOpenChange={setShowProtocolDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Protocolo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Adicionar Protocolo</DialogTitle>
                          <DialogDescription>
                            Adicione um novo protocolo ao plano de tratamento
                          </DialogDescription>
                        </DialogHeader>
                        <ProtocolForm
                          onSubmit={handleAddProtocol}
                          onCancel={() => setShowProtocolDialog(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="space-y-4">
                  {selectedPlan.protocols
                    .sort((a, b) => a.sequence_order - b.sequence_order)
                    .map((protocol) => (
                    <Card key={protocol.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">#{protocol.sequence_order}</Badge>
                              <h4 className="font-semibold">{protocol.protocol_name}</h4>
                              <Badge className={getStatusColor(protocol.status)}>
                                {protocol.status}
                              </Badge>
                            </div>
                            
                            <div className="grid gap-2 md:grid-cols-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Categoria: </span>
                                <span>{protocol.category}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duração: </span>
                                <span>{protocol.estimated_duration} min</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Etapas: </span>
                                <span>{protocol.steps.length}</span>
                              </div>
                            </div>
                            
                            {protocol.scheduled_date && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Agendado para: </span>
                                <span>{format(new Date(protocol.scheduled_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                              </div>
                            )}
                            
                            {protocol.notes && (
                              <p className="text-sm text-muted-foreground">{protocol.notes}</p>
                            )}
                          </div>
                          
                          {!readOnly && (
                            <div className="flex items-center space-x-2">
                              {protocol.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleStartProtocol(protocol.id)}
                                >
                                  <Play className="mr-1 h-3 w-3" />
                                  Iniciar
                                </Button>
                              )}
                              {protocol.status === 'in_progress' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCompleteProtocol(protocol.id)}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Concluir
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Protocol Steps */}
                        {protocol.steps.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="font-medium mb-2">Etapas do Protocolo</h5>
                            <div className="space-y-2">
                              {protocol.steps.map((step) => (
                                <div key={step.id} className="flex items-center space-x-3 text-sm">
                                  <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                                    {step.step_number}
                                  </Badge>
                                  <div className="flex-1">
                                    <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                      {step.title}
                                    </span>
                                    <span className="text-muted-foreground ml-2">({step.estimated_time} min)</span>
                                  </div>
                                  <Badge className={getStatusColor(step.status)} variant="secondary">
                                    {step.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Notas de Progresso</h3>
                  {!readOnly && (
                    <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Nota
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Adicionar Nota de Progresso</DialogTitle>
                          <DialogDescription>
                            Registre o progresso do tratamento
                          </DialogDescription>
                        </DialogHeader>
                        <ProgressNoteForm
                          onSubmit={(data) => {
                            // Handle progress note submission
                            setShowProgressDialog(false);
                            toast.success('Nota de progresso adicionada');
                          }}
                          onCancel={() => setShowProgressDialog(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="space-y-4">
                  {selectedPlan.progress_notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{note.title}</h4>
                              <Badge variant="outline">{note.note_type}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                          <div className="text-xs text-muted-foreground">
                            Por: {note.created_by}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-4">
                <h3 className="text-lg font-semibold">Equipe Responsável</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedPlan.assigned_professionals.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{assignment.professional_name}</h4>
                            <Badge variant="outline">{assignment.role}</Badge>
                          </div>
                          {assignment.specialization && (
                            <p className="text-sm text-muted-foreground">{assignment.specialization}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            CRO: {assignment.license_number}
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium">Responsabilidades:</h5>
                            <ul className="text-xs space-y-1">
                              {assignment.responsibilities.map((responsibility, index) => (
                                <li key={index} className="flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{responsibility}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Selecione um plano de tratamento para ver os detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Components (simplified for brevity)
function TreatmentPlanForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    plan_name: '',
    plan_type: 'general',
    priority: 'medium',
    start_date: '',
    estimated_end_date: '',
    total_sessions: 1,
    estimated_cost: 0,
    description: '',
    objectives: [''],
    success_criteria: ['']
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="plan_name">Nome do Plano *</Label>
          <Input
            id="plan_name"
            value={formData.plan_name}
            onChange={(e) => setFormData(prev => ({ ...prev, plan_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="plan_type">Tipo de Tratamento</Label>
          <Select value={formData.plan_type} onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Geral</SelectItem>
              <SelectItem value="orthodontics">Ortodontia</SelectItem>
              <SelectItem value="implants">Implantes</SelectItem>
              <SelectItem value="periodontics">Periodontia</SelectItem>
              <SelectItem value="endodontics">Endodontia</SelectItem>
              <SelectItem value="oral_surgery">Cirurgia Oral</SelectItem>
              <SelectItem value="cosmetic">Estética</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="start_date">Data de Início</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="estimated_end_date">Previsão de Término</Label>
          <Input
            id="estimated_end_date"
            type="date"
            value={formData.estimated_end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_end_date: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="total_sessions">Total de Sessões</Label>
          <Input
            id="total_sessions"
            type="number"
            min="1"
            value={formData.total_sessions}
            onChange={(e) => setFormData(prev => ({ ...prev, total_sessions: parseInt(e.target.value) || 1 }))}
          />
        </div>
        <div>
          <Label htmlFor="estimated_cost">Custo Estimado (R$)</Label>
          <Input
            id="estimated_cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.estimated_cost}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="lgpd_consent" required />
        <Label htmlFor="lgpd_consent" className="text-sm">
          Confirmo o consentimento LGPD para armazenamento destes dados de tratamento
        </Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Criar Plano
        </Button>
      </div>
    </form>
  );
}

function ProtocolForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  // Similar form structure for protocols
  return <div>Protocol Form Component</div>;
}

function ProgressNoteForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  // Similar form structure for progress notes
  return <div>Progress Note Form Component</div>;
}

// Mock data generators
function generateMockTreatmentPlans(): TreatmentPlan[] {
  return [
    {
      id: 'plan_1',
      patient_id: 'patient_1',
      plan_name: 'Tratamento Ortodôntico Completo',
      plan_type: 'orthodontics',
      status: 'active',
      priority: 'medium',
      start_date: '2024-01-15',
      estimated_end_date: '2025-01-15',
      total_sessions: 24,
      completed_sessions: 8,
      estimated_cost: 8500.00,
      actual_cost: 2800.00,
      description: 'Tratamento ortodôntico completo com aparelho fixo para correção de maloclusão classe II',
      objectives: [
        'Corrigir maloclusão classe II',
        'Alinhar dentes anteriores',
        'Melhorar função mastigatória',
        'Otimizar estética do sorriso'
      ],
      contraindications: [
        'Doença periodontal ativa',
        'Higiene oral inadequada'
      ],
      success_criteria: [
        'Overjet entre 2-4mm',
        'Overbite entre 2-4mm',
        'Alinhamento dental adequado',
        'Função mastigatória normal'
      ],
      protocols: [
        {
          id: 'protocol_1',
          treatment_plan_id: 'plan_1',
          protocol_name: 'Instalação de Aparelho Ortodôntico',
          protocol_type: 'standard',
          category: 'Ortodontia',
          sequence_order: 1,
          estimated_duration: 90,
          required_materials: [
            {
              id: 'mat_1',
              name: 'Brackets metálicos',
              quantity: 20,
              unit: 'unidades',
              cost_per_unit: 15.00,
              required: true
            }
          ],
          required_equipment: [
            {
              id: 'eq_1',
              name: 'Cadeira odontológica',
              type: 'furniture',
              operator_certification_required: false,
              safety_protocols: ['Posicionamento adequado do paciente']
            }
          ],
          steps: [
            {
              id: 'step_1',
              step_number: 1,
              title: 'Preparação do paciente',
              description: 'Posicionar paciente e preparar campo operatório',
              estimated_time: 10,
              required_skills: ['Posicionamento', 'Isolamento'],
              verification_points: ['Paciente confortável', 'Campo limpo'],
              completion_criteria: 'Paciente preparado adequadamente',
              status: 'completed',
              completed_at: '2024-01-15T10:00:00Z',
              completed_by: 'doctor_1'
            }
          ],
          precautions: ['Verificar alergias', 'Confirmar higiene oral'],
          post_care_instructions: [
            'Evitar alimentos duros nas primeiras 24h',
            'Manter higiene oral rigorosa',
            'Retornar em caso de desconforto excessivo'
          ],
          follow_up_requirements: [
            {
              id: 'follow_1',
              title: 'Consulta de acompanhamento',
              description: 'Verificar adaptação ao aparelho',
              due_date: '2024-02-15',
              priority: 'medium',
              assigned_to: 'doctor_1',
              status: 'pending'
            }
          ],
          quality_metrics: [
            {
              id: 'metric_1',
              metric_name: 'Tempo de instalação',
              target_value: 90,
              actual_value: 85,
              unit: 'minutos',
              measurement_date: '2024-01-15',
              measured_by: 'doctor_1'
            }
          ],
          status: 'completed',
          scheduled_date: '2024-01-15T09:00:00Z',
          completed_date: '2024-01-15T10:30:00Z',
          performed_by: 'doctor_1',
          notes: 'Instalação realizada sem intercorrências',
          created_at: '2024-01-15T08:00:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          lgpd_consent: true
        }
      ],
      assigned_professionals: [
        {
          id: 'assign_1',
          professional_id: 'prof_1',
          professional_name: 'Dr. João Silva',
          role: 'primary_dentist',
          specialization: 'Ortodontia',
          license_number: 'CRO-SP 12345',
          assignment_date: '2024-01-15',
          responsibilities: [
            'Planejamento do tratamento',
            'Execução dos procedimentos',
            'Acompanhamento do progresso'
          ],
          availability_schedule: [
            {
              day_of_week: 1,
              start_time: '08:00',
              end_time: '17:00',
              location: 'Consultório 1'
            }
          ]
        }
      ],
      progress_notes: [
        {
          id: 'note_1',
          treatment_plan_id: 'plan_1',
          note_type: 'progress',
          title: 'Progresso após 3 meses',
          content: 'Paciente apresenta boa evolução no alinhamento dental. Cooperação excelente com higiene oral.',
          created_at: '2024-04-15T14:00:00Z',
          created_by: 'Dr. João Silva',
          lgpd_consent: true
        }
      ],
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-04-15T14:00:00Z',
      created_by: 'doctor_1',
      updated_by: 'doctor_1',
      lgpd_consent: true,
      data_retention_date: '2031-01-15T08:00:00Z'
    }
  ];
}