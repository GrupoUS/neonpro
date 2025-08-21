/**
 * 📊 Dashboard Overview - NeonPro Healthcare
 * ========================================
 * 
 * Main dashboard overview with key metrics,
 * recent activities, and quick actions.
 */

'use client';

import React from 'react';
import { useSearch } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth-context';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DashboardOverview() {
  const search = useSearch({ from: '/dashboard' });
  const { user } = useAuth();
  const activeTab = search?.tab || 'overview';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo de volta, {user?.name || 'Usuário'}!
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua clínica hoje
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12%</span> desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consultas Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 pendentes, 9 confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+20.1%</span> desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+5.1%</span> desde a semana passada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Próximas Consultas
            </CardTitle>
            <CardDescription>
              Consultas agendadas para hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    P{i}
                  </div>
                  <div>
                    <p className="font-medium">Paciente {i}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() + i * 60 * 60 * 1000).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  Confirmada
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'Novo paciente cadastrado', time: '2 min atrás' },
              { action: 'Consulta reagendada', time: '1h atrás' },
              { action: 'Relatório LGPD gerado', time: '3h atrás' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}