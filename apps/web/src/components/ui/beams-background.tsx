import { cn } from '@/lib/utils';
import React from 'react';

// Lightweight, CSS-only "Beams" style animated background inspired by KokonutUI
// Render at page root. Children render above via relative z-index.
export function BeamsBackground({
  className,
  children,
  intensity = 0.35,
}: {
  className?: string;
  children?: React.ReactNode;
  // 0..1 range; controls opacity of beams
  intensity?: number;
}) {
  return (
    <div className={cn('relative min-h-screen overflow-hidden bg-background', className)}>
      {/* Layered beams */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10'
        style={{
          backgroundImage:
            'conic-gradient(from 180deg at 50% 50%, rgba(172,148,105,0.10) 0deg, rgba(41,67,89,0.12) 120deg, rgba(17,32,49,0.10) 240deg, rgba(172,148,105,0.10) 360deg)',
          filter: 'blur(40px)',
          opacity: intensity,
        }}
      />
      <div
        aria-hidden
        className='pointer-events-none absolute -inset-32 -z-10 animate-[spin_20s_linear_infinite]'
        style={{
          background:
            'radial-gradient(60% 60% at 10% 90%, rgba(41,67,89,0.18) 0%, transparent 60%),\
             radial-gradient(50% 50% at 90% 20%, rgba(172,148,105,0.18) 0%, transparent 60%),\
             radial-gradient(40% 40% at 20% 20%, rgba(17,32,49,0.16) 0%, transparent 60%)',
          maskImage: 'radial-gradient(70% 70% at 50% 50%, black 30%, transparent 70%)',
        }}
      />

      {/* Grain for depth */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-[0.08]'
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\' viewBox=\'0 0 140 140\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")',
        }}
      />

      <div className='relative z-10'>{children}</div>
    </div>
  );
}

export default BeamsBackground;
