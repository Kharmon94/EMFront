'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { BackButton } from '@/components/BackButton';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiVideo, FiCalendar, FiLock, FiCheck, FiFileText, FiSettings } from 'react-icons/fi';

export default function EditLivestreamPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingStream, setFetchingStream] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    token_gate_amount: 0,
  });

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await api.get(`/livestreams/${params.id}`);
        const stream = response.data.livestream;
        
        setFormData({
          title: stream.title || '',
          description: stream.description || '',
          start_time: stream.start_time ? new Date(stream.start_time).toISOString().slice(0, 16) : '',
          token_gate_amount: stream.token_gate_amount || 0,
        });
      } catch (error: any) {
        console.error('Error fetching livestream:', error);
        toast.error('Failed to load livestream');
        router.push('/artist/livestreams');
      } finally {
        setFetchingStream(false);
      }
    };

    if (params.id) {
      fetchStream();
    }
  }, [params.id, router]);

  const DetailsStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Stream Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Start Time *
        </label>
        <input
          type="datetime-local"
          value={formData.start_time}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );

  const AccessStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          Token Gate Amount
        </label>
        <input
          type="number"
          value={formData.token_gate_amount}
          onChange={(e) => setFormData({ ...formData, token_gate_amount: parseInt(e.target.value) })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          placeholder="0 for free, >0 to require tokens"
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Set to 0 for free access, or require token holdings
        </p>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mt-2">{formData.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            formData.token_gate_amount > 0
              ? 'bg-purple-600 text-white'
              : 'bg-green-600 text-white'
          }`}>
            {formData.token_gate_amount > 0 ? `🔒 ${formData.token_gate_amount} tokens` : '🌐 Free'}
          </span>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/artist/livestreams/${params.id}`, {
        livestream: formData,
      });
      toast.success('Livestream updated!');
      router.push(`/artist/livestreams/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'details',
      title: 'Details',
      description: 'Update stream info',
      icon: <FiFileText className="w-6 h-6" />,
      component: <DetailsStep />,
    },
    {
      id: 'access',
      title: 'Access',
      description: 'Update token gating',
      icon: <FiSettings className="w-6 h-6" />,
      component: <AccessStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Save changes',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (fetchingStream) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard resource="Livestream" action="update">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 md:pt-24 pb-8">
          <BackButton fallbackUrl="/artist/dashboard" label="Back to Dashboard" />
        </div>
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push(`/artist/livestreams/${params.id}`)}
          title="Edit Livestream"
          subtitle="Update stream settings"
        />
      </div>
    </PermissionGuard>
  );
}

