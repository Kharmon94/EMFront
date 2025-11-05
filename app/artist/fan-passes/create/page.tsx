'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiDollarSign, FiUsers, FiGift, FiTrendingUp } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Navigation from '@/components/Navigation';

interface FanPassConfig {
  name: string;
  description: string;
  max_supply: number;
  price: number;
  distribution_type: 'paid' | 'airdrop' | 'hybrid';
  dividend_percentage: number;
  revenue_sources: string[];
  image_url: string;
  perks: {
    access: string[];
    discounts: string[];
    content: string[];
    events: string[];
    governance: string[];
  };
}

const PERK_OPTIONS = {
  access: [
    'Token-gated livestreams',
    'Exclusive Discord/Telegram',
    'Early music releases (7 days)',
    'Private listening parties',
    'Backstage access',
    'Direct messaging'
  ],
  discounts: [
    '50% off all merchandise',
    'Free general admission',
    'Priority ticket access',
    '20% off VIP tickets',
    'Free album downloads',
    'Lifetime discount on releases'
  ],
  content: [
    'Unreleased tracks & demos',
    'Behind-the-scenes videos',
    'Studio session access',
    'Making-of documentaries',
    'Acoustic/alternate versions',
    'Producer commentary'
  ],
  events: [
    'Meet & greet access',
    'VIP section at concerts',
    'Soundcheck access',
    'After-party invites',
    'Annual fan meetup',
    'Tour bus hangout'
  ],
  governance: [
    'Vote on setlist',
    'Choose next single',
    'Design merch (submit ideas)',
    'Name new songs/albums',
    'Choose collaborators (polls)',
    'Influence tour cities'
  ]
};

export default function CreateFanPassPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [config, setConfig] = useState<FanPassConfig>({
    name: '',
    description: '',
    max_supply: 100,
    price: 1.0,
    distribution_type: 'paid',
    dividend_percentage: 10,
    revenue_sources: ['streaming', 'sales', 'merch'],
    image_url: '',
    perks: {
      access: [],
      discounts: [],
      content: [],
      events: [],
      governance: []
    }
  });

  const createFanPass = async () => {
    if (!config.name || !config.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await api.createFanPass({
        fan_pass: {
          ...config,
          perks: config.perks,
          revenue_sources: config.revenue_sources
        }
      });

      toast.success('Fan pass created successfully!');
      router.push(`/artist/fan-passes/${response.fan_pass.id}`);
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.error || 'Failed to create fan pass');
    }
    setCreating(false);
  };

  const togglePerk = (category: keyof typeof PERK_OPTIONS, perk: string) => {
    const current = config.perks[category];
    const updated = current.includes(perk)
      ? current.filter(p => p !== perk)
      : [...current, perk];
    
    setConfig({
      ...config,
      perks: { ...config.perks, [category]: updated }
    });
  };

  const totalPerks = Object.values(config.perks).flat().length;
  const estimatedMonthlyPerHolder = config.max_supply > 0 
    ? (1000 * config.dividend_percentage / 100 / config.max_supply).toFixed(2)
    : '0';

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Fan Pass NFT
            </h1>
            <p className="text-gray-400">
              Create a limited edition NFT that grants your fans exclusive perks and dividend payments
            </p>
          </div>

          {/* Basic Info */}
          <section className="mb-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Info</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fan Pass Name *</label>
                <input
                  type="text"
                  placeholder='e.g., "VIP Club", "Inner Circle", "Founders Pass"'
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  placeholder="Describe the benefits and what makes this fan pass special..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  rows={4}
                  value={config.description}
                  onChange={(e) => setConfig({...config, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Supply *</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={config.max_supply}
                    onChange={(e) => setConfig({...config, max_supply: parseInt(e.target.value) || 100})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Limited edition count</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (SOL)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={config.price}
                    onChange={(e) => setConfig({...config, price: parseFloat(e.target.value) || 0})}
                  />
                  <p className="text-xs text-gray-500 mt-1">0 for free airdrop</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Distribution</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={config.distribution_type}
                    onChange={(e) => setConfig({...config, distribution_type: e.target.value as any})}
                  >
                    <option value="paid">Paid (Fans buy)</option>
                    <option value="airdrop">Airdrop (Free)</option>
                    <option value="hybrid">Hybrid (Both)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Sharing */}
          <section className="mb-6 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-600/30 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <FiDollarSign className="w-5 h-5" />
              Revenue Sharing (Dividends)
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Share a percentage of your revenue with fan pass holders as monthly dividends
            </p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Dividend Percentage
                </label>
                <span className="text-3xl font-bold text-purple-400">
                  {config.dividend_percentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={config.dividend_percentage}
                onChange={(e) => setConfig({...config, dividend_percentage: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0% (No dividends)</span>
                <span>50% (Max share)</span>
              </div>
            </div>

            {/* Revenue Sources */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Which revenue streams do holders share in?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'streaming', label: 'Streaming Royalties', icon: '🎵' },
                  { id: 'sales', label: 'Music Sales', icon: '💿' },
                  { id: 'merch', label: 'Merchandise', icon: '👕' },
                  { id: 'events', label: 'Ticket Sales', icon: '🎟️' },
                  { id: 'tokens', label: 'Token Fees', icon: '🪙' },
                ].map((source) => (
                  <label key={source.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 border border-gray-700 hover:border-purple-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.revenue_sources.includes(source.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({...config, revenue_sources: [...config.revenue_sources, source.id]});
                        } else {
                          setConfig({...config, revenue_sources: config.revenue_sources.filter(s => s !== source.id)});
                        }
                      }}
                      className="w-5 h-5 accent-purple-600"
                    />
                    <span className="text-xl">{source.icon}</span>
                    <span className="text-white text-sm">{source.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Calculator */}
            {config.dividend_percentage > 0 && (
              <div className="p-4 bg-purple-900/30 border border-purple-600/50 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4" />
                  Dividend Calculator
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  If you earn $1,000/month from selected sources:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Total dividend pool:</span>
                    <span className="font-semibold text-white">
                      ${(1000 * config.dividend_percentage / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Per holder ({config.max_supply} NFTs):</span>
                    <span className="font-semibold text-purple-400">
                      ${estimatedMonthlyPerHolder}/month
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Annual per holder:</span>
                    <span className="font-semibold text-purple-400">
                      ${(parseFloat(estimatedMonthlyPerHolder) * 12).toFixed(2)}/year
                    </span>
                  </div>
                  <div className="flex justify-between text-green-400 border-t border-gray-700 pt-2 mt-2">
                    <span>You keep:</span>
                    <span className="font-bold">
                      ${(1000 * (100 - config.dividend_percentage) / 100).toFixed(2)} ({100 - config.dividend_percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Custom Perks */}
          <section className="mb-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Custom Perks</h2>
            <p className="text-gray-400 text-sm mb-6">
              Select the benefits fan pass holders will receive
            </p>
            
            {Object.entries(PERK_OPTIONS).map(([category, options]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  {category === 'access' && '🔓'}
                  {category === 'discounts' && '💸'}
                  {category === 'content' && '🎬'}
                  {category === 'events' && '🎟️'}
                  {category === 'governance' && '🗳️'}
                  <span className="capitalize">{category} Perks</span>
                  <span className="text-xs text-gray-500">
                    ({config.perks[category as keyof typeof config.perks].length} selected)
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {options.map((perk) => (
                    <label
                      key={perk}
                      className="flex items-center gap-2 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-750 border border-gray-700 hover:border-purple-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={config.perks[category as keyof typeof config.perks].includes(perk)}
                        onChange={() => togglePerk(category as keyof typeof config.perks, perk)}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm text-gray-300">{perk}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Summary & Submit */}
          <section className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiCheck className="w-5 h-5" />
              Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-white mb-1">{config.max_supply}</div>
                <div className="text-xs text-gray-400">NFTs</div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-white mb-1">
                  {config.price > 0 ? `${config.price} SOL` : 'Free'}
                </div>
                <div className="text-xs text-gray-400">Price</div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">{config.dividend_percentage}%</div>
                <div className="text-xs text-gray-400">Dividend</div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-white mb-1">{totalPerks}</div>
                <div className="text-xs text-gray-400">Perks</div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
              <div className="flex items-start gap-2 text-blue-300 text-sm">
                <FiGift className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Potential earnings from this pass:</p>
                  <p className="text-blue-400/80">
                    {config.max_supply} NFTs × {config.price} SOL = {(config.max_supply * config.price).toFixed(2)} SOL
                    ({((config.max_supply * config.price) * 150).toFixed(0)} USD at $150/SOL)
                  </p>
                  {config.dividend_percentage > 0 && (
                    <p className="text-blue-400/80 mt-1">
                      + Holders earn ${estimatedMonthlyPerHolder}/month each (builds loyalty!)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={createFanPass}
              disabled={creating || !config.name || !config.description}
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  Create Fan Pass NFT Collection
                </>
              )}
            </button>
          </section>
        </div>
      </main>
    </>
  );
}

