'use client';

import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2, FiEye, FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function ArtistEventsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['artistEvents'],
    queryFn: async () => {
      const user = await api.get('/auth/me');
      const artistId = user.data.user.artist.id;
      return api.get(`/artists/${artistId}/events`);
    },
  });

  const handleDelete = async (eventId: number) => {
    if (!confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event cancelled successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel event');
    }
  };

  const handlePublish = async (eventId: number) => {
    try {
      await api.patch(`/events/${eventId}`, { status: 'published' });
      toast.success('Event published successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to publish event');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const events = data?.data?.events || [];

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-6 pb-24 md:pb-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">My Events</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your upcoming and past events
              </p>
            </div>
            <Link
              href="/artist/events/create"
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Create Event
            </Link>
          </div>

          {/* Events List */}
          {events.length === 0 ? (
            <div className="text-center py-16">
              <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No events yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first event to start selling tickets</p>
              <Link
                href="/artist/events/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Create Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event: any) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-green-500 dark:hover:border-green-500 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <FiMapPin className="w-4 h-4" />
                              <span>{event.venue}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              <span>{new Date(event.start_time).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          event.status === 'ongoing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                          event.status === 'completed' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <FiUsers className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {event.sold_tickets || 0} / {event.capacity} sold
                          </span>
                        </div>
                        {event.is_sold_out && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded text-xs font-semibold">
                            SOLD OUT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center flex items-center justify-center gap-2"
                      >
                        <FiEye className="w-4 h-4" />
                        <span className="hidden md:inline">View</span>
                      </Link>
                      
                      {event.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(event.id)}
                          className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}

