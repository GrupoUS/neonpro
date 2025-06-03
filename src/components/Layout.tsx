import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  Menu, 
  X,
  Sun,
  Moon,
  Briefcase
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Pacientes', href: '/pacientes', icon: Users },
    { name: 'Serviços', href: '/servicos', icon: Briefcase },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
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
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar-background border-r border-sidebar-border">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-sacha-gold via-sacha-blue to-sacha-dark-blue rounded-xl flex items-center justify-center shadow-lg shadow-sacha-gold/20 relative overflow-hidden group">
                  <span className="text-sacha-gray-light font-display font-extrabold text-lg tracking-wider relative z-10">US</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-sacha-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h1 className="ml-3 text-xl font-bold text-sidebar-foreground">
                  Universo da Sacha
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
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-accent'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
                      } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                    >
                      <Icon
                        className={`${
                          isActive(item.href)
                            ? 'text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* Botão de alternância de tema */}
            <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 rounded-lg hover:bg-sidebar-accent/10 hover:text-sidebar-foreground transition-all duration-200"
              >
                {theme === 'dark' ? (
                  <Sun className="mr-3 h-5 w-5 text-sidebar-foreground/50" />
                ) : (
                  <Moon className="mr-3 h-5 w-5 text-sidebar-foreground/50" />
                )}
                {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar mobile */}
        <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar-background">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-sacha-gold via-sacha-blue to-sacha-dark-blue rounded-lg flex items-center justify-center shadow-lg shadow-sacha-gold/20">
                      <span className="text-sacha-gray-light font-display font-extrabold text-sm tracking-wider">US</span>
                    </div>
                    <h1 className="ml-3 text-xl font-bold text-sidebar-foreground">
                      Universo da Sacha
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
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-accent'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
                        } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                      >
                        <Icon
                          className={`${
                            isActive(item.href)
                              ? 'text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                          } mr-3 flex-shrink-0 h-5 w-5`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 rounded-lg hover:bg-sidebar-accent/10 hover:text-sidebar-foreground transition-all duration-200"
                >
                  {theme === 'dark' ? (
                    <Sun className="mr-3 h-5 w-5 text-sidebar-foreground/50" />
                  ) : (
                    <Moon className="mr-3 h-5 w-5 text-sidebar-foreground/50" />
                  )}
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Header mobile */}
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-background border-b border-border">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
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
