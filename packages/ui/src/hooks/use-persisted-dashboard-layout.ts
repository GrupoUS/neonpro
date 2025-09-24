'use client';

import { useCallback, useEffect, useState } from 'react';

interface CardPosition {
  x: number;
  y: number;
  id: string;
}

interface GridConfig {
  snapSize: number;
  columns: number;
  gap: number;
}

// Responsive grid configurations
const getGridConfig = (width: number): GridConfig => {
  if (width < 768) {
    // Mobile: 1 column, larger snap
    return { snapSize: 25, columns: 1, gap: 24 };
  } else if (width < 1024) {
    // Tablet: 2 columns, medium snap
    return { snapSize: 40, columns: 2, gap: 24 };
  } else {
    // Desktop: 3 columns, fine snap
    return { snapSize: 50, columns: 3, gap: 24 };
  }
};

// Snap position to grid
const snapToGrid = (position: number, snapSize: number): number => {
  return Math.round(position / snapSize) * snapSize;
};

// Get container constraints based on viewport
const getConstraints = (
  containerWidth: number,
  containerHeight: number,
  cardWidth: number,
  cardHeight: number,
) => {
  return {
    left: 0,
    right: Math.max(0, containerWidth - cardWidth),
    top: 0,
    bottom: Math.max(0, containerHeight - cardHeight),
  };
};

// Calculate automatic grid positions for cards
const calculateGridPositions = (
  cardIds: string[],
  _containerWidth: number,
  _containerHeight: number,
  cardSize: { width: number; height: number },
  gridConfig: GridConfig,
): Record<string, CardPosition> => {
  const { columns, gap } = gridConfig;
  const positions: Record<string, CardPosition> = {};

  cardIds.forEach((cardId, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;

    const x = gap + col * (cardSize.width + gap);
    const y = gap + row * (cardSize.height + gap);

    positions[cardId] = { id: cardId, x, y };
  });

  return positions;
};

export function usePersistedDashboardLayout() {
  const [positions, setPositions] = useState<Record<string, CardPosition>>({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    snapSize: 50,
    columns: 3,
    gap: 24,
  });

  // Load positions from localStorage on mount
  useEffect(() => {
    const savedPositions = localStorage.getItem('neonpro-dashboard-layout');
    if (savedPositions) {
      try {
        setPositions(JSON.parse(savedPositions));
      } catch (error) {
        console.warn('Failed to parse saved dashboard layout:', error);
      }
    }
  }, []);

  // Auto-distribute cards when container dimensions change or cards are added
  const autoDistributeCards = useCallback(
    (cardIds: string[]) => {
      if (!containerSize.width || !containerSize.height || cardIds.length === 0) {
        return;
      }

      // Only auto-distribute if we have no saved positions for any card
      const hasExistingPositions = cardIds.some(id => positions[id]);
      if (hasExistingPositions) {return;}

      const cardSize = { width: 280, height: 200 }; // Default card size
      const newPositions = calculateGridPositions(
        cardIds,
        containerSize.width,
        containerSize.height,
        cardSize,
        gridConfig,
      );

      console.log('Auto-distributing cards:', {
        cardIds,
        newPositions,
        containerSize,
      });
      setPositions(prev => ({ ...prev, ...newPositions }));
    },
    [containerSize, gridConfig, positions],
  );

  // Update grid config based on container size
  useEffect(() => {
    if (containerSize.width > 0) {
      setGridConfig(getGridConfig(containerSize.width));
    }
  }, [containerSize.width]);

  // Debounced save to localStorage
  const savePositions = useCallback(
    (newPositions: Record<string, CardPosition>) => {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(
            'neonpro-dashboard-layout',
            JSON.stringify(newPositions),
          );
        } catch (error) {
          console.warn('Failed to save dashboard layout:', error);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [],
  );

  // Update card position with snap assist
  const updateCardPosition = useCallback(
    (
      cardId: string,
      newPosition: { x: number; y: number },
      cardSize: { width: number; height: number },
    ) => {
      // Apply snap to grid
      const snappedX = snapToGrid(newPosition.x, gridConfig.snapSize);
      const snappedY = snapToGrid(newPosition.y, gridConfig.snapSize);

      // Apply constraints to keep card in view
      const constraints = getConstraints(
        containerSize.width,
        containerSize.height,
        cardSize.width,
        cardSize.height,
      );

      const constrainedX = Math.max(
        constraints.left,
        Math.min(constraints.right, snappedX),
      );
      const constrainedY = Math.max(
        constraints.top,
        Math.min(constraints.bottom, snappedY),
      );

      const finalPosition = {
        id: cardId,
        x: constrainedX,
        y: constrainedY,
      };

      setPositions(prev => {
        const newPositions = {
          ...prev,
          [cardId]: finalPosition,
        };
        savePositions(newPositions);
        return newPositions;
      });
    },
    [gridConfig.snapSize, containerSize, savePositions],
  );

  // Get position for a card
  const getCardPosition = useCallback(
    (cardId: string) => {
      return positions[cardId] || { id: cardId, x: 0, y: 0 };
    },
    [positions],
  );

  // Reset all positions
  const resetLayout = useCallback(() => {
    setPositions({});
    localStorage.removeItem('neonpro-dashboard-layout');
  }, []);

  // Update container size (call from parent component)
  const updateContainerSize = useCallback(
    (size: { width: number; height: number }) => {
      setContainerSize(size);
    },
    [],
  );

  return {
    positions,
    gridConfig,
    updateCardPosition,
    getCardPosition,
    resetLayout,
    updateContainerSize,
    autoDistributeCards,
    snapToGrid: (pos: number) => snapToGrid(pos, gridConfig.snapSize),
  };
}
