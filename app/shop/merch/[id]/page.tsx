'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { AddToCartButton } from '@/components/AddToCartButton';
import { 
  FiShoppingCart, 
  FiCheckCircle, 
  FiMinus, 
  FiPlus,
  FiShare2,
  FiHeart
} from 'react-icons/fi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MerchDetailPage() {
  const params = useParams();
  const merchId = params.id as string;
  
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['merch', merchId],
    queryFn: () => api.getMerchItem(parseInt(merchId)),
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500">Item not found</div>
        </div>
      </>
    );
  }

  const { merch_item } = data;
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
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
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
                      className={`aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 transition-colors ${
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
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
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
                  <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                  <p className="text-gray-300 whitespace-pre-wrap">
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
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiHeart className="w-5 h-5" />
                    Save
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShare2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
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

