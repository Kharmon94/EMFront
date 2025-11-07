'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FiUpload, FiMusic, FiCalendar, FiDollarSign, FiX, FiPlus } from 'react-icons/fi';

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
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const [albumData, setAlbumData] = useState({
    title: '',
    description: '',
    release_date: '',
    price: '',
    upc: '',
  });

  const [tracks, setTracks] = useState<Track[]>([
    {
      title: '',
      duration: 0,
      track_number: 1,
      explicit: false,
      access_tier: 'free' as const,
    }
  ]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const addTrack = () => {
    setTracks([...tracks, {
      title: '',
      duration: 0,
      track_number: tracks.length + 1,
      explicit: false,
      access_tier: 'free',
    }]);
  };

  const removeTrack = (index: number) => {
    if (tracks.length === 1) {
      toast.error('Album must have at least one track');
      return;
    }
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const updateTrack = (index: number, field: keyof Track, value: any) => {
    const updated = [...tracks];
    updated[index] = { ...updated[index], [field]: value };
    setTracks(updated);
  };

  const handleAudioFileChange = (index: number, file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Audio file must be less than 50MB');
        return;
      }

      // Create audio element to get duration
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.src = url;
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.floor(audio.duration);
        updateTrack(index, 'duration', duration);
        URL.revokeObjectURL(url);
      });

      updateTrack(index, 'audio_file', file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!albumData.title || !albumData.release_date) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (tracks.some(t => !t.title)) {
        toast.error('All tracks must have a title');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('album[title]', albumData.title);
      formData.append('album[description]', albumData.description);
      formData.append('album[release_date]', albumData.release_date);
      if (albumData.price) formData.append('album[price]', albumData.price);
      if (albumData.upc) formData.append('album[upc]', albumData.upc);
      
      if (coverImage) {
        formData.append('cover_file', coverImage);
      }

      // Add tracks
      tracks.forEach((track, index) => {
        formData.append(`tracks[${index}][title]`, track.title);
        formData.append(`tracks[${index}][track_number]`, track.track_number.toString());
        formData.append(`tracks[${index}][duration]`, track.duration.toString());
        formData.append(`tracks[${index}][explicit]`, track.explicit.toString());
        formData.append(`tracks[${index}][access_tier]`, track.access_tier);
        if (track.price) formData.append(`tracks[${index}][price]`, track.price.toString());
        if (track.audio_file) formData.append(`tracks[${index}][audio_file]`, track.audio_file);
      });

      const response = await api.post('/albums', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Album created successfully!');
      router.push('/artist/albums');
    } catch (error: any) {
      console.error('Error creating album:', error);
      toast.error(error.response?.data?.error || 'Failed to create album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Upload Album</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new album to your discography
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Album Details */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-6">Album Details</h2>
              
              {/* Cover Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Album Cover *
                </label>
                <div className="flex items-center gap-4">
                  {coverPreview ? (
                    <div className="relative">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview('');
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Upload Cover</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recommended: 3000x3000px, JPG or PNG, max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Album Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Album Title *
                  </label>
                  <input
                    type="text"
                    value={albumData.title}
                    onChange={(e) => setAlbumData({ ...albumData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter album title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Release Date *
                  </label>
                  <input
                    type="date"
                    value={albumData.release_date}
                    onChange={(e) => setAlbumData({ ...albumData, release_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (SOL) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={albumData.price}
                    onChange={(e) => setAlbumData({ ...albumData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for free album</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    UPC - Optional
                  </label>
                  <input
                    type="text"
                    value={albumData.upc}
                    onChange={(e) => setAlbumData({ ...albumData, upc: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="012345678905"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={albumData.description}
                  onChange={(e) => setAlbumData({ ...albumData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell listeners about this album..."
                />
              </div>
            </div>

            {/* Tracks */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black dark:text-white">Tracks</h2>
                <button
                  type="button"
                  onClick={addTrack}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Track
                </button>
              </div>

              <div className="space-y-4">
                {tracks.map((track, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-black dark:text-white">Track {index + 1}</h3>
                      {tracks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTrack(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Track Title *
                        </label>
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) => updateTrack(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter track title"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Audio File *
                        </label>
                        <div className="flex items-center gap-4">
                          {track.audio_file ? (
                            <div className="flex-1 flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <FiMusic className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {track.audio_file.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(track.audio_file.size / (1024 * 1024)).toFixed(2)} MB
                                  {track.duration > 0 && ` • ${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updateTrack(index, 'audio_file', undefined);
                                  updateTrack(index, 'duration', 0);
                                }}
                                className="flex-shrink-0 text-red-500 hover:text-red-600"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                                <FiUpload className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Click to upload audio file (MP3, WAV, FLAC)
                                </span>
                              </div>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleAudioFileChange(index, e.target.files?.[0] || null)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={track.duration > 0 ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : 'Auto-detected'}
                          disabled
                          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Automatically detected from audio file</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Access Tier
                        </label>
                        <select
                          value={track.access_tier}
                          onChange={(e) => updateTrack(index, 'access_tier', e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="free">Free - Full Access</option>
                          <option value="preview_only">Preview Only (30s)</option>
                          <option value="nft_required">NFT Required</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={track.explicit}
                            onChange={(e) => updateTrack(index, 'explicit', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Explicit Content</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiUpload className="w-5 h-5" />
                    Create Album
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 Tips for uploading albums:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Cover art should be at least 3000x3000px for best quality</li>
              <li>• Upload audio files directly (MP3, WAV, FLAC up to 50MB per track)</li>
              <li>• Track duration is automatically detected from the audio file</li>
              <li>• Set access tiers per track (free, preview, or NFT-gated)</li>
              <li>• You can add more tracks later from the album management page</li>
            </ul>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

