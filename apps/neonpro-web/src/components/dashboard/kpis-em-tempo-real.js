Object.defineProperty(exports, "__esModule", { value: true });
exports.KpisEmTempoReal = KpisEmTempoReal;
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
// Dados mock baseados na interface
var mockKpis = [
  {
    title: "Faturamento",
    value: "R$ 12.840",
    icon: <lucide_react_1.DollarSignIcon className="h-5 w-5 text-green-600" />,
    trend: "+18%",
  },
  {
    title: "Atendimentos",
    value: "23",
    icon: <lucide_react_1.UsersIcon className="h-5 w-5 text-blue-600" />,
    trend: "+5%",
  },
  {
    title: "Taxa Conversão",
    value: "89%",
    icon: <lucide_react_1.TrendingUpIcon className="h-5 w-5 text-purple-600" />,
    trend: "+12%",
  },
];
function KpisEmTempoReal() {
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">KPIs do Dia</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="grid grid-cols-1 gap-4">
          {mockKpis.map((kpi, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center space-x-3">
                {kpi.icon}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </div>
              {kpi.trend && <div className="text-sm font-medium text-green-600">{kpi.trend}</div>}
            </div>
          ))}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
