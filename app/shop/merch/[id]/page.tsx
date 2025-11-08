'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ReviewForm } from '@/components/ReviewForm';
import { usePermissions } from '@/lib/usePermissions';
import { 
  FiShoppingCart, 
  FiCheckCircle, 
  FiMinus, 
  FiPlus,
  FiShare2,
  FiHeart,
  FiStar,
  FiMessageCircle,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MerchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const merchId = params.id as string;
  const { user } = usePermissions();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['merch', merchId],
    queryFn: () => api.getMerchItem(parseInt(merchId)),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', merchId],
    queryFn: () => api.get('/reviews', { params: { merch_item_id: merchId } }).then(res => res.data)
  });

  const merch_item = data?.merch_item;
  const related_products = data?.related_products || [];
  const reviews = reviewsData?.reviews || [];

  const handleMessageSeller = async () => {
    if (!user) {
      toast.error('Please sign in to message the seller');
      return;
    }
    
    try {
      const response = await api.post('/conversations', {
        recipient_id: merch_item.artist.user_id || merch_item.artist.id,
        subject: `Question about ${merch_item.title}`
      });
      router.push('/messages');
      toast.success('Conversation started');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-gray-900 dark:text-white">Loading...</div>
        </div>
      </>
    );
  }

  if (error || !merch_item) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Item not found</div>
        </div>
      </>
    );
  }

  const images = merch_item.images || [];
  const hasVariants = merch_item.variants && Object.keys(merch_item.variants).length > 0;

  // Cart functionality is now handled by AddToCartButton component

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleLike = () => {
    toast.error('Please connect your wallet to save items');
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={merch_item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiShoppingCart className="w-24 h-24 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-purple-500'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${merch_item.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Artist */}
              {merch_item.artist && (
                <Link
                  href={`/shop/${merch_item.artist.id}`}
                  className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {merch_item.artist.avatar_url && (
                    <img
                      src={merch_item.artist.avatar_url}
                      alt={merch_item.artist.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{merch_item.artist.name}</span>
                  {merch_item.artist.verified && (
                    <FiCheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </Link>
              )}

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {merch_item.title}
                </h1>
                <div className="text-3xl font-bold text-purple-400">
                  {formatCurrency(merch_item.price)}
                </div>
              </div>

              {/* Stock Status */}
              {merch_item.in_stock ? (
                <div className="flex items-center gap-2 text-green-500">
                  <FiCheckCircle className="w-5 h-5" />
                  <span>In Stock ({merch_item.inventory_count} available)</span>
                </div>
              ) : (
                <div className="text-red-500 font-semibold">
                  Out of Stock
                </div>
              )}

              {/* Description */}
              {merch_item.description && (
                <div className="border-t border-gray-800 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {merch_item.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-800 pt-6 space-y-3">
                <AddToCartButton merch_item={merch_item} variant="primary" showQuantity={true} />

                <div className="flex gap-3">
                  <button
                    onClick={handleLike}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiHeart className="w-5 h-5" />
                    Save
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShare2 className="w-5 h-5" />
                    Share
                  </button>
                  <button
                    onClick={handleMessageSeller}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related_products.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related_products.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/shop/merch/${item.id}`}
                    className="group bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-all"
                  >
                    <div className="aspect-square bg-gray-800 relative">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiShoppingCart className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h3>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(item.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </button>
              )}
            </div>

            {/* Rating Summary */}
            {merch_item.rating_count > 0 && (
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-gray-900 dark:text-white">{merch_item.rating_average?.toFixed(1)}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(merch_item.rating_average)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{merch_item.rating_count} reviews</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && user && (
              <div className="mb-6">
                <ReviewForm merchItemId={parseInt(merchId)} onSuccess={() => setShowReviewForm(false)} />
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{review.user.name}</p>
                        {review.verified_purchase && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {review.title && <h4 className="font-semibold text-white mb-2">{review.title}</h4>}
                  <p className="text-gray-700 dark:text-gray-300">{review.content}</p>

                  {/* Helpful Votes */}
                  <div className="flex items-center gap-4 mt-4">
                    <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-green-400">
                      <FiThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpful_count})</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-400">
                      <FiThumbsDown className="w-4 h-4" />
                      <span>Not helpful ({review.not_helpful_count})</span>
                    </button>
                  </div>

                  {/* Artist Response */}
                  {review.artist_response && (
                    <div className="mt-4 pl-4 border-l-2 border-blue-500 bg-blue-900/20 p-4 rounded">
                      <p className="text-sm font-semibold text-blue-400 mb-1">Response from {merch_item.artist.name}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{review.artist_response}</p>
                    </div>
                  )}
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>

          {/* Artist's Other Items */}
          {merch_item.artist && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                More from {merch_item.artist.name}
              </h2>
              <Link
                href={`/shop/${merch_item.artist.id}`}
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                View {merch_item.artist.name}'s Shop
              </Link>
            </div>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}

