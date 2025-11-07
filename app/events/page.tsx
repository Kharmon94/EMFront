'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { FriendsActivity } from '@/components/discovery/FriendsActivity';
import { RecommendationSection } from '@/components/discovery/RecommendationSection';
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle, FiHeart, FiTrendingUp, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { formatDateTime, formatCurrency } from '@/lib/utils';

type Tab = 'for-you' | 'upcoming' | 'following' | 'all';

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  // For You (Recommended)
  const { data: forYouData, isLoading: forYouLoading } = useQuery({
    queryKey: ['recommendations', 'events'],
    queryFn: () => api.get('/recommendations/events?limit=20'),
    enabled: activeTab === 'for-you'
  });

  // Upcoming Events
  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => api.getEvents({ upcoming: 'true' }),
    enabled: activeTab === 'upcoming'
  });

  // Following
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['events', 'following'],
    queryFn: () => api.get('/events?following=true'),
    enabled: activeTab === 'following'
  });

  // All Events
  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => api.getEvents({}),
    enabled: activeTab === 'all'
  });

  const getEvents = () => {
    switch (activeTab) {
      case 'for-you': return forYouData?.data?.events || [];
      case 'upcoming': return upcomingData?.events || [];
      case 'following': return followingData?.data?.events || [];
      case 'all': return allData?.events || [];
      default: return [];
    }
  };

  const events = getEvents();
  const isLoading = forYouLoading || upcomingLoading || followingLoading || allLoading;

  const tabs = [
    { id: 'for-you' as Tab, label: 'For You', icon: <FiHeart /> },
    { id: 'upcoming' as Tab, label: 'Upcoming', icon: <FiClock /> },
    { id: 'following' as Tab, label: 'Following', icon: <FiUsers /> },
    { id: 'all' as Tab, label: 'All Events', icon: <FiCalendar /> },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 pb-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Events Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-gray-300 dark:bg-gray-800 rounded-lg mb-3" />
                      <div className="h-6 bg-gray-300 dark:bg-gray-800 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event: any) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group bg-white dark:bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all"
                    >
                      {/* Event Image/Cover */}
                      <div className="relative aspect-video bg-gradient-to-br from-purple-600 to-pink-600">
                        {event.cover_url ? (
                          <img
                            src={event.cover_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiCalendar className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                      </div>
                      
                      {/* Event Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          {/* Artist */}
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {event.artist?.name}
                            </span>
                            {event.artist?.verified && (
                              <FiCheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          
                          {/* Date & Time */}
                          <div className="flex items-center gap-2">
                            <FiClock className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDateTime(event.start_time)}</span>
                          </div>
                          
                          {/* Venue & Location */}
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{event.venue}, {event.location}</span>
                          </div>
                          
                          {/* Ticket Info */}
                          {event.min_price !== undefined && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wide text-gray-500">From</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(event.min_price)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FiCalendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No events available</p>
                </div>
              )}
            </div>

            {/* Sidebar - Friends Activity (Desktop only) */}
            <div className="hidden xl:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FriendsActivity />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
