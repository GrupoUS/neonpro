
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
    <aside className="w-64 sidebar-sacha">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          {/* Ícone hexagonal com identidade visual "Universo da Sacha" */}
          <div className="relative">
            <svg 
              viewBox="0 0 32 32" 
              className="w-10 h-10 glow-sacha transition-all duration-300 hover:glow-sacha-intense"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="sacha-gradient-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#AC9469"/>
                  <stop offset="100%" stopColor="#c4aa7d"/>
                </linearGradient>
              </defs>
              <polygon 
                points="16,4 28,12 28,20 16,28 4,20 4,12" 
                fill="none" 
                stroke="url(#sacha-gradient-sidebar)" 
                strokeWidth="2"
                className="drop-shadow-lg"
              />
              <circle 
                cx="16" 
                cy="16" 
                r="6" 
                fill="url(#sacha-gradient-sidebar)"
                className="animate-pulse"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span 
              className="text-xl font-bold text-gradient-sacha transition-all duration-300 hover:animate-gradient-shift text-sacha-brand"
            >
              Universo da Sacha
            </span>
            <span 
              className="text-xs text-sacha-subtitle"
            >
              Gestão Premium
            </span>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-sacha-gold text-accent-foreground shadow-sacha-gold border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md hover:shadow-sacha/20'
                  }`
                }
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <IconComponent className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
