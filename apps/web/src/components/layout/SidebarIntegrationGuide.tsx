/**
 * SidebarIntegrationGuide Component - Migration Guide (FR-022)
 * Provides examples and patterns for migrating from basic sidebar to enhanced sidebar
 *
 * This file serves as documentation and examples for integrating the EnhancedSidebar
 * component into existing applications while maintaining backward compatibility.
 */

'use client';

import React from 'react';
import { EnhancedSidebar, EnhancedAppShell } from './EnhancedSidebar';
import { AppShellWithSidebar } from './AppShellWithSidebar';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';

/**
 * Example 1: Basic Enhanced Sidebar Usage
 * 
 * For simple integration, replace the existing AppShellWithSidebar with EnhancedSidebar:
 */

export function BasicEnhancedSidebarExample() {
  return (
    <EnhancedSidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Seu conteúdo principal aqui</p>
      </div>
    </EnhancedSidebar>
  );
}

/**
 * Example 2: Enhanced App Shell with Full Features
 * 
 * For production applications, use EnhancedAppShell for comprehensive features:
 */

export function EnhancedAppShellExample() {
  return (
    <EnhancedAppShell
      showPerformanceMetrics={process.env.NODE_ENV === 'development'}
      showConnectionStatus={true}
      enableRealtime={true}
      enableSessionMonitoring={true}
      enableRoutePrefetch={true}
    >
      {/* Your existing route components */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Seu conteúdo principal aqui</p>
      </div>
    </EnhancedAppShell>
  );
}

/**
 * Example 3: Custom Sidebar Sections
 * 
 * Define custom sections for your healthcare application:
 */

export function CustomSidebarExample() {
  const customSections = [
    {
      id: 'clinical',
      label: 'Clínica',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      expanded: true,
      items: [
        {
          label: 'Pacientes',
          href: '/patients',
          icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>,
          hotkey: 'Ctrl+P',
          description: 'Gerenciar pacientes',
          badge: 'Novo',
        },
        {
          label: 'Agenda',
          href: '/appointments',
          icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>,
          hotkey: 'Ctrl+A',
          description: 'Agendamentos e calendário',
        },
      ],
    },
    {
      id: 'administrative',
      label: 'Administrativo',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      expanded: false,
      items: [
        {
          label: 'Financeiro',
          href: '/financial',
          icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>,
          description: 'Financeiro e faturamento',
        },
      ],
    },
  ];

  return (
    <EnhancedSidebar sections={customSections}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Seu conteúdo principal aqui</p>
      </div>
    </EnhancedSidebar>
  );
}

/**
 * Example 4: Migration from Existing AppShell
 * 
 * Gradual migration approach for existing applications:
 */

export function MigrationExample() {
  return (
    <div className="flex h-screen">
      {/* Option 1: Use EnhancedSidebar directly */}
      <EnhancedSidebar>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6">
            {/* Your existing route components */}
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p>Seu conteúdo principal aqui</p>
            </div>
          </div>
        </main>
      </EnhancedSidebar>
    </div>
  );
}

/**
 * Example 5: Using Enhanced Sidebar Hooks
 * 
 * Example of using the enhanced sidebar hooks for advanced control:
 */

import { useEnhancedSidebar, useEnhancedSidebarManagement } from './EnhancedSidebar';

export function HookUsageExample() {
  const { 
    userPreferences, 
    updateUserPreferences, 
    expandedSections, 
    toggleSection,
    searchQuery,
    setSearchQuery 
  } = useEnhancedSidebarManagement();

  const handleToggleDarkMode = () => {
    updateUserPreferences({ darkMode: !userPreferences.darkMode });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Preferências do Usuário</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Modo Escuro</span>
          <button
            onClick={handleToggleDarkMode}
            className={`px-3 py-1 rounded ${
              userPreferences.darkMode 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {userPreferences.darkMode ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span>Atalhos de Teclado</span>
          <button
            onClick={() => updateUserPreferences({ 
              keyboardShortcuts: !userPreferences.keyboardShortcuts 
            })}
            className={`px-3 py-1 rounded ${
              userPreferences.keyboardShortcuts 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {userPreferences.keyboardShortcuts ? 'Ativados' : 'Desativados'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Busca no Menu
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar itens do menu..."
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Keyboard Shortcuts Reference
 * 
 * Built-in keyboard shortcuts available in EnhancedSidebar:
 * 
 * Global Shortcuts:
 * - Ctrl+B: Toggle sidebar
 * - Ctrl+K: Focus search
 * - ?: Show keyboard help
 * - Ctrl+Shift+M: Toggle dark mode
 * 
 * Navigation Shortcuts:
 * - Ctrl+D: Go to Dashboard
 * - Ctrl+P: Go to Patients
 * - Ctrl+A: Go to Appointments
 * - Ctrl+S: Go to Services
 */

/**
 * Migration Checklist
 * 
 * ✓ Replace AppShellWithSidebar with EnhancedSidebar or EnhancedAppShell
 * ✓ Update imports to use enhanced components
 * ✓ Test keyboard shortcuts functionality
 * ✓ Verify accessibility compliance
 * ✓ Test responsive behavior
 * ✓ Validate real-time features
 * ✓ Check performance metrics
 * ✓ Test user preferences persistence
 * ✓ Verify LGPD compliance for data storage
 * ✓ Test error boundaries and fallback UI
 */

/**
 * Component Exports Summary
 * 
 * Main Components:
 * - EnhancedSidebar: Core sidebar component with enhanced features
 * - EnhancedAppShell: Full application shell with all features
 * - BreadcrumbNavigation: Standalone breadcrumb component
 * 
 * Hooks:
 * - useEnhancedSidebar: Access sidebar context
 * - useEnhancedSidebarManagement: Advanced sidebar management
 * - useBreadcrumbs: Breadcrumb navigation helper
 * 
 * Utilities:
 * - ConnectionStatus: Real-time connection indicator
 * - PerformanceMetrics: Development performance monitoring
 */

export {
  EnhancedSidebar,
  EnhancedAppShell,
  BreadcrumbNavigation,
  useEnhancedSidebar,
  useEnhancedSidebarManagement,
  useBreadcrumbs,
};