/**
 * LazyImage Component Tests
 * T078 - Frontend Performance Optimization
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyImage } from '../LazyImage';

// Mock intersection observer
const _mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: ((entries: any[]) => void) | null = null;

beforeEach(_() => {
  global.IntersectionObserver = vi.fn().mockImplementation(callback => {
    intersectionCallback = callback;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    };
  });
});

afterEach(_() => {
  vi.clearAllMocks();
});

describe(_'LazyImage',_() => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
  };

  it(_'should render with placeholder initially',_() => {
    render(<LazyImage {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test image');
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/svg+xml'),
    );
  });

  it(_'should load image when in view',_async () => {
    render(<LazyImage {...defaultProps} />);

    // Simulate intersection
    if (intersectionCallback) {
      intersectionCallback([{ isIntersecting: true }]);
    }

    await waitFor(_() => {
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test-image.jpg');
    });
  });

  it(_'should load image immediately when priority is true',_() => {
    render(<LazyImage {...defaultProps} priority />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it(_'should load image immediately when loading is eager',_() => {
    render(<LazyImage {...defaultProps} loading='eager' />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it(_'should show loading state initially',_() => {
    render(<LazyImage {...defaultProps} />);

    const loadingIndicator = screen
      .getByRole('img')
      .parentElement?.querySelector('.animate-pulse');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it(_'should hide loading state when image loads',_async () => {
    render(<LazyImage {...defaultProps} priority />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(_() => {
      expect(img).toHaveClass('opacity-100');
    });
  });

  it(_'should show error state when image fails to load',_async () => {
    render(<LazyImage {...defaultProps} priority />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(_() => {
      expect(img).toHaveAttribute('src', '/images/placeholder.svg');
      expect(img).toHaveClass('opacity-50');
    });
  });

  it(_'should use custom fallback image',_async () => {
    render(
      <LazyImage {...defaultProps} fallback='/custom-fallback.jpg' priority />,
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(_() => {
      expect(img).toHaveAttribute('src', '/custom-fallback.jpg');
    });
  });

  it(_'should call onLoad callback',_async () => {
    const onLoad = vi.fn();
    render(<LazyImage {...defaultProps} onLoad={onLoad} priority />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(_() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it(_'should call onError callback',_async () => {
    const onError = vi.fn();
    render(<LazyImage {...defaultProps} onError={onError} priority />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    await waitFor(_() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it(_'should apply custom className',_() => {
    render(<LazyImage {...defaultProps} className='custom-class' />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('custom-class');
  });

  it(_'should apply custom containerClassName',_() => {
    render(
      <LazyImage {...defaultProps} containerClassName='custom-container' />,
    );

    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('custom-container');
  });

  it(_'should set srcSet when in view',_async () => {
    const srcSet = '/test-image-400.jpg 400w, /test-image-800.jpg 800w';
    render(<LazyImage {...defaultProps} srcSet={srcSet} />);

    // Initially should not have srcSet
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('srcset');

    // Simulate intersection
    if (intersectionCallback) {
      intersectionCallback([{ isIntersecting: true }]);
    }

    await waitFor(_() => {
      expect(img).toHaveAttribute('srcset', srcSet);
    });
  });

  it(_'should disconnect observer when component unmounts',_() => {
    const { unmount } = render(<LazyImage {...defaultProps} />);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it(_'should handle missing IntersectionObserver',_() => {
    // @ts-ignore
    delete global.IntersectionObserver;

    expect(_() => render(<LazyImage {...defaultProps} />)).not.toThrow();
  });
});

describe(_'ResponsiveImage',_() => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    breakpoints: {
      sm: '400',
      md: '800',
      lg: '1200',
    },
  };

  it(_'should render LazyImage when no WebP/AVIF sources',_() => {
    render(<ResponsiveImage {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test image');
  });

  it(_'should render picture element with WebP source',_() => {
    render(<ResponsiveImage {...defaultProps} webpSrc='/test-image.webp' />);

    const picture = screen.getByRole('img').closest('picture');
    expect(picture).toBeInTheDocument();

    const webpSource = picture?.querySelector('source[type="image/webp"]');
    expect(webpSource).toBeInTheDocument();
  });

  it(_'should render picture element with AVIF source',_() => {
    render(<ResponsiveImage {...defaultProps} avifSrc='/test-image.avif' />);

    const picture = screen.getByRole('img').closest('picture');
    expect(picture).toBeInTheDocument();

    const avifSource = picture?.querySelector('source[type="image/avif"]');
    expect(avifSource).toBeInTheDocument();
  });

  it(_'should render both AVIF and WebP sources in correct order',_() => {
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

  it(_'should generate srcSet for different breakpoints',_() => {
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

  it(_'should generate sizes attribute',_() => {
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
