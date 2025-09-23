"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  RecoveryPlan,
  RecoveryPhase,
  // RecoveryInstruction,
  // AestheticAppointment 
} from '@/types/aesthetic-scheduling';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';
// import { Textarea } from '@/components/ui/textarea';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Heart,
  Thermometer,
  Activity,
  Shield,
  Sun,
  Snowflake,
  Droplets,
  Coffee,
  // Moon,
  // Zap,
  // RefreshCw,
  // Download,
  // Share2,
  // Plus,
  // Edit,
  // Save,
  X,
  Users,
  // MessageCircle,
  Phone,
  // Video,
  MapPin
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecoveryPlanningProps {
  appointmentId?: string;
  treatmentPlanId?: string;
  procedureIds?: string[];
  patientId?: string;
  _onRecoveryPlanCreate?: (plan: RecoveryPlan) => void;
}

export function RecoveryPlanning({ 
  appointmentId,
  treatmentPlanId,
  procedureIds,
  patientId,
  onRecoveryPlanCreate 
}: RecoveryPlanningProps) {
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [activeTab, setActiveTab] = useState('planning');
  // const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [customInstructions] = useState({
    phase: '',
    title: '',
    description: '',
    duration: 1,
    restrictions: [] as string[],
    careInstructions: [] as string[],
    warningSigns: [] as string[]
  });

  // Fetch recovery plan template
  const { data: recoveryPlan, isLoading, error, refetch } = useQuery({
    queryKey: ['recovery-plan', appointmentId, treatmentPlanId, procedureIds, selectedProcedure],
    queryFn: async () => {
      if (selectedProcedure) {
        return await api.aestheticScheduling.getRecoveryPlan({
          procedureId: selectedProcedure,
          treatmentPlanId,
          appointmentId,
          includePersonalizedInstructions: true
        });
      }
      return null;
    },
    enabled: !!selectedProcedure,
  });

  // Create recovery plan mutation
  const createRecoveryPlan = useMutation({
    mutationFn: async (plan: Partial<RecoveryPlan>) => {
      return await api.aestheticScheduling.createRecoveryPlan(plan);
    },
    onSuccess: () => {
      refetch();
      setIsCreatingPlan(false);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleCreatePlan = () => {
    if (!recoveryPlan || !patientId) return;

    createRecoveryPlan.mutate({
      patientId,
      treatmentPlanId,
      appointmentId,
      procedureId: selectedProcedure,
      phases: recoveryPlan.phases,
      totalRecoveryTime: recoveryPlan.totalRecoveryTime,
      instructions: recoveryPlan.instructions,
      followUpAppointments: recoveryPlan.followUpAppointments,
      emergencyContacts: recoveryPlan.emergencyContacts,
      customNotes: customInstructions.description
    });
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'early': return 'bg-orange-100 text-orange-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'late': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro no planejamento de recuperação</AlertTitle>
        <AlertDescription>
          Não foi possível gerar o plano de recuperação. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Planejamento de Recuperação
          </h2>
          <p className="text-gray-600 mt-1">
            Plano personalizado para recuperação pós-procedimento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Procedure Selection */}
      {!selectedProcedure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Selecione o Procedimento
            </CardTitle>
            <CardDescription>
              Escolha o procedimento para gerar o plano de recuperação personalizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {procedureIds?.map((procedureId) => (
                <Button
                  key={procedureId}
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => setSelectedProcedure(procedureId)}
                >
                  <div className="font-medium">{procedureId}</div>
                  <div className="text-xs text-gray-500">Clique para selecionar</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recovery Plan Display */}
      {selectedProcedure && recoveryPlan && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Tempo Total</div>
                    <div className="text-lg font-bold">{recoveryPlan.totalRecoveryTime} dias</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Fases de Recuperação</div>
                    <div className="text-lg font-bold">{recoveryPlan.phases.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-500">Acompanhamentos</div>
                    <div className="text-lg font-bold">{recoveryPlan.followUpAppointments.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-sm text-gray-500">Nível de Cuidado</div>
                    <div className="text-lg font-bold capitalize">{recoveryPlan.careLevel}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning */}
          {recoveryPlan.risks.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção aos Riscos</AlertTitle>
              <AlertDescription>
                Este procedimento apresenta {recoveryPlan.risks.length} risco(s) potencial(is) durante a recuperação.
                Siga todas as instruções cuidadosamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="planning">Plano de Recuperação</TabsTrigger>
              <TabsTrigger value="instructions">Instruções</TabsTrigger>
              <TabsTrigger value="followup">Acompanhamento</TabsTrigger>
              <TabsTrigger value="emergency">Emergência</TabsTrigger>
            </TabsList>

            {/* Recovery Plan */}
            <TabsContent value="planning" className="space-y-4">
              <div className="space-y-6">
                {recoveryPlan.phases.map((phase, index) => (
                  <RecoveryPhaseCard key={index} phase={phase} getPhaseColor={getPhaseColor} />
                ))}
              </div>
            </TabsContent>

            {/* Instructions */}
            <TabsContent value="instructions" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      Cuidados Diários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recoveryPlan.instructions
                        .filter(i => i.category === 'daily_care')
                        .map((instruction, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{instruction.title}</div>
                              <div className="text-xs text-gray-600">{instruction.description}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Snowflake className="h-5 w-5" />
                      Restrições
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recoveryPlan.instructions
                        .filter(i => i.category === 'restrictions')
                        .map((instruction, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{instruction.title}</div>
                              <div className="text-xs text-gray-600">{instruction.description}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      Cuidados com a Pele
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recoveryPlan.instructions
                        .filter(i => i.category === 'skin_care')
                        .map((instruction, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Heart className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{instruction.title}</div>
                              <div className="text-xs text-gray-600">{instruction.description}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      Alimentação e Hidratação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recoveryPlan.instructions
                        .filter(i => i.category === 'diet_hydration')
                        .map((instruction, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{instruction.title}</div>
                              <div className="text-xs text-gray-600">{instruction.description}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Follow-up */}
            <TabsContent value="followup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Agenda de Acompanhamento
                  </CardTitle>
                  <CardDescription>
                    Consultas de acompanhamento programadas para sua recuperação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recoveryPlan.followUpAppointments.map((appointment, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{appointment.title}</h4>
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Data:</span>
                            <div className="font-medium">{formatDate(appointment.date)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Método:</span>
                            <div className="font-medium capitalize">{appointment.method}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Duração:</span>
                            <div className="font-medium">{appointment.duration} min</div>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency */}
            <TabsContent value="emergency" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Sinais de Alerta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recoveryPlan.warningSigns.map((sign, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            sign.severity === 'critical' ? 'text-red-500' :
                            sign.severity === 'moderate' ? 'text-yellow-500' : 'text-green-500'
                          }`} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{sign.description}</div>
                            <Badge variant="outline" className={`mt-1 ${getSeverityColor(sign.severity)}`}>
                              {sign.severity === 'critical' ? 'Crítico' :
                               sign.severity === 'moderate' ? 'Moderado' :
                               sign.severity === 'mild' ? 'Leve' : sign.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contatos de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recoveryPlan.emergencyContacts.map((contact, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {contact.type === 'clinic' ? <MapPin className="h-4 w-4 text-blue-500" /> :
                             contact.type === 'doctor' ? <Users className="h-4 w-4 text-green-500" /> :
                             <Phone className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{contact.name}</div>
                            <div className="text-xs text-gray-600">{contact.role}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{contact.phone}</div>
                            <div className="text-xs text-gray-500">24h</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

interface RecoveryPhaseCardProps {
  phase: RecoveryPhase;
  getPhaseColor: (phase: string) => string;
}

function RecoveryPhaseCard({ phase, getPhaseColor }: RecoveryPhaseCardProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Fase {phase.phaseNumber}: {phase.name}
          </CardTitle>
          <Badge className={getPhaseColor(phase.phase)}>
            {phase.phase === 'immediate' ? 'Imediata' :
             phase.phase === 'early' ? 'Início' :
             phase.phase === 'intermediate' ? 'Intermediária' :
             phase.phase === 'late' ? 'Tardia' :
             phase.phase === 'maintenance' ? 'Manutenção' : phase.phase}
          </Badge>
        </div>
        <CardDescription>
          {phase.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500">Duração:</span>
            <div className="font-medium">{phase.duration} dias</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Início:</span>
            <div className="font-medium">{formatDate(phase.startDate)}</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Término:</span>
            <div className="font-medium">{formatDate(phase.endDate)}</div>
          </div>
        </div>

        <div className="space-y-3">
          {phase.keyActivities.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Atividades Principais:</h4>
              <div className="flex flex-wrap gap-2">
                {phase.keyActivities.map((activity, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {phase.restrictions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Restrições:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {phase.restrictions.map((restriction, index) => (
                  <li key={index}>{restriction}</li>
                ))}
              </ul>
            </div>
          )}

          {phase.milestones.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Marcos Esperados:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {phase.milestones.map((milestone, index) => (
                  <li key={index}>{milestone}</li>
                ))}
              </ul>
            </div>
          )}

          {phase.warningSigns.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sinais de Alerta nesta Fase</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm">
                  {phase.warningSigns.map((sign, index) => (
                    <li key={index}>{sign}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}