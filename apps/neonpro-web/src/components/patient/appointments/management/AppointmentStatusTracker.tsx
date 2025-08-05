"use client";

import type {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { Badge } from "@/components/ui/badge";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { CancellationPolicies } from "@/hooks/patient/usePatientAppointments";

/**
 * Appointment Status Tracker Component for NeonPro
 *
 * Based on VIBECODE MCP Research:
 * - Context7: React analytics dashboard patterns
 * - Tavily: Healthcare engagement metrics (27% avg no-show, 60% reduction with reminders)
 * - Exa: Patient behavior analytics and performance tracking
 */

interface NoShowPattern {
  rate: number;
  commonReasons: string[];
}

interface CancellationStats {
  rate: number;
  reasonBreakdown: Record<string, number>;
}

interface AppointmentStatusTrackerProps {
  upcomingCount: number;
  pastCount: number;
  noShowPattern: NoShowPattern;
  cancellationStats: CancellationStats;
  cancellationPolicies: CancellationPolicies | null;
}

export function AppointmentStatusTracker({
  upcomingCount,
  pastCount,
  noShowPattern,
  cancellationStats,
  cancellationPolicies,
}: AppointmentStatusTrackerProps) {
  // Calculate engagement metrics
  const totalAppointments = pastCount + upcomingCount;
  const attendanceRate = Math.max(0, 100 - noShowPattern.rate);
  const reliabilityScore = Math.max(0, 100 - cancellationStats.rate - noShowPattern.rate);

  // Health score calculation (based on Tavily research benchmarks)
  const getHealthScore = () => {
    let score = 100;

    // Penalty for high no-show rate (industry avg: 27%)
    if (noShowPattern.rate > 27) {
      score -= (noShowPattern.rate - 27) * 2;
    }

    // Penalty for high cancellation rate
    if (cancellationStats.rate > 20) {
      score -= (cancellationStats.rate - 20) * 1.5;
    }

    // Bonus for consistency (multiple appointments)
    if (totalAppointments > 5) {
      score += Math.min(10, Math.floor(totalAppointments / 5));
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = getHealthScore();

  // Get performance badges
  const getPerformanceBadges = () => {
    const badges = [];

    if (attendanceRate >= 95) {
      badges.push({
        label: "Pontual Exemplar",
        variant: "default",
        className: "bg-green-100 text-green-800",
      });
    } else if (attendanceRate >= 85) {
      badges.push({ label: "Bom Comparecimento", variant: "secondary" });
    }

    if (cancellationStats.rate <= 10) {
      badges.push({ label: "Planejamento Eficiente", variant: "outline" });
    }

    if (totalAppointments >= 10) {
      badges.push({ label: "Paciente Frequente", variant: "outline" });
    }

    if (noShowPattern.rate === 0 && pastCount > 0) {
      badges.push({
        label: "Zero Faltas",
        variant: "default",
        className: "bg-blue-100 text-blue-800",
      });
    }

    return badges;
  };

  const performanceBadges = getPerformanceBadges();

  // Improvement recommendations based on Exa research
  const getRecommendations = () => {
    const recommendations = [];

    if (noShowPattern.rate > 27) {
      recommendations.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Taxa de faltas acima da média",
        description: `Sua taxa de ${noShowPattern.rate.toFixed(1)}% está acima da média nacional (27%). Configure lembretes automáticos.`,
        action: "Ativar lembretes",
      });
    }

    if (cancellationStats.rate > 30) {
      recommendations.push({
        type: "info",
        icon: Calendar,
        title: "Muitos cancelamentos",
        description: "Considere agendar com mais antecedência para evitar conflitos.",
        action: "Melhorar planejamento",
      });
    }

    if (upcomingCount === 0) {
      recommendations.push({
        type: "success",
        icon: Target,
        title: "Oportunidade de agendamento",
        description: "Você não tem agendamentos futuros. Mantenha sua rotina de cuidados.",
        action: "Agendar consulta",
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muito Bom";
    if (score >= 70) return "Bom";
    if (score >= 60) return "Regular";
    return "Precisa Melhorar";
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score de Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
                  {healthScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreDescription(healthScore)}
              </div>
              <Progress value={healthScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Comparecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{attendanceRate.toFixed(1)}%</span>
                {attendanceRate >= 85 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {noShowPattern.rate.toFixed(1)}% de faltas (média: 27%)
              </div>
              <Progress value={attendanceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confiabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{reliabilityScore.toFixed(0)}%</span>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-sm text-muted-foreground">
                Baseado em {totalAppointments} agendamentos
              </div>
              <Progress value={reliabilityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Badges */}
      {performanceBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conquistas
            </CardTitle>
            <CardDescription>Seus marcos de engajamento e performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {performanceBadges.map((badge, index) => (
                <Badge key={index} variant={badge.variant as any} className={badge.className}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cancellation Breakdown */}
        {cancellationStats.rate > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                Análise de Cancelamentos
              </CardTitle>
              <CardDescription>
                Taxa: {cancellationStats.rate.toFixed(1)}% dos agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(cancellationStats.reasonBreakdown).map(([reason, percentage]) => (
                <div key={reason} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{reason.replace("_", " ")}</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Appointment Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Visão Geral
            </CardTitle>
            <CardDescription>Resumo dos seus agendamentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
                <div className="text-xs text-muted-foreground">Próximos</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{pastCount}</div>
                <div className="text-xs text-muted-foreground">Histórico</div>
              </div>
            </div>

            {/* Policy reminder */}
            {cancellationPolicies && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs">
                <div className="font-medium flex items-center gap-1 mb-2">
                  <Clock className="h-3 w-3" />
                  Política de Cancelamento
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div>• Cancelamento: {cancellationPolicies.minimum_hours}h antecedência</div>
                  <div>• Reagendamento: 48h antecedência</div>
                  {cancellationPolicies.fee_applies && (
                    <div>• Taxa tardio: R$ {cancellationPolicies.fee_amount.toFixed(2)}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Recomendações Personalizadas
            </CardTitle>
            <CardDescription>Sugestões baseadas no seu histórico de agendamentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              const colorClass =
                rec.type === "warning"
                  ? "text-orange-500"
                  : rec.type === "info"
                    ? "text-blue-500"
                    : "text-green-500";

              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Icon className={`h-5 w-5 ${colorClass} flex-shrink-0 mt-0.5`} />
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{rec.title}</div>
                    <div className="text-xs text-muted-foreground">{rec.description}</div>
                    <Badge variant="outline" className="text-xs">
                      {rec.action}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        Análise baseada em dados da indústria de saúde • Última atualização:{" "}
        {new Date().toLocaleDateString("pt-BR")}
      </div>
    </div>
  );
}
