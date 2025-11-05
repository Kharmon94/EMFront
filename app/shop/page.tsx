'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { FiShoppingBag, FiSearch, FiFilter, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function GlobalShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const { data: merchData, isLoading } = useQuery({
    queryKey: ['global-merch', searchQuery, selectedArtist, inStockOnly],
    queryFn: () => api.getMerchItems({
      q: searchQuery || undefined,
      artist_id: selectedArtist || undefined,
      in_stock: inStockOnly ? 'true' : undefined,
    }),
  });

  const { data: artistsData } = useQuery({
    queryKey: ['artists-list'],
    queryFn: () => api.getArtists({ limit: 100 }),
  });

  const merchItems = merchData?.merch_items || [];
  const artists = artistsData?.artists || [];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
              <FiShoppingBag className="w-10 h-10" />
              Shop
            </h1>
            <p className="text-gray-400 text-lg">
              Official merchandise from your favorite artists
            </p>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search merchandise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Artist Filter */}
              <div className="sm:w-64">
                <select
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All Artists</option>
                  {artists.map((artist: any) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* In Stock Filter */}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white cursor-pointer hover:border-purple-500 transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                />
                <span className="text-sm whitespace-nowrap">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <div className="mb-4 text-gray-400 text-sm">
              {merchItems.length} {merchItems.length === 1 ? 'item' : 'items'} found
            </div>
          )}

          {/* Merch Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-800 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : merchItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {merchItems.map((item: any) => (
                <MerchCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No merchandise found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function MerchCard({ item }: { item: any }) {
  const image = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <Link 
      href={`/shop/merch/${item.id}`}
      className="group block bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-all"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-800 relative">
        {image ? (
          <img 
            src={image} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" />
          </div>
        )}
        
        {!item.in_stock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-sm">OUT OF STOCK</span>
          </div>
        )}

        {/* Artist Badge */}
        {item.artist && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs">
              {item.artist.avatar_url && (
                <img 
                  src={item.artist.avatar_url} 
                  alt={item.artist.name}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="text-white truncate">{item.artist.name}</span>
              {item.artist.verified && (
                <FiCheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
          {item.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="text-base sm:text-lg font-bold text-white">
            {formatCurrency(item.price)}
          </div>
          {item.inventory_count !== undefined && item.inventory_count > 0 && (
            <div className="text-xs text-gray-400">
              {item.inventory_count} left
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

