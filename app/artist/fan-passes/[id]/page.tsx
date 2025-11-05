'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiDollarSign, FiCalendar, FiSend, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ArtistFanPassManagementPage() {
  const params = useParams();
  const fanPassId = parseInt(params.id as string);
  const [distributing, setDistributing] = useState(false);
  const [revenueData, setRevenueData] = useState({
    streaming: 0,
    sales: 0,
    merch: 0,
    events: 0,
    tokens: 0,
  });

  const { data: passData, refetch: refetchPass } = useQuery({
    queryKey: ['fanPass', fanPassId],
    queryFn: () => api.getFanPass(fanPassId),
  });

  const { data: holdersData, refetch: refetchHolders } = useQuery({
    queryKey: ['fanPassHolders', fanPassId],
    queryFn: () => api.getFanPassHolders(fanPassId),
  });

  const { data: dividendsData, refetch: refetchDividends } = useQuery({
    queryKey: ['fanPassDividends', fanPassId],
    queryFn: () => api.getFanPassDividends(fanPassId),
  });

  if (!passData) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </>
    );
  }

  const fanPass = passData.fan_pass;
  const holders = holdersData?.holders || [];
  const dividends = dividendsData?.dividends || [];
  const summary = dividendsData?.summary || {};

  const handleDistributeDividends = async () => {
    const totalRevenue = Object.values(revenueData).reduce((a, b) => a + b, 0);
    if (totalRevenue === 0) {
      toast.error('Please enter revenue amounts');
      return;
    }

    setDistributing(true);
    try {
      const result = await api.distributeDividends(fanPassId, {
        revenue_by_source: revenueData,
      });

      toast.success(result.message);
      refetchDividends();
      
      // Reset form
      setRevenueData({
        streaming: 0,
        sales: 0,
        merch: 0,
        events: 0,
        tokens: 0,
      });
    } catch (error: any) {
      console.error('Distribution error:', error);
      toast.error(error.response?.data?.error || 'Failed to distribute dividends');
    }
    setDistributing(false);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{fanPass.name}</h1>
            <p className="text-gray-400">{fanPass.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Total Minted</div>
              <div className="text-3xl font-bold text-white">
                {fanPass.minted_count}/{fanPass.max_supply}
              </div>
              <div className="text-sm text-green-500 mt-1">
                {((fanPass.minted_count / fanPass.max_supply) * 100).toFixed(0)}% sold
              </div>
            </div>

            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Active Holders</div>
              <div className="text-3xl font-bold text-white">{holders.length}</div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600/50 rounded-lg">
              <div className="text-sm text-purple-300 mb-1">Dividend Rate</div>
              <div className="text-3xl font-bold text-purple-400">{fanPass.dividend_percentage}%</div>
            </div>

            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Total Distributed</div>
              <div className="text-3xl font-bold text-green-500">
                {formatCurrency(summary.total_distributed || 0)}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Distribute Dividends */}
            {fanPass.dividend_percentage > 0 && (
              <section className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5" />
                  Distribute Dividends
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Enter your revenue from the past month to calculate and distribute dividends to holders
                </p>

                <div className="space-y-4 mb-6">
                  {fanPass.revenue_sources.map((source: string) => (
                    <div key={source}>
                      <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                        {source} Revenue (SOL)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        value={revenueData[source as keyof typeof revenueData] || ''}
                        onChange={(e) => setRevenueData({
                          ...revenueData,
                          [source]: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  ))}
                </div>

                {/* Calculator */}
                {Object.values(revenueData).some(v => v > 0) && (
                  <div className="p-4 bg-gray-900/50 rounded-lg mb-6">
                    <h4 className="text-sm font-semibold text-purple-300 mb-3">Distribution Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Total Revenue:</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(Object.values(revenueData).reduce((a, b) => a + b, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Dividend Pool ({fanPass.dividend_percentage}%):</span>
                        <span className="font-semibold text-purple-400">
                          {formatCurrency(Object.values(revenueData).reduce((a, b) => a + b, 0) * fanPass.dividend_percentage / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Per Holder ({holders.length} holders):</span>
                        <span className="font-semibold text-purple-400">
                          {formatCurrency(holders.length > 0 ? (Object.values(revenueData).reduce((a, b) => a + b, 0) * fanPass.dividend_percentage / 100 / holders.length) : 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-400 border-t border-gray-700 pt-2 mt-2">
                        <span>You Keep:</span>
                        <span className="font-bold">
                          {formatCurrency(Object.values(revenueData).reduce((a, b) => a + b, 0) * (100 - fanPass.dividend_percentage) / 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDistributeDividends}
                  disabled={distributing || Object.values(revenueData).every(v => v === 0)}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {distributing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Distributing...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      Calculate & Distribute Dividends
                    </>
                  )}
                </button>
              </section>
            )}

            {/* Dividend History */}
            <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                Recent Distributions
              </h2>

              {dividends.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dividends.slice(0, 10).map((dividend: any) => (
                    <div key={dividend.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {formatCurrency(dividend.amount)}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {dividend.source}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          dividend.status === 'paid' ? 'bg-green-600/30 text-green-400' :
                          dividend.status === 'pending' ? 'bg-yellow-600/30 text-yellow-400' :
                          'bg-red-600/30 text-red-400'
                        }`}>
                          {dividend.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(dividend.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiCalendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No distributions yet</p>
                </div>
              )}
            </section>
          </div>

          {/* Holders Table */}
          <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5" />
              Holders ({holders.length})
            </h2>

            {holders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="pb-3">Edition</th>
                      <th className="pb-3">Wallet</th>
                      <th className="pb-3">Total Earned</th>
                      <th className="pb-3">Last Payment</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {holders.map((holder: any) => (
                      <tr key={holder.edition_number} className="border-b border-gray-800">
                        <td className="py-3 font-semibold text-white">
                          #{holder.edition_number}
                        </td>
                        <td className="py-3 font-mono text-xs">
                          {holder.owner.substring(0, 8)}...{holder.owner.substring(holder.owner.length - 6)}
                        </td>
                        <td className="py-3 text-green-500 font-semibold">
                          {formatCurrency(holder.total_earned || 0)}
                        </td>
                        <td className="py-3 text-xs">
                          {holder.last_payment ? new Date(holder.last_payment).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            holder.status === 'active' ? 'bg-green-600/30 text-green-400' :
                            'bg-gray-700 text-gray-400'
                          }`}>
                            {holder.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No holders yet</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

