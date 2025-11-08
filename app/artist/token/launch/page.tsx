'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import { CreationTutorial, TutorialStep } from '@/components/creation/CreationTutorial';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  FiTrendingUp,
  FiDollarSign,
  FiInfo,
  FiZap,
  FiCheck,
  FiFileText,
  FiSettings
} from 'react-icons/fi';

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

  const tutorialSteps: TutorialStep[] = [
    {
      target: '[data-tutorial="token-name"]',
      title: 'Token Name & Symbol',
      content: 'Your token name and symbol represent your brand. Choose something memorable!',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="supply"]',
      title: 'Initial Supply',
      content: 'This is how many tokens will exist. More supply = lower starting price per token.',
      position: 'right',
    },
    {
      target: '[data-tutorial="price"]',
      title: 'Starting Price',
      content: 'Your token\'s initial price. It will increase as fans buy via the bonding curve!',
      position: 'bottom',
    },
  ];

  // Step 1: Token Identity
  const TokenIdentityStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🚀 Launch Your Artist Token
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Your token allows fans to invest in your success and unlocks exclusive experiences!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tutorial="token-name">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Token Name *
          </label>
          <input
            type="text"
            value={tokenData.name}
            onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="e.g., Luna Eclipse Token"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Token Symbol *
          </label>
          <input
            type="text"
            value={tokenData.symbol}
            onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value.toUpperCase() })}
            maxLength={10}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white uppercase"
            placeholder="e.g., LUNA"
          />
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Max 10 characters, uppercase
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={tokenData.description}
          onChange={(e) => setTokenData({ ...tokenData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
          placeholder="What does your token represent? What benefits do holders get?"
        />
      </div>
    </div>
  );

  // Step 2: Token Economics
  const TokenomicsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div data-tutorial="supply">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Initial Supply *
          </label>
          <div className="relative">
            <FiTrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={tokenData.initial_supply}
              onChange={(e) => setTokenData({ ...tokenData, initial_supply: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="1000000"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total tokens that will be created
          </p>
        </div>

        <div data-tutorial="price">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Starting Price (USD) *
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              step="0.001"
              value={tokenData.initial_price}
              onChange={(e) => setTokenData({ ...tokenData, initial_price: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="0.001"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Price per token at launch
          </p>
        </div>
      </div>

      {/* Bonding Curve Info */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiInfo className="w-5 h-5" />
          How the Bonding Curve Works
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-600">📈</span>
            <span>Price automatically increases as more tokens are bought</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">📉</span>
            <span>Price decreases when tokens are sold back</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">💰</span>
            <span>Early supporters benefit from lower prices</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600">🎯</span>
            <span>At 69 SOL market cap, token graduates to full DEX trading</span>
          </li>
        </ul>
      </div>

      {/* Example Calculation */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          💡 Example Scenario
        </h4>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>With {parseInt(tokenData.initial_supply || '0').toLocaleString()} tokens at ${tokenData.initial_price} each:</p>
          <p className="pl-4">→ Initial market cap: <strong className="text-green-600">
            ${(parseFloat(tokenData.initial_supply || '0') * parseFloat(tokenData.initial_price || '0')).toLocaleString()}
          </strong></p>
          <p className="pl-4">→ First 100 buyers get tokens at <strong className="text-purple-600">best price</strong></p>
          <p className="pl-4">→ Price increases with each purchase via bonding curve</p>
        </div>
      </div>
    </div>
  );

  // Step 3: Review & Launch
  const ReviewStep = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 Ready for Launch!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Your artist token is ready to go live. Once launched, fans can start buying and your token begins its journey!
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">{tokenData.symbol || 'TOKEN'}</h2>
          <p className="text-xl text-white/90">{tokenData.name || 'Your Token'}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-xs text-white/60 mb-1">Supply</p>
            <p className="text-lg font-bold">{parseInt(tokenData.initial_supply || '0').toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-xs text-white/60 mb-1">Start Price</p>
            <p className="text-lg font-bold">${tokenData.initial_price}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-xs text-white/60 mb-1">Market Cap</p>
            <p className="text-lg font-bold">${(parseFloat(tokenData.initial_supply || '0') * parseFloat(tokenData.initial_price || '0')).toLocaleString()}</p>
          </div>
        </div>

        {tokenData.description && (
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-white/90">{tokenData.description}</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          ⚠️ Important Reminders
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>You can only launch <strong>ONE</strong> token per artist account</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Token settings cannot be changed after launch</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Price automatically adjusts based on supply and demand</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
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

  const wizardSteps: WizardStep[] = [
    {
      id: 'identity',
      title: 'Token Identity',
      description: 'Name, symbol, and description',
      icon: <FiFileText className="w-6 h-6" />,
      component: <TokenIdentityStep />,
      validation: async () => {
        if (!tokenData.name) {
          toast.error('Please enter a token name');
          return false;
        }
        if (!tokenData.symbol) {
          toast.error('Please enter a token symbol');
          return false;
        }
        if (tokenData.symbol.length > 10) {
          toast.error('Symbol must be 10 characters or less');
          return false;
        }
        return true;
      },
    },
    {
      id: 'tokenomics',
      title: 'Tokenomics',
      description: 'Supply and pricing configuration',
      icon: <FiSettings className="w-6 h-6" />,
      component: <TokenomicsStep />,
      validation: async () => {
        const supply = parseFloat(tokenData.initial_supply);
        const price = parseFloat(tokenData.initial_price);
        
        if (!supply || supply <= 0) {
          toast.error('Supply must be greater than 0');
          return false;
        }
        if (!price || price <= 0) {
          toast.error('Price must be greater than 0');
          return false;
        }
        return true;
      },
    },
    {
      id: 'review',
      title: 'Review & Launch',
      description: 'Final review before launching',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking token status...</p>
        </div>
      </div>
    );
  }

  if (hasToken) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-900 dark:text-white">Redirecting to your token...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard resource="ArtistToken" action="create">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push('/artist/dashboard')}
          title="Launch Artist Token"
          subtitle="Create your token and let fans invest in your success"
        />

        <CreationTutorial
          steps={tutorialSteps}
          tutorialKey="token-launch"
          onComplete={() => toast.success('Tutorial completed!')}
        />
      </div>
    </PermissionGuard>
  );
}
