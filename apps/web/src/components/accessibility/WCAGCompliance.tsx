/**
 * WCAG 2.1 AA+ Accessibility Compliance Component (T080)
 *
 * Provides accessibility utilities and features for healthcare applications
 * with Brazilian healthcare context (LGPD, ANVISA, CFM compliance)
 */

import { useLocation } from '@tanstack/react-router';
import React, { useEffect, useRef } from 'react';

interface WCAGProps {
  children: React.ReactNode;
}

export function WCAGCompliance({ children }: WCAGProps) {
  const location = useLocation();
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(_() => {
    // Set up keyboard navigation
    const handleFirstTab = (_e: any) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    };

    window.addEventListener('keydown', handleFirstTab);

    // Focus management for dynamic content
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
    };
  }, [location]);

  const handleSkipLinkClick = () => {
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  };

  return (
    <>
      {/* Skip to main content link */}
      <a
        ref={skipLinkRef}
        href='#main-content'
        onClick={handleSkipLinkClick}
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50'
      >
        Pular para o conteúdo principal
      </a>

      {/* High contrast mode toggle */}
      <button
        aria-label='Alternar modo alto contraste'
        className='fixed top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity'
        onClick={() => {
          document.documentElement.classList.toggle('high-contrast');
          localStorage.setItem(
            'high-contrast',
            document.documentElement.classList.contains('high-contrast')
              ? 'true'
              : 'false',
          );
        }}
      >
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
          />
        </svg>
      </button>

      {/* Font size controls */}
      <div className='fixed bottom-4 right-4 z-50 flex gap-2'>
        <button
          aria-label='Diminuir fonte'
          className='p-2 bg-gray-800 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity'
          onClick={() => {
            const root = document.documentElement;
            const currentSize = parseInt(getComputedStyle(root).fontSize);
            root.style.fontSize = `${Math.max(14, currentSize - 2)}px`;
          }}
        >
          A-
        </button>
        <button
          aria-label='Aumentar fonte'
          className='p-2 bg-gray-800 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity'
          onClick={() => {
            const root = document.documentElement;
            const currentSize = parseInt(getComputedStyle(root).fontSize);
            root.style.fontSize = `${Math.min(24, currentSize + 2)}px`;
          }}
        >
          A+
        </button>
      </div>

      {children}

      {/* Screen reader announcements */}
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        id='sr-announcements'
      />
    </>
  );
}

// Accessibility utilities
export const _ariaLabels = {
  patientSearch: 'Buscar pacientes',
  patientCard: {
    viewDetails: 'Ver detalhes do paciente',
    edit: 'Editar paciente',
    delete: 'Excluir paciente',
    contact: 'Contatar paciente',
  },
  appointment: {
    schedule: 'Agendar consulta',
    reschedule: 'Reagendar consulta',
    cancel: 'Cancelar consulta',
    viewDetails: 'Ver detalhes da consulta',
  },
  aiChat: {
    send: 'Enviar mensagem',
    attach: 'Anexar arquivo',
    clear: 'Limpar conversa',
    voice: 'Entrada de voz',
  },
  navigation: {
    menu: 'Menu principal',
    dashboard: 'Painel de pacientes',
    appointments: 'Agendamentos',
    aiInsights: 'Insights de IA',
    settings: 'Configurações',
  },
};

// Keyboard navigation helpers
export function useKeyboardNavigation(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onEnter?.();
        break;
      case ' ':
        e.preventDefault();
        onSpace?.();
        break;
      case 'Escape':
        e.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown?.();
        break;
    }
  };

  return { handleKeyDown };
}

// Focus trap utility for modals
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  useEffect(_() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (_e: any) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [containerRef]);
}

// Screen reader utility
export function announceToScreenReader(message: string) {
  const announcement = document.getElementById('sr-announcements');
  if (announcement) {
    announcement.textContent = message;
    setTimeout(_() => {
      announcement.textContent = '';
    }, 1000);
  }
}

// Color contrast checker
export function checkColorContrast(
  foreground: string,
  background: string,
  minimumRatio = 4.5,
): boolean {
  // Simplified contrast check - in production, use a proper library
  // This is a placeholder implementation
  return true;
}

// Reduced motion preference
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = React.useState(false);

  useEffect(_() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
