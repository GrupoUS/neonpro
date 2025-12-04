import { cn } from '@/lib/utils';
import { Button } from '@neonpro/ui';
import { GripVertical, Lock, Unlock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import GridLayout, { type Layout } from 'react-grid-layout';

interface DashboardCard {
  id: string;
  content: React.ReactNode;
  defaultLayout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface DraggableDashboardProps {
  cards: DashboardCard[];
  cols?: number;
  rowHeight?: number;
  storageKey?: string;
}

export function DraggableDashboard({
  cards,
  cols = 12,
  rowHeight = 80,
  storageKey = 'neonpro-dashboard-layout-v2',
}: DraggableDashboardProps) {
  const [isDraggable, setIsDraggable] = useState(false);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize layout from localStorage or defaults
  useEffect(() => {
    const generateDefaultLayout = (): Layout[] => {
      return cards.map((card, index) => {
        if (card.defaultLayout) {
          return {
            i: card.id,
            ...card.defaultLayout,
          };
        }

        // Auto-generate grid positions
        // Stats cards: 3 columns wide each (4 cards in row)
        // Content cards: various sizes
        const isStatsCard = index < 4;
        if (isStatsCard) {
          return {
            i: card.id,
            x: (index * 3) % 12,
            y: 0,
            w: 3,
            h: 3,
          };
        }

        // Recent Activity (large)
        if (index === 4) {
          return {
            i: card.id,
            x: 0,
            y: 3,
            w: 8,
            h: 4,
          };
        }

        // Quick Actions
        if (index === 5) {
          return {
            i: card.id,
            x: 8,
            y: 3,
            w: 4,
            h: 4,
          };
        }

        // Notifications (full width)
        if (index === 6) {
          return {
            i: card.id,
            x: 0,
            y: 7,
            w: 12,
            h: 3,
          };
        }

        // Fallback for any additional cards
        return {
          i: card.id,
          x: (index * 4) % 12,
          y: Math.floor(index / 3) * 4,
          w: 4,
          h: 3,
        };
      });
    };

    const savedLayout = localStorage.getItem(storageKey);

    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setLayout(parsed);
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
        setLayout(generateDefaultLayout());
      }
    } else {
      setLayout(generateDefaultLayout());
    }

    setMounted(true);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem(storageKey, JSON.stringify(newLayout));
  }, [storageKey]);

  const handleResetLayout = () => {
    localStorage.removeItem(storageKey);
    // Generate fresh default layout
    const defaultLayout: Layout[] = cards.map((card, index) => {
      if (card.defaultLayout) {
        return {
          i: card.id,
          ...card.defaultLayout,
        };
      }

      const isStatsCard = index < 4;
      if (isStatsCard) {
        return {
          i: card.id,
          x: (index * 3) % 12,
          y: 0,
          w: 3,
          h: 3,
        };
      }

      if (index === 4) {
        return {
          i: card.id,
          x: 0,
          y: 3,
          w: 8,
          h: 4,
        };
      }

      if (index === 5) {
        return {
          i: card.id,
          x: 8,
          y: 3,
          w: 4,
          h: 4,
        };
      }

      if (index === 6) {
        return {
          i: card.id,
          x: 0,
          y: 7,
          w: 12,
          h: 3,
        };
      }

      return {
        i: card.id,
        x: (index * 4) % 12,
        y: Math.floor(index / 3) * 4,
        w: 4,
        h: 3,
      };
    });
    setLayout(defaultLayout);
  };

  const toggleDraggable = () => {
    setIsDraggable(!isDraggable);
  };

  if (!mounted) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="relative">
      {/* Control Bar */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant={isDraggable ? 'default' : 'outline'}
          size="sm"
          onClick={toggleDraggable}
          className="gap-2"
        >
          {isDraggable ? (
            <>
              <Unlock className="h-4 w-4" />
              Drag Habilitado
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Drag Desabilitado
            </>
          )}
        </Button>

        {isDraggable && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
          >
            Resetar Layout
          </Button>
        )}
      </div>

      {/* Dashboard Grid */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={cols}
        rowHeight={rowHeight}
        width={1200}
        isDraggable={isDraggable}
        isResizable={false}
        compactType="vertical"
        preventCollision={false}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              'relative rounded-lg overflow-hidden',
              isDraggable && 'ring-2 ring-primary/20'
            )}
          >
            {/* Drag Handle */}
            {isDraggable && (
              <div className="drag-handle absolute top-2 right-2 z-50 cursor-move p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors">
                <GripVertical className="h-4 w-4 text-primary" />
              </div>
            )}

            {/* Card Content */}
            <div className="h-full w-full">
              {card.content}
            </div>
          </div>
        ))}
      </GridLayout>

      {/* Instructions */}
      {isDraggable && (
        <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-1">💡 Modo de edição ativo</p>
          <p>Clique e arraste o ícone <GripVertical className="h-3 w-3 inline" /> no canto superior direito de cada card para reorganizar o layout.</p>
        </div>
      )}
    </div>
  );
}
