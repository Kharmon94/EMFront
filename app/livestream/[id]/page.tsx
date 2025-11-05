'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { FiSend, FiDollarSign, FiUsers, FiRadio, FiCheckCircle } from 'react-icons/fi';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

export default function LivestreamPage() {
  const params = useParams();
  const livestreamId = params.id as string;
  const { publicKey } = useWallet();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['livestream', livestreamId],
    queryFn: () => api.getLivestream(parseInt(livestreamId)),
  });

  const livestream = data?.livestream;

  // Connect to WebSocket for chat
  useEffect(() => {
    if (!livestream || livestream.status !== 'live') return;

    const ws = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000', {
      transports: ['websocket'],
    });

    ws.emit('subscribe', {
      channel: 'LivestreamChannel',
      livestream_id: livestreamId,
    });

    ws.on('chat_message', (data: any) => {
      setMessages((prev) => [...prev, data.message]);
    });

    ws.on('tip', (data: any) => {
      setMessages((prev) => [...prev, {
        id: data.message.id,
        type: 'tip',
        ...data.message,
      }]);
      toast.success(`${data.message.user.wallet_address.slice(0, 8)} tipped ${data.message.amount}!`);
    });

    ws.on('viewer_count', (data: any) => {
      // Update viewer count
      refetch();
    });

    setSocket(ws);

    return () => {
      ws.disconnect();
    };
  }, [livestream, livestreamId, refetch]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('speak', { message: newMessage });
    setNewMessage('');
  };

  const sendTip = async () => {
    if (!publicKey || !tipAmount || parseFloat(tipAmount) <= 0) {
      toast.error('Invalid tip amount');
      return;
    }

    try {
      toast.loading('Processing tip...');

      // TODO: Execute Solana transfer transaction
      const signature = 'placeholder_signature';

      await api.tipLivestream(parseInt(livestreamId), {
        amount: parseFloat(tipAmount),
        mint: 'SOL',
        signature,
      });

      toast.dismiss();
      toast.success('Tip sent!');
      setTipAmount('');
      setShowTipModal(false);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to send tip');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading livestream...</div>
        </div>
      </>
    );
  }

  if (!livestream) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500">Livestream not found</div>
        </div>
      </>
    );
  }

  // Check token-gated access
  if (livestream.is_token_gated && !data.access_granted) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiRadio className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Token-Gated Stream
            </h2>
            <p className="text-gray-300 mb-6">
              This livestream requires holding {formatNumber(livestream.token_gate_amount || 0)} {livestream.artist.name} tokens.
            </p>
            <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
              Get Tokens
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-4">
              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                {livestream.status === 'live' ? (
                  <>
                    {/* Placeholder for video player */}
                    {/* In production, integrate Mux, LiveKit, or Agora */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                      <div className="text-center">
                        <FiRadio className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
                        <p className="text-white text-xl font-semibold">LIVE STREAM</p>
                        <p className="text-gray-300 text-sm mt-2">
                          WebRTC player integration pending
                        </p>
                      </div>
                    </div>

                    {/* Live Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white font-bold rounded-full animate-pulse">
                      🔴 LIVE
                    </div>

                    {/* Viewer Count */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white rounded-full flex items-center gap-2">
                      <FiUsers className="w-4 h-4" />
                      {formatNumber(livestream.viewer_count || 0)}
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <p>Stream {livestream.status}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stream Info */}
              <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Artist Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0">
                    {livestream.artist.avatar_url ? (
                      <img
                        src={livestream.artist.avatar_url}
                        alt={livestream.artist.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold">
                        {livestream.artist.name[0]}
                      </div>
                    )}
                  </div>

                  {/* Stream Details */}
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {livestream.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-medium">{livestream.artist.name}</span>
                      {livestream.artist.verified && (
                        <FiCheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    {livestream.description && (
                      <p className="mt-2 text-gray-300">
                        {livestream.description}
                      </p>
                    )}
                  </div>

                  {/* Tip Button */}
                  <button
                    onClick={() => setShowTipModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiDollarSign className="w-5 h-5" />
                    <span className="hidden sm:inline">Tip</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="lg:h-[calc(100vh-8rem)] flex flex-col">
              <div className="bg-gray-900 rounded-xl flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiUsers className="w-5 h-5" />
                    Live Chat
                  </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.tip_amount
                            ? 'bg-yellow-600/20 border border-yellow-600/50'
                            : 'bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-400 mb-1">
                              {msg.user.wallet_address.slice(0, 8)}...
                            </div>
                            {msg.tip_amount ? (
                              <div className="text-yellow-500 font-semibold">
                                💰 Tipped {msg.tip_amount} {msg.tip_mint}
                              </div>
                            ) : (
                              <div className="text-white break-words">
                                {msg.content}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            {formatRelativeTime(msg.sent_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No messages yet. Be the first to chat!
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-800">
                  {publicKey ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Send a message..."
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors"
                      >
                        <FiSend className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-2">
                      Connect wallet to chat
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Modal */}
        {showTipModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                Send Tip
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTipModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendTip}
                  disabled={!tipAmount || parseFloat(tipAmount) <= 0}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  Send Tip
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

