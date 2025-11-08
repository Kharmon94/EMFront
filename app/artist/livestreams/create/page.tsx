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
  FiVideo,
  FiCalendar,
  FiLock,
  FiKey,
  FiCheck,
  FiFileText,
  FiSettings
} from 'react-icons/fi';

export default function CreateLivestreamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    token_gate_amount: 0,
  });

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      target: '[data-tutorial="stream-title"]',
      title: 'Stream Title',
      content: 'Give your livestream a compelling title that tells viewers what to expect!',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="start-time"]',
      title: 'Schedule Your Stream',
      content: 'Set when your stream will go live. This helps fans plan to attend!',
      position: 'right',
    },
    {
      target: '[data-tutorial="token-gate"]',
      title: 'Token Gating (Optional)',
      content: 'Require fans to hold your artist token to watch. This creates exclusive streams for token holders!',
      position: 'top',
    },
  ];

  // Step 1: Stream Details
  const StreamDetailsStep = () => (
    <div className="space-y-6">
      {/* Stream Title */}
      <div data-tutorial="stream-title">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Stream Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          placeholder="e.g., Behind the Scenes Studio Session"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
          placeholder="What will you be streaming? Tell viewers what to expect..."
        />
      </div>

      {/* Start Time */}
      <div data-tutorial="start-time">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Scheduled Start Time *
        </label>
        <div className="relative">
          <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          When will your stream start? (Can be changed later)
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          📹 Livestream Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Test your setup before going live</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">✓</span>
            <span>Announce your stream in advance to build anticipation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">✓</span>
            <span>Interact with viewers in real-time for better engagement</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Step 2: Access Settings
  const AccessSettingsStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🔐 Control Who Can Watch
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Make your stream exclusive to token holders or keep it open to everyone.
        </p>
      </div>

      {/* Token Gating */}
      <div data-tutorial="token-gate">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          Token Gate (Optional)
        </label>
        
        <div className="space-y-4">
          {/* Free Option */}
          <button
            onClick={() => setFormData({ ...formData, token_gate_amount: 0 })}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
              formData.token_gate_amount === 0
                ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-green-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌐</div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Open to Everyone
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Anyone can watch this livestream for free
                </p>
              </div>
              {formData.token_gate_amount === 0 && (
                <FiCheck className="w-6 h-6 text-green-600" />
              )}
            </div>
          </button>

          {/* Token Gated Option */}
          <button
            onClick={() => setFormData({ ...formData, token_gate_amount: 100 })}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
              formData.token_gate_amount > 0
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-purple-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔒</div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Token Holders Only
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Require fans to hold your artist token
                </p>
              </div>
              {formData.token_gate_amount > 0 && (
                <FiCheck className="w-6 h-6 text-purple-600" />
              )}
            </div>
          </button>
        </div>

        {/* Token Amount Input */}
        {formData.token_gate_amount > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Minimum Tokens Required
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={formData.token_gate_amount}
                onChange={(e) => setFormData({ ...formData, token_gate_amount: parseInt(e.target.value) })}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="100"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Viewers must hold at least this many of your artist tokens
            </p>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          💡 Why Token Gate?
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-600">🔥</span>
            <span>Increases demand for your artist token</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">💎</span>
            <span>Rewards your most dedicated fans</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">📈</span>
            <span>Creates exclusive experiences that build community</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Step 3: RTMP Setup
  const RTMPSetupStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🎬 Ready to Stream!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Once created, you'll receive RTMP credentials to use with OBS or your streaming software.
        </p>
      </div>

      {/* Stream Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stream Title</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formData.title || 'Untitled Stream'}
          </p>
        </div>

        {formData.description && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
            <p className="text-gray-900 dark:text-white">
              {formData.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start Time</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {formData.start_time ? new Date(formData.start_time).toLocaleString() : 'Not set'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access</p>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              formData.token_gate_amount > 0
                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {formData.token_gate_amount > 0 ? (
                <>
                  <FiLock className="w-4 h-4" />
                  Token Gated ({formData.token_gate_amount} tokens)
                </>
              ) : (
                '🌐 Open to Everyone'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* OBS Setup Instructions */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiVideo className="w-5 h-5" />
          After Creation
        </h4>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p className="font-medium">You'll receive:</p>
          <ul className="space-y-2 pl-4">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">1.</span>
              <span><strong>RTMP Server URL</strong> - Use this in OBS/streaming software</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">2.</span>
              <span><strong>Stream Key</strong> - Your unique key (keep it secret!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">3.</span>
              <span><strong>Viewer URL</strong> - Share this with your fans</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/artist/livestreams', {
        livestream: {
          title: formData.title,
          description: formData.description,
          start_time: formData.start_time,
          token_gate_amount: formData.token_gate_amount,
        },
      });

      toast.success('Livestream created successfully!');
      router.push(`/artist/livestreams/${response.data.livestream.id}`);
    } catch (error: any) {
      console.error('Error creating livestream:', error);
      toast.error(error.response?.data?.error || 'Failed to create livestream');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'details',
      title: 'Stream Details',
      description: 'Basic information about your livestream',
      icon: <FiFileText className="w-6 h-6" />,
      component: <StreamDetailsStep />,
      validation: async () => {
        if (!formData.title) {
          toast.error('Please enter a stream title');
          return false;
        }
        if (!formData.start_time) {
          toast.error('Please set a start time');
          return false;
        }
        return true;
      },
    },
    {
      id: 'access',
      title: 'Access Settings',
      description: 'Configure who can watch',
      icon: <FiSettings className="w-6 h-6" />,
      component: <AccessSettingsStep />,
    },
    {
      id: 'setup',
      title: 'RTMP Setup',
      description: 'Review and get streaming credentials',
      icon: <FiKey className="w-6 h-6" />,
      component: <RTMPSetupStep />,
    },
  ];

  return (
    <PermissionGuard resource="Livestream" action="create">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push('/artist/livestreams')}
          title="Create Livestream"
          subtitle="Connect with fans in real-time"
        />

        <CreationTutorial
          steps={tutorialSteps}
          tutorialKey="livestream-creation"
          onComplete={() => toast.success('Tutorial completed!')}
        />
      </div>
    </PermissionGuard>
  );
}
