
import { Menu, Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ThemeToggle'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="header-neon shadow-neon">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-accent/10 transition-colors duration-300"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar clientes, agendamentos..."
                className="input-neon pl-10 w-80"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative hover:bg-accent/10 transition-colors duration-300"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
              3
            </span>
          </Button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p 
                className="text-sm font-medium text-foreground"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Administrador
              </p>
              <p 
                className="text-xs text-muted-foreground"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                NEON PRO
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full hover:bg-accent/10 transition-colors duration-300"
            >
              <div className="w-8 h-8 bg-gradient-neon rounded-full flex items-center justify-center shadow-neon">
                <User className="h-4 w-4 text-neon-dark" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
