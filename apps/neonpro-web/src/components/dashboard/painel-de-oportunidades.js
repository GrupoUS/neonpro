"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PainelDeOportunidades = PainelDeOportunidades;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
// Dados mock baseados na interface
var mockOpportunities = [
  {
    icon: <lucide_react_1.MessageCircleIcon className="h-4 w-4 text-blue-600" />,
    description: "3 pacientes não responderam às mensagens de confirmação",
    actionText: "Enviar Lembrete",
    priority: "high",
  },
  {
    icon: <lucide_react_1.TrendingUpIcon className="h-4 w-4 text-green-600" />,
    description: "Horário de 16h disponível - alta demanda histórica",
    actionText: "Promover Horário",
    priority: "medium",
  },
  {
    icon: <lucide_react_1.BrainIcon className="h-4 w-4 text-purple-600" />,
    description: "Ana Silva pode estar interessada em tratamento complementar",
    actionText: "Sugerir Serviço",
    priority: "low",
  },
];
function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "border-l-red-500";
    case "medium":
      return "border-l-yellow-500";
    case "low":
      return "border-l-green-500";
    default:
      return "border-l-gray-300";
  }
}
function PainelDeOportunidades() {
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg flex items-center gap-2">
          <lucide_react_1.BrainIcon className="h-5 w-5 text-primary" />
          Oportunidades (IA)
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-3">
          {mockOpportunities.map(function (opportunity, index) {
            return (
              <div
                key={index}
                className={"flex items-start space-x-3 p-3 rounded-lg border-l-2 bg-muted/30 ".concat(
                  getPriorityColor(opportunity.priority),
                )}
              >
                <div className="flex-shrink-0 mt-0.5">{opportunity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium text-primary hover:text-primary/80"
                  >
                    {opportunity.actionText}
                    <lucide_react_1.ChevronRightIcon className="h-3 w-3 ml-1" />
                  </button_1.Button>
                </div>
              </div>
            );
          })}
        </div>

        {mockOpportunities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <lucide_react_1.BrainIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma oportunidade identificada</p>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
