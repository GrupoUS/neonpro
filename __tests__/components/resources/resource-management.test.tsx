// =====================================================
// Resource Management Tests
// Story 2.4: Smart Resource Management - Test Suite
// =====================================================

import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import ResourceManagement from '@/components/resources/resource-management';
import ResourceAllocationForm from '@/components/resources/resource-allocation-form';
import ResourceOptimization from '@/components/resources/resource-optimization';

// =====================================================
// Mock Data
// =====================================================

const mockResources = [
  {
    id: 'resource-1',
    clinic_id: 'clinic-1',
    name: 'Treatment Room A',
    type: 'room',
    category: 'treatment_room',
    location: 'Floor 1',
    status: 'available',
    capacity: 2,
    cost_per_hour: 50,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'resource-2',
    clinic_id: 'clinic-1',
    name: 'Laser Equipment',
    type: 'equipment',
    category: 'laser_equipment',
    location: 'Treatment Room A',
    status: 'maintenance',
    capacity: 1,
    cost_per_hour: 100,
    next_maintenance: '2024-12-31T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockAllocations = [
  {
    id: 'allocation-1',
    resource_id: 'resource-1',
    appointment_id: 'appointment-1',
    start_time: '2024-01-01T09:00:00Z',
    end_time: '2024-01-01T10:00:00Z',
    status: 'confirmed',
    allocation_type: 'appointment',
    notes: 'Regular treatment session'
  }
];

const mockOptimizationMetrics = {
  utilization_rate: 85,
  efficiency_score: 92,
  cost_effectiveness: 78,
  maintenance_compliance: 95,
  trend_analysis: {
    utilization_trend: 'up' as const,
    efficiency_trend: 'stable' as const,
    cost_trend: 'down' as const
  }
};

// =====================================================
// Mock Functions
// =====================================================

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// =====================================================
// Test Utilities
// =====================================================

const renderWithProps = (component: React.ReactElement, props: any = {}) => {
  const defaultProps = {
    clinicId: 'clinic-1',
    userRole: 'admin',
    ...props
  };
  
  return render(React.cloneElement(component, defaultProps));
};

// =====================================================
// Resource Management Component Tests
// =====================================================

describe('ResourceManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockResources })
    } as Response);
  });

  it('renders resource management dashboard', async () => {
    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);
    
    expect(screen.getByText('Resource Management')).toBeInTheDocument();
    expect(screen.getByText('Manage clinic resources, allocations, and optimize utilization')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Treatment Room A')).toBeInTheDocument();
      expect(screen.getByText('Laser Equipment')).toBeInTheDocument();
    });
  });

  it('displays resource filters', async () => {
    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Resource Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('shows resource cards with correct information', async () => {
    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Treatment Room A')).toBeInTheDocument();
      expect(screen.getByText('room • treatment_room')).toBeInTheDocument();
      expect(screen.getByText('Floor 1')).toBeInTheDocument();
      expect(screen.getByText('Capacity: 2')).toBeInTheDocument();
      expect(screen.getByText('$50/hour')).toBeInTheDocument();
    });
  });

  it('displays resource status badges', async () => {
    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('available')).toBeInTheDocument();
      expect(screen.getByText('maintenance')).toBeInTheDocument();
    });
  });

  it('updates resource status when button clicked', async () => {
    const user = userEvent.setup();
    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Treatment Room A')).toBeInTheDocument();
    });

    // Mock status update response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response);

    const setMaintenanceButton = screen.getByText('Set Maintenance');
    await user.click(setMaintenanceButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/resources',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'resource-1', status: 'maintenance' })
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Resource status updated');
    });
  });

  it('hides admin buttons for patient users', async () => {
    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="patient" />);
    
    await waitFor(() => {
      expect(screen.getByText('Treatment Room A')).toBeInTheDocument();
    });

    expect(screen.queryByText('Add Resource')).not.toBeInTheDocument();
    expect(screen.queryByText('Set Maintenance')).not.toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'Failed to fetch' })
    } as Response);

    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch resources');
    });
  });
});

// =====================================================
// Resource Allocation Form Tests
// =====================================================

describe('ResourceAllocationForm Component', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    clinicId: 'clinic-1',
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockResources })
    } as Response);
  });

  it('renders allocation form when open', () => {
    render(<ResourceAllocationForm {...defaultProps} />);
    
    expect(screen.getByText('Create Resource Allocation')).toBeInTheDocument();
    expect(screen.getByText('Allocate a resource for an appointment or maintenance period')).toBeInTheDocument();
  });

  it('fetches available resources on open', async () => {
    render(<ResourceAllocationForm {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/resources?clinic_id=clinic-1&status=available')
      );
    });
  });

  it('displays resource selection dropdown', async () => {
    render(<ResourceAllocationForm {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Resource *')).toBeInTheDocument();
      expect(screen.getByText('Select a resource')).toBeInTheDocument();
    });
  });

  it('shows time selection inputs', () => {
    render(<ResourceAllocationForm {...defaultProps} />);
    
    expect(screen.getByLabelText('Start Time *')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time *')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    render(<ResourceAllocationForm {...defaultProps} />);
    
    const createButton = screen.getByText('Create Allocation');
    await user.click(createButton);

    expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
  });

  it('creates allocation successfully', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const onOpenChange = jest.fn();

    // Mock successful creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockResources })
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { conflicts: [] } })
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response);

    render(
      <ResourceAllocationForm 
        {...defaultProps} 
        onSuccess={onSuccess}
        onOpenChange={onOpenChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Select a resource')).toBeInTheDocument();
    });

    // Fill form
    const resourceSelect = screen.getByText('Select a resource');
    await user.click(resourceSelect);
    
    await waitFor(() => {
      const resourceOption = screen.getByText(/Treatment Room A/);
      await user.click(resourceOption);
    });

    const startTimeInput = screen.getByLabelText('Start Time *');
    const endTimeInput = screen.getByLabelText('End Time *');
    
    await user.type(startTimeInput, '2024-01-01T09:00');
    await user.type(endTimeInput, '2024-01-01T10:00');

    // Wait for conflict check to complete
    await waitFor(() => {
      expect(screen.queryByText('Checking for conflicts...')).not.toBeInTheDocument();
    });

    // Submit form
    const createButton = screen.getByText('Create Allocation');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/resources/allocations',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('resource-1')
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Resource allocation created successfully');
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});

// =====================================================
// Resource Optimization Component Tests
// =====================================================

describe('ResourceOptimization Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock optimization data responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockOptimizationMetrics })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      } as Response);
  });

  it('renders optimization dashboard', async () => {
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);
    
    expect(screen.getByText('Resource Optimization')).toBeInTheDocument();
    expect(screen.getByText('AI-powered insights and recommendations for optimal resource utilization')).toBeInTheDocument();
  });

  it('displays metrics overview cards', async () => {
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Utilization Rate')).toBeInTheDocument();
      expect(screen.getByText('Efficiency Score')).toBeInTheDocument();
      expect(screen.getByText('Cost Effectiveness')).toBeInTheDocument();
      expect(screen.getByText('Maintenance Compliance')).toBeInTheDocument();
    });
  });

  it('shows correct metric values', async () => {
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument(); // Utilization rate
      expect(screen.getByText('92%')).toBeInTheDocument(); // Efficiency score
      expect(screen.getByText('78%')).toBeInTheDocument(); // Cost effectiveness
      expect(screen.getByText('95%')).toBeInTheDocument(); // Maintenance compliance
    });
  });

  it('displays period selector', () => {
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);
    
    expect(screen.getByDisplayValue('Last 7 days')).toBeInTheDocument();
  });

  it('shows run optimization button for non-patient users', () => {
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);
    
    expect(screen.getByText('Run Optimization')).toBeInTheDocument();
  });

  it('hides run optimization button for patient users', () => {
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="patient" />);
    
    expect(screen.queryByText('Run Optimization')).not.toBeInTheDocument();
  });

  it('has tabs for different views', () => {
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);
    
    expect(screen.getByText('Utilization Analysis')).toBeInTheDocument();
    expect(screen.getByText('Trends')).toBeInTheDocument();
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
  });

  it('runs optimization when button clicked', async () => {
    const user = userEvent.setup();
    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);

    // Mock optimization response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response);

    await waitFor(() => {
      expect(screen.getByText('Run Optimization')).toBeInTheDocument();
    });

    const optimizeButton = screen.getByText('Run Optimization');
    await user.click(optimizeButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/resources/optimize',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('clinic-1')
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Optimization completed successfully');
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockReset();
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderWithProps(<ResourceOptimization clinicId="clinic-1" userRole="admin" />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error loading optimization data');
    });
  });
});

// =====================================================
// Integration Tests
// =====================================================

describe('Resource Management Integration', () => {
  it('integrates resource management components correctly', async () => {
    const user = userEvent.setup();
    
    // Mock all required API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockResources })
      } as Response);

    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Resource Management')).toBeInTheDocument();
      expect(screen.getByText('Treatment Room A')).toBeInTheDocument();
    });

    // Verify that all key components are rendered
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Resources (2)')).toBeInTheDocument();
    expect(screen.getByText('Resource Details')).toBeInTheDocument();
  });

  it('maintains state consistency across components', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockResources })
    } as Response);

    renderWithProps(<ResourceManagement clinicId="clinic-1" userRole="admin" />);

    await waitFor(() => {
      expect(screen.getByText('Treatment Room A')).toBeInTheDocument();
    });

    // Status updates should trigger re-fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    } as Response);

    const setMaintenanceButton = screen.getByText('Set Maintenance');
    await user.click(setMaintenanceButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/resources',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });
});