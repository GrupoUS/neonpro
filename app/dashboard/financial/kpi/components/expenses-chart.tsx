"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from "recharts";

type DateRange = "7d" | "30d" | "90d" | "12m" | "ytd";

interface ExpensesChartProps {
  dateRange: DateRange;
}

export function ExpensesChart({ dateRange }: ExpensesChartProps) {
  const getChartData = () => {
    const baseData = [
      { category: "Pessoal", value: 15500, color: "hsl(var(--chart-1))" },
      { category: "Produtos", value: 8200, color: "hsl(var(--chart-2))" },
      { category: "Aluguel", value: 4500, color: "hsl(var(--chart-3))" },
      { category: "Marketing", value: 3200, color: "hsl(var(--chart-4))" },
      { category: "Equipamentos", value: 2800, color: "hsl(var(--chart-5))" },
      { category: "Outros", value: 1900, color: "hsl(var(--muted))" }
    ];

    if (dateRange === "7d") {
      return baseData.map(item => ({
        ...item,
        value: Math.round(item.value * 0.25) // Weekly approximation
      }));
    }

    return baseData;
  };  const chartData = getChartData();

  const chartConfig = {
    value: {
      label: "Valor",
    },
    pessoal: {
      label: "Pessoal",
      color: "hsl(var(--chart-1))",
    },
    produtos: {
      label: "Produtos",
      color: "hsl(var(--chart-2))",
    },
    aluguel: {
      label: "Aluguel",
      color: "hsl(var(--chart-3))",
    },
    marketing: {
      label: "Marketing",
      color: "hsl(var(--chart-4))",
    },
    equipamentos: {
      label: "Equipamentos",
      color: "hsl(var(--chart-5))",
    },
    outros: {
      label: "Outros",
      color: "hsl(var(--muted))",
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

  const totalExpenses = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }: any) => {
    if (percent < 0.05) return null; // Don't show label for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Despesas</CardTitle>
        <CardDescription>
          Categorização das despesas operacionais (Total: {formatCurrency(totalExpenses)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="category"
                  formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
                />
              }
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          {chartData.map((item, index) => {
            const percentage = ((item.value / totalExpenses) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1">{item.category}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {percentage}%
                </span>
                <span className="font-mono text-xs">
                  {formatCurrency(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}