'use client';

import { FiLoader } from 'react-icons/fi';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  hasMore?: boolean;
  loadedCount?: number;
  totalCount?: number;
}

export function LoadMoreButton({ 
  onClick, 
  loading = false, 
  disabled = false,
  hasMore = true,
  loadedCount,
  totalCount
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          No more items to load
        </p>
        {loadedCount && totalCount && (
          <p className="text-sm text-gray-500 mt-2">
            Showing all {loadedCount} of {totalCount} items
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="py-8 flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all
          ${disabled || loading
            ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <FiLoader className="w-5 h-5 animate-spin" />
            Loading...
          </span>
        ) : (
          'Load More'
        )}
      </button>

      {loadedCount && totalCount && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {loadedCount} of {totalCount}
        </p>
      )}
    </div>
  );
}

