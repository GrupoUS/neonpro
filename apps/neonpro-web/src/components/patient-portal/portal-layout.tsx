"use client";

import {
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  Home,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Phone,
  Settings,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { type ReactNode, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface PortalLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/patient-portal",
    icon: Home,
    description: "Visão geral das suas informações",
  },
  {
    title: "Agendar Consulta",
    href: "/patient-portal/booking",
    icon: Calendar,
    description: "Marque suas consultas online",
  },
  {
    title: "Histórico Médico",
    href: "/patient-portal/history",
    icon: FileText,
    description: "Consulte seu histórico de tratamentos",
  },
  {
    title: "Documentos",
    href: "/patient-portal/documents",
    icon: FileText,
    description: "Gerencie seus documentos médicos",
  },
  {
    title: "Meu Perfil",
    href: "/patient-portal/profile",
    icon: User,
    description: "Atualize suas informações pessoais",
  },
  {
    title: "Configurações LGPD",
    href: "/patient-portal/lgpd",
    icon: Shield,
    badge: "Importante",
    description: "Gerencie seus consentimentos e privacidade",
  },
];

// Mock user data
const currentUser = {
  name: "Ana Clara Silva",
  email: "ana.clara@email.com",
  phone: "(11) 99999-9999",
  avatar: "",
  initials: "AS",
  nextAppointment: {
    date: "2024-07-25",
    time: "14:30",
    doctor: "Dr. Marina Santos",
    service: "Botox Facial",
  },
  notifications: 3,
  planType: "Premium",
};

export function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/patient-portal") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NavigationContent = () => (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{currentUser.name}</h3>
            <p className="text-sm text-gray-600">{currentUser.email}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {currentUser.planType}
          </Badge>
        </div>

        {/* Next Appointment */}
        {currentUser.nextAppointment && (
          <div className="pt-3 border-t border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">Próxima Consulta</p>
            <p className="text-sm text-gray-700">
              {new Date(currentUser.nextAppointment.date).toLocaleDateString("pt-BR")} às{" "}
              {currentUser.nextAppointment.time}
            </p>
            <p className="text-xs text-gray-600">
              {currentUser.nextAppointment.service} - {currentUser.nextAppointment.doctor}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary",
                )}
              >
                <IconComponent
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary-foreground" : "text-gray-500 group-hover:text-primary",
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge variant={active ? "secondary" : "outline"} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p
                      className={cn(
                        "text-xs mt-1",
                        active ? "text-primary-foreground/80" : "text-gray-500",
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Emergency Contact */}
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4 text-red-600" />
          <h4 className="font-medium text-red-800">Emergência</h4>
        </div>
        <p className="text-sm text-red-700 mb-3">Para emergências médicas, ligue imediatamente:</p>
        <div className="space-y-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-left border-red-300 hover:bg-red-100"
          >
            <Phone className="h-4 w-4 mr-2" />
            (11) 3333-4444
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-left border-red-300 hover:bg-red-100"
          >
            <Mail className="h-4 w-4 mr-2" />
            emergencia@neonpro.com.br
          </Button>
        </div>
      </div>

      {/* Support */}
      <div className="text-center text-sm text-gray-500">
        <p>Precisa de ajuda?</p>
        <Button variant="link" className="p-0 h-auto text-primary">
          <MessageSquare className="h-4 w-4 mr-1" />
          Fale conosco
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 py-8 shadow-xl border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NeonPro</h1>
              <p className="text-sm text-gray-500">Portal do Paciente</p>
            </div>
          </div>

          <NavigationContent />

          {/* Logout */}
          <div className="mt-auto pt-6">
            <Separator className="mb-4" />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sair da Conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Saída</DialogTitle>
                  <DialogDescription>Tem certeza que deseja sair da sua conta?</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive" className="flex-1">
                    Confirmar Saída
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="-m-2.5 p-2.5">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 py-8">
                {/* Mobile Logo */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">NeonPro</h1>
                    <p className="text-sm text-gray-500">Portal do Paciente</p>
                  </div>
                </div>

                <NavigationContent />

                {/* Mobile Logout */}
                <div className="mt-auto pt-6">
                  <Separator className="mb-4" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair da Conta
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Header Content */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-900">NeonPro</h1>
              </div>

              {/* Mobile User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {currentUser.initials}
                      </AvatarFallback>
                    </Avatar>
                    {currentUser.notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {currentUser.notifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="space-y-1">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                    {currentUser.notifications > 0 && (
                      <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {currentUser.notifications}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
