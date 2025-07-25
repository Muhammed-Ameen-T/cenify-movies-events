import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Card from '../ui/Card';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

interface Action<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string | ((item: T) => string); // Updated to allow function
  condition?: (row: T) => boolean;
}

interface DataTableWithPaginationProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (sortBy: string) => void;
  className?: string;
}

const DataTableWithPagination = <T,>({
  columns,
  data,
  actions = [],
  isLoading,
  error,
  emptyMessage = 'No data found',
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSort,
  className = '',
}: DataTableWithPaginationProps<T>) => {
  const handleSortClick = useCallback(
    (key: string) => {
      if (onSort && columns.find((col) => col.key === key)?.sortable) {
        onSort(key);
      }
    },
    [onSort, columns]
  );

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 4) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push('...');

      pages.push(totalPages);
    }

    return pages.map((page, index) =>
      typeof page === 'string' ? (
        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
          ...
        </span>
      ) : (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg text-sm ${
            currentPage === page
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800/50 border border-gray-700 text-white hover:bg-gray-700'
          } transition-all duration-200`}
          aria-label={`Go to page ${page}`}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <Card className={`p-6 bg-gray-900/90 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl ${className}`}>
      {isLoading ? (
       <div className="flex flex-col items-center justify-center py-6 text-gray-400">
          <svg
            className="animate-spin h-8 w-8 text-blue-500 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"
            ></path>
          </svg>
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-6">Error: {error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white">
              <thead>
                <tr className="border-b border-gray-700">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`py-3 px-4 text-sm font-medium text-gray-400 ${column.className || ''} ${
                        column.sortable ? 'cursor-pointer hover:text-white' : ''
                      }`}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSortClick(column.key)}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.sortable && sortBy === column.key && (
                          <span>
                            {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {data.map((item, index) => (
                    <motion.tr
                      key={(item as any)._id || index.toString()}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className={`py-3 px-4 text-sm ${column.className || ''}`}>
                          {column.render
                            ? column.render((item as any)[column.key], item, index)
                            : (item as any)[column.key]?.toString() || 'N/A'}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="py-3 px-4 text-sm flex space-x-2">
                          {actions
                            .filter(action => !action.condition || action.condition(item))
                            .map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => action.onClick(item)}
                                className={action.className || 'text-indigo-400 hover:text-indigo-300'}
                                title={action.label}
                                aria-label={typeof action.ariaLabel === 'function' ? action.ariaLabel(item) : action.ariaLabel || action.label}
                              >
                                {action.icon || action.label}
                              </button>
                            ))}
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                      className="py-6 text-center text-gray-400"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Show</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="pl-2 pr-2 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label="Select number of entries per page"
              >
                {[5, 10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-400">of {totalCount} entries</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all duration-200"
                aria-label="Previous page"
              >
                Previous
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all duration-200"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default DataTableWithPagination;