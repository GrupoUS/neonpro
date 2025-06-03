
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { navigationItems } from './NavigationItems';

export default function DesktopSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
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
                  <linearGradient id="neon-gradient-desktop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F5FF"/>
                    <stop offset="100%" stopColor="#00FA9A"/>
                  </linearGradient>
                </defs>
                <polygon 
                  points="16,4 28,12 28,20 16,28 4,20 4,12" 
                  fill="none" 
                  stroke="url(#neon-gradient-desktop)" 
                  strokeWidth="2"
                  className="drop-shadow-lg"
                />
                <circle 
                  cx="16" 
                  cy="16" 
                  r="6" 
                  fill="url(#neon-gradient-desktop)"
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
            {navigationItems.map((item) => {
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
  );
}
