'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', filter],
    queryFn: () => api.getMyOrders({
      status: filter === 'all' ? undefined : filter,
    }),
  });

  const orders = data?.orders || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'shipped':
        return <FiTruck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <FiPackage className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <FiPackage className="w-8 h-8" />
              My Orders
            </h1>
            <p className="text-gray-400 text-lg">
              Track and manage your purchases
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {(['all', 'pending', 'shipped', 'delivered'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-800/30 rounded-lg p-6">
                  <div className="h-4 bg-gray-800 rounded w-1/4 mb-3" />
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  getStatusIcon={getStatusIcon}
                  getStatusText={getStatusText}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiPackage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No orders found</p>
              <p className="text-gray-500 text-sm">
                Your orders will appear here after you make a purchase
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function OrderCard({ 
  order, 
  isExpanded, 
  onToggle, 
  getStatusIcon, 
  getStatusText 
}: { 
  order: any; 
  isExpanded: boolean; 
  onToggle: () => void; 
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusText: (status: string) => string;
}) {
  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
      {/* Order Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-400 text-sm">Order #{order.id}</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                <span className={`text-sm font-medium ${
                  order.status === 'delivered' ? 'text-green-500' :
                  order.status === 'shipped' ? 'text-blue-500' :
                  order.status === 'pending' ? 'text-yellow-500' :
                  'text-gray-500'
                }`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              Ordered on {formatDate(order.created_at)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-400 text-sm">Total</div>
              <div className="text-white font-bold text-lg">
                {formatCurrency(order.total)}
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <FiChevronUp className="w-5 h-5" />
              ) : (
                <FiChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Order Preview (first 2 items) */}
        {!isExpanded && order.items && order.items.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FiPackage className="w-4 h-4" />
            <span>
              {order.items[0].orderable_type === 'MerchItem' ? 'Merch' : 'Pass'}
              {order.items.length > 1 && ` + ${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}`}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 sm:p-6 space-y-6">
          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {item.orderable?.title || item.orderable?.name || 'Item'}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Qty: {item.quantity || 1}
                      </div>
                    </div>
                    <div className="text-white font-semibold">
                      {formatCurrency(item.price || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div>
              <h3 className="text-white font-semibold mb-3">Shipping To:</h3>
              <div className="p-4 bg-gray-800/50 rounded-lg text-gray-300 space-y-1 text-sm">
                <p className="font-medium text-white">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                <p>
                  {order.shipping_address.city}
                  {order.shipping_address.state && `, ${order.shipping_address.state}`} {order.shipping_address.zip_code}
                </p>
                {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
              </div>
            </div>
          )}

          {/* Tracking Info */}
          {order.tracking_number && (
            <div>
              <h3 className="text-white font-semibold mb-2">Tracking</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Tracking Number:</span>
                <span className="text-white font-mono">{order.tracking_number}</span>
              </div>
            </div>
          )}

          {/* Transaction */}
          {order.transaction_signature && (
            <div>
              <h3 className="text-white font-semibold mb-2">Transaction</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Signature:</span>
                <span className="text-white font-mono text-xs truncate max-w-xs">
                  {order.transaction_signature}
                </span>
              </div>
            </div>
          )}

          {/* Order Total Breakdown */}
          <div className="border-t border-gray-700 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal || (order.total - 10))}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>{formatCurrency(10)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-base border-t border-gray-700 pt-2">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

