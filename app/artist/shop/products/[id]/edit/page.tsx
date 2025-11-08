'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiCheck, FiFileText, FiSettings, FiTag, FiPackage } from 'react-icons/fi';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    inventory_count: '',
    category: '',
    tags: [] as string[],
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/shop/merch/${params.id}`);
        const product = response.data.merch_item;
        
        setProductData({
          title: product.title || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          inventory_count: product.inventory_count?.toString() || '',
          category: product.category || '',
          tags: product.tags || [],
        });
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        router.push('/artist/shop/products');
      } finally {
        setFetchingProduct(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Product Name *
        </label>
        <input
          type="text"
          value={productData.title}
          onChange={(e) => setProductData({ ...productData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description *
        </label>
        <textarea
          value={productData.description}
          onChange={(e) => setProductData({ ...productData, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Price (SOL) *
          </label>
          <input
            type="number"
            step="0.01"
            value={productData.price}
            onChange={(e) => setProductData({ ...productData, price: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Inventory Count *
          </label>
          <input
            type="number"
            value={productData.inventory_count}
            onChange={(e) => setProductData({ ...productData, inventory_count: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{productData.title}</h3>
        <p className="text-2xl font-bold text-purple-600 mt-2">{productData.price} SOL</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {productData.inventory_count} in stock
        </p>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/artist/merch/${params.id}`, {
        merch_item: {
          title: productData.title,
          description: productData.description,
          price: parseFloat(productData.price),
          inventory_count: parseInt(productData.inventory_count),
        },
      });
      toast.success('Product updated!');
      router.push(`/shop/merch/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Product Info',
      description: 'Update product details',
      icon: <FiFileText className="w-6 h-6" />,
      component: <BasicInfoStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Save changes',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (fetchingProduct) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard resource="MerchItem" action="update">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push(`/shop/merch/${params.id}`)}
          title="Edit Product"
          subtitle="Update product details"
        />
      </div>
    </PermissionGuard>
  );
}

