import { Bell, Search, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-healthcare-border border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="font-semibold font-serif text-healthcare-text-primary text-xl">
          Dashboard NeonPro
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <Button
          className="text-healthcare-text-secondary hover:bg-healthcare-primary/10 hover:text-healthcare-primary"
          size="icon"
          variant="ghost"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button
          className="text-healthcare-text-secondary hover:bg-healthcare-primary/10 hover:text-healthcare-primary"
          size="icon"
          variant="ghost"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Settings */}
        <Button
          className="text-healthcare-text-secondary hover:bg-healthcare-primary/10 hover:text-healthcare-primary"
          size="icon"
          variant="ghost"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="relative h-8 w-8 rounded-full hover:bg-healthcare-primary/10"
              variant="ghost"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage alt="@usuario" src="/avatars/01.png" />
                <AvatarFallback className="bg-healthcare-primary font-medium text-white">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-healthcare-border"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="font-medium text-healthcare-text-primary text-sm leading-none">
                  Dr. Administrador
                </p>
                <p className="text-healthcare-text-muted text-xs leading-none">
                  admin@neonpro.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-healthcare-border" />
            <DropdownMenuItem className="text-healthcare-text-primary hover:bg-healthcare-primary/10">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-healthcare-text-primary hover:bg-healthcare-primary/10">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-healthcare-border" />
            <DropdownMenuItem className="text-healthcare-text-primary hover:bg-red-500/10 hover:text-red-600">
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
