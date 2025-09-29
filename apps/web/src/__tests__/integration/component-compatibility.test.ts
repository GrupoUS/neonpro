/**
 * Integration Test: Component Compatibility with NEONPRO Theme
 * 
 * CRITICAL: THIS TEST MUST FAIL BEFORE IMPLEMENTATION
 * Following TDD: RED → GREEN → REFACTOR
 * 
 * Tests all 7 UI components with NEONPRO theme integration
 */

import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

// These imports WILL FAIL until implementation exists - THIS IS EXPECTED
import { ThemeProvider } from '@/theme-provider';
import { MagicCard } from '@/components/ui/magic-card';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { GradientButton } from '@/components/ui/gradient-button';
import { TiltedCard } from '@/components/ui/tilted-card';
import { Sidebar } from '@/components/ui/sidebar';
import { ShineBorder } from '@/components/ui/shine-border';
import { HoverBorderGradientButton } from '@/components/ui/hover-border-gradient-button';

describe('Component Compatibility with NEONPRO Theme', () => {
  const renderWithTheme = (component: React.ReactNode, theme: 'light' | 'dark' = 'light') => {
    return React.createElement(ThemeProvider, {
      defaultTheme: theme,
      brazilianOptimization: true,
      aestheticClinicMode: true,
      lgpdCompliance: true,
    }, component);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render MagicCard with NEONPRO theme colors', async () => {
    // Act - THIS WILL FAIL until implementation exists
    const { container } = renderWithTheme(
      <MagicCard 
        className="w-64 h-32"
        gradient="linear-gradient(135deg, var(--neonpro-primary), var(--neonpro-accent))"
        constitutional={{ patientData: true, clinicBranding: true }}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-neonpro-deep-blue">Patient Card</h3>
          <p className="text-sm text-neonpro-neutral">LGPD compliant patient information</p>
        </div>
      </MagicCard>
    );

    // Assert
    const magicCard = container.querySelector('[data-component="magic-card"]');
    expect(magicCard).toBeInTheDocument();
    
    const styles = window.getComputedStyle(magicCard!);
    expect(styles.getPropertyValue('--neonpro-primary')).toBeTruthy();
    expect(styles.getPropertyValue('--neonpro-accent')).toBeTruthy();
    
    // Constitutional compliance
    expect(magicCard).toHaveAttribute('data-lgpd-compliant', 'true');
    expect(magicCard).toHaveAttribute('data-patient-data', 'true');

    // Accessibility
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });

  test('should render AnimatedThemeToggler with NEONPRO branding', async () => {
    // Act - THIS WILL FAIL until implementation exists
    renderWithTheme(
      <AnimatedThemeToggler
        size="lg"
        animation="slide"
        showLabel={true}
        themes={['light', 'dark', 'system']}
        className="neonpro-theme-toggler"
      />
    );

    // Assert
    const toggler = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggler).toBeInTheDocument();
    expect(toggler).toHaveClass('neonpro-theme-toggler');
    
    // NEONPRO color inheritance
    const styles = window.getComputedStyle(toggler);
    expect(styles.backgroundColor).toMatch(/oklch\(0\.437/); // NEONPRO primary
  });

  test('should render GradientButton with aesthetic clinic styling', async () => {
    // Act - THIS WILL FAIL until implementation exists
    renderWithTheme(
      <GradientButton
        variant="primary"
        size="lg"
        gradient="linear-gradient(135deg, var(--neonpro-primary), var(--neonpro-accent))"
        constitutional={{ patientConsent: true, clinicAction: true }}
        onClick={vi.fn()}
      >
        Schedule Aesthetic Procedure
      </GradientButton>
    );

    // Assert
    const button = screen.getByRole('button', { name: /schedule aesthetic procedure/i });
    expect(button).toBeInTheDocument();
    
    // Constitutional compliance for medical actions
    expect(button).toHaveAttribute('data-patient-consent', 'true');
    expect(button).toHaveAttribute('data-clinic-action', 'true');
    
    // NEONPRO gradient styling
    const styles = window.getComputedStyle(button);
    expect(styles.backgroundImage).toContain('linear-gradient');
  });

  test('should render TiltedCard with Brazilian mobile optimization', async () => {
    // Act - THIS WILL FAIL until implementation exists
    renderWithTheme(
      <TiltedCard
        className="w-64 h-80"
        tiltAmount={15}
        scaleOnHover={true}
        theme="light"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neonpro-deep-blue">
            Tratamento Facial
          </h3>
          <p className="text-sm text-neonpro-neutral mt-2">
            Procedimento estético com compliance ANVISA
          </p>
        </div>
      </TiltedCard>
    );

    // Assert
    const tiltedCard = screen.getByText('Tratamento Facial').closest('[data-component="tilted-card"]');
    expect(tiltedCard).toBeInTheDocument();
    
    // Brazilian mobile optimization
    expect(tiltedCard).toHaveAttribute('data-brazilian-optimized', 'true');
    expect(tiltedCard).toHaveAttribute('data-mobile-first', 'true');
  });

  test('should render Sidebar with Tabler icons and NEONPRO styling', async () => {
    // Act - THIS WILL FAIL until implementation exists  
    renderWithTheme(
      <Sidebar
        position="left"
        collapsible={true}
        defaultCollapsed={false}
        icons="tabler"
        constitutional={{ patientNavigation: true, clinicWorkflow: true }}
      >
        <nav className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-neonpro-deep-blue">
            Navegação da Clínica
          </h2>
          <div className="space-y-2">
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-neonpro-accent">
              <span>Pacientes</span>
            </a>
            <a href="#" className="flex items-center space-x-2 p-2 rounded hover:bg-neonpro-accent">
              <span>Agendamentos</span>
            </a>
          </div>
        </nav>
      </Sidebar>
    );

    // Assert
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toBeInTheDocument();
    
    // Tabler icons integration
    expect(sidebar).toHaveAttribute('data-icon-library', 'tabler');
    
    // Constitutional compliance for patient navigation
    expect(sidebar).toHaveAttribute('data-patient-navigation', 'true');
    expect(sidebar).toHaveAttribute('data-clinic-workflow', 'true');
  });

  test('should render ShineBorder with NEONPRO gold accent', async () => {
    // Act - THIS WILL FAIL until implementation exists
    renderWithTheme(
      <ShineBorder
        borderWidth={2}
        borderRadius={12}
        duration={14}
        shineColor="var(--neonpro-primary)"
        theme="gold"
      >
        <div className="p-6 bg-neonpro-background">
          <h3 className="text-neonpro-deep-blue font-semibold">
            Premium Aesthetic Service
          </h3>
          <p className="text-neonpro-neutral mt-2">
            Luxury clinic experience with constitutional compliance
          </p>
        </div>
      </ShineBorder>
    );

    // Assert
    const shineBorder = screen.getByText('Premium Aesthetic Service').closest('[data-component="shine-border"]');
    expect(shineBorder).toBeInTheDocument();
    
    // NEONPRO gold theme
    expect(shineBorder).toHaveAttribute('data-theme', 'gold');
    
    const styles = window.getComputedStyle(shineBorder!);
    expect(styles.getPropertyValue('--shine-color')).toContain('--neonpro-primary');
  });

  test('should render HoverBorderGradientButton with aesthetic branding', async () => {
    // Act - THIS WILL FAIL until implementation exists
    renderWithTheme(
      <HoverBorderGradientButton
        variant="primary"
        size="md"
        className="neonpro-gradient-btn"
      >
        Consulta Estética
      </HoverBorderGradientButton>
    );

    // Assert
    const gradientBtn = screen.getByRole('button', { name: /consulta estética/i });
    expect(gradientBtn).toBeInTheDocument();
    expect(gradientBtn).toHaveClass('neonpro-gradient-btn');
    
    // Hover border gradient with NEONPRO colors
    const styles = window.getComputedStyle(gradientBtn);
    expect(styles.getPropertyValue('--border-gradient-from')).toContain('--neonpro-primary');
    expect(styles.getPropertyValue('--border-gradient-to')).toContain('--neonpro-accent');
  });

  test('should maintain component compatibility across light/dark theme switch', async () => {
    // Arrange
    const TestAllComponents = () => (
      <div>
        <MagicCard>Light/Dark Test</MagicCard>
        <GradientButton>Theme Switch Button</GradientButton>
        <TiltedCard>Responsive Card</TiltedCard>
      </div>
    );

    // Act - Light theme
    const { rerender } = renderWithTheme(<TestAllComponents />, 'light');
    
    // Assert light theme
    expect(document.documentElement).toHaveClass('light');
    const lightCard = screen.getByText('Light/Dark Test').closest('[data-component="magic-card"]');
    expect(lightCard).toHaveAttribute('data-theme', 'light');

    // Act - Switch to dark theme
    rerender(
      <ThemeProvider defaultTheme="dark" brazilianOptimization={true}>
        <TestAllComponents />
      </ThemeProvider>
    );

    // Assert dark theme
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    
    const darkCard = screen.getByText('Light/Dark Test').closest('[data-component="magic-card"]');
    expect(darkCard).toHaveAttribute('data-theme', 'dark');
  });

  test('should support Framer Motion v11.0.0 compatibility across all components', async () => {
    // Act - THIS WILL FAIL until implementation exists
    renderWithTheme(
      <div>
        <TiltedCard tiltAmount={15} scaleOnHover={true}>
          Framer Motion Test
        </TiltedCard>
        <AnimatedThemeToggler animation="slide" />
        <ShineBorder duration={14}>
          Animation Test
        </ShineBorder>
      </div>
    );

    // Assert Framer Motion compatibility
    const animatedElements = document.querySelectorAll('[data-framer-motion="true"]');
    
    animatedElements.forEach(element => {
      expect(element).toHaveAttribute('data-framer-version', '11.0.0');
      expect(element).toHaveAttribute('data-motion-compatible', 'true');
    });
  });

  test('should validate constitutional compliance across all components', async () => {
    // Act - THIS WILL FAIL until implementation exists
    const { container } = renderWithTheme(
      <div data-testid="compliance-container">
        <MagicCard constitutional={{ patientData: true }}>Patient Data</MagicCard>
        <GradientButton constitutional={{ clinicAction: true }}>Clinical Action</GradientButton>
        <Sidebar constitutional={{ patientNavigation: true }}>Navigation</Sidebar>
      </div>
    );

    // Assert constitutional compliance
    const complianceContainer = screen.getByTestId('compliance-container');
    
    // LGPD compliance
    expect(complianceContainer).toHaveAttribute('data-lgpd-compliant', 'true');
    
    // ANVISA compliance
    expect(complianceContainer).toHaveAttribute('data-anvisa-compliant', 'true');
    
    // Aesthetic clinic optimization
    expect(complianceContainer).toHaveAttribute('data-aesthetic-clinic', 'true');
    
    // Brazilian mobile-first
    expect(complianceContainer).toHaveAttribute('data-brazilian-optimized', 'true');

    // Accessibility compliance
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });
});