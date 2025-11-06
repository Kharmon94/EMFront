'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiPackage, FiAlertTriangle, FiEdit2, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ArtistInventoryPage() {
  const queryClient = useQueryClient();
  const [stockFilter, setStockFilter] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['artist-inventory', stockFilter],
    queryFn: () => api.get('/artist/inventory', {
      params: { stock_status: stockFilter || undefined }
    }).then(res => res.data)
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ itemId, quantity, type }: any) =>
      api.patch(`/artist/inventory/${itemId}/adjust`, {
        adjustment_type: type,
        quantity: parseInt(quantity)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-inventory'] });
      toast.success('Inventory updated');
      setEditingItem(null);
      setNewQuantity('');
    },
    onError: () => {
      toast.error('Failed to update inventory');
    }
  });

  const items = data?.items || [];
  const alerts = data?.alerts || {};

  const handleStockUpdate = (item: any, type: 'set' | 'add' | 'subtract') => {
    if (!newQuantity || parseInt(newQuantity) < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    adjustStockMutation.mutate({
      itemId: item.id,
      quantity: newQuantity,
      type
    });
  };

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-6 pb-24 md:pb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Inventory Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage stock levels and alerts</p>
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FiPackage className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-yellow-300 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{alerts.low_stock_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-red-300 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiPackage className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{alerts.out_of_stock_count || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setStockFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !stockFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                stockFilter === 'in_stock'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                stockFilter === 'low'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-yellow-500'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                stockFilter === 'out'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-500'
              }`}
            >
              Out of Stock
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" /></td>
                      </tr>
                    ))
                  ) : items.length > 0 ? (
                    items.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {item.images && (
                              <img
                                src={item.images}
                                alt={item.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                            {item.sku || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {editingItem?.id === item.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(e.target.value)}
                                className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
                                placeholder={item.inventory_count}
                              />
                              <button
                                onClick={() => handleStockUpdate(item, 'set')}
                                className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {item.inventory_count}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {item.in_stock ? (
                            item.low_stock ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                In Stock
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setNewQuantity(item.inventory_count.toString());
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No products found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}

