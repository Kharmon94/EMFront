'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiDownload, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function WrappedPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'wrapped', year],
    queryFn: () => api.get(`/analytics/wrapped?year=${year}`)
  });

  const wrapped = data?.data?.wrapped || {};
  const listening = wrapped.listening || {};
  const highlights = wrapped.highlights || [];
  const personality = wrapped.personality || [];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `My ${year} Wrapped`,
        text: `Check out my ${year} music stats!`,
        url: window.location.href
      });
    } else {
      toast.success('Sharing coming soon!');
    }
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 pb-8">
          {/* Year Selector */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={() => setYear(y => y - 1)}
              disabled={year <= 2024}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            
            <h1 className="text-5xl font-bold text-white text-center">
              {year} Wrapped
            </h1>
            
            <button
              onClick={() => setYear(y => y + 1)}
              disabled={year >= currentYear}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/10 rounded-2xl h-64" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Highlights */}
              {highlights.map((highlight: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center"
                >
                  <div className="text-6xl mb-4">{getEmoji(highlight.type)}</div>
                  <p className="text-2xl text-white font-semibold mb-2">
                    {highlight.message}
                  </p>
                  {highlight.data && (
                    <p className="text-white/70">
                      {JSON.stringify(highlight.data)}
                    </p>
                  )}
                </div>
              ))}

              {/* Top Artists */}
              {listening.top_artists && listening.top_artists.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-6">Your Top Artists</h2>
                  <div className="space-y-4">
                    {listening.top_artists.slice(0, 5).map((artist: any, index: number) => (
                      <div key={artist.id} className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-white/50">#{index + 1}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white">{artist.name}</h3>
                          <p className="text-white/70">
                            {artist.play_count} plays • {formatMinutes(artist.total_time)} minutes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personality Insights */}
              {personality.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-6">Your Music Personality</h2>
                  <div className="flex flex-wrap gap-3">
                    {personality.map((insight: any, index: number) => (
                      <div
                        key={index}
                        className="px-6 py-3 bg-white/20 rounded-full text-white font-semibold"
                      >
                        {insight.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-purple-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiShare2 /> Share
                </button>
                <Link
                  href="/analytics"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View Detailed Stats
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}

function getEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    top_artist: '🎵',
    total_time: '⏰',
    discovery: '🔍',
    engagement: '💬',
  };
  return emojiMap[type] || '✨';
}

function formatMinutes(seconds: number): string {
  return Math.floor(seconds / 60).toLocaleString();
}

