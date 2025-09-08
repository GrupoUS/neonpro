import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { render, screen, waitFor, } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, } from 'vitest'
import { mockAnalyticsData, } from '../../../utils/mockData'

// Mock Recharts components
vi.mock<typeof import('recharts')>('recharts', () => ({
  LineChart: ({ children, }: { children: React.ReactNode },) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children, }: { children: React.ReactNode },) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children, }: { children: React.ReactNode },) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children, }: { children: React.ReactNode },) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}),)

// Mock hooks
vi.mock<typeof import('@/hooks/analytics/useAnalyticsData')>(
  '@/hooks/analytics/useAnalyticsData',
  () => ({
    useAnalyticsData: vi.fn(),
  }),
)

vi.mock<typeof import('@/hooks/analytics/useExportData')>(
  '@/hooks/analytics/useExportData',
  () => ({
    useExportData: vi.fn(),
  }),
)

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  },)

  return ({ children, }: { children: React.ReactNode },) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('analyticsDashboard', () => {
  const mockUseAnalyticsData = require('@/hooks/analytics/useAnalyticsData',).useAnalyticsData
  const mockUseExportData = require('@/hooks/analytics/useExportData',).useExportData

  beforeEach(() => {
    mockUseAnalyticsData.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      isError: false,
      error: undefined,
    },)

    mockUseExportData.mockReturnValue({
      exportToPDF: vi.fn(),
      exportToExcel: vi.fn(),
      exportToCSV: vi.fn(),
      isExporting: false,
      exportError: undefined,
    },)
  },)

  afterEach(() => {
    vi.clearAllMocks()
  },)

  it('should render dashboard with analytics data', async () => {
    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    // Check if key metrics are displayed
    expect(screen.getByText('1,250',),).toBeInTheDocument() // totalPatients
    expect(screen.getByText('$125,000',),).toBeInTheDocument() // totalRevenue
    expect(screen.getByText('$100',),).toBeInTheDocument() // averageTicket
    expect(screen.getByText('25%',),).toBeInTheDocument() // conversionRate

    // Check if charts are rendered
    expect(screen.getByTestId('line-chart',),).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart',),).toBeInTheDocument()
    expect(screen.getByTestId('pie-chart',),).toBeInTheDocument()
  })

  it('should show loading state', () => {
    mockUseAnalyticsData.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
    },)

    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    expect(screen.getByTestId('analytics-loading',),).toBeInTheDocument()
    expect(screen.getByText('Loading analytics...',),).toBeInTheDocument()
  })

  it('should show error state', () => {
    mockUseAnalyticsData.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load analytics',),
    },)

    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    expect(screen.getByTestId('analytics-error',),).toBeInTheDocument()
    expect(screen.getByText('Failed to load analytics',),).toBeInTheDocument()
  })

  it('should handle export to PDF', async () => {
    const mockExportToPDF = vi.fn()
    mockUseExportData.mockReturnValue({
      exportToPDF: mockExportToPDF,
      exportToExcel: vi.fn(),
      exportToCSV: vi.fn(),
      isExporting: false,
      exportError: undefined,
    },)

    const user = userEvent.setup()
    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    const exportButton = screen.getByText('Export PDF',)
    await user.click(exportButton,)

    expect(mockExportToPDF,).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockAnalyticsData,
        title: expect.stringContaining('Analytics Report',),
      },),
    )
  })

  it('should handle date range filter changes', async () => {
    const user = userEvent.setup()
    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    // Change date range
    const startDateInput = screen.getByLabelText('Start Date',)
    const endDateInput = screen.getByLabelText('End Date',)

    await user.clear(startDateInput,)
    await user.type(startDateInput, '2024-02-01',)

    await user.clear(endDateInput,)
    await user.type(endDateInput, '2024-02-28',)

    // Apply filters
    const applyButton = screen.getByText('Apply Filters',)
    await user.click(applyButton,)

    // Verify hook was called with new filters
    await waitFor(() => {
      expect(mockUseAnalyticsData,).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: { start: '2024-02-01', end: '2024-02-28', },
        },),
      )
    },)
  })

  it('should handle treatment filter changes', async () => {
    const user = userEvent.setup()
    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    // Open treatment filter dropdown
    const treatmentFilter = screen.getByLabelText('Treatments',)
    await user.click(treatmentFilter,)

    // Select treatments
    const facialOption = screen.getByRole('option', { name: 'Facial', },)
    const botoxOption = screen.getByRole('option', { name: 'Botox', },)

    await user.click(facialOption,)
    await user.click(botoxOption,)

    // Apply filters
    const applyButton = screen.getByText('Apply Filters',)
    await user.click(applyButton,)

    // Verify hook was called with selected treatments
    await waitFor(() => {
      expect(mockUseAnalyticsData,).toHaveBeenCalledWith(
        expect.objectContaining({
          treatments: ['facial', 'botox',],
        },),
      )
    },)
  })

  it('should show export loading state', () => {
    mockUseExportData.mockReturnValue({
      exportToPDF: vi.fn(),
      exportToExcel: vi.fn(),
      exportToCSV: vi.fn(),
      isExporting: true,
      exportError: undefined,
    },)

    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    expect(screen.getByText('Exporting...',),).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export PDF', },),).toBeDisabled()
  })

  it('should display export error', () => {
    mockUseExportData.mockReturnValue({
      exportToPDF: vi.fn(),
      exportToExcel: vi.fn(),
      exportToCSV: vi.fn(),
      isExporting: false,
      exportError: new Error('Export failed',),
    },)

    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    expect(screen.getByText('Export failed',),).toBeInTheDocument()
    expect(screen.getByTestId('export-error-alert',),).toBeInTheDocument()
  })

  it('should be accessible', async () => {
    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    // Check for proper headings hierarchy
    expect(screen.getByRole('heading', { level: 1, },),).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, },),).toBeInTheDocument()

    // Check for proper labels
    expect(screen.getByLabelText('Start Date',),).toBeInTheDocument()
    expect(screen.getByLabelText('End Date',),).toBeInTheDocument()
    expect(screen.getByLabelText('Treatments',),).toBeInTheDocument()

    // Check for keyboard navigation
    const exportButton = screen.getByRole('button', { name: 'Export PDF', },)
    expect(exportButton,).toHaveAttribute('tabindex', '0',)
  })

  it('should handle responsive design', () => {
    // Mock window.matchMedia for mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query,) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: undefined,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    },)

    render(<AnalyticsDashboard />, { wrapper: createWrapper(), },)

    // Check mobile-specific elements
    expect(screen.getByTestId('mobile-dashboard',),).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container',),).toBeInTheDocument()
  })
})
