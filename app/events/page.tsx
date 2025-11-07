'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default function EventsPage() {
  const [filter, setFilter] = useState('upcoming');

  const { data, isLoading } = useQuery({
    queryKey: ['events', filter],
    queryFn: () => api.getEvents({ 
      upcoming: filter === 'upcoming' ? 'true' : undefined,
      past: filter === 'past' ? 'true' : undefined,
    }),
  });

  const events = data?.events || [];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 md:pt-20 pb-8">

          {/* Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {['upcoming', 'past', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-800 rounded-lg mb-3" />
                  <div className="h-6 bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No events found</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function EventCard({ event }: { event: any }) {
  const availablePercentage = ((event.capacity - event.sold_tickets) / event.capacity) * 100;
  
  return (
    <Link 
      href={`/events/${event.id}`}
      className="group bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-colors"
    >
      {/* Event Image Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <FiCalendar className="w-16 h-16 text-white/20" />
        </div>
        
        {/* Sold Out Badge */}
        {event.is_sold_out && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
            SOLD OUT
          </div>
        )}
        
        {/* Status Badge */}
        {event.status === 'live' && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full animate-pulse">
            LIVE
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
          {event.title}
        </h3>

        {/* Artist */}
        <div className="flex items-center gap-2 mb-3">
          {event.artist.avatar_url && (
            <img 
              src={event.artist.avatar_url} 
              alt={event.artist.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-gray-300 text-sm">{event.artist.name}</span>
          {event.artist.verified && (
            <FiCheckCircle className="w-4 h-4 text-blue-500" />
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 flex-shrink-0" />
            <span>{formatDateTime(event.start_time)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{event.venue}, {event.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiUsers className="w-4 h-4 flex-shrink-0" />
            <span>{event.sold_tickets} / {event.capacity} tickets</span>
          </div>
        </div>

        {/* Availability Bar */}
        {!event.is_sold_out && (
          <div className="mt-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                style={{ width: `${100 - availablePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(availablePercentage)}% tickets available
            </p>
          </div>
        )}

        {/* CTA Button */}
        <button 
          className={`w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-colors ${
            event.is_sold_out
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
          disabled={event.is_sold_out}
        >
          {event.is_sold_out ? 'Sold Out' : 'Get Tickets'}
        </button>
      </div>
    </Link>
  );
}

