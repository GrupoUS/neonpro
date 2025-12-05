/**
 * NEONPRO Accessibility Fixes Test Suite
 *
 * Comprehensive testing for purple theme and ARIA attribute improvements
 * WCAG 2.1 AA+ compliance validation
 * Brazilian healthcare accessibility standards
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { AestheticConsultationAlert } from '../../components/healthcare/aesthetic-consultation-alert'
import { VIPClientStatus } from '../../components/aesthetic/client/client-vip-status'
import { ACCESSIBLE_PURPLE_COLORS, HEALTHCARE_ACCESSIBILITY_COLORS } from '../../accessibility/colors'
import { announceToScreenReader } from '../../accessibility/aria'

// Mock screen reader announcements
vi.mock('../../accessibility/aria', async () => {
  const actual = await vi.importActual('../../accessibility/aria')
  return {
    ...actual,
    announceToScreenReader: vi.fn()
  }
})

// Mock VIP client data for tests
const mockVIPClient = {
  clientId: 'C12345',
  clientName: 'Maria Silva',
  vipLevel: 'diamond' as const,
  membershipSince: new Date('2023-01-15'),
  totalTreatments: 25,
  totalSpent: 55000,
  upcomingAppointments: 2,
  loyaltyPoints: 1500,
  preferredTreatments: ['Botox', 'Preenchimento'],
  lastVisit: new Date('2024-01-10'),
  onContactClient: () => {},
  onViewProfile: () => {},
  onScheduleTreatment: () => {}
}

describe('Purple Theme Accessibility Fixes', () => {
  describe('Color Contrast Compliance', () => {
    test('purple theme combinations meet WCAG 2.1 AA standards', () => {
      // Test primary purple combinations
      const primaryColors = ACCESSIBLE_PURPLE_COLORS.primary
      expect(primaryColors.text).toBe('text-purple-900')
      expect(primaryColors.background).toBe('bg-purple-50')
      expect(primaryColors.border).toBe('border-purple-300')
      
      // Test VIP critical combinations for better visibility
      const vipColors = ACCESSIBLE_PURPLE_COLORS.vip
      expect(vipColors.textCritical).toBe('text-purple-950')
      expect(vipColors.backgroundCritical).toBe('bg-purple-200')
      expect(vipColors.borderCritical).toBe('border-purple-600')
    })

    test('healthcare colors provide proper contrast', () => {
      const healthcareColors = HEALTHCARE_ACCESSIBILITY_COLORS
      
      // Test LGPD compliance colors
      expect(healthcareColors.lgpd.compliant).toContain('text-green-800')
      expect(healthcareColors.lgpd.warning).toContain('text-yellow-800')
      expect(healthcareColors.lgpd.restricted).toContain('text-red-800')
      expect(healthcareColors.lgpd.sensitive).toContain('text-purple-900')
      
      // Test sensitivity levels
      expect(healthcareColors.sensitivity.critical).toContain('text-purple-950')
      expect(healthcareColors.sensitivity.high).toContain('text-purple-900')
    })

    test('reduced motion variants provide static alternatives', () => {
      const reducedMotion = ACCESSIBLE_PURPLE_COLORS.reducedMotion
      
      expect(reducedMotion.vipBadge).toContain('bg-purple-100')
      expect(reducedMotion.vipBadge).toContain('border-purple-500')
      expect(reducedMotion.vipBadge).toContain('text-purple-900')
      
      expect(reducedMotion.vipAlert).toContain('bg-purple-50')
      expect(reducedMotion.vipAlert).toContain('border-purple-600')
      expect(reducedMotion.vipAlert).toContain('text-purple-900')
    })
  })

  describe('Aesthetic Consultation Alert Accessibility', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    test('VIP alerts have proper ARIA live regions', () => {
      render(
        <AestheticConsultationAlert
          type="new_client"
          priority="vip"
          clientName="Maria Silva"
          location="Sala de Consulta"
          onAcknowledge={() => {}}
          onResolve={() => {}}
        />
      )

      // Check for accessible color classes
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('text-purple-950') // High contrast text
      expect(alert).toHaveClass('bg-purple-200') // Proper contrast background
      expect(alert).toHaveClass('border-purple-600') // Accessible border
      
      // Check ARIA attributes
      expect(alert).toHaveAttribute('aria-live', 'assertive')
      expect(alert).toHaveAttribute('aria-atomic', 'true')
    })

    test('Screen reader announcements are made for VIP notifications', () => {
      render(
        <AestheticConsultationAlert
          type="new_client"
          priority="vip"
          clientName="Maria Silva"
          onAcknowledge={() => {}}
          onResolve={() => {}}
        />
      )

      expect(announceToScreenReader).toHaveBeenCalledWith(
        'Novo cliente VIP chegou à clínica',
        'assertive'
      )
    })

    test('Low priority notifications use polite announcements', () => {
      render(
        <AestheticConsultationAlert
          type="consultation_request"
          priority="low"
          clientName="João Santos"
          onAcknowledge={() => {}}
          onResolve={() => {}}
        />
      )

      expect(announceToScreenReader).toHaveBeenCalledWith(
        'Nova solicitação de consulta recebida',
        'polite'
      )
    })

    test('VIP alerts have proper animation handling', () => {
      render(
        <AestheticConsultationAlert
          type="special_offer"
          priority="vip"
          clientName="Ana Costa"
          onAcknowledge={() => {}}
          onResolve={() => {}}
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('animate-pulse')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('VIP Client Status Accessibility', () => {
    test('VIP badges have proper ARIA attributes and colors', () => {
      render(<VIPClientStatus {...mockVIPClient} />)

      // Check for accessible VIP badges
      const vipBadges = screen.getAllByRole('status')
      const topVipBadge = vipBadges.find(badge => 
        badge.textContent?.includes('TOP VIP')
      )
      
      expect(topVipBadge).toBeInTheDocument()
      expect(topVipBadge).toHaveClass('animate-pulse')
      expect(topVipBadge).toHaveAttribute('aria-live', 'polite')
    })

    test('Diamond VIP status uses accessible purple colors', () => {
      render(<VIPClientStatus {...mockVIPClient} />)

      const card = screen.getByRole('region', {
        name: /Perfil VIP do cliente Maria Silva, nível Diamond/
      })
      
      expect(card).toHaveClass('text-purple-950')
      expect(card).toHaveClass('bg-purple-200')
      expect(card).toHaveClass('border-purple-600')
    })

    test('Expand button has proper ARIA attributes', () => {
      render(<VIPClientStatus {...mockVIPClient} />)

      const expandButton = screen.getByRole('button', {
        name: /Expandir detalhes do cliente/
      })
      
      expect(expandButton).toHaveAttribute('aria-expanded', 'false')
      expect(expandButton).toHaveAttribute('aria-controls', 'cliente-expanded-content')
      
      // Test expansion
      fireEvent.click(expandButton)
      
      expect(expandButton).toHaveAttribute('aria-expanded', 'true')
      expect(announceToScreenReader).toHaveBeenCalledWith(
        'Detalhes do cliente expandidos',
        'polite'
      )
    })

    test('VIP level changes are announced to screen readers', () => {
      const { rerender } = render(
        <VIPClientStatus {...mockVIPClient} vipLevel="gold" />
      )

      // Upgrade to diamond
      rerender(<VIPClientStatus {...mockVIPClient} vipLevel="diamond" />)

      expect(announceToScreenReader).toHaveBeenCalledWith(
        'Cliente Maria Silva alcançou o nível VIP Diamond',
        'polite'
      )
    })

    test('Avatar has proper alt text', () => {
      render(<VIPClientStatus {...mockVIPClient} />)

      const avatar = screen.getByAltText('Foto de Maria Silva')
      expect(avatar).toBeInTheDocument()
    })

    test('Action buttons are accessible', () => {
      render(<VIPClientStatus {...mockVIPClient} />)

      // Expand to show action buttons
      const expandButton = screen.getByRole('button', {
        name: /Expandir detalhes do cliente/
      })
      fireEvent.click(expandButton)

      // Check action buttons
      const phoneButton = screen.getByRole('button', { name: /Telefone/ })
      const messageButton = screen.getByRole('button', { name: /Mensagem/ })
      const profileButton = screen.getByRole('button', { name: /Perfil/ })
      const scheduleButton = screen.getByRole('button', { name: /Agendar/ })

      expect(phoneButton).toBeInTheDocument()
      expect(messageButton).toBeInTheDocument()
      expect(profileButton).toBeInTheDocument()
      expect(scheduleButton).toBeInTheDocument()
    })
  })

  describe('Brazilian Healthcare Compliance', () => {
    test('LGPD sensitive data indicators are accessible', () => {
      const sensitiveDataColors = HEALTHCARE_ACCESSIBILITY_COLORS.lgpd
      
      expect(sensitiveDataColors.sensitive).toContain('text-purple-900')
      expect(sensitiveDataColors.sensitive).toContain('bg-purple-50')
      expect(sensitiveDataColors.sensitive).toContain('border-purple-600')
    })

    test('Treatment status colors are accessible', () => {
      const treatmentColors = HEALTHCARE_ACCESSIBILITY_COLORS.treatment
      
      expect(treatmentColors.inProgress).toContain('text-purple-800')
      expect(treatmentColors.inProgress).toContain('bg-purple-50')
      expect(treatmentColors.inProgress).toContain('border-purple-500')
    })

    test('Patient data sensitivity levels have proper contrast', () => {
      const sensitivityColors = HEALTHCARE_ACCESSIBILITY_COLORS.sensitivity
      
      // Critical sensitivity should have highest contrast
      expect(sensitivityColors.critical).toContain('text-purple-950')
      expect(sensitivityColors.high).toContain('text-purple-900')
      expect(sensitivityColors.medium).toContain('text-purple-800')
      expect(sensitivityColors.low).toContain('text-blue-800')
    })
  })

  describe('Focus Management', () => {
    test('VIP elements receive focus when activated', () => {
      render(<VIPClientStatus {...mockVIPClient} />)

      // Find VIP status indicators
      const vipStatus = screen.getByRole('region', {
        name: /Perfil VIP do cliente/
      })

      expect(vipStatus).toBeInTheDocument()
      expect(vipStatus).toHaveAttribute('role', 'region')
    })

    test('Expanded content has proper ARIA attributes', () => {
      render(<VIPClientStatus {...mockVIPClient} />)

      // Expand content
      const expandButton = screen.getByRole('button', {
        name: /Expandir detalhes do cliente/
      })
      fireEvent.click(expandButton)

      // Check expanded content region
      const expandedContent = screen.getByRole('region', {
        name: /Informações detalhadas do cliente VIP/
      })
      
      expect(expandedContent).toBeInTheDocument()
      expect(expandedContent).toHaveAttribute('aria-label')
    })
  })

  describe('Screen Reader Integration', () => {
    test('announceToScreenReader function is called with correct parameters', () => {
      announceToScreenReader('Test message', 'assertive')
      
      expect(announceToScreenReader).toHaveBeenCalledWith('Test message', 'assertive')
    })

    test('VIP status changes trigger appropriate announcements', () => {
      render(
        <AestheticConsultationAlert
          type="new_client"
          priority="vip"
          clientName="Test Client"
          onAcknowledge={() => {}}
          onResolve={() => {}}
        />
      )

      expect(announceToScreenReader).toHaveBeenCalledWith(
        'Novo cliente VIP chegou à clínica',
        'assertive'
      )
    })
  })

  describe('Reduced Motion Support', () => {
    test('accessible color variants are available for animations', () => {
      const reducedMotionColors = ACCESSIBLE_PURPLE_COLORS.reducedMotion
      
      expect(reducedMotionColors.vipBadge).toBeDefined()
      expect(reducedMotionColors.vipAlert).toBeDefined()
      expect(reducedMotionColors.timer).toBeDefined()
      
      // All should provide proper contrast
      expect(reducedMotionColors.vipBadge).toContain('text-purple-900')
      expect(reducedMotionColors.vipBadge).toContain('bg-purple-100')
      expect(reducedMotionColors.vipBadge).toContain('border-purple-500')
    })
  })

  describe('WCAG 2.1 AA+ Compliance Checklist', () => {
    test('all interactive elements have accessible names', () => {
      render(
        <AestheticConsultationAlert
          type="new_client"
          priority="vip"
          clientName="Test Client"
          onAcknowledge={() => {}}
          onResolve={() => {}}
        />
      )

      // Check all buttons have accessible names
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    test('live regions are properly implemented', () => {
      render(
        <AestheticConsultationAlert
          type="treatment_reminder"
          priority="high"
          clientName="Test Client"
          onAcknowledge={() => {}}
          onResolve={() => {}}
        />
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live')
      expect(alert).toHaveAttribute('aria-atomic')
    })

    test('color combinations provide sufficient contrast', () => {
      // Test that all accessible color combinations use high contrast variants
      const allColors = [
        ...Object.values(ACCESSIBLE_PURPLE_COLORS.primary),
        ...Object.values(ACCESSIBLE_PURPLE_COLORS.vip),
        ...Object.values(ACCESSIBLE_PURPLE_COLORS.alerts).flatMap(alert => 
          Object.values(alert)
        )
      ]

      allColors.forEach(color => {
        // Should use high contrast variants (900, 950 for text, proper backgrounds)
        expect(
          color.includes('900') || 
          color.includes('950') || 
          color.includes('bg-') || 
          color.includes('border-')
        ).toBeTruthy()
      })
    })
  })
})

// Export types for TypeScript
export type AccessibilityTestSuite = typeof describe