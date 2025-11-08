'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiPlus, FiX } from 'react-icons/fi';

interface TicketTier {
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    start_time: '',
    end_time: '',
    capacity: '',
  });

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      name: 'General Admission',
      price: 0,
      quantity: 100,
      description: '',
    }
  ]);

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, {
      name: '',
      price: 0,
      quantity: 0,
      description: '',
    }]);
  };

  const removeTicketTier = (index: number) => {
    if (ticketTiers.length === 1) {
      toast.error('Event must have at least one ticket tier');
      return;
    }
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const updateTicketTier = (index: number, field: keyof TicketTier, value: any) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!eventData.title || !eventData.venue || !eventData.start_time || !eventData.capacity) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (ticketTiers.some(t => !t.name || t.quantity <= 0)) {
        toast.error('All ticket tiers must have a name and quantity');
        setLoading(false);
        return;
      }

      const payload = {
        event: {
          ...eventData,
          capacity: parseInt(eventData.capacity),
          status: 'draft',
        },
        ticket_tiers: ticketTiers.map((tier, index) => ({
          ...tier,
          tier_number: index + 1,
        })),
      };

      await api.post('/events', payload);
      toast.success('Event created successfully!');
      router.push('/artist/events');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Create Event</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set up a new event with ticketing
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Details */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-6">Event Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Summer Concert 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell attendees about this event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Venue *
                    </label>
                    <input
                      type="text"
                      value={eventData.venue}
                      onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Madison Square Garden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={eventData.location}
                      onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventData.start_time}
                      onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={eventData.end_time}
                      onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    value={eventData.capacity}
                    onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ticket Tiers */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black dark:text-white">Ticket Tiers</h2>
                <button
                  type="button"
                  onClick={addTicketTier}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Tier
                </button>
              </div>

              <div className="space-y-4">
                {ticketTiers.map((tier, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-black dark:text-white">Tier {index + 1}</h3>
                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketTier(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tier Name *
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => updateTicketTier(index, 'name', e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="VIP, General, etc."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price (SOL) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.price}
                          onChange={(e) => updateTicketTier(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="0.50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={tier.quantity}
                          onChange={(e) => updateTicketTier(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="100"
                          required
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tier Description
                        </label>
                        <input
                          type="text"
                          value={tier.description}
                          onChange={(e) => updateTicketTier(index, 'description', e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Includes backstage access, merch, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiCalendar className="w-5 h-5" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
              💡 Tips for creating events:
            </h3>
            <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
              <li>• Tickets will be minted as NFTs on Solana blockchain</li>
              <li>• Create multiple tiers for VIP, General Admission, etc.</li>
              <li>• Set pricing in SOL (use 0 for free events)</li>
              <li>• You can publish the event later from the events management page</li>
            </ul>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

