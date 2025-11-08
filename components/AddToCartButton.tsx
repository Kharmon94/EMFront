'use client';

import { useState } from 'react';
import { FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '@/lib/useCart';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  merch_item: {
    id: number;
    title: string;
    price: number;
    images?: string[];
    in_stock?: boolean;
    inventory_count?: number;
    artist: {
      id: number;
      name: string;
    };
    product_variants?: any[];
    available_sizes?: string[];
    available_colors?: string[];
  };
  variant?: 'primary' | 'secondary' | 'small';
  showQuantity?: boolean;
}

export function AddToCartButton({ merch_item, variant = 'primary', showQuantity = true }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const hasVariants = merch_item.product_variants && merch_item.product_variants.length > 0;
  const inStock = merch_item.in_stock !== false && (merch_item.inventory_count || 0) > 0;

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('This item is out of stock');
      return;
    }

    if (hasVariants && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    addToCart({
      merch_item_id: merch_item.id,
      variant_id: selectedVariant?.id,
      quantity,
      artist_id: merch_item.artist.id,
      title: merch_item.title,
      price: selectedVariant ? selectedVariant.price : merch_item.price,
      image: merch_item.images?.[0],
      artist_name: merch_item.artist.name
    });

    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`);
    setQuantity(1);
  };

  const buttonClasses = {
    primary: 'w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2',
    secondary: 'px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2',
    small: 'px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1'
  };

  return (
    <div className="space-y-3">
      {/* Variant Selection */}
      {hasVariants && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Select Variant
          </label>
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variant = merch_item.product_variants?.find(v => v.id === parseInt(e.target.value));
              setSelectedVariant(variant);
            }}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="">Choose variant...</option>
            {merch_item.product_variants?.map((variant: any) => (
              <option key={variant.id} value={variant.id} disabled={!variant.in_stock}>
                {variant.variant_name} - ${variant.price.toFixed(2)} 
                {!variant.in_stock && ' (Out of Stock)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity Selector */}
      {showQuantity && inStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Quantity:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white transition-colors"
              disabled={quantity <= 1}
            >
              <FiMinus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min((merch_item.inventory_count || 99), quantity + 1))}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white transition-colors"
              disabled={quantity >= (merch_item.inventory_count || 99)}
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!inStock || (hasVariants && !selectedVariant)}
        className={buttonClasses[variant] + ((!inStock || (hasVariants && !selectedVariant)) ? ' opacity-50 cursor-not-allowed' : '')}
      >
        <FiShoppingCart className="w-5 h-5" />
        <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
      </button>
    </div>
  );
}

