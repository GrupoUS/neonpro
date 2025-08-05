"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardHeader = DashboardHeader;
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var avatar_1 = require("@/components/ui/avatar");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var badge_1 = require("@/components/ui/badge");
function DashboardHeader(_a) {
    var _b, _c, _d, _e, _f;
    var onMenuClick = _a.onMenuClick, user = _a.user;
    return (<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Mobile menu button */}
        <button_1.Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <lucide_react_1.Menu className="h-5 w-5"/>
          <span className="sr-only">Abrir menu</span>
        </button_1.Button>

        {/* Page title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo de volta, {((_b = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _b === void 0 ? void 0 : _b.full_name) || ((_c = user === null || user === void 0 ? void 0 : user.email) === null || _c === void 0 ? void 0 : _c.split('@')[0])}!
          </p>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
            <input_1.Input placeholder="Buscar pacientes, agendamentos..." className="pl-9"/>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="ghost" size="icon" className="relative">
                <lucide_react_1.Bell className="h-5 w-5"/>
                <badge_1.Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </badge_1.Badge>
                <span className="sr-only">Notificações</span>
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-80">
              <dropdown_menu_1.DropdownMenuLabel>Notificações</dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Nova consulta agendada</p>
                  <p className="text-xs text-muted-foreground">
                    João Silva - Hoje às 14:00
                  </p>
                </div>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Pagamento recebido</p>
                  <p className="text-xs text-muted-foreground">
                    R$ 150,00 - Maria Santos
                  </p>
                </div>
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Lembrete de consulta</p>
                  <p className="text-xs text-muted-foreground">
                    Pedro Costa - Amanhã às 09:00
                  </p>
                </div>
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>

          {/* User menu */}
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <avatar_1.Avatar className="h-8 w-8">
                  <avatar_1.AvatarImage src={(_d = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _d === void 0 ? void 0 : _d.avatar_url}/>
                  <avatar_1.AvatarFallback>
                    {(_e = user === null || user === void 0 ? void 0 : user.email) === null || _e === void 0 ? void 0 : _e.charAt(0).toUpperCase()}
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent className="w-56" align="end" forceMount>
              <dropdown_menu_1.DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {((_f = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _f === void 0 ? void 0 : _f.full_name) || "Usuário"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user === null || user === void 0 ? void 0 : user.email}
                  </p>
                </div>
              </dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem>
                Perfil
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem>
                Configurações
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem>
                Suporte
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem asChild>
                <form action="/api/auth/signout" method="post" className="w-full">
                  <button type="submit" className="w-full text-left">
                    Sair
                  </button>
                </form>
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </div>
    </header>);
}
