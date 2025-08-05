"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaPreditiva = AgendaPreditiva;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
// Dados mock baseados na interface
var mockAppointments = [
  {
    time: "09:00",
    patientName: "Ana Silva",
    serviceName: "Botox Facial",
    status: "Confirmado",
    noShowRisk: "low",
  },
  {
    time: "10:30",
    patientName: "Maria Santos",
    serviceName: "Preenchimento Labial",
    status: "Confirmado",
    noShowRisk: "medium",
  },
  {
    time: "14:00",
    patientName: "Carla Oliveira",
    serviceName: "Limpeza de Pele",
    status: "Aguardando",
    noShowRisk: "high",
  },
  {
    time: "15:30",
    patientName: "Juliana Costa",
    serviceName: "Microagulhamento",
    status: "Confirmado",
    noShowRisk: "low",
  },
  {
    time: "17:00",
    patientName: "Patricia Lima",
    serviceName: "Bioestimulador",
    status: "Aguardando",
    noShowRisk: "medium",
  },
];
// Função para determinar a cor do círculo de risco
function getRiskColor(risk) {
  switch (risk) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
} // Função para determinar a variante do badge baseada no status
function getStatusVariant(status) {
  switch (status) {
    case "Confirmado":
      return "default";
    case "Aguardando":
      return "secondary";
    default:
      return "outline";
  }
}
function AgendaPreditiva() {
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.CalendarIcon className="h-5 w-5 text-primary" />
            Agenda do Dia
          </card_1.CardTitle>
          <card_1.CardDescription>
            Agendamentos de hoje com análise preditiva
          </card_1.CardDescription>
        </div>
        <button_1.Button variant="outline" size="sm">
          <lucide_react_1.ExternalLinkIcon className="h-4 w-4 mr-2" />
          Ver Agenda Completa
        </button_1.Button>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {mockAppointments.map(function (appointment, index) {
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-mono font-medium text-primary">
                    {appointment.time}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={"w-2 h-2 rounded-full ".concat(
                        getRiskColor(appointment.noShowRisk),
                      )}
                      title={"Risco de no-show: ".concat(appointment.noShowRisk)}
                    />
                    <div>
                      <p className="font-medium text-sm">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.serviceName}</p>
                    </div>
                  </div>
                </div>
                <badge_1.Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status}
                </badge_1.Badge>
              </div>
            );
          })}
        </div>

        {mockAppointments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <lucide_react_1.CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum agendamento para hoje</p>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
