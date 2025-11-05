'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FiCopy, FiPlay, FiSquare, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import toast from 'react-hot-toast';

export default function ArtistLivestreamManagementPage() {
  const params = useParams();
  const livestreamId = parseInt(params.id as string);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['livestream', livestreamId],
    queryFn: () => api.getLivestream(livestreamId),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const livestream = data?.livestream;
  const credentials = livestream?.rtmp_credentials;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      await api.startLivestream(livestreamId);
      toast.success('Livestream started! Begin streaming in OBS.');
      refetch();
    } catch (error: any) {
      console.error('Start error:', error);
      toast.error(error.response?.data?.error || 'Failed to start livestream');
    }
    setStarting(false);
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      await api.stopLivestream(livestreamId);
      toast.success('Livestream ended');
      refetch();
    } catch (error: any) {
      console.error('Stop error:', error);
      toast.error(error.response?.data?.error || 'Failed to stop livestream');
    }
    setStopping(false);
  };

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

  const isLive = livestream.status === 'live';
  const isEnded = livestream.status === 'ended';
  const canStart = livestream.status === 'scheduled';

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{livestream.title}</h1>
              <div className={`px-4 py-2 rounded-full font-semibold ${
                isLive ? 'bg-red-600 text-white animate-pulse' :
                isEnded ? 'bg-gray-700 text-gray-400' :
                'bg-blue-600 text-white'
              }`}>
                {livestream.status.toUpperCase()}
              </div>
            </div>
            <p className="text-gray-400">{livestream.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiUsers className="w-4 h-4" />
                <span className="text-sm">Viewers</span>
              </div>
              <div className="text-2xl font-bold text-white">{livestream.viewer_count || 0}</div>
            </div>

            {livestream.duration && (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <FiClock className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <div className="text-2xl font-bold text-white">{livestream.duration} min</div>
              </div>
            )}

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <span className="text-sm">Messages</span>
              </div>
              <div className="text-2xl font-bold text-white">{livestream.messages_count || 0}</div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <span className="text-sm">Total Tips</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{livestream.total_tips || 0} SOL</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RTMP Credentials */}
            <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">🔑 RTMP Credentials</h2>
              
              {credentials ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      RTMP Server URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={credentials.rtmp_url}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(credentials.rtmp_url, 'RTMP URL')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                      >
                        <FiCopy />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stream Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        readOnly
                        value={credentials.stream_key}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(credentials.stream_key, 'Stream Key')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                      >
                        <FiCopy />
                      </button>
                    </div>
                    <p className="text-xs text-yellow-500 mt-2">⚠️ Keep this secret - it's your streaming password!</p>
                  </div>

                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">🎥 Full RTMP URL</h4>
                    <code className="text-xs text-purple-400 break-all">{credentials.full_url}</code>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Credentials not available</div>
              )}
            </section>

            {/* OBS Setup Guide */}
            <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">📖 OBS Setup Guide</h2>
              
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-white mb-1">Open OBS Studio</p>
                    <p className="text-gray-400">If you don't have it, download from obsproject.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-white mb-1">Go to Settings → Stream</p>
                    <p className="text-gray-400">Select "Custom" as service</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-white mb-1">Paste RTMP Credentials</p>
                    <p className="text-gray-400">Server = RTMP URL, Stream Key = Stream Key</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold text-white mb-1">Click "Start Streaming" in OBS</p>
                    <p className="text-gray-400">Your stream will go live automatically</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-600/20 border border-blue-600 rounded-lg mt-4">
                  <p className="text-blue-300 text-xs">
                    💡 <strong>Tip:</strong> Test your stream with a private link first to check quality and audio levels.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Stream Controls */}
          <section className="mt-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Stream Controls</h2>
            
            <div className="flex gap-4">
              {canStart && (
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {starting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-5 h-5" />
                      Start Livestream
                    </>
                  )}
                </button>
              )}

              {isLive && (
                <button
                  onClick={handleStop}
                  disabled={stopping}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {stopping ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Stopping...
                    </>
                  ) : (
                    <>
                      <FiSquare className="w-5 h-5" />
                      End Livestream
                    </>
                  )}
                </button>
              )}

              {isEnded && (
                <div className="flex-1 p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center gap-2 text-gray-400">
                  <FiCheckCircle className="w-5 h-5" />
                  <span>Stream Ended</span>
                </div>
              )}
            </div>

            {isLive && (
              <div className="mt-4 p-4 bg-red-600/20 border border-red-600 rounded-lg">
                <p className="text-red-300 text-sm">
                  🔴 <strong>You're LIVE!</strong> Start streaming in OBS now. Your fans can watch at the stream page.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

