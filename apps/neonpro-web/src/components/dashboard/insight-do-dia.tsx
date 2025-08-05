import type { LightbulbIcon } from "lucide-react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";

// Interface para o Insight do Dia
interface AIInsight {
  title: string;
  description: string;
  actionText: string;
}

// Dados mock baseados na interface
const mockInsight: AIInsight = {
  title: "Oportunidade de Otimização Detectada",
  description:
    "Nossa IA identificou que agendamentos às terças-feiras têm 23% menos cancelamentos. Considere promover horários específicos para aumentar a taxa de comparecimento e otimizar a agenda.",
  actionText: "Otimizar Agenda",
};

export function InsightDoDia() {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <LightbulbIcon className="h-5 w-5 text-primary" />
      <AlertTitle className="text-primary font-semibold">{mockInsight.title}</AlertTitle>
      <AlertDescription className="text-muted-foreground mt-2">
        {mockInsight.description}
      </AlertDescription>
      <div className="mt-4">
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          {mockInsight.actionText}
        </Button>
      </div>
    </Alert>
  );
}
