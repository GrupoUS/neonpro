/**
 * Multi-Session Treatment Scheduling Component
 * Brazilian healthcare compliant aesthetic procedure scheduling with multi-session support
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc/client';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  MultiSessionSchedulingSchema,
  type MultiSessionSchedulingRequest,
  type AestheticProcedure,
  type AestheticSchedulingResponse,
  type PregnancyStatus,
} from '@/types/aesthetic-scheduling';

interface MultiSessionSchedulerProps {
  patientId: string;
  onSuccess?: (response: AestheticSchedulingResponse) => void;
  onError?: (error: Error) => void;
}

export function MultiSessionScheduler({ patientId, onSuccess, onError }: MultiSessionSchedulerProps) {
  const queryClient = useQueryClient();
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);
  const [preferredProfessionals, setPreferredProfessionals] = useState<string[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState<'routine' | 'priority' | 'urgent'>('routine');
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<{
    pregnancyStatus: PregnancyStatus;
    contraindications: string[];
    medications: string[];
    allergies: string[];
  }>({
    pregnancyStatus: 'none' as const,
    contraindications: [] as string[],
    medications: [] as string[],
    allergies: [] as string[],
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newContraindication, setNewContraindication] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  // Fetch available procedures
  const { data: proceduresData, isLoading: proceduresLoading } = trpc.aestheticScheduling.getAestheticProcedures.useQuery(
    { limit: 100, offset: 0 },
    {
      select: (data: { procedures: AestheticProcedure[] }) => data.procedures,
    }
  );

  // Fetch available professionals
  const { data: professionalsData, isLoading: professionalsLoading } = trpc.professional.getAll.useQuery();

  // Schedule procedures mutation
  const scheduleMutation = trpc.aestheticScheduling.scheduleProcedures.useMutation({
    onSuccess: (data: AestheticSchedulingResponse) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error as Error);
    },
  });

  // Check contraindications
  const checkContraindicationsMutation = trpc.aestheticScheduling.checkContraindications.useMutation();

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !specialRequirements.includes(newRequirement.trim())) {
      setSpecialRequirements([...specialRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setSpecialRequirements(specialRequirements.filter(req => req !== requirement));
  };

  const handleAddContraindication = () => {
    if (newContraindication.trim() && !medicalHistory.contraindications.includes(newContraindication.trim())) {
      setMedicalHistory({
        ...medicalHistory,
        contraindications: [...medicalHistory.contraindications, newContraindication.trim()],
      });
      setNewContraindication('');
    }
  };

  const handleRemoveContraindication = (contraindication: string) => {
    setMedicalHistory({
      ...medicalHistory,
      contraindications: medicalHistory.contraindications.filter(cont => cont !== contraindication),
    });
  };

  const handleAddMedication = () => {
    if (newMedication.trim() && !medicalHistory.medications.includes(newMedication.trim())) {
      setMedicalHistory({
        ...medicalHistory,
        medications: [...medicalHistory.medications, newMedication.trim()],
      });
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (medication: string) => {
    setMedicalHistory({
      ...medicalHistory,
      medications: medicalHistory.medications.filter(med => med !== medication),
    });
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !medicalHistory.allergies.includes(newAllergy.trim())) {
      setMedicalHistory({
        ...medicalHistory,
        allergies: [...medicalHistory.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setMedicalHistory({
      ...medicalHistory,
      allergies: medicalHistory.allergies.filter(all => all !== allergy),
    });
  };

  const handleAddDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!preferredDates.some(d => d.toDateString() === date.toDateString())) {
      setPreferredDates([...preferredDates, date]);
    }
  };

  const handleRemoveDate = (date: Date) => {
    setPreferredDates(preferredDates.filter(d => d !== date));
  };

  const handleProcedureSelect = (procedureId: string, checked: boolean) => {
    if (checked) {
      setSelectedProcedures([...selectedProcedures, procedureId]);
    } else {
      setSelectedProcedures(selectedProcedures.filter(id => id !== procedureId));
    }
  };

  const handleProfessionalSelect = (professionalId: string, checked: boolean) => {
    if (checked) {
      setPreferredProfessionals([...preferredProfessionals, professionalId]);
    } else {
      setPreferredProfessionals(preferredProfessionals.filter(id => id !== professionalId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const formData: MultiSessionSchedulingRequest = {
        patientId,
        procedures: selectedProcedures,
        preferredDates,
        preferredProfessionals: preferredProfessionals.length > 0 ? preferredProfessionals : undefined,
        urgencyLevel,
        specialRequirements: specialRequirements.length > 0 ? specialRequirements : undefined,
        medicalHistory: {
          pregnancyStatus: medicalHistory.pregnancyStatus,
          contraindications: medicalHistory.contraindications.length > 0 ? medicalHistory.contraindications : undefined,
          medications: medicalHistory.medications.length > 0 ? medicalHistory.medications : undefined,
          allergies: medicalHistory.allergies.length > 0 ? medicalHistory.allergies : undefined,
        },
      };

      await MultiSessionSchedulingSchema.parseAsync(formData);
      
      // Schedule procedures
      scheduleMutation.mutate(formData);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const isSubmitting = scheduleMutation.isLoading;
  const selectedProceduresData = proceduresData?.filter((p: AestheticProcedure) => selectedProcedures.includes(p.id)) || [];
  const totalEstimatedDuration = selectedProceduresData.reduce((total: number, proc: AestheticProcedure) => total + proc.baseDuration, 0);
  const totalEstimatedCost = selectedProceduresData.reduce((total: number, proc: AestheticProcedure) => total + proc.basePrice, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Agendamento de Procedimentos Estéticos
        </h1>
        <p className="text-gray-600">
          Agende múltiplas sessões de tratamentos estéticos com conformidade ANVISA e padrões brasileiros
        </p>
      </div>

      {scheduleMutation.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro no Agendamento</AlertTitle>
          <AlertDescription>
            {scheduleMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="procedures" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
            <TabsTrigger value="scheduling">Agendamento</TabsTrigger>
            <TabsTrigger value="medical">Histórico Médico</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="procedures" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Selecionar Procedimentos
                </CardTitle>
                <CardDescription>
                  Escolha os procedimentos estéticos que o paciente deseja realizar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {proceduresLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Carregando procedimentos...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proceduresData?.map((procedure: AestheticProcedure) => (
                      <Card key={procedure.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="checkbox"
                                  id={procedure.id}
                                  checked={selectedProcedures.includes(procedure.id)}
                                  onChange={(e) => handleProcedureSelect(procedure.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  aria-label={`Selecionar procedimento ${procedure.name}`}
                                />
                                <h3 className="font-medium text-gray-900">{procedure.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{procedure.description}</p>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="secondary">{procedure.category}</Badge>
                                <Badge variant="outline">{procedure.procedureType}</Badge>
                                {procedure.requiresCertification && (
                                  <Badge variant="destructive" className="text-xs">
                                    Requer Certificação
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-700">
                                <div className="flex justify-between">
                                  <span>Duração:</span>
                                  <span>{procedure.baseDuration} min</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Valor:</span>
                                  <span>R$ {procedure.basePrice.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Sessões:</span>
                                  <span>{procedure.minSessions}-{procedure.maxSessions}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Datas Preferenciais
                  </CardTitle>
                  <CardDescription>
                    Selecione as datas preferenciais para o agendamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      onChange={(e) => e.target.value && handleAddDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      aria-label="Adicionar data preferencial"
                    />
                    <Button type="button" onClick={() => {
                      const input = document.querySelector('input[type="date"]') as HTMLInputElement;
                      if (input?.value) handleAddDate(input.value);
                    }}>
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {preferredDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{date.toLocaleDateString('pt-BR')}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDate(date)}
                          aria-label={`Remover data ${date.toLocaleDateString('pt-BR')}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profissionais Preferenciais
                  </CardTitle>
                  <CardDescription>
                    Selecione os profissionais preferenciais (opcional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {professionalsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Carregando profissionais...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {professionalsData?.map((professional: any) => (
                        <div key={professional.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={professional.id}
                            checked={preferredProfessionals.includes(professional.id)}
                            onChange={(e) => handleProfessionalSelect(professional.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            aria-label={`Selecionar profissional ${professional.name}`}
                          />
                          <Label htmlFor={professional.id} className="text-sm">
                            {professional.name} - {professional.specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="urgencyLevel">Nível de Urgência</Label>
                  <Select value={urgencyLevel} onValueChange={(value: 'routine' | 'priority' | 'urgent') => setUrgencyLevel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Rotina</SelectItem>
                      <SelectItem value="priority">Prioridade</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Requisitos Especiais</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Adicionar requisito especial"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                        aria-label="Novo requisito especial"
                      />
                      <Button type="button" onClick={handleAddRequirement}>
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {specialRequirements.map((requirement, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {requirement}
                          <XCircle className="h-3 w-3 ml-1" onClick={() => handleRemoveRequirement(requirement)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Histórico Médico e Contraindicações
                </CardTitle>
                <CardDescription>
                  Informações médicas importantes para avaliação de contraindicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="pregnancyStatus">Status de Gravidez</Label>
                  <Select 
                    value={medicalHistory.pregnancyStatus} 
                    onValueChange={(value: PregnancyStatus) =>
                      setMedicalHistory({...medicalHistory, pregnancyStatus: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="pregnant">Grávida</SelectItem>
                      <SelectItem value="breastfeeding">Amamentando</SelectItem>
                      <SelectItem value="planning">Planejando gravidez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Contraindicações</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newContraindication}
                        onChange={(e) => setNewContraindication(e.target.value)}
                        placeholder="Adicionar contraindicação"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddContraindication()}
                        aria-label="Nova contraindicação"
                      />
                      <Button type="button" onClick={handleAddContraindication}>
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {medicalHistory.contraindications.map((contraindication, index) => (
                        <Badge key={index} variant="destructive" className="cursor-pointer">
                          {contraindication}
                          <XCircle className="h-3 w-3 ml-1" onClick={() => handleRemoveContraindication(contraindication)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Medicamentos em Uso</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        placeholder="Adicionar medicamento"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                        aria-label="Novo medicamento"
                      />
                      <Button type="button" onClick={handleAddMedication}>
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {medicalHistory.medications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {medication}
                          <XCircle className="h-3 w-3 ml-1" onClick={() => handleRemoveMedication(medication)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Alergias</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="Adicionar alergia"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                        aria-label="Nova alergia"
                      />
                      <Button type="button" onClick={handleAddAllergy}>
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {medicalHistory.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {allergy}
                          <XCircle className="h-3 w-3 ml-1" onClick={() => handleRemoveAllergy(allergy)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Agendamento</CardTitle>
                <CardDescription>
                  Revise todas as informações antes de confirmar o agendamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProceduresData.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Procedimentos Selecionados</h3>
                    <div className="space-y-2">
                      {selectedProceduresData.map((procedure: AestheticProcedure) => (
                        <div key={procedure.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{procedure.name}</span>
                            <div className="text-sm text-gray-600">
                              {procedure.baseDuration} min • R$ {procedure.basePrice.toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Duração Total Estimada:</span>
                        <span>{totalEstimatedDuration} minutos</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Valor Total Estimado:</span>
                        <span>R$ {totalEstimatedCost.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {preferredDates.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Datas Preferenciais</h3>
                    <div className="flex flex-wrap gap-2">
                      {preferredDates.map((date, index) => (
                        <Badge key={index} variant="outline">
                          {date.toLocaleDateString('pt-BR')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {preferredProfessionals.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Profissionais Preferenciais</h3>
                    <div className="flex flex-wrap gap-2">
                      {preferredProfessionals.map((professionalId: string) => {
                        const professional = professionalsData?.find((p: any) => p.id === professionalId);
                        return professional ? (
                          <Badge key={professionalId} variant="secondary">
                            {professional.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {specialRequirements.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Requisitos Especiais</h3>
                    <div className="flex flex-wrap gap-2">
                      {specialRequirements.map((requirement, index) => (
                        <Badge key={index} variant="outline">
                          {requirement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={selectedProcedures.length === 0 || preferredDates.length === 0 || isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Agendando...
              </>
            ) : (
              'Confirmar Agendamento'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}