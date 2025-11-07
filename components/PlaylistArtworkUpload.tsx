'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface PlaylistArtworkUploadProps {
  playlistId?: number;
  currentArtwork?: string;
  onUploadComplete: (url: string) => void;
}

export function PlaylistArtworkUpload({ playlistId, currentArtwork, onUploadComplete }: PlaylistArtworkUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentArtwork || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    if (playlistId) {
      await uploadArtwork(file);
    }
  };

  const uploadArtwork = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('artwork', file);

      const response = await api.post(`/playlists/${playlistId}/upload_artwork`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const artworkUrl = response.data.custom_cover_url;
      onUploadComplete(artworkUrl);
      toast.success('Artwork uploaded successfully!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.error || 'Failed to upload artwork');
      setPreview(currentArtwork || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveArtwork = async () => {
    if (!playlistId) {
      setPreview(null);
      onUploadComplete('');
      return;
    }

    try {
      await api.delete(`/playlists/${playlistId}/remove_artwork`);
      setPreview(null);
      onUploadComplete('');
      toast.success('Artwork removed');
    } catch (error) {
      toast.error('Failed to remove artwork');
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        Playlist Artwork
      </label>
      
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Playlist artwork"
                className="w-full h-full object-cover"
              />
              {!uploading && (
                <button
                  onClick={handleRemoveArtwork}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  aria-label="Remove artwork"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <FiImage className="w-12 h-12 mb-2" />
              <span className="text-xs">No artwork</span>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            {preview ? 'Change Artwork' : 'Upload Artwork'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Recommended: Square image, at least 400x400px, max 5MB
          </p>
        </div>
      </div>
    </div>
  );
}

