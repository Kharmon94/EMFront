'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/lib/useDebounce';

interface SearchResult {
  artists: any[];
  albums: any[];
  tracks: any[];
  videos: any[];
  minis: any[];
  events: any[];
  merch: any[];
  livestreams: any[];
  playlists: any[];
}

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  results: SearchResult | null;
  isLoading: boolean;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  performSearch: (query: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);
  
  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse recent searches:', e);
        }
      }
    }
  }, []);
  
  // Save recent searches to localStorage
  const addRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches((prev) => {
      // Remove duplicates and add to start
      const filtered = prev.filter(s => s !== searchQuery);
      const updated = [searchQuery, ...filtered].slice(0, 10); // Keep last 10 searches
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
      
      return updated;
    });
  }, []);
  
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
    }
  }, []);
  
  // Perform search API call
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      console.log('Search API Response:', data);
      console.log('Search Results:', data.results);
      setResults(data.results);
      addRecentSearch(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [addRecentSearch]);
  
  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults(null);
    }
  }, [debouncedQuery, performSearch]);
  
  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        debouncedQuery,
        results,
        isLoading,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        performSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

