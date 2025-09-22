import { GoogleCalendarService } from '@/services/google-calendar/service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IntegrationPanel } from '../integration-panel';

// Mock the service
vi.mock('@/services/google-calendar/service');
vi.mock(('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-default-value={defaultValue}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-value={value}>{children}</button>,
  TabsContent: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));
vi.mock(('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock(('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogTrigger: ({ children }: any) => children,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h3>{children}</h3>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
  AlertDialogAction: ({ children }: any) => <button>{children}</button>,
}));
vi.mock(('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
}));

describe(('IntegrationPanel', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      getUserIntegration: vi.fn(),
      getCalendars: vi.fn(),
      getSyncLogs: vi.fn(),
      deleteIntegration: vi.fn(),
      syncFromGoogle: vi.fn(),
    };

    (GoogleCalendarService as any).mockImplementation(() => mockService);
  });

  it(_'should display integration overview',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      calendar_id: 'primary',
      calendar_name: 'Dr. Smith Calendar',
      sync_enabled: true,
      auto_sync: true,
      last_sync_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
    });

    render(<IntegrationPanel userId='user-123' />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith Calendar')).toBeInTheDocument();
      expect(screen.getByText('primary')).toBeInTheDocument();
    });
  });

  it(_'should show sync status badge',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      sync_enabled: true,
      last_sync_at: new Date().toISOString(),
    });

    render(<IntegrationPanel userId='user-123' />);

    await waitFor(() => {
      expect(screen.getByText('Sincronizado')).toBeInTheDocument();
    });
  });

  it(_'should show warning when sync is disabled',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      sync_enabled: false,
      last_sync_at: '2024-01-15T10:00:00Z',
    });

    render(<IntegrationPanel userId='user-123' />);

    await waitFor(() => {
      expect(screen.getByText('Sincronização Desativada')).toBeInTheDocument();
    });
  });

  it(_'should display sync activity logs',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      sync_enabled: true,
    });

    mockService.getSyncLogs.mockResolvedValue([
      {
        id: 'log-1',
        action: 'SYNC_APPOINTMENT',
        status: 'SUCCESS',
        created_at: '2024-01-15T10:00:00Z',
        details: { appointmentId: 'appt-123' },
      },
      {
        id: 'log-2',
        action: 'SYNC_FROM_GOOGLE',
        status: 'ERROR',
        created_at: '2024-01-15T09:00:00Z',
        error_message: 'API Error',
      },
    ]);

    render(<IntegrationPanel userId='user-123' />);

    // Click on activity tab
    fireEvent.click(screen.getByText('Atividade'));

    await waitFor(() => {
      expect(screen.getByText('SYNC_APPOINTMENT')).toBeInTheDocument();
      expect(screen.getByText('SYNC_FROM_GOOGLE')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it(_'should show disconnection confirmation',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      sync_enabled: true,
    });

    render(<IntegrationPanel userId='user-123' />);

    // Click on settings tab
    fireEvent.click(screen.getByText('Configurações'));

    // Click disconnect button
    fireEvent.click(screen.getByText('Desconectar'));

    await waitFor(() => {
      expect(screen.getByText('Confirmar Desconexão')).toBeInTheDocument();
      expect(
        screen.getByText('Tem certeza que deseja desconectar'),
      ).toBeInTheDocument();
    });
  });

  it(_'should handle disconnection',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      sync_enabled: true,
    });

    mockService.deleteIntegration.mockResolvedValue(true);

    render(<IntegrationPanel userId='user-123' />);

    // Navigate to settings and click disconnect
    fireEvent.click(screen.getByText('Configurações'));
    fireEvent.click(screen.getByText('Desconectar'));

    // Confirm disconnection
    fireEvent.click(screen.getByText('Desconectar'));

    await waitFor(() => {
      expect(mockService.deleteIntegration).toHaveBeenCalledWith(
        'integration-123',
      );
    });
  });

  it(_'should show integration statistics',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      sync_enabled: true,
      total_events_synced: 150,
      last_sync_at: '2024-01-15T10:00:00Z',
    });

    render(<IntegrationPanel userId='user-123' />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('eventos sincronizados')).toBeInTheDocument();
    });
  });

  it(_'should handle manual sync',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      calendar_id: 'primary',
      sync_enabled: true,
    });

    mockService.syncFromGoogle.mockResolvedValue([
      {
        id: 'event-123',
        summary: 'New Event',
      },
    ]);

    render(<IntegrationPanel userId='user-123' />);

    // Click on sync tab
    fireEvent.click(screen.getByText('Sincronização'));

    // Click sync now button
    fireEvent.click(screen.getByText('Sincronizar Agora'));

    await waitFor(() => {
      expect(mockService.syncFromGoogle).toHaveBeenCalledWith('primary');
    });
  });

  it(_'should show loading state',async () => {
    mockService.getUserIntegration.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)),
    );

    render(<IntegrationPanel userId='user-123' />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it(_'should handle errors gracefully',async () => {
    mockService.getUserIntegration.mockRejectedValue(
      new Error('Failed to load integration'),
    );

    render(<IntegrationPanel userId='user-123' />);

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao carregar integração'),
      ).toBeInTheDocument();
    });
  });

  it(_'should show empty state when no integration exists',async () => {
    mockService.getUserIntegration.mockResolvedValue(null);

    render(<IntegrationPanel userId='user-123' />);

    await waitFor(() => {
      expect(
        screen.getByText('Nenhuma integração encontrada'),
      ).toBeInTheDocument();
      expect(screen.getByText('Configure sua integração')).toBeInTheDocument();
    });
  });
});
