'use client';

import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { FiTrendingUp, FiDollarSign, FiUsers, FiMusic, FiActivity } from 'react-icons/fi';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Line } from 'react-chartjs-2';

export default function PlatformPage() {
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/platform/metrics?period=30d`);
      return response.json();
    },
  });

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['platform-token'],
    queryFn: async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/platform/token`);
      return response.json();
    },
  });

  const metrics = metricsData?.metrics?.current_period;
  const token = tokenData?.token;
  const economics = tokenData?.economics;
  const accrual = tokenData?.accrual_mechanism;

  // Prepare chart data
  const chartData = {
    labels: metricsData?.metrics?.daily_data?.map((d: any) => new Date(d.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Daily Volume',
        data: metricsData?.metrics?.daily_data?.map((d: any) => d.volume) || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Platform Economics
            </h1>
            <p className="text-gray-400 text-lg">
              Transparent metrics and platform token information
            </p>
          </div>

          {/* Platform Token Info */}
          {token && (
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-6 sm:p-8 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="text-sm text-purple-300 mb-2">Platform Token</div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    ${token.symbol}
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Price</div>
                      <div className="text-xl font-semibold text-white">
                        {formatCurrency(token.price_usd)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                      <div className="text-xl font-semibold text-white">
                        {formatCurrency(token.market_cap)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Circulating Supply</div>
                      <div className="text-lg font-semibold text-white">
                        {formatNumber(token.circulating_supply, 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">APY</div>
                      <div className="text-lg font-semibold text-green-500">
                        {token.apy}%
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full md:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
                  Buy ${token.symbol}
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<FiDollarSign className="w-6 h-6" />}
                label="Total Volume (30d)"
                value={formatCurrency(metrics.total_volume || 0)}
                color="purple"
              />
              <StatCard
                icon={<FiTrendingUp className="w-6 h-6" />}
                label="Fees Collected (30d)"
                value={formatCurrency(metrics.total_fees || 0)}
                color="green"
              />
              <StatCard
                icon={<FiUsers className="w-6 h-6" />}
                label="Active Users"
                value={formatNumber(metrics.active_users || 0, 0)}
                color="blue"
              />
              <StatCard
                icon={<FiMusic className="w-6 h-6" />}
                label="Total Streams (30d)"
                value={formatNumber(metrics.total_streams || 0, 0)}
                color="pink"
              />
            </div>
          )}

          {/* Volume Chart */}
          {!metricsLoading && metricsData?.metrics?.daily_data && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Platform Volume (30 days)</h3>
              <div className="h-64">
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                      y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Fee Economics */}
          {economics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Fee Allocation */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Fee Allocation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Buyback & Burn</span>
                    <span className="text-white font-semibold">{economics.fee_allocation.buyback_burn}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Treasury</span>
                    <span className="text-white font-semibold">{economics.fee_allocation.treasury}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Creator Rewards</span>
                    <span className="text-white font-semibold">{economics.fee_allocation.creator_rewards}%</span>
                  </div>
                </div>
              </div>

              {/* Fee Sources */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Fee Sources</h3>
                <div className="space-y-2 text-sm">
                  {economics.fee_sources.map((source: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{source.source}</span>
                      <span className="text-purple-400 font-semibold">{source.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accrual Mechanism */}
          {accrual && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">How Platform Value Accrues</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-purple-400 font-semibold mb-2">Buyback</div>
                  <p className="text-sm text-gray-300">{accrual.buyback}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-pink-400 font-semibold mb-2">Burn</div>
                  <p className="text-sm text-gray-300">{accrual.burn}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-green-400 font-semibold mb-2">Rewards</div>
                  <p className="text-sm text-gray-300">{accrual.rewards}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="text-blue-400 font-semibold mb-2">Treasury</div>
                  <p className="text-sm text-gray-300">{accrual.treasury}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-700',
    green: 'from-green-600 to-green-700',
    blue: 'from-blue-600 to-blue-700',
    pink: 'from-pink-600 to-pink-700',
  }[color] || 'from-gray-600 to-gray-700';

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

