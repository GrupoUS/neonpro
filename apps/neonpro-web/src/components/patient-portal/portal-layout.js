"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalLayout = PortalLayout;
var react_1 = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var sheet_1 = require("@/components/ui/sheet");
var lucide_react_1 = require("lucide-react");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var navigationItems = [
  {
    title: "Dashboard",
    href: "/patient-portal",
    icon: lucide_react_1.Home,
    description: "Visão geral das suas informações",
  },
  {
    title: "Agendar Consulta",
    href: "/patient-portal/booking",
    icon: lucide_react_1.Calendar,
    description: "Marque suas consultas online",
  },
  {
    title: "Histórico Médico",
    href: "/patient-portal/history",
    icon: lucide_react_1.FileText,
    description: "Consulte seu histórico de tratamentos",
  },
  {
    title: "Documentos",
    href: "/patient-portal/documents",
    icon: lucide_react_1.FileText,
    description: "Gerencie seus documentos médicos",
  },
  {
    title: "Meu Perfil",
    href: "/patient-portal/profile",
    icon: lucide_react_1.User,
    description: "Atualize suas informações pessoais",
  },
  {
    title: "Configurações LGPD",
    href: "/patient-portal/lgpd",
    icon: lucide_react_1.Shield,
    badge: "Importante",
    description: "Gerencie seus consentimentos e privacidade",
  },
];
// Mock user data
var currentUser = {
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
function PortalLayout(_a) {
  var children = _a.children;
  var pathname = (0, navigation_1.usePathname)();
  var _b = (0, react_1.useState)(false),
    isMobileMenuOpen = _b[0],
    setIsMobileMenuOpen = _b[1];
  var isActive = function (href) {
    if (href === "/patient-portal") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  var NavigationContent = function () {
    return (
      <div className="space-y-6">
        {/* User Info Card */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <avatar_1.Avatar className="h-12 w-12">
              <avatar_1.AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <avatar_1.AvatarFallback className="bg-primary text-primary-foreground">
                {currentUser.initials}
              </avatar_1.AvatarFallback>
            </avatar_1.Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{currentUser.name}</h3>
              <p className="text-sm text-gray-600">{currentUser.email}</p>
            </div>
            <badge_1.Badge variant="secondary" className="text-xs">
              {currentUser.planType}
            </badge_1.Badge>
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
          {navigationItems.map(function (item) {
            var IconComponent = item.icon;
            var active = isActive(item.href);
            return (
              <link_1.default key={item.href} href={item.href}>
                <div
                  className={(0, utils_1.cn)(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-primary",
                  )}
                >
                  <IconComponent
                    className={(0, utils_1.cn)(
                      "h-5 w-5 transition-colors",
                      active ? "text-primary-foreground" : "text-gray-500 group-hover:text-primary",
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      {item.badge && (
                        <badge_1.Badge
                          variant={active ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {item.badge}
                        </badge_1.Badge>
                      )}
                    </div>
                    {item.description && (
                      <p
                        className={(0, utils_1.cn)(
                          "text-xs mt-1",
                          active ? "text-primary-foreground/80" : "text-gray-500",
                        )}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </link_1.default>
            );
          })}
        </nav>

        <separator_1.Separator />

        {/* Emergency Contact */}
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <lucide_react_1.Heart className="h-4 w-4 text-red-600" />
            <h4 className="font-medium text-red-800">Emergência</h4>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Para emergências médicas, ligue imediatamente:
          </p>
          <div className="space-y-1">
            <button_1.Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left border-red-300 hover:bg-red-100"
            >
              <lucide_react_1.Phone className="h-4 w-4 mr-2" />
              (11) 3333-4444
            </button_1.Button>
            <button_1.Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left border-red-300 hover:bg-red-100"
            >
              <lucide_react_1.Mail className="h-4 w-4 mr-2" />
              emergencia@neonpro.com.br
            </button_1.Button>
          </div>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-500">
          <p>Precisa de ajuda?</p>
          <button_1.Button variant="link" className="p-0 h-auto text-primary">
            <lucide_react_1.MessageSquare className="h-4 w-4 mr-1" />
            Fale conosco
          </button_1.Button>
        </div>
      </div>
    );
  };
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
            <separator_1.Separator className="mb-4" />
            <dialog_1.Dialog>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <lucide_react_1.LogOut className="h-5 w-5 mr-3" />
                  Sair da Conta
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Confirmar Saída</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Tem certeza que deseja sair da sua conta?
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="flex gap-2 mt-4">
                  <button_1.Button variant="destructive" className="flex-1">
                    Confirmar Saída
                  </button_1.Button>
                  <button_1.Button variant="outline" className="flex-1">
                    Cancelar
                  </button_1.Button>
                </div>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <sheet_1.Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <sheet_1.SheetTrigger asChild>
              <button_1.Button variant="ghost" size="sm" className="-m-2.5 p-2.5">
                <lucide_react_1.Menu className="h-6 w-6" />
              </button_1.Button>
            </sheet_1.SheetTrigger>
            <sheet_1.SheetContent side="left" className="w-80 p-0">
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
                  <separator_1.Separator className="mb-4" />
                  <button_1.Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <lucide_react_1.LogOut className="h-5 w-5 mr-3" />
                    Sair da Conta
                  </button_1.Button>
                </div>
              </div>
            </sheet_1.SheetContent>
          </sheet_1.Sheet>

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
              <dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                  <button_1.Button variant="ghost" size="sm" className="relative">
                    <avatar_1.Avatar className="h-8 w-8">
                      <avatar_1.AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <avatar_1.AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {currentUser.initials}
                      </avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                    {currentUser.notifications > 0 && (
                      <badge_1.Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {currentUser.notifications}
                      </badge_1.Badge>
                    )}
                  </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="end" className="w-56">
                  <dropdown_menu_1.DropdownMenuLabel>
                    <div className="space-y-1">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                  </dropdown_menu_1.DropdownMenuLabel>
                  <dropdown_menu_1.DropdownMenuSeparator />
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.Bell className="h-4 w-4 mr-2" />
                    Notificações
                    {currentUser.notifications > 0 && (
                      <badge_1.Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {currentUser.notifications}
                      </badge_1.Badge>
                    )}
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuSeparator />
                  <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                    <lucide_react_1.LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuContent>
              </dropdown_menu_1.DropdownMenu>
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
