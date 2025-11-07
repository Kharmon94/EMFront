'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { FiRefreshCw, FiSettings, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { formatNumber, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DexPage() {
  const { publicKey } = useWallet();
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  const { data: poolsData } = useQuery({
    queryKey: ['dex-pools'],
    queryFn: async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/dex/pools`);
      return response.json();
    },
  });

  const pools = poolsData?.pools || [];

  const handleSwap = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!toToken) {
      toast.error('Please select a token to swap to');
      return;
    }

    try {
      toast.loading('Executing swap...');
      
      // TODO: Execute Solana swap transaction
      // TODO: Call backend API with transaction signature
      
      toast.dismiss();
      toast.success('Swap successful!');
      setFromAmount('');
    } catch (error) {
      toast.dismiss();
      toast.error('Swap failed');
      console.error(error);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Swap Tokens
            </h1>
            <p className="text-gray-400 text-lg">
              Trade artist tokens on our in-house DEX or Raydium pools
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Swap Interface */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Swap</h2>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiSettings className="w-5 h-5" />
                  </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="mb-6 p-4 bg-gray-900 rounded-lg">
                    <h3 className="text-sm font-semibold text-white mb-3">Slippage Tolerance</h3>
                    <div className="flex gap-2">
                      {[0.1, 0.5, 1.0, 2.0].map((s) => (
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
                )}

                {/* From Token */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    From
                  </label>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="number"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-transparent text-2xl text-white outline-none w-full"
                      />
                      <select
                        value={fromToken}
                        onChange={(e) => setFromToken(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold ml-2"
                      >
                        <option value="SOL">SOL</option>
                        {pools.map((pool: any) => (
                          <option key={pool.id} value={pool.token.symbol}>
                            {pool.token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-sm text-gray-400">
                      Balance: 0.00 {fromToken}
                    </div>
                  </div>
                </div>

                {/* Switch Button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    onClick={switchTokens}
                    className="p-2 bg-gray-900 border-2 border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
                  >
                    <FiRefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* To Token */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    To (estimated)
                  </label>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl text-white">
                        {fromAmount ? (parseFloat(fromAmount) * 1000).toFixed(2) : '0.00'}
                      </div>
                      <select
                        value={toToken}
                        onChange={(e) => setToToken(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold ml-2"
                      >
                        <option value="">Select token</option>
                        {pools.map((pool: any) => (
                          <option key={pool.id} value={pool.token.symbol}>
                            {pool.token.symbol}
                          </option>
                        ))}
                        <option value="SOL">SOL</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray-400">
                      Balance: 0.00 {toToken}
                    </div>
                  </div>
                </div>

                {/* Swap Details */}
                {fromAmount && toToken && parseFloat(fromAmount) > 0 && (
                  <div className="mb-6 p-4 bg-gray-900 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate</span>
                      <span className="text-white">1 {fromToken} = 1000 {toToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform fee (0.2%)</span>
                      <span className="text-white">{(parseFloat(fromAmount) * 0.002).toFixed(4)} {fromToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">LP fee (0.3%)</span>
                      <span className="text-white">{(parseFloat(fromAmount) * 0.003).toFixed(4)} {fromToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price impact</span>
                      <span className="text-green-500">&lt;0.1%</span>
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={!publicKey || !fromAmount || !toToken || parseFloat(fromAmount) <= 0}
                  className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-colors ${
                    !publicKey || !fromAmount || !toToken || parseFloat(fromAmount) <= 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {!publicKey ? 'Connect Wallet' : 'Swap'}
                </button>
              </div>
            </div>

            {/* Liquidity Pools */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5" />
                  Top Pools
                </h2>

                {pools.length > 0 ? (
                  <div className="space-y-3">
                    {pools.slice(0, 5).map((pool: any) => (
                      <div 
                        key={pool.id}
                        className="p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-white">
                            {pool.token.symbol}/SOL
                          </div>
                          <div className="text-xs text-gray-400">
                            {pool.platform}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">TVL</span>
                          <span className="text-white font-semibold">
                            {formatCurrency(pool.tvl || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">24h Volume</span>
                          <span className="text-white">
                            {formatCurrency(pool.volume_24h || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No pools available
                  </div>
                )}
              </div>

              {/* Add Liquidity CTA */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 text-center">
                <FiDollarSign className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">
                  Earn Fees as LP
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Provide liquidity and earn 0.3% of all trades
                </p>
                <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                  Add Liquidity
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

