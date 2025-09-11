import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TestAuth } from '@/routes/test-auth';

// Mock the Router Link
vi.mock('@tanstack/react-router', () => {
  return {
    Link: ({ to, children, ...props }: any) => (
      <a data-testid="router-link" href={typeof to === 'string' ? to : String(to)} {...props}>
        {children}
      </a>
    ),
    createFileRoute: () => () => null, // not used in this test
  };
});

// Mock Supabase client calls used in component
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

describe('TestAuth Back Link', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        assign: vi.fn(),
        replace: vi.fn(),
        href: '/',
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders a Router Link for 'Back to Login' and doesn't reload", async () => {
    render(<TestAuth />);

    const link = await screen.findByRole('link', { name: /back to login/i });

    expect(link).toHaveAttribute('data-testid', 'router-link');
    expect(link).toHaveAttribute('href', '/');

    fireEvent.click(link);
    expect(window.location.assign).not.toHaveBeenCalled();
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
