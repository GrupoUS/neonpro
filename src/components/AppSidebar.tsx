
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Settings,
  Briefcase
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      icon: Calendar,
      label: 'Agendamentos',
      path: '/agendamentos'
    },
    {
      icon: Users,
      label: 'Clientes',
      path: '/clientes'
    },
    {
      icon: Briefcase,
      label: 'Serviços',
      path: '/servicos'
    },
    {
      icon: DollarSign,
      label: 'Financeiro',
      path: '/financeiro'
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      path: '/relatorios'
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes'
    }
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-sacha-dark-blue font-bold text-sm">N</span>
          </div>
          <span className="text-xl font-bold text-foreground">NEON PRO</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gold text-sacha-dark-blue font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
