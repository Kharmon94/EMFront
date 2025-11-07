'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { AddToCartButton } from '@/components/AddToCartButton';
import { FiShoppingCart, FiCheckCircle, FiStar, FiHeart, FiShare2, FiGrid, FiList } from 'react-icons/fi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ArtistShopPage() {
  const params = useParams();
  const artistId = params.artistId as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  const { data: artistData, isLoading: artistLoading } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => api.getArtist(parseInt(artistId)),
  });

  const { data: merchData, isLoading: merchLoading } = useQuery({
    queryKey: ['merch', artistId, sortBy],
    queryFn: () => api.getMerchItems({ artist_id: artistId, sort: sortBy }),
  });

  const artist = artistData?.artist;
  const merchItems = merchData?.merch_items || [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Shop link copied!');
  };

  if (artistLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Artist not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pb-24 md:pb-6">
        {/* Artist Header */}
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 dark:from-purple-900 dark:to-pink-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-900 flex-shrink-0">
                {artist.avatar_url ? (
                  <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {artist.name?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{artist.name}</h1>
                  {artist.verified && (
                    <FiCheckCircle className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                  )}
                </div>
                <p className="text-white/80 text-lg mb-3">{artist.name}'s Official Shop</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/artists/${artistId}`}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FiShare2 className="w-4 h-4" />
                    Share Shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {merchItems.length} {merchItems.length === 1 ? 'Product' : 'Products'}
            </h2>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {merchLoading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className={viewMode === 'grid' ? "aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" : "h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"} />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : merchItems.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
              {merchItems.map((item: any) => (
                viewMode === 'grid' ? (
                  <ProductCard key={item.id} item={item} />
                ) : (
                  <ProductListItem key={item.id} item={item} />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {artist.name} hasn't added any merchandise yet
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ProductCard({ item }: { item: any }) {
  const image = item.images?.[0];
  const rating = item.rating_average || 0;

  return (
    <div className="group bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all">
      <Link href={`/shop/merch/${item.id}`} className="block">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
          {image ? (
            <img
              src={image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {!item.in_stock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-bold text-sm">OUT OF STOCK</span>
            </div>
          )}

          {/* Badges */}
          {item.featured && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                FEATURED
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {item.title}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({item.rating_count})
              </span>
            </div>
          )}

          <div className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {formatCurrency(item.price)}
          </div>

          <div className="mt-auto">
            <AddToCartButton merch_item={item} variant="small" showQuantity={false} />
          </div>
        </div>
      </Link>
    </div>
  );
}

function ProductListItem({ item }: { item: any }) {
  const image = item.images?.[0];
  const rating = item.rating_average || 0;

  return (
    <div className="flex gap-4 bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
      <Link href={`/shop/merch/${item.id}`} className="w-32 h-32 flex-shrink-0">
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
          {image ? (
            <img src={image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/shop/merch/${item.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {item.title}
          </h3>
        </Link>

        {rating > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {rating.toFixed(1)} ({item.rating_count})
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(item.price)}
          </div>
          <AddToCartButton merch_item={item} variant="secondary" showQuantity={false} />
        </div>
      </div>
    </div>
  );
}
