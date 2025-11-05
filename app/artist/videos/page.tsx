'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { FiPlus, FiEye, FiHeart, FiEdit, FiTrash2, FiGlobe, FiLock, FiEye as FiEyePreview, FiUpload } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function ArtistVideosPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['artist-videos'],
    queryFn: () => api.getVideos({}) // Will get current artist's videos
  });

  const videos = data?.videos || [];

  const deleteVideo = useMutation({
    mutationFn: (id: number) => api.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-videos'] });
      toast.success('Video deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete video');
    }
  });

  const publishVideo = useMutation({
    mutationFn: (id: number) => api.publishVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-videos'] });
      toast.success('Video published successfully');
    },
    onError: () => {
      toast.error('Failed to publish video');
    }
  });

  const getAccessIcon = (accessTier: string) => {
    switch (accessTier) {
      case 'free':
        return <FiGlobe className="text-green-500" />;
      case 'preview_only':
        return <FiEyePreview className="text-yellow-500" />;
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
            <h1 className="text-4xl font-bold text-white mb-2">My Videos</h1>
            <p className="text-gray-400">Manage your video content</p>
          </div>
          
          <Link
            href="/artist/videos/upload"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <FiPlus /> Upload Video
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading videos...</p>
          </div>
        )}

        {/* Videos List */}
        <div className="space-y-4">
          {videos.map((video: any) => (
            <div
              key={video.id}
              className="bg-gray-800/50 backdrop-blur rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-48 h-27 flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                      <FiUpload className="text-gray-500" size={32} />
                    </div>
                  )}
                  
                  {/* Access badge */}
                  <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded">
                    {getAccessIcon(video.access_tier)}
                  </div>
                  
                  {/* Duration */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{video.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
                    </div>
                    
                    {/* Status */}
                    {video.published ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        Published
                      </span>
                    ) : (
                      <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <FiEye />
                      {video.views_count.toLocaleString()} views
                    </div>
                    <div className="flex items-center gap-1">
                      <FiHeart />
                      {video.likes_count.toLocaleString()} likes
                    </div>
                    {(video.access_tier === 'paid' || video.access_tier === 'preview_only') && (
                      <div className="text-purple-400 font-semibold">
                        {video.price} SOL
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/videos/${video.id}`}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      View
                    </Link>
                    
                    <Link
                      href={`/artist/videos/${video.id}/edit`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    >
                      <FiEdit size={14} /> Edit
                    </Link>
                    
                    {!video.published && (
                      <button
                        onClick={() => publishVideo.mutate(video.id)}
                        disabled={publishVideo.isPending}
                        className="text-green-400 hover:text-green-300 text-sm font-medium disabled:opacity-50"
                      >
                        Publish
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this video?')) {
                          deleteVideo.mutate(video.id);
                        }
                      }}
                      disabled={deleteVideo.isPending}
                      className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-20">
            <FiUpload size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
            <p className="text-gray-400 mb-6">Upload your first video to get started</p>
            <Link
              href="/artist/videos/upload"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FiPlus /> Upload Video
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

