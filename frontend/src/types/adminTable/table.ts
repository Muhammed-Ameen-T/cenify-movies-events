import { ReactNode } from 'react';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: string;
  sortable?: boolean;
  className?: string;
}

export interface TableAction<T = unknown> {
  label: string;
  onClick: (row: T) => void;
  className?: string;
  icon?: ReactNode;
  condition?: (row: T) => boolean;
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  actions?: TableAction<T>[];
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T) => void;
  shimmerRows?: number;
}