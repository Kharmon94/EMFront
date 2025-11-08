'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiCheck, FiFileText } from 'react-icons/fi';

export default function EditMiniPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingMini, setFetchingMini] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const fetchMini = async () => {
      try {
        const response = await api.get(`/minis/${params.id}`);
        const mini = response.data.mini;
        
        setFormData({
          title: mini.title || '',
          description: mini.description || '',
        });
      } catch (error: any) {
        console.error('Error fetching mini:', error);
        toast.error('Failed to load mini');
        router.push('/artist/minis');
      } finally {
        setFetchingMini(false);
      }
    };

    if (params.id) {
      fetchMini();
    }
  }, [params.id, router]);

  const DetailsStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Title *
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
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
        />
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.title}</h3>
      <p className="text-gray-700 dark:text-gray-300 mt-2">{formData.description}</p>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/artist/minis/${params.id}`, { mini: formData });
      toast.success('Mini updated!');
      router.push(`/minis/${params.id}`);
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
      description: 'Update mini info',
      icon: <FiFileText className="w-6 h-6" />,
      component: <DetailsStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Save changes',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (fetchingMini) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard resource="Mini" action="update">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push(`/minis/${params.id}`)}
          title="Edit Mini"
          subtitle="Update mini details"
        />
      </div>
    </PermissionGuard>
  );
}

