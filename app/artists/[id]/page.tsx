'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  FiUsers, FiMusic, FiCalendar, FiVideo, FiShoppingBag, FiGift, 
  FiCheckCircle, FiShare2, FiHeart, FiMessageCircle, FiTrendingUp,
  FiGlobe, FiInstagram, FiTwitter, FiCopy, FiShare
} from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = parseInt(params.id as string);
  const [activeTab, setActiveTab] = useState('overview');
  const [following, setFollowing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['artistProfile', artistId],
    queryFn: () => api.getArtistProfile(artistId),
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Artist not found</div>
        </div>
      </>
    );
  }

  const { artist, stats, token, albums, upcoming_events, recent_livestreams, upcoming_livestreams, merch_items, fan_passes, is_following } = data;

  // Update meta tags for social sharing
  useEffect(() => {
    if (artist) {
      // Update page title
      document.title = `${artist.name} - EncryptedMedia`;
      
      // Update meta tags
      const updateMetaTag = (property: string, content: string) => {
        let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', property);
          document.head.appendChild(element);
        }
        element.content = content;
      };
      
      const updateNameTag = (name: string, content: string) => {
        let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        element.content = content;
      };
      
      // OG tags
      updateMetaTag('og:title', `${artist.name} on EncryptedMedia`);
      updateMetaTag('og:description', artist.bio || `Check out ${artist.name}'s music, events, and exclusive fan passes`);
      updateMetaTag('og:image', artist.banner_url || artist.avatar_url || '');
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:type', 'profile');
      
      // Twitter cards
      updateNameTag('twitter:card', 'summary_large_image');
      updateNameTag('twitter:title', `${artist.name} - Music Artist`);
      updateNameTag('twitter:description', artist.bio || `Explore ${artist.name}'s music and exclusive content`);
      updateNameTag('twitter:image', artist.banner_url || artist.avatar_url || '');
      
      // Additional
      updateNameTag('description', artist.bio || `${artist.name} - Web3 Music Artist on EncryptedMedia`);
    }
  }, [artist]);

  const handleFollow = async () => {
    setFollowing(true);
    try {
      if (is_following) {
        await api.unfollowArtist(artistId);
        toast.success('Unfollowed');
      } else {
        await api.followArtist(artistId);
        toast.success('Following!');
      }
      refetch();
    } catch (error: any) {
      console.error('Follow error:', error);
      toast.error(error.response?.data?.error || 'Failed to follow/unfollow');
    }
    setFollowing(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${artist.name} on EncryptedMedia`;
    const text = artist.bio || `Check out ${artist.name}'s music and exclusive content`;

    // Try native share API first (mobile friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          // Fallback to copy to clipboard
          await navigator.clipboard.writeText(url);
          toast.success('Profile link copied to clipboard!');
        }
      }
    } else {
      // Fallback for desktop: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const shareToTwitter = () => {
    const url = window.location.href;
    const text = `Check out ${artist.name} on EncryptedMedia! 🎵`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black">
        {/* Hero Section */}
        <div className="relative h-80 overflow-hidden">
          {/* Banner */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
            {artist.banner_url && (
              <img
                src={artist.banner_url}
                alt={artist.name}
                className="w-full h-full object-cover opacity-60"
              />
            )}
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Artist Info */}
          <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-8">
            <div className="flex items-end gap-6 w-full">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-900">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                      {artist.name.charAt(0)}
                    </div>
                  )}
                </div>
                {artist.verified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-black">
                    <FiCheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              
              {/* Name & Actions */}
              <div className="flex-1 pb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{artist.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-300">{stats.followers_count.toLocaleString()} followers</span>
                  {artist.location && (
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <FiGlobe className="w-4 h-4" />
                      {artist.location}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleFollow}
                    disabled={following}
                    className={`px-6 py-3 rounded-full font-bold transition-all ${
                      is_following
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {following ? 'Loading...' : is_following ? 'Following' : 'Follow'}
                  </button>
                  
                  {/* Share Button with Dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold flex items-center gap-2">
                      <FiShare2 className="w-5 h-5" />
                      Share
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-300 dark:divide-gray-800 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 shadow-lg focus:outline-none z-10">
                        <div className="px-1 py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleShare}
                                className={`${
                                  active ? 'bg-gray-800' : ''
                                } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300`}
                              >
                                <FiCopy className="w-4 h-4" />
                                Copy Link
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={shareToTwitter}
                                className={`${
                                  active ? 'bg-gray-800' : ''
                                } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300`}
                              >
                                <FiTwitter className="w-4 h-4 text-blue-400" />
                                Share on Twitter
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={shareToFacebook}
                                className={`${
                                  active ? 'bg-gray-800' : ''
                                } group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300`}
                              >
                                <FiShare className="w-4 h-4 text-blue-500" />
                                Share on Facebook
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  
                  {/* Social Links */}
                  {artist.social_links?.twitter && (
                    <a
                      href={`https://twitter.com/${artist.social_links.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center"
                    >
                      <FiTwitter className="w-5 h-5 text-blue-400" />
                    </a>
                  )}
                  
                  {artist.social_links?.instagram && (
                    <a
                      href={`https://instagram.com/${artist.social_links.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center"
                    >
                      <FiInstagram className="w-5 h-5 text-pink-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                icon={<FiUsers className="w-5 h-5 text-purple-400" />}
                label="Monthly Listeners"
                value={stats.monthly_listeners?.toLocaleString() || '0'}
              />
              <StatCard
                icon={<FiMusic className="w-5 h-5 text-blue-400" />}
                label="Tracks"
                value={stats.total_tracks?.toString() || '0'}
              />
              <StatCard
                icon={<FiCalendar className="w-5 h-5 text-green-400" />}
                label="Events"
                value={stats.total_events?.toString() || '0'}
              />
              <StatCard
                icon={<FiHeart className="w-5 h-5 text-red-400" />}
                label="Total Likes"
                value={stats.total_likes?.toLocaleString() || '0'}
              />
              {token && (
                <StatCard
                  icon={<FiTrendingUp className="w-5 h-5 text-yellow-400" />}
                  label="Token Price"
                  value={`${token.current_price.toFixed(4)} SOL`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <TabButton label="Overview" icon={<FiMusic />} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <TabButton label={`Music (${albums.length})`} icon={<FiMusic />} active={activeTab === 'music'} onClick={() => setActiveTab('music')} />
              <TabButton label={`Events (${upcoming_events.length})`} icon={<FiCalendar />} active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
              <TabButton label="Livestreams" icon={<FiVideo />} active={activeTab === 'streams'} onClick={() => setActiveTab('streams')} />
              {merch_items.length > 0 && (
                <TabButton label={`Merch (${merch_items.length})`} icon={<FiShoppingBag />} active={activeTab === 'merch'} onClick={() => setActiveTab('merch')} />
              )}
              {fan_passes.length > 0 && (
                <TabButton label={`Fan Passes (${fan_passes.length})`} icon={<FiGift />} active={activeTab === 'passes'} onClick={() => setActiveTab('passes')} />
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OverviewTab artist={artist} albums={albums} upcoming_events={upcoming_events} token={token} fan_passes={fan_passes} />
          )}
          
          {activeTab === 'music' && (
            <MusicTab albums={albums} />
          )}
          
          {activeTab === 'events' && (
            <EventsTab events={upcoming_events} />
          )}
          
          {activeTab === 'streams' && (
            <StreamsTab recent={recent_livestreams} upcoming={upcoming_livestreams} />
          )}
          
          {activeTab === 'merch' && (
            <MerchTab items={merch_items} />
          )}
          
          {activeTab === 'passes' && (
            <FanPassTab passes={fan_passes} />
          )}
        </div>
      </main>
    </>
  );
}

// Sub-components
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  );
}

function TabButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OverviewTab({ artist, albums, upcoming_events, token, fan_passes }: any) {
  return (
    <div className="space-y-8">
      {/* Bio */}
      {artist.bio && (
        <section className="p-6 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">About</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{artist.bio}</p>
        </section>
      )}

      {/* Token Widget */}
      {token && (
        <section className="p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{token.symbol}</h2>
              <p className="text-gray-400">{token.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">{token.current_price.toFixed(4)} SOL</div>
              <div className="text-sm text-gray-400">Market Cap: {formatCurrency(token.market_cap)}</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href={`/tokens/${token.mint_address}`} className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg text-center">
              Trade ${token.symbol}
            </Link>
          </div>
        </section>
      )}

      {/* Latest Releases */}
      {albums.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Latest Releases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {albums.slice(0, 3).map((album: any) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcoming_events.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {upcoming_events.slice(0, 3).map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Fan Passes */}
      {fan_passes.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Exclusive Fan Passes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fan_passes.map((pass: any) => (
              <FanPassCard key={pass.id} pass={pass} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MusicTab({ albums }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {albums.map((album: any) => (
        <AlbumCard key={album.id} album={album} />
      ))}
      {albums.length === 0 && (
        <div className="col-span-full text-center py-20">
          <FiMusic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No music released yet</p>
        </div>
      )}
    </div>
  );
}

function EventsTab({ events }: any) {
  return (
    <div className="space-y-4">
      {events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
      {events.length === 0 && (
        <div className="text-center py-20">
          <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No upcoming events</p>
        </div>
      )}
    </div>
  );
}

function StreamsTab({ recent, upcoming }: any) {
  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Upcoming Livestreams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((stream: any) => (
              <StreamCard key={stream.id} stream={stream} upcoming={true} />
            ))}
          </div>
        </div>
      )}
      
      {recent.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Recent Streams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map((stream: any) => (
              <StreamCard key={stream.id} stream={stream} upcoming={false} />
            ))}
          </div>
        </div>
      )}
      
      {upcoming.length === 0 && recent.length === 0 && (
        <div className="text-center py-20">
          <FiVideo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No livestreams yet</p>
        </div>
      )}
    </div>
  );
}

function MerchTab({ items }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item: any) => (
        <MerchCard key={item.id} item={item} />
      ))}
      {items.length === 0 && (
        <div className="col-span-full text-center py-20">
          <FiShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No merchandise available</p>
        </div>
      )}
    </div>
  );
}

function FanPassTab({ passes }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {passes.map((pass: any) => (
        <FanPassCard key={pass.id} pass={pass} />
      ))}
      {passes.length === 0 && (
        <div className="col-span-full text-center py-20">
          <FiGift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No fan passes available</p>
        </div>
      )}
    </div>
  );
}

// Card Components
function AlbumCard({ album }: any) {
  return (
    <Link href={`/albums/${album.id}`}>
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-600 transition-all group">
        <div className="aspect-square bg-gray-800 relative overflow-hidden">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiMusic className="w-20 h-20 text-gray-600" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">{album.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{new Date(album.release_date).getFullYear()}</span>
            <span className="flex items-center gap-1">
              <FiHeart className="w-3 h-3" />
              {album.likes_count || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EventCard({ event }: any) {
  return (
    <Link href={`/events/${event.id}`}>
      <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 hover:border-purple-600 transition-all">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <div className="space-y-1 text-gray-400">
              <p className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString()}
              </p>
              <p>{event.venue}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-2">From</div>
            <div className="text-2xl font-bold text-purple-400">
              {event.ticket_tiers[0]?.price ? `${event.ticket_tiers[0].price} SOL` : 'TBA'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StreamCard({ stream, upcoming }: any) {
  return (
    <Link href={`/livestreams/${stream.id}`}>
      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 hover:border-purple-600 transition-all">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-white">{stream.title}</h3>
          {!upcoming && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <FiUsers className="w-4 h-4" />
              {stream.viewer_count || 0}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400">
          {upcoming ? new Date(stream.start_time).toLocaleString() : `Ended ${new Date(stream.ended_at).toLocaleDateString()}`}
        </div>
      </div>
    </Link>
  );
}

function MerchCard({ item }: any) {
  return (
    <Link href={`/shop/merch/${item.id}`}>
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-600 transition-all group">
        <div className="aspect-square bg-gray-800 relative">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiShoppingBag className="w-20 h-20 text-gray-600" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white mb-1">{item.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold">{formatCurrency(item.price)}</span>
            <span className="text-sm text-gray-400">{item.stock} in stock</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FanPassCard({ pass }: any) {
  return (
    <Link href={`/fan-passes/${pass.id}`}>
      <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-lg hover:border-purple-600 transition-all">
        <h3 className="text-xl font-bold text-white mb-2">{pass.name}</h3>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Price:</span>
            <span className="text-white font-semibold">{formatCurrency(pass.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Minted:</span>
            <span className="text-white font-semibold">{pass.minted_count}/{pass.max_supply}</span>
          </div>
          {pass.dividend_percentage > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Dividend:</span>
              <span className="text-purple-400 font-semibold">{pass.dividend_percentage}%</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Perks:</span>
            <span className="text-white font-semibold">{pass.perks_count}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-purple-600"
            style={{ width: `${(pass.minted_count / pass.max_supply) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">{pass.max_supply - pass.minted_count} available</p>
      </div>
    </Link>
  );
}
