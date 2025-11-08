'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiUsers,
  FiPlus,
  FiX,
  FiCheck,
  FiFileText,
  FiCreditCard
} from 'react-icons/fi';

interface TicketTier {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  sold?: number;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: '',
  });

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${params.id}`);
        const event = response.data.event;
        
        setEventData({
          title: event.title || '',
          description: event.description || '',
          venue: event.venue || '',
          location: event.location || '',
          start_time: event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
          end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
          capacity: event.capacity?.toString() || '',
        });
        
        setTicketTiers(event.ticket_tiers?.map((t: any) => ({
          id: t.id,
          name: t.name,
          price: t.price_sol || t.price || 0,
          quantity: t.quantity,
          description: t.description || '',
          sold: t.sold || 0,
        })) || []);
      } catch (error: any) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event');
        router.push('/artist/events');
      } finally {
        setFetchingEvent(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, router]);

  const EventInfoStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          ✏️ Edit Event Details
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Update your event information. Be careful with changes if tickets have been sold!
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Event Title *
        </label>
        <input
          type="text"
          value={eventData.title}
          onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={eventData.description}
          onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Venue Name *
          </label>
          <input
            type="text"
            value={eventData.venue}
            onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Location *
          </label>
          <input
            type="text"
            value={eventData.location}
            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Start Time *
          </label>
          <input
            type="datetime-local"
            value={eventData.start_time}
            onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            End Time *
          </label>
          <input
            type="datetime-local"
            value={eventData.end_time}
            onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const TicketsStep = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          ⚠️ Be careful editing ticket tiers that have already been sold. Quantity changes won't affect sold tickets.
        </p>
      </div>

      <div className="space-y-4">
        {ticketTiers.map((tier, index) => (
          <div
            key={index}
            className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tier.name}
                  </span>
                  {tier.sold && tier.sold > 0 && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      ({tier.sold} sold)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <input
              type="text"
              value={tier.name}
              onChange={(e) => {
                const updated = [...ticketTiers];
                updated[index] = { ...updated[index], name: e.target.value };
                setTicketTiers(updated);
              }}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />

            <textarea
              value={tier.description}
              onChange={(e) => {
                const updated = [...ticketTiers];
                updated[index] = { ...updated[index], description: e.target.value };
                setTicketTiers(updated);
              }}
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Price (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tier.price}
                  onChange={(e) => {
                    const updated = [...ticketTiers];
                    updated[index] = { ...updated[index], price: parseFloat(e.target.value) };
                    setTicketTiers(updated);
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  disabled={!!(tier.sold && tier.sold > 0)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={tier.quantity}
                  onChange={(e) => {
                    const updated = [...ticketTiers];
                    updated[index] = { ...updated[index], quantity: parseInt(e.target.value) };
                    setTicketTiers(updated);
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ✏️ Ready to Save!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Review your changes and save the updated event.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {eventData.title}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Venue</p>
              <p className="text-gray-900 dark:text-white font-medium">{eventData.venue}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Location</p>
              <p className="text-gray-900 dark:text-white font-medium">{eventData.location}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Start</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {eventData.start_time ? new Date(eventData.start_time).toLocaleString() : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">End</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {eventData.end_time ? new Date(eventData.end_time).toLocaleString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Ticket Tiers ({ticketTiers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticketTiers.map((tier, index) => (
              <div key={index} className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900">
                <h5 className="font-bold text-gray-900 dark:text-white">{tier.name}</h5>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {tier.price > 0 ? `${tier.price} SOL` : 'FREE'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {tier.quantity} available
                  {tier.sold && tier.sold > 0 && ` • ${tier.sold} sold`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        event: {
          title: eventData.title,
          description: eventData.description,
          venue: eventData.venue,
          location: eventData.location,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          capacity: parseInt(eventData.capacity),
        },
        ticket_tiers: ticketTiers.map(tier => ({
          id: tier.id,
          name: tier.name,
          price: tier.price,
          quantity: tier.quantity,
          description: tier.description,
        })),
      };

      await api.put(`/artist/events/${params.id}`, payload);
      toast.success('Event updated successfully!');
      router.push(`/events/${params.id}`);
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.error || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Event Info',
      description: 'Update event details',
      icon: <FiFileText className="w-6 h-6" />,
      component: <EventInfoStep />,
      validation: async () => {
        if (!eventData.title) {
          toast.error('Please enter an event title');
          return false;
        }
        return true;
      },
    },
    {
      id: 'tickets',
      title: 'Tickets',
      description: 'Update ticket tiers',
      icon: <FiCreditCard className="w-6 h-6" />,
      component: <TicketsStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and save changes',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (fetchingEvent) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard resource="Event" action="update">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push(`/events/${params.id}`)}
          title="Edit Event"
          subtitle="Update your event details"
        />
      </div>
    </PermissionGuard>
  );
}

