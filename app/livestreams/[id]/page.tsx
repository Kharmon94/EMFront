'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiClock } from 'react-icons/fi';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import LivestreamPlayer from '@/components/LivestreamPlayer';

export default function LivestreamViewPage() {
  const params = useParams();
  const livestreamId = parseInt(params.id as string);

  const { data, refetch } = useQuery({
    queryKey: ['livestream', livestreamId],
    queryFn: () => api.getLivestream(livestreamId),
    refetchInterval: 10000, // Poll every 10 seconds for status updates
  });

  const livestream = data?.livestream;
  const isLive = livestream?.status === 'live';
  const hlsUrl = livestream?.hls_url;

  if (!livestream) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Video Player */}
          <div className="mb-6">
            {isLive && hlsUrl ? (
              <LivestreamPlayer
                hlsUrl={hlsUrl}
                isLive={isLive}
                poster={livestream.artist.avatar_url}
              />
            ) : (
              <div className="bg-gray-900 rounded-lg border border-gray-800 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiClock className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {livestream.status === 'ended' ? 'Stream Ended' : 'Stream Not Started'}
                  </h3>
                  <p className="text-gray-400">
                    {livestream.status === 'scheduled' 
                      ? 'The artist hasn\'t started streaming yet. Check back soon!'
                      : 'This livestream has ended.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stream Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">{livestream.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{livestream.viewer_count || 0} watching</span>
                      </div>
                      {livestream.started_at && (
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>Started {new Date(livestream.started_at).toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isLive && (
                    <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      LIVE
                    </div>
                  )}
                </div>

                <p className="text-gray-300">{livestream.description}</p>
              </section>

              {/* TODO: Chat component will go here */}
              <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Live Chat</h3>
                <div className="text-gray-500 text-center py-8">
                  Chat feature coming soon...
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Artist Info */}
              <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">ABOUT THE ARTIST</h3>
                <div className="flex items-center gap-3 mb-4">
                  {livestream.artist.avatar_url && (
                    <img
                      src={livestream.artist.avatar_url}
                      alt={livestream.artist.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-white">{livestream.artist.name}</h4>
                    {livestream.artist.verified && (
                      <span className="text-xs text-blue-500">✓ Verified</span>
                    )}
                  </div>
                </div>
                <a
                  href={`/artists/${livestream.artist.id}`}
                  className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-lg transition-colors"
                >
                  Visit Profile
                </a>
              </section>

              {/* Stream Stats */}
              <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">STREAM STATS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${
                      isLive ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {livestream.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Viewers:</span>
                    <span className="text-white font-semibold">{livestream.viewer_count || 0}</span>
                  </div>
                  {livestream.duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white font-semibold">{livestream.duration} min</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Messages:</span>
                    <span className="text-white font-semibold">{livestream.messages_count || 0}</span>
                  </div>
                </div>
              </section>

              {/* Token Gate Notice */}
              {livestream.is_token_gated && (
                <section className="p-4 bg-yellow-600/20 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    🔒 This stream requires {livestream.token_gate_amount} artist tokens to access
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
