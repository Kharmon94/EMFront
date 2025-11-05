'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FiGlobe, FiEye, FiLock, FiCheck, FiMusic } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Navigation } from '@/components/Navigation';

interface Track {
  id: number;
  title: string;
  duration: number;
  track_number: number;
  access_tier: 'free' | 'preview_only' | 'nft_required';
  free_quality: 'standard' | 'high';
  explicit: boolean;
  price?: number;
}

interface Album {
  id: number;
  title: string;
  cover_url?: string;
  artist: {
    name: string;
  };
  tracks: Track[];
}

export default function TrackAccessManagerPage() {
  const params = useParams();
  const albumId = parseInt(params.id as string);
  const [saving, setSaving] = useState(false);

  const { data: album, isLoading, refetch } = useQuery<Album>({
    queryKey: ['album', albumId],
    queryFn: () => api.getAlbum(albumId),
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </>
    );
  }

  if (!album) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500">Album not found</div>
        </div>
      </>
    );
  }

  const tracks = album.tracks || [];

  // Update single track access
  const updateTrackAccess = async (trackId: number, accessTier: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/tracks/${trackId}/update_access`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ 
          track: { access_tier: accessTier }
        })
      });

      if (!response.ok) throw new Error('Update failed');
      
      await refetch();
      toast.success('Track access updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update track access');
    }
  };

  // Bulk update multiple tracks
  const bulkUpdateTracks = async (trackIds: number[], accessTier: string) => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/albums/${albumId}/bulk_update_track_access`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ 
          track_ids: trackIds,
          access_tier: accessTier 
        })
      });

      if (!response.ok) throw new Error('Bulk update failed');
      
      await refetch();
      toast.success(`${trackIds.length} track(s) updated`);
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to bulk update');
    }
    setSaving(false);
  };

  // Quick action helpers
  const setAllTracks = (accessTier: string) => {
    bulkUpdateTracks(tracks.map(t => t.id), accessTier);
  };

  const setFirstNTracks = (n: number, accessTier: string) => {
    const trackIds = tracks.slice(0, n).map(t => t.id);
    bulkUpdateTracks(trackIds, accessTier);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const freeCount = tracks.filter(t => t.access_tier === 'free').length;
  const previewCount = tracks.filter(t => t.access_tier === 'preview_only').length;
  const gatedCount = tracks.filter(t => t.access_tier === 'nft_required').length;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {album.cover_url && (
                <img 
                  src={album.cover_url} 
                  alt={album.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Track Access Control
                </h1>
                <p className="text-xl text-gray-400">
                  {album.title} <span className="text-gray-600">by</span> {album.artist.name}
                </p>
              </div>
            </div>
            <p className="text-gray-400">
              Choose which tracks are free, preview-only, or exclusive to NFT holders
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <FiMusic className="w-4 h-4" />
              Quick Actions:
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAllTracks('free')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={saving}
              >
                Make All Free
              </button>
              <button
                onClick={() => setFirstNTracks(3, 'free')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={saving}
              >
                Free First 3
              </button>
              <button
                onClick={() => setAllTracks('preview_only')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={saving}
              >
                All Previews
              </button>
              <button
                onClick={() => setAllTracks('nft_required')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={saving}
              >
                Gate All Tracks
              </button>
              <button
                onClick={() => {
                  const half = Math.floor(tracks.length / 2);
                  setFirstNTracks(half, 'free');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={saving}
              >
                Half Free / Half Gated
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
              <div className="text-3xl font-bold text-white mb-1">
                {freeCount}
              </div>
              <div className="text-sm text-green-300 flex items-center gap-1">
                <FiGlobe className="w-4 h-4" />
                Free Tracks
              </div>
            </div>
            <div className="p-4 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
              <div className="text-3xl font-bold text-white mb-1">
                {previewCount}
              </div>
              <div className="text-sm text-yellow-300 flex items-center gap-1">
                <FiEye className="w-4 h-4" />
                Preview Only
              </div>
            </div>
            <div className="p-4 bg-purple-600/20 border border-purple-600/50 rounded-lg">
              <div className="text-3xl font-bold text-white mb-1">
                {gatedCount}
              </div>
              <div className="text-sm text-purple-300 flex items-center gap-1">
                <FiLock className="w-4 h-4" />
                NFT Exclusive
              </div>
            </div>
          </div>

          {/* Individual Track Controls */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">
              Individual Track Settings
            </h3>
            
            {tracks.map((track) => (
              <div
                key={track.id}
                className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-white mb-1">
                      {track.track_number}. {track.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDuration(track.duration)}
                      {track.explicit && <span className="ml-2 text-red-400">🅴 Explicit</span>}
                    </div>
                  </div>
                  
                  {/* Current Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    track.access_tier === 'free' 
                      ? 'bg-green-600/20 text-green-400 border border-green-600'
                      : track.access_tier === 'preview_only'
                      ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600'
                      : 'bg-purple-600/20 text-purple-400 border border-purple-600'
                  }`}>
                    {track.access_tier === 'free' && <><FiGlobe className="w-3 h-3" /> Free</>}
                    {track.access_tier === 'preview_only' && <><FiEye className="w-3 h-3" /> Preview</>}
                    {track.access_tier === 'nft_required' && <><FiLock className="w-3 h-3" /> NFT Only</>}
                  </div>
                </div>

                {/* Access Tier Toggle Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => updateTrackAccess(track.id, 'free')}
                    disabled={saving}
                    className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                      track.access_tier === 'free'
                        ? 'border-green-600 bg-green-600/20'
                        : 'border-gray-700 bg-gray-800 hover:border-green-600/50 hover:bg-gray-700'
                    }`}
                  >
                    <FiGlobe className={`w-5 h-5 mx-auto mb-1 ${
                      track.access_tier === 'free' ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    <div className={`text-xs font-medium ${
                      track.access_tier === 'free' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      Free
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Full streaming
                    </div>
                  </button>

                  <button
                    onClick={() => updateTrackAccess(track.id, 'preview_only')}
                    disabled={saving}
                    className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                      track.access_tier === 'preview_only'
                        ? 'border-yellow-600 bg-yellow-600/20'
                        : 'border-gray-700 bg-gray-800 hover:border-yellow-600/50 hover:bg-gray-700'
                    }`}
                  >
                    <FiEye className={`w-5 h-5 mx-auto mb-1 ${
                      track.access_tier === 'preview_only' ? 'text-yellow-400' : 'text-gray-400'
                    }`} />
                    <div className={`text-xs font-medium ${
                      track.access_tier === 'preview_only' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      Preview
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      30 seconds
                    </div>
                  </button>

                  <button
                    onClick={() => updateTrackAccess(track.id, 'nft_required')}
                    disabled={saving}
                    className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                      track.access_tier === 'nft_required'
                        ? 'border-purple-600 bg-purple-600/20'
                        : 'border-gray-700 bg-gray-800 hover:border-purple-600/50 hover:bg-gray-700'
                    }`}
                  >
                    <FiLock className={`w-5 h-5 mx-auto mb-1 ${
                      track.access_tier === 'nft_required' ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                    <div className={`text-xs font-medium ${
                      track.access_tier === 'nft_required' ? 'text-purple-400' : 'text-gray-400'
                    }`}>
                      NFT Only
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Exclusive
                    </div>
                  </button>
                </div>

                {/* User Experience Preview */}
                <div className="p-3 bg-gray-800 rounded text-xs">
                  <div className="font-medium text-gray-400 mb-1">What fans see:</div>
                  <div className="text-gray-500">
                    {track.access_tier === 'free' && (
                      <>🌍 Free users: Full streaming • 💎 NFT holders: Lossless + downloads</>
                    )}
                    {track.access_tier === 'preview_only' && (
                      <>🌍 Free users: 30s preview • 💎 NFT holders: Full lossless + downloads</>
                    )}
                    {track.access_tier === 'nft_required' && (
                      <>🌍 Free users: No access • 💎 NFT holders: Full lossless + downloads</>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
            <div className="flex items-start gap-2 text-blue-300">
              <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Changes are saved automatically</p>
                <p className="text-blue-400/80">
                  You can update track access anytime. NFT holders always get premium access regardless of settings.
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-white font-semibold mb-3">💡 Strategy Tips</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong className="text-green-400">Free tracks:</strong> Best for lead singles and promotion - drives NFT discovery</p>
              <p><strong className="text-yellow-400">Preview tracks:</strong> Create FOMO - fans hear a taste and want more</p>
              <p><strong className="text-purple-400">NFT exclusive:</strong> Maximum value for NFT holders - bonus tracks, deluxe content</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

