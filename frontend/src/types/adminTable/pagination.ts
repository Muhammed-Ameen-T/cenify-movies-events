export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showPageInfo?: boolean;
  showItemsInfo?: boolean;
  className?: string;
  maxVisiblePages?: number;
}