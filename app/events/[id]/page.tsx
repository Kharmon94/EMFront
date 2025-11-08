'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { TicketPurchaseModal } from '@/components/TicketPurchaseModal';
import { PermissionGuard } from '@/components/PermissionGuard';
import { 
  FiCalendar, 
  FiMapPin, 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiShare2, 
  FiDownload,
  FiExternalLink 
} from 'react-icons/fi';
import Link from 'next/link';
import { formatDateTime, formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEvent(parseInt(eventId)),
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-gray-900 dark:text-white">Loading event...</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Event not found</div>
        </div>
      </>
    );
  }

  const { event, ticket_tiers } = data;

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Event link copied to clipboard!');
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(event.start_time);
    const endDate = event.end_time ? new Date(event.end_time) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    // Format dates for calendar (yyyyMMddTHHmmssZ)
    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(event.title)}` +
      `&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}` +
      `&details=${encodeURIComponent(event.description || '')}` +
      `&location=${encodeURIComponent(`${event.venue}, ${event.location}`)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handlePurchaseTicket = (tier: any) => {
    setSelectedTier(tier);
    setShowPurchaseModal(true);
  };

  const getStatusBadge = () => {
    if (event.is_sold_out) {
      return (
        <div className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full">
          SOLD OUT
        </div>
      );
    }
    if (event.status === 'live') {
      return (
        <div className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full" />
          HAPPENING NOW
        </div>
      );
    }
    if (new Date(event.start_time) < new Date()) {
      return (
        <div className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white text-sm font-bold rounded-full">
          ENDED
        </div>
      );
    }
    return null;
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        {/* Hero Section */}
        <div className="relative h-96 sm:h-[500px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <FiCalendar className="w-32 h-32 text-white/10" />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
            {/* Status Badge */}
            <div className="mb-4">
              {getStatusBadge()}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {event.title}
            </h1>

            {/* Artist */}
            <Link 
              href={`/artists/${event.artist.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-6 w-fit"
            >
              {event.artist.avatar_url && (
                <img 
                  src={event.artist.avatar_url} 
                  alt={event.artist.name}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
              )}
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Presented by</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-white font-semibold text-lg">{event.artist.name}</span>
                  {event.artist.verified && (
                    <FiCheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>
            </Link>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <FiShare2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleAddToCalendar}
                className="px-4 py-2 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <FiDownload className="w-4 h-4" />
                Add to Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Details */}
              <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg">
                      <FiCalendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Date & Time</p>
                      <p className="text-gray-900 dark:text-white font-medium">{formatDateTime(event.start_time)}</p>
                      {event.end_time && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Ends: {formatDateTime(event.end_time)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg">
                      <FiMapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Location</p>
                      <p className="text-gray-900 dark:text-white font-medium">{event.venue}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{event.location}</p>
                      {event.venue && event.location && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.location}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mt-1"
                        >
                          View on map <FiExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-lg">
                      <FiUsers className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Attendance</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {event.sold_tickets} / {event.capacity} tickets sold
                      </p>
                      <div className="mt-2 w-64">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                            style={{ width: `${(event.sold_tickets / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {(event.min_age || event.dress_code) && (
                <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Important Information</h2>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    {event.min_age && (
                      <p>• Minimum age: {event.min_age}+</p>
                    )}
                    {event.dress_code && (
                      <p>• Dress code: {event.dress_code}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Ticket Tiers */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white dark:bg-gray-800/30 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-4">Select Tickets</h2>
                  
                  {ticket_tiers && ticket_tiers.length > 0 ? (
                    <div className="space-y-4">
                      {ticket_tiers.map((tier: any) => (
                        <TicketTierCard
                          key={tier.id}
                          tier={tier}
                          onPurchase={handlePurchaseTicket}
                          isSoldOut={event.is_sold_out || tier.available <= 0}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      No tickets available
                    </p>
                  )}

                  {/* Footer Note */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <p className="text-xs text-gray-500 text-center">
                      NFT tickets secured on Solana blockchain
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedTier && (
        <TicketPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedTier(null);
          }}
          event={{
            id: event.id,
            title: event.title,
            venue: event.venue,
            location: event.location,
            start_time: event.start_time,
            artist: {
              name: event.artist.name,
              avatar_url: event.artist.avatar_url,
              wallet_address: event.artist.wallet_address,
            },
          }}
          tier={selectedTier}
          onSuccess={() => {
            setShowPurchaseModal(false);
            setSelectedTier(null);
            refetch(); // Refresh event data to show updated ticket counts
          }}
        />
      )}
    </PermissionGuard>
  );
}

function TicketTierCard({ tier, onPurchase, isSoldOut }: { tier: any; onPurchase: (tier: any) => void; isSoldOut: boolean }) {
  const availablePercentage = (tier.available / tier.quantity) * 100;

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      isSoldOut 
        ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-purple-500 bg-white dark:bg-gray-800/40'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold">{tier.name}</h3>
          {tier.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{tier.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-purple-600 dark:text-purple-400 font-bold text-lg">{formatCurrency(tier.price_sol)} SOL</p>
          {tier.price_usd && (
            <p className="text-gray-600 dark:text-gray-500 text-xs">${tier.price_usd}</p>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>{tier.available} available</span>
          <span>{Math.round(availablePercentage)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${100 - availablePercentage}%` }}
          />
        </div>
      </div>

      {/* Features */}
      {tier.features && tier.features.length > 0 && (
        <div className="mb-3 space-y-1">
          {tier.features.slice(0, 3).map((feature: string, index: number) => (
            <p key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
              {feature}
            </p>
          ))}
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={() => onPurchase(tier)}
        disabled={isSoldOut}
        className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
          isSoldOut
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        {isSoldOut ? 'Sold Out' : 'Buy Ticket'}
      </button>
    </div>
  );
}

