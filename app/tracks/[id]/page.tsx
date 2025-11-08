'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer, usePlayerStore } from '@/components/MusicPlayer';
import { PurchaseModal } from '@/components/PurchaseModal';
import { usePermissions } from '@/lib/usePermissions';
import { FiPlay, FiHeart, FiShare2, FiCheckCircle, FiMusic, FiShoppingCart, FiClock, FiHeadphones, FiLogIn } from 'react-icons/fi';
import Link from 'next/link';
import { formatDuration, formatDate, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TrackPage() {
  const params = useParams();
  const trackId = params.id as string;
  const { playTrack } = usePlayerStore();
  const { isAuthenticated } = usePermissions();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => api.getTrack(parseInt(trackId)),
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-gray-900 dark:text-white">Loading track...</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Track not found</div>
        </div>
      </>
    );
  }

  const { track } = data;

  const handlePlay = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to listen to music');
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }
    
    const enrichedTrack = {
      ...track,
      album: track.album,
      artist: track.artist,
    };
    playTrack(enrichedTrack, [enrichedTrack]);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Track link copied to clipboard!');
  };

  const handleLike = () => {
    toast.error('Please connect your wallet to like tracks');
  };

  const handleBuy = () => {
    setShowPurchaseModal(true);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Track Header */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-12">
            {/* Cover Art */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                {track.album?.cover_url ? (
                  <img 
                    src={track.album.cover_url} 
                    alt={track.album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                    <FiMusic className="w-24 h-24 text-white/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 flex flex-col justify-end">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Track</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                {track.title}
                {track.explicit && (
                  <span className="ml-3 text-sm text-gray-400 border border-gray-600 px-2 py-1 rounded align-middle">
                    E
                  </span>
                )}
              </h1>
              
              {/* Artist & Album */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Link 
                  href={`/artists/${track.artist.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  {track.artist.avatar_url && (
                    <img 
                      src={track.artist.avatar_url} 
                      alt={track.artist.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-white font-medium">{track.artist.name}</span>
                  {track.artist.verified && (
                    <FiCheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </Link>
                
                {track.album && (
                  <>
                    <span className="text-gray-400">•</span>
                    <Link 
                      href={`/albums/${track.album.id}`}
                      className="text-gray-700 dark:text-gray-300 hover:underline"
                    >
                      {track.album.title}
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                {track.duration && (
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                )}
                {track.streams_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <FiHeadphones className="w-4 h-4" />
                    <span>{formatNumber(track.streams_count)} plays</span>
                  </div>
                )}
                {track.release_date && (
                  <span>{formatDate(track.release_date)}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlay}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2"
                >
                  <FiPlay className="w-5 h-5" />
                  Play
                </button>
                
                <button
                  onClick={handleLike}
                  className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
                  title="Like"
                >
                  <FiHeart className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
                  title="Share"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
                
                {track.price && (
                  <button
                    onClick={handleBuy}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full transition-colors border border-gray-700 flex items-center gap-2"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Buy ${track.price}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lyrics/Description */}
          {track.lyrics && (
            <div className="bg-gray-800/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lyrics</h2>
              <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                {track.lyrics}
              </pre>
            </div>
          )}

          {/* Credits */}
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Credits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Artist</span>
                <p className="text-white font-medium">{track.artist.name}</p>
              </div>
              {track.album && (
                <div>
                  <span className="text-gray-400">Album</span>
                  <p className="text-white font-medium">{track.album.title}</p>
                </div>
              )}
              {track.track_number && (
                <div>
                  <span className="text-gray-400">Track Number</span>
                  <p className="text-white font-medium">#{track.track_number}</p>
                </div>
              )}
              {track.isrc && (
                <div>
                  <span className="text-gray-400">ISRC</span>
                  <p className="text-white font-medium font-mono">{track.isrc}</p>
                </div>
              )}
              {track.release_date && (
                <div>
                  <span className="text-gray-400">Release Date</span>
                  <p className="text-white font-medium">{formatDate(track.release_date)}</p>
                </div>
              )}
              {track.duration && (
                <div>
                  <span className="text-gray-400">Duration</span>
                  <p className="text-white font-medium">{formatDuration(track.duration)}</p>
                </div>
              )}
            </div>
          </div>

          {/* More from this artist/album */}
          {track.album && (
            <div className="mt-8">
              <Link
                href={`/albums/${track.album.id}`}
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                View Full Album
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <MusicPlayer />
      
      {track.price && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          item={{
            type: 'track',
            id: track.id,
            title: track.title,
            artist: track.artist.name,
            price: track.price,
            cover_url: track.album?.cover_url,
          }}
        />
      )}
    </>
  );
}

