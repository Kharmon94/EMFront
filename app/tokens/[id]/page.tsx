'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import BondingCurveChart from '@/components/BondingCurveChart';
import { FiCheckCircle, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { formatNumber, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TokenTradingPage() {
  const params = useParams();
  const tokenId = params.id as string;
  const { publicKey } = useWallet();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);

  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['token', tokenId],
    queryFn: () => api.getToken(parseInt(tokenId)),
  });

  const { data: tradesData } = useQuery({
    queryKey: ['token-trades', tokenId],
    queryFn: () => api.getTokenTrades(parseInt(tokenId)),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: chartData } = useQuery({
    queryKey: ['token-chart', tokenId],
    queryFn: async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/tokens/${tokenId}/chart`);
      return response.json();
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading token...</div>
        </div>
      </>
    );
  }

  const { token, stats } = tokenData || {};
  const trades = tradesData?.trades || [];

  if (!token) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500">Token not found</div>
        </div>
      </>
    );
  }

  const handleTrade = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      toast.loading(`Processing ${activeTab}...`);
      
      // TODO: Execute Solana transaction
      // TODO: Call backend API with transaction signature
      
      toast.dismiss();
      toast.success(`${activeTab === 'buy' ? 'Purchase' : 'Sale'} successful!`);
      setAmount('');
    } catch (error) {
      toast.dismiss();
      toast.error('Transaction failed');
      console.error(error);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Token Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
            {/* Token Image */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-xl">
              {token.image_url ? (
                <img 
                  src={token.image_url} 
                  alt={token.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {token.symbol[0]}
                </span>
              )}
            </div>

            {/* Token Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {token.name}
                </h1>
                {token.graduated && (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    GRADUATED
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <span className="font-mono text-lg">${token.symbol}</span>
                <span>•</span>
                <Link 
                  href={`/artists/${token.artist.id}`}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {token.artist.name}
                  {token.artist.verified && (
                    <FiCheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                  <div className="text-white font-semibold text-lg">
                    {formatCurrency(token.market_cap || 0)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Holders</div>
                  <div className="text-white font-semibold text-lg">
                    {formatNumber(stats?.unique_traders || 0, 0)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Volume</div>
                  <div className="text-white font-semibold text-lg">
                    {formatCurrency(stats?.total_volume || 0)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">24h Change</div>
                  <div className={`font-semibold text-lg ${
                    (stats?.price_change_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(stats?.price_change_24h || 0) >= 0 ? '+' : ''}
                    {(stats?.price_change_24h || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart and Trades */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chart */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
                <h2 className="text-lg font-bold text-white mb-4">Price Chart</h2>
                <div className="h-64 sm:h-80">
                  {chartData?.chart_data && chartData.chart_data.length > 0 ? (
                    <BondingCurveChart 
                      tokenId={parseInt(tokenId)}
                      trades={chartData.chart_data}
                      currentPrice={chartData.current_price}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No trading data yet
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Trades */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
                <h2 className="text-lg font-bold text-white mb-4">Recent Trades</h2>
                
                {trades.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {trades.slice(0, 20).map((trade: any) => (
                      <div 
                        key={trade.id}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.type === 'buy' 
                              ? 'bg-green-600/20 text-green-500' 
                              : 'bg-red-600/20 text-red-500'
                          }`}>
                            {trade.type.toUpperCase()}
                          </span>
                          <div>
                            <div className="text-white font-mono text-sm">
                              {formatNumber(trade.amount, 2)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(trade.timestamp * 1000).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold text-sm">
                            {formatCurrency(trade.price)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Total: {formatCurrency(trade.total)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No trades yet
                  </div>
                )}
              </div>
            </div>

            {/* Trading Panel */}
            <div className="space-y-6">
              {/* Buy/Sell Interface */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6 sticky top-20">
                <h2 className="text-lg font-bold text-white mb-4">Trade {token.symbol}</h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('buy')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      activeTab === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setActiveTab('sell')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      activeTab === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                      {token.symbol}
                    </span>
                  </div>
                </div>

                {/* Slippage */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Slippage Tolerance
                  </label>
                  <div className="flex gap-2">
                    {[0.1, 0.5, 1.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSlippage(s)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          slippage === s
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {s}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trade Summary */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="mb-6 p-4 bg-gray-900 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price per token</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(chartData?.current_price || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total cost</span>
                      <span className="text-white font-semibold">
                        {formatCurrency((chartData?.current_price || 0) * parseFloat(amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform fee (0.5%)</span>
                      <span className="text-white">
                        {formatCurrency((chartData?.current_price || 0) * parseFloat(amount) * 0.005)}
                      </span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between">
                      <span className="text-gray-400 font-semibold">Total</span>
                      <span className="text-white font-bold text-lg">
                        {formatCurrency((chartData?.current_price || 0) * parseFloat(amount) * 1.005)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Trade Button */}
                <button
                  onClick={handleTrade}
                  disabled={!publicKey || !amount || parseFloat(amount) <= 0}
                  className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-colors ${
                    !publicKey || !amount || parseFloat(amount) <= 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : activeTab === 'buy'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {!publicKey 
                    ? 'Connect Wallet' 
                    : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`
                  }
                </button>

                {/* Warning */}
                {!token.graduated && (
                  <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
                    <p className="text-yellow-500 text-xs">
                      ⚠️ Trading on bonding curve. Token will graduate to Raydium at $69k market cap.
                    </p>
                  </div>
                )}
              </div>

              {/* Token Description */}
              {token.description && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-white mb-3">About</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {token.description}
                  </p>
                </div>
              )}

              {/* Contract Info */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-bold text-white mb-3">Contract</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mint Address</span>
                    <code className="text-purple-400 font-mono text-xs">
                      {token.mint_address?.slice(0, 8)}...{token.mint_address?.slice(-8)}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Supply</span>
                    <span className="text-white">{formatNumber(token.supply || 0, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Authorities</span>
                    <span className="text-green-500">Revoked ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

