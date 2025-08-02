"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

type DateRange = "7d" | "30d" | "90d" | "12m" | "ytd";

interface CashFlowChartProps {
  dateRange: DateRange;
}

export function CashFlowChart({ dateRange }: CashFlowChartProps) {
  const getChartData = () => {
    if (dateRange === "7d") {
      return [
        { date: "22/01", entradas: 2100, saidas: 1350, saldo: 750 },
        { date: "23/01", entradas: 1850, saidas: 1200, saldo: 650 },
        { date: "24/01", entradas: 2350, saidas: 1450, saldo: 900 },
        { date: "25/01", entradas: 1950, saidas: 1100, saldo: 850 },
        { date: "26/01", entradas: 2200, saidas: 1600, saldo: 600 },
        { date: "27/01", entradas: 2450, saidas: 1350, saldo: 1100 },
        { date: "28/01", entradas: 2050, saidas: 1250, saldo: 800 }
      ];
    }
    
    return [
      { date: "Sem 1", entradas: 12500, saidas: 8200, saldo: 4300 },
      { date: "Sem 2", entradas: 15200, saidas: 9800, saldo: 5400 },
      { date: "Sem 3", entradas: 11800, saidas: 7900, saldo: 3900 },
      { date: "Sem 4", entradas: 14600, saidas: 9200, saldo: 5400 },
      { date: "Sem 5", entradas: 13900, saidas: 8600, saldo: 5300 }
    ];
  };  const chartData = getChartData();

  const chartConfig = {
    entradas: {
      label: "Entradas",
      color: "hsl(var(--chart-1))",
    },
    saidas: {
      label: "Saídas",
      color: "hsl(var(--chart-2))",
    },
    saldo: {
      label: "Saldo",
      color: "hsl(var(--chart-3))",
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

  const totalEntradas = chartData.reduce((acc, curr) => acc + curr.entradas, 0);
  const totalSaidas = chartData.reduce((acc, curr) => acc + curr.saidas, 0);
  const saldoTotal = totalEntradas - totalSaidas;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>
          Entradas vs Saídas (Saldo acumulado: {formatCurrency(saldoTotal)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <AreaChart accessibilityLayer data={chartData}>
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
              tickFormatter={formatCurrency}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Período: ${label}`}
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'entradas' ? 'Entradas' :
                    name === 'saidas' ? 'Saídas' : 'Saldo'
                  ]}
                />
              }
            />
            <defs>
              <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-entradas)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-entradas)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-saidas)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-saidas)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="entradas"
              type="monotone"
              fill="url(#fillEntradas)"
              fillOpacity={0.4}
              stroke="var(--color-entradas)"
              stackId="a"
            />
            <Area
              dataKey="saidas"
              type="monotone"
              fill="url(#fillSaidas)"
              fillOpacity={0.4}
              stroke="var(--color-saidas)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}