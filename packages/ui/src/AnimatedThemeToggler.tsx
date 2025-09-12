import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
// Inline SVG icons to avoid external icon dependencies
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden
    {...props}
  >
    <circle cx='12' cy='12' r='4' />
    <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' />
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden
    {...props}
  >
    <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
  </svg>
);

import { useThemeBridge } from './theme/ThemeContext';

export interface AnimatedThemeTogglerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
}

export const AnimatedThemeToggler: React.FC<AnimatedThemeTogglerProps> = ({
  ariaLabel = 'Alternar tema',
  className,
  ...props
}) => {
  const { resolvedTheme, setTheme } = useThemeBridge();
  const isDark = resolvedTheme === 'dark';

  function onToggle() {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  }

  return (
    <button
      type='button'
      aria-label={ariaLabel}
      className={[
        'relative inline-flex touch-target items-center justify-center rounded-full border border-border bg-background p-2 text-foreground shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'hover:bg-accent/20 dark:hover:bg-accent/10',
        className ?? '',
      ].join(' ')}
      onClick={onToggle}
      {...props}
    >
      <span className='sr-only'>Alternar tema</span>
      <div className='relative h-5 w-5'>
        <AnimatePresence initial={false} mode='wait'>
          {isDark
            ? (
              <motion.div
                key='moon'
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className='absolute inset-0 flex items-center justify-center'
                aria-hidden
              >
                <MoonIcon className='h-5 w-5' />
              </motion.div>
            )
            : (
              <motion.div
                key='sun'
                initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className='absolute inset-0 flex items-center justify-center'
                aria-hidden
              >
                <SunIcon className='h-5 w-5' />
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </button>
  );
};
