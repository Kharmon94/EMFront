'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FiHeart, FiEye, FiClock, FiGlobe, FiEye as FiEyePreview, FiLock, FiUser, FiCalendar, FiLogIn } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import VideoPlayer from '@/components/VideoPlayer';
import CommentSection from '@/components/CommentSection';
import { usePermissions } from '@/lib/usePermissions';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = parseInt(params.id as string);
  const { publicKey, signTransaction } = useWallet();
  const { isAuthenticated } = usePermissions();
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [watchData, setWatchData] = useState<any>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => api.getVideo(videoId)
  });

  const video = data?.video;
  const access = data?.access;

  // Check auth requirement when trying to watch
  useEffect(() => {
    if (video && !isAuthenticated) {
      setShowAuthPrompt(true);
    }
  }, [video, isAuthenticated]);

  // Load watch URL if allowed
  const loadVideo = async () => {
    try {
      const data = await api.watchVideo(videoId);
      setWatchData(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load video');
    }
  };

  // Purchase video
  const handlePurchase = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!video?.price) {
      toast.error('Video price not available');
      return;
    }

    setIsPurchasing(true);

    try {
      const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(RPC_URL);
      
      const recipientPubkey = video.artist.wallet_address
        ? new PublicKey(video.artist.wallet_address)
        : new PublicKey('11111111111111111111111111111111');
      
      const lamports = video.price * LAMPORTS_PER_SOL;
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: Math.floor(lamports),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      toast.loading('Confirming transaction...', { id: 'tx-confirm' });
      await connection.confirmTransaction(signature, 'confirmed');
      toast.dismiss('tx-confirm');

      // Create purchase record
      await api.purchaseVideo(videoId, signature);
      
      toast.success('Video purchased successfully!');
      setHasPurchased(true);
      refetch();
      loadVideo();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Auto-load video if access is granted
  useState(() => {
    if (video && access?.allowed && !watchData) {
      loadVideo();
    }
  });

  const getAccessBadge = () => {
    if (!access) return null;

    if (access.tier === 'free') {
      return (
        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
          <FiGlobe /> Free
        </div>
      );
    }

    if (access.tier === 'preview') {
      return (
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
          <FiEyePreview /> Preview ({access.duration}s)
        </div>
      );
    }

    if (access.tier === 'premium') {
      return (
        <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
          ⭐ NFT Access
        </div>
      );
    }

    if (access.tier === 'purchased') {
      return (
        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
          ✓ Purchased
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
        <FiLock /> Locked
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Video not found</h1>
          <Link href="/videos" className="text-purple-400 hover:underline">
            ← Back to videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 pt-16 md:pt-24 pb-24 md:pb-6">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Video Player */}
          {watchData ? (
            <VideoPlayer
              videoId={videoId}
              videoUrl={watchData.video_url}
              duration={video.duration}
              accessTier={watchData.access_tier}
              durationAllowed={watchData.duration_allowed !== video.duration ? watchData.duration_allowed : undefined}
              onEnded={() => {
                if (access?.purchase_required) {
                  toast('Preview ended. Purchase to watch full video.', {
                    icon: '🎬',
                    duration: 5000
                  });
                }
              }}
            />
          ) : (
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FiLock size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-white text-xl mb-2">{access?.error || 'Video locked'}</p>
                {access?.purchase_required && (
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {isPurchasing ? 'Processing...' : `Purchase for ${video.price} SOL`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Video Info */}
          <div className="mt-6 bg-gray-800/50 backdrop-blur rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
                {getAccessBadge()}
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 text-gray-400">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <FiEye />
                    <span className="font-semibold">{video.views_count.toLocaleString()}</span>
                  </div>
                  <div className="text-xs">views</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <FiHeart />
                    <span className="font-semibold">{video.likes_count.toLocaleString()}</span>
                  </div>
                  <div className="text-xs">likes</div>
                </div>
              </div>
            </div>

            {/* Artist */}
            <Link
              href={`/artists/${video.artist.id}`}
              className="flex items-center gap-3 mb-4 hover:bg-gray-700/50 rounded-lg p-2 transition-colors"
            >
              {video.artist.avatar_url ? (
                <img
                  src={video.artist.avatar_url}
                  alt={video.artist.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                  <FiUser className="text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{video.artist.name}</span>
                  {video.artist.verified && <span className="text-blue-500">✓</span>}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <FiCalendar size={12} />
                  {formatDate(video.published_at)}
                </div>
              </div>
            </Link>

            {/* Description */}
            {video.description && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {video.description}
              </div>
            )}

            {/* Purchase CTA */}
            {!access?.allowed && access?.purchase_required && (
              <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Unlock Full Video</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Get lifetime access to this video</p>
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap"
                  >
                    {isPurchasing ? 'Processing...' : `Buy for ${video.price} SOL`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="mt-6">
            <CommentSection
              contentType="Video"
              contentId={videoId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

