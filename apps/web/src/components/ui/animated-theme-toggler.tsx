'use client';

import { cn } from '@/lib/utils';
import { useThemeBridge } from '@/shims/neonpro-ui-theme';
import { Moon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type props = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export const AnimatedThemeToggler = ({ className, size = 'md' }: props) => {
  const { theme, resolvedTheme, setTheme } = useThemeBridge();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    resolvedTheme === 'dark',
  );
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsDarkMode(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      // Fallback for browsers without View Transition API
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      setIsDarkMode(newTheme === 'dark');
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        setIsDarkMode(newTheme === 'dark');
      });
    }).ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          'rounded-full border border-border bg-background',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={changeTheme}
      className={cn(
        'relative rounded-full border border-border bg-background/80 backdrop-blur-sm',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transition-colors duration-200 flex items-center justify-center',
        sizeClasses[size],
        className,
      )}
    >
      {isDarkMode
        ? (
          <SunDim
            size={iconSizes[size]}
            className='text-[#AC9469] transition-all duration-300'
          />
        )
        : (
          <Moon
            size={iconSizes[size]}
            className='text-[#AC9469] transition-all duration-300'
          />
        )}
    </button>
  );
};
