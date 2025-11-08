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
  FiImage,
  FiUpload,
  FiCheck,
  FiFileText,
  FiFilm
} from 'react-icons/fi';

export default function UploadMiniPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
  });

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      target: '[data-tutorial="video-upload"]',
      title: 'Upload Your Mini',
      content: 'Upload a short vertical video (max 2 minutes). Perfect for behind-the-scenes, teasers, or quick updates!',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="thumbnail"]',
      title: 'Eye-Catching Thumbnail',
      content: 'A great thumbnail gets more views! Use a clear, compelling image from your video.',
      position: 'right',
    },
  ];

  // Step 1: Upload Video
  const UploadStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          📱 Upload a Mini
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Short-form vertical videos (like TikTok or Instagram Reels) - max 2 minutes!
        </p>
      </div>

      {/* Video Upload */}
      <div data-tutorial="video-upload">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Video File *
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (!file.type.startsWith('video/')) {
                toast.error('Please select a video file');
                return;
              }
              if (file.size > 50 * 1024 * 1024) {
                toast.error('Video must be less than 50MB');
                return;
              }
              
              // Get duration
              const video = document.createElement('video');
              const url = URL.createObjectURL(file);
              video.src = url;
              video.addEventListener('loadedmetadata', () => {
                const duration = Math.floor(video.duration);
                
                if (duration > 120) {
                  toast.error('Minis must be 2 minutes or less');
                  URL.revokeObjectURL(url);
                  return;
                }
                
                setFormData({ ...formData, duration });
                setVideoFile(file);
                toast.success('Video loaded successfully!');
                URL.revokeObjectURL(url);
              });
            }
          }}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all bg-gray-50 dark:bg-gray-900/50"
        >
          {videoFile ? (
            <div className="text-center">
              <FiFilm className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {videoFile.name}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 block mt-2">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                {formData.duration > 0 && ` • ${formData.duration}s`}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mt-2">
                Click to change video
              </span>
            </div>
          ) : (
            <div className="text-center">
              <FiVideo className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload video
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mt-2">
                Vertical format • Max 2 minutes • Max 50MB
              </span>
            </div>
          )}
        </label>
      </div>

      {/* Thumbnail Upload */}
      <div data-tutorial="thumbnail">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Thumbnail *
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
                toast.error('Thumbnail must be less than 5MB');
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
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
        >
          {thumbnailPreview ? (
            <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <FiImage className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload thumbnail
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mt-1">
                Vertical format (9:16) recommended
              </span>
            </div>
          )}
        </label>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          💡 Mini Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-600">✓</span>
            <span>Vertical format (9:16) works best for mobile viewers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">✓</span>
            <span>Hook viewers in the first 3 seconds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Add captions for viewers watching without sound</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Step 2: Details
  const DetailsStep = () => (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          placeholder="Give your mini a catchy title"
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
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
          placeholder="What's this mini about? (optional)"
        />
      </div>

      {/* Preview */}
      {videoFile && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            📋 Mini Details
          </h4>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>File:</strong> {videoFile.name}</p>
            <p><strong>Size:</strong> {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <p><strong>Duration:</strong> {formData.duration}s</p>
            <p><strong>Status:</strong> <span className="text-green-600">✓ Ready to upload</span></p>
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Review
  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🎬 Ready to Publish!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Your mini is ready to go live. It will appear in the "For You" feed and on your profile!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {thumbnailPreview && (
            <div className="aspect-[9/16] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formData.title || 'Untitled Mini'}
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
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {formData.duration}s
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('mini[title]', formData.title);
      formDataToSend.append('mini[description]', formData.description);
      formDataToSend.append('mini[duration]', formData.duration.toString());
      
      if (videoFile) {
        formDataToSend.append('mini[video_file]', videoFile);
      }
      
      if (thumbnailFile) {
        formDataToSend.append('mini[thumbnail]', thumbnailFile);
      }

      const response = await api.post('/artist/minis', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Mini uploaded successfully!');
      router.push(`/minis/${response.data.mini.id}`);
    } catch (error: any) {
      console.error('Error uploading mini:', error);
      toast.error(error.response?.data?.error || 'Failed to upload mini');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'upload',
      title: 'Upload Video',
      description: 'Upload your mini and thumbnail',
      icon: <FiUpload className="w-6 h-6" />,
      component: <UploadStep />,
      validation: async () => {
        if (!videoFile) {
          toast.error('Please upload a video');
          return false;
        }
        if (!thumbnailFile) {
          toast.error('Please upload a thumbnail');
          return false;
        }
        if (formData.duration > 120) {
          toast.error('Minis must be 2 minutes or less');
          return false;
        }
        return true;
      },
    },
    {
      id: 'details',
      title: 'Details',
      description: 'Add title and description',
      icon: <FiFileText className="w-6 h-6" />,
      component: <DetailsStep />,
      validation: async () => {
        if (!formData.title) {
          toast.error('Please enter a title');
          return false;
        }
        return true;
      },
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and publish your mini',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  return (
    <PermissionGuard resource="Mini" action="create">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push('/artist/minis')}
          title="Upload Mini"
          subtitle="Share quick moments with your fans"
        />

        <CreationTutorial
          steps={tutorialSteps}
          tutorialKey="mini-upload"
          onComplete={() => toast.success('Tutorial completed!')}
        />
      </div>
    </PermissionGuard>
  );
}

