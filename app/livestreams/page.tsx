'use client';

import { useQuery } from '@tanstack/react-query';
import { FiVideo, FiUsers, FiClock } from 'react-icons/fi';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

export default function LivestreamsPage() {
  const { data: liveData } = useQuery({
    queryKey: ['livestreams', 'live'],
    queryFn: () => api.getLivestreams({ active: true }),
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const { data: upcomingData } = useQuery({
    queryKey: ['livestreams', 'upcoming'],
    queryFn: () => api.getLivestreams({ upcoming: true }),
  });

  const liveStreams = liveData?.livestreams || [];
  const upcomingStreams = upcomingData?.livestreams || [];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-14 md:pt-20 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Live Streams */}
          {liveStreams.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                Live Now ({liveStreams.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStreams.map((stream: any) => (
                  <LivestreamCard key={stream.id} stream={stream} isLive={true} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Streams */}
          {upcomingStreams.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FiClock className="w-6 h-6" />
                Upcoming Streams ({upcomingStreams.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingStreams.map((stream: any) => (
                  <LivestreamCard key={stream.id} stream={stream} isLive={false} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {liveStreams.length === 0 && upcomingStreams.length === 0 && (
            <div className="text-center py-20">
              <FiVideo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No livestreams available</h3>
              <p className="text-gray-400">Check back later for live performances!</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function LivestreamCard({ stream, isLive }: { stream: any; isLive: boolean }) {
  return (
    <Link href={`/livestreams/${stream.id}`}>
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-600 transition-all group">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-pink-900">
          {stream.artist?.avatar_url ? (
            <img
              src={stream.artist.avatar_url}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiVideo className="w-20 h-20 text-white/30" />
            </div>
          )}
          
          {isLive && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              LIVE
            </div>
          )}

          {!isLive && stream.start_time && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-2">
              <FiClock className="w-3 h-3" />
              Scheduled
            </div>
          )}

          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded flex items-center gap-1">
            <FiUsers className="w-3 h-3" />
            {stream.viewer_count || 0}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
            {stream.title}
          </h3>

          {/* Artist */}
          <div className="flex items-center gap-2 mb-3">
            {stream.artist?.avatar_url && (
              <img
                src={stream.artist.avatar_url}
                alt={stream.artist.name}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-gray-400">{stream.artist?.name}</span>
          </div>

          {/* Description */}
          {stream.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {stream.description}
            </p>
          )}

          {/* Time */}
          {stream.start_time && !isLive && (
            <div className="text-xs text-gray-400">
              {new Date(stream.start_time).toLocaleString()}
            </div>
          )}

          {isLive && stream.started_at && (
            <div className="text-xs text-red-400">
              Started {new Date(stream.started_at).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
