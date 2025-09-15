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
const getConstraints = (containerWidth: number, containerHeight: number, cardWidth: number, cardHeight: number) => {
  return {
    left: 0,
    right: Math.max(0, containerWidth - cardWidth),
    top: 0,
    bottom: Math.max(0, containerHeight - cardHeight),
  };
};

export function usePersistedDashboardLayout() {
  const [positions, setPositions] = useState<Record<string, CardPosition>>({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [gridConfig, setGridConfig] = useState<GridConfig>({ snapSize: 50, columns: 3, gap: 24 });

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

  // Update grid config based on container size
  useEffect(() => {
    if (containerSize.width > 0) {
      setGridConfig(getGridConfig(containerSize.width));
    }
  }, [containerSize.width]);

  // Debounced save to localStorage
  const savePositions = useCallback((newPositions: Record<string, CardPosition>) => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('neonpro-dashboard-layout', JSON.stringify(newPositions));
      } catch (error) {
        console.warn('Failed to save dashboard layout:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  // Update card position with snap assist
  const updateCardPosition = useCallback((
    cardId: string, 
    newPosition: { x: number; y: number },
    cardSize: { width: number; height: number }
  ) => {
    // Apply snap to grid
    const snappedX = snapToGrid(newPosition.x, gridConfig.snapSize);
    const snappedY = snapToGrid(newPosition.y, gridConfig.snapSize);

    // Apply constraints to keep card in view
    const constraints = getConstraints(
      containerSize.width, 
      containerSize.height, 
      cardSize.width, 
      cardSize.height
    );

    const constrainedX = Math.max(constraints.left, Math.min(constraints.right, snappedX));
    const constrainedY = Math.max(constraints.top, Math.min(constraints.bottom, snappedY));

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
  }, [gridConfig.snapSize, containerSize, savePositions]);

  // Get position for a card
  const getCardPosition = useCallback((cardId: string) => {
    return positions[cardId] || { id: cardId, x: 0, y: 0 };
  }, [positions]);

  // Reset all positions
  const resetLayout = useCallback(() => {
    setPositions({});
    localStorage.removeItem('neonpro-dashboard-layout');
  }, []);

  // Update container size (call from parent component)
  const updateContainerSize = useCallback((size: { width: number; height: number }) => {
    setContainerSize(size);
  }, []);

  return {
    positions,
    gridConfig,
    updateCardPosition,
    getCardPosition,
    resetLayout,
    updateContainerSize,
    snapToGrid: (pos: number) => snapToGrid(pos, gridConfig.snapSize),
  };
}