'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer } from '@/components/MusicPlayer';
import { FiCheckCircle, FiMusic, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { formatNumber, formatCurrency } from '@/lib/utils';

export default function ArtistPage() {
  const params = useParams();
  const artistId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => api.getArtist(parseInt(artistId)),
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading artist...</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500">Artist not found</div>
        </div>
      </>
    );
  }

  const { artist, stats } = data;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-32">
        {/* Artist Header */}
        <div className="relative">
          {/* Banner */}
          {artist.banner_url ? (
            <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-800">
              <img 
                src={artist.banner_url} 
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-r from-purple-900 to-pink-900" />
          )}

          {/* Artist Info */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-black bg-gray-800 flex-shrink-0">
                {artist.avatar_url ? (
                  <img 
                    src={artist.avatar_url} 
                    alt={artist.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl font-bold text-white">
                    {artist.name[0]}
                  </div>
                )}
              </div>

              {/* Name and Stats */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                    {artist.name}
                  </h1>
                  {artist.verified && (
                    <FiCheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 mt-3 justify-center sm:justify-start text-sm text-gray-400">
                  <span>{formatNumber(stats.total_streams || 0)} streams</span>
                  <span>•</span>
                  <span>{formatNumber(stats.total_listeners || 0)} listeners</span>
                  {stats.token_holders > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatNumber(stats.token_holders)} token holders</span>
                    </>
                  )}
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p className="mt-4 text-gray-300 max-w-2xl">
                    {artist.bio}
                  </p>
                )}

                {/* Social Links */}
                <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
                  {artist.twitter_handle && (
                    <a 
                      href={`https://twitter.com/${artist.twitter_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Twitter
                    </a>
                  )}
                  {artist.instagram_handle && (
                    <a 
                      href={`https://instagram.com/${artist.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center sm:justify-start">
              {artist.has_token && (
                <Link
                  href={`/tokens/${artist.token_address}`}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <FiDollarSign className="w-5 h-5" />
                  Trade Token
                </Link>
              )}
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors border border-gray-700">
                Follow
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="border-b border-gray-800">
            <nav className="flex gap-6 overflow-x-auto">
              <button className="pb-4 px-2 border-b-2 border-purple-500 text-white font-medium whitespace-nowrap">
                <FiMusic className="inline w-4 h-4 mr-2" />
                Music
              </button>
              <button className="pb-4 px-2 border-b-2 border-transparent text-gray-400 hover:text-white font-medium whitespace-nowrap">
                <FiCalendar className="inline w-4 h-4 mr-2" />
                Events
              </button>
              <button className="pb-4 px-2 border-b-2 border-transparent text-gray-400 hover:text-white font-medium whitespace-nowrap">
                About
              </button>
            </nav>
          </div>

          {/* Music Section (Albums) */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Discography</h2>
            
            {/* Placeholder for albums */}
            <div className="text-gray-400 text-center py-12">
              Albums will be displayed here
            </div>
          </div>
        </div>
      </main>
      
      <MusicPlayer />
    </>
  );
}

