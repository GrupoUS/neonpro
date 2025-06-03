
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3,
  Menu, 
  X,
  LogOut,
  Briefcase,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Serviços', href: '/servicos', icon: Briefcase },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    { name: 'Configurações', href: '/configuracoes', icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-background">
        {/* Sidebar para desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto sidebar-neon">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                {/* Logo NEON PRO */}
                <div className="relative">
                  <svg 
                    viewBox="0 0 32 32" 
                    className="w-10 h-10 glow-neon"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="neon-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00F5FF"/>
                        <stop offset="100%" stopColor="#00FA9A"/>
                      </linearGradient>
                    </defs>
                    <polygon 
                      points="16,4 28,12 28,20 16,28 4,20 4,12" 
                      fill="none" 
                      stroke="url(#neon-gradient-main)" 
                      strokeWidth="2"
                      className="drop-shadow-lg"
                    />
                    <circle 
                      cx="16" 
                      cy="16" 
                      r="6" 
                      fill="url(#neon-gradient-main)"
                      className="animate-pulse-neon"
                    />
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-bold text-neon-brand">
                  NEON PRO
                </h1>
              </div>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'bg-gradient-neon text-neon-dark shadow-neon-lg'
                          : 'text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground hover:shadow-neon/20'
                      } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300`}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* Footer com ações */}
            <div className="flex-shrink-0 p-4 border-t border-border space-y-2">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <button
                onClick={signOut}
                className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-accent/10 hover:text-accent-foreground transition-all duration-300"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar mobile */}
        <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full sidebar-neon">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <svg 
                        viewBox="0 0 32 32" 
                        className="w-8 h-8 glow-neon"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient id="neon-gradient-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00F5FF"/>
                            <stop offset="100%" stopColor="#00FA9A"/>
                          </linearGradient>
                        </defs>
                        <polygon 
                          points="16,4 28,12 28,20 16,28 4,20 4,12" 
                          fill="none" 
                          stroke="url(#neon-gradient-mobile)" 
                          strokeWidth="2"
                        />
                        <circle 
                          cx="16" 
                          cy="16" 
                          r="6" 
                          fill="url(#neon-gradient-mobile)"
                        />
                      </svg>
                    </div>
                    <h1 className="ml-3 text-xl font-bold text-neon-brand">
                      NEON PRO
                    </h1>
                  </div>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`${
                          isActive(item.href)
                            ? 'bg-gradient-neon text-neon-dark shadow-neon-lg'
                            : 'text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground'
                        } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300`}
                      >
                        <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 p-4 border-t border-border space-y-2">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-accent/10 hover:text-accent-foreground transition-all duration-300"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Header mobile */}
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 header-neon">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Área de conteúdo */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
