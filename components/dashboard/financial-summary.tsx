'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const financialData = {
  revenue: 28500,
  expenses: 3100,
  profit: 25400,
  monthlyGoal: 30000,
  previousMonth: {
    revenue: 25400,
    expenses: 2800,
    profit: 22600
  }
};

export function FinancialSummary() {
  const revenueGrowth = ((financialData.revenue - financialData.previousMonth.revenue) / financialData.previousMonth.revenue * 100).toFixed(1);
  const profitGrowth = ((financialData.profit - financialData.previousMonth.profit) / financialData.previousMonth.profit * 100).toFixed(1);
  const goalProgress = (financialData.revenue / financialData.monthlyGoal * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
        <CardDescription>
          Receitas e despesas do mês atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Receitas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Receitas</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-green-600">
                R$ {financialData.revenue.toLocaleString()}
              </span>
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+{revenueGrowth}%</span>
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Despesas</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-red-600">
                R$ {financialData.expenses.toLocaleString()}
              </span>
              <TrendingUp className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-600">+10.7%</span>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="h-px bg-border" />

        {/* Lucro Líquido */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Lucro Líquido</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-bold text-primary">
                R$ {financialData.profit.toLocaleString()}
              </span>
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+{profitGrowth}%</span>
            </div>
          </div>
        </div>

        {/* Meta Mensal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Meta Mensal</span>
            <span className="text-sm font-medium">{goalProgress}%</span>
          </div>
          <Progress value={parseFloat(goalProgress)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ {financialData.revenue.toLocaleString()}</span>
            <span>R$ {financialData.monthlyGoal.toLocaleString()}</span>
          </div>
        </div>

        {/* Comparação com mês anterior */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Comparação com mês anterior</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Receita:</span>
              <div className="font-medium text-green-600">+R$ {(financialData.revenue - financialData.previousMonth.revenue).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Lucro:</span>
              <div className="font-medium text-green-600">+R$ {(financialData.profit - financialData.previousMonth.profit).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
