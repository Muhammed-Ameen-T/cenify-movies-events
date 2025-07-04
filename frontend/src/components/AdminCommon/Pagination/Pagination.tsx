import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationProps } from '../../../types/adminTable/pagination';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
  showPageInfo = true,
  showItemsInfo = true,
  className = '', 
  maxVisiblePages = 5
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === i
                ? 'bg-orange-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Complex pagination with ellipsis
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-orange-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === i
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {i}
            </button>
          );
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }

      if (totalPages > 1) {
        pages.push(
          <button
            key={totalPages}
            onClick={() => onPageChange(totalPages)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? 'bg-orange-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {totalPages}
          </button>
        );
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Main pagination controls */}
      <div className="flex justify-center items-center">
        <div className="flex items-center bg-gray-800 rounded-lg shadow-lg p-2 space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentPage === 1
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentPage === totalPages
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Page info */}
        {showPageInfo && (
          <div className="ml-4 text-gray-400 text-sm">
            Page {currentPage} of {totalPages} ({totalPages - currentPage} pages remaining)
          </div>
        )}
      </div>

      {/* Items info */}
      {showItemsInfo && totalItems > 0 && (
        <div className="text-gray-400 text-sm me-40 text-center">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
      )}
    </div>
  );
};

export default Pagination;