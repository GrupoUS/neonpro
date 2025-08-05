"use client";

import React, { useState, useEffect } from "react";
import type { Clock, Star, AlertTriangle, Calendar, Shield, TrendingUp, Heart } from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { toast } from "sonner";
import type { formatDistanceToNow } from "date-fns";
import type { ptBR } from "date-fns/locale";

interface QuickAccessPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  riskLevel: "low" | "medium" | "high";
  lastVisit: string;
  nextAppointment?: string;
  treatmentType: string;
  hasPhotos: boolean;
  photoUrl?: string;
  isFavorite: boolean;
  visitCount: number;
  verificationStatus: "pending" | "verified" | "failed";
}

interface QuickAccessData {
  patients: QuickAccessPatient[];
  totalCount: number;
  lastUpdated: string;
}

type ListType =
  | "recent"
  | "favorites"
  | "high-risk"
  | "upcoming-appointments"
  | "pending-verification"
  | "frequent";

interface QuickAccessProps {
  onPatientSelect?: (patient: QuickAccessPatient) => void;
}

export function QuickAccess({ onPatientSelect }: QuickAccessProps) {
  const [activeTab, setActiveTab] = useState<ListType>("recent");
  const [data, setData] = useState<Record<ListType, QuickAccessData>>({} as any);
  const [isLoading, setIsLoading] = useState(false);

  // Load quick access data
  const loadQuickAccessData = async (type: ListType) => {
    if (data[type]) return; // Already loaded

    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/integration/quick-access?type=${type}&limit=20`);
      const result = await response.json();

      if (result.success) {
        setData((prev) => ({
          ...prev,
          [type]: result.data,
        }));
      } else {
        toast.error(result.error || "Erro ao carregar dados");
      }
    } catch (error) {
      console.error("Error loading quick access data:", error);
      toast.error("Erro ao carregar dados de acesso rápido");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (patientId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/patients/integration/quick-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          action: currentStatus ? "remove" : "add",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setData((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            const listType = key as ListType;
            if (updated[listType]?.patients) {
              updated[listType] = {
                ...updated[listType],
                patients: updated[listType].patients.map((p) =>
                  p.id === patientId ? { ...p, isFavorite: !currentStatus } : p,
                ),
              };
            }
          });
          return updated;
        });

        toast.success(
          currentStatus ? "Paciente removido dos favoritos" : "Paciente adicionado aos favoritos",
        );
      } else {
        toast.error(result.error || "Erro ao atualizar favoritos");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Erro ao atualizar favoritos");
    }
  };

  // Load data when tab changes
  useEffect(() => {
    loadQuickAccessData(activeTab);
  }, [activeTab]);

  // Initial load
  useEffect(() => {
    loadQuickAccessData("recent");
  }, []);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTabIcon = (type: ListType) => {
    switch (type) {
      case "recent":
        return <Clock className="h-4 w-4" />;
      case "favorites":
        return <Star className="h-4 w-4" />;
      case "high-risk":
        return <AlertTriangle className="h-4 w-4" />;
      case "upcoming-appointments":
        return <Calendar className="h-4 w-4" />;
      case "pending-verification":
        return <Shield className="h-4 w-4" />;
      case "frequent":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTabLabel = (type: ListType) => {
    switch (type) {
      case "recent":
        return "Recentes";
      case "favorites":
        return "Favoritos";
      case "high-risk":
        return "Alto Risco";
      case "upcoming-appointments":
        return "Próximas Consultas";
      case "pending-verification":
        return "Verificação Pendente";
      case "frequent":
        return "Frequentes";
      default:
        return type;
    }
  };

  const renderPatientCard = (patient: QuickAccessPatient) => (
    <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={patient.photoUrl} alt={patient.name} />
              <AvatarFallback>
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-sm truncate">{patient.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(patient.id, patient.isFavorite);
                  }}
                >
                  <Star
                    className={`h-3 w-3 ${
                      patient.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                    }`}
                  />
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  {patient.age} anos • {patient.gender === "male" ? "M" : "F"}
                </div>
                <div className="truncate">{patient.email}</div>
                <div>{patient.phone}</div>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getRiskLevelColor(patient.riskLevel)} variant="secondary">
                  {patient.riskLevel === "high"
                    ? "Alto"
                    : patient.riskLevel === "medium"
                      ? "Médio"
                      : "Baixo"}
                </Badge>

                {activeTab === "pending-verification" && (
                  <Badge
                    className={getVerificationStatusColor(patient.verificationStatus)}
                    variant="secondary"
                  >
                    {patient.verificationStatus === "verified"
                      ? "Verificado"
                      : patient.verificationStatus === "pending"
                        ? "Pendente"
                        : "Falhou"}
                  </Badge>
                )}

                {patient.hasPhotos && (
                  <Badge variant="outline" className="text-xs">
                    📸
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">
              {activeTab === "recent" && (
                <span>
                  Última visita:{" "}
                  {formatDistanceToNow(new Date(patient.lastVisit), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              )}

              {activeTab === "upcoming-appointments" && patient.nextAppointment && (
                <span>
                  Próxima:{" "}
                  {formatDistanceToNow(new Date(patient.nextAppointment), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              )}

              {activeTab === "frequent" && <span>{patient.visitCount} visitas</span>}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => onPatientSelect?.(patient)}
            >
              Ver Perfil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const currentData = data[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Heart className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Acesso Rápido</h2>
      </div>

      {/* Quick Access Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ListType)}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="recent" className="flex items-center space-x-1">
            {getTabIcon("recent")}
            <span className="hidden sm:inline">Recentes</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center space-x-1">
            {getTabIcon("favorites")}
            <span className="hidden sm:inline">Favoritos</span>
          </TabsTrigger>
          <TabsTrigger value="high-risk" className="flex items-center space-x-1">
            {getTabIcon("high-risk")}
            <span className="hidden sm:inline">Alto Risco</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming-appointments" className="flex items-center space-x-1">
            {getTabIcon("upcoming-appointments")}
            <span className="hidden sm:inline">Consultas</span>
          </TabsTrigger>
          <TabsTrigger value="pending-verification" className="flex items-center space-x-1">
            {getTabIcon("pending-verification")}
            <span className="hidden sm:inline">Verificação</span>
          </TabsTrigger>
          <TabsTrigger value="frequent" className="flex items-center space-x-1">
            {getTabIcon("frequent")}
            <span className="hidden sm:inline">Frequentes</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        {(
          [
            "recent",
            "favorites",
            "high-risk",
            "upcoming-appointments",
            "pending-verification",
            "frequent",
          ] as ListType[]
        ).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {isLoading && !currentData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando pacientes...</p>
              </div>
            ) : currentData?.patients.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {currentData.totalCount} pacientes • Atualizado{" "}
                    {formatDistanceToNow(new Date(currentData.lastUpdated), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      delete data[type];
                      loadQuickAccessData(type);
                    }}
                  >
                    Atualizar
                  </Button>
                </div>

                <div className="grid gap-3">{currentData.patients.map(renderPatientCard)}</div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">{getTabIcon(type)}</div>
                <p className="text-gray-500">Nenhum paciente encontrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  {type === "favorites" && "Adicione pacientes aos favoritos para acesso rápido"}
                  {type === "high-risk" && "Nenhum paciente de alto risco no momento"}
                  {type === "upcoming-appointments" && "Nenhuma consulta agendada"}
                  {type === "pending-verification" && "Todas as verificações estão em dia"}
                  {type === "frequent" && "Nenhum paciente frequente identificado"}
                  {type === "recent" && "Nenhuma atividade recente"}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
