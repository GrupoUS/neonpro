"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { APPOINTMENT_SKELETON_INDEXES, DASHBOARD_CONSTANTS } from "./constants";

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
    const limitedAppointments = todaysAppointments.slice(
      DASHBOARD_CONSTANTS.GROWTH_THRESHOLD,
      DASHBOARD_CONSTANTS.TODAYS_APPOINTMENTS_LIMIT,
    );

    return (
      <div className="space-y-3">
        {limitedAppointments.map((appointment) => (
          <div
            className="flex items-center justify-between rounded-lg border p-3"
            key={appointment.id}
          >
            <div>
              <p className="font-medium text-sm">
                {appointment.patient?.name || "Paciente não informado"}
              </p>
              <p className="text-muted-foreground text-xs">
                {appointment.type || "Consulta"}
              </p>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="mr-1 h-3 w-3" />
              {appointment.time || "Horário não definido"}
            </div>
          </div>
        ))}
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

    if (todaysAppointments.length > DASHBOARD_CONSTANTS.GROWTH_THRESHOLD) {
      return renderAppointmentsContent();
    }

    return renderEmptyState();
  };

  const shouldShowViewAllButton = () => {
    return (
      !appointmentsLoading &&
      todaysAppointments.length > DASHBOARD_CONSTANTS.TODAYS_APPOINTMENTS_LIMIT
    );
  };

  return (
    <Card className="neonpro-card">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Calendar className="mr-2 h-5 w-5 text-chart-1" />
          Consultas de Hoje
        </CardTitle>
        <CardDescription>Agenda de hoje</CardDescription>
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
