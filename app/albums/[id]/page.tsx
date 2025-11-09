'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { BackButton } from '@/components/BackButton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { MusicPlayer, usePlayerStore } from '@/components/MusicPlayer';
import { PurchaseModal } from '@/components/PurchaseModal';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';
import { ShareModal } from '@/components/ShareModal';
import { ContentCard } from '@/components/discovery/ContentCard';
import { FiPlay, FiClock, FiCheckCircle, FiShoppingCart, FiHeart, FiShare2, FiPlus, FiGlobe, FiEye, FiLock, FiList, FiMusic } from 'react-icons/fi';
import Link from 'next/link';
import { formatDuration, formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AlbumPage() {
  const params = useParams();
  const albumId = params.id as string;
  const { playTrack, addToQueue } = usePlayerStore();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['album', albumId],
    queryFn: () => api.getAlbum(parseInt(albumId)),
  });

  // Fetch more albums by same artist
  const { data: moreByArtistData } = useQuery({
    queryKey: ['artist-albums', data?.album?.artist?.id],
    queryFn: () => api.get(`/artists/${data.album.artist.id}/albums`),
    enabled: !!data?.album?.artist?.id
  });

  // Fetch related albums (same genre)
  const { data: relatedAlbumsData } = useQuery({
    queryKey: ['related-albums', albumId],
    queryFn: () => api.get(`/albums?genre=${data?.album?.genre}&limit=6`),
    enabled: !!data?.album?.genre
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-gray-900 dark:text-white">Loading album...</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Album not found</div>
        </div>
      </>
    );
  }

  const { album, tracks } = data;

  const handlePlayAlbum = () => {
    if (tracks && tracks.length > 0) {
      const enrichedTracks = tracks.map((t: any) => ({
        ...t,
        album: { id: album.id, title: album.title, cover_url: album.cover_url },
        artist: album.artist,
      }));
      playTrack(enrichedTracks[0], enrichedTracks);
    }
  };

  const handlePlayTrack = (track: any) => {
    const enrichedTracks = tracks.map((t: any) => ({
      ...t,
      album: { id: album.id, title: album.title, cover_url: album.cover_url },
      artist: album.artist,
    }));
    const enrichedTrack = { ...track, album: { id: album.id, title: album.title, cover_url: album.cover_url }, artist: album.artist };
    playTrack(enrichedTrack, enrichedTracks);
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.delete(`/albums/${albumId}/unlike`);
        setIsLiked(false);
        toast.success('Removed from liked albums');
      } else {
        await api.post(`/albums/${albumId}/like`);
        setIsLiked(true);
        toast.success('Added to liked albums');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleBuy = () => {
    setShowPurchaseModal(true);
  };

  const handleAddToQueue = () => {
    if (tracks && tracks.length > 0) {
      const enrichedTracks = tracks.map((t: any) => ({
        ...t,
        album: { id: album.id, title: album.title, cover_url: album.cover_url },
        artist: album.artist,
      }));
      enrichedTracks.forEach((track: any) => addToQueue(track));
      toast.success(`Added ${tracks.length} tracks to queue`);
    }
  };

  const handleAddTrackToPlaylist = (trackId: number) => {
    setSelectedTrackId(trackId);
    setShowPlaylistModal(true);
  };

  const moreByArtist = (moreByArtistData?.data?.albums || []).filter((a: any) => a.id !== parseInt(albumId)).slice(0, 6);
  const relatedAlbums = (relatedAlbumsData?.data?.albums || []).filter((a: any) => a.id !== parseInt(albumId)).slice(0, 6);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button & Breadcrumbs */}
          <div className="mb-6 flex items-center justify-between">
            <BackButton fallbackUrl="/music" label="Back to Music" />
            <Breadcrumbs items={[
              { label: 'Music', href: '/music' },
              { label: 'Albums', href: '/music' },
              { label: album.title }
            ]} />
          </div>

          {/* Album Header */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-12">
            {/* Cover Art */}
            <div className="w-full md:w-64 lg:w-80 flex-shrink-0">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                {album.cover_url ? (
                  <img 
                    src={album.cover_url} 
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                    <span className="text-6xl font-bold text-white/20">
                      {album.title[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Album Info */}
            <div className="flex-1 flex flex-col justify-end">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Album</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                {album.title}
              </h1>
              
              {/* Artist */}
              <div className="flex items-center gap-2 mb-4">
                <Link 
                  href={`/artists/${album.artist.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  {album.artist.avatar_url && (
                    <img 
                      src={album.artist.avatar_url} 
                      alt={album.artist.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-gray-900 dark:text-white font-medium">{album.artist.name}</span>
                  {album.artist.verified && (
                    <FiCheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                {album.release_date && (
                  <span>{formatDate(album.release_date)}</span>
                )}
                <span>•</span>
                <span>{tracks?.length || 0} tracks</span>
                {album.total_duration && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(album.total_duration)}</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlayAlbum}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2"
                >
                  <FiPlay className="w-5 h-5" />
                  Play
                </button>
                
                <button
                  onClick={handleLike}
                  className={`p-3 border rounded-full transition-all ${
                    isLiked
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-500'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={isLiked ? 'Unlike album' : 'Like album'}
                >
                  <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleAddToQueue}
                  className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full transition-colors"
                  title="Add to queue"
                >
                  <FiList className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full transition-colors"
                  title="Share album"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
                
                {album.price && (
                  <button
                    onClick={handleBuy}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full transition-colors border border-gray-700 flex items-center gap-2"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Buy {formatCurrency(album.price)}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Track List */}
          <div className="bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tracks</h2>
            
            {tracks && tracks.length > 0 ? (
              <div className="space-y-1">
                {tracks.map((track: any) => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {/* Track Number / Play Button */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-gray-600 dark:text-gray-400 group-hover:hidden text-sm">
                        {track.track_number}
                      </span>
                      <FiPlay className="w-4 h-4 text-white hidden group-hover:block mx-auto" />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 dark:text-white font-medium truncate flex items-center gap-2">
                        <span>{track.title}</span>
                        {track.explicit && (
                          <span className="text-xs text-gray-400 border border-gray-600 px-1 rounded">
                            E
                          </span>
                        )}
                        {track.access_tier === 'free' && (
                          <span className="text-xs text-green-400 flex items-center gap-1" title="Free streaming">
                            <FiGlobe className="w-3 h-3" />
                          </span>
                        )}
                        {track.access_tier === 'preview_only' && (
                          <span className="text-xs text-yellow-400 flex items-center gap-1" title="Preview only">
                            <FiEye className="w-3 h-3" />
                          </span>
                        )}
                        {track.access_tier === 'nft_required' && (
                          <span className="text-xs text-purple-400 flex items-center gap-1" title="NFT required">
                            <FiLock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {album.artist.name}
                      </div>
                    </div>

                    {/* Streams (desktop) */}
                    <div className="hidden md:block text-sm text-gray-600 dark:text-gray-400">
                      {track.streams_count ? `${track.streams_count} streams` : '-'}
                    </div>

                    {/* Quick Actions (desktop) */}
                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      {/* Add to Queue */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const enrichedTrack = {
                            ...track,
                            album: { id: album.id, title: album.title, cover_url: album.cover_url },
                            artist: album.artist
                          };
                          addToQueue(enrichedTrack);
                          toast.success('Added to queue');
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-all"
                        title="Add to queue"
                      >
                        <FiList className="w-4 h-4" />
                      </button>

                      {/* Add to Playlist */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTrackToPlaylist(track.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-all"
                        title="Add to playlist"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Duration */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                      <FiClock className="w-4 h-4 inline mr-1" />
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No tracks available
              </div>
            )}
          </div>

          {/* Description */}
          {album.description && (
            <div className="mt-8 bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About this album</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {album.description}
              </p>
            </div>
          )}

          {/* Credits */}
          <div className="mt-8 text-xs text-gray-600 dark:text-gray-500">
            {album.upc && <p>UPC: {album.upc}</p>}
            <p>Released: {album.release_date ? formatDate(album.release_date) : 'TBA'}</p>
            <p className="mt-2">℗ {new Date(album.release_date).getFullYear()} {album.artist.name}</p>
          </div>

          {/* More by Artist */}
          {moreByArtist.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  More by {album.artist.name}
                </h2>
                <Link
                  href={`/artists/${album.artist.id}`}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {moreByArtist.map((relatedAlbum: any) => (
                  <ContentCard
                    key={relatedAlbum.id}
                    item={relatedAlbum}
                    type="album"
                    onPlay={async (album) => {
                      try {
                        const response = await api.get(`/albums/${album.id}`);
                        const tracks = response.data.tracks || [];
                        if (tracks.length > 0) {
                          playTrack(tracks[0], tracks);
                        }
                      } catch (error) {
                        console.error('Failed to load album tracks:', error);
                      }
                    }}
                    showArtist={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Related Albums */}
          {relatedAlbums.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {relatedAlbums.map((relatedAlbum: any) => (
                  <ContentCard
                    key={relatedAlbum.id}
                    item={relatedAlbum}
                    type="album"
                    onPlay={async (album) => {
                      try {
                        const response = await api.get(`/albums/${album.id}`);
                        const tracks = response.data.tracks || [];
                        if (tracks.length > 0) {
                          playTrack(tracks[0], tracks);
                        }
                      } catch (error) {
                        console.error('Failed to load album tracks:', error);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <MusicPlayer />
      
      {/* Modals */}
      {album.price && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          item={{
            type: 'album',
            id: album.id,
            title: album.title,
            artist: album.artist.name,
            price: album.price,
            cover_url: album.cover_url,
          }}
        />
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`/albums/${albumId}`}
        title={album.title}
        description={`${album.artist.name} · ${tracks?.length || 0} tracks`}
        type="album"
      />

      {selectedTrackId && (
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => {
            setShowPlaylistModal(false);
            setSelectedTrackId(null);
          }}
          trackId={selectedTrackId}
        />
      )}
    </>
  );
}

