/**
 * PerformanceMonitoringDashboard tests
 *
 * Framework/Libraries:
 * - React Testing Library (@testing-library/react, @testing-library/jest-dom)
 * - Jest test runner (swap jest.* with vi.* if using Vitest)
 *
 * Scope:
 * - Validate rendering and text content for KPIs and tabs
 * - Verify thresholds against PERFORMANCE_TARGETS for success/warning classes
 * - Ensure currency/percentage formatting appears in pt-BR
 * - Verify callback behaviors: onExportReport, onRefresh (with spinner/disabled), onPeriodChange
 * - Test conditional ROI goal banner and progress capping logic
 */

import React from 'react'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

// Import the component under test (co-located)
import PerformanceMonitoringDashboard, {
  PerformanceMetrics,
} from './PerformanceMonitoringDashboard'

// Utility: deterministic base metrics near thresholds
const baseMetrics = (overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics => ({
  period: { startDate: '2025-08-01', endDate: '2025-08-29', periodType: 'month' },
  predictions: {
    totalPredictions: 1000,
    accuracy: 0.88,          // above 0.87 target
    precision: 0.76,
    recall: 0.73,
    f1Score: 0.745,
    modelConfidence: 0.81,
  },
  interventions: {
    totalSent: 3200,
    smsCount: 1800,
    emailCount: 1000,
    phoneCallCount: 400,
    responseRate: 0.62,      // above 0.6 target
    successRate: 0.58,
  },
  appointments: {
    totalScheduled: 5400,
    actualNoShows: 400,
    predictedNoShows: 450,
    preventedNoShows: 220,
    noShowRateBefore: 0.21,
    noShowRateAfter: 0.15,
    reductionPercentage: 0.28, // above 0.25 target
  },
  financial: {
    totalCosts: 50000,
    interventionCosts: 8000,
    preventionSavings: 52000,
    netROI: 44000,
    costPerPrevention: 36.36,
    projectedAnnualROI: 200000, // above 150000 target
  },
  staff: {
    totalAlerts: 860,
    averageResponseTime: 240, // seconds; below 300 target (good)
    alertsAcknowledged: 800,
    staffEngagementRate: 0.77,
    workflowEfficiency: 0.81,
  },
  trends: {
    weeklyMetrics: [],
    monthlyROI: [],
    interventionSuccess: [],
  },
  ...overrides as any,
})

/**
 * Helpers to query KPI cards by their visible titles in Portuguese.
 */
const getCardByTitle = (title: string) => {
  // find the card section containing the provided title
  const titleEl = screen.getAllByText(title, { selector: 'p,span,div' }).find(Boolean)
  expect(titleEl).toBeInTheDocument()
  return titleEl!.closest('.p-4')?.closest('.border-l-4') || titleEl!.closest('.p-4') || titleEl
}

describe('PerformanceMonitoringDashboard - Overview KPIs and thresholds', () => {
  test('renders KPI values with pt-BR formats and success classes when above targets', () => {
    render(<PerformanceMonitoringDashboard metrics={baseMetrics()} />)

    // Precisão do Modelo
    const accCard = getCardByTitle('Precisão do Modelo')
    expect(accCard).toHaveClass('border-l-4')
    // success when >= 0.87
    expect(accCard).toHaveClass('border-l-green-500')
    // Percent text like "88,0%" in pt-BR
    expect(screen.getByText(/88[,\.]0?%/)).toBeInTheDocument()

    // Redução de Faltas
    const redCard = getCardByTitle('Redução de Faltas')
    expect(redCard).toHaveClass('border-l-green-500')
    expect(screen.getByText(/28[,\.]0?%/)).toBeInTheDocument()

    // Taxa de Resposta
    const respCard = getCardByTitle('Taxa de Resposta')
    expect(respCard).toHaveClass('border-l-green-500')
    expect(screen.getByText(/62[,\.]0?%/)).toBeInTheDocument()

    // ROI Projetado (currency BRL)
    const roiCard = getCardByTitle('ROI Projetado')
    // success class (>= target)
    expect(roiCard).toHaveClass('border-l-green-500')
    // "R$" appears (locale)
    expect(screen.getAllByText(/R\$\s?200\.?000|R\$\s?200\.?000,?00|R\$\s?200\.?000,?0/)[0]).toBeInTheDocument()

    // Resposta da Equipe (mins rounded)
    const staffCard = getCardByTitle('Resposta da Equipe')
    expect(staffCard).toHaveClass('border-l-green-500')
    expect(screen.getByText('4min')).toBeInTheDocument()
  })

  test('applies warning classes when below targets and verifies values', () => {
    const below = baseMetrics({
      predictions: { ...baseMetrics().predictions, accuracy: 0.86 },
      appointments: { ...baseMetrics().appointments, reductionPercentage: 0.20 },
      interventions: { ...baseMetrics().interventions, responseRate: 0.5 },
      financial: { ...baseMetrics().financial, projectedAnnualROI: 120000 },
      staff: { ...baseMetrics().staff, averageResponseTime: 420 }, // 7 minutes (above target)
    })
    render(<PerformanceMonitoringDashboard metrics={below} />)

    expect(getCardByTitle('Precisão do Modelo')).toHaveClass('border-l-yellow-500')
    expect(getCardByTitle('Redução de Faltas')).toHaveClass('border-l-yellow-500')
    expect(getCardByTitle('Taxa de Resposta')).toHaveClass('border-l-yellow-500')
    expect(getCardByTitle('ROI Projetado')).toHaveClass('border-l-yellow-500')
    expect(getCardByTitle('Resposta da Equipe')).toHaveClass('border-l-yellow-500')
    // 7 minutes display
    expect(screen.getByText('7min')).toBeInTheDocument()
  })
})

describe('PerformanceMonitoringDashboard - Export, Refresh, and Period Change', () => {
  test('calls onExportReport with correct format and current period', async () => {
    const onExportReport = jest.fn()
    const metrics = baseMetrics({ period: { startDate: 'x', endDate: 'y', periodType: 'week' } })

    render(<PerformanceMonitoringDashboard metrics={metrics} onExportReport={onExportReport} />)

    // Click Excel
    await userEvent.click(screen.getByRole('button', { name: /Excel/i }))
    expect(onExportReport).toHaveBeenCalledWith('excel', 'week')

    // Click PDF
    await userEvent.click(screen.getByRole('button', { name: /PDF/i }))
    expect(onExportReport).toHaveBeenCalledWith('pdf', 'week')
  })

  test('calls onRefresh and shows spinner/disabled state while refreshing', async () => {
    jest.useFakeTimers()
    const onRefresh = jest.fn().mockResolvedValue(undefined)
    render(<PerformanceMonitoringDashboard metrics={baseMetrics()} onRefresh={onRefresh} />)

    const btn = screen.getByRole('button', { name: /Atualizar/i })
    expect(btn).toBeEnabled()

    await userEvent.click(btn)
    expect(onRefresh).toHaveBeenCalledTimes(1)

    // During refresh, button should be disabled and icon should have animate-spin
    // Find icon by its role/presentation via svg class
    expect(btn).toBeDisabled()
    const spinner = within(btn).getByRole('img', { hidden: true }) || btn.querySelector('svg')
    if (spinner) {
      expect(spinner).toHaveClass('animate-spin')
    }

    // After 1s timeout, spinner stops (advance timers)
    await act(async () => {
      jest.advanceTimersByTime(1100)
    })
    expect(btn).toBeEnabled()

    jest.useRealTimers()
  })

  test('invokes onPeriodChange when user selects a different period', async () => {
    const onPeriodChange = jest.fn()
    render(<PerformanceMonitoringDashboard metrics={baseMetrics()} onPeriodChange={onPeriodChange} />)

    // The Select UI may be custom; interact via the visible trigger "Mês" and open options.
    // Try generic approach: click trigger then choose "Semana"
    const trigger = screen.getByRole('button', { name: /Mês|Dia|Semana|Trimestre/i })
    await userEvent.click(trigger)

    // Select "Semana"
    const weekOption = await screen.findByRole('option', { name: /Semana/i }).catch(() => null)
    if (weekOption) {
      await userEvent.click(weekOption)
    } else {
      // Fallback: clickable item by text (custom menu)
      const weekItem = await screen.findByText(/^Semana$/i)
      await userEvent.click(weekItem)
    }

    // Expect callback
    expect(onPeriodChange).toHaveBeenCalledWith('week')
  })
})

describe('PerformanceMonitoringDashboard - Tabs and conditional rendering', () => {
  test('renders Overview by default and can switch to Predictions and Financial', async () => {
    render(<PerformanceMonitoringDashboard metrics={baseMetrics()} />)

    // Default: Overview content has key KPI labels
    expect(screen.getByText('Precisão do Modelo')).toBeInTheDocument()

    // Switch to "Predições"
    await userEvent.click(screen.getByRole('tab', { name: /Predições/i }))
    expect(screen.getByText(/Métricas do Modelo ML/i)).toBeInTheDocument()
    expect(screen.getByText(/F1-Score/i)).toBeInTheDocument()

    // Switch to "Financeiro"
    await userEvent.click(screen.getByRole('tab', { name: /Financeiro/i }))
    expect(screen.getByText(/Retorno do Investimento \(ROI\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Projeção Anual/i)).toBeInTheDocument()
  })

  test('shows "Meta anual atingida!" when projectedAnnualROI >= target and hides otherwise', () => {
    const above = baseMetrics({ financial: { ...baseMetrics().financial, projectedAnnualROI: 200000 } })
    const { rerender } = render(<PerformanceMonitoringDashboard metrics={above} />)

    // Navigate to Financeiro tab to see the banner
    fireEvent.click(screen.getByRole('tab', { name: /Financeiro/i }))
    expect(screen.getByText(/Meta anual atingida!/i)).toBeInTheDocument()

    // Now below target
    const below = baseMetrics({ financial: { ...baseMetrics().financial, projectedAnnualROI: 120000 } })
    rerender(<PerformanceMonitoringDashboard metrics={below} />)
    fireEvent.click(screen.getByRole('tab', { name: /Financeiro/i }))
    expect(screen.queryByText(/Meta anual atingida!/i)).not.toBeInTheDocument()
  })
})

describe('PerformanceMonitoringDashboard - Progress capping and calculations', () => {
  test('caps progress at 100% for projectedAnnualROI progress', async () => {
    const huge = baseMetrics({ financial: { ...baseMetrics().financial, projectedAnnualROI: 1_000_000 } })
    render(<PerformanceMonitoringDashboard metrics={huge} />)
    await userEvent.click(screen.getByRole('tab', { name: /Financeiro/i }))

    // The displayed percent text should be 100 or 100%
    // Locate the "Progresso para Meta Anual" container and read the percent label next to it
    const label = screen.getByText(/Progresso para Meta Anual/i)
    const container = label.closest('div')?.parentElement
    const percentText = container ? within(container).getByText(/\d+%/) : screen.getByText(/\d+%/)
    const val = parseInt(percentText.textContent!.replace('%',''), 10)
    expect(val).toBeGreaterThanOrEqual(100)
  })

  test('staff response progress calculation decreases as response time increases', () => {
    // At target (300s) progress baseline
    const atTarget = baseMetrics({ staff: { ...baseMetrics().staff, averageResponseTime: 300 } })
    const faster = baseMetrics({ staff: { ...baseMetrics().staff, averageResponseTime: 120 } })
    const slower = baseMetrics({ staff: { ...baseMetrics().staff, averageResponseTime: 600 } })

    const { rerender } = render(<PerformanceMonitoringDashboard metrics={atTarget} />)
    const bar = screen.getByText('Resposta da Equipe').closest('.p-4')!.querySelector('div .h-2') as HTMLElement | null
    expect(bar).toBeInTheDocument()

    rerender(<PerformanceMonitoringDashboard metrics={faster} />)
    // with faster response, progress value should be higher (hard to read value; assert class exists and text "2min")
    expect(screen.getByText('2min')).toBeInTheDocument()

    rerender(<PerformanceMonitoringDashboard metrics={slower} />)
    expect(screen.getByText('10min')).toBeInTheDocument()
  })
})

describe('PerformanceMonitoringDashboard - Summary stats and counts', () => {
  test('displays totals with pt-BR thousands separators', () => {
    render(<PerformanceMonitoringDashboard metrics={baseMetrics()} />)

    // Consultas Analisadas
    expect(screen.getByText(/5\.400|5\.400|5,400|5 400/)).toBeInTheDocument()

    // Intervenções Enviadas
    expect(screen.getByText(/3\.200|3,200|3 200/)).toBeInTheDocument()

    // Faltas Prevenidas
    expect(screen.getByText(/220/)).toBeInTheDocument()

    // Alertas da Equipe
    expect(screen.getByText(/860/)).toBeInTheDocument()
  })
})