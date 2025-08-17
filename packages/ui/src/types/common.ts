// Common types used across components

export type BaseComponentProps = {
  className?: string;
  children?: React.ReactNode;
};

export type VariantProps = {
  variant?: string;
  size?: string;
};

export type LoadingState = {
  loading?: boolean;
  loadingText?: string;
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
};

export type FilterOption = {
  id: string;
  label: string;
  value: string;
  color?: string;
  count?: number;
};

export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
};
