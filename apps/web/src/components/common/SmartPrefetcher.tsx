import { HealthcareRoutePrefetcher } from '@/lib/prefetching/route-prefetcher';
import { queryClient } from '@/lib/query-client';
import { appointmentDetailsQueryOptions } from '@/queries/appointments';
import { patientDetailsQueryOptions, patientsQueryOptions } from '@/queries/patients';
import type { Appointment } from '@neonpro/types';
import React, { useEffect } from 'react';

interface SmartPrefetcherProps {
  /**
   * Tipo de dado para prefetch
   */
  type:
    | 'patient'
    | 'appointment'
    | 'patients-list'
    | 'appointments-list'
    | 'dashboard';

  /**
   * ID do paciente (apenas para type 'patient')
   */
  patientId?: string;

  /**
   * ID do agendamento (apenas para type 'appointment')
   */
  appointmentId?: string;

  /**
   * Gatilho para prefetch (hover, visible, immediate)
   */
  trigger?: 'hover' | 'visible' | 'immediate';

  /**
   * Delay antes do prefetch (em ms)
   */
  delay?: number;

  /**
   * Se deve prefetch dados relacionados
   */
  includeRelated?: boolean;

  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * Componente inteligente para prefetching de dados
 *
 * Este componente gerencia o prefetching otimizado baseado em
 * diferentes gatilhos e contextos para melhorar a performance
 */
export function SmartPrefetcher({
  type,
  patientId,
  appointmentId,
  trigger = 'hover',
  delay = 200,
  includeRelated = false,
  children,
  className = '',
  ...props
}: SmartPrefetcherProps) {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const [hasPrefetched, setHasPrefetched] = React.useState(false);

  const executePrefetch = React.useCallback(() => {
    if (hasPrefetched) return;

    switch (type) {
      case 'patient':
        if (patientId) {
          queryClient.prefetchQuery(patientDetailsQueryOptions(patientId));
          if (includeRelated) {
            HealthcareRoutePrefetcher.prefetchRelatedPatientData(patientId);
          }
        }
        break;

      case 'appointment':
        if (appointmentId) {
          queryClient.prefetchQuery(
            appointmentDetailsQueryOptions(appointmentId),
          );
        }
        break;

      case 'patients-list':
        queryClient.prefetchQuery(
          patientsQueryOptions({
            page: 1,
            pageSize: 10,
            sortBy: 'created_at',
            sortOrder: 'desc',
          }),
        );
        break;

      case 'appointments-list':
        HealthcareRoutePrefetcher.prefetchAppointmentsData();
        break;

      case 'dashboard':
        HealthcareRoutePrefetcher.prefetchDashboardData();
        break;
    }

    setHasPrefetched(true);
  }, [type, patientId, appointmentId, includeRelated, hasPrefetched]);

  const handleMouseEnter = React.useCallback(() => {
    if (trigger === 'hover' && !hasPrefetched) {
      timeoutRef.current = setTimeout(executePrefetch, delay);
    }
  }, [trigger, hasPrefetched, delay, executePrefetch]);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Prefetch imediato quando o componente é montado
  useEffect(() => {
    if (trigger === 'immediate' && !hasPrefetched) {
      executePrefetch();
    }
  }, [trigger, hasPrefetched, executePrefetch]);

  // Prefetch baseado em visibilidade (Intersection Observer)
  useEffect(() => {
    if (trigger === 'visible' && !hasPrefetched) {
      const element = document.currentScript?.previousElementSibling;
      if (!element) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(_entry => {
            if (entry.isIntersecting) {
              executePrefetch();
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '100px',
          threshold: 0.1,
        },
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }
  }, [trigger, hasPrefetched, executePrefetch]);

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-prefetch-type={type}
      data-prefetched={hasPrefetched}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Link com prefetching inteligente para pacientes
 */
export function PatientLink({
  patient,
  children,
  className = '',
  includeRelated = false,
}: {
  patient: Patient | { id: string; name?: string };
  children: React.ReactNode;
  className?: string;
  includeRelated?: boolean;
}) {
  return (
    <SmartPrefetcher
      type='patient'
      patientId={patient.id}
      trigger='hover'
      delay={300}
      includeRelated={includeRelated}
      className='inline-block'
    >
      <a
        href={`/patients/${patient.id}`}
        className={className}
        data-patient-id={patient.id}
      >
        {children}
      </a>
    </SmartPrefetcher>
  );
}

/**
 * Link com prefetching inteligente para agendamentos
 */
export function AppointmentLink({
  appointment,
  children,
  className = '',
  includeRelated = false,
}: {
  appointment: Appointment | { id: string };
  children: React.ReactNode;
  className?: string;
  includeRelated?: boolean;
}) {
  return (
    <SmartPrefetcher
      type='appointment'
      appointmentId={appointment.id}
      trigger='hover'
      delay={300}
      includeRelated={includeRelated}
      className='inline-block'
    >
      <a
        href={`/appointments/${appointment.id}`}
        className={className}
        data-appointment-id={appointment.id}
      >
        {children}
      </a>
    </SmartPrefetcher>
  );
}

/**
 * Componente para prefetching baseado em scroll
 */
export function ScrollPrefetcher({
  children,
  prefetchData,
  threshold = 0.8,
}: {
  children: React.ReactNode;
  prefetchData: () => void;
  threshold?: number;
}) {
  const [hasPrefetched, setHasPrefetched] = React.useState(false);

  useEffect(() => {
    if (hasPrefetched) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= threshold && !hasPrefetched) {
        prefetchData();
        setHasPrefetched(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasPrefetched, prefetchData, threshold]);

  return <>{children}</>;
}

/**
 * Hook para prefetching baseado em condições personalizadas
 */
export function useConditionalPrefetch<T>(
  condition: T | null | undefined,
  prefetchFn: (data: T) => void,
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    if (condition) {
      prefetchFn(condition);
    }
  }, [condition, prefetchFn, ...deps]);
}
