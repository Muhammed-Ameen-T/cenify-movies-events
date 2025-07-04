import { ReactNode } from 'react';

export type FilterType = 'search' | 'select' | 'multiSelect' | 'dateSort' | 'checkbox' | 'custom';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface BaseFilter {
  key: string;
  label: string;
  type: FilterType;
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
}

export interface SearchFilter extends BaseFilter {
  type: 'search';
  value: string;
  onChange: (value: string) => void;
}

export interface SelectFilter extends BaseFilter {
  type: 'select';
  options: FilterOption[];
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean | null) => void;
  allowClear?: boolean;
}

export interface MultiSelectFilter extends BaseFilter {
  type: 'multiSelect';
  options: FilterOption[];
  value: (string | number | boolean)[];
  onChange: (value: (string | number | boolean)[]) => void;
}

export interface DateSortFilter extends BaseFilter {
  type: 'dateSort';
  options: { label: string; value: 'asc' | 'desc' | null }[];
  value: 'asc' | 'desc' | null;
  onChange: (value: 'asc' | 'desc' | null) => void;
}

export interface CheckboxFilter extends BaseFilter {
  type: 'checkbox';
  options: FilterOption[];
  value: (string | number | boolean)[];
  onChange: (value: (string | number | boolean)[]) => void;
}

export interface CustomFilter extends BaseFilter {
  type: 'custom';
  component: ReactNode;
}

export type Filter = SearchFilter | SelectFilter | MultiSelectFilter | DateSortFilter | CheckboxFilter | CustomFilter;

export interface FilterConfig {
  filters: Filter[];
  onReset: () => void;
  resetLabel?: string;
  showActiveCount?: boolean;
  expandable?: boolean;
  expandedContent?: ReactNode;
  className?: string;
}