'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  children: ReactNode;
  threshold?: number;
}

export function InfiniteScroll({ 
  onLoadMore, 
  hasMore, 
  loading, 
  children,
  threshold = 0.8 
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!hasMore || loading) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);
  
  return (
    <>
      {children}
      
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          )}
        </div>
      )}
      
      {!hasMore && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          No more content to load
        </div>
      )}
    </>
  );
}

