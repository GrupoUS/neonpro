/**
 * BreadcrumbNavigation Component - Navigation System (FR-010)
 * Implements route-aware breadcrumb navigation with accessibility and mobile support
 *
 * Features:
 * - Route-aware breadcrumb generation
 * - Clickable breadcrumb links for navigation
 * - Dynamic route parameter handling
 * - Mobile-responsive design
 * - ARIA navigation labels for accessibility (WCAG 2.1 AA+)
 * - Custom breadcrumb labels support
 * - Brazilian healthcare context (Portuguese labels)
 * - Integration with TanStack Router
 */

'use client';

import { cn } from '@/lib/utils';
import { IconChevronRight, IconHome } from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useMemo } from 'react';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbNavigationProps {
  className?: string;
  customLabels?: Record<string, string>;
  showHome?: boolean;
  maxItems?: number;
}

// Route label mapping for Brazilian healthcare context
const defaultRouteLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  patients: 'Pacientes',
  appointments: 'Agenda',
  services: 'Serviços',
  financial: 'Financeiro',
  documents: 'Documentos',
  reports: 'Relatórios',
  settings: 'Configurações',
  new: 'Novo',
  edit: 'Editar',
  view: 'Visualizar',
  profile: 'Perfil',
  history: 'Histórico',
  analytics: 'Análises',
  calendar: 'Calendário',
  templates: 'Modelos',
  categories: 'Categorias',
  pricing: 'Preços',
  professional: 'Profissional',
  subscription: 'Assinatura',
  auth: 'Autenticação',
  login: 'Login',
  signup: 'Cadastro',
};

// Generate breadcrumb items from current route
const generateBreadcrumbs = (
  pathname: string,
  customLabels: Record<string, string> = {},
  showHome: boolean = true,
): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Add home breadcrumb
  if (showHome) {
    breadcrumbs.push({
      label: 'Início',
      href: '/',
      isCurrentPage: pathname === '/',
    });
  }

  // Generate breadcrumbs for each segment
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Check if segment is a UUID or ID (skip in breadcrumb display)
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
      || /^\d+$/.test(segment);

    if (!isId) {
      const label = customLabels[segment]
        || defaultRouteLabels[segment]
        || segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast,
      });
    }
  });

  return breadcrumbs;
};

export function BreadcrumbNavigation({
  className,
  customLabels = {},
  showHome = true,
  maxItems = 5,
}: BreadcrumbNavigationProps) {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const items = generateBreadcrumbs(location.pathname, customLabels, showHome);

    // Limit breadcrumbs for mobile responsiveness
    if (items.length > maxItems) {
      const firstItem = items[0];
      const lastItems = items.slice(-maxItems + 2);
      return [firstItem, { label: '...', href: '', isCurrentPage: false }, ...lastItems];
    }

    return items;
  }, [location.pathname, customLabels, showHome, maxItems]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground',
        'py-2 px-1 overflow-x-auto scrollbar-hide',
        className,
      )}
      aria-label='Navegação estrutural'
      role='navigation'
    >
      <ol className='flex items-center space-x-1 min-w-0' role='list'>
        {breadcrumbs.map((item, index) => (
          <li key={`${item.href}-${index}`} className='flex items-center space-x-1' role='listitem'>
            {index > 0 && (
              <IconChevronRight
                className='h-4 w-4 text-muted-foreground/60 flex-shrink-0'
                aria-hidden='true'
              />
            )}

            {item.label === '...'
              ? (
                <span className='px-2 py-1 text-muted-foreground/60' aria-hidden='true'>
                  ...
                </span>
              )
              : item.isCurrentPage
              ? (
                <span
                  className='px-2 py-1 font-medium text-foreground truncate'
                  aria-current='page'
                >
                  {item.label}
                </span>
              )
              : (
                <Link
                  to={item.href}
                  className={cn(
                    'px-2 py-1 rounded-md transition-colors truncate',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                    index === 0 && 'flex items-center gap-1',
                  )}
                  aria-label={index === 0 ? `Ir para ${item.label}` : `Ir para ${item.label}`}
                >
                  {index === 0 && showHome && <IconHome className='h-3 w-3' aria-hidden='true' />}
                  <span className='truncate'>{item.label}</span>
                </Link>
              )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Hook for custom breadcrumb management
export function useBreadcrumbs(customLabels?: Record<string, string>) {
  const location = useLocation();

  return useMemo(() => {
    return generateBreadcrumbs(location.pathname, customLabels);
  }, [location.pathname, customLabels]);
}

// Breadcrumb separator component for custom layouts
export function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <IconChevronRight
      className={cn('h-4 w-4 text-muted-foreground/60', className)}
      aria-hidden='true'
    />
  );
}

// Individual breadcrumb item component for custom layouts
interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  isLast?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function BreadcrumbItem({
  item,
  isLast = false,
  showIcon = false,
  className,
}: BreadcrumbItemProps) {
  if (item.isCurrentPage || isLast) {
    return (
      <span
        className={cn('font-medium text-foreground', className)}
        aria-current='page'
      >
        {showIcon && <IconHome className='h-3 w-3 mr-1 inline' aria-hidden='true' />}
        {item.label}
      </span>
    );
  }

  return (
    <Link
      to={item.href}
      className={cn(
        'transition-colors hover:text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm',
        className,
      )}
      aria-label={`Ir para ${item.label}`}
    >
      {showIcon && <IconHome className='h-3 w-3 mr-1 inline' aria-hidden='true' />}
      {item.label}
    </Link>
  );
}
