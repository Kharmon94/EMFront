'use client';

import { useQuery } from '@tanstack/react-query';
import { FiGift, FiTrendingUp, FiCheckCircle, FiLock } from 'react-icons/fi';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function FanPassesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['fanPasses'],
    queryFn: () => api.getFanPasses(),
  });

  const fanPasses = data?.fan_passes || [];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <FiGift className="w-10 h-10 text-purple-500" />
              Fan Pass NFTs
            </h1>
            <p className="text-xl text-gray-400">
              Exclusive NFTs with dividends, perks, and VIP access to your favorite artists
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="h-40 bg-gray-800 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : fanPasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fanPasses.map((pass: any) => (
                <FanPassCard key={pass.id} fanPass={pass} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiGift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No fan passes available yet</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function FanPassCard({ fanPass }: { fanPass: any }) {
  const soldOutPercentage = (fanPass.minted_count / fanPass.max_supply) * 100;

  return (
    <Link href={`/fan-passes/${fanPass.id}`}>
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-600 transition-all group">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-purple-900 to-pink-900">
          {fanPass.image_url ? (
            <img
              src={fanPass.image_url}
              alt={fanPass.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiGift className="w-20 h-20 text-white/50" />
            </div>
          )}
          
          {/* Sold out badge */}
          {fanPass.sold_out && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              SOLD OUT
            </div>
          )}

          {/* Dividend badge */}
          {fanPass.dividend_percentage > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <FiTrendingUp className="w-3 h-3" />
              {fanPass.dividend_percentage}% Dividend
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
            {fanPass.name}
          </h3>
          <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
            {fanPass.artist.name}
            {fanPass.artist.verified && (
              <FiCheckCircle className="w-3 h-3 text-blue-500" />
            )}
          </p>
          
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
            {fanPass.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div className="p-2 bg-gray-800 rounded text-center">
              <div className="text-white font-semibold">{fanPass.minted_count}/{fanPass.max_supply}</div>
              <div className="text-gray-500">Minted</div>
            </div>
            <div className="p-2 bg-gray-800 rounded text-center">
              <div className="text-purple-400 font-semibold">{formatCurrency(fanPass.price)}</div>
              <div className="text-gray-500">Price</div>
            </div>
            <div className="p-2 bg-gray-800 rounded text-center">
              <div className="text-white font-semibold">{fanPass.total_perks}</div>
              <div className="text-gray-500">Perks</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Supply</span>
              <span>{soldOutPercentage.toFixed(0)}% minted</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${soldOutPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {fanPass.available_supply} available
            </div>
            {fanPass.sold_out ? (
              <span className="text-xs text-red-400 font-semibold">Sold Out</span>
            ) : (
              <span className="text-xs text-green-400 font-semibold">Available</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

