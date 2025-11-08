'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import { CreationTutorial, TutorialStep } from '@/components/creation/CreationTutorial';
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
  FiTicket
} from 'react-icons/fi';

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

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      target: '[data-tutorial="event-title"]',
      title: 'Event Name',
      content: 'Give your event a catchy name that will attract attendees. Make it memorable!',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="venue"]',
      title: 'Venue Details',
      content: 'Add the venue name and full location. This helps fans know exactly where to go.',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="datetime"]',
      title: 'Date & Time',
      content: 'Set when your event starts and ends. Make sure to account for setup and breakdown time.',
      position: 'right',
    },
    {
      target: '[data-tutorial="ticket-tiers"]',
      title: 'Ticket Tiers',
      content: 'Create different ticket types (VIP, Early Bird, etc.) with different prices and perks.',
      position: 'top',
    },
  ];

  // Step 1: Event Information
  const EventInfoStep = () => (
    <div className="space-y-6">
      {/* Event Title */}
      <div data-tutorial="event-title">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Event Title *
        </label>
        <input
          type="text"
          value={eventData.title}
          onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          placeholder="Enter event name"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={eventData.description}
          onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
          placeholder="Tell attendees what to expect at this event..."
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Include lineup, special guests, or any unique experiences
        </p>
      </div>

      {/* Venue & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tutorial="venue">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Venue Name *
          </label>
          <div className="relative">
            <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={eventData.venue}
              onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="The Grand Theater"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Location / Address *
          </label>
          <input
            type="text"
            value={eventData.location}
            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="City, State or Full Address"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tutorial="datetime">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Start Time *
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="datetime-local"
              value={eventData.start_time}
              onChange={(e) => setEventData({ ...eventData, start_time: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            End Time *
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="datetime-local"
              value={eventData.end_time}
              onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Total Capacity *
        </label>
        <div className="relative">
          <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            value={eventData.capacity}
            onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="500"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Maximum number of attendees (total across all ticket tiers)
        </p>
      </div>
    </div>
  );

  // Step 2: Ticket Tiers
  const TicketsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ticket Tiers ({ticketTiers.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create different ticket types with unique pricing and perks
          </p>
        </div>
        <button
          onClick={() => setTicketTiers([...ticketTiers, {
            name: '',
            price: 0,
            quantity: 0,
            description: '',
          }])}
          data-tutorial="ticket-tiers"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <FiPlus />
          Add Tier
        </button>
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
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tier {index + 1}
                </span>
              </div>
              {ticketTiers.length > 1 && (
                <button
                  onClick={() => {
                    if (ticketTiers.length === 1) {
                      toast.error('Event must have at least one ticket tier');
                      return;
                    }
                    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
                  }}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Tier Name */}
            <input
              type="text"
              value={tier.name}
              onChange={(e) => {
                const updated = [...ticketTiers];
                updated[index] = { ...updated[index], name: e.target.value };
                setTicketTiers(updated);
              }}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Tier name (e.g., VIP, Early Bird, General Admission)"
            />

            {/* Description */}
            <textarea
              value={tier.description}
              onChange={(e) => {
                const updated = [...ticketTiers];
                updated[index] = { ...updated[index], description: e.target.value };
                setTicketTiers(updated);
              }}
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
              placeholder="What's included in this tier?"
            />

            {/* Price & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Price (SOL) *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={tier.price}
                    onChange={(e) => {
                      const updated = [...ticketTiers];
                      updated[index] = { ...updated[index], price: parseFloat(e.target.value) };
                      setTicketTiers(updated);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Quantity Available *
                </label>
                <input
                  type="number"
                  value={tier.quantity}
                  onChange={(e) => {
                    const updated = [...ticketTiers];
                    updated[index] = { ...updated[index], quantity: parseInt(e.target.value) };
                    setTicketTiers(updated);
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          💡 Ticket Tier Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Early bird tiers create urgency and reward early supporters</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">✓</span>
            <span>VIP tiers with exclusive perks can increase revenue significantly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">✓</span>
            <span>General admission should typically have the most quantity available</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Step 3: Review
  const ReviewStep = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 Event Ready to Launch!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Your event is ready to be published. Review everything below and click "Create Event" to go live!
        </p>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Event Details
          </h4>
          <div className="space-y-4 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {eventData.title || 'Untitled Event'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
              <p className="text-gray-900 dark:text-white">
                {eventData.description || 'No description'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Venue</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {eventData.venue || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {eventData.location || 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start Time</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {eventData.start_time ? new Date(eventData.start_time).toLocaleString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">End Time</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {eventData.end_time ? new Date(eventData.end_time).toLocaleString() : 'Not set'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</p>
              <p className="text-2xl font-bold text-purple-600">
                {eventData.capacity || '0'} attendees
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Tiers */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Ticket Tiers ({ticketTiers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticketTiers.map((tier, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900"
              >
                <div className="flex items-start justify-between mb-3">
                  <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                    {tier.name || `Tier ${index + 1}`}
                  </h5>
                  <span className="text-2xl font-bold text-purple-600">
                    {tier.price > 0 ? `${tier.price} SOL` : 'FREE'}
                  </span>
                </div>
                
                {tier.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {tier.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-purple-200 dark:border-purple-900">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tier.quantity} tickets
                  </span>
                </div>
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
          name: tier.name,
          price: tier.price,
          quantity: tier.quantity,
          description: tier.description,
        })),
      };

      const response = await api.post('/artist/events', payload);
      toast.success('Event created successfully!');
      router.push(`/events/${response.data.event.id}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Event Info',
      description: 'Basic event details and logistics',
      icon: <FiFileText className="w-6 h-6" />,
      component: <EventInfoStep />,
      validation: async () => {
        if (!eventData.title) {
          toast.error('Please enter an event title');
          return false;
        }
        if (!eventData.venue || !eventData.location) {
          toast.error('Please enter venue and location');
          return false;
        }
        if (!eventData.start_time || !eventData.end_time) {
          toast.error('Please set start and end times');
          return false;
        }
        if (!eventData.capacity || parseInt(eventData.capacity) <= 0) {
          toast.error('Please set a valid capacity');
          return false;
        }
        return true;
      },
    },
    {
      id: 'tickets',
      title: 'Tickets',
      description: 'Configure ticket tiers and pricing',
      icon: <FiTicket className="w-6 h-6" />,
      component: <TicketsStep />,
      validation: async () => {
        if (ticketTiers.length === 0) {
          toast.error('Please add at least one ticket tier');
          return false;
        }
        for (const tier of ticketTiers) {
          if (!tier.name) {
            toast.error('All ticket tiers must have a name');
            return false;
          }
          if (tier.quantity <= 0) {
            toast.error('All ticket tiers must have a quantity greater than 0');
            return false;
          }
        }
        return true;
      },
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and publish your event',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  return (
    <PermissionGuard resource="Event" action="create">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push('/artist/events')}
          title="Create New Event"
          subtitle="Bring fans together for an unforgettable experience"
        />

        <CreationTutorial
          steps={tutorialSteps}
          tutorialKey="event-creation"
          onComplete={() => toast.success('Tutorial completed!')}
        />
      </div>
    </PermissionGuard>
  );
}
