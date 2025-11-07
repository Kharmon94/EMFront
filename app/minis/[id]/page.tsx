'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import MiniPlayer from '@/components/MiniPlayer';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function MiniFeedPage() {
  const params = useParams();
  const router = useRouter();
  const startMiniId = parseInt(params.id as string);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchedMinis, setWatchedMinis] = useState<Set<number>>(new Set());

  // Fetch feed (For You by default)
  const { data, isLoading } = useQuery({
    queryKey: ['mini-feed'],
    queryFn: () => api.getMiniFeed()
  });

  const minis = data?.minis || [];

  // Find starting index
  useEffect(() => {
    if (minis.length > 0) {
      const index = minis.findIndex((m: any) => m.id === startMiniId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [minis, startMiniId]);

  const currentMini = minis[currentIndex];

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentIndex < minis.length - 1) {
      setCurrentIndex(prev => prev + 1);
      const nextMini = minis[currentIndex + 1];
      router.replace(`/minis/${nextMini.id}`, { scroll: false });
    } else {
      toast('No more Minis!', { icon: '🎬' });
    }
  }, [currentIndex, minis, router]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevMini = minis[currentIndex - 1];
      router.replace(`/minis/${prevMini.id}`, { scroll: false });
    }
  }, [currentIndex, minis, router]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => goToNext(),
    onSwipedDown: () => goToPrevious(),
    trackMouse: true,
    trackTouch: true,
    delta: 50
  });

  // Like handler
  const handleLike = async () => {
    if (!currentMini) return;
    
    try {
      await api.likeContent('Mini', currentMini.id);
      toast.success('Liked!', { icon: '❤️', duration: 1000 });
      // Update local state
      currentMini.likes_count = (currentMini.likes_count || 0) + 1;
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  // Share handler
  const handleShare = async () => {
    if (!currentMini) return;
    
    try {
      const result = await api.shareMini(currentMini.id);
      const shareUrl = result.share_url || `${window.location.origin}/minis/${currentMini.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: currentMini.title,
          text: `Check out this Mini from ${currentMini.artist.name}!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
      
      // Update share count
      currentMini.shares_count = (currentMini.shares_count || 0) + 1;
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentMini) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Mini not found</p>
          <button
            onClick={() => router.push('/minis')}
            className="text-purple-400 hover:underline"
          >
            ← Back to Mini's
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      {...swipeHandlers}
      className="w-full h-screen overflow-hidden bg-black"
    >
      {/* Render current mini */}
      <div className="snap-y snap-mandatory h-screen overflow-y-hidden">
        <MiniPlayer
          mini={currentMini}
          isActive={true}
          onNext={currentIndex < minis.length - 1 ? goToNext : undefined}
          onPrevious={currentIndex > 0 ? goToPrevious : undefined}
          onLike={handleLike}
          onShare={handleShare}
        />
      </div>

      {/* Exit button */}
      <button
        onClick={() => router.push('/minis')}
        className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-colors"
      >
        ✕
      </button>

      {/* Progress indicator */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {minis.length}
      </div>
    </div>
  );
}

