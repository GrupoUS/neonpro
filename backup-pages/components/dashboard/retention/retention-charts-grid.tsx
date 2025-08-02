'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  CohortAnalysisData,
  SegmentAnalysisData,
  RetentionTrendsData
} from '@/types/retention-analytics';

interface RetentionChartsGridProps {
  cohortData: CohortAnalysisData[];
  segmentData: SegmentAnalysisData[];
  trendsData: RetentionTrendsData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RetentionChartsGrid({ 
  cohortData, 
  segmentData, 
  trendsData 
}: RetentionChartsGridProps) {
  
  // Preparar dados para gráficos
  const cohortChartData = cohortData.map(item => ({
    month: item.cohort_month,
    retention_1m: item.retention_1_month * 100,
    retention_3m: item.retention_3_months * 100,
    retention_6m: item.retention_6_months * 100,
    retention_12m: item.retention_12_months * 100,
    patients: item.total_patients
  }));

  const segmentPieData = segmentData.map(item => ({
    name: item.segment_name,
    value: item.retention_rate * 100,
    patients: item.total_patients
  }));

  const trendsChartData = trendsData.map(item => ({
    date: new Date(item.period_start).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    }),
    retention: item.retention_rate * 100,
    churn: item.churn_rate * 100,
    newPatients: item.new_patients,
    activePatients: item.active_patients
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Análise de Coorte */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Análise de Coorte - Retenção por Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cohortChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retenção']}
                labelFormatter={(label) => `Coorte: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="retention_1m" 
                stroke="#8884d8" 
                name="1 Mês"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="retention_3m" 
                stroke="#82ca9d" 
                name="3 Meses"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="retention_6m" 
                stroke="#ffc658" 
                name="6 Meses"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="retention_12m" 
                stroke="#ff7300" 
                name="12 Meses"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Retenção por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle>Retenção por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {segmentPieData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name, props: any) => [
                  `${value.toFixed(1)}%`,
                  `${props.payload.patients} pacientes`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tendências de Retenção */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências de Retenção vs Churn</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="retention"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Retenção"
              />
              <Area
                type="monotone"
                dataKey="churn"
                stackId="2"
                stroke="#ff7300"
                fill="#ff7300"
                name="Churn"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}