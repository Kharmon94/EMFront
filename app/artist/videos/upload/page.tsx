'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiSave } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function UploadVideoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentType, setContentType] = useState<'video' | 'mini'>('video');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    video_url: '',
    thumbnail_url: '',
    access_tier: 'free',
    price: 0,
    preview_duration: 60,
    aspect_ratio: '16:9'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.video_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Mini duration
    if (contentType === 'mini' && formData.duration > 120) {
      toast.error('Mini duration must be 2 minutes or less');
      return;
    }

    setIsSubmitting(true);

    try {
      if (contentType === 'mini') {
        await api.createMini({ ...formData, aspect_ratio: '9:16' });
        toast.success('Mini created successfully!');
        router.push('/artist/minis');
      } else {
        await api.createVideo(formData);
        toast.success('Video created successfully!');
        router.push('/artist/videos');
      }
    } catch (error: any) {
      console.error('Failed to create content:', error);
      toast.error(error.response?.data?.errors || 'Failed to create content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {contentType === 'mini' ? 'Create Mini' : 'Upload Video'}
            </h1>
            <p className="text-gray-400">
              {contentType === 'mini' 
                ? 'Share short-form content (up to 2 minutes)'
                : 'Share your music videos with fans'}
            </p>
          </div>

          {/* Content Type Toggle */}
          <div className="mb-6 flex gap-3 p-1 bg-gray-800/50 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => {
                setContentType('video');
                setFormData(prev => ({ ...prev, aspect_ratio: '16:9', preview_duration: 60 }));
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                contentType === 'video'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📹 Regular Video
            </button>
            <button
              type="button"
              onClick={() => {
                setContentType('mini');
                setFormData(prev => ({ ...prev, aspect_ratio: '9:16', preview_duration: 30 }));
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                contentType === 'mini'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎬 Mini
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL * (IPFS or CDN)
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="ipfs://... or https://..."
                  className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  Upload your video to IPFS or your CDN first, then paste the URL here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds) {contentType === 'mini' && <span className="text-yellow-400">* Max 120 seconds</span>}
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="0"
                  max={contentType === 'mini' ? 120 : undefined}
                  className={`w-full bg-gray-900 text-white px-4 py-2 rounded-lg border focus:outline-none focus:border-purple-500 ${
                    contentType === 'mini' && formData.duration > 120 
                      ? 'border-red-500' 
                      : 'border-gray-700'
                  }`}
                />
                {contentType === 'mini' && (
                  <p className="text-sm text-gray-400 mt-1">
                    Mini's are limited to 2 minutes. {formData.duration > 120 && (
                      <span className="text-red-400">Current: {formData.duration}s - Please reduce!</span>
                    )}
                  </p>
                )}
                {contentType === 'video' && (
                  <p className="text-sm text-gray-400 mt-1">
                    Regular videos have no duration limit
                  </p>
                )}
              </div>
            </div>

            {/* Access Control */}
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Access Control</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Tier
                </label>
                <select
                  value={formData.access_tier}
                  onChange={(e) => setFormData({ ...formData, access_tier: e.target.value })}
                  className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="free">Free - Everyone can watch</option>
                  <option value="preview_only">Preview Only - Purchase required after preview</option>
                  <option value="nft_required">NFT Required - Only fan pass holders</option>
                  <option value="paid">Paid - Direct purchase required</option>
                </select>
              </div>

              {(formData.access_tier === 'preview_only' || formData.access_tier === 'paid') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (SOL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      min="0"
                      className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {formData.access_tier === 'preview_only' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Preview Duration (seconds)
                      </label>
                      <input
                        type="number"
                        value={formData.preview_duration}
                        onChange={(e) => setFormData({ ...formData, preview_duration: parseInt(e.target.value) || 60 })}
                        min="10"
                        max="300"
                        className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        How many seconds fans can watch for free before purchase
                      </p>
                    </div>
                  )}
                </>
              )}

              {formData.access_tier === 'nft_required' && (
                <div className="p-4 bg-purple-500/20 border border-purple-500 rounded-lg">
                  <p className="text-sm text-purple-200">
                    Only fans who own your Fan Pass NFTs will be able to watch this video. This is a great way to reward your most dedicated supporters!
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave /> {contentType === 'mini' ? 'Create Mini' : 'Create Video'}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-500/20 border border-blue-500 rounded-lg">
            <h3 className="text-white font-semibold mb-2">
              💡 {contentType === 'mini' ? "Tips for creating Mini's" : 'Tips for uploading videos'}
            </h3>
            <ul className="text-sm text-blue-200 space-y-1">
              {contentType === 'mini' ? (
                <>
                  <li>• Keep it under 2 minutes for maximum impact</li>
                  <li>• Vertical format (9:16) works best on mobile</li>
                  <li>• Hook viewers in the first 3 seconds</li>
                  <li>• Free Mini's get more discovery and shares</li>
                  <li>• Upload to IPFS for decentralized hosting</li>
                  <li>• Mini's are perfect for teasers and behind-the-scenes</li>
                </>
              ) : (
                <>
                  <li>• Upload your video to IPFS for decentralized hosting</li>
                  <li>• Use high-quality thumbnails for better engagement</li>
                  <li>• Preview videos are great for teasing exclusive content</li>
                  <li>• NFT-gated videos reward your fan pass holders</li>
                  <li>• Videos will be saved as drafts until you publish them</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

