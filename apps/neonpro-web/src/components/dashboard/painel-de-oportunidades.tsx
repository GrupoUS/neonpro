import type { BrainIcon, ChevronRightIcon, MessageCircleIcon, TrendingUpIcon } from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Interface para uma Oportunidade
interface Opportunity {
  icon: React.ReactNode;
  description: string;
  actionText: string;
  priority?: "high" | "medium" | "low";
}

// Dados mock baseados na interface
const mockOpportunities: Opportunity[] = [
  {
    icon: <MessageCircleIcon className="h-4 w-4 text-blue-600" />,
    description: "3 pacientes não responderam às mensagens de confirmação",
    actionText: "Enviar Lembrete",
    priority: "high",
  },
  {
    icon: <TrendingUpIcon className="h-4 w-4 text-green-600" />,
    description: "Horário de 16h disponível - alta demanda histórica",
    actionText: "Promover Horário",
    priority: "medium",
  },
  {
    icon: <BrainIcon className="h-4 w-4 text-purple-600" />,
    description: "Ana Silva pode estar interessada em tratamento complementar",
    actionText: "Sugerir Serviço",
    priority: "low",
  },
];

function getPriorityColor(priority: Opportunity["priority"]): string {
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
export function PainelDeOportunidades() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BrainIcon className="h-5 w-5 text-primary" />
          Oportunidades (IA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockOpportunities.map((opportunity, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg border-l-2 bg-muted/30 ${getPriorityColor(opportunity.priority)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{opportunity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-primary hover:text-primary/80"
                >
                  {opportunity.actionText}
                  <ChevronRightIcon className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {mockOpportunities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <BrainIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma oportunidade identificada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
