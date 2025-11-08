'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface VariantManagerProps {
  merchItemId: number;
  variants: any[];
}

export function VariantManager({ merchItemId, variants: initialVariants }: VariantManagerProps) {
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState(initialVariants);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    size: '',
    color: '',
    material: '',
    price_modifier: '0',
    inventory_count: '0',
    low_stock_threshold: '5'
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/merch/${merchItemId}/variants`, { product_variant: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-products'] });
      toast.success('Variant created');
      setAdding(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/variants/${id}`, { product_variant: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-products'] });
      toast.success('Variant updated');
      setEditing(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/variants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-products'] });
      toast.success('Variant deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      sku: '',
      size: '',
      color: '',
      material: '',
      price_modifier: '0',
      inventory_count: '0',
      low_stock_threshold: '5'
    });
  };

  const handleSave = () => {
    const data = {
      ...formData,
      price_modifier: parseFloat(formData.price_modifier),
      inventory_count: parseInt(formData.inventory_count),
      low_stock_threshold: parseInt(formData.low_stock_threshold)
    };

    if (editing) {
      updateMutation.mutate({ id: editing, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Variants</h3>
        <button
          onClick={() => {
            setAdding(true);
            resetForm();
          }}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center gap-1"
        >
          <FiPlus className="w-4 h-4" />
          Add Variant
        </button>
      </div>

      {/* Variant List */}
      <div className="space-y-2 mb-4">
        {variants.map((variant: any) => (
          <div key={variant.id} className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{variant.variant_name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                SKU: {variant.sku} | Stock: {variant.inventory_count} | +${variant.price_modifier}
              </p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(variant.id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(adding || editing) && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="SKU *"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Material"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price Modifier"
              value={formData.price_modifier}
              onChange={(e) => setFormData({ ...formData, price_modifier: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Inventory *"
              value={formData.inventory_count}
              onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setEditing(null);
                resetForm();
              }}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.sku || !formData.inventory_count}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <FiCheck className="w-4 h-4" />
              Save Variant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

