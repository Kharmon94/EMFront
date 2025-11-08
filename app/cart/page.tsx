'use client';

export const dynamic = 'force-dynamic';

import { Navigation } from '@/components/Navigation';
import { useCart } from '@/lib/useCart';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, itemCount, cartTotal } = useCart();

  // Group items by artist
  const itemsByArtist = cart.reduce((acc, item) => {
    const key = item.artist_id;
    if (!acc[key]) {
      acc[key] = {
        artist_id: item.artist_id,
        artist_name: item.artist_name || 'Unknown Artist',
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<number, { artist_id: number; artist_name: string; items: typeof cart }>);

  const sellers = Object.values(itemsByArtist);

  if (cart.length === 0) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <FiShoppingCart className="w-20 h-20 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Add some items to get started</p>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Browse Shop
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-6 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {sellers.map((seller) => {
                const sellerTotal = seller.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
                
                return (
                  <div key={seller.artist_id} className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Sold by: {seller.artist_name}
                    </h2>

                    <div className="space-y-4">
                      {seller.items.map((item) => (
                        <div key={`${item.merch_item_id}-${item.variant_id || 0}`} className="flex gap-4">
                          {/* Image */}
                          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded flex-shrink-0">
                            {item.image && (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.title}</h3>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                              {formatCurrency((item.price || 0) * item.quantity)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item.merch_item_id, item.quantity - 1, item.variant_id)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.merch_item_id, item.quantity + 1, item.variant_id)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeFromCart(item.merch_item_id, item.variant_id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700 flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Seller Subtotal:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(sellerTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Shipping</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-300 dark:border-gray-700 mb-6">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block text-center mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

