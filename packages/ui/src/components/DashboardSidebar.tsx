import {
  Bell,
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";

// Types
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string | number;
  active?: boolean;
  children?: SidebarItem[];
  onClick?: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  clinic?: string;
}

interface DashboardSidebarProps {
  user: UserProfile;
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  onItemSelect?: (item: SidebarItem) => void;
  onUserMenuSelect?: (action: "profile" | "settings" | "logout") => void;
  notifications?: number;
  className?: string;
}

export const DashboardSidebar = React.forwardRef<
  HTMLDivElement,
  DashboardSidebarProps
>(
  (
    {
      user,
      items,
      collapsed = false,
      onToggle,
      onItemSelect,
      onUserMenuSelect,
      notifications = 0,
      className,
    },
    ref,
  ) => {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
      new Set(),
    );
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const toggleExpanded = (itemId: string) => {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    };

    const handleItemClick = (item: SidebarItem) => {
      if (item.children && item.children.length > 0) {
        toggleExpanded(item.id);
      } else {
        onItemSelect?.(item);
        item.onClick?.();
      }
    };

    const renderSidebarItem = (item: SidebarItem, level = 0) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(item.id);
      const { icon: Icon } = item;

      return (
        <div key={item.id}>
          <Button
            className={cn(
              "h-10 w-full justify-start px-3",
              level > 0 && "ml-4 w-[calc(100%-1rem)]",
              collapsed && level === 0 && "justify-center px-2",
            )}
            onClick={() => handleItemClick(item)}
            variant={item.active ? "default" : "ghost"}
          >
            <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge className="ml-auto" variant="secondary">
                    {item.badge}
                  </Badge>
                )}
                {hasChildren
                  && (isExpanded
                    ? <ChevronDown className="ml-1 h-4 w-4" />
                    : <ChevronRight className="ml-1 h-4 w-4" />)}
              </>
            )}
          </Button>

          {hasChildren && !collapsed && isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderSidebarItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    };
    return (
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className,
        )}
        ref={ref}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">NeonPro</span>
            </div>
          )}
          <Button
            className={cn("p-2", collapsed && "mx-auto")}
            onClick={onToggle}
            size="sm"
            variant="ghost"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {items.map((item) => renderSidebarItem(item))}
        </nav>

        {/* Notifications */}
        {notifications > 0 && (
          <div className="px-4 py-2">
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-lg bg-muted/50 p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                collapsed && "justify-center",
              )}
              onClick={() =>
                onItemSelect?.({
                  id: "notifications",
                  label: "Notificações",
                  icon: Bell,
                })}
              type="button"
            >
              <Bell className="h-4 w-4" />
              {!collapsed && (
                <>
                  <span className="text-sm">Notificações</span>
                  <Badge className="ml-auto" variant="destructive">
                    {notifications}
                  </Badge>
                </>
              )}
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="border-t p-4">
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              collapsed && "justify-center",
            )}
            onClick={() => setShowUserMenu(!showUserMenu)}
            type="button"
          >
            <Avatar size="sm">
              <AvatarImage alt={user.name} src={user.avatar} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sm">
                    {user.name}
                  </div>
                  <div className="truncate text-muted-foreground text-xs">
                    {user.role}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showUserMenu && "rotate-180",
                  )}
                />
              </>
            )}
          </button>

          {/* User Menu */}
          {showUserMenu && !collapsed && (
            <div className="mt-2 space-y-1">
              <Button
                className="h-8 w-full justify-start"
                onClick={() => {
                  onUserMenuSelect?.("profile");
                  setShowUserMenu(false);
                }}
                size="sm"
                variant="ghost"
              >
                <Users className="mr-2 h-3 w-3" />
                Perfil
              </Button>
              <Button
                className="h-8 w-full justify-start"
                onClick={() => {
                  onUserMenuSelect?.("settings");
                  setShowUserMenu(false);
                }}
                size="sm"
                variant="ghost"
              >
                <Settings className="mr-2 h-3 w-3" />
                Configurações
              </Button>
              <Button
                className="h-8 w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  onUserMenuSelect?.("logout");
                  setShowUserMenu(false);
                }}
                size="sm"
                variant="ghost"
              >
                <LogOut className="mr-2 h-3 w-3" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

DashboardSidebar.displayName = "DashboardSidebar";

export type { DashboardSidebarProps, SidebarItem, UserProfile };
