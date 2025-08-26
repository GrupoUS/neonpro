// Common types used across components

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface VariantProps {
  variant?: string;
  size?: string;
}

export interface LoadingState {
  loading?: boolean;
  loadingText?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  count?: number;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}
