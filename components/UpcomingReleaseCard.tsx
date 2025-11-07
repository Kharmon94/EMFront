'use client';

import Link from 'next/link';
import { FiClock, FiMusic, FiDisc } from 'react-icons/fi';
import { PreSaveButton } from './PreSaveButton';

interface UpcomingReleaseCardProps {
  type: 'album' | 'track';
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  releaseDate: string;
  coverUrl?: string;
  description?: string;
}

export function UpcomingReleaseCard({ type, id, title, artist, releaseDate, coverUrl, description }: UpcomingReleaseCardProps) {
  const daysUntilRelease = Math.ceil((new Date(releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const releaseDateFormatted = new Date(releaseDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Cover */}
        <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {type === 'album' ? (
                <FiDisc className="w-12 h-12" />
              ) : (
                <FiMusic className="w-12 h-12" />
              )}
            </div>
          )}
          
          {/* Coming Soon Badge */}
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
            {daysUntilRelease === 0 ? 'OUT TODAY!' : `${daysUntilRelease}d`}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1">
            <Link
              href={type === 'album' ? `/music/albums/${id}` : `/music/tracks/${id}`}
              className="font-bold text-lg text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-1"
            >
              {title}
            </Link>
            
            <Link
              href={`/artists/${artist.id}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {artist.name}
            </Link>
            
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500 dark:text-gray-500">
              <FiClock className="w-4 h-4" />
              <span>{releaseDateFormatted}</span>
            </div>
            
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Pre-Save Button */}
          <div className="mt-3">
            <PreSaveButton
              contentType={type === 'album' ? 'Album' : 'Track'}
              contentId={id}
              title={title}
              releaseDate={releaseDate}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}

