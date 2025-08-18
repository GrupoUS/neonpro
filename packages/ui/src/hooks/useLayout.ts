import * as React from "react";

type LayoutState = {
  sidebarCollapsed: boolean;
  activeMenuItem: string | null;
  breadcrumbs: Array<{ title: string; href?: string }>;
};

type LayoutActions = {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveMenuItem: (itemId: string | null) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ title: string; href?: string }>) => void;
  addBreadcrumb: (breadcrumb: { title: string; href?: string }) => void;
  clearBreadcrumbs: () => void;
};

export function useLayout(): LayoutState & LayoutActions {
  const [state, setState] = React.useState<LayoutState>({
    sidebarCollapsed: false,
    activeMenuItem: null,
    breadcrumbs: [],
  });

  const setSidebarCollapsed = React.useCallback((collapsed: boolean) => {
    setState((prev) => ({ ...prev, sidebarCollapsed: collapsed }));
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const setActiveMenuItem = React.useCallback((itemId: string | null) => {
    setState((prev) => ({ ...prev, activeMenuItem: itemId }));
  }, []);

  const setBreadcrumbs = React.useCallback(
    (breadcrumbs: Array<{ title: string; href?: string }>) => {
      setState((prev) => ({ ...prev, breadcrumbs }));
    },
    [],
  );

  const addBreadcrumb = React.useCallback((breadcrumb: { title: string; href?: string }) => {
    setState((prev) => ({
      ...prev,
      breadcrumbs: [...prev.breadcrumbs, breadcrumb],
    }));
  }, []);

  const clearBreadcrumbs = React.useCallback(() => {
    setState((prev) => ({ ...prev, breadcrumbs: [] }));
  }, []);

  return {
    ...state,
    setSidebarCollapsed,
    toggleSidebar,
    setActiveMenuItem,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,
  };
}
