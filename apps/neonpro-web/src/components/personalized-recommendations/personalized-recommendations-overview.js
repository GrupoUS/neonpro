"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizedRecommendationsOverview = PersonalizedRecommendationsOverview;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var mockRecommendations = [
    {
        id: "1",
        title: "Otimizar agendamentos para tarde",
        description: "Análise mostra 40% mais conversões em agendamentos para período da tarde",
        type: "operation",
        priority: "high",
        impact: "Aumento de 25% na receita",
        confidence: 87,
    },
    {
        id: "2",
        title: "Programa de fidelidade para clientes VIP",
        description: "Clientes com 5+ procedimentos têm 60% mais probabilidade de indicar",
        type: "marketing",
        priority: "medium",
        impact: "Redução de 15% no CAC",
        confidence: 92,
    },
    {
        id: "3",
        title: "Pacote promocional para janeiro",
        description: "Histórico mostra queda de 30% na demanda pós-festas",
        type: "finance",
        priority: "high",
        impact: "Manutenção do faturamento",
        confidence: 78,
    },
];
var typeColors = {
    treatment: "bg-blue-100 text-blue-800",
    marketing: "bg-green-100 text-green-800",
    operation: "bg-purple-100 text-purple-800",
    finance: "bg-orange-100 text-orange-800",
};
var priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-800",
};
function PersonalizedRecommendationsOverview() {
    return (<div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Recomendações Ativas
            </card_1.CardTitle>
            <lucide_react_1.Brain className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 esta semana</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Taxa de Implementação
            </card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Impacto Médio</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">+23%</div>
            <p className="text-xs text-muted-foreground">
              Aumento na conversão
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Próxima Análise
            </card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">2 dias</div>
            <p className="text-xs text-muted-foreground">Análise semanal</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Recomendações Prioritárias</card_1.CardTitle>
          <card_1.CardDescription>
            Insights baseados em IA para otimizar sua clínica
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {mockRecommendations.map(function (rec) { return (<div key={rec.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <badge_1.Badge className={typeColors[rec.type]}>
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </badge_1.Badge>
                    <badge_1.Badge className={priorityColors[rec.priority]}>
                      {rec.priority.charAt(0).toUpperCase() +
                rec.priority.slice(1)}
                    </badge_1.Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-green-600">
                      {rec.impact}
                    </span>
                    <span className="text-muted-foreground">
                      Confiança: {rec.confidence}%
                    </span>
                  </div>
                </div>
                <div className="space-x-2">
                  <button_1.Button variant="outline" size="sm">
                    Ver Detalhes
                  </button_1.Button>
                  <button_1.Button size="sm">Implementar</button_1.Button>
                </div>
              </div>); })}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
exports.default = PersonalizedRecommendationsOverview;
