'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { FiTrendingUp, FiCheckCircle, FiSearch } from 'react-icons/fi';
import Link from 'next/link';
import { formatNumber, formatCurrency, calculatePriceChange } from '@/lib/utils';

export default function TokensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('market_cap');

  const { data, isLoading } = useQuery({
    queryKey: ['tokens', filter, sort],
    queryFn: () => api.getTokens({ 
      graduated: filter === 'graduated' ? 'true' : undefined,
      active: filter === 'active' ? 'true' : undefined,
      sort,
    }),
  });

  const tokens = data?.tokens || [];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'active', 'graduated'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {f === 'active' ? 'Bonding Curve' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="market_cap">Market Cap</option>
              <option value="volume">Volume</option>
              <option value="recent">Recently Created</option>
            </select>
          </div>

          {/* Tokens List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-800/50 rounded-xl p-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-700 rounded w-1/3" />
                      <div className="h-4 bg-gray-700 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tokens.length > 0 ? (
            <div className="space-y-4">
              {tokens.map((token: any) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiTrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No tokens found</p>
              <Link 
                href="/launch"
                className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Launch Your Token
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TokenCard({ token }: { token: any }) {
  const priceChange = 5.2; // Placeholder - would come from API

  return (
    <Link 
      href={`/tokens/${token.id}`}
      className="block bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6 hover:border-purple-500 transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Token Image */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
          {token.image_url ? (
            <img 
              src={token.image_url} 
              alt={token.name}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {token.symbol[0]}
            </span>
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">
              {token.name}
            </h3>
            {token.graduated && (
              <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
                GRADUATED
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-mono">{token.symbol}</span>
            <span>•</span>
            <span className="truncate flex items-center gap-1">
              {token.artist.name}
              {token.artist.verified && (
                <FiCheckCircle className="w-3 h-3 text-blue-500" />
              )}
            </span>
          </div>
        </div>

        {/* Stats (desktop) */}
        <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Market Cap</div>
            <div className="text-white font-semibold">
              {formatCurrency(token.market_cap || 0)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Supply</div>
            <div className="text-white font-semibold">
              {formatNumber(token.supply || 0, 0)}
            </div>
          </div>
          
          <div className="text-right min-w-[80px]">
            <div className={`text-sm font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange}%
            </div>
            <div className="text-xs text-gray-400">24h</div>
          </div>
        </div>

        {/* Stats (mobile) */}
        <div className="lg:hidden flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-white font-semibold text-sm">
            {formatCurrency(token.market_cap || 0)}
          </div>
          <div className={`text-xs font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange}%
          </div>
        </div>
      </div>
    </Link>
  );
}

