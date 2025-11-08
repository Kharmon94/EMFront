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
  FiLink,
  FiSettings,
  FiCheck,
  FiFileText
} from 'react-icons/fi';

export default function UploadVideoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Video upload method
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    video_url: '',
    thumbnail_url: '',
    access_tier: 'free',
    price: 0,
    preview_duration: 60,
  });

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      target: '[data-tutorial="video-upload"]',
      title: 'Upload Your Video',
      content: 'Choose to upload a video file directly or provide a URL if your video is hosted elsewhere (YouTube, Vimeo, etc.).',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="thumbnail"]',
      title: 'Add a Thumbnail',
      content: 'Upload an eye-catching thumbnail that represents your video. This is the first thing viewers will see!',
      position: 'right',
    },
    {
      target: '[data-tutorial="access-control"]',
      title: 'Set Access Level',
      content: 'Control who can watch your video: Free (everyone), Preview Only (limited viewing), or NFT Required (exclusive content).',
      position: 'top',
    },
  ];

  // Step 1: Upload & Basic Info
  const UploadStep = () => (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <div data-tutorial="video-upload">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          Upload Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setUploadMethod('file')}
            className={`p-6 rounded-xl border-2 transition-all ${
              uploadMethod === 'file'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-purple-600'
            }`}
          >
            <FiUpload className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Upload File</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Direct video upload</p>
          </button>
          <button
            onClick={() => setUploadMethod('url')}
            className={`p-6 rounded-xl border-2 transition-all ${
              uploadMethod === 'url'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-purple-600'
            }`}
          >
            <FiLink className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Video URL</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">YouTube, Vimeo, etc.</p>
          </button>
        </div>
      </div>

      {/* File Upload */}
      {uploadMethod === 'file' ? (
        <div>
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
                if (file.size > 500 * 1024 * 1024) {
                  toast.error('Video must be less than 500MB');
                  return;
                }
                
                // Get video duration
                const video = document.createElement('video');
                const url = URL.createObjectURL(file);
                video.src = url;
                video.addEventListener('loadedmetadata', () => {
                  setFormData({ ...formData, duration: Math.floor(video.duration) });
                  URL.revokeObjectURL(url);
                });
                
                setVideoFile(file);
                toast.success('Video loaded successfully!');
              }
            }}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all bg-gray-50 dark:bg-gray-900/50"
          >
            {videoFile ? (
              <div className="text-center">
                <FiVideo className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {videoFile.name}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 block mt-1">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  {formData.duration > 0 && ` • ${Math.floor(formData.duration / 60)}:${(formData.duration % 60).toString().padStart(2, '0')}`}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <FiVideo className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload video file
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 block mt-1">
                  MP4, MOV, or AVI • Max 500MB
                </span>
              </div>
            )}
          </label>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Video URL *
          </label>
          <input
            type="url"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Supports YouTube, Vimeo, and direct video URLs
          </p>
        </div>
      )}

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
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
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
                Recommended: 1920x1080px
              </span>
            </div>
          )}
        </label>
      </div>

      {/* Video Title */}
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
          placeholder="Tell viewers what this video is about..."
        />
      </div>
    </div>
  );

  // Step 2: Access & Settings
  const SettingsStep = () => (
    <div className="space-y-6">
      {/* Access Tier */}
      <div data-tutorial="access-control">
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
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Available to everyone
            </p>
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
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Limited viewing time
            </p>
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
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Exclusive to NFT holders
            </p>
          </button>
        </div>
      </div>

      {/* Preview Duration (if preview_only) */}
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
            placeholder="60"
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            How many seconds users can watch before needing to purchase
          </p>
        </div>
      )}

      {/* Price (if NFT required) */}
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
            placeholder="0.00"
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Fans will mint an NFT to access this video
          </p>
        </div>
      )}

      {/* Additional Settings */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          💡 Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Free videos get more views and help grow your audience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600">✓</span>
            <span>Preview mode is great for teasers and trailers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">✓</span>
            <span>NFT-gated videos create exclusive experiences for fans</span>
          </li>
        </ul>
      </div>
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
          Your video is ready to go live. Review the details below and click "Publish Video" when you're ready.
        </p>
      </div>

      {/* Preview */}
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
            <p className="text-gray-900 dark:text-white">
              {formData.description || 'No description'}
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
          
          {formData.access_tier === 'nft_required' && formData.price > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formData.price} SOL
              </p>
            </div>
          )}
          
          {formData.duration > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-gray-900 dark:text-white">
                {Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          )}
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
      
      if (formData.duration > 0) {
        formDataToSend.append('video[duration]', formData.duration.toString());
      }
      
      if (formData.access_tier === 'preview_only') {
        formDataToSend.append('video[preview_duration]', formData.preview_duration.toString());
      }
      
      if (formData.access_tier === 'nft_required' && formData.price > 0) {
        formDataToSend.append('video[price]', formData.price.toString());
      }
      
      if (uploadMethod === 'file' && videoFile) {
        formDataToSend.append('video[video_file]', videoFile);
      } else {
        formDataToSend.append('video[video_url]', formData.video_url);
      }
      
      if (thumbnailFile) {
        formDataToSend.append('video[thumbnail]', thumbnailFile);
      }

      const response = await api.post('/artist/videos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Video uploaded successfully!');
      router.push(`/videos/${response.data.video.id}`);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(error.response?.data?.error || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'upload',
      title: 'Upload & Info',
      description: 'Upload your video and add basic information',
      icon: <FiFileText className="w-6 h-6" />,
      component: <UploadStep />,
      validation: async () => {
        if (!formData.title) {
          toast.error('Please enter a video title');
          return false;
        }
        if (uploadMethod === 'file' && !videoFile) {
          toast.error('Please upload a video file');
          return false;
        }
        if (uploadMethod === 'url' && !formData.video_url) {
          toast.error('Please enter a video URL');
          return false;
        }
        if (!thumbnailFile) {
          toast.error('Please upload a thumbnail');
          return false;
        }
        return true;
      },
    },
    {
      id: 'settings',
      title: 'Access & Settings',
      description: 'Configure access level and pricing',
      icon: <FiSettings className="w-6 h-6" />,
      component: <SettingsStep />,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and publish your video',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  return (
    <PermissionGuard resource="Video" action="create">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push('/artist/videos')}
          title="Upload New Video"
          subtitle="Share your video content with fans"
        />

        <CreationTutorial
          steps={tutorialSteps}
          tutorialKey="video-upload"
          onComplete={() => toast.success('Tutorial completed!')}
        />
      </div>
    </PermissionGuard>
  );
}
