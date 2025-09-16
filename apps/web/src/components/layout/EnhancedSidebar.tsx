/**
 * EnhancedSidebar Component - Navigation System (FR-009)
 * Implements collapsible sidebar navigation with accessibility and mobile support
 *
 * Features:
 * - Collapsible sidebar with persistent state
 * - Keyboard navigation support
 * - Mobile-responsive design with touch interactions
 * - ARIA labels for accessibility (WCAG 2.1 AA+)
 * - Active route highlighting
 * - Nested navigation support
 * - Brazilian healthcare context (Portuguese labels)
 * - Integration with TanStack Router
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@neonpro/ui';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconDashboard,
  IconFileText,
  IconMenu2,
  IconMoneybag,
  IconReport,
  IconSettings,
  IconStethoscope,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  requiresAuth?: boolean;
}

interface EnhancedSidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

// Navigation configuration with Brazilian healthcare context
const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <IconDashboard className='h-5 w-5' />,
  },
  {
    label: 'Pacientes',
    href: '/patients',
    icon: <IconUsers className='h-5 w-5' />,
    children: [
      {
        label: 'Lista de Pacientes',
        href: '/patients',
        icon: <IconUsers className='h-4 w-4' />,
      },
      {
        label: 'Novo Paciente',
        href: '/patients/new',
        icon: <IconUsers className='h-4 w-4' />,
      },
    ],
  },
  {
    label: 'Agenda',
    href: '/appointments',
    icon: <IconCalendar className='h-5 w-5' />,
    children: [
      {
        label: 'Calendário',
        href: '/appointments',
        icon: <IconCalendar className='h-4 w-4' />,
      },
      {
        label: 'Nova Consulta',
        href: '/appointments/new',
        icon: <IconCalendar className='h-4 w-4' />,
      },
    ],
  },
  {
    label: 'Serviços',
    href: '/services',
    icon: <IconStethoscope className='h-5 w-5' />,
  },
  {
    label: 'Financeiro',
    href: '/financial',
    icon: <IconMoneybag className='h-5 w-5' />,
  },
  {
    label: 'Documentos',
    href: '/documents',
    icon: <IconFileText className='h-5 w-5' />,
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: <IconReport className='h-5 w-5' />,
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: <IconSettings className='h-5 w-5' />,
    requiresAuth: true,
  },
];

// Persistent state management
const SIDEBAR_STORAGE_KEY = 'neonpro-sidebar-collapsed';

const getSavedCollapseState = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
};

const saveCollapseState = (collapsed: boolean): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(collapsed));
  } catch {
    // Ignore storage errors
  }
};

export function EnhancedSidebar({
  className,
  defaultCollapsed = false,
  onCollapseChange,
}: EnhancedSidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => getSavedCollapseState() || defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle collapse state changes
  const handleCollapseToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    saveCollapseState(newCollapsed);
    onCollapseChange?.(newCollapsed);
  }, [isCollapsed, onCollapseChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  // Toggle expanded items
  const toggleExpanded = useCallback((href: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  }, []);

  // Check if route is active
  const isActiveRoute = useCallback((href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  // Filter navigation items based on auth state
  const filteredItems = navigationItems.filter(item =>
    !item.requiresAuth || (item.requiresAuth && user)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? (isMobile ? 0 : 80) : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-background border-r border-border',
          'flex flex-col overflow-hidden',
          isMobile && isCollapsed && 'w-0',
          className,
        )}
        onKeyDown={handleKeyDown}
        role='navigation'
        aria-label='Navegação principal'
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <AnimatePresence mode='wait'>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='flex items-center gap-2'
              >
                <IconStethoscope className='h-6 w-6 text-primary' />
                <span className='text-lg font-semibold text-foreground'>
                  NeonPro
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleCollapseToggle}
            className='h-8 w-8 p-0'
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isMobile
              ? (
                isCollapsed ? <IconMenu2 className='h-4 w-4' /> : <IconX className='h-4 w-4' />
              )
              : (
                isCollapsed
                  ? <IconChevronRight className='h-4 w-4' />
                  : <IconChevronLeft className='h-4 w-4' />
              )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto p-4' aria-label='Menu de navegação'>
          <ul className='space-y-1' role='menubar'>
            {filteredItems.map(item => (
              <NavigationItemComponent
                key={item.href}
                item={item}
                isCollapsed={isCollapsed}
                isActive={isActiveRoute(item.href)}
                isExpanded={expandedItems.has(item.href)}
                onToggleExpanded={() => toggleExpanded(item.href)}
                level={0}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='p-4 border-t border-border'
          >
            <div className='text-xs text-muted-foreground text-center'>
              NeonPro Healthcare Platform
              <br />
              Versão 1.0.0
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* Mobile toggle button */}
      {isMobile && isCollapsed && (
        <Button
          variant='outline'
          size='sm'
          onClick={handleCollapseToggle}
          className='fixed top-4 left-4 z-40 lg:hidden'
          aria-label='Abrir menu'
        >
          <IconMenu2 className='h-4 w-4' />
        </Button>
      )}
    </>
  );
}

// Navigation Item Component
interface NavigationItemComponentProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  level: number;
}

function NavigationItemComponent({
  item,
  isCollapsed,
  isActive,
  isExpanded,
  onToggleExpanded,
  level,
}: NavigationItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0;
  const location = useLocation();

  const isChildActive = hasChildren
    && item.children?.some(child => location.pathname.startsWith(child.href));

  return (
    <li role='none'>
      <div className='relative'>
        {hasChildren
          ? (
            <button
              onClick={onToggleExpanded}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                (isActive || isChildActive) && 'bg-primary text-primary-foreground',
                level > 0 && 'ml-4',
              )}
              aria-expanded={isExpanded}
              aria-label={`${item.label} - ${isExpanded ? 'Recolher' : 'Expandir'} submenu`}
              role='menuitem'
            >
              <span className='flex-shrink-0'>
                {item.icon}
              </span>

              {!isCollapsed && (
                <>
                  <span className='flex-1 text-left'>{item.label}</span>
                  {item.badge && (
                    <span className='bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full'>
                      {item.badge}
                    </span>
                  )}
                  <IconChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90',
                    )}
                  />
                </>
              )}
            </button>
          )
          : (
            <Link
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isActive && 'bg-primary text-primary-foreground',
                level > 0 && 'ml-4',
              )}
              aria-current={isActive ? 'page' : undefined}
              role='menuitem'
            >
              <span className='flex-shrink-0'>
                {item.icon}
              </span>

              {!isCollapsed && (
                <>
                  <span className='flex-1'>{item.label}</span>
                  {item.badge && (
                    <span className='bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full'>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )}
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isExpanded && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
              role='menu'
              aria-label={`Submenu de ${item.label}`}
            >
              {item.children?.map(child => (
                <NavigationItemComponent
                  key={child.href}
                  item={child}
                  isCollapsed={isCollapsed}
                  isActive={location.pathname === child.href}
                  isExpanded={false}
                  onToggleExpanded={() => {}}
                  level={level + 1}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}
