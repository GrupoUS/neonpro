/**
 * LazyImage Component Tests
 * T078 - Frontend Performance Optimization
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyImage } from '../LazyImage';

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: ((entries: any[]) => void) | null = null;

beforeEach(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(callback => {
    intersectionCallback = callback;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    };
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LazyImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
  };

  it('should render with placeholder initially', () => {
    render(<LazyImage {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test image');
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/svg+xml'),
    );
  });

  it('should load image when in view', async () => {
    render(<LazyImage {...defaultProps} />);

    // Simulate intersection
    if (intersectionCallback) {
      intersectionCallback([{ isIntersecting: true }]);
    }

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test-image.jpg');
    });
  });

  it('should load image immediately when priority is true', () => {
    render(<LazyImage {...defaultProps} priority />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should load image immediately when loading is eager', () => {
    render(<LazyImage {...defaultProps} loading='eager' />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should show loading state initially', () => {
    render(<LazyImage {...defaultProps} />);

    const loadingIndicator = screen
      .getByRole('img')
      .parentElement?.querySelector('.animate-pulse');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('should hide loading state when image loads', async () => {
    render(<LazyImage {...defaultProps} priority />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });
  });

  it('should show error state when image fails to load', async () => {
    render(<LazyImage {...defaultProps} priority />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(() => {
      expect(img).toHaveAttribute('src', '/images/placeholder.svg');
      expect(img).toHaveClass('opacity-50');
    });
  });

  it('should use custom fallback image', async () => {
    render(
      <LazyImage {...defaultProps} fallback='/custom-fallback.jpg' priority />,
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(() => {
      expect(img).toHaveAttribute('src', '/custom-fallback.jpg');
    });
  });

  it('should call onLoad callback', async () => {
    const onLoad = vi.fn();
    render(<LazyImage {...defaultProps} onLoad={onLoad} priority />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('should call onError callback', async () => {
    const onError = vi.fn();
    render(<LazyImage {...defaultProps} onError={onError} priority />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should apply custom className', () => {
    render(<LazyImage {...defaultProps} className='custom-class' />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('custom-class');
  });

  it('should apply custom containerClassName', () => {
    render(
      <LazyImage {...defaultProps} containerClassName='custom-container' />,
    );

    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('custom-container');
  });

  it('should set srcSet when in view', async () => {
    const srcSet = '/test-image-400.jpg 400w, /test-image-800.jpg 800w';
    render(<LazyImage {...defaultProps} srcSet={srcSet} />);

    // Initially should not have srcSet
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('srcset');

    // Simulate intersection
    if (intersectionCallback) {
      intersectionCallback([{ isIntersecting: true }]);
    }

    await waitFor(() => {
      expect(img).toHaveAttribute('srcset', srcSet);
    });
  });

  it('should disconnect observer when component unmounts', () => {
    const { unmount } = render(<LazyImage {...defaultProps} />);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should handle missing IntersectionObserver', () => {
    // @ts-ignore
    delete global.IntersectionObserver;

    expect(() => render(<LazyImage {...defaultProps} />)).not.toThrow();
  });
});

describe('ResponsiveImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    breakpoints: {
      sm: '400',
      md: '800',
      lg: '1200',
    },
  };

  it('should render LazyImage when no WebP/AVIF sources', () => {
    render(<ResponsiveImage {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test image');
  });

  it('should render picture element with WebP source', () => {
    render(<ResponsiveImage {...defaultProps} webpSrc='/test-image.webp' />);

    const picture = screen.getByRole('img').closest('picture');
    expect(picture).toBeInTheDocument();

    const webpSource = picture?.querySelector('source[type="image/webp"]');
    expect(webpSource).toBeInTheDocument();
  });

  it('should render picture element with AVIF source', () => {
    render(<ResponsiveImage {...defaultProps} avifSrc='/test-image.avif' />);

    const picture = screen.getByRole('img').closest('picture');
    expect(picture).toBeInTheDocument();

    const avifSource = picture?.querySelector('source[type="image/avif"]');
    expect(avifSource).toBeInTheDocument();
  });

  it('should render both AVIF and WebP sources in correct order', () => {
    render(
      <ResponsiveImage
        {...defaultProps}
        avifSrc='/test-image.avif'
        webpSrc='/test-image.webp'
      />,
    );

    const picture = screen.getByRole('img').closest('picture');
    const sources = picture?.querySelectorAll('source');

    expect(sources).toHaveLength(2);
    expect(sources?.[0]).toHaveAttribute('type', 'image/avif');
    expect(sources?.[1]).toHaveAttribute('type', 'image/webp');
  });

  it('should generate srcSet for different breakpoints', () => {
    render(<ResponsiveImage {...defaultProps} webpSrc='/test-image.webp' />);

    const webpSource = screen
      .getByRole('img')
      .closest('picture')
      ?.querySelector('source[type="image/webp"]');
    expect(webpSource).toHaveAttribute(
      'srcset',
      expect.stringContaining('400w'),
    );
    expect(webpSource).toHaveAttribute(
      'srcset',
      expect.stringContaining('800w'),
    );
    expect(webpSource).toHaveAttribute(
      'srcset',
      expect.stringContaining('1200w'),
    );
  });

  it('should generate sizes attribute', () => {
    render(<ResponsiveImage {...defaultProps} webpSrc='/test-image.webp' />);

    const webpSource = screen
      .getByRole('img')
      .closest('picture')
      ?.querySelector('source[type="image/webp"]');
    expect(webpSource).toHaveAttribute(
      'sizes',
      expect.stringContaining('640px'),
    );
    expect(webpSource).toHaveAttribute(
      'sizes',
      expect.stringContaining('768px'),
    );
    expect(webpSource).toHaveAttribute(
      'sizes',
      expect.stringContaining('1024px'),
    );
  });
});
