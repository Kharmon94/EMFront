'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUsers } from 'react-icons/fi';

interface LivestreamChatProps {
  livestreamId: number;
  isLive: boolean;
}

interface Message {
  id: number;
  user: {
    username: string;
    wallet_address: string;
    badges?: string[];
  };
  content: string;
  sent_at: string;
  tip_amount?: number;
}

export default function LivestreamChat({ livestreamId, isLive }: LivestreamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TODO: ActionCable connection
  useEffect(() => {
    // Placeholder for ActionCable subscription
    // const cable = createConsumer(WS_URL);
    // const subscription = cable.subscriptions.create(
    //   { channel: 'LivestreamChannel', livestream_id: livestreamId },
    //   {
    //     received: (data) => {
    //       if (data.type === 'message') {
    //         setMessages(prev => [...prev, data.message]);
    //       } else if (data.type === 'viewer_count_update') {
    //         setViewerCount(data.viewer_count);
    //       }
    //     },
    //     connected: () => setConnected(true),
    //     disconnected: () => setConnected(false)
    //   }
    // );
    // 
    // return () => subscription.unsubscribe();
    
    setConnected(true); // Temporary
  }, [livestreamId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // TODO: Send message via ActionCable
    // subscription.send({ content: newMessage });
    
    // Temporary: Add message locally
    const tempMessage: Message = {
      id: Date.now(),
      user: {
        username: 'You',
        wallet_address: 'your_wallet'
      },
      content: newMessage,
      sent_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          Live Chat
          {connected && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <FiUsers className="w-4 h-4" />
          <span>{viewerCount}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">
                {isLive ? 'Be the first to chat!' : 'Chat will appear when stream goes live'}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isLive && (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Send a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const getBadges = (user: any) => {
    const badges = [];
    if (user.badges?.includes('fanpass')) badges.push('🎫');
    if (user.badges?.includes('token')) badges.push('🪙');
    if (user.badges?.includes('vip')) badges.push('👑');
    return badges;
  };

  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {message.user.username.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-white text-sm">{message.user.username}</span>
          {getBadges(message.user).map((badge, i) => (
            <span key={i} className="text-xs">{badge}</span>
          ))}
          <span className="text-xs text-gray-600">
            {new Date(message.sent_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-gray-300 break-words">{message.content}</p>
        {message.tip_amount && (
          <div className="mt-1 inline-block px-2 py-1 bg-yellow-600/20 border border-yellow-600 rounded text-xs text-yellow-400 font-bold">
            Tipped {message.tip_amount} SOL
          </div>
        )}
      </div>
    </div>
  );
}

