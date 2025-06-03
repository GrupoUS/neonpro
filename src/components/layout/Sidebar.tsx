
import { Link, useLocation } from 'react-router-dom'
import { X, Home, Users, Calendar, FileText, BarChart3, Settings, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Cadastro de Cliente', href: '/clientes/cadastro', icon: Stethoscope },
  { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
  { name: 'Prontuários', href: '/prontuarios', icon: FileText },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 sidebar-neon shadow-neon-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            {/* Ícone hexagonal NEON PRO */}
            <div className="relative">
              <svg 
                viewBox="0 0 32 32" 
                className="w-8 h-8 glow-neon"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="neon-gradient-layout-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F5FF"/>
                    <stop offset="100%" stopColor="#00FA9A"/>
                  </linearGradient>
                </defs>
                <polygon 
                  points="16,4 28,12 28,20 16,28 4,20 4,12" 
                  fill="none" 
                  stroke="url(#neon-gradient-layout-sidebar)" 
                  strokeWidth="2"
                  className="drop-shadow-lg"
                />
                <circle 
                  cx="16" 
                  cy="16" 
                  r="6" 
                  fill="url(#neon-gradient-layout-sidebar)"
                  className="animate-pulse-neon"
                />
              </svg>
            </div>
            <span 
              className="text-xl font-bold text-neon-brand"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              NEON PRO
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300',
                    isActive
                      ? 'bg-gradient-neon text-neon-dark shadow-neon-lg border border-primary/20'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-neon/20'
                  )}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                      isActive ? 'text-neon-dark' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-neon rounded-full flex items-center justify-center shadow-neon">
              <span 
                className="text-neon-dark text-sm font-bold"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                U
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p 
                className="text-sm font-medium text-foreground truncate"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Usuário
              </p>
              <p 
                className="text-xs text-muted-foreground truncate"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                admin@neonpro.com.br
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
