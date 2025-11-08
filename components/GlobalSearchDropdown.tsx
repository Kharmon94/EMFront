'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useSearch } from '@/lib/search-context';

export const GlobalSearchDropdown: React.FC<{ 
  onClose?: () => void;
  isMobile?: boolean;
}> = ({ onClose, isMobile = false }) => {
  const router = useRouter();
  const { query, setQuery, results, isLoading, recentSearches, clearRecentSearches } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  const handleInputFocus = () => {
    setIsOpen(true);
  };
  
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      onClose?.();
    }
  };
  
  const handleResultClick = (type: string, id: number) => {
    const routes: Record<string, string> = {
      artists: `/artists/${id}`,
      albums: `/albums/${id}`,
      tracks: `/tracks/${id}`,
      videos: `/videos/${id}`,
      minis: `/minis/${id}`,
      events: `/events/${id}`,
      merch: `/shop/merch/${id}`,
      livestreams: `/livestreams/${id}`,
      playlists: `/playlists/${id}`
    };
    
    router.push(routes[type] || '/');
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };
  
  const hasResults = results && Object.values(results).some(arr => arr.length > 0);
  const showRecentSearches = !query && recentSearches.length > 0;
  
  // Debug logging
  useEffect(() => {
    if (results) {
      console.log('Results in dropdown:', results);
      console.log('Has results:', hasResults);
    }
  }, [results, hasResults]);
  
  return (
    <div ref={dropdownRef} className={`relative ${isMobile ? 'w-full' : 'w-full max-w-md'}`}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Search artists, music, merch, events..."
          className="w-full px-4 py-2 pl-10 pr-10 rounded-full bg-gray-100 dark:bg-gray-800 
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
      </form>
      
      {isOpen && (query || showRecentSearches) && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl 
                      border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto z-[60]">
          {isLoading && (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          )}
          
          {showRecentSearches && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Recent Searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(search)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700
                             text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {hasResults && results && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Artists */}
              {results.artists.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Artists</h3>
                  <div className="space-y-2">
                    {results.artists.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handleResultClick('artists', artist.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <img 
                          src={artist.avatar_url || '/default-avatar.png'} 
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="text-left flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{artist.name}</p>
                          {artist.verified && <span className="text-blue-500 text-xs">✓ Verified</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tracks */}
              {results.tracks.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tracks</h3>
                  <div className="space-y-2">
                    {results.tracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => handleResultClick('tracks', track.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{track.title}</p>
                          <p className="text-sm text-gray-500">{track.artist_name} • {track.album_title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Merch */}
              {results.merch.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Merch</h3>
                  <div className="space-y-2">
                    {results.merch.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleResultClick('merch', item.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        <img 
                          src={item.images?.[0] || '/placeholder-product.png'} 
                          alt={item.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                          <p className="text-sm text-gray-500">${item.price} • {item.artist_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Events */}
              {results.events.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Events</h3>
                  <div className="space-y-2">
                    {results.events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleResultClick('events', event.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {event.venue}, {event.location} • {new Date(event.start_time).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* See All Results */}
              <div className="p-4">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                           font-medium flex items-center justify-center gap-2"
                >
                  <FiTrendingUp className="w-4 h-4" />
                  See All Results
                </button>
              </div>
            </div>
          )}
          
          {!isLoading && query && !hasResults && (
            <div className="p-6 text-center text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

