"use client";

// =============================================
// NeonPro Business Rules Configuration Panel
// Story 1.2: Unified business rules management
// =============================================

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  Save,
  Settings,
  UserCheck,
} from "lucide-react";
import type { useState } from "react";
import type { toast } from "sonner";
import type { ClinicHolidayManager } from "./clinic-holiday-manager";
import type { ServiceTypeRuleManager } from "./service-type-rule-manager";

interface BusinessRulesConfigPanelProps {
  clinicId: string;
  onConfigurationChange?: () => void;
}

export function BusinessRulesConfigPanel({
  clinicId,
  onConfigurationChange,
}: BusinessRulesConfigPanelProps) {
  const [activeTab, setActiveTab] = useState("schedules");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [configStats, setConfigStats] = useState({
    professionalSchedules: 0,
    holidays: 0,
    serviceRules: 0,
  });

  const handleConfigurationUpdate = (type: "schedules" | "holidays" | "rules", count: number) => {
    setConfigStats((prev) => ({
      ...prev,
      [type === "schedules"
        ? "professionalSchedules"
        : type === "holidays"
          ? "holidays"
          : "serviceRules"]: count,
    }));

    setHasUnsavedChanges(true);
    onConfigurationChange?.();
  };

  const saveAllConfigurations = async () => {
    try {
      // This could trigger a refresh of all cached rules
      const response = await fetch(`/api/clinic/${clinicId}/business-rules/refresh`, {
        method: "POST",
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        toast.success("Todas as configurações foram salvas e aplicadas!");
      }
    } catch (error) {
      console.error("Error saving configurations:", error);
      toast.error("Erro ao salvar configurações");
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "schedules":
        return <Clock className="h-4 w-4" />;
      case "holidays":
        return <Calendar className="h-4 w-4" />;
      case "rules":
        return <Settings className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getConfigurationSummary = () => {
    const totalConfigs =
      configStats.professionalSchedules + configStats.holidays + configStats.serviceRules;

    if (totalConfigs === 0) {
      return {
        status: "warning",
        message: "Nenhuma regra configurada",
        description: "Configure horários, feriados e regras para evitar conflitos",
      };
    }

    const missingConfigs = [];
    if (configStats.professionalSchedules === 0) missingConfigs.push("horários dos profissionais");
    if (configStats.holidays === 0) missingConfigs.push("feriados");
    if (configStats.serviceRules === 0) missingConfigs.push("regras de serviços");

    if (missingConfigs.length > 0) {
      return {
        status: "info",
        message: "Configuração parcial",
        description: `Considere configurar: ${missingConfigs.join(", ")}`,
      };
    }

    return {
      status: "success",
      message: "Configuração completa",
      description: "Todas as regras básicas estão configuradas",
    };
  };

  const configSummary = getConfigurationSummary();

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Regras de Negócio
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure horários, feriados e regras para prevenir conflitos de agendamento
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {configSummary.status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <Badge
                    variant={
                      configSummary.status === "success"
                        ? "default"
                        : configSummary.status === "warning"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {configSummary.message}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{configSummary.description}</p>
              </div>

              {hasUnsavedChanges && (
                <Button onClick={saveAllConfigurations} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Aplicar Mudanças
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {configStats.professionalSchedules}
              </div>
              <div className="text-xs text-muted-foreground">Horários Profissionais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{configStats.holidays}</div>
              <div className="text-xs text-muted-foreground">Feriados/Fechamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{configStats.serviceRules}</div>
              <div className="text-xs text-muted-foreground">Regras de Serviços</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="schedules" className="flex items-center gap-2">
                {getTabIcon("schedules")}
                Horários dos Profissionais
              </TabsTrigger>
              <TabsTrigger value="holidays" className="flex items-center gap-2">
                {getTabIcon("holidays")}
                Feriados e Fechamentos
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                {getTabIcon("rules")}
                Regras de Serviços
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="schedules" className="mt-0">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure os horários de trabalho para cada profissional da clínica.
                  </p>
                  {/* Here you would typically list professionals and allow managing each one */}
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Selecione um profissional para configurar horários</p>
                    <p className="text-xs">
                      Esta funcionalidade seria integrada com a seleção de profissionais
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="holidays" className="mt-0">
                <ClinicHolidayManager
                  clinicId={clinicId}
                  onHolidaysChange={(holidays) =>
                    handleConfigurationUpdate("holidays", holidays.length)
                  }
                />
              </TabsContent>

              <TabsContent value="rules" className="mt-0">
                <ServiceTypeRuleManager
                  clinicId={clinicId}
                  onRulesChange={(rules) => handleConfigurationUpdate("rules", rules.length)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Como Funciona o Sistema de Prevenção de Conflitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-blue-600" />
                Horários dos Profissionais
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Define horários de trabalho por dia da semana</li>
                <li>Controla intervalos e pausas</li>
                <li>Limita agendamentos por hora</li>
                <li>Define tempos mínimos entre consultas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-green-600" />
                Feriados e Fechamentos
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Bloqueia datas específicas ou recorrentes</li>
                <li>Permite fechamentos parciais por horário</li>
                <li>Configuração de feriados anuais automáticos</li>
                <li>Fechamentos temporários para reformas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Settings className="h-4 w-4 text-purple-600" />
                Regras de Serviços
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Define durações mínimas e máximas</li>
                <li>Controla tempos de buffer antes/depois</li>
                <li>Limita agendamentos diários por tipo</li>
                <li>Restringe profissionais autorizados</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Validação em Tempo Real</h4>
                <p className="text-blue-700 text-sm">
                  O sistema valida automaticamente cada agendamento contra todas as regras
                  configuradas, prevenindo conflitos antes que aconteçam e sugerindo horários
                  alternativos quando necessário.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
