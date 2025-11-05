'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FiPlay, FiEye, FiHeart, FiClock, FiGlobe, FiLock } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import api from '@/lib/api';

export default function VideosPage() {
  const [sort, setSort] = useState('recent');
  
  const { data, isLoading } = useQuery({
    queryKey: ['videos', sort],
    queryFn: () => api.getVideos({ sort })
  });

  const videos = data?.videos || [];

  const getAccessIcon = (accessTier: string) => {
    switch (accessTier) {
      case 'free':
        return <FiGlobe className="text-green-500" />;
      case 'preview_only':
        return <FiEye className="text-yellow-500" />;
      case 'nft_required':
      case 'paid':
        return <FiLock className="text-purple-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Videos</h1>
            <p className="text-gray-400">Discover music videos from your favorite artists</p>
          </div>
          
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading videos...</p>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video: any) => (
            <Link
              key={video.id}
              href={`/videos/${video.id}`}
              className="group bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-700">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiPlay size={48} className="text-gray-500" />
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-purple-500 rounded-full p-4">
                    <FiPlay size={32} className="text-white" />
                  </div>
                </div>
                
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                  <FiClock size={12} />
                  {formatDuration(video.duration)}
                </div>
                
                {/* Access tier badge */}
                <div className="absolute top-2 right-2 bg-black/80 p-2 rounded">
                  {getAccessIcon(video.access_tier)}
                </div>
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {video.title}
                </h3>
                
                {/* Artist */}
                <div className="flex items-center gap-2 mb-3">
                  {video.artist.avatar_url && (
                    <img
                      src={video.artist.avatar_url}
                      alt={video.artist.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-400">{video.artist.name}</span>
                  {video.artist.verified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <FiEye size={14} />
                    {video.views_count.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <FiHeart size={14} />
                    {video.likes_count.toLocaleString()}
                  </div>
                </div>
                
                {/* Price (if paid) */}
                {(video.access_tier === 'paid' || video.access_tier === 'preview_only') && video.price > 0 && (
                  <div className="mt-2 text-purple-400 font-semibold">
                    {video.price} SOL
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-20">
            <FiPlay size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
            <p className="text-gray-400">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </div>
  );
}

