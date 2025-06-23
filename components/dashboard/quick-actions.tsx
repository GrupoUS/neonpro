'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Calendar, 
  Users, 
  MessageCircle, 
  FileText, 
  Settings,
  CreditCard,
  BarChart3
} from 'lucide-react';

const quickActions = [
  {
    title: "Novo Agendamento",
    description: "Agendar novo cliente",
    icon: Plus,
    color: "bg-blue-500 hover:bg-blue-600",
    href: "/dashboard/appointments/new"
  },
  {
    title: "Ver Agenda",
    description: "Visualizar agenda do dia",
    icon: Calendar,
    color: "bg-green-500 hover:bg-green-600",
    href: "/dashboard/calendar"
  },
  {
    title: "Clientes",
    description: "Gerenciar clientes",
    icon: Users,
    color: "bg-purple-500 hover:bg-purple-600",
    href: "/dashboard/clients"
  },
  {
    title: "WhatsApp",
    description: "Enviar mensagens",
    icon: MessageCircle,
    color: "bg-emerald-500 hover:bg-emerald-600",
    href: "/dashboard/whatsapp-test"
  },
  {
    title: "Relatórios",
    description: "Ver relatórios",
    icon: BarChart3,
    color: "bg-orange-500 hover:bg-orange-600",
    href: "/dashboard/reports"
  },
  {
    title: "Financeiro",
    description: "Gestão financeira",
    icon: CreditCard,
    color: "bg-red-500 hover:bg-red-600",
    href: "/dashboard/financial"
  },
  {
    title: "Serviços",
    description: "Gerenciar serviços",
    icon: FileText,
    color: "bg-indigo-500 hover:bg-indigo-600",
    href: "/dashboard/services"
  },
  {
    title: "Configurações",
    description: "Configurar sistema",
    icon: Settings,
    color: "bg-gray-500 hover:bg-gray-600",
    href: "/dashboard/settings"
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesso rápido às principais funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
              onClick={() => {
                // Simular navegação para desenvolvimento
                console.log(`Navegando para: ${action.href}`);
              }}
            >
              <div className={`p-2 rounded-lg text-white ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
