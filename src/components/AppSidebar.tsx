
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth";

export function AppSidebar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      isActive: location.pathname === "/"
    },
    {
      title: "Agenda",
      url: "/agenda",
      icon: Calendar,
      isActive: location.pathname === "/agenda"
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
      isActive: location.pathname === "/clientes"
    },
    {
      title: "Financeiro",
      url: "/financeiro",
      icon: DollarSign,
      isActive: location.pathname === "/financeiro"
    },
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: BarChart3,
      isActive: location.pathname === "/relatorios"
    },
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: Settings,
      isActive: location.pathname === "/configuracoes"
    },
  ];
  
  const displayName = profile?.name || (user?.email ? user.email.split('@')[0] : 'Usuário');
  const role = "Administradora"; // This could be fetched from user profile if role is stored there
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-serif font-bold text-white">NEON PRO</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-4">
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`
                      w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300
                      ${item.isActive 
                        ? 'bg-sidebar-primary text-white shadow-lg' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
                      }
                    `}
                  >
                    <Link to={item.url} className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {role}
            </p>
          </div>
        </div>
        
        <SidebarMenuButton asChild className="mt-2 text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent w-full">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
