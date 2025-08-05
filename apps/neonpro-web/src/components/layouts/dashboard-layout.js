"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLayout;
var breadcrumb_1 = require("@/components/ui/breadcrumb");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var client_1 = require("@/app/utils/supabase/client");
function DashboardLayout(_a) {
  var _this = this;
  var _b, _c;
  var children = _a.children,
    user = _a.user,
    _d = _a.breadcrumbs,
    breadcrumbs = _d === void 0 ? [] : _d,
    title = _a.title,
    subtitle = _a.subtitle;
  var router = (0, navigation_1.useRouter)();
  var supabase = (0, client_1.createClient)();
  var handleSignOut = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, supabase.auth.signOut()];
          case 1:
            _a.sent();
            router.push("/login");
            return [2 /*return*/];
        }
      });
    });
  };
  var getUserInitials = function (email) {
    return email.slice(0, 2).toUpperCase();
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <div className="flex items-center space-x-4 flex-1">
            <button_1.Button variant="ghost" size="sm" className="lg:hidden">
              <lucide_react_1.Menu className="h-5 w-5" />
            </button_1.Button>

            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">NeonPro</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.Bell className="h-5 w-5" />
            </button_1.Button>

            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <avatar_1.Avatar className="h-8 w-8">
                    <avatar_1.AvatarImage
                      src={
                        (_b = user.user_metadata) === null || _b === void 0 ? void 0 : _b.avatar_url
                      }
                      alt={user.email}
                    />
                    <avatar_1.AvatarFallback>
                      {getUserInitials(user.email || "")}
                    </avatar_1.AvatarFallback>
                  </avatar_1.Avatar>
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {((_c = user.user_metadata) === null || _c === void 0
                      ? void 0
                      : _c.full_name) || user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <lucide_react_1.LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="mb-6">
              <breadcrumb_1.Breadcrumb>
                <breadcrumb_1.BreadcrumbList>
                  <breadcrumb_1.BreadcrumbItem>
                    <breadcrumb_1.BreadcrumbLink href="/dashboard">
                      <lucide_react_1.Home className="h-4 w-4" />
                    </breadcrumb_1.BreadcrumbLink>
                  </breadcrumb_1.BreadcrumbItem>
                  {breadcrumbs.map(function (crumb, index) {
                    return (
                      <div key={index} className="flex items-center">
                        <breadcrumb_1.BreadcrumbSeparator />
                        <breadcrumb_1.BreadcrumbItem>
                          {crumb.href && index < breadcrumbs.length - 1
                            ? <breadcrumb_1.BreadcrumbLink href={crumb.href}>
                                {crumb.title}
                              </breadcrumb_1.BreadcrumbLink>
                            : <breadcrumb_1.BreadcrumbPage>
                                {crumb.title}
                              </breadcrumb_1.BreadcrumbPage>}
                        </breadcrumb_1.BreadcrumbItem>
                      </div>
                    );
                  })}
                </breadcrumb_1.BreadcrumbList>
              </breadcrumb_1.Breadcrumb>
            </div>
          )}

          {/* Page Header */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
              {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
