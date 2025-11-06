'use client';

import { useState, useEffect } from 'react';
import { FiX, FiLock } from 'react-icons/fi';
import { AuthModal } from './AuthModal';

interface GuestPromptProps {
  message?: string;
  ctaText?: string;
  dismissible?: boolean;
}

export function GuestPrompt({ 
  message = "Sign up to unlock all features", 
  ctaText = "Create Account",
  dismissible = true 
}: GuestPromptProps) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if previously dismissed (if dismissible)
  useEffect(() => {
    if (dismissible) {
      const isDismissed = localStorage.getItem('guestPromptDismissed');
      setDismissed(isDismissed === 'true');
    }
  }, [dismissible]);

  const handleDismiss = () => {
    if (dismissible) {
      setDismissed(true);
      localStorage.setItem('guestPromptDismissed', 'true');
    }
  };

  if (dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 border border-gray-800 rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiLock className="text-white" size={20} />
          </div>
          <p className="text-white text-sm font-medium">{message}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
          >
            {ctaText}
          </button>
          
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultMode="signup"
      />
    </>
  );
}

interface FeatureLockProps {
  featureName: string;
  children?: React.ReactNode;
}

export function FeatureLock({ featureName, children }: FeatureLockProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="relative group cursor-pointer"
      >
        {children}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <FiLock className="text-white mb-2" size={32} />
          <p className="text-white font-medium text-sm">Create account to access</p>
          <p className="text-gray-300 text-xs">{featureName}</p>
        </div>
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultMode="signup"
      />
    </>
  );
}

