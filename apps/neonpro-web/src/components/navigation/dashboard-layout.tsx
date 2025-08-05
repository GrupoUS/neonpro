"use client";

import type {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { OfflineStatus } from "@/components/ui/offline-status";
import type { Separator } from "@/components/ui/separator";
import type { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import * as React from "react";
import type { AppSidebar } from "./app-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: any;
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
}

export function DashboardLayout({ children, user, breadcrumbs }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={breadcrumb.title}>
                      <BreadcrumbItem className="hidden md:block">
                        {breadcrumb.href ? (
                          <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.title}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          {/* Offline Status Indicator */}
          <div className="ml-auto pr-4">
            <OfflineStatus variant="badge" />
          </div>
        </header>

        {/* Offline Banner */}
        <OfflineStatus variant="banner" />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Toast notifications */}
          <OfflineStatus variant="toast" />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
