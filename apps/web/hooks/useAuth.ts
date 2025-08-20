import { useEffect, useState } from 'react';

// Mock auth hook for development
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user data
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['user', 'admin'],
    };

    setUser(mockUser);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isLoading: loading, // Add alias for consistency
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    signUp: () => Promise.resolve(),
  };
}

export default useAuth;
