import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConsentBanner } from '@/components/ConsentBanner';

// Mock the Router Link to ensure SPA link usage without full reload
vi.mock('@tanstack/react-router', () => {
  return {
    Link: ({ to, children, ...props }: any) => (
      <a data-testid="router-link" href={typeof to === 'string' ? to : String(to)} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock consent context to force banner visible and consents not granted
vi.mock('@/contexts/ConsentContext', () => {
  return {
    useConsent: () => ({
      hasConsent: () => false,
      grantConsent: vi.fn(),
      consentSettings: {},
      updateConsentSettings: vi.fn(),
      isConsentBannerVisible: true,
      consentHistory: [],
    }),
  };
});

describe('ConsentBanner', () => {
  beforeEach(() => {
    // create a writable spyable property for assign
    const original = window.location;
    // @ts-expect-error allow override for tests
    delete (window as any).location;
    // @ts-expect-error define mutable location for spying
    (window as any).location = { ...original, assign: vi.fn(), replace: vi.fn() };
  });

  it('uses Router Link for privacy navigation (SPA-safe)', async () => {
    render(<ConsentBanner />);

    const link = await screen.findByRole('link', { name: /política de privacidade/i });

    // Link rendered by mocked Router Link
    expect(link).toHaveAttribute('data-testid', 'router-link');
    expect(link).toHaveAttribute('href', '/privacy');

    // Clicking should NOT attempt a full page navigation via window.location
    fireEvent.click(link);
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
