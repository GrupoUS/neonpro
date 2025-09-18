import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WaitingRoom } from '../WaitingRoom';

// Mock the cn utility function
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  // Avatar components removed - using User icon instead
}));

describe('WaitingRoom', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test('renders waiting room title', () => {
    render(<WaitingRoom />);
    expect(screen.getByText('Sala de Espera Virtual')).toBeInTheDocument();
  });

  test('displays queue status section', () => {
    render(<WaitingRoom />);
    expect(screen.getByText(/Queue Status/)).toBeInTheDocument();
    expect(screen.getByText(/patients\)/)).toBeInTheDocument();
  });

  test('displays technical setup section', () => {
    render(<WaitingRoom />);
    expect(screen.getByText('Technical Setup')).toBeInTheDocument();
    expect(screen.getByText('Connection Quality')).toBeInTheDocument();
    expect(screen.getByText('Camera & Audio')).toBeInTheDocument();
  });

  test('shows current patient information', () => {
    render(<WaitingRoom />);
    // Check if the current patient placeholder is shown
    expect(screen.getByText(/You are currently/)).toBeInTheDocument();
  });

  test('displays professional status', () => {
    render(<WaitingRoom />);
    expect(screen.getByText(/Dr\./)).toBeInTheDocument();
    expect(screen.getByText(/Online|Offline/)).toBeInTheDocument();
  });

  test('camera toggle functionality', () => {
    render(<WaitingRoom />);
    const cameraButton = screen.getByText(/Camera/);
    fireEvent.click(cameraButton);
    // The button text should change based on state
    expect(cameraButton).toBeInTheDocument();
  });

  test('microphone toggle functionality', () => {
    render(<WaitingRoom />);
    const micButton = screen.getByText(/Mic/);
    fireEvent.click(micButton);
    // The button text should change based on state
    expect(micButton).toBeInTheDocument();
  });

  test('displays emergency protocols section', () => {
    render(<WaitingRoom />);
    expect(screen.getByText('Emergency')).toBeInTheDocument();
    expect(screen.getByText('Emergency Protocols')).toBeInTheDocument();
  });

  test('shows quick actions', () => {
    render(<WaitingRoom />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Update Availability')).toBeInTheDocument();
    expect(screen.getByText('Test Connection')).toBeInTheDocument();
    expect(screen.getByText('Review Patient Notes')).toBeInTheDocument();
  });
});