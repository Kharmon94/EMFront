'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface AutocompleteSearchProps {
  contentType: 'albums' | 'tracks' | 'videos' | 'minis' | 'events' | 'merch' | 'livestreams' | 'playlists';
  onSelect?: (item: any) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  contentType,
  onSelect,
  placeholder = 'Search...',
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (query.trim()) {
      setIsLoading(true);
      timeoutRef.current = setTimeout(async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          const response = await fetch(
            `${apiUrl}/api/v1/search/all?q=${encodeURIComponent(query)}&type=${contentType}&page=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            setResults(data.results || []);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Autocomplete search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, contentType]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    onSearch?.(value);
  };
  
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSearch?.('');
    inputRef.current?.focus();
  };
  
  const handleSelectResult = (item: any) => {
    onSelect?.(item);
    setIsOpen(false);
    setQuery('');
  };
  
  const renderResultItem = (item: any) => {
    switch (contentType) {
      case 'albums':
        return (
          <div className="flex items-center gap-3">
            <img 
              src={item.cover_url || '/placeholder-album.png'} 
              alt={item.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
              <p className="text-sm text-gray-500">{item.artist_name}</p>
            </div>
          </div>
        );
      
      case 'tracks':
        return (
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
            <p className="text-sm text-gray-500">{item.artist_name} • {item.album_title}</p>
          </div>
        );
      
      case 'merch':
        return (
          <div className="flex items-center gap-3">
            <img 
              src={item.images?.[0] || '/placeholder-product.png'} 
              alt={item.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
              <p className="text-sm text-gray-500">${item.price}</p>
            </div>
          </div>
        );
      
      case 'events':
        return (
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
            <p className="text-sm text-gray-500">
              {item.venue}, {item.city} • {new Date(item.start_time).toLocaleDateString()}
            </p>
          </div>
        );
      
      default:
        return (
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{item.title || item.name}</p>
          </div>
        );
    }
  };
  
  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-white dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   text-gray-900 dark:text-gray-100 placeholder-gray-500"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                      border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}
          
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectResult(item)}
                  className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  {renderResultItem(item)}
                </button>
              ))}
            </div>
          )}
          
          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

