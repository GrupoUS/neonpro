"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

type DateRange = "7d" | "30d" | "90d" | "12m" | "ytd";

interface RevenueChartProps {
  dateRange: DateRange;
}

export function RevenueChart({ dateRange }: RevenueChartProps) {
  // Mock data - In real implementation, this would come from Supabase
  const getChartData = () => {
    if (dateRange === "7d") {
      return [
        { date: "2024-01-22", receita: 1850, meta: 2000 },
        { date: "2024-01-23", receita: 2100, meta: 2000 },
        { date: "2024-01-24", receita: 1950, meta: 2000 },
        { date: "2024-01-25", receita: 2200, meta: 2000 },
        { date: "2024-01-26", receita: 1780, meta: 2000 },
        { date: "2024-01-27", receita: 2350, meta: 2000 },
        { date: "2024-01-28", receita: 2150, meta: 2000 }
      ];
    }
    
    // 30 days data
    return [
      { date: "Sem 1", receita: 8500, meta: 10000 },
      { date: "Sem 2", receita: 12200, meta: 10000 },
      { date: "Sem 3", receita: 9800, meta: 10000 },
      { date: "Sem 4", receita: 11350, meta: 10000 },
      { date: "Sem 5", receita: 13200, meta: 10000 }
    ];
  };  const chartData = getChartData();

  const chartConfig = {
    receita: {
      label: "Receita",
      color: "hsl(var(--chart-1))",
    },
    meta: {
      label: "Meta",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalReceita = chartData.reduce((acc, curr) => acc + curr.receita, 0);
  const totalMeta = chartData.reduce((acc, curr) => acc + curr.meta, 0);
  const performance = ((totalReceita / totalMeta) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução da Receita</CardTitle>
        <CardDescription>
          Acompanhamento da receita vs meta ({performance}% da meta atingida)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Período: ${label}`}
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'receita' ? 'Receita' : 'Meta'
                  ]}
                />
              }
            />
            <Bar dataKey="receita" fill="var(--color-receita)" radius={4} />
            <Bar dataKey="meta" fill="var(--color-meta)" radius={4} opacity={0.6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}