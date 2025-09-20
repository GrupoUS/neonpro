import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePricingRules, usePricingStats } from "@/hooks/usePricingRules";
import { Activity, DollarSign, Target, TrendingDown } from "lucide-react";

interface PricingRuleStatsProps {
  clinicId: string;
}

export function PricingRuleStats({ clinicId }: PricingRuleStatsProps) {
  const { data: stats, isLoading: statsLoading } = usePricingStats(clinicId);
  const { data: rules = [], isLoading: rulesLoading } =
    usePricingRules(clinicId);

  if (statsLoading || rulesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeRules = rules.filter((rule) => rule.is_active);
  const inactiveRules = rules.filter((rule) => !rule.is_active);

  // Calculate rule type distribution
  const ruleTypeDistribution = rules.reduce(
    (acc, rule) => {
      acc[rule.rule_type] = (acc[rule.rule_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Calculate adjustment type distribution
  const adjustmentTypeDistribution = rules.reduce(
    (acc, rule) => {
      acc[rule.adjustment.type] = (acc[rule.adjustment.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      time_based: "Baseada em Tempo",
      professional_specific: "Específica do Profissional",
      service_specific: "Específica do Serviço",
      client_loyalty: "Fidelidade do Cliente",
      bulk_discount: "Desconto em Lote",
      seasonal: "Sazonal",
      first_time_client: "Primeiro Atendimento",
      conditional: "Condicional",
    };
    return labels[type] || type;
  };

  const getRuleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      time_based: "bg-blue-100 text-blue-800",
      professional_specific: "bg-green-100 text-green-800",
      service_specific: "bg-purple-100 text-purple-800",
      client_loyalty: "bg-yellow-100 text-yellow-800",
      bulk_discount: "bg-orange-100 text-orange-800",
      seasonal: "bg-pink-100 text-pink-800",
      first_time_client: "bg-indigo-100 text-indigo-800",
      conditional: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Regras
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeRules.length} ativas, {inactiveRules.length} inativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {rules.length > 0
                ? Math.round((activeRules.length / rules.length) * 100)
                : 0}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Desconto Médio
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_discount ? `${stats.avg_discount.toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em regras percentuais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Economia Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {stats?.total_savings ? stats.total_savings.toFixed(2) : "0,00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Economia gerada pelas regras
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rule Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Tipo de Regra</CardTitle>
          <CardDescription>Quantidade de regras por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(ruleTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getRuleTypeColor(type)}>
                    {getRuleTypeLabel(type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {count} regra{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={(count / rules.length) * 100}
                    className="w-20"
                  />
                  <span className="text-sm font-medium">
                    {Math.round((count / rules.length) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Ajuste</CardTitle>
          <CardDescription>
            Distribuição entre ajustes percentuais e valores fixos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(adjustmentTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={type === "percentage" ? "default" : "secondary"}
                  >
                    {type === "percentage" ? "Percentual" : "Valor Fixo"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {count} regra{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={(count / rules.length) * 100}
                    className="w-20"
                  />
                  <span className="text-sm font-medium">
                    {Math.round((count / rules.length) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Prioridades</CardTitle>
          <CardDescription>
            Regras organizadas por nível de prioridade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                label: "Alta Prioridade (80-100)",
                min: 80,
                max: 100,
                color: "bg-red-100 text-red-800",
              },
              {
                label: "Média Prioridade (50-79)",
                min: 50,
                max: 79,
                color: "bg-yellow-100 text-yellow-800",
              },
              {
                label: "Baixa Prioridade (1-49)",
                min: 1,
                max: 49,
                color: "bg-green-100 text-green-800",
              },
            ].map((range) => {
              const count = rules.filter(
                (rule) =>
                  rule.priority >= range.min && rule.priority <= range.max,
              ).length;

              return (
                <div
                  key={range.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Badge className={range.color}>{range.label}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {count} regra{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={
                        rules.length > 0 ? (count / rules.length) * 100 : 0
                      }
                      className="w-20"
                    />
                    <span className="text-sm font-medium">
                      {rules.length > 0
                        ? Math.round((count / rules.length) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
