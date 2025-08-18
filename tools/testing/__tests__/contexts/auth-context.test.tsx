import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Supabase using vi.hoisted to ensure proper initialization order
const mockSupabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
}));

vi.mock('@/app/utils/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

// Now import the component AFTER the mock
import { AuthProvider, useAuth } from '@/contexts/auth-context';

// Test component to access auth context
const TestComponent = () => {
  const { user, session, loading, signIn, signUp, signOut, signInWithGoogle } =
    useAuth();

  return (
    <div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>

      <button
        data-testid="signin-btn"
        onClick={() => signIn('test@example.com', 'password')}
      >
        Sign In
      </button>

      <button
        data-testid="signup-btn"
        onClick={() => signUp('test@example.com', 'password', 'Test User')}
      >
        Sign Up
      </button>

      <button data-testid="signout-btn" onClick={() => signOut()}>
        Sign Out
      </button>

      <button
        data-testid="google-signin-btn"
        onClick={() => signInWithGoogle()}
      >
        Sign In with Google
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  });

  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toBeInTheDocument();
    expect(screen.getByTestId('session')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('initializes with session when available', async () => {
    const mockSession = {
      access_token: 'mock-token',
      user: { id: '123', email: 'test@example.com' },
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('session')).toHaveTextContent('has-session');
  });

  it('handles sign in successfully', async () => {
    const mockResult = {
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'mock-token' },
      },
      error: null,
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue(mockResult);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('handles sign in error', async () => {
    const mockError = { message: 'Invalid credentials' };
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  it('handles sign up successfully', async () => {
    const mockResult = {
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'mock-token' },
      },
      error: null,
    };

    mockSupabase.auth.signUp.mockResolvedValue(mockResult);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByTestId('signup-btn'));

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            name: 'Test User',
          },
        },
      });
    });
  });

  it('handles sign up without name', async () => {
    const TestComponentNoName = () => {
      const { signUp } = useAuth();
      return (
        <button
          data-testid="signup-no-name-btn"
          onClick={() => signUp('test@example.com', 'password')}
        >
          Sign Up No Name
        </button>
      );
    };

    const mockResult = {
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'mock-token' },
      },
      error: null,
    };

    mockSupabase.auth.signUp.mockResolvedValue(mockResult);

    render(
      <AuthProvider>
        <TestComponentNoName />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('signup-no-name-btn'));

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {},
        },
      });
    });
  });

  it('handles sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByTestId('signout-btn'));

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('handles Google OAuth', async () => {
    const mockResult = {
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'mock-token' },
      },
      error: null,
    };

    mockSupabase.auth.signInWithOAuth.mockResolvedValue(mockResult);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByTestId('google-signin-btn'));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    });
  });

  it('handles Google OAuth error', async () => {
    const mockError = { message: 'OAuth error' };
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    fireEvent.click(screen.getByTestId('google-signin-btn'));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
    });
  });

  it('handles auth state changes', async () => {
    const mockSession = {
      access_token: 'mock-token',
      user: { id: '123', email: 'test@example.com' },
    };

    const mockUnsubscribe = vi.fn();
    let authStateCallback: any;

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Trigger auth state change
    await act(async () => {
      authStateCallback('SIGNED_IN', mockSession);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('session')).toHaveTextContent('has-session');
  });

  it('cleans up subscription on unmount', async () => {
    const mockUnsubscribe = vi.fn();

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

describe('useAuth hook', () => {
  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});