"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { DASHBOARD_CONSTANTS, PATIENT_SKELETON_INDEXES } from "./constants";

interface Patient {
  id: string;
  name?: string;
  status: string;
  avatar?: string;
}

interface PatientsListProps {
  patientsLoading: boolean;
  recentPatients: Patient[];
}

export function PatientsList({
  patientsLoading,
  recentPatients,
}: PatientsListProps) {
  const router = useRouter();

  const handleViewAllPatients = () => {
    router.push("/pacientes");
  };

  const getPatientInitial = (patient: Patient) => {
    if (!patient.name) {
      return "P";
    }
    return patient.name
      .charAt(0)
      .toUpperCase();
  };

  const renderSkeletonContent = () => (
    <div className="space-y-3">
      {PATIENT_SKELETON_INDEXES.map((index) => (
        <div className="flex items-center space-x-3" key={index}>
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPatientsContent = () => {
    const limitedPatients = recentPatients.slice(
      DASHBOARD_CONSTANTS.GROWTH_THRESHOLD,
      DASHBOARD_CONSTANTS.RECENT_PATIENTS_LIMIT,
    );

    return (
      <div className="space-y-3">
        {limitedPatients.map((patient) => (
          <div className="flex items-center justify-between" key={patient.id}>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getPatientInitial(patient)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{patient.name}</p>
                <Badge
                  className="text-xs"
                  variant={patient.status === "active" ? "default" : "secondary"}
                >
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEmptyState = () => (
    <p className="text-center text-muted-foreground text-sm">
      Nenhum paciente recente encontrado
    </p>
  );

  const renderContent = () => {
    if (patientsLoading) {
      return renderSkeletonContent();
    }

    if (recentPatients.length > DASHBOARD_CONSTANTS.GROWTH_THRESHOLD) {
      return renderPatientsContent();
    }

    return renderEmptyState();
  };

  const shouldShowViewAllButton = () => {
    return (
      !patientsLoading
      && recentPatients.length > DASHBOARD_CONSTANTS.RECENT_PATIENTS_LIMIT
    );
  };

  return (
    <Card className="neonpro-card">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Pacientes Recentes
        </CardTitle>
        <CardDescription>Últimos pacientes cadastrados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
        {shouldShowViewAllButton() && (
          <Button
            className="w-full"
            onClick={handleViewAllPatients}
            variant="outline"
          >
            Ver Todos os Pacientes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
