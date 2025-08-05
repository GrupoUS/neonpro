'use client';

/**
 * Patient Statistics Cards Component
 * 
 * Displays key metrics for patient management dashboard
 */

import { Users, UserPlus, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface PatientStatsCardsProps {
  stats?: {
    totalPatients?: number;
    newPatients?: number;
    scheduledAppointments?: number;
    activePatients?: number;
  };
}

export function PatientStatsCards({ stats }: PatientStatsCardsProps) {
  const defaultStats = {
    totalPatients: 0,
    newPatients: 0,
    scheduledAppointments: 0,
    activePatients: 0,
    ...stats,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total de Pacientes"
        value={defaultStats.totalPatients}
        description="Pacientes cadastrados"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Novos Pacientes"
        value={defaultStats.newPatients}
        description="Este mês"
        icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Consultas Agendadas"
        value={defaultStats.scheduledAppointments}
        description="Próximos 7 dias"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Pacientes Ativos"
        value={defaultStats.activePatients}
        description="Últimos 30 dias"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
