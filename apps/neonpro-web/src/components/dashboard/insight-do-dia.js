"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightDoDia = InsightDoDia;
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
// Dados mock baseados na interface
var mockInsight = {
    title: "Oportunidade de Otimização Detectada",
    description: "Nossa IA identificou que agendamentos às terças-feiras têm 23% menos cancelamentos. Considere promover horários específicos para aumentar a taxa de comparecimento e otimizar a agenda.",
    actionText: "Otimizar Agenda"
};
function InsightDoDia() {
    return (<alert_1.Alert className="border-primary/20 bg-primary/5">
      <lucide_react_1.LightbulbIcon className="h-5 w-5 text-primary"/>
      <alert_1.AlertTitle className="text-primary font-semibold">
        {mockInsight.title}
      </alert_1.AlertTitle>
      <alert_1.AlertDescription className="text-muted-foreground mt-2">
        {mockInsight.description}
      </alert_1.AlertDescription>
      <div className="mt-4">
        <button_1.Button size="sm" className="bg-primary hover:bg-primary/90">
          {mockInsight.actionText}
        </button_1.Button>
      </div>
    </alert_1.Alert>);
}
