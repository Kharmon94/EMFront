'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiSave, FiX, FiVideo, FiFilm, FiLink, FiFile } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function UploadVideoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentType, setContentType] = useState<'video' | 'mini'>('video');
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
    aspect_ratio: '16:9'
  });

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      
      // Size limit: 500MB for videos, 50MB for minis
      const maxSize = contentType === 'mini' ? 50 * 1024 * 1024 : 500 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`Video must be less than ${contentType === 'mini' ? '50MB' : '500MB'}`);
        return;
      }

      // Create video element to get duration
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;
      
      video.addEventListener('loadedmetadata', () => {
        const duration = Math.floor(video.duration);
        
        // Validate mini duration
        if (contentType === 'mini' && duration > 120) {
          toast.error('Minis must be 2 minutes or less. Please select a shorter video.');
          URL.revokeObjectURL(url);
          return;
        }
        
        setFormData({ ...formData, duration });
        URL.revokeObjectURL(url);
      });

      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    if (uploadMethod === 'file' && !videoFile) {
      toast.error('Please upload a video file');
      return;
    }

    if (uploadMethod === 'url' && !formData.video_url) {
      toast.error('Please enter a video URL');
      return;
    }

    // Validate Mini duration
    if (contentType === 'mini' && formData.duration > 120) {
      toast.error('Mini duration must be 2 minutes or less');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      
      // Add basic fields
      const prefix = contentType === 'mini' ? 'mini' : 'video';
      submitFormData.append(`${prefix}[title]`, formData.title);
      submitFormData.append(`${prefix}[description]`, formData.description);
      submitFormData.append(`${prefix}[duration]`, formData.duration.toString());
      submitFormData.append(`${prefix}[access_tier]`, formData.access_tier);
      submitFormData.append(`${prefix}[price]`, formData.price.toString());
      submitFormData.append(`${prefix}[preview_duration]`, formData.preview_duration.toString());
      
      if (contentType === 'mini') {
        submitFormData.append('mini[aspect_ratio]', '9:16');
      } else {
        submitFormData.append('video[aspect_ratio]', formData.aspect_ratio);
      }

      // Add video file or URL
      if (uploadMethod === 'file' && videoFile) {
        submitFormData.append('video_file', videoFile);
      } else if (uploadMethod === 'url' && formData.video_url) {
        submitFormData.append(`${prefix}[video_url]`, formData.video_url);
      }

      // Add thumbnail file or URL
      if (thumbnailFile) {
        submitFormData.append('thumbnail_file', thumbnailFile);
      } else if (formData.thumbnail_url) {
        submitFormData.append(`${prefix}[thumbnail_url]`, formData.thumbnail_url);
      }

      const endpoint = contentType === 'mini' ? '/minis' : '/videos';
      await api.post(endpoint, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`${contentType === 'mini' ? 'Mini' : 'Video'} created successfully!`);
      router.push(`/artist/${contentType === 'mini' ? 'minis' : 'videos'}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-purple-900 dark:to-black pb-24 md:pb-6">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            {contentType === 'mini' ? 'Create Mini' : 'Upload Video'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {contentType === 'mini' 
              ? 'Share short-form content (up to 2 minutes)'
              : 'Share your music videos with fans'}
          </p>
        </div>

        {/* Content Type Toggle */}
        <div className="mb-6 flex gap-3 p-1 bg-gray-200 dark:bg-gray-800/50 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => {
              setContentType('video');
              setFormData(prev => ({ ...prev, aspect_ratio: '16:9', preview_duration: 60 }));
              setVideoFile(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              contentType === 'video'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <FiVideo />
            Regular Video
          </button>
          <button
            type="button"
            onClick={() => {
              setContentType('mini');
              setFormData(prev => ({ ...prev, aspect_ratio: '9:16', preview_duration: 30 }));
              setVideoFile(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              contentType === 'mini'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <FiFilm />
            Mini
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                placeholder={contentType === 'mini' ? 'My Amazing Mini' : 'My Music Video Title'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Tell viewers about this content..."
              />
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">Video Content</h2>
              
              {/* Upload Method Toggle (Videos Only) */}
              {contentType === 'video' && (
                <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-900 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      uploadMethod === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <FiFile className="w-4 h-4" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      uploadMethod === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <FiLink className="w-4 h-4" />
                    Use URL
                  </button>
                </div>
              )}
            </div>

            {/* File Upload */}
            {(uploadMethod === 'file' || contentType === 'mini') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {contentType === 'mini' ? 'Mini Video File *' : 'Video File *'}
                </label>
                {videoFile ? (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      {contentType === 'mini' ? (
                        <FiFilm className="w-6 h-6 text-white" />
                      ) : (
                        <FiVideo className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        {formData.duration > 0 && ` • ${Math.floor(formData.duration / 60)}:${String(formData.duration % 60).padStart(2, '0')}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setFormData({ ...formData, duration: 0 });
                      }}
                      className="flex-shrink-0 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors bg-gray-50 dark:bg-gray-900/50">
                      <FiUpload className="w-12 h-12 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload {contentType === 'mini' ? 'mini' : 'video'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {contentType === 'mini' 
                            ? 'MP4, WebM (max 50MB, up to 2 minutes)' 
                            : 'MP4, WebM, MOV (max 500MB)'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* URL Input (Videos Only) */}
            {uploadMethod === 'url' && contentType === 'video' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL * (IPFS or CDN)
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="ipfs://... or https://..."
                    className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Upload your video to IPFS or your CDN first, then paste the URL here
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (seconds) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500"
                    placeholder="180"
                    required
                  />
                </div>
              </>
            )}

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail
              </label>
              {thumbnailPreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-purple-500">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview('');
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors bg-gray-50 dark:bg-gray-900/50">
                    <FiUpload className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload Thumbnail
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG (max 5MB, recommended: 1920x1080)
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              )}
              
              {!thumbnailFile && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or paste thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Duration (auto-detected or manual) */}
            {uploadMethod === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration {contentType === 'mini' && <span className="text-yellow-600 dark:text-yellow-400">* Max 120 seconds</span>}
                </label>
                <input
                  type="text"
                  value={formData.duration > 0 ? `${Math.floor(formData.duration / 60)}:${String(formData.duration % 60).padStart(2, '0')}` : 'Auto-detected'}
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically detected from video file
                </p>
              </div>
            )}
          </div>

          {/* Access Control */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Access Control</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Tier
              </label>
              <select
                value={formData.access_tier}
                onChange={(e) => setFormData({ ...formData, access_tier: e.target.value })}
                className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500"
              >
                <option value="free">Free - Everyone can watch</option>
                <option value="preview_only">Preview Only - Purchase required after preview</option>
                <option value="nft_required">NFT Required - Only fan pass holders</option>
                <option value="paid">Paid - Direct purchase required</option>
              </select>
            </div>

            {(formData.access_tier === 'preview_only' || formData.access_tier === 'paid') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500"
                    placeholder="0.50"
                  />
                </div>

                {formData.access_tier === 'preview_only' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={formData.preview_duration}
                      onChange={(e) => setFormData({ ...formData, preview_duration: parseInt(e.target.value) || 60 })}
                      min="10"
                      max="300"
                      className="w-full bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500"
                      placeholder="60"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Free preview length
                    </p>
                  </div>
                )}
              </div>
            )}

            {formData.access_tier === 'nft_required' && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500 rounded-lg">
                <p className="text-sm text-purple-900 dark:text-purple-200">
                  Only fans who own your Fan Pass NFTs will be able to watch this {contentType}. This is a great way to reward your most dedicated supporters!
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {uploadMethod === 'file' ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  {contentType === 'mini' ? 'Create Mini' : 'Create Video'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500 rounded-lg">
          <h3 className="text-black dark:text-white font-semibold mb-3">
            💡 {contentType === 'mini' ? "Tips for creating Mini's" : 'Tips for uploading videos'}
          </h3>
          <ul className="text-sm text-gray-700 dark:text-blue-200 space-y-2">
            {contentType === 'mini' ? (
              <>
                <li>• <strong>Keep it short:</strong> Mini's must be 2 minutes or less</li>
                <li>• <strong>Vertical format:</strong> 9:16 aspect ratio works best on mobile</li>
                <li>• <strong>Hook viewers fast:</strong> Grab attention in the first 3 seconds</li>
                <li>• <strong>File upload:</strong> Upload directly - we'll handle IPFS storage</li>
                <li>• <strong>Free = Discovery:</strong> Free Mini's get more views and shares</li>
              </>
            ) : (
              <>
                <li>• <strong>File upload:</strong> Upload directly (we handle IPFS) or use your own URL</li>
                <li>• <strong>Thumbnails matter:</strong> High-quality thumbnails get more clicks</li>
                <li>• <strong>Preview strategy:</strong> Preview videos are great for teasing exclusive content</li>
                <li>• <strong>NFT rewards:</strong> NFT-gated videos reward your fan pass holders</li>
                <li>• <strong>Draft mode:</strong> Videos start as drafts until you publish them</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
