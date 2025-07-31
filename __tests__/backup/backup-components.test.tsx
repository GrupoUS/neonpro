import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import BackupDashboard from '@/components/backup/backup-dashboard';
import BackupConfigForm from '@/components/backup/backup-config-form';
import BackupHistory from '@/components/backup/BackupHistory';

// Mock fetch globally
global.fetch = jest.fn();

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('BackupDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders backup dashboard correctly', async () => {
    // Mock API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            total_backups: 15,
            successful_backups: 12,
            failed_backups: 2,
            pending_backups: 1,
            storage_used: 1073741824, // 1GB
            last_backup: new Date().toISOString(),
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'job-1',
              config_name: 'Daily Backup',
              status: 'COMPLETED',
              start_time: new Date().toISOString(),
              end_time: new Date().toISOString(),
              size: 536870912, // 512MB
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'config-1',
              name: 'Daily Database Backup',
              type: 'FULL',
              enabled: true,
              last_backup: new Date().toISOString(),
            },
          ],
        }),
      });

    render(<BackupDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Painel de Backup')).toBeInTheDocument();
    });

    // Check if metrics are displayed
    expect(screen.getByText('15')).toBeInTheDocument(); // total_backups
    expect(screen.getByText('12')).toBeInTheDocument(); // successful_backups
    expect(screen.getByText('2')).toBeInTheDocument(); // failed_backups
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<BackupDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Painel de Backup')).toBeInTheDocument();
    });

    // Should show loading or error state
    expect(screen.getByText(/carregando/i) || screen.getByText(/erro/i)).toBeInTheDocument();
  });
});

describe('BackupConfigForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
    (fetch as jest.Mock).mockClear();
  });

  it('renders form fields correctly', () => {
    render(
      <BackupConfigForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/nome da configuração/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de backup/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/provedor de armazenamento/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <BackupConfigForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <BackupConfigForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel}
      />
    );

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/nome da configuração/i), {
      target: { value: 'Test Backup Config' },
    });

    fireEvent.change(screen.getByLabelText(/tipo de backup/i), {
      target: { value: 'FULL' },
    });

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Backup Config',
          type: 'FULL',
        })
      );
    });
  });

  it('edits existing configuration', () => {
    const existingConfig = {
      id: 'config-1',
      name: 'Existing Config',
      type: 'INCREMENTAL' as const,
      storage_provider: 'local',
      schedule: {
        enabled: true,
        frequency: 'DAILY' as const,
        time: '02:00',
      },
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12,
      },
      data_sources: ['database'],
      encryption: {
        enabled: true,
        algorithm: 'AES-256',
      },
      compression: {
        enabled: true,
        algorithm: 'gzip',
        level: 6,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    render(
      <BackupConfigForm 
        config={existingConfig}
        onSave={mockOnSave} 
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Existing Config')).toBeInTheDocument();
    expect(screen.getByDisplayValue('INCREMENTAL')).toBeInTheDocument();
  });
});

describe('BackupHistory', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders backup history table', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        config_id: 'config-1',
        config_name: 'Daily Backup',
        status: 'COMPLETED',
        type: 'FULL',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration: 300000, // 5 minutes
        size: 1073741824, // 1GB
      },
      {
        id: 'backup-2',
        config_id: 'config-1',
        config_name: 'Daily Backup',
        status: 'FAILED',
        type: 'INCREMENTAL',
        start_time: new Date().toISOString(),
        error_message: 'Connection timeout',
      },
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBackups,
        total: 2,
      }),
    });

    render(<BackupHistory />);

    await waitFor(() => {
      expect(screen.getByText('Histórico de Backups')).toBeInTheDocument();
    });

    // Check if backup entries are displayed
    expect(screen.getByText('Daily Backup')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('filters backups by status', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        config_id: 'config-1',
        config_name: 'Daily Backup',
        status: 'COMPLETED',
        type: 'FULL',
        start_time: new Date().toISOString(),
      },
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBackups,
        total: 1,
      }),
    });

    render(<BackupHistory />);

    await waitFor(() => {
      expect(screen.getByText('Histórico de Backups')).toBeInTheDocument();
    });

    // Open status filter
    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    fireEvent.click(statusFilter);

    // Select "Concluído"
    fireEvent.click(screen.getByText('Concluído'));

    // Verify filtering is applied
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('searches backups by name', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        config_id: 'config-1',
        config_name: 'Daily Database Backup',
        status: 'COMPLETED',
        type: 'FULL',
        start_time: new Date().toISOString(),
      },
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockBackups,
        total: 1,
      }),
    });

    render(<BackupHistory />);

    await waitFor(() => {
      expect(screen.getByText('Histórico de Backups')).toBeInTheDocument();
    });

    // Search for "Database"
    const searchInput = screen.getByPlaceholderText(/nome ou id/i);
    fireEvent.change(searchInput, { target: { value: 'Database' } });

    // Verify search results
    expect(screen.getByText('Daily Database Backup')).toBeInTheDocument();
  });

  it('handles backup deletion', async () => {
    const mockBackups = [
      {
        id: 'backup-1',
        config_id: 'config-1',
        config_name: 'Daily Backup',
        status: 'COMPLETED',
        type: 'FULL',
        start_time: new Date().toISOString(),
      },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockBackups,
          total: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<BackupHistory />);

    await waitFor(() => {
      expect(screen.getByText('Daily Backup')).toBeInTheDocument();
    });

    // Click on actions menu
    const actionsButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(actionsButton);

    // Click delete
    const deleteButton = screen.getByText(/remover/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/backup/jobs/backup-1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});

describe('Backup Components Integration', () => {
  it('allows creating backup from dashboard', async () => {
    // Mock API calls for dashboard
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            total_backups: 0,
            successful_backups: 0,
            failed_backups: 0,
            pending_backups: 0,
            storage_used: 0,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    render(<BackupDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Painel de Backup')).toBeInTheDocument();
    });

    // Check if "Create Backup" button exists and can be clicked
    const createButton = screen.getByRole('button', { name: /nova configuração/i });
    expect(createButton).toBeInTheDocument();
    
    fireEvent.click(createButton);
    
    // This would typically open a modal or navigate to config form
    // In a real test, we'd verify the navigation or modal state
  });
});