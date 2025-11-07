'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface GestureTutorialProps {
  feature: string;
  gestures: {
    action: string;
    description: string;
  }[];
  onDismiss: () => void;
}

export function GestureTutorial({ feature, gestures, onDismiss }: GestureTutorialProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if tutorial has been shown for this feature
    const tutorialKey = `gesture_tutorial_${feature}`;
    const hasSeenTutorial = localStorage.getItem(tutorialKey);

    if (!hasSeenTutorial) {
      setVisible(true);
    }
  }, [feature]);

  const handleDismiss = () => {
    const tutorialKey = `gesture_tutorial_${feature}`;
    localStorage.setItem(tutorialKey, 'true');
    setVisible(false);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <FiX className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gesture Guide
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Use these gestures to navigate {feature}
        </p>

        {/* Gestures List */}
        <div className="space-y-4 mb-6">
          {gestures.map((gesture, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👆</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {gesture.action}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {gesture.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <button
          onClick={handleDismiss}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

