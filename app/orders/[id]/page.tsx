'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiExternalLink } from 'react-icons/fi';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then(res => res.data)
  });

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

  const order = data?.order;

  if (!order) {
    return (
      <PermissionGuard require="auth" redirectTo="/">
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Order not found</div>
        </div>
      </PermissionGuard>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'shipped': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Confirmed!</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Your order has been successfully placed.
                </p>
              </div>
            </div>
          </div>

          {/* Order Header */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Order #{order.id}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {order.cart_order_info && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Multi-vendor order</strong> - This order is part of cart order #{order.cart_order_info.id}
                </p>
                {order.cart_order_info.transaction_signature && (
                  <a
                    href={`https://solscan.io/tx/${order.cart_order_info.transaction_signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View blockchain transaction <FiExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shipping Address</h2>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p>{order.shipping_address.name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
          )}

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiTruck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tracking Information</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Carrier:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{order.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tracking Number:</span>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{order.tracking_number}</span>
                </div>
                {order.shipped_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shipped on:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(order.shipped_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FiPackage className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Items</h2>
            </div>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {item.merch_item.images?.[0] && (
                      <img
                        src={item.merch_item.images[0]}
                        alt={item.merch_item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.merch_item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              {order.shipping_fee > 0 && (
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                <span>Total:</span>
                <span>{formatCurrency(order.seller_amount || order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/orders"
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold text-center transition-colors"
            >
              View All Orders
            </Link>
            <Link
              href="/shop"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}

