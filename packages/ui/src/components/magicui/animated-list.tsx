import * as React from 'react';
import { cn } from '../../utils';
import { AnimatePresence, motion } from 'framer-motion';

export type SharedAnimatedListItem = {
  id: string | number;
  title?: string;
  message?: string;
  type?: string;
  link?: string;
  createdAt?: string | number | Date;
  read?: boolean;
};

export type SharedAnimatedListRenderItem<T = SharedAnimatedListItem> = (item: T) => React.ReactNode;

export interface SharedAnimatedListProps<T = SharedAnimatedListItem> {
  items: readonly T[] | null | undefined;
  renderItem?: SharedAnimatedListRenderItem<T>;
  className?: string;
  role?: 'list' | 'listbox';
  ariaLabel?: string;
  /**
   * Visual density and sizing presets
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Animation config
   */
  motion?: {
    initial?: import('framer-motion').Target | boolean;
    animate?: import('framer-motion').AnimationControls | import('framer-motion').TargetAndTransition | import('framer-motion').VariantLabels | boolean;
    exit?: import('framer-motion').TargetAndTransition | import('framer-motion').VariantLabels;
    transition?: import('framer-motion').Transition;
  };
  /**
   * Loading/empty/error states
   */
  loading?: boolean;
  error?: string | null;
  emptyMessage?: React.ReactNode;
  /**
   * Keyboard navigation enabled
   */
  keyboardNavigation?: boolean;
}

const defaultMotion: Required<NonNullable<SharedAnimatedListProps['motion']>> = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.15 },
};

/**
 * SharedAnimatedList — SSR/CSR-safe animated list with a11y and DS integration
 * Tree-shakeable, no side-effects. Compatible with cn/twMerge.
 */
export function SharedAnimatedList<T = SharedAnimatedListItem>(props: SharedAnimatedListProps<T>) {
  const {
    items,
    renderItem,
    className,
    role = 'list',
    ariaLabel,
    size = 'md',
    motion: motionOverrides,
    loading,
    error,
    emptyMessage = (
      <span className='text-xs text-muted-foreground'>Nada para exibir</span>
    ),
    keyboardNavigation = true,
  } = props;

  const listRef = React.useRef<HTMLUListElement | null>(null);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  const isEmpty = !loading && !error && (!items || items.length === 0);
  const motionCfg: Required<NonNullable<SharedAnimatedListProps['motion']>> = {
    ...defaultMotion,
    ...(motionOverrides ?? {}),
  };

  // Keyboard navigation (SSR safe: only runs on client)
  React.useEffect(() => {
    if (!keyboardNavigation) return;
    const el = listRef.current;
    if (!el) return;

    function onKeyDown(e: KeyboardEvent) {
      if (!items || items.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((idx) => Math.min(idx + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((idx) => Math.max(idx - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setFocusedIndex(items.length - 1);
      }
    }

    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [items, keyboardNavigation]);

  React.useEffect(() => {
    if (focusedIndex < 0) return;
    const el = listRef.current;
    if (!el) return;
    const item = el.querySelectorAll('[role="listitem"], [role="option"]')[
      focusedIndex
    ] as HTMLElement | undefined;
    item?.focus?.();
  }, [focusedIndex]);

  const paddingBySize = size === 'lg' ? 'py-3 px-3' : size === 'sm' ? 'py-1.5 px-2' : 'py-2 px-2.5';
  const gapBySize = size === 'lg' ? 'gap-3' : size === 'sm' ? 'gap-1.5' : 'gap-2';

  return (
    <ul
      ref={listRef}
      className={cn(
        'flex flex-col',
        gapBySize,
        'outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-md',
        className,
      )}
      role={role}
      aria-label={ariaLabel}
      aria-busy={!!loading}
      aria-live='polite'
    >
      {loading && (
        <li role='status' className={cn('text-xs text-muted-foreground', paddingBySize)}>
          Carregando...
        </li>
      )}
      {error && !loading && (
        <li role='status' className={cn('text-xs text-destructive', paddingBySize)}>
          {error}
        </li>
      )}
      {isEmpty && <li className={cn('text-xs text-muted-foreground', paddingBySize)}>{emptyMessage}</li>}

      <AnimatePresence initial={false}>
        {(items ?? []).map((item, idx) => {
          const key = (item as any)?.id ?? idx;
          return (
            <motion.li
              key={key}
              initial={motionCfg.initial}
              animate={motionCfg.animate}
              exit={motionCfg.exit}
              transition={motionCfg.transition as any}
              role={role === 'listbox' ? 'option' : 'listitem'}
              tabIndex={0}
              className={cn(
                'rounded-md border border-border/60 bg-card/50 text-card-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                paddingBySize,
              )}
            >
              {renderItem ? (
                renderItem(item)
              ) : (
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    {(item as any)?.title && (
                      <div className='text-sm font-medium'>{(item as any).title}</div>
                    )}
                    {(item as any)?.message && (
                      <div className='text-xs text-muted-foreground'>{(item as any).message}</div>
                    )}
                  </div>
                  {(item as any)?.createdAt && (
                    <time
                      className='text-[11px] text-muted-foreground'
                      dateTime={new Date((item as any).createdAt).toISOString()}
                    >
                      {new Date((item as any).createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  )}
                </div>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

export default SharedAnimatedList;
