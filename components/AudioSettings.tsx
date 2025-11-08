'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiSettings } from 'react-icons/fi';
import { usePlayerStore } from '@/lib/store/playerStore';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioSettings({ isOpen, onClose }: AudioSettingsProps) {
  const { playbackSpeed, setPlaybackSpeed, crossfade, setCrossfade } = usePlayerStore();
  const [quality, setQuality] = useState<'auto' | 'high' | 'standard'>('auto');
  const [volumeNormalization, setVolumeNormalization] = useState(true);
  const [bassBoost, setBassBoost] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedQuality = localStorage.getItem('audio_quality') as any;
      const savedNormalization = localStorage.getItem('volume_normalization');
      const savedBassBoost = localStorage.getItem('bass_boost');
      
      if (savedQuality) setQuality(savedQuality);
      if (savedNormalization) setVolumeNormalization(savedNormalization === 'true');
      if (savedBassBoost) setBassBoost(savedBassBoost === 'true');
    }
  }, []);

  const handleQualityChange = (newQuality: 'auto' | 'high' | 'standard') => {
    setQuality(newQuality);
    localStorage.setItem('audio_quality', newQuality);
  };

  const handleNormalizationToggle = () => {
    const newValue = !volumeNormalization;
    setVolumeNormalization(newValue);
    localStorage.setItem('volume_normalization', newValue.toString());
  };

  const handleBassBoostToggle = () => {
    const newValue = !bassBoost;
    setBassBoost(newValue);
    localStorage.setItem('bass_boost', newValue.toString());
  };

  const playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiSettings /> Audio Settings
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-900 dark:text-white" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Quality Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Audio Quality
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'auto', label: 'Auto', description: 'Adapts to connection' },
                        { value: 'high', label: 'High', description: '320kbps (more data)' },
                        { value: 'standard', label: 'Standard', description: '128kbps (less data)' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleQualityChange(option.value as any)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            quality === option.value
                              ? 'border-purple-600 bg-purple-600/10 dark:bg-purple-600/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Playback Speed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Playback Speed
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {playbackSpeeds.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            playbackSpeed === speed
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Crossfade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Crossfade: {crossfade}s
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={crossfade}
                      onChange={(e) => setCrossfade(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <span>Off</span>
                      <span>12s</span>
                    </div>
                  </div>

                  {/* Volume Normalization */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Volume Normalization</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Consistent volume across tracks</div>
                    </div>
                    <button
                      onClick={handleNormalizationToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        volumeNormalization ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          volumeNormalization ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Bass Boost */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Bass Boost</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Enhanced low frequencies</div>
                    </div>
                    <button
                      onClick={handleBassBoostToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        bassBoost ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          bassBoost ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

