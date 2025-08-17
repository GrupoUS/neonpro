/**
 * Placeholder regulatory categories hook
 */
import { useState } from 'react';

export const useRegulatoryCategories = () => {
  const [categories, setCategories] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return {
    categories,
    isLoading,
    loadCategories: async () => {
      setIsLoading(true);
      setTimeout(() => {
        setCategories([
          { id: '1', name: 'ANVISA', description: 'Health regulation' },
          { id: '2', name: 'CFM', description: 'Medical council' },
        ]);
        setIsLoading(false);
      }, 1000);
    },
  };
};
