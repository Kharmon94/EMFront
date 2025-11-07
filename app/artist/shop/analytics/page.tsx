'use client';

import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { 
  FiDollarSign, FiTrendingUp, FiPackage, FiUsers, FiShoppingCart,
  FiDownload, FiStar, FiEye, FiBarChart2
} from 'react-icons/fi';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function ArtistShopAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artist-shop-analytics'],
    queryFn: () => api.get('/artist/shop_analytics').then(res => res.data)
  });

  const revenue = data?.revenue || {};
  const products = data?.products || {};
  const customers = data?.customers || {};
  const conversion = data?.conversion || {};

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Shop Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your shop performance</p>
            </div>
            <button
              onClick={() => window.open('/artist/shop_analytics/export', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">Export Data</span>
            </button>
          </div>

          {/* Revenue Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Revenue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard
                icon={FiDollarSign}
                label="Total Revenue"
                value={formatCurrency(revenue.total_revenue || 0)}
                color="green"
              />
              <AnalyticsCard
                icon={FiTrendingUp}
                label="This Month"
                value={formatCurrency(revenue.revenue_this_month || 0)}
                color="blue"
              />
              <AnalyticsCard
                icon={FiShoppingCart}
                label="This Week"
                value={formatCurrency(revenue.revenue_this_week || 0)}
                color="purple"
              />
              <AnalyticsCard
                icon={FiBarChart2}
                label="Avg Order Value"
                value={formatCurrency(revenue.avg_order_value || 0)}
                color="yellow"
              />
            </div>
          </div>

          {/* Product Performance */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Product Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard
                icon={FiPackage}
                label="Total Products"
                value={products.total_products || 0}
                color="blue"
              />
              <AnalyticsCard
                icon={FiStar}
                label="Avg Rating"
                value={(products.avg_rating || 0).toFixed(1)}
                color="yellow"
              />
              <AnalyticsCard
                icon={FiEye}
                label="Total Reviews"
                value={products.total_reviews || 0}
                color="purple"
              />
              <AnalyticsCard
                icon={FiPackage}
                label="Low Stock Items"
                value={products.low_stock_products || 0}
                color="red"
              />
            </div>
          </div>

          {/* Best Sellers */}
          {products.best_sellers && products.best_sellers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Best Sellers</h2>
              <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Sales</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.best_sellers.slice(0, 10).map((product: any, index: number) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{product.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900 dark:text-white">{product.purchase_count}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(product.revenue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customer Analytics */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnalyticsCard
                icon={FiUsers}
                label="Total Customers"
                value={customers.total_customers || 0}
                color="blue"
              />
              <AnalyticsCard
                icon={FiTrendingUp}
                label="Repeat Customers"
                value={customers.repeat_customers || 0}
                color="green"
              />
              <AnalyticsCard
                icon={FiUsers}
                label="New This Month"
                value={customers.new_customers_this_month || 0}
                color="purple"
              />
            </div>
          </div>

          {/* Conversion Stats */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Conversion</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnalyticsCard
                icon={FiEye}
                label="Total Views"
                value={conversion.total_views || 0}
                color="blue"
              />
              <AnalyticsCard
                icon={FiShoppingCart}
                label="Total Purchases"
                value={conversion.total_purchases || 0}
                color="green"
              />
              <AnalyticsCard
                icon={FiTrendingUp}
                label="Conversion Rate"
                value={`${conversion.conversion_rate || 0}%`}
                color="purple"
              />
            </div>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}

function AnalyticsCard({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' 
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

