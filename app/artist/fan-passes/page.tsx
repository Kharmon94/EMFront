'use client';

import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FiGift, FiPlus, FiEdit2, FiEye, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function ArtistFanPassesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artistFanPasses'],
    queryFn: async () => {
      const user = await api.get('/auth/me');
      const artistId = user.data.user.artist.id;
      return api.get(`/fan_passes?artist_id=${artistId}`);
    },
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const fanPasses = data?.data?.fan_passes || [];

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-6 pb-24 md:pb-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">My Fan Passes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your NFT fan passes and dividends
              </p>
            </div>
            <Link
              href="/artist/fan-passes/create"
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Create Fan Pass
            </Link>
          </div>

          {/* Fan Passes Grid */}
          {fanPasses.length === 0 ? (
            <div className="text-center py-16">
              <FiGift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No fan passes yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create exclusive NFT passes for your biggest fans</p>
              <Link
                href="/artist/fan-passes/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Create Fan Pass
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fanPasses.map((pass: any) => (
                <div
                  key={pass.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors"
                >
                  {/* Fan Pass Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-yellow-500 to-orange-500">
                    {pass.image_url ? (
                      <img
                        src={pass.image_url}
                        alt={pass.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiGift className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    
                    {/* Active Badge */}
                    {pass.active && (
                      <div className="absolute top-2 right-2">
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          Active
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pass Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                      {pass.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {pass.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Minted:</span>
                        <span className="font-semibold text-black dark:text-white">
                          {pass.minted_count || 0} / {pass.max_supply}
                        </span>
                      </div>
                      
                      {pass.price && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Price:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {pass.price} SOL
                          </span>
                        </div>
                      )}
                      
                      {pass.dividend_percentage && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Dividend:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {pass.dividend_percentage}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/artist/fan-passes/${pass.id}`}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        <FiEdit2 className="w-4 h-4 inline mr-1" />
                        Manage
                      </Link>
                      <Link
                        href={`/fan-passes/${pass.id}`}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}

