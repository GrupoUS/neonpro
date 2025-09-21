/**
 * Accessible Navigation Component
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - WCAG 2.1 AA+ compliant navigation
 * - Keyboard navigation with arrow keys
 * - Screen reader optimized landmarks
 * - Skip links for accessibility
 * - High contrast mode support
 * - Brazilian Portuguese accessibility
 * - Mobile-friendly navigation
 */

'use client';

import { Button } from '@neonpro/ui';
import { ChevronDown, Menu, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useAccessibilityPreferences,
  useFocusTrap,
  useKeyboardNavigation,
  useScreenReaderAnnouncement,
  useSkipLinks,
} from '../../hooks/useAccessibility';
import { ACCESSIBILITY_LABELS_PT_BR } from '../../utils/accessibility';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  isActive?: boolean;
  ariaLabel?: string;
}

interface AccessibleNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  userMenu?: React.ReactNode;
  onNavigate?: (item: NavigationItem) => void;
  className?: string;
}

export function AccessibleNavigation({
  items,
  logo,
  userMenu,
  onNavigate,
  className,
}: AccessibleNavigationProps) {
  const { prefersHighContrast, prefersReducedMotion } = useAccessibilityPreferences();
  const { announce } = useScreenReaderAnnouncement();
  const { skipLinks, skipLinksRef } = useSkipLinks();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const mobileMenuRef = useFocusTrap(isMobileMenuOpen);
  const navigationRef = useRef<HTMLElement>(null);

  // Keyboard navigation for main menu items
  const { getItemProps: getMainItemProps } = useKeyboardNavigation(items, {
    orientation: 'horizontal',
    onSelect: item => {
      handleNavigate(item);
    },
  });

  const handleNavigate = useCallback(
    (item: NavigationItem) => {
      onNavigate?.(item);
      announce(`Navegando para ${item.label}`, 'polite');

      // Close mobile menu if open
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    },
    [onNavigate, announce, isMobileMenuOpen],
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => {
      const newState = !prev;
      announce(
        newState ? 'Menu principal aberto' : 'Menu principal fechado',
        'polite',
      );
      return newState;
    });
  }, [announce]);

  const toggleSubmenu = useCallback(
    (itemId: string) => {
      setOpenSubmenu(prev => {
        const newState = prev === itemId ? null : itemId;
        const item = items.find(i => i.id === itemId);
        if (item) {
          announce(
            newState
              ? `Submenu ${item.label} aberto`
              : `Submenu ${item.label} fechado`,
            'polite',
          );
        }
        return newState;
      });
    },
    [items, announce],
  );

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        announce('Menu principal fechado', 'polite');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, announce]);

  const renderNavigationItem = useCallback(
    (item: NavigationItem, index: number, isMobile: boolean = false) => {
      const hasChildren = item.children && item.children.length > 0;
      const isSubmenuOpen = openSubmenu === item.id;

      return (
        <li key={item.id} className={isMobile ? 'w-full' : 'relative'}>
          {hasChildren
            ? (
              <div>
                <Button
                  variant='ghost'
                  className={`
                ${isMobile ? 'w-full justify-between' : ''}
                ${
                    item.isActive
                      ? prefersHighContrast
                        ? 'bg-gray-900 text-white'
                        : 'bg-primary/10 text-primary'
                      : ''
                  }
                ${prefersHighContrast ? 'border border-gray-900' : ''}
                focus:ring-2 focus:ring-primary focus:ring-offset-2
              `}
                  onClick={() => toggleSubmenu(item.id)}
                  aria-expanded={isSubmenuOpen}
                  aria-haspopup='true'
                  aria-label={item.ariaLabel || `${item.label}, submenu`}
                  {...(!isMobile
                    ? {
                      ...getMainItemProps(index),
                      onKeyDown: (
                        e: React.KeyboardEvent<HTMLButtonElement>,
                      ) => {
                        const nativeEvent = e.nativeEvent;
                        getMainItemProps(index).onKeyDown?.(nativeEvent);
                      },
                    }
                    : {})}
                >
                  <span className='flex items-center space-x-2'>
                    {item.icon && <span aria-hidden='true'>{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                  <ChevronDown
                    className={`
                  w-4 h-4 transition-transform duration-200
                  ${isSubmenuOpen ? 'rotate-180' : ''}
                  ${prefersReducedMotion ? '' : 'transition-transform'}
                `}
                    aria-hidden='true'
                  />
                </Button>

                {/* Submenu */}
                {hasChildren && (
                  <ul
                    className={`
                  ${
                      isMobile
                        ? `ml-4 mt-2 space-y-1 ${isSubmenuOpen ? 'block' : 'hidden'}`
                        : `absolute left-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md border z-50 ${
                          isSubmenuOpen ? 'block' : 'hidden'
                        }`
                    }
                  ${prefersHighContrast ? 'border-2 border-gray-900' : 'border border-gray-200'}
                `}
                    role='menu'
                    aria-labelledby={`submenu-${item.id}`}
                    aria-hidden={!isSubmenuOpen}
                  >
                    {item.children?.map((child, childIndex) => (
                      <li key={child.id} role='none'>
                        <Button
                          variant='ghost'
                          className={`
                        ${isMobile ? 'w-full justify-start' : 'w-full justify-start px-4 py-2'}
                        ${
                            child.isActive
                              ? prefersHighContrast
                                ? 'bg-gray-900 text-white'
                                : 'bg-primary/10 text-primary'
                              : ''
                          }
                        focus:ring-2 focus:ring-primary focus:ring-offset-2
                      `}
                          onClick={() => handleNavigate(child)}
                          role='menuitem'
                          aria-label={child.ariaLabel || child.label}
                        >
                          <span className='flex items-center space-x-2'>
                            {child.icon && <span aria-hidden='true'>{child.icon}</span>}
                            <span>{child.label}</span>
                          </span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
            : (
              <Button
                variant='ghost'
                className={`
              ${isMobile ? 'w-full justify-start' : ''}
              ${
                  item.isActive
                    ? prefersHighContrast
                      ? 'bg-gray-900 text-white'
                      : 'bg-primary/10 text-primary'
                    : ''
                }
              ${prefersHighContrast ? 'border border-gray-900' : ''}
              focus:ring-2 focus:ring-primary focus:ring-offset-2
            `}
                onClick={() => handleNavigate(item)}
                aria-label={item.ariaLabel || item.label}
                aria-current={item.isActive ? 'page' : undefined}
                {...(!isMobile
                  ? {
                    ...getMainItemProps(index),
                    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
                      const nativeEvent = e.nativeEvent;
                      getMainItemProps(index).onKeyDown?.(nativeEvent);
                    },
                  }
                  : {})}
              >
                <span className='flex items-center space-x-2'>
                  {item.icon && <span aria-hidden='true'>{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              </Button>
            )}
        </li>
      );
    },
    [
      openSubmenu,
      prefersHighContrast,
      prefersReducedMotion,
      toggleSubmenu,
      handleNavigate,
      getMainItemProps,
    ],
  );

  return (
    <>
      {/* Skip Links */}
      <div
        ref={skipLinksRef}
        className='sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50'
      >
        {skipLinks.map(link => (
          <a
            key={link.href}
            href={link.href}
            className={`
              inline-block px-4 py-2 bg-primary text-white font-medium
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
              ${prefersHighContrast ? 'border-2 border-white' : ''}
            `}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Main Navigation */}
      <nav
        ref={navigationRef}
        className={`
          ${prefersHighContrast ? 'border-b-2 border-gray-900' : 'border-b border-gray-200'}
          bg-white shadow-sm
          ${className}
        `}
        role='navigation'
        aria-label={ACCESSIBILITY_LABELS_PT_BR.mainNavigation}
        id='main-navigation'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            {logo && <div className='flex-shrink-0'>{logo}</div>}

            {/* Desktop Navigation */}
            <div className='hidden md:block'>
              <ul
                className='flex space-x-1'
                role='menubar'
                aria-label='Menu principal'
              >
                {items.map((item, _index) => renderNavigationItem(item, index, false))}
              </ul>
            </div>

            {/* User Menu and Mobile Menu Button */}
            <div className='flex items-center space-x-4'>
              {userMenu && <div className='hidden md:block'>{userMenu}</div>}

              {/* Mobile Menu Button */}
              <Button
                variant='ghost'
                size='sm'
                className={`
                  md:hidden
                  ${prefersHighContrast ? 'border border-gray-900' : ''}
                  focus:ring-2 focus:ring-primary focus:ring-offset-2
                `}
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls='mobile-menu'
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMobileMenuOpen
                  ? <X className='w-5 h-5' aria-hidden='true' />
                  : <Menu className='w-5 h-5' aria-hidden='true' />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id='mobile-menu'
            className={`
              md:hidden border-t
              ${
              prefersHighContrast
                ? 'border-t-2 border-gray-900 bg-white'
                : 'border-t border-gray-200 bg-white'
            }
            `}
            role='menu'
            aria-label='Menu móvel'
          >
            <div className='px-4 py-4 space-y-2'>
              <ul className='space-y-1' role='none'>
                {items.map((item, _index) => renderNavigationItem(item, index, true))}
              </ul>

              {/* Mobile User Menu */}
              {userMenu && <div className='pt-4 border-t border-gray-200'>{userMenu}</div>}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden'
          onClick={toggleMobileMenu}
          aria-hidden='true'
        />
      )}
    </>
  );
}

export default AccessibleNavigation;
