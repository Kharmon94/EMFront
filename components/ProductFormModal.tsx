'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiSave, FiPlus } from 'react-icons/fi';
import { VariantManager } from './VariantManager';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any; // If editing
  artistId: number;
}

export function ProductFormModal({ isOpen, onClose, product, artistId }: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    inventory_count: '',
    sku: '',
    brand: '',
    product_category_id: '',
    low_stock_threshold: '5',
    weight: '',
    images: [] as string[],
    product_tag_ids: [] as number[]
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories?include_all=true').then(res => res.data)
  });

  const { data: tagsData } = useQuery({
    queryKey: ['product-tags'],
    queryFn: () => api.get('/product_tags').then(res => res.data)
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        inventory_count: product.inventory_count?.toString() || '',
        sku: product.sku || '',
        brand: product.brand || '',
        product_category_id: product.category?.id?.toString() || '',
        low_stock_threshold: product.low_stock_threshold?.toString() || '5',
        weight: product.weight?.toString() || '',
        images: product.images || [],
        product_tag_ids: product.tags?.map((t: any) => t.id) || []
      });
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (product) {
        return api.patch(`/merch/${product.id}`, { merch_item: data });
      } else {
        return api.post('/merch', { merch_item: data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-products'] });
      queryClient.invalidateQueries({ queryKey: ['merch'] });
      toast.success(product ? 'Product updated' : 'Product created');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to save product');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      inventory_count: parseInt(formData.inventory_count),
      low_stock_threshold: parseInt(formData.low_stock_threshold),
      weight: formData.weight ? parseFloat(formData.weight) : null
    });
  };

  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Inventory Count *
              </label>
              <input
                type="number"
                required
                value={formData.inventory_count}
                onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Category
              </label>
              <select
                value={formData.product_category_id}
                onChange={(e) => setFormData({ ...formData, product_category_id: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="">Select a category...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Low Stock Alert
              </label>
              <input
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Variants */}
          {product && (
            <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
              <VariantManager merchItemId={product.id} variants={product.product_variants || []} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-300 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              {saveMutation.isPending ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

