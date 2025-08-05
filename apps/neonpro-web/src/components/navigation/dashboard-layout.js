"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardLayout = DashboardLayout;
var breadcrumb_1 = require("@/components/ui/breadcrumb");
var offline_status_1 = require("@/components/ui/offline-status");
var separator_1 = require("@/components/ui/separator");
var sidebar_1 = require("@/components/ui/sidebar");
var React = require("react");
var app_sidebar_1 = require("./app-sidebar");
function DashboardLayout(_a) {
    var children = _a.children, user = _a.user, breadcrumbs = _a.breadcrumbs;
    return (<sidebar_1.SidebarProvider>
      <app_sidebar_1.AppSidebar user={user}/>
      <sidebar_1.SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <sidebar_1.SidebarTrigger className="-ml-1"/>
            <separator_1.Separator orientation="vertical" className="mr-2 h-4"/>
            {breadcrumbs && breadcrumbs.length > 0 && (<breadcrumb_1.Breadcrumb>
                <breadcrumb_1.BreadcrumbList>
                  {breadcrumbs.map(function (breadcrumb, index) { return (<React.Fragment key={breadcrumb.title}>
                      <breadcrumb_1.BreadcrumbItem className="hidden md:block">
                        {breadcrumb.href ? (<breadcrumb_1.BreadcrumbLink href={breadcrumb.href}>
                            {breadcrumb.title}
                          </breadcrumb_1.BreadcrumbLink>) : (<breadcrumb_1.BreadcrumbPage>{breadcrumb.title}</breadcrumb_1.BreadcrumbPage>)}
                      </breadcrumb_1.BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (<breadcrumb_1.BreadcrumbSeparator className="hidden md:block"/>)}
                    </React.Fragment>); })}
                </breadcrumb_1.BreadcrumbList>
              </breadcrumb_1.Breadcrumb>)}
          </div>
          
          {/* Offline Status Indicator */}
          <div className="ml-auto pr-4">
            <offline_status_1.OfflineStatus variant="badge"/>
          </div>
        </header>
        
        {/* Offline Banner */}
        <offline_status_1.OfflineStatus variant="banner"/>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Toast notifications */}
          <offline_status_1.OfflineStatus variant="toast"/>
          {children}
        </div>
      </sidebar_1.SidebarInset>
    </sidebar_1.SidebarProvider>);
}
