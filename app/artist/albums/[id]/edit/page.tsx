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
  FiMusic, 
  FiImage, 
  FiCalendar, 
  FiUpload,
  FiX,
  FiPlus,
  FiCheck,
  FiFileText,
  FiHeadphones
} from 'react-icons/fi';

interface Track {
  id?: number;
  title: string;
  duration: number;
  track_number: number;
  audio_file?: File;
  audio_cid?: string;
  explicit: boolean;
  access_tier: 'free' | 'preview_only' | 'nft_required';
  price?: number;
}

export default function EditAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingAlbum, setFetchingAlbum] = useState(true);
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [albumData, setAlbumData] = useState({
    title: '',
    description: '',
    release_date: '',
    price: '',
    upc: '',
  });

  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await api.get(`/albums/${params.id}`);
        const album = response.data.album;
        
        setAlbumData({
          title: album.title || '',
          description: album.description || '',
          release_date: album.release_date ? album.release_date.split('T')[0] : '',
          price: album.price?.toString() || '',
          upc: album.upc || '',
        });
        
        if (album.cover_url) {
          setCoverPreview(album.cover_url);
        }
        
        setTracks(album.tracks?.map((t: any) => ({
          id: t.id,
          title: t.title,
          duration: t.duration,
          track_number: t.track_number,
          audio_cid: t.audio_cid,
          explicit: t.explicit,
          access_tier: t.access_tier,
          price: t.price,
        })) || []);
      } catch (error: any) {
        console.error('Error fetching album:', error);
        toast.error('Failed to load album');
        router.push('/artist/albums');
      } finally {
        setFetchingAlbum(false);
      }
    };

    if (params.id) {
      fetchAlbum();
    }
  }, [params.id, router]);

  // Step 1: Album Information
  const AlbumInfoStep = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          ✏️ Edit Album Details
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Update your album information. Changes will be saved immediately.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Album Cover {coverPreview && '(Current)'}
        </label>
        <div className="relative group">
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
              </div>
            )}
          </label>
        </div>
      </div>

      <div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
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

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Album NFT Price (SOL)
        </label>
        <input
          type="number"
          step="0.01"
          value={albumData.price}
          onChange={(e) => setAlbumData({ ...albumData, price: e.target.value })}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white"
          placeholder="0.00"
        />
      </div>
    </div>
  );

  // Step 2: Manage Tracks
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
                Track {track.track_number} {track.id && '(Existing)'}
              </span>
              {tracks.length > 1 && (
                <button
                  onClick={() => setTracks(tracks.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>

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

            {!track.id && (
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
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-purple-600 transition-all"
                >
                  <FiUpload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {track.audio_file ? track.audio_file.name : 'Upload audio file'}
                  </span>
                </label>
              </div>
            )}

            {track.audio_cid && !track.audio_file && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ Audio file uploaded (CID: {track.audio_cid.substring(0, 10)}...)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Explicit content
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 3: Review
  const ReviewStep = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ✏️ Ready to Update!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Review your changes and click "Save Changes" to update the album.
        </p>
      </div>

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

      // Add tracks (both existing and new)
      tracks.forEach((track, index) => {
        if (track.id) {
          formData.append(`tracks[${index}][id]`, track.id.toString());
        }
        formData.append(`tracks[${index}][title]`, track.title);
        formData.append(`tracks[${index}][track_number]`, track.track_number.toString());
        formData.append(`tracks[${index}][explicit]`, track.explicit.toString());
        formData.append(`tracks[${index}][access_tier]`, track.access_tier);
        if (track.audio_file) {
          formData.append(`tracks[${index}][audio_file]`, track.audio_file);
        }
      });

      await api.put(`/artist/albums/${params.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Album updated successfully!');
      router.push(`/albums/${params.id}`);
    } catch (error: any) {
      console.error('Error updating album:', error);
      toast.error(error.response?.data?.error || 'Failed to update album');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'info',
      title: 'Album Info',
      description: 'Update basic album information',
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
        return true;
      },
    },
    {
      id: 'tracks',
      title: 'Manage Tracks',
      description: 'Update tracks and settings',
      icon: <FiHeadphones className="w-6 h-6" />,
      component: <TracksStep />,
      validation: async () => {
        if (tracks.length === 0) {
          toast.error('Album must have at least one track');
          return false;
        }
        for (const track of tracks) {
          if (!track.title) {
            toast.error('All tracks must have a title');
            return false;
          }
        }
        return true;
      },
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and save your changes',
      icon: <FiCheck className="w-6 h-6" />,
      component: <ReviewStep />,
    },
  ];

  if (fetchingAlbum) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading album...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard resource="Album" action="update">
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 md:pt-24 pb-8">
          <BackButton fallbackUrl="/artist/dashboard" label="Back to Dashboard" />
        </div>
        
        <CreationWizard
          steps={wizardSteps}
          onComplete={handleSubmit}
          onCancel={() => router.push(`/albums/${params.id}`)}
          title="Edit Album"
          subtitle="Update your album details"
        />
      </div>
    </PermissionGuard>
  );
}

