'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { FiPlus, FiEye, FiHeart, FiShare2, FiEdit, FiTrash2, FiTrendingUp, FiUpload } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function ArtistMinisPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['artist-minis'],
    queryFn: () => api.getMinis({}) // Will get current artist's minis
  });

  const minis = data?.minis || [];

  const deleteMini = useMutation({
    mutationFn: (id: number) => api.deleteMini(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-minis'] });
      toast.success('Mini deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete Mini');
    }
  });

  const publishMini = useMutation({
    mutationFn: (id: number) => api.publishMini(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-minis'] });
      toast.success('Mini published successfully');
    },
    onError: () => {
      toast.error('Failed to publish Mini');
    }
  });

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  // Calculate total stats
  const totalViews = minis.reduce((sum: number, m: any) => sum + (m.views_count || 0), 0);
  const totalLikes = minis.reduce((sum: number, m: any) => sum + (m.likes_count || 0), 0);
  const totalShares = minis.reduce((sum: number, m: any) => sum + (m.shares_count || 0), 0);
  const publishedCount = minis.filter((m: any) => m.published).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Mini's</h1>
            <p className="text-gray-400">Manage your short-form content</p>
          </div>
          
          <Link
            href="/artist/videos/upload"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <FiPlus /> Create Mini
          </Link>
        </div>

        {/* Stats Overview */}
        {minis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiUpload size={20} />
                <span className="text-sm">Total Mini's</span>
              </div>
              <p className="text-3xl font-bold text-white">{minis.length}</p>
              <p className="text-sm text-gray-500 mt-1">{publishedCount} published</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiEye size={20} />
                <span className="text-sm">Total Views</span>
              </div>
              <p className="text-3xl font-bold text-white">{formatCount(totalViews)}</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiHeart size={20} />
                <span className="text-sm">Total Likes</span>
              </div>
              <p className="text-3xl font-bold text-white">{formatCount(totalLikes)}</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <FiShare2 size={20} />
                <span className="text-sm">Total Shares</span>
              </div>
              <p className="text-3xl font-bold text-white">{formatCount(totalShares)}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading Mini's...</p>
          </div>
        )}

        {/* Minis Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {minis.map((mini: any) => (
            <div
              key={mini.id}
              className="bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[9/16] bg-gray-700">
                {mini.thumbnail_url ? (
                  <img
                    src={mini.thumbnail_url}
                    alt={mini.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                    <FiUpload className="text-white/50" size={32} />
                  </div>
                )}
                
                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  {mini.published ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Live
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                      Draft
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-semibold">
                  {formatDuration(mini.duration)}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{mini.title}</h3>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-3">
                  <div className="flex flex-col items-center">
                    <FiEye />
                    <span className="mt-0.5">{formatCount(mini.views_count)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FiHeart />
                    <span className="mt-0.5">{formatCount(mini.likes_count)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FiShare2 />
                    <span className="mt-0.5">{formatCount(mini.shares_count)}</span>
                  </div>
                </div>

                {/* Engagement rate */}
                {mini.engagement_rate > 0 && (
                  <div className="flex items-center gap-1 text-xs text-purple-400 mb-3">
                    <FiTrendingUp size={12} />
                    <span>{mini.engagement_rate}% engagement</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/minis/${mini.id}`}
                    className="flex-1 text-center text-xs text-purple-400 hover:text-purple-300 py-1 px-2 rounded bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                  >
                    View
                  </Link>
                  
                  {!mini.published && (
                    <button
                      onClick={() => publishMini.mutate(mini.id)}
                      disabled={publishMini.isPending}
                      className="text-xs text-green-400 hover:text-green-300 py-1 px-2 rounded bg-green-500/10 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      if (confirm('Delete this Mini?')) {
                        deleteMini.mutate(mini.id);
                      }
                    }}
                    disabled={deleteMini.isPending}
                    className="text-xs text-red-400 hover:text-red-300 py-1 px-2 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!isLoading && minis.length === 0 && (
          <div className="text-center py-20">
            <FiUpload size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Mini's yet</h3>
            <p className="text-gray-400 mb-6">Create your first Mini to start engaging with fans</p>
            <Link
              href="/artist/videos/upload"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FiPlus /> Create Mini
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

