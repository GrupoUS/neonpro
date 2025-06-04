
import { Home, Calendar, Users, DollarSign, BarChart3, Settings, Briefcase } from 'lucide-react';

export const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Serviços', href: '/servicos', icon: Briefcase },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings }
];
