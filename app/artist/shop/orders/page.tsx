'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiClock, FiX, FiSearch, FiFilter,
  FiDownload, FiMessageCircle, FiEye, FiCalendar, FiDollarSign, FiShoppingCart
} from 'react-icons/fi';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ArtistOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['artist-orders', statusFilter, searchQuery],
    queryFn: () => api.get('/artist/orders', {
      params: { status: statusFilter || undefined, q: searchQuery || undefined }
    }).then(res => res.data)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, trackingNumber, carrier }: any) =>
      api.patch(`/artist/orders/${orderId}/update_status`, { status, tracking_number: trackingNumber, carrier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-orders'] });
      toast.success('Order status updated');
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error('Failed to update order');
    }
  });

  const orders = data?.orders || [];
  const stats = data?.stats || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'paid': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleMarkShipped = () => {
    if (!trackingNumber || !carrier) {
      toast.error('Please provide tracking number and carrier');
      return;
    }
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: 'shipped',
      trackingNumber,
      carrier
    });
  };

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Shop Orders</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your merchandise orders</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={FiShoppingCart}
              label="Total Orders"
              value={stats.total_orders || 0}
              color="blue"
            />
            <StatCard
              icon={FiDollarSign}
              label="Total Revenue"
              value={formatCurrency(stats.total_revenue || 0)}
              color="green"
            />
            <StatCard
              icon={FiClock}
              label="Pending Fulfillment"
              value={stats.pending_fulfillment || 0}
              color="yellow"
            />
            <StatCard
              icon={FiTruck}
              label="Shipped This Week"
              value={stats.shipped_this_week || 0}
              color="purple"
            />
            <StatCard
              icon={FiPackage}
              label="Avg Order Value"
              value={formatCurrency(stats.avg_order_value || 0)}
              color="blue"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white cursor-pointer min-w-[200px]"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => {
                window.open(`/artist/orders/export?status=${statusFilter}`, '_blank');
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              <span className="hidden sm:inline text-gray-900 dark:text-white">Export CSV</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4"><div className="h-4 bg-white dark:bg-gray-800 rounded w-20" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white dark:bg-gray-800 rounded w-32" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white dark:bg-gray-800 rounded w-24" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white dark:bg-gray-800 rounded w-12" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white dark:bg-gray-800 rounded w-16" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white dark:bg-gray-800 rounded w-20" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white dark:bg-gray-800 rounded w-24" /></td>
                      </tr>
                    ))
                  ) : orders.length > 0 ? (
                    orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-gray-900 dark:text-white font-semibold">
                            {order.order_number}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                            {order.customer.email || order.customer.wallet_address?.slice(0, 8) + '...'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.item_count}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(order.total_amount)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={(status: string) => {
            if (status === 'shipped') {
              if (!trackingNumber || !carrier) return;
              updateStatusMutation.mutate({
                orderId: selectedOrder.id,
                status,
                trackingNumber,
                carrier
              });
            } else {
              updateStatusMutation.mutate({
                orderId: selectedOrder.id,
                status
              });
            }
          }}
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          carrier={carrier}
          setCarrier={setCarrier}
        />
      )}
    </PermissionGuard>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdate, trackingNumber, setTrackingNumber, carrier, setCarrier }: {
  order: any;
  onClose: () => void;
  onUpdate: (status: string) => void;
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  carrier: string;
  setCarrier: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{order.order_number}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer</h3>
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-900 dark:text-white">{order.customer.email || 'No email'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {order.customer.wallet_address || 'No wallet'}
              </p>
              <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Message Customer
              </button>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items</h3>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3">
                  {item.merch_item.images?.[0] && (
                    <img
                      src={item.merch_item.images[0]}
                      alt={item.merch_item.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.merch_item.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment Actions */}
          {order.status === 'paid' || order.status === 'processing' ? (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Fulfillment</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="">Select Carrier</option>
                  <option value="USPS">USPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                </select>
                <div className="flex gap-2">
                  {order.status === 'paid' && (
                    <button
                      onClick={() => onUpdate('processing')}
                      className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Mark as Processing
                    </button>
                  )}
                  <button
                    onClick={() => onUpdate('shipped')}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Mark as Shipped
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tracking Info</h3>
              <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-900 dark:text-white">
                  Carrier: <span className="font-medium">{order.carrier || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  Tracking: <span className="font-medium">{order.tracking_number || 'N/A'}</span>
                </p>
                {order.shipped_at && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Shipped on {formatDate(order.shipped_at)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

