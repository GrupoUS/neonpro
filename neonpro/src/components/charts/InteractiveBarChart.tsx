'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

export interface InteractiveBarChartProps {
  title: string;
  data: BarChartData[];
  bars: {
    dataKey: string;
    name: string;
    color: string;
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

export function InteractiveBarChart({
  title,
  data,
  bars,
  height = 350,
  className,
  xAxisDataKey = 'name',
  showGrid = true,
  showLegend = true,
  formatTooltip,
  formatXAxisLabel,
  formatYAxisLabel
}: InteractiveBarChartProps) {
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
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.color}
                name={bar.name}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}