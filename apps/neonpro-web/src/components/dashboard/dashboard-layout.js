"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardLayout = DashboardLayout;
var react_1 = require("react");
var dashboard_sidebar_1 = require("./dashboard-sidebar");
var dashboard_header_1 = require("./dashboard-header");
var error_boundary_1 = require("@/components/ui/error-boundary");
var utils_1 = require("@/lib/utils");
function DashboardLayout(_a) {
    var children = _a.children, user = _a.user;
    var _b = (0, react_1.useState)(false), sidebarOpen = _b[0], setSidebarOpen = _b[1];
    return (<div className="min-h-screen bg-background">
      {/* Sidebar */}
      <error_boundary_1.ErrorBoundary onError={function (error) { return console.error('Dashboard Sidebar Error:', error); }} fallback={<div className="w-64 h-screen bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Erro no menu lateral</p>
          </div>}>
        <dashboard_sidebar_1.DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} user={user}/>
      </error_boundary_1.ErrorBoundary>
      
      {/* Main content */}
      <div className={(0, utils_1.cn)("transition-all duration-300 ease-in-out", "lg:ml-64" // Always show sidebar on large screens
        )}>
        {/* Header */}
        <error_boundary_1.ErrorBoundary onError={function (error) { return console.error('Dashboard Header Error:', error); }} fallback={<div className="h-16 bg-muted border-b flex items-center px-6">
              <p className="text-sm text-muted-foreground">Erro no cabeçalho</p>
            </div>}>
          <dashboard_header_1.DashboardHeader onMenuClick={function () { return setSidebarOpen(true); }} user={user}/>
        </error_boundary_1.ErrorBoundary>
        
        {/* Page content */}
        <error_boundary_1.ErrorBoundary onError={function (error) { return console.error('Dashboard Content Error:', error); }} className="m-6" showDetails={process.env.NODE_ENV === 'development'}>
          <main className="p-6">
            {children}
          </main>
        </error_boundary_1.ErrorBoundary>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={function () { return setSidebarOpen(false); }}/>)}
    </div>);
}
