'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiSend, FiUser, FiSearch, FiMessageCircle, FiX, FiArchive, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/conversations').then(res => res.data),
    refetchInterval: 5000 // Poll for new messages
  });

  const { data: conversationDetail } = useQuery({
    queryKey: ['conversation', selectedConversation?.id],
    queryFn: () => api.get(`/conversations/${selectedConversation.id}`).then(res => res.data),
    enabled: !!selectedConversation,
    refetchInterval: 3000
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/conversations/${selectedConversation.id}/messages`, { message: { content } }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (conversationId: number) =>
      api.post(`/conversations/${conversationId}/mark_read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  useEffect(() => {
    if (selectedConversation && conversationDetail) {
      markReadMutation.mutate(selectedConversation.id);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationDetail?.conversation?.messages?.length]);

  const conversations = conversationsData?.conversations || [];
  const filteredConversations = conversations.filter((conv: any) =>
    conv.other_user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[calc(100vh-200px)] flex gap-4 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden">
            {/* Conversations List */}
            <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-gray-300 dark:border-gray-800 flex flex-col`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-300 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Messages</h2>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-3 p-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv: any) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 flex gap-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-gray-100 dark:bg-gray-800/50' : ''
                      } ${conv.unread_count > 0 ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.other_user?.name?.[0]?.toUpperCase() || <FiUser />}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {conv.other_user?.name || 'Unknown User'}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conv.last_message?.content || 'No messages yet'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {conv.last_message?.created_at && new Date(conv.last_message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <FiMessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className={`${selectedConversation ? 'block' : 'hidden md:flex'} flex-1 flex flex-col`}>
              {selectedConversation ? (
                <>
                  {/* Thread Header */}
                  <div className="p-4 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-2 text-gray-600 dark:text-gray-400"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {conversationDetail?.conversation?.other_user?.name?.[0]?.toUpperCase() || <FiUser />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {conversationDetail?.conversation?.other_user?.name || 'Unknown User'}
                        </p>
                        {conversationDetail?.conversation?.subject && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {conversationDetail.conversation.subject}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationDetail?.conversation?.messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg ${
                            msg.from_me
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.from_me ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300 dark:border-gray-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiSend className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <FiMessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}

