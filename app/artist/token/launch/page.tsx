'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiTrendingUp, FiDollarSign, FiInfo, FiZap } from 'react-icons/fi';

export default function LaunchTokenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    description: '',
    initial_supply: '1000000',
    initial_price: '0.001',
  });

  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const response = await api.get('/auth/me');
        const user = response.data.user;
        
        if (user.artist?.artist_token) {
          setHasToken(true);
          toast.error('You already have a token launched');
          setTimeout(() => router.push(`/tokens/${user.artist.artist_token.id}`), 2000);
        }
      } catch (error) {
        console.error('Error checking token:', error);
      } finally {
        setCheckingToken(false);
      }
    };

    checkExistingToken();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!tokenData.name || !tokenData.symbol) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (tokenData.symbol.length > 10) {
        toast.error('Symbol must be 10 characters or less');
        setLoading(false);
        return;
      }

      const payload = {
        artist_token: {
          name: tokenData.name,
          symbol: tokenData.symbol.toUpperCase(),
          description: tokenData.description,
          supply: parseFloat(tokenData.initial_supply),
          price_usd: parseFloat(tokenData.initial_price),
        },
      };

      const response = await api.post('/tokens', payload);
      
      toast.success('Token launched successfully! 🚀');
      router.push(`/tokens/${response.data.token.id}`);
    } catch (error: any) {
      console.error('Error launching token:', error);
      toast.error(error.response?.data?.error || 'Failed to launch token');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (hasToken) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-center">
            <FiTrendingUp className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">You already have a token launched</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Redirecting...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
              <FiZap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black dark:text-white mb-3">Launch Your Artist Token</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Create your own token on Solana with bonding curve mechanics. No launch fees - we take 20% from every transaction.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Token Details */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-6">Token Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    value={tokenData.name}
                    onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Artist Token"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be displayed to fans</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Token Symbol *
                  </label>
                  <input
                    type="text"
                    value={tokenData.symbol}
                    onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 text-lg font-mono uppercase"
                    placeholder="ARTIST"
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">3-10 characters (e.g., DRAKE, SWIFT, YEEZY)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={tokenData.description}
                    onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell your fans why they should invest in your token..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Supply
                    </label>
                    <input
                      type="number"
                      value={tokenData.initial_supply}
                      onChange={(e) => setTokenData({ ...tokenData, initial_supply: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                      min="1000"
                      step="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total tokens to create (recommended: 1M)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Starting Price (USD)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={tokenData.initial_price}
                      onChange={(e) => setTokenData({ ...tokenData, initial_price: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                      min="0.0001"
                    />
                    <p className="text-xs text-gray-500 mt-1">Initial token price in USD</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex gap-3">
                <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    How Token Launching Works
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>✅ <strong>No Launch Fee:</strong> Launch your token for free on our platform</li>
                    <li>✅ <strong>Bonding Curve:</strong> Price automatically increases with demand</li>
                    <li>✅ <strong>Auto-Graduate:</strong> At $69K market cap, token auto-graduates to Raydium DEX</li>
                    <li>✅ <strong>20% Platform Fee:</strong> We take 20% from every buy/sell transaction</li>
                    <li>✅ <strong>One Token Policy:</strong> Each wallet can only launch one artist token</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-bold transition-all flex items-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <FiZap className="w-6 h-6" />
                    Launch Token
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              💡 Why launch an artist token?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Fan Engagement</h4>
                <p>Let fans invest in your success and earn as you grow</p>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Direct Funding</h4>
                <p>Raise capital directly from your community without labels</p>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Exclusive Access</h4>
                <p>Gate content, events, and perks behind token ownership</p>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Trading Revenue</h4>
                <p>Earn from every buy/sell transaction of your token</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

