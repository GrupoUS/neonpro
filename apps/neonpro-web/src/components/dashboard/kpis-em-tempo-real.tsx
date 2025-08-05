import type { DollarSignIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Interface para o KPI
interface Kpi {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

// Dados mock baseados na interface
const mockKpis: Kpi[] = [
  {
    title: "Faturamento",
    value: "R$ 12.840",
    icon: <DollarSignIcon className="h-5 w-5 text-green-600" />,
    trend: "+18%",
  },
  {
    title: "Atendimentos",
    value: "23",
    icon: <UsersIcon className="h-5 w-5 text-blue-600" />,
    trend: "+5%",
  },
  {
    title: "Taxa Conversão",
    value: "89%",
    icon: <TrendingUpIcon className="h-5 w-5 text-purple-600" />,
    trend: "+12%",
  },
];

export function KpisEmTempoReal() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">KPIs do Dia</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
