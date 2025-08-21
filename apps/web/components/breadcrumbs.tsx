/**
 * 🍞 Breadcrumbs Navigation - NeonPro Healthcare
 * =============================================
 * 
 * Dynamic breadcrumb navigation with healthcare context,
 * role-based visibility, and accessibility features.
 */

'use client';

import React from 'react';
import { Link, useLocation, useParams } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
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
        icon: Home 
      }
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
        'dashboard': 'Dashboard',
        'patients': 'Pacientes',
        'appointments': 'Consultas',
        'professionals': 'Profissionais',
        'compliance': 'Conformidade',
        'settings': 'Configurações',
        'analytics': 'Analytics',
        'new': 'Novo',
        'edit': 'Editar',
        'profile': 'Perfil',
        'security': 'Segurança',
        'clinic': 'Clínica',
        'integrations': 'Integrações',
        'lgpd': 'LGPD',
        'anvisa': 'ANVISA',
        'cfm': 'CFM',
        'reports': 'Relatórios',
        'schedule': 'Agendar',
        'calendar': 'Calendário',
        'overview': 'Visão Geral',
        'medical-records': 'Prontuário',
        'performance': 'Desempenho',
      };
      
      label = translations[label] || label;
      
      // Don't create links for certain segments that are not navigable
      const nonNavigableSegments = ['edit', 'new'];
      const href = nonNavigableSegments.includes(segment) ? undefined : currentPath;
      
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
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="h-4 w-4 mx-2" 
                  aria-hidden="true" 
                />
              )}
              
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center hover:text-foreground transition-colors",
                    index === 0 && "hover:text-primary"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && index === 0 && (
                    <item.icon className="h-4 w-4 mr-1" />
                  )}
                  <span className="truncate max-w-32">{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    "flex items-center",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && index === 0 && (
                    <item.icon className="h-4 w-4 mr-1" />
                  )}
                  <span className="truncate max-w-32">{item.label}</span>
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
  currentSection 
}: { 
  patientId: string;
  patientName?: string;
  currentSection?: string;
}) {
  return (
    <nav aria-label="Navegação do paciente" className="flex items-center space-x-1 text-sm text-muted-foreground">
      <ol className="flex items-center space-x-1">
        <li>
          <Link to="/" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Início
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
          <Link to="/patients" className="hover:text-foreground transition-colors">
            Pacientes
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
          <Link 
            to={`/patients/${patientId}`} 
            className={cn(
              "truncate max-w-32",
              currentSection ? "hover:text-foreground transition-colors" : "text-foreground font-medium"
            )}
            aria-current={!currentSection ? "page" : undefined}
          >
            {patientName || `Paciente ${patientId}`}
          </Link>
        </li>
        {currentSection && (
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
            <span className="text-foreground font-medium" aria-current="page">
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
  appointmentDate 
}: { 
  appointmentId: string;
  patientName?: string;
  appointmentDate?: string;
}) {
  const displayName = patientName || `Consulta ${appointmentId}`;
  const displayDate = appointmentDate ? new Date(appointmentDate).toLocaleDateString('pt-BR') : '';
  
  return (
    <nav aria-label="Navegação da consulta" className="flex items-center space-x-1 text-sm text-muted-foreground">
      <ol className="flex items-center space-x-1">
        <li>
          <Link to="/" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Início
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
          <Link to="/appointments" className="hover:text-foreground transition-colors">
            Consultas
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
          <span className="text-foreground font-medium" aria-current="page">
            <span className="truncate max-w-32">{displayName}</span>
            {displayDate && <span className="text-muted-foreground ml-1">({displayDate})</span>}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// Quick actions breadcrumb for emergency situations
export function EmergencyBreadcrumbs({ 
  currentAction 
}: { 
  currentAction: string;
}) {
  return (
    <nav aria-label="Ação de emergência" className="flex items-center space-x-1 text-sm">
      <div className="flex items-center bg-red-50 text-red-700 px-2 py-1 rounded-md border border-red-200">
        <span className="font-medium">Emergência:</span>
        <ChevronRight className="h-4 w-4 mx-1" aria-hidden="true" />
        <span>{currentAction}</span>
      </div>
    </nav>
  );
}