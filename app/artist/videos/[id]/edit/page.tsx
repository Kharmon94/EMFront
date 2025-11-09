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
import {
  FiVideo,
  FiImage,
  FiSettings,
  FiCheck,
  FiFileText
} from 'react-icons/fi';

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingVideo, setFetchingVideo] = useState(true);
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    access_tier: 'free',
    price: 0,
    preview_duration: 60,
  });

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get(`/videos/${params.id}`);
        const video = response.data.video;
        
        setFormData({
          title: video.title || '',
          description: video.description || '',
          access_tier: video.access_tier || 'free',
          price: video.price || 0,
          preview_duration: video.preview_duration || 60,
        });
        
        if (video.thumbnail_url) {
          setThumbnailPreview(video.thumbnail_url);
        }
      } catch (error: any) {
        console.error('Error fetching video:', error);
        toast.error('Failed to load video');
        router.push('/artist/videos');
      } finally {
        setFetchingVideo(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id, router]);

  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          ✏️ Edit Video Details
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Update your video information and settings.
        </p>
      </div>

      {thumbnailPreview && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Update Thumbnail
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
                setThumbnailFile(file);
                setThumbnailPreview(URL.createObjectURL(file));
              }
            }}
            className="hidden"
            id="thumbnail-upload"
          />
          <label
            htmlFor="thumbnail-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 transition-all bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
          >
            <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
          </label>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Video Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          placeholder="Enter video title"
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
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
          placeholder="Tell viewers what this video is about..."
        />
      </div>
    </div>
  );

  const SettingsStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          Access Level *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setFormData({ ...formData, access_tier: 'free' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              formData.access_tier === 'free'
                ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-green-600'
            }`}
          >
            <div className="text-3xl mb-2">🌐</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Free</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Available to everyone</p>
          </button>
          
          <button
            onClick={() => setFormData({ ...formData, access_tier: 'preview_only' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              formData.access_tier === 'preview_only'
                ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-yellow-600'
            }`}
          >
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Preview Only</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Limited viewing</p>
          </button>
          
          <button
            onClick={() => setFormData({ ...formData, access_tier: 'nft_required' })}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              formData.access_tier === 'nft_required'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-purple-600'
            }`}
          >
            <div className="text-3xl mb-2">🔒</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">NFT Required</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Exclusive</p>
          </button>
        </div>
      </div>

      {formData.access_tier === 'preview_only' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Preview Duration (seconds)
          </label>
          <input
            type="number"
            value={formData.preview_duration}
            onChange={(e) => setFormData({ ...formData, preview_duration: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      )}

      {formData.access_tier === 'nft_required' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Price (SOL)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      )}
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ✏️ Ready to Save!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Review your changes and click "Save Changes" to update the video.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {thumbnailPreview && (
            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formData.title || 'Untitled Video'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access Level</p>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              formData.access_tier === 'free' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : formData.access_tier === 'preview_only'
                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
            }`}>
              {formData.access_tier === 'free' ? '🌐 Free' : formData.access_tier === 'preview_only' ? '⏱️ Preview' : '🔒 NFT Required'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('video[title]', formData.title);
      formDataToSend.append('video[description]', formData.description);
      formDataToSend.append('video[access_tier]', formData.access_tier);
      
      if (formData.access_tier === 'preview_only') {
        formDataToSend.append('video[preview_duration]', formData.preview_duration.toString());
      }
      
      if (formData.access_tier === 'nft_required' && formData.price > 0) {
        formDataToSend.append('video[price]', formData.price.toString());
      }
      
      if (thumbnailFile) {
        formDataToSend.append('video[thumbnail]', thumbnailFile);
      }

      await api.put(`/artist/videos/${params.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Video updated successfully!');
      router.push(`/videos/${params.id}`);
    } catch (error: any) {
      console.error('Error updating video:', error);
      toast.error(error.response?.data?.error || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Basic Info',
      description: 'Update video details',
      icon: <FiFileText className="w-6 h-6" />,
      component: <BasicInfoStep />,
      validation: async () => {
        if (!formData.title) {
          toast.error('Please enter a video title');
          return false;
        }
        return true;
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Update access and pricing',
      icon: <FiSettings className="w-6 h-6" />,
      component: <SettingsStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and save changes',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (fetchingVideo) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard resource="Video" action="update">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 md:pt-24 pb-8">
          <BackButton fallbackUrl="/artist/dashboard" label="Back to Dashboard" />
        </div>
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push(`/videos/${params.id}`)}
          title="Edit Video"
          subtitle="Update your video details"
        />
      </div>
    </PermissionGuard>
  );
}

