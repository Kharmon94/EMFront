'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiHeart, FiTrash2, FiShoppingCart, FiShare2, FiStar, FiShoppingBag } from 'react-icons/fi';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['wishlists'],
    queryFn: () => api.get('/wishlists').then(res => res.data),
  });

  const wishlist = data?.wishlists?.[0]; // Use first wishlist for now

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => 
      api.delete(`/wishlists/${wishlist.id}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      toast.success('Item removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove item');
    }
  });

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Wishlist link copied!');
  };

  if (isLoading) {
    return (
      <PermissionGuard require="auth" redirectTo="/">
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <FiHeart className="w-10 h-10 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {wishlist?.item_count || 0} items saved
              </p>
            </div>

            {wishlist && wishlist.item_count > 0 && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <FiShare2 className="w-4 h-4" />
                <span className="hidden sm:inline text-gray-900 dark:text-white">Share</span>
              </button>
            )}
          </div>

          {/* Wishlist Items */}
          {wishlist && wishlist.items && wishlist.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {wishlist.items.map((wishlistItem: any) => {
                const item = wishlistItem.merch_item;
                const image = item.images?.[0];

                return (
                  <div
                    key={wishlistItem.id}
                    className="group bg-white dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                  >
                    <Link href={`/shop/merch/${item.id}`} className="block">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                        {image ? (
                          <img
                            src={image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiShoppingBag className="w-12 h-12 text-gray-400" />
                          </div>
                        )}

                        {!item.in_stock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">OUT OF STOCK</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {item.title}
                        </h3>

                        <div className="text-base font-bold text-gray-900 dark:text-white mb-2">
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="px-3 pb-3 flex gap-2">
                      <button
                        onClick={() => removeItemMutation.mutate(wishlistItem.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-sm font-medium transition-colors"
                        disabled={removeItemMutation.isPending}
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save items you love to buy them later
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <FiShoppingBag className="w-5 h-5" />
                Browse Shop
              </Link>
            </div>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}

