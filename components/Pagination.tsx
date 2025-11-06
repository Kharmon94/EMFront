'use client';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  maxVisiblePages = 5 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center justify-center gap-2 py-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          p-2 rounded-lg border transition-all
          ${currentPage === 1
            ? 'border-gray-300 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-600 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                }
              `}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          p-2 rounded-lg border transition-all
          ${currentPage === totalPages
            ? 'border-gray-300 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
        aria-label="Next page"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

