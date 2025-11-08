'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import { CreationTutorial, TutorialStep } from '@/components/creation/CreationTutorial';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  FiCheck,
  FiDollarSign,
  FiUsers,
  FiGift,
  FiTrendingUp,
  FiImage,
  FiFileText,
  FiSettings,
  FiAward
} from 'react-icons/fi';

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
    'Vote on setlists',
    'Choose next single',
    'Merch design input',
    'Tour location voting',
    'Album art selection',
    'Collaboration decisions'
  ]
};

const REVENUE_SOURCES = [
  { id: 'streaming', label: 'Streaming Revenue', icon: '🎵' },
  { id: 'merch', label: 'Merchandise Sales', icon: '👕' },
  { id: 'tickets', label: 'Ticket Sales', icon: '🎫' },
  { id: 'nft', label: 'NFT Sales', icon: '🖼️' },
  { id: 'royalties', label: 'Music Royalties', icon: '💰' },
];

export default function CreateFanPassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [passConfig, setPassConfig] = useState<FanPassConfig>({
    name: '',
    description: '',
    max_supply: 100,
    price: 0.1,
    distribution_type: 'paid',
    dividend_percentage: 10,
    revenue_sources: ['streaming', 'merch', 'tickets'],
    image_url: '',
    perks: {
      access: [],
      discounts: [],
      content: [],
      events: [],
      governance: []
    }
  });

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      target: '[data-tutorial="pass-name"]',
      title: 'Fan Pass Name',
      content: 'Give your fan pass a unique name that represents the exclusive community you\'re building!',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="supply"]',
      title: 'Limited Supply',
      content: 'Set how many fan passes will exist. Scarcity creates value - lower supply means more exclusive!',
      position: 'right',
    },
    {
      target: '[data-tutorial="dividends"]',
      title: 'Revenue Sharing',
      content: 'Share a percentage of your revenue with fan pass holders. This creates true fan ownership!',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="perks"]',
      title: 'Exclusive Perks',
      content: 'Select perks that make your fan pass valuable. These are the benefits holders will enjoy!',
      position: 'left',
    },
  ];

  // Step 1: Basic Info
  const BasicInfoStep = () => (
    <div className="space-y-6">
      {/* Pass Image */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Fan Pass Image *
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
              }
              if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
              }
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }
          }}
          className="hidden"
          id="pass-image"
        />
        <label
          htmlFor="pass-image"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Pass preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <FiImage className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload fan pass image
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mt-1">
                Recommended: 1080x1080px square
              </span>
            </div>
          )}
        </label>
      </div>

      {/* Pass Name */}
      <div data-tutorial="pass-name">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Fan Pass Name *
        </label>
        <input
          type="text"
          value={passConfig.name}
          onChange={(e) => setPassConfig({ ...passConfig, name: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          placeholder="e.g., VIP Inner Circle, Founding Members"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description *
        </label>
        <textarea
          value={passConfig.description}
          onChange={(e) => setPassConfig({ ...passConfig, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
          placeholder="What makes this fan pass special? What will holders get?"
        />
      </div>

      {/* Supply & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div data-tutorial="supply">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Maximum Supply *
          </label>
          <div className="relative">
            <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={passConfig.max_supply}
              onChange={(e) => setPassConfig({ ...passConfig, max_supply: parseInt(e.target.value) })}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="100"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total number of passes that will ever exist
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Price (SOL) *
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              step="0.01"
              value={passConfig.price}
              onChange={(e) => setPassConfig({ ...passConfig, price: parseFloat(e.target.value) })}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="0.10"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Initial mint price for each pass
          </p>
        </div>
      </div>

      {/* Distribution Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          Distribution Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setPassConfig({ ...passConfig, distribution_type: 'paid' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              passConfig.distribution_type === 'paid'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-purple-600'
            }`}
          >
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Paid</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              All passes sold at set price
            </p>
          </button>
          
          <button
            onClick={() => setPassConfig({ ...passConfig, distribution_type: 'airdrop' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              passConfig.distribution_type === 'airdrop'
                ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-green-600'
            }`}
          >
            <div className="text-3xl mb-2">🎁</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Airdrop</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Free distribution to fans
            </p>
          </button>
          
          <button
            onClick={() => setPassConfig({ ...passConfig, distribution_type: 'hybrid' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              passConfig.distribution_type === 'hybrid'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-blue-600'
            }`}
          >
            <div className="text-3xl mb-2">🔀</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Hybrid</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Mix of paid & airdropped
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2: Revenue Sharing
  const RevenueStep = () => (
    <div className="space-y-6">
      {/* Dividend Percentage */}
      <div data-tutorial="dividends">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Revenue Share Percentage *
        </label>
        <div className="relative">
          <FiTrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            value={passConfig.dividend_percentage}
            onChange={(e) => setPassConfig({ ...passConfig, dividend_percentage: parseInt(e.target.value) })}
            min="0"
            max="100"
            className="w-full pl-12 pr-16 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="10"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            %
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Percentage of selected revenue sources shared with pass holders
        </p>
      </div>

      {/* Revenue Sources */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          Revenue Sources to Share *
        </label>
        <div className="space-y-3">
          {REVENUE_SOURCES.map((source) => (
            <label
              key={source.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-600 transition-all"
            >
              <input
                type="checkbox"
                checked={passConfig.revenue_sources.includes(source.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPassConfig({
                      ...passConfig,
                      revenue_sources: [...passConfig.revenue_sources, source.id]
                    });
                  } else {
                    setPassConfig({
                      ...passConfig,
                      revenue_sources: passConfig.revenue_sources.filter(s => s !== source.id)
                    });
                  }
                }}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <span className="text-2xl">{source.icon}</span>
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                {source.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Example Calculation */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          💡 Example Calculation
        </h4>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>
            If you earn <strong>100 SOL</strong> from selected sources:
          </p>
          <p className="pl-4">
            → Pass holders receive: <strong className="text-green-600">{passConfig.dividend_percentage} SOL</strong> ({passConfig.dividend_percentage}%)
          </p>
          <p className="pl-4">
            → Each holder gets: <strong className="text-purple-600">
              {(passConfig.dividend_percentage / passConfig.max_supply).toFixed(3)} SOL
            </strong> ({passConfig.max_supply} passes)
          </p>
          <p className="pl-4">
            → You keep: <strong>{100 - passConfig.dividend_percentage} SOL</strong> ({100 - passConfig.dividend_percentage}%)
          </p>
        </div>
      </div>
    </div>
  );

  // Step 3: Perks
  const PerksStep = () => (
    <div className="space-y-6" data-tutorial="perks">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🎁 Select Fan Pass Perks
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Choose the benefits that pass holders will receive. The more valuable the perks, the more desirable your fan pass!
        </p>
      </div>

      {Object.entries(PERK_OPTIONS).map(([category, options]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide flex items-center gap-2">
            {category === 'access' && '🔓'}
            {category === 'discounts' && '💸'}
            {category === 'content' && '🎬'}
            {category === 'events' && '🎉'}
            {category === 'governance' && '🗳️'}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h4>
          <div className="space-y-2">
            {options.map((perk) => (
              <label
                key={perk}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-600 transition-all"
              >
                <input
                  type="checkbox"
                  checked={passConfig.perks[category as keyof typeof passConfig.perks].includes(perk)}
                  onChange={(e) => {
                    const categoryPerks = passConfig.perks[category as keyof typeof passConfig.perks];
                    if (e.target.checked) {
                      setPassConfig({
                        ...passConfig,
                        perks: {
                          ...passConfig.perks,
                          [category]: [...categoryPerks, perk]
                        }
                      });
                    } else {
                      setPassConfig({
                        ...passConfig,
                        perks: {
                          ...passConfig.perks,
                          [category]: categoryPerks.filter(p => p !== perk)
                        }
                      });
                    }
                  }}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  {perk}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Step 4: Review
  const ReviewStep = () => {
    const totalPerks = Object.values(passConfig.perks).flat().length;
    
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Fan Pass Ready!
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Your fan pass is ready to launch. Review everything and click "Launch Fan Pass" to make it available!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pass Preview */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
              Pass Preview
            </h4>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
              {imagePreview && (
                <img src={imagePreview} alt="Pass" className="w-full aspect-square rounded-lg mb-4 object-cover" />
              )}
              <h3 className="text-2xl font-bold mb-2">{passConfig.name || 'Untitled Pass'}</h3>
              <p className="text-sm text-white/80 mb-4">{passConfig.description || 'No description'}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-white/60">Supply</p>
                  <p className="text-lg font-bold">{passConfig.max_supply}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-white/60">Price</p>
                  <p className="text-lg font-bold">{passConfig.price} SOL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Revenue Sharing
              </h4>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-2xl font-bold text-purple-600 mb-2">
                  {passConfig.dividend_percentage}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  of {passConfig.revenue_sources.length} revenue source(s)
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Perks ({totalPerks})
              </h4>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(passConfig.perks).map(([category, perks]) =>
                  perks.length > 0 && (
                    <div key={category}>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                        {category}
                      </p>
                      {perks.map((perk) => (
                        <p key={perk} className="text-sm text-gray-900 dark:text-white flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          {perk}
                        </p>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      formData.append('fan_pass[name]', passConfig.name);
      formData.append('fan_pass[description]', passConfig.description);
      formData.append('fan_pass[max_supply]', passConfig.max_supply.toString());
      formData.append('fan_pass[price]', passConfig.price.toString());
      formData.append('fan_pass[distribution_type]', passConfig.distribution_type);
      formData.append('fan_pass[dividend_percentage]', passConfig.dividend_percentage.toString());
      formData.append('fan_pass[revenue_sources]', JSON.stringify(passConfig.revenue_sources));
      formData.append('fan_pass[perks]', JSON.stringify(passConfig.perks));
      
      if (imageFile) {
        formData.append('fan_pass[image]', imageFile);
      }

      const response = await api.post('/artist/fan_passes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Fan pass created successfully!');
      router.push(`/fan-passes/${response.data.fan_pass.id}`);
    } catch (error: any) {
      console.error('Error creating fan pass:', error);
      toast.error(error.response?.data?.error || 'Failed to create fan pass');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Basic Info',
      description: 'Name, image, and pricing details',
      icon: <FiFileText className="w-6 h-6" />,
      component: <BasicInfoStep />,
      validation: async () => {
        if (!passConfig.name) {
          toast.error('Please enter a fan pass name');
          return false;
        }
        if (!passConfig.description) {
          toast.error('Please enter a description');
          return false;
        }
        if (!imageFile) {
          toast.error('Please upload an image');
          return false;
        }
        if (passConfig.max_supply <= 0) {
          toast.error('Supply must be greater than 0');
          return false;
        }
        if (passConfig.price <= 0) {
          toast.error('Price must be greater than 0');
          return false;
        }
        return true;
      },
    },
    {
      id: 'revenue',
      title: 'Revenue Share',
      description: 'Configure dividend distribution',
      icon: <FiTrendingUp className="w-6 h-6" />,
      component: <RevenueStep />,
      validation: async () => {
        if (passConfig.revenue_sources.length === 0) {
          toast.error('Please select at least one revenue source');
          return false;
        }
        if (passConfig.dividend_percentage <= 0 || passConfig.dividend_percentage > 100) {
          toast.error('Dividend percentage must be between 1 and 100');
          return false;
        }
        return true;
      },
    },
    {
      id: 'perks',
      title: 'Perks',
      description: 'Select exclusive benefits for holders',
      icon: <FiGift className="w-6 h-6" />,
      component: <PerksStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and launch your fan pass',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  return (
    <PermissionGuard resource="FanPass" action="create">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push('/artist/fan-passes')}
          title="Create Fan Pass"
          subtitle="Build a loyal community with revenue-sharing NFTs"
        />

        <CreationTutorial
          steps={tutorialSteps}
          tutorialKey="fan-pass-creation"
          onComplete={() => toast.success('Tutorial completed!')}
        />
      </div>
    </PermissionGuard>
  );
}
