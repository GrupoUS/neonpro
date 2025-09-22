import { GoogleCalendarService } from '@/services/google-calendar/service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectButton } from '../connect-button';

// Mock the service
vi.mock('@/services/google-calendar/service');
vi.mock(('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock(('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogTrigger: ({ children }: any) => children,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));
vi.mock(('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div role='alert'>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

describe(('ConnectButton', () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      getUserIntegration: vi.fn(),
      getAuthUrl: vi.fn(),
      createIntegration: vi.fn(),
    };

    (GoogleCalendarService as any).mockImplementation(() => mockService);
  });

  it(_'should show connect button when not connected',async () => {
    mockService.getUserIntegration.mockResolvedValue(null);
    mockService.getAuthUrl.mockReturnValue(
      'https://accounts.google.com/o/oauth2/auth',
    );

    render(<ConnectButton clinicId='clinic-123' />);

    expect(screen.getByText('Conectar Google Calendar')).toBeInTheDocument();
  });

  it(_'should show connected state when integration exists',async () => {
    mockService.getUserIntegration.mockResolvedValue({
      id: 'integration-123',
      calendar_id: 'primary',
      sync_enabled: true,
    });

    render(<ConnectButton clinicId='clinic-123' />);

    await waitFor(() => {
      expect(screen.getByText('Calendar Conectado')).toBeInTheDocument();
    });
  });

  it(_'should open auth dialog when clicking connect',async () => {
    mockService.getUserIntegration.mockResolvedValue(null);
    mockService.getAuthUrl.mockReturnValue(
      'https://accounts.google.com/o/oauth2/auth',
    );

    render(<ConnectButton clinicId='clinic-123' />);

    fireEvent.click(screen.getByText('Conectar Google Calendar'));

    await waitFor(() => {
      expect(
        screen.getByText('Conectar com Google Calendar'),
      ).toBeInTheDocument();
    });
  });

  it(_'should show compliance warning in dialog',async () => {
    mockService.getUserIntegration.mockResolvedValue(null);
    mockService.getAuthUrl.mockReturnValue(
      'https://accounts.google.com/o/oauth2/auth',
    );

    render(<ConnectButton clinicId='clinic-123' />);

    fireEvent.click(screen.getByText('Conectar Google Calendar'));

    await waitFor(() => {
      expect(screen.getByText('LGPD Compliance')).toBeInTheDocument();
      expect(
        screen.getByText('Todos os dados serão processados'),
      ).toBeInTheDocument();
    });
  });

  it(_'should handle loading state',async () => {
    mockService.getUserIntegration.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)),
    );

    render(<ConnectButton clinicId='clinic-123' />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it(_'should handle errors gracefully',async () => {
    mockService.getUserIntegration.mockRejectedValue(new Error('API Error'));

    render(<ConnectButton clinicId='clinic-123' />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao verificar status')).toBeInTheDocument();
    });
  });
});
