"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type {
  AestheticTreatmentCategory,
  CFMComplianceStatus,
  LGPDPhotoConsentStatus,
  TreatmentPlan,
  TreatmentSession,
  TreatmentStatus,
} from "@/types/treatments";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  MapPin,
  Shield,
  Star,
  Target,
} from "lucide-react";
import { useState } from "react";

// Visual components maintaining NeonPro design
interface NeonGradientCardProps {
  children: React.ReactNode;
  className?: string;
}

const NeonGradientCard = ({
  children,
  className = "",
}: NeonGradientCardProps) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, y: 20 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

// Props interface for the component
interface AestheticTreatmentPlanProps {
  treatmentPlan: TreatmentPlan;
  sessions?: TreatmentSession[];
  onEditPlan?: (plan: TreatmentPlan) => void;
  onScheduleSession?: (planId: string) => void;
  onViewProgress?: (planId: string) => void;
  onManageConsent?: (planId: string) => void;
  variant?: "card" | "detailed" | "summary";
  className?: string;
}

// Helper functions for Brazilian localization
const getTreatmentCategoryLabel = (
  category: AestheticTreatmentCategory,
): string => {
  const labels: Record<AestheticTreatmentCategory, string> = {
    facial: "Tratamentos Faciais",
    body_contouring: "Contorno Corporal",
    skin_rejuvenation: "Rejuvenescimento Cutâneo",
    hair_restoration: "Restauração Capilar",
    intimate_health: "Saúde Íntima",
    preventive_care: "Cuidados Preventivos",
    post_surgical: "Pós-Cirúrgico",
    dermatological: "Dermatológico",
  };
  return labels[category];
};
const getTreatmentStatusLabel = (status: TreatmentStatus): string => {
  const labels: Record<TreatmentStatus, string> = {
    planned: "Planejado",
    consent_pending: "Aguardando Consentimento",
    active: "Em Andamento",
    paused: "Pausado",
    completed: "Concluído",
    cancelled: "Cancelado",
    under_review: "Em Revisão",
  };
  return labels[status];
};

const getTreatmentStatusVariant = (
  status: TreatmentStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<
    TreatmentStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    planned: "outline",
    consent_pending: "secondary",
    active: "default",
    paused: "secondary",
    completed: "default",
    cancelled: "destructive",
    under_review: "secondary",
  };
  return variants[status];
};

const getCFMComplianceLabel = (status: CFMComplianceStatus): string => {
  const labels: Record<CFMComplianceStatus, string> = {
    compliant: "Conforme CFM",
    pending_review: "Aguardando Revisão",
    requires_attention: "Requer Atenção",
    non_compliant: "Não Conforme",
  };
  return labels[status];
};

const getCFMComplianceIcon = (status: CFMComplianceStatus) => {
  switch (status) {
    case "compliant": {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    case "pending_review": {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    case "requires_attention": {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    case "non_compliant": {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    default: {
      return <Info className="h-4 w-4 text-gray-500" />;
    }
  }
};

const getLGPDConsentLabel = (status: LGPDPhotoConsentStatus): string => {
  const labels: Record<LGPDPhotoConsentStatus, string> = {
    granted: "Consentimento Concedido",
    withdrawn: "Consentimento Retirado",
    expired: "Consentimento Expirado",
    pending: "Aguardando Consentimento",
    refused: "Consentimento Recusado",
  };
  return labels[status];
};

const getLGPDConsentIcon = (status: LGPDPhotoConsentStatus) => {
  switch (status) {
    case "granted": {
      return <Shield className="h-4 w-4 text-green-500" />;
    }
    case "withdrawn": {
      return <Shield className="h-4 w-4 text-red-500" />;
    }
    case "expired": {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    case "pending": {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    case "refused": {
      return <Shield className="h-4 w-4 text-red-500" />;
    }
    default: {
      return <Info className="h-4 w-4 text-gray-500" />;
    }
  }
};

// Progress calculation helper
const calculateProgress = (
  completedSessions: number,
  expectedSessions: number,
): number => {
  if (expectedSessions === 0) {
    return 0;
  }
  return Math.min((completedSessions / expectedSessions) * 100, 100);
};

// Main component
export function AestheticTreatmentPlan({
  treatmentPlan,
  sessions = [],
  onEditPlan,
  onScheduleSession,
  onViewProgress,
  onManageConsent,
  variant = "card",
  className = "",
}: AestheticTreatmentPlanProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const progress = calculateProgress(
    treatmentPlan.completed_sessions,
    treatmentPlan.expected_sessions,
  );
  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === "scheduled"
      && new Date(session.scheduled_date) > new Date(),
  );
  const completedSessions = sessions.filter(
    (session) => session.status === "completed",
  );

  // Summary Card View
  if (variant === "summary") {
    return (
      <Card className={`transition-all hover:shadow-lg ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {treatmentPlan.treatment_name}
              </CardTitle>
              <CardDescription>
                {getTreatmentCategoryLabel(treatmentPlan.category)}
              </CardDescription>
            </div>
            <Badge variant={getTreatmentStatusVariant(treatmentPlan.status)}>
              {getTreatmentStatusLabel(treatmentPlan.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progresso do Tratamento
              </span>
              <span className="font-medium">
                {treatmentPlan.completed_sessions}/
                {treatmentPlan.expected_sessions} sessões
              </span>
            </div>
            <Progress
              aria-label={`Progresso: ${progress.toFixed(1)}%`}
              className="h-2"
              value={progress}
            />

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {getCFMComplianceIcon(treatmentPlan.cfm_compliance_status)}
                <span className="text-muted-foreground">CFM</span>
              </div>
              <div className="flex items-center gap-1">
                {getLGPDConsentIcon(treatmentPlan.lgpd_photo_consent_status)}
                <span className="text-muted-foreground">LGPD</span>
              </div>
              {treatmentPlan.next_session_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">
                    Próxima: {new Date(
                      treatmentPlan.next_session_date,
                    ).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card View
  if (variant === "card") {
    return (
      <NeonGradientCard className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-white text-xl">
                {treatmentPlan.treatment_name}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {getTreatmentCategoryLabel(treatmentPlan.category)}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getTreatmentStatusVariant(treatmentPlan.status)}>
                {getTreatmentStatusLabel(treatmentPlan.status)}
              </Badge>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {getCFMComplianceIcon(
                        treatmentPlan.cfm_compliance_status,
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {getCFMComplianceLabel(
                          treatmentPlan.cfm_compliance_status,
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {getLGPDConsentIcon(
                        treatmentPlan.lgpd_photo_consent_status,
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {getLGPDConsentLabel(
                          treatmentPlan.lgpd_photo_consent_status,
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Progresso do Tratamento</span>
              <span className="font-medium text-white">
                {treatmentPlan.completed_sessions}/
                {treatmentPlan.expected_sessions} sessões
              </span>
            </div>
            <Progress
              aria-label={`Progresso: ${progress.toFixed(1)}%`}
              className="h-3"
              value={progress}
            />
            <div className="text-slate-400 text-xs">
              {progress.toFixed(1)}% concluído
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4" />
                <span>Início:</span>
              </div>
              <p className="font-medium text-white">
                {new Date(treatmentPlan.start_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Target className="h-4 w-4" />
                <span>Previsão:</span>
              </div>
              <p className="font-medium text-white">
                {new Date(
                  treatmentPlan.estimated_completion_date,
                ).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Next Session */}
          {treatmentPlan.next_session_date && (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <Calendar className="h-4 w-4" />
              <AlertDescription className="text-blue-100">
                Próxima sessão: {new Date(treatmentPlan.next_session_date).toLocaleDateString(
                  "pt-BR",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onViewProgress && (
              <Button
                className="flex-1"
                onClick={() => onViewProgress(treatmentPlan.id)}
                size="sm"
                variant="outline"
              >
                <Activity className="mr-1 h-4 w-4" />
                Ver Progresso
              </Button>
            )}
            {onScheduleSession && treatmentPlan.status === "active" && (
              <Button
                className="flex-1"
                onClick={() => onScheduleSession(treatmentPlan.id)}
                size="sm"
              >
                <Calendar className="mr-1 h-4 w-4" />
                Agendar Sessão
              </Button>
            )}
          </div>
        </CardContent>
      </NeonGradientCard>
    );
  } // Detailed View
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <NeonGradientCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-white">
                {treatmentPlan.treatment_name}
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge
                  className="text-sm"
                  variant={getTreatmentStatusVariant(treatmentPlan.status)}
                >
                  {getTreatmentStatusLabel(treatmentPlan.status)}
                </Badge>
                <span className="text-slate-300">
                  {getTreatmentCategoryLabel(treatmentPlan.category)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {onEditPlan && (
                <Button
                  aria-label="Editar plano de tratamento"
                  onClick={() => onEditPlan(treatmentPlan)}
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Editar Plano
                </Button>
              )}
              {onManageConsent && (
                <Button
                  aria-label="Gerenciar consentimentos"
                  onClick={() => onManageConsent(treatmentPlan.id)}
                  variant="outline"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Gerenciar Consentimentos
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </NeonGradientCard>

      {/* Main Content Tabs */}
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="outcomes">Resultados</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent className="space-y-4" value="overview">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Treatment Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Progresso do Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Sessões Completadas
                    </span>
                    <span className="font-medium">
                      {treatmentPlan.completed_sessions}/
                      {treatmentPlan.expected_sessions}
                    </span>
                  </div>
                  <Progress
                    aria-label={`Progresso: ${progress.toFixed(1)}%`}
                    className="h-3"
                    value={progress}
                  />
                  <p className="text-muted-foreground text-xs">
                    {progress.toFixed(1)}% do tratamento concluído
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tipo de Tratamento</p>
                    <p className="font-medium">
                      {treatmentPlan.treatment_type === "single_session"
                        && "Sessão Única"}
                      {treatmentPlan.treatment_type === "multi_session"
                        && "Multi-sessão"}
                      {treatmentPlan.treatment_type === "combination_therapy"
                        && "Terapia Combinada"}
                      {treatmentPlan.treatment_type
                          === "maintenance_protocol" && "Protocolo de Manutenção"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Intervalo entre Sessões
                    </p>
                    <p className="font-medium">
                      {treatmentPlan.session_interval_days} dias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Detalhes do Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-muted-foreground text-sm">
                    Descrição
                  </p>
                  <p className="text-sm">{treatmentPlan.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Data de Início</p>
                    <p className="font-medium">
                      {new Date(treatmentPlan.start_date).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Previsão de Conclusão
                    </p>
                    <p className="font-medium">
                      {new Date(
                        treatmentPlan.estimated_completion_date,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {treatmentPlan.next_session_date && (
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Próxima sessão agendada para{" "}
                      <strong>
                        {new Date(
                          treatmentPlan.next_session_date,
                        ).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent className="space-y-4" value="sessions">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sessões Agendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0
                  ? (
                    <div className="space-y-3">
                      {upcomingSessions.slice(0, 3).map((session) => (
                        <div
                          className="flex items-center justify-between rounded-lg border p-3"
                          key={session.id}
                        >
                          <div>
                            <p className="font-medium">
                              Sessão {session.session_number}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {new Date(
                                session.scheduled_date,
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {session.duration_minutes} min
                          </Badge>
                        </div>
                      ))}
                      {upcomingSessions.length > 3 && (
                        <p className="text-center text-muted-foreground text-sm">
                          +{upcomingSessions.length - 3} sessões adicionais
                        </p>
                      )}
                    </div>
                  )
                  : (
                    <div className="py-6 text-center">
                      <Calendar className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhuma sessão agendada
                      </p>
                      {onScheduleSession && (
                        <Button
                          className="mt-2"
                          onClick={() => onScheduleSession(treatmentPlan.id)}
                          size="sm"
                          variant="outline"
                        >
                          Agendar Sessão
                        </Button>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Completed Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Sessões Realizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedSessions.length > 0
                  ? (
                    <div className="space-y-3">
                      {completedSessions.slice(-3).map((session) => (
                        <div
                          className="flex items-center justify-between rounded-lg border p-3"
                          key={session.id}
                        >
                          <div>
                            <p className="font-medium">
                              Sessão {session.session_number}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {new Date(
                                session.actual_date || session.scheduled_date,
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.patient_satisfaction_score && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">
                                  {session.patient_satisfaction_score}/10
                                </span>
                              </div>
                            )}
                            <Badge variant="default">Concluída</Badge>
                          </div>
                        </div>
                      ))}
                      {completedSessions.length > 3 && (
                        <p className="text-center text-muted-foreground text-sm">
                          +{completedSessions.length - 3} sessões anteriores
                        </p>
                      )}
                    </div>
                  )
                  : (
                    <div className="py-6 text-center">
                      <CheckCircle className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhuma sessão realizada
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent className="space-y-4" value="compliance">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* CFM Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCFMComplianceIcon(treatmentPlan.cfm_compliance_status)}
                  Conformidade CFM
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Status
                    </span>
                    <Badge
                      variant={treatmentPlan.cfm_compliance_status === "compliant"
                        ? "default"
                        : "secondary"}
                    >
                      {getCFMComplianceLabel(
                        treatmentPlan.cfm_compliance_status,
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Licença Profissional Verificada
                    </span>
                    {treatmentPlan.professional_license_verified
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Revisão Ética Necessária
                    </span>
                    {treatmentPlan.ethics_review_required
                      ? <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      : <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </div>

                {treatmentPlan.cfm_compliance_status !== "compliant" && (
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Este tratamento requer atenção para conformidade com as diretrizes do CFM.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* LGPD Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getLGPDConsentIcon(treatmentPlan.lgpd_photo_consent_status)}
                  Conformidade LGPD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Consentimento LGPD
                    </span>
                    {treatmentPlan.lgpd_consent_granted
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Consentimento para Fotos
                    </span>
                    <Badge
                      variant={treatmentPlan.lgpd_photo_consent_status === "granted"
                        ? "default"
                        : "secondary"}
                    >
                      {getLGPDConsentLabel(
                        treatmentPlan.lgpd_photo_consent_status,
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Retenção de Dados
                    </span>
                    <span className="font-medium text-sm">
                      {treatmentPlan.data_retention_days} dias
                    </span>
                  </div>

                  {treatmentPlan.lgpd_consent_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Data do Consentimento
                      </span>
                      <span className="font-medium text-sm">
                        {new Date(
                          treatmentPlan.lgpd_consent_date,
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>

                {!treatmentPlan.lgpd_consent_granted && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      É necessário obter o consentimento LGPD antes de prosseguir com o tratamento.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outcomes Tab */}
        <TabsContent className="space-y-4" value="outcomes">
          <div className="grid grid-cols-1 gap-4">
            {/* Expected Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Resultados Esperados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treatmentPlan.expected_outcomes
                  ? (
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p>
                          Os resultados esperados para este tratamento incluem:
                        </p>
                        {/* This would be populated from the JSON structure */}
                        <p className="text-muted-foreground">
                          Dados específicos dos resultados esperados serão exibidos aqui.
                        </p>
                      </div>
                    </div>
                  )
                  : (
                    <p className="text-muted-foreground">
                      Nenhum resultado esperado definido para este tratamento.
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Avaliação de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treatmentPlan.risk_assessment
                  ? (
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Importante: Todos os riscos foram explicados e compreendidos pelo
                          paciente.
                        </AlertDescription>
                      </Alert>
                      <div className="prose prose-sm max-w-none">
                        {/* This would be populated from the JSON structure */}
                        <p className="text-muted-foreground">
                          Avaliação detalhada de riscos e contraindicações será exibida aqui.
                        </p>
                      </div>
                    </div>
                  )
                  : (
                    <p className="text-muted-foreground">
                      Nenhuma avaliação de risco disponível para este tratamento.
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Custo Total</p>
                    <p className="font-semibold text-lg">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(treatmentPlan.total_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Custo por Sessão
                    </p>
                    <p className="font-semibold text-lg">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        treatmentPlan.total_cost
                          / treatmentPlan.expected_sessions,
                      )}
                    </p>
                  </div>
                </div>

                {treatmentPlan.payment_plan && (
                  <div className="mt-4">
                    <p className="mb-2 text-muted-foreground text-sm">
                      Plano de Pagamento
                    </p>
                    <Badge variant="outline">Parcelamento Disponível</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AestheticTreatmentPlan;
