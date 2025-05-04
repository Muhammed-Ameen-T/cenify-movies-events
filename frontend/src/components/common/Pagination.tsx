import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages,
  onPageChange
}) => {
  const pageNumbers = [];
  
  // Logic to display page numbers with ellipsis for large page counts
  if (totalPages <= 7) {
    // If 7 or fewer pages, show all
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always include first page
    pageNumbers.push(1);
    
    if (currentPage > 3) {
      // Add ellipsis if current page is away from the start
      pageNumbers.push('...');
    }
    
    // Middle pages: around current
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      // Add ellipsis if current page is away from the end
      pageNumbers.push('...');
    }
    
    // Always include last page
    pageNumbers.push(totalPages);
  }
  
  return (
    <div className="flex items-center justify-center mt-6 space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center w-9 h-9 rounded-lg transition-colors 
          ${currentPage === 1 
            ? 'text-gray-500 cursor-not-allowed' 
            : 'text-gray-400 hover:text-white hover:bg-[#333333]'
          }
        `}
      >
        <ChevronLeft size={18} />
      </button>
      
      {pageNumbers.map((page, i) => (
        <button
          key={i}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`
            flex items-center justify-center w-9 h-9 rounded-lg transition-colors
            ${typeof page !== 'number' 
              ? 'cursor-default text-gray-500' 
              : page === currentPage 
                ? 'bg-[#0066F5] text-white' 
                : 'text-gray-400 hover:bg-[#333333] hover:text-white'
            }
          `}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center justify-center w-9 h-9 rounded-lg transition-colors 
          ${currentPage === totalPages 
            ? 'text-gray-500 cursor-not-allowed' 
            : 'text-gray-400 hover:text-white hover:bg-[#333333]'
          }
        `}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;