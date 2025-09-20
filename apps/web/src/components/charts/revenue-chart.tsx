"use client";

import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

const chartData = [
  { month: "Jan 2025", revenue: 300000, growth: 120000 },
  { month: "Feb 2025", revenue: 420000, growth: 180000 },
  { month: "Mar 2025", revenue: 500000, growth: 90000 },
  { month: "Apr 2025", revenue: 630000, growth: 110000 },
  { month: "May 2025", revenue: 710000, growth: 120000 },
  { month: "Jun 2025", revenue: 800000, growth: 100000 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  growth: {
    label: "Growth",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RevenueChart() {
  const id = useId();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Revenue</CardTitle>
          <Badge variant="secondary">+12.3%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" />
            <Bar dataKey="growth" fill="var(--color-growth)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
