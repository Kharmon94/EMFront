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
import { FiCheck, FiFileText, FiSettings } from 'react-icons/fi';

export default function EditFanPassPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingPass, setFetchingPass] = useState(true);
  
  const [passData, setPassData] = useState({
    name: '',
    description: '',
    dividend_percentage: 10,
  });

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const response = await api.get(`/fan_passes/${params.id}`);
        const pass = response.data.fan_pass;
        
        setPassData({
          name: pass.name || '',
          description: pass.description || '',
          dividend_percentage: pass.dividend_percentage || 10,
        });
      } catch (error: any) {
        console.error('Error fetching fan pass:', error);
        toast.error('Failed to load fan pass');
        router.push('/artist/fan-passes');
      } finally {
        setFetchingPass(false);
      }
    };

    if (params.id) {
      fetchPass();
    }
  }, [params.id, router]);

  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Fan Pass Name *
        </label>
        <input
          type="text"
          value={passData.name}
          onChange={(e) => setPassData({ ...passData, name: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description *
        </label>
        <textarea
          value={passData.description}
          onChange={(e) => setPassData({ ...passData, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
        />
      </div>
    </div>
  );

  const SettingsStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Revenue Share Percentage
        </label>
        <input
          type="number"
          value={passData.dividend_percentage}
          onChange={(e) => setPassData({ ...passData, dividend_percentage: parseInt(e.target.value) })}
          min="0"
          max="100"
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {passData.name}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mt-2">{passData.description}</p>
        <p className="text-purple-600 font-bold mt-4">
          {passData.dividend_percentage}% Revenue Share
        </p>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/artist/fan_passes/${params.id}`, { fan_pass: passData });
      toast.success('Fan pass updated!');
      router.push(`/fan-passes/${params.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Basic Info',
      description: 'Update pass details',
      icon: <FiFileText className="w-6 h-6" />,
      component: <BasicInfoStep />,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Update revenue share',
      icon: <FiSettings className="w-6 h-6" />,
      component: <SettingsStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Save changes',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (fetchingPass) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard resource="FanPass" action="update">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 md:pt-24 pb-8">
          <BackButton fallbackUrl="/artist/dashboard" label="Back to Dashboard" />
        </div>
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push(`/fan-passes/${params.id}`)}
          title="Edit Fan Pass"
          subtitle="Update fan pass details"
        />
      </div>
    </PermissionGuard>
  );
}

