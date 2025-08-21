/**
 * 🍞 Breadcrumbs Navigation - NeonPro Healthcare
 * =============================================
 *
 * Dynamic breadcrumb navigation with healthcare context,
 * role-based visibility, and accessibility features.
 */

'use client';

import { Link, useLocation, useParams } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const params = useParams({ strict: false });

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Início',
        href: '/',
        icon: Home,
      },
    ];

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Replace parameter values with actual data if available
      let label = segment;

      // Handle dynamic segments
      if (segment.startsWith('$')) {
        const paramKey = segment.substring(1);
        const paramValue = params[paramKey as keyof typeof params];
        label = paramValue ? String(paramValue) : segment;
      }

      // Translate common segments to Portuguese
      const translations: Record<string, string> = {
        dashboard: 'Dashboard',
        patients: 'Pacientes',
        appointments: 'Consultas',
        professionals: 'Profissionais',
        compliance: 'Conformidade',
        settings: 'Configurações',
        analytics: 'Analytics',
        new: 'Novo',
        edit: 'Editar',
        profile: 'Perfil',
        security: 'Segurança',
        clinic: 'Clínica',
        integrations: 'Integrações',
        lgpd: 'LGPD',
        anvisa: 'ANVISA',
        cfm: 'CFM',
        reports: 'Relatórios',
        schedule: 'Agendar',
        calendar: 'Calendário',
        overview: 'Visão Geral',
        'medical-records': 'Prontuário',
        performance: 'Desempenho',
      };

      label = translations[label] || label;

      // Don't create links for certain segments that are not navigable
      const nonNavigableSegments = ['edit', 'new'];
      const href = nonNavigableSegments.includes(segment)
        ? undefined
        : currentPath;

      breadcrumbs.push({
        label,
        href,
        isActive: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page or if only one item
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação estrutural"
      className={cn(
        'flex items-center space-x-1 text-muted-foreground text-sm',
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li className="flex items-center" key={index}>
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="mx-2 h-4 w-4" />
              )}

              {item.href && !isLast ? (
                <Link
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    'flex items-center transition-colors hover:text-foreground',
                    index === 0 && 'hover:text-primary'
                  )}
                  to={item.href}
                >
                  {item.icon && index === 0 && (
                    <item.icon className="mr-1 h-4 w-4" />
                  )}
                  <span className="max-w-32 truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    'flex items-center',
                    isLast
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.icon && index === 0 && (
                    <item.icon className="mr-1 h-4 w-4" />
                  )}
                  <span className="max-w-32 truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Healthcare-specific breadcrumb variants
export function PatientBreadcrumbs({
  patientId,
  patientName,
  currentSection,
}: {
  patientId: string;
  patientName?: string;
  currentSection?: string;
}) {
  return (
    <nav
      aria-label="Navegação do paciente"
      className="flex items-center space-x-1 text-muted-foreground text-sm"
    >
      <ol className="flex items-center space-x-1">
        <li>
          <Link
            className="flex items-center transition-colors hover:text-foreground"
            to="/"
          >
            <Home className="mr-1 h-4 w-4" />
            Início
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight aria-hidden="true" className="mx-2 h-4 w-4" />
          <Link
            className="transition-colors hover:text-foreground"
            to="/patients"
          >
            Pacientes
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight aria-hidden="true" className="mx-2 h-4 w-4" />
          <Link
            aria-current={currentSection ? undefined : 'page'}
            className={cn(
              'max-w-32 truncate',
              currentSection
                ? 'transition-colors hover:text-foreground'
                : 'font-medium text-foreground'
            )}
            to={`/patients/${patientId}`}
          >
            {patientName || `Paciente ${patientId}`}
          </Link>
        </li>
        {currentSection && (
          <li className="flex items-center">
            <ChevronRight aria-hidden="true" className="mx-2 h-4 w-4" />
            <span aria-current="page" className="font-medium text-foreground">
              {currentSection}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}

export function AppointmentBreadcrumbs({
  appointmentId,
  patientName,
  appointmentDate,
}: {
  appointmentId: string;
  patientName?: string;
  appointmentDate?: string;
}) {
  const displayName = patientName || `Consulta ${appointmentId}`;
  const displayDate = appointmentDate
    ? new Date(appointmentDate).toLocaleDateString('pt-BR')
    : '';

  return (
    <nav
      aria-label="Navegação da consulta"
      className="flex items-center space-x-1 text-muted-foreground text-sm"
    >
      <ol className="flex items-center space-x-1">
        <li>
          <Link
            className="flex items-center transition-colors hover:text-foreground"
            to="/"
          >
            <Home className="mr-1 h-4 w-4" />
            Início
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight aria-hidden="true" className="mx-2 h-4 w-4" />
          <Link
            className="transition-colors hover:text-foreground"
            to="/appointments"
          >
            Consultas
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight aria-hidden="true" className="mx-2 h-4 w-4" />
          <span aria-current="page" className="font-medium text-foreground">
            <span className="max-w-32 truncate">{displayName}</span>
            {displayDate && (
              <span className="ml-1 text-muted-foreground">
                ({displayDate})
              </span>
            )}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// Quick actions breadcrumb for emergency situations
export function EmergencyBreadcrumbs({
  currentAction,
}: {
  currentAction: string;
}) {
  return (
    <nav
      aria-label="Ação de emergência"
      className="flex items-center space-x-1 text-sm"
    >
      <div className="flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-1 text-red-700">
        <span className="font-medium">Emergência:</span>
        <ChevronRight aria-hidden="true" className="mx-1 h-4 w-4" />
        <span>{currentAction}</span>
      </div>
    </nav>
  );
}
