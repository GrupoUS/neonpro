// Conflict Override Dialog Component with Manager Approval Workflow
"use client";

import dayjs from "dayjs";
import type { AlertTriangle, Bell, CheckCircle, Clock, User, XCircle } from "lucide-react";
import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type {
  OverrideReason,
  OverrideRequest,
  useConflictOverride,
} from "@/hooks/use-conflict-override";
import type { useToast } from "@/hooks/use-toast";

interface ConflictOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictDetails?: {
    appointment_id: string;
    conflict_type: string;
    conflict_description: string;
    affected_appointments: Array<{
      id: string;
      patient_name: string;
      service_name: string;
      original_time: string;
    }>;
    estimated_impact_minutes: number;
  };
  onOverrideComplete?: (overrideRequest: OverrideRequest) => void;
}

const OVERRIDE_REASONS: { value: OverrideReason; label: string; description: string }[] = [
  {
    value: "emergency_appointment",
    label: "Emergência Médica",
    description: "Situação de emergência que requer atendimento imediato",
  },
  {
    value: "medical_priority",
    label: "Prioridade Médica",
    description: "Paciente com condição que requer priorização médica",
  },
  {
    value: "patient_preference",
    label: "Preferência do Paciente",
    description: "Solicitação específica do paciente por motivos pessoais",
  },
  {
    value: "schedule_optimization",
    label: "Otimização de Agenda",
    description: "Melhoria na eficiência da agenda clínica",
  },
  {
    value: "special_circumstances",
    label: "Circunstâncias Especiais",
    description: "Situação única que justifica o override",
  },
  {
    value: "administrative_decision",
    label: "Decisão Administrativa",
    description: "Decisão da gestão clínica",
  },
];

export function ConflictOverrideDialog({
  open,
  onOpenChange,
  conflictDetails,
  onOverrideComplete,
}: ConflictOverrideDialogProps) {
  const [selectedReason, setSelectedReason] = useState<OverrideReason>("emergency_appointment");
  const [reasonText, setReasonText] = useState("");
  const [activeTab, setActiveTab] = useState("request");

  const { loading, userPermissions, requestConflictOverride, checkOverridePermissions } =
    useConflictOverride();

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkOverridePermissions();
    }
  }, [open, checkOverridePermissions]);

  const handleSubmitOverride = async () => {
    if (!conflictDetails) return;

    if (!reasonText.trim()) {
      toast({
        variant: "destructive",
        title: "Justificativa Obrigatória",
        description: "Por favor, forneça uma justificativa detalhada para o override.",
      });
      return;
    }

    try {
      const overrideRequest = await requestConflictOverride({
        appointment_id: conflictDetails.appointment_id,
        conflict_type: conflictDetails.conflict_type,
        conflict_details: conflictDetails.conflict_description,
        override_reason: selectedReason,
        override_reason_text: reasonText,
        requested_by: "", // Will be filled by the hook
        impact_assessment: {
          affected_appointments: conflictDetails.affected_appointments,
          estimated_delay_minutes: conflictDetails.estimated_impact_minutes,
          notification_required: conflictDetails.affected_appointments.length > 0,
        },
      });

      onOverrideComplete?.(overrideRequest);
      onOpenChange(false);

      // Reset form
      setSelectedReason("emergency_appointment");
      setReasonText("");
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getImpactSeverity = (minutes: number) => {
    if (minutes <= 30) return { level: "low", color: "bg-green-100 text-green-800" };
    if (minutes <= 120) return { level: "medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "high", color: "bg-red-100 text-red-800" };
  };

  const canRequestOverride = userPermissions?.can_override_conflicts;
  const requiresApproval = userPermissions?.requires_approval;
  const impactSeverity = conflictDetails
    ? getImpactSeverity(conflictDetails.estimated_impact_minutes)
    : null;

  if (!conflictDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sistema de Override de Conflitos
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conflict">Detalhes do Conflito</TabsTrigger>
            <TabsTrigger value="request">Solicitar Override</TabsTrigger>
            <TabsTrigger value="impact">Avaliação de Impacto</TabsTrigger>
          </TabsList>

          <TabsContent value="conflict" className="space-y-4">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-700 text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Conflito Identificado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-red-600 font-medium">Tipo de Conflito:</Label>
                    <p className="mt-1">{conflictDetails.conflict_type}</p>
                  </div>
                  <div>
                    <Label className="text-red-600 font-medium">ID do Agendamento:</Label>
                    <p className="mt-1 font-mono text-sm">{conflictDetails.appointment_id}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-red-600 font-medium">Descrição:</Label>
                  <p className="mt-1">{conflictDetails.conflict_description}</p>
                </div>
              </CardContent>
            </Card>

            {conflictDetails.affected_appointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agendamentos Afetados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conflictDetails.affected_appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="font-medium">{appointment.patient_name}</p>
                            <p className="text-sm text-gray-600">{appointment.service_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {dayjs(appointment.original_time).format("DD/MM/YYYY HH:mm")}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            Reagendamento Necessário
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            {!canRequestOverride ? (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-orange-700 mb-2">
                      Permissão Insuficiente
                    </h3>
                    <p className="text-orange-600">
                      Você não tem permissão para solicitar override de conflitos. Entre em contato
                      com um supervisor ou gerente da clínica.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Justificativa para Override</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Motivo Principal</Label>
                      <Select
                        value={selectedReason}
                        onValueChange={(value) => setSelectedReason(value as OverrideReason)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {OVERRIDE_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              <div>
                                <div className="font-medium">{reason.label}</div>
                                <div className="text-xs text-gray-500">{reason.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reason-text">Justificativa Detalhada *</Label>
                      <Textarea
                        id="reason-text"
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                        placeholder="Forneça uma justificativa detalhada para este override, incluindo quaisquer circunstâncias especiais ou considerações médicas..."
                        rows={4}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Esta justificativa será registrada no audit log e pode ser revisada durante
                        auditorias.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {requiresApproval && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Bell className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-blue-700">Aprovação Necessária</h4>
                          <p className="text-sm text-blue-600 mt-1">
                            Sua solicitação de override será enviada para aprovação de um supervisor
                            ou gerente. Você será notificado sobre o status da aprovação.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Impacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      {conflictDetails.estimated_impact_minutes}
                    </p>
                    <p className="text-sm text-gray-600">Minutos de Impacto</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <User className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      {conflictDetails.affected_appointments.length}
                    </p>
                    <p className="text-sm text-gray-600">Pacientes Afetados</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Badge className={`${impactSeverity?.color} text-lg px-3 py-1`}>
                      {impactSeverity?.level === "low" && "Baixo"}
                      {impactSeverity?.level === "medium" && "Médio"}
                      {impactSeverity?.level === "high" && "Alto"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">Nível de Impacto</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Ações Automáticas após Aprovação:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Notificações automáticas enviadas aos pacientes afetados
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Registro completo no audit log para compliance
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Atualização automática das agendas afetadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Alertas para a equipe sobre mudanças na agenda
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          {canRequestOverride && activeTab === "request" && (
            <Button
              onClick={handleSubmitOverride}
              disabled={loading || !reasonText.trim()}
              className="min-w-[140px]"
            >
              {loading
                ? "Processando..."
                : requiresApproval
                  ? "Solicitar Aprovação"
                  : "Aplicar Override"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
