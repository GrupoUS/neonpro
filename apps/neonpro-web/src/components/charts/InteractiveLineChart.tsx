'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface InteractiveLineChartProps {
  title: string;
  data: LineChartData[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }[];
  height?: number;
  className?: string;
  xAxisDataKey?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  formatTooltip?: (value: any, name: string) => [string, string];
  formatXAxisLabel?: (value: string) => string;
  formatYAxisLabel?: (value: any) => string;
}

export function InteractiveLineChart({
  title,
  data,
  lines,
  height = 350,
  className,
  xAxisDataKey = 'name',
  showGrid = true,
  showLegend = true,
  formatTooltip,
  formatXAxisLabel,
  formatYAxisLabel
}: InteractiveLineChartProps) {
  const defaultTooltipFormatter = (value: any, name: string) => {
    if (formatTooltip) {
      return formatTooltip(value, name);
    }
    
    // Default formatting for common cases
    if (typeof value === 'number') {
      if (name.toLowerCase().includes('revenue') || name.toLowerCase().includes('receita')) {
        return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name];
      }
      return [value.toLocaleString('pt-BR'), name];
    }
    
    return [value, name];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis 
              dataKey={xAxisDataKey}
              tick={{ fontSize: 12 }}
              tickFormatter={formatXAxisLabel}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxisLabel}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={defaultTooltipFormatter}
              labelClassName="font-medium"
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            {showLegend && <Legend />}
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={line.strokeWidth || 2}
                name={line.name}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
