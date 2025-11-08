'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { CreationWizard, WizardStep } from '@/components/creation/CreationWizard';
import { CreationTutorial, TutorialStep } from '@/components/creation/CreationTutorial';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { 
  FiMusic, 
  FiImage, 
  FiCalendar, 
  FiDollarSign, 
  FiUpload,
  FiX,
  FiPlus,
  FiCheck,
  FiFileText,
  FiHeadphones
} from 'react-icons/fi';

interface Track {
  title: string;
  duration: number;
  track_number: number;
  audio_file?: File;
  explicit: boolean;
  access_tier: 'free' | 'preview_only' | 'nft_required';
  price?: number;
}

export default function CreateAlbumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Album basic info
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [albumData, setAlbumData] = useState({
    title: '',
    description: '',
    release_date: '',
    price: '',
    upc: '',
  });

  // Tracks
  const [tracks, setTracks] = useState<Track[]>([
    {
      title: '',
      duration: 0,
      track_number: 1,
      explicit: false,
      access_tier: 'free' as const,
    }
  ]);

  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      target: '[data-tutorial="album-title"]',
      title: 'Album Title',
      content: 'Give your album a memorable name that represents your music. This will be the first thing fans see!',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="cover-upload"]',
      title: 'Album Cover',
      content: 'Upload a high-quality cover image (minimum 1400x1400px recommended). This is your album\'s visual identity.',
      position: 'right',
    },
    {
      target: '[data-tutorial="release-date"]',
      title: 'Release Date',
      content: 'Set when your album will be available. You can set it to today for immediate release or schedule it for the future.',
      position: 'bottom',
    },
    {
      target: '[data-tutorial="add-track"]',
      title: 'Add Tracks',
      content: 'Upload your tracks here. Each track can have different access tiers (free, preview, or NFT-gated).',
      position: 'left',
    },
    {
      target: '[data-tutorial="access-tier"]',
      title: 'Access Control',
      content: 'Choose who can listen: Free (everyone), Preview Only (30s), or NFT Required (album NFT holders only).',
      position: 'top',
    },
  ];

  // Step 1: Album Information
  const AlbumInfoStep = () => (
    <div className="space-y-6">
      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Album Cover *
        </label>
        <div 
          className="relative group"
          data-tutorial="cover-upload"
        >
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
                setCoverImage(file);
                setCoverPreview(URL.createObjectURL(file));
              }
            }}
            className="hidden"
            id="cover-upload"
          />
          <label
            htmlFor="cover-upload"
            className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
          >
            {coverPreview ? (
              <div className="relative w-full h-full">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">Change Image</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FiImage className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                <span className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click to upload album cover
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Recommended: 1400x1400px, JPG or PNG
                </span>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Album Title */}
      <div data-tutorial="album-title">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Album Title *
        </label>
        <input
          type="text"
          value={albumData.title}
          onChange={(e) => setAlbumData({ ...albumData, title: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          placeholder="Enter album title"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          value={albumData.description}
          onChange={(e) => setAlbumData({ ...albumData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white resize-none"
          placeholder="Tell your fans about this album..."
        />
      </div>

      {/* Release Date & UPC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div data-tutorial="release-date">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Release Date *
          </label>
          <input
            type="date"
            value={albumData.release_date}
            onChange={(e) => setAlbumData({ ...albumData, release_date: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            UPC Code (Optional)
          </label>
          <input
            type="text"
            value={albumData.upc}
            onChange={(e) => setAlbumData({ ...albumData, upc: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="Enter UPC if you have one"
          />
        </div>
      </div>

      {/* Album Price (NFT Mint Price) */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Album NFT Price (SOL)
        </label>
        <div className="relative">
          <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            step="0.01"
            value={albumData.price}
            onChange={(e) => setAlbumData({ ...albumData, price: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="0.00"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Fans will mint an NFT to own this album. Leave empty for free.
        </p>
      </div>
    </div>
  );

  // Step 2: Add Tracks
  const TracksStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Album Tracks ({tracks.length})
        </h3>
        <button
          onClick={() => setTracks([...tracks, {
            title: '',
            duration: 0,
            track_number: tracks.length + 1,
            explicit: false,
            access_tier: 'free',
          }])}
          data-tutorial="add-track"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <FiPlus />
          Add Track
        </button>
      </div>

      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div
            key={index}
            className="p-6 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Track {track.track_number}
              </span>
              {tracks.length > 1 && (
                <button
                  onClick={() => {
                    if (tracks.length === 1) {
                      toast.error('Album must have at least one track');
                      return;
                    }
                    setTracks(tracks.filter((_, i) => i !== index));
                  }}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Track Title */}
            <input
              type="text"
              value={track.title}
              onChange={(e) => {
                const updated = [...tracks];
                updated[index] = { ...updated[index], title: e.target.value };
                setTracks(updated);
              }}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="Track title"
            />

            {/* Audio File Upload */}
            <div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!file.type.startsWith('audio/')) {
                      toast.error('Please select an audio file');
                      return;
                    }
                    if (file.size > 50 * 1024 * 1024) {
                      toast.error('Audio file must be less than 50MB');
                      return;
                    }
                    // Get duration
                    const audio = new Audio(URL.createObjectURL(file));
                    audio.onloadedmetadata = () => {
                      const updated = [...tracks];
                      updated[index] = { 
                        ...updated[index], 
                        audio_file: file,
                        duration: Math.floor(audio.duration)
                      };
                      setTracks(updated);
                    };
                  }
                }}
                className="hidden"
                id={`audio-${index}`}
              />
              <label
                htmlFor={`audio-${index}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-600 dark:hover:border-purple-600 transition-all"
              >
                <FiUpload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {track.audio_file ? track.audio_file.name : 'Upload audio file'}
                </span>
              </label>
              {track.duration > 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>

            {/* Access Tier & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tutorial={index === 0 ? "access-tier" : undefined}>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Access Tier
                </label>
                <select
                  value={track.access_tier}
                  onChange={(e) => {
                    const updated = [...tracks];
                    updated[index] = { 
                      ...updated[index], 
                      access_tier: e.target.value as 'free' | 'preview_only' | 'nft_required'
                    };
                    setTracks(updated);
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="free">Free</option>
                  <option value="preview_only">Preview Only (30s)</option>
                  <option value="nft_required">NFT Required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Explicit Content
                </label>
                <label className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={track.explicit}
                    onChange={(e) => {
                      const updated = [...tracks];
                      updated[index] = { ...updated[index], explicit: e.target.checked };
                      setTracks(updated);
                    }}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    Contains explicit content
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 3: Review & Publish
  const ReviewStep = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 Ready to Launch!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Your album is ready to be published. Review the details below and click "Publish Album" to make it live.
        </p>
      </div>

      {/* Album Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Album Details
          </h4>
          <div className="space-y-4">
            {coverPreview && (
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={coverPreview} alt="Album cover" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {albumData.title || 'Untitled Album'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
              <p className="text-gray-900 dark:text-white">
                {albumData.description || 'No description'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Release Date</p>
                <p className="text-gray-900 dark:text-white">
                  {albumData.release_date || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                <p className="text-gray-900 dark:text-white">
                  {albumData.price ? `${albumData.price} SOL` : 'Free'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Tracks ({tracks.length})
          </h4>
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {track.track_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {track.title || `Track ${track.track_number}`}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.access_tier === 'free' ? '🌐 Free' : track.access_tier === 'preview_only' ? '⏱️ Preview' : '🔒 NFT Only'}
                    {track.explicit && ' • 🔞 Explicit'}
                  </p>
                </div>
                {track.duration > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add album data
      formData.append('album[title]', albumData.title);
      formData.append('album[description]', albumData.description);
      formData.append('album[release_date]', albumData.release_date);
      if (albumData.price) {
        formData.append('album[price]', albumData.price);
      }
      if (albumData.upc) {
        formData.append('album[upc]', albumData.upc);
      }
      if (coverImage) {
        formData.append('album[cover_image]', coverImage);
      }

      // Add tracks
      tracks.forEach((track, index) => {
        formData.append(`tracks[${index}][title]`, track.title);
        formData.append(`tracks[${index}][duration]`, track.duration.toString());
        formData.append(`tracks[${index}][track_number]`, track.track_number.toString());
        formData.append(`tracks[${index}][explicit]`, track.explicit.toString());
        formData.append(`tracks[${index}][access_tier]`, track.access_tier);
        if (track.price) {
          formData.append(`tracks[${index}][price]`, track.price.toString());
        }
        if (track.audio_file) {
          formData.append(`tracks[${index}][audio_file]`, track.audio_file);
        }
      });

      const response = await api.post('/artist/albums', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Album created successfully!');
      router.push(`/albums/${response.data.album.id}`);
    } catch (error: any) {
      console.error('Error creating album:', error);
      toast.error(error.response?.data?.error || 'Failed to create album');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Album Info',
      description: 'Basic information about your album',
      icon: <FiFileText className="w-6 h-6" />,
      component: <AlbumInfoStep />,
      validation: async () => {
        if (!albumData.title) {
          toast.error('Please enter an album title');
          return false;
        }
        if (!albumData.release_date) {
          toast.error('Please set a release date');
          return false;
        }
        if (!coverImage) {
          toast.error('Please upload an album cover');
          return false;
        }
        return true;
      },
    },
    {
      id: 'tracks',
      title: 'Add Tracks',
      description: 'Upload and configure your music tracks',
      icon: <FiHeadphones className="w-6 h-6" />,
      component: <TracksStep />,
      validation: async () => {
        if (tracks.length === 0) {
          toast.error('Please add at least one track');
          return false;
        }
        for (const track of tracks) {
          if (!track.title) {
            toast.error('All tracks must have a title');
            return false;
          }
          if (!track.audio_file) {
            toast.error('All tracks must have an audio file');
            return false;
          }
        }
        return true;
      },
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and publish your album',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  return (
    <PermissionGuard resource="Album" action="create">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push('/artist/albums')}
          title="Create New Album"
          subtitle="Share your music with the world"
        />

        <CreationTutorial
          steps={tutorialSteps}
          tutorialKey="album-creation"
          onComplete={() => toast.success('Tutorial completed!')}
        />
      </div>
    </PermissionGuard>
  );
}
