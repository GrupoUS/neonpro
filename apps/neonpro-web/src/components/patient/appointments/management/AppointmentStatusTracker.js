"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatusTracker = AppointmentStatusTracker;
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
function AppointmentStatusTracker(_a) {
  var upcomingCount = _a.upcomingCount,
    pastCount = _a.pastCount,
    noShowPattern = _a.noShowPattern,
    cancellationStats = _a.cancellationStats,
    cancellationPolicies = _a.cancellationPolicies;
  // Calculate engagement metrics
  var totalAppointments = pastCount + upcomingCount;
  var attendanceRate = Math.max(0, 100 - noShowPattern.rate);
  var reliabilityScore = Math.max(0, 100 - cancellationStats.rate - noShowPattern.rate);
  // Health score calculation (based on Tavily research benchmarks)
  var getHealthScore = () => {
    var score = 100;
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
  var healthScore = getHealthScore();
  // Get performance badges
  var getPerformanceBadges = () => {
    var badges = [];
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
  var performanceBadges = getPerformanceBadges();
  // Improvement recommendations based on Exa research
  var getRecommendations = () => {
    var recommendations = [];
    if (noShowPattern.rate > 27) {
      recommendations.push({
        type: "warning",
        icon: lucide_react_1.AlertTriangle,
        title: "Taxa de faltas acima da média",
        description: "Sua taxa de ".concat(
          noShowPattern.rate.toFixed(1),
          "% est\u00E1 acima da m\u00E9dia nacional (27%). Configure lembretes autom\u00E1ticos.",
        ),
        action: "Ativar lembretes",
      });
    }
    if (cancellationStats.rate > 30) {
      recommendations.push({
        type: "info",
        icon: lucide_react_1.Calendar,
        title: "Muitos cancelamentos",
        description: "Considere agendar com mais antecedência para evitar conflitos.",
        action: "Melhorar planejamento",
      });
    }
    if (upcomingCount === 0) {
      recommendations.push({
        type: "success",
        icon: lucide_react_1.Target,
        title: "Oportunidade de agendamento",
        description: "Você não tem agendamentos futuros. Mantenha sua rotina de cuidados.",
        action: "Agendar consulta",
      });
    }
    return recommendations;
  };
  var recommendations = getRecommendations();
  var getScoreColor = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  var getScoreDescription = (score) => {
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
        <card_1.Card>
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Score de Engajamento
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={"text-3xl font-bold ".concat(getScoreColor(healthScore))}>
                  {healthScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreDescription(healthScore)}
              </div>
              <progress_1.Progress value={healthScore} className="h-2" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Comparecimento
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{attendanceRate.toFixed(1)}%</span>
                {attendanceRate >= 85
                  ? <lucide_react_1.TrendingUp className="h-5 w-5 text-green-500" />
                  : <lucide_react_1.TrendingDown className="h-5 w-5 text-red-500" />}
              </div>
              <div className="text-sm text-muted-foreground">
                {noShowPattern.rate.toFixed(1)}% de faltas (média: 27%)
              </div>
              <progress_1.Progress value={attendanceRate} className="h-2" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
              Confiabilidade
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{reliabilityScore.toFixed(0)}%</span>
                <lucide_react_1.Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-sm text-muted-foreground">
                Baseado em {totalAppointments} agendamentos
              </div>
              <progress_1.Progress value={reliabilityScore} className="h-2" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Performance Badges */}
      {performanceBadges.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg flex items-center gap-2">
              <lucide_react_1.Target className="h-5 w-5" />
              Conquistas
            </card_1.CardTitle>
            <card_1.CardDescription>
              Seus marcos de engajamento e performance
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex flex-wrap gap-2">
              {performanceBadges.map((badge, index) => (
                <badge_1.Badge key={index} variant={badge.variant} className={badge.className}>
                  {badge.label}
                </badge_1.Badge>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cancellation Breakdown */}
        {cancellationStats.rate > 0 && (
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg flex items-center gap-2">
                <lucide_react_1.XCircle className="h-5 w-5 text-orange-500" />
                Análise de Cancelamentos
              </card_1.CardTitle>
              <card_1.CardDescription>
                Taxa: {cancellationStats.rate.toFixed(1)}% dos agendamentos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {Object.entries(cancellationStats.reasonBreakdown).map((_a) => {
                var reason = _a[0],
                  percentage = _a[1];
                return (
                  <div key={reason} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{reason.replace("_", " ")}</span>
                      <span>{percentage}%</span>
                    </div>
                    <progress_1.Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </card_1.CardContent>
          </card_1.Card>
        )}

        {/* Appointment Timeline */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg flex items-center gap-2">
              <lucide_react_1.Calendar className="h-5 w-5 text-blue-500" />
              Visão Geral
            </card_1.CardTitle>
            <card_1.CardDescription>Resumo dos seus agendamentos</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
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
                  <lucide_react_1.Clock className="h-3 w-3" />
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
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-5 w-5 text-green-500" />
              Recomendações Personalizadas
            </card_1.CardTitle>
            <card_1.CardDescription>
              Sugestões baseadas no seu histórico de agendamentos
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {recommendations.map((rec, index) => {
              var Icon = rec.icon;
              var colorClass =
                rec.type === "warning"
                  ? "text-orange-500"
                  : rec.type === "info"
                    ? "text-blue-500"
                    : "text-green-500";
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Icon className={"h-5 w-5 ".concat(colorClass, " flex-shrink-0 mt-0.5")} />
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{rec.title}</div>
                    <div className="text-xs text-muted-foreground">{rec.description}</div>
                    <badge_1.Badge variant="outline" className="text-xs">
                      {rec.action}
                    </badge_1.Badge>
                  </div>
                </div>
              );
            })}
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        Análise baseada em dados da indústria de saúde • Última atualização:{" "}
        {new Date().toLocaleDateString("pt-BR")}
      </div>
    </div>
  );
}
