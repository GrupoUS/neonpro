'use client';

/**
 * Client-side CSRF hooks for React components
 */

import { useState, useEffect } from 'react';

/**
 * React hook for CSRF protection
 */
export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCSRFToken() {
      try {
        const response = await fetch('/api/auth/csrf-token');
        if (response.ok) {
          const data = await response.json();
          setCSRFToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCSRFToken();
  }, []);
  
  return { csrfToken, loading };
}

export default useCSRFToken;