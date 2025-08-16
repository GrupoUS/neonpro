'use client';

import {
  Bell,
  Calendar,
  FileText,
  Heart,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface PortalLayoutProps {
  children: React.ReactNode;
  patient?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/patient-portal',
    icon: Home,
  },
  {
    name: 'Agendamentos',
    href: '/patient-portal/appointments',
    icon: Calendar,
  },
  {
    name: 'Histórico Médico',
    href: '/patient-portal/medical-history',
    icon: FileText,
  },
  {
    name: 'Planos de Saúde',
    href: '/patient-portal/insurance',
    icon: Heart,
  },
  {
    name: 'Perfil',
    href: '/patient-portal/profile',
    icon: User,
  },
];

export function PortalLayout({ children, patient }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-xl font-bold text-primary">NeonPro Portal</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className="h-5 w-5 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-0">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="-m-2.5 p-2.5 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Abrir sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Separator */}
          <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="-m-2.5 p-2.5">
                <span className="sr-only">Ver notificações</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </Button>

              {/* Separator */}
              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-border"
                aria-hidden="true"
              />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="-m-1.5 flex items-center p-1.5"
                  >
                    <span className="sr-only">Abrir menu do usuário</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={patient?.avatar} alt={patient?.name} />
                      <AvatarFallback>
                        {patient?.name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:flex lg:items-center">
                      <span
                        className="ml-4 text-sm font-semibold leading-6"
                        aria-hidden="true"
                      >
                        {patient?.name || 'Paciente'}
                      </span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {patient?.name || 'Paciente'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {patient?.email || 'paciente@email.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/patient-portal/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/patient-portal/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default PortalLayout;
