'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { Pagination } from '@/components/Pagination';

const CONTENT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'artists', label: 'Artists' },
  { value: 'albums', label: 'Albums' },
  { value: 'tracks', label: 'Music' },
  { value: 'videos', label: 'Videos' },
  { value: 'minis', label: "Mini's" },
  { value: 'merch', label: 'Merch' },
  { value: 'events', label: 'Events' },
  { value: 'livestreams', label: 'Livestreams' },
  { value: 'playlists', label: 'Playlists' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  useEffect(() => {
    if (query) {
      performSearch(query, type, page);
    }
  }, [query, type, page]);
  
  const performSearch = async (searchQuery: string, searchType: string, currentPage: number) => {
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${apiUrl}/api/v1/search/all?q=${encodeURIComponent(searchQuery)}&type=${searchType}&page=${currentPage}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        
        if (searchType === 'all') {
          setTotalResults(data.total_count || 0);
        } else {
          setTotalResults(data.pagination?.total_count || 0);
        }
      } else {
        setResults(null);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', newType);
    router.push(`/search?${params.toString()}`);
  };
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', type);
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };
  
  const renderCategoryResults = (category: string, items: any[]) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div key={category} className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 capitalize">
          {category}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any, idx: number) => (
            <Link
              key={idx}
              href={getItemLink(category, item)}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow
                       border border-gray-200 dark:border-gray-700"
            >
              {renderResultCard(category, item)}
            </Link>
          ))}
        </div>
      </div>
    );
  };
  
  const renderResultCard = (category: string, item: any) => {
    switch (category) {
      case 'artists':
        return (
          <div className="flex items-center gap-3">
            <img
              src={item.avatar_url || '/default-avatar.png'}
              alt={item.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
              {item.verified && <span className="text-blue-500 text-sm">✓ Verified</span>}
            </div>
          </div>
        );
      
      case 'albums':
        return (
          <div className="flex gap-3">
            <img
              src={item.cover_url || '/placeholder-album.png'}
              alt={item.title}
              className="w-20 h-20 rounded object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
              <p className="text-sm text-gray-500">{item.artist_name}</p>
            </div>
          </div>
        );
      
      case 'tracks':
        return (
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
            <p className="text-sm text-gray-500">{item.artist_name} • {item.album_title}</p>
          </div>
        );
      
      case 'merch':
        return (
          <div className="flex gap-3">
            <img
              src={item.images?.[0] || '/placeholder-product.png'}
              alt={item.title}
              className="w-20 h-20 rounded object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
              <p className="text-lg font-bold text-blue-500">${item.price}</p>
              <p className="text-sm text-gray-500">{item.artist_name}</p>
            </div>
          </div>
        );
      
      case 'events':
        return (
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
            <p className="text-sm text-gray-500">
              {item.venue}, {item.city}
            </p>
            <p className="text-sm text-gray-500">{new Date(item.start_time).toLocaleDateString()}</p>
          </div>
        );
      
      default:
        return (
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title || item.name}</p>
          </div>
        );
    }
  };
  
  const getItemLink = (category: string, item: any) => {
    const routes: Record<string, string> = {
      artists: `/artists/${item.id}`,
      albums: `/albums/${item.id}`,
      tracks: `/tracks/${item.id}`,
      videos: `/videos/${item.id}`,
      minis: `/minis/${item.id}`,
      events: `/events/${item.id}`,
      merch: `/shop/merch/${item.id}`,
      livestreams: `/livestreams/${item.id}`,
      playlists: `/playlists/${item.id}`
    };
    return routes[category] || '/';
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalResults} results for "{query}"
          </p>
        </div>
        
        {/* Type Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {CONTENT_TYPES.map((contentType) => (
              <button
                key={contentType.value}
                onClick={() => handleTypeChange(contentType.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  type === contentType.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {contentType.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Results */}
        {!isLoading && results && (
          <>
            {type === 'all' && results.results && (
              <div>
                {results.results.map((categoryData: any) => 
                  renderCategoryResults(categoryData.category, categoryData.items)
                )}
              </div>
            )}
            
            {type !== 'all' && results.results && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.results.map((item: any, idx: number) => (
                  <Link
                    key={idx}
                    href={getItemLink(type, item)}
                    className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow
                             border border-gray-200 dark:border-gray-700"
                  >
                    {renderResultCard(type, item)}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {type !== 'all' && results.pagination && results.pagination.total_pages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={results.pagination.current_page}
                  totalPages={results.pagination.total_pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
        
        {/* No Results */}
        {!isLoading && (!results || totalResults === 0) && query && (
          <div className="text-center py-20">
            <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No results found for "{query}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>}>
      <SearchPageContent />
    </Suspense>
  );
}
