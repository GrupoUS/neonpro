import {
  act,
  act,
  fireEvent,
  fireEvent,
  render,
  render,
  screen,
  screen,
  waitFor,
  waitFor,
} from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
};

vi.mock('@/app/utils/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, session, loading, signIn, signUp, signOut, signInWithGoogle } =
    useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>

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

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('session')).toHaveTextContent('no-session');
  });

  it('initializes with session when available', async () => {
    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      },
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
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
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInBtn = screen.getByTestId('signin-btn');

    await act(async () => {
      fireEvent.click(signInBtn);
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('handles sign in error', async () => {
    const mockError = { message: 'Invalid credentials', __isAuthError: true };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInBtn = screen.getByTestId('signin-btn');

    await act(async () => {
      fireEvent.click(signInBtn);
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
  });

  it('handles sign up successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpBtn = screen.getByTestId('signup-btn');

    await act(async () => {
      fireEvent.click(signUpBtn);
    });

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

  it('handles sign up without name', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    // Create component that signs up without name
    const TestSignUpWithoutName = () => {
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

    render(
      <AuthProvider>
        <TestSignUpWithoutName />
      </AuthProvider>
    );

    const signUpBtn = screen.getByTestId('signup-no-name-btn');

    await act(async () => {
      fireEvent.click(signUpBtn);
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: undefined,
      },
    });
  });

  it('handles sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutBtn = screen.getByTestId('signout-btn');

    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('handles Google OAuth', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://oauth.url', provider: 'google' },
      error: null,
    });

    // Mock window.open and window.screen
    const mockOpen = vi.fn().mockReturnValue({
      closed: false,
      close: vi.fn(),
    });

    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    });

    Object.defineProperty(window, 'screen', {
      value: { width: 1920, height: 1080 },
      writable: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const googleBtn = screen.getByTestId('google-signin-btn');

    await act(async () => {
      fireEvent.click(googleBtn);
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/auth/popup-callback'),
      },
    });

    expect(mockOpen).toHaveBeenCalled();
  });

  it('handles Google OAuth error', async () => {
    const mockError = { message: 'OAuth failed', __isAuthError: true };

    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: null, provider: 'google' },
      error: mockError,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const googleBtn = screen.getByTestId('google-signin-btn');

    await act(async () => {
      fireEvent.click(googleBtn);
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
  });

  it('handles auth state changes', async () => {
    let authStateCallback: any;

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      },
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger auth state change
    await act(async () => {
      authStateCallback('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
    });
  });

  it('cleans up subscription on unmount', () => {
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
    // Suppress error boundary output for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    spy.mockRestore();
  });
});
