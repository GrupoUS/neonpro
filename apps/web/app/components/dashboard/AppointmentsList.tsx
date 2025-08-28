"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { APPOINTMENT_SKELETON_INDEXES, DASHBOARD_CONSTANTS } from "./constants";
import { RiskIndicatorWithTooltip } from "@/components/no-show/risk-indicator";
import { useEnhancedAppointments } from "@/hooks/use-no-show-prediction";
import { INTERVENTION_ACTIONS_PT } from "@/types/no-show-prediction";

interface Appointment {
  id: string;
  patient?: {
    name?: string;
  };
  time?: string;
  type?: string;
}

interface AppointmentsListProps {
  appointmentsLoading: boolean;
  todaysAppointments: Appointment[];
}

export function AppointmentsList({
  appointmentsLoading,
  todaysAppointments,
}: AppointmentsListProps) {
  const router = useRouter();
  
  // Enhanced appointments with risk predictions
  const { 
    appointments: enhancedAppointments, 
    isLoading: predictionsLoading,
    error: predictionsError 
  } = useEnhancedAppointments(todaysAppointments);

  const handleViewAllAppointments = () => {
    router.push("/appointments");
  };

  const renderSkeletonContent = () => (
    <div className="space-y-3">
      {APPOINTMENT_SKELETON_INDEXES.map((index) => (
        <div className="space-y-2 rounded-lg border p-3" key={index}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );

  const renderAppointmentsContent = () => {
    const limitedAppointments = enhancedAppointments.slice(
      DASHBOARD_CONSTANTS.GROWTH_THRESHOLD,
      DASHBOARD_CONSTANTS.TODAYS_APPOINTMENTS_LIMIT,
    );

    return (
      <div className="space-y-3">
        {limitedAppointments.map((appointment) => {
          const prediction = appointment.riskPrediction;
          const hasRiskData = prediction && !predictionsLoading;
          
          return (
            <div
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30 ${
                hasRiskData && prediction.riskLevel === 'critical' 
                  ? 'border-red-200 bg-red-50/30' 
                  : hasRiskData && prediction.riskLevel === 'high'
                  ? 'border-orange-200 bg-orange-50/30'
                  : ''
              }`}
              key={appointment.id}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">
                    {appointment.patient?.name || "Paciente não informado"}
                  </p>
                  {hasRiskData && (
                    <RiskIndicatorWithTooltip
                      riskScore={prediction.riskScore}
                      riskLevel={prediction.riskLevel}
                      size="small"
                      showLabel={false}
                      tooltipContent={{
                        confidence: prediction.confidence,
                        topFactors: prediction.factors.slice(0, 3),
                        recommendedActions: INTERVENTION_ACTIONS_PT[prediction.riskLevel] || []
                      }}
                    />
                  )}
                  {predictionsLoading && (
                    <Skeleton className="h-4 w-12" />
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {appointment.type || "Consulta"}
                </p>
                {hasRiskData && prediction.riskLevel in ['high', 'critical'] && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      Ação preventiva recomendada
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="mr-1 h-3 w-3" />
                {appointment.time || "Horário não definido"}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmptyState = () => (
    <p className="text-center text-muted-foreground text-sm">
      Nenhuma consulta agendada para hoje
    </p>
  );

  const renderContent = () => {
    if (appointmentsLoading) {
      return renderSkeletonContent();
    }

    if (enhancedAppointments.length > DASHBOARD_CONSTANTS.GROWTH_THRESHOLD) {
      return renderAppointmentsContent();
    }

    return renderEmptyState();
  };

  // Risk statistics for the header
  const getRiskStats = () => {
    const appointmentsWithRisk = enhancedAppointments.filter(apt => apt.riskPrediction);
    const highRiskCount = appointmentsWithRisk.filter(apt => 
      apt.riskPrediction && ['high', 'critical'].includes(apt.riskPrediction.riskLevel)
    ).length;
    
    return { total: appointmentsWithRisk.length, highRisk: highRiskCount };
  };

  const riskStats = getRiskStats();

  const shouldShowViewAllButton = () => {
    return (
      !appointmentsLoading
      && enhancedAppointments.length > DASHBOARD_CONSTANTS.TODAYS_APPOINTMENTS_LIMIT
    );
  };

  return (
    <Card className="neonpro-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-chart-1" />
            Consultas de Hoje
          </div>
          {riskStats.total > 0 && riskStats.highRisk > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600 font-medium">
                {riskStats.highRisk} alto risco
              </span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {riskStats.total > 0 
            ? `Agenda de hoje • ${riskStats.total} com predição de risco`
            : "Agenda de hoje"
          }
          {predictionsError && (
            <span className="text-red-500"> • Erro ao carregar predições</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
        {shouldShowViewAllButton() && (
          <Button
            className="w-full"
            onClick={handleViewAllAppointments}
            variant="outline"
          >
            Ver Todas as Consultas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
