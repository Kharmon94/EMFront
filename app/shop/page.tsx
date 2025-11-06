'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { 
  FiShoppingBag, FiSearch, FiFilter, FiCheckCircle, FiStar, FiGrid, FiList,
  FiHeart, FiEye, FiChevronDown, FiX, FiTrendingUp, FiShoppingCart
} from 'react-icons/fi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Pagination } from '@/components/Pagination';

export default function GlobalShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Parse price range
  const getPriceRange = () => {
    switch (priceRange) {
      case 'under25': return { min: undefined, max: '25' };
      case '25to50': return { min: '25', max: '50' };
      case '50to100': return { min: '50', max: '100' };
      case '100to200': return { min: '100', max: '200' };
      case 'over200': return { min: '200', max: undefined };
      default: return { min: undefined, max: undefined };
    }
  };

  const { min: minPrice, max: maxPrice } = getPriceRange();

  const { data: merchData, isLoading } = useQuery({
    queryKey: ['global-merch', searchQuery, selectedCategory, priceRange, minRating, inStockOnly, sortBy, page],
    queryFn: () => api.getMerchItems({
      q: searchQuery || undefined,
      category_id: selectedCategory || undefined,
      min_price: minPrice,
      max_price: maxPrice,
      min_rating: minRating || undefined,
      in_stock: inStockOnly ? 'true' : undefined,
      sort: sortBy,
      page,
      limit: 24
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data),
  });

  const { data: recentlyViewedData } = useQuery({
    queryKey: ['recently-viewed'],
    queryFn: () => api.get('/merch/recently_viewed').then(res => res.data),
    enabled: true
  });

  const merchItems = merchData?.merch_items || [];
  const categories = categoriesData?.categories || [];
  const meta = merchData?.meta || {};
  const recentlyViewed = recentlyViewedData?.items || [];

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange('');
    setMinRating('');
    setInStockOnly(false);
    setPage(1);
  };

  const activeFiltersCount = [
    selectedCategory,
    priceRange,
    minRating,
    inStockOnly
  ].filter(Boolean).length;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section with Featured Products */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <FiShoppingBag className="w-10 h-10 text-blue-600" />
                  Shop
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Official merchandise from your favorite artists
                </p>
              </div>
              
              <Link 
                href="/wishlist"
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <FiHeart className="w-5 h-5" />
                <span className="font-medium text-gray-900 dark:text-white">Wishlist</span>
              </Link>
            </div>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiEye className="w-5 h-5 text-purple-600" />
                    Recently Viewed
                  </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {recentlyViewed.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/shop/merch/${item.id}`}
                      className="flex-shrink-0 w-48 bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiShoppingCart className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h3>
                        <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(item.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search & Sort Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer min-w-[200px]"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="trending">Trending</option>
            </select>

            {/* View Toggle */}
            <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
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

            {/* Mobile Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:border-blue-500 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
              <div className="sticky top-20">
                <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-4 space-y-6">
                  {/* Mobile Header */}
                  <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-gray-300 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 text-gray-600 dark:text-gray-400"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Filter Header */}
                  <div className="hidden lg:flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={!selectedCategory}
                          onChange={() => setSelectedCategory('')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">All Categories</span>
                      </label>
                      {categories.map((cat: any) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={cat.id}
                            checked={selectedCategory === cat.id.toString()}
                            onChange={() => setSelectedCategory(cat.id.toString())}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {cat.name} {cat.product_count > 0 && `(${cat.product_count})`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white cursor-pointer"
                    >
                      <option value="">All Prices</option>
                      <option value="under25">Under $25</option>
                      <option value="25to50">$25 - $50</option>
                      <option value="50to100">$50 - $100</option>
                      <option value="100to200">$100 - $200</option>
                      <option value="over200">Over $200</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Rating</h3>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={minRating === rating.toString()}
                            onChange={() => setMinRating(rating.toString())}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">& Up</span>
                          </div>
                        </label>
                      ))}
                      {minRating && (
                        <button
                          onClick={() => setMinRating('')}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Clear rating filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Availability</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
                    </label>
                  </div>

                </div>
              </div>
            </aside>

            {/* Mobile Filters Modal */}
            {showFilters && (
              <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 lg:hidden">
                <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white dark:bg-black overflow-y-auto">
                  <div className="p-4 space-y-6">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-300 dark:border-gray-800">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 text-gray-600 dark:text-gray-400"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Same filter content as desktop */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category-mobile"
                            value=""
                            checked={!selectedCategory}
                            onChange={() => setSelectedCategory('')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">All Categories</span>
                        </label>
                        {categories.map((cat: any) => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="category-mobile"
                              value={cat.id}
                              checked={selectedCategory === cat.id.toString()}
                              onChange={() => setSelectedCategory(cat.id.toString())}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {cat.name} {cat.product_count > 0 && `(${cat.product_count})`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white cursor-pointer"
                      >
                        <option value="">All Prices</option>
                        <option value="under25">Under $25</option>
                        <option value="25to50">$25 - $50</option>
                        <option value="50to100">$50 - $100</option>
                        <option value="100to200">$100 - $200</option>
                        <option value="over200">Over $200</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Availability</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
                      </label>
                    </div>

                    {/* Mobile Apply Button */}
                    <div className="pt-4 border-t border-gray-300 dark:border-gray-800">
                      <button
                        onClick={() => setShowFilters(false)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        Show {merchItems.length} Results
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {!isLoading && (
                    <>
                      <span className="font-semibold text-gray-900 dark:text-white">{meta.total_count || merchItems.length}</span> products found
                    </>
                  )}
                </div>
              </div>

              {/* Products Grid/List */}
              {isLoading ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-4"
                }>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className={viewMode === 'grid' ? "aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" : "h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"} />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : merchItems.length > 0 ? (
                <>
                  <div className={viewMode === 'grid'
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    : "space-y-4"
                  }>
                    {merchItems.map((item: any) => (
                      viewMode === 'grid' 
                        ? <ProductCard key={item.id} item={item} />
                        : <ProductListItem key={item.id} item={item} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {meta.total_pages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={meta.total_pages}
                      onPageChange={(newPage) => setPage(newPage)}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <FiShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your filters or search query
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Product Card Component (Grid View)
function ProductCard({ item }: { item: any }) {
  const image = item.images && item.images.length > 0 ? item.images[0] : null;
  const rating = item.rating_average || 0;

  return (
    <Link
      href={`/shop/merch/${item.id}`}
      className="group block bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2">
          {item.featured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
              FEATURED
            </span>
          )}
          {item.token_gated && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
              TOKEN EXCLUSIVE
            </span>
          )}
          {item.limited_edition && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
              LIMITED
            </span>
          )}
        </div>

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
                <FiCheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(item.price)}
          </div>
          {item.inventory_count !== undefined && item.inventory_count > 0 && item.inventory_count <= 10 && (
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              Only {item.inventory_count} left
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Product List Item Component (List View)
function ProductListItem({ item }: { item: any }) {
  const image = item.images && item.images.length > 0 ? item.images[0] : null;
  const rating = item.rating_average || 0;

  return (
    <Link
      href={`/shop/merch/${item.id}`}
      className="group flex gap-4 bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all p-4"
    >
      {/* Image */}
      <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h3>
            
            {/* Artist */}
            {item.artist && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                by <span className="font-medium text-gray-900 dark:text-white">{item.artist.name}</span>
                {item.artist.verified && <FiCheckCircle className="w-4 h-4 text-blue-500" />}
              </div>
            )}

            {/* Rating */}
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
                  {rating.toFixed(1)} ({item.rating_count} reviews)
                </span>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Price */}
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(item.price)}
            </div>
            {item.in_stock ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">In Stock</span>
            ) : (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {item.featured && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
              Featured
            </span>
          )}
          {item.token_gated && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium rounded">
              Token Exclusive
            </span>
          )}
          {item.limited_edition && (
            <span className="px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium rounded">
              Limited Edition
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
