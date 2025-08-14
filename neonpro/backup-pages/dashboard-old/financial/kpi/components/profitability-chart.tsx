"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

type DateRange = "7d" | "30d" | "90d" | "12m" | "ytd";

interface ProfitabilityChartProps {
  dateRange: DateRange;
}

export function ProfitabilityChart({ dateRange }: ProfitabilityChartProps) {
  const getChartData = () => {
    if (dateRange === "7d") {
      return [
        { date: "22/01", margemBruta: 42.5, margemLiquida: 38.2, margemOperacional: 40.1 },
        { date: "23/01", margemBruta: 45.1, margemLiquida: 41.3, margemOperacional: 43.2 },
        { date: "24/01", margemBruta: 41.8, margemLiquida: 37.9, margemOperacional: 39.8 },
        { date: "25/01", margemBruta: 47.2, margemLiquida: 43.5, margemOperacional: 45.3 },
        { date: "26/01", margemBruta: 39.7, margemLiquida: 35.8, margemOperacional: 37.7 },
        { date: "27/01", margemBruta: 48.9, margemLiquida: 45.2, margemOperacional: 47.1 },
        { date: "28/01", margemBruta: 44.6, margemLiquida: 40.8, margemOperacional: 42.7 }
      ];
    }
    
    return [
      { date: "Sem 1", margemBruta: 43.2, margemLiquida: 39.5, margemOperacional: 41.3 },
      { date: "Sem 2", margemBruta: 46.8, margemLiquida: 42.1, margemOperacional: 44.5 },
      { date: "Sem 3", margemBruta: 41.5, margemLiquida: 37.8, margemOperacional: 39.7 },
      { date: "Sem 4", margemBruta: 48.1, margemLiquida: 44.3, margemOperacional: 46.2 },
      { date: "Sem 5", margemBruta: 45.7, margemLiquida: 41.9, margemOperacional: 43.8 }
    ];
  };  const chartData = getChartData();

  const chartConfig = {
    margemBruta: {
      label: "Margem Bruta",
      color: "hsl(var(--chart-1))",
    },
    margemLiquida: {
      label: "Margem Líquida",
      color: "hsl(var(--chart-2))",
    },
    margemOperacional: {
      label: "Margem Operacional",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const avgMargemLiquida = (chartData.reduce((acc, curr) => acc + curr.margemLiquida, 0) / chartData.length).toFixed(1);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Análise de Lucratividade</CardTitle>
          <CardDescription>
            Evolução das margens de lucro (Média líquida: {avgMargemLiquida}%)
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Tendência</span>
            <span className="text-lg font-bold leading-none sm:text-3xl flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              +2.3%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatPercentage}
              domain={[30, 50]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Período: ${label}`}
                  formatter={(value, name) => [
                    formatPercentage(Number(value)),
                    name === 'margemBruta' ? 'Margem Bruta' :
                    name === 'margemLiquida' ? 'Margem Líquida' : 'Margem Operacional'
                  ]}
                />
              }
            />
            <Line
              dataKey="margemBruta"
              type="monotone"
              stroke="var(--color-margemBruta)"
              strokeWidth={2}
              dot={{ fill: "var(--color-margemBruta)" }}
            />
            <Line
              dataKey="margemOperacional"
              type="monotone"
              stroke="var(--color-margemOperacional)"
              strokeWidth={2}
              dot={{ fill: "var(--color-margemOperacional)" }}
            />
            <Line
              dataKey="margemLiquida"
              type="monotone"
              stroke="var(--color-margemLiquida)"
              strokeWidth={2}
              dot={{ fill: "var(--color-margemLiquida)" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}