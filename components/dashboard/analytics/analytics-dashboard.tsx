"use client";

import { ExportModal } from "@/components/dashboard/analytics/export-modal";
import { KPICard } from "@/components/dashboard/analytics/kpi-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

// Mock data baseado nas pesquisas de KPIs para clínicas
const kpiData = {
  clinical: {
    patientSatisfaction: { value: 94, change: +2.3, trend: "up" as const },
    appointmentCompletion: { value: 87, change: -1.2, trend: "down" as const },
    treatmentSuccess: { value: 91, change: +4.1, trend: "up" as const },
    followUpAdherence: { value: 78, change: +5.2, trend: "up" as const },
  },
  operational: {
    averageWaitTime: {
      value: 12,
      change: -2.1,
      trend: "up" as const,
      unit: "min",
    },
    staffUtilization: { value: 82, change: +3.2, trend: "up" as const },
    appointmentEfficiency: { value: 95, change: +1.8, trend: "up" as const },
    resourceUtilization: { value: 74, change: -0.5, trend: "down" as const },
  },
  financial: {
    monthlyRevenue: {
      value: 125840,
      change: +8.7,
      trend: "up" as const,
      format: "currency" as const,
    },
    revenuePerPatient: {
      value: 287,
      change: +12.3,
      trend: "up" as const,
      format: "currency" as const,
    },
    costPerAcquisition: {
      value: 45,
      change: -15.2,
      trend: "up" as const,
      format: "currency" as const,
    },
    profitMargin: { value: 68, change: +4.5, trend: "up" as const },
  },
};

// Dados para gráficos baseados em tendências temporais
const chartData = {
  patientSatisfactionTrend: [
    { month: "Jan", value: 91 },
    { month: "Fev", value: 89 },
    { month: "Mar", value: 92 },
    { month: "Abr", value: 93 },
    { month: "Mai", value: 91 },
    { month: "Jun", value: 94 },
  ],
  revenueGrowth: [
    { month: "Jan", revenue: 98500, expenses: 65200 },
    { month: "Fev", revenue: 105200, expenses: 67800 },
    { month: "Mar", revenue: 112400, expenses: 71200 },
    { month: "Abr", revenue: 108900, expenses: 69500 },
    { month: "Mai", revenue: 118700, expenses: 74100 },
    { month: "Jun", revenue: 125840, expenses: 76300 },
  ],
  appointmentsByService: [
    { name: "Limpeza de Pele", value: 35, color: "#0088FE" },
    { name: "Botox", value: 28, color: "#00C49F" },
    { name: "Preenchimento", value: 20, color: "#FFBB28" },
    { name: "Laser", value: 12, color: "#FF8042" },
    { name: "Outros", value: 5, color: "#8884D8" },
  ],
  waitTimesByPeriod: [
    { period: "08-10h", averageTime: 8, appointments: 12 },
    { period: "10-12h", averageTime: 15, appointments: 18 },
    { period: "12-14h", averageTime: 12, appointments: 8 },
    { period: "14-16h", averageTime: 10, appointments: 16 },
    { period: "16-18h", averageTime: 18, appointments: 14 },
    { period: "18-20h", averageTime: 14, appointments: 6 },
  ],
};

export function AnalyticsDashboard() {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Analytics
          </h1>
          <p className="text-muted-foreground">
            Visão completa dos indicadores de performance da clínica
          </p>
        </div>
        <Button
          onClick={() => setShowExportModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          📊 Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="clinical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clinical">KPIs Clínicos</TabsTrigger>
          <TabsTrigger value="operational">KPIs Operacionais</TabsTrigger>
          <TabsTrigger value="financial">KPIs Financeiros</TabsTrigger>
        </TabsList>

        {/* KPIs Clínicos */}
        <TabsContent value="clinical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Satisfação do Paciente"
              value={kpiData.clinical.patientSatisfaction.value}
              change={kpiData.clinical.patientSatisfaction.change}
              trend={kpiData.clinical.patientSatisfaction.trend}
              format="percentage"
              icon="😊"
            />
            <KPICard
              title="Taxa de Conclusão"
              value={kpiData.clinical.appointmentCompletion.value}
              change={kpiData.clinical.appointmentCompletion.change}
              trend={kpiData.clinical.appointmentCompletion.trend}
              format="percentage"
              icon="✅"
            />
            <KPICard
              title="Sucesso dos Tratamentos"
              value={kpiData.clinical.treatmentSuccess.value}
              change={kpiData.clinical.treatmentSuccess.change}
              trend={kpiData.clinical.treatmentSuccess.trend}
              format="percentage"
              icon="🎯"
            />
            <KPICard
              title="Adesão ao Follow-up"
              value={kpiData.clinical.followUpAdherence.value}
              change={kpiData.clinical.followUpAdherence.change}
              trend={kpiData.clinical.followUpAdherence.trend}
              format="percentage"
              icon="📋"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Satisfação do Paciente</CardTitle>
                <CardDescription>
                  Tendência mensal da satisfação dos pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    📈 Gráfico de Linha - Tendência de Satisfação
                  </div>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <p>Gráfico interativo em desenvolvimento</p>
                      <p className="text-sm text-muted-foreground">
                        Dados: {chartData.patientSatisfactionTrend.length}{" "}
                        pontos temporais
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Serviços</CardTitle>
                <CardDescription>
                  Proporção de agendamentos por tipo de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    🥧 Gráfico de Pizza - Distribuição por Serviço
                  </div>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📈</div>
                      <p>Gráfico interativo em desenvolvimento</p>
                      <p className="text-sm text-muted-foreground">
                        Dados: {chartData.appointmentsByService.length}{" "}
                        categorias de serviços
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KPIs Operacionais */}
        <TabsContent value="operational" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Tempo Médio de Espera"
              value={kpiData.operational.averageWaitTime.value}
              change={kpiData.operational.averageWaitTime.change}
              trend={kpiData.operational.averageWaitTime.trend}
              format="time"
              icon="⏱️"
            />
            <KPICard
              title="Utilização da Equipe"
              value={kpiData.operational.staffUtilization.value}
              change={kpiData.operational.staffUtilization.change}
              trend={kpiData.operational.staffUtilization.trend}
              format="percentage"
              icon="👥"
            />
            <KPICard
              title="Eficiência dos Agendamentos"
              value={kpiData.operational.appointmentEfficiency.value}
              change={kpiData.operational.appointmentEfficiency.change}
              trend={kpiData.operational.appointmentEfficiency.trend}
              format="percentage"
              icon="📅"
            />
            <KPICard
              title="Utilização de Recursos"
              value={kpiData.operational.resourceUtilization.value}
              change={kpiData.operational.resourceUtilization.change}
              trend={kpiData.operational.resourceUtilization.trend}
              format="percentage"
              icon="🏥"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tempo de Espera por Período</CardTitle>
                <CardDescription>
                  Análise dos tempos de espera ao longo do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    📊 Gráfico de Barras - Tempo de Espera x Período
                  </div>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">⏱️</div>
                      <p>Análise de tempo de espera por horário</p>
                      <p className="text-sm text-muted-foreground">
                        Dados: {chartData.waitTimesByPeriod.length} períodos do
                        dia
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiência de Agendamentos</CardTitle>
                <CardDescription>
                  Correlação entre períodos e utilização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    📈 Gráfico de Área - Agendamentos por Período
                  </div>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📅</div>
                      <p>Distribuição de agendamentos no dia</p>
                      <p className="text-sm text-muted-foreground">
                        Otimização baseada em dados históricos
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KPIs Financeiros */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Receita Mensal"
              value={kpiData.financial.monthlyRevenue.value}
              change={kpiData.financial.monthlyRevenue.change}
              trend={kpiData.financial.monthlyRevenue.trend}
              format="currency"
              icon="💰"
            />
            <KPICard
              title="Receita por Paciente"
              value={kpiData.financial.revenuePerPatient.value}
              change={kpiData.financial.revenuePerPatient.change}
              trend={kpiData.financial.revenuePerPatient.trend}
              format="currency"
              icon="👤"
            />
            <KPICard
              title="Custo por Aquisição"
              value={kpiData.financial.costPerAcquisition.value}
              change={kpiData.financial.costPerAcquisition.change}
              trend={kpiData.financial.costPerAcquisition.trend}
              format="currency"
              icon="📈"
            />
            <KPICard
              title="Margem de Lucro"
              value={kpiData.financial.profitMargin.value}
              change={kpiData.financial.profitMargin.change}
              trend={kpiData.financial.profitMargin.trend}
              format="percentage"
              icon="📊"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Receita</CardTitle>
                <CardDescription>
                  Comparação receita vs despesas mensais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    📊 Gráfico de Barras - Receita x Despesas
                  </div>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <p>Análise de crescimento mensal</p>
                      <p className="text-sm text-muted-foreground">
                        Dados: {chartData.revenueGrowth.length} meses
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projeções de Receita</CardTitle>
                <CardDescription>
                  Previsões baseadas em tendências históricas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    📈 Gráfico de Linha - Projeções Futuras
                  </div>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <p>Modelo preditivo de receita</p>
                      <p className="text-sm text-muted-foreground">
                        IA aplicada ao planejamento financeiro
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={{
          kpis: kpiData,
          charts: {},
          activeTab: "clinical",
        }}
      />
    </div>
  );
}
