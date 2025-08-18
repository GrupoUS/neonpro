import * as React from "react";
import { cn } from "../utils/cn";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";
import type { SidebarItem, UserProfile } from "./DashboardSidebar";
import { DashboardSidebar } from "./DashboardSidebar";

export type BreadcrumbData = {
  title: string;
  href?: string;
};

type DashboardLayoutProps = {
  user: UserProfile;
  items: SidebarItem[];
  activeMenuItem?: string;
  onItemSelect?: (item: SidebarItem) => void;
  onUserMenuSelect?: (action: "profile" | "settings" | "logout") => void;
  breadcrumbs?: BreadcrumbData[];
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  notifications?: number;
};

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  (
    {
      user,
      items,
      activeMenuItem,
      onItemSelect,
      onUserMenuSelect,
      breadcrumbs = [],
      title,
      description,
      headerActions,
      children,
      className,
      sidebarCollapsed = false,
      onSidebarToggle,
      notifications = 0,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("flex min-h-screen bg-background", className)} ref={ref} {...props}>
        {/* Sidebar */}
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          items={items}
          notifications={notifications}
          onItemSelect={onItemSelect}
          onToggle={onSidebarToggle}
          onUserMenuSelect={onUserMenuSelect}
          user={user}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((item, index) => (
                        <React.Fragment key={item.href || item.title || index}>
                          {index > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {item.href ? (
                              <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}

                {/* Page Title */}
                {title && <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>}

                {/* Page Description */}
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>

              {/* Header Actions */}
              {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    );
  },
);

DashboardLayout.displayName = "DashboardLayout";

export { DashboardLayout };
export type { DashboardLayoutProps };
