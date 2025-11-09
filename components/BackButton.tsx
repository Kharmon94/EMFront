'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
}

export function BackButton({ 
  fallbackUrl = '/', 
  label = 'Back',
  className = ''
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Navigate to fallback URL
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all ${className}`}
      aria-label="Go back"
    >
      <FiArrowLeft className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

