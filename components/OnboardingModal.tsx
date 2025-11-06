'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiMusic, FiDollarSign, FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AuthModal } from './AuthModal';

const slides = [
  {
    icon: FiMusic,
    title: 'Discover Music on Web3',
    description: 'Stream unlimited music from independent artists. Your streams directly support creators through blockchain technology.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FiDollarSign,
    title: 'Support Artists Directly',
    description: 'Buy artist tokens, collect NFTs, and earn rewards. Artists keep more of what they earn, and fans benefit too.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: FiShoppingBag,
    title: 'Trade & Collect',
    description: 'Trade artist tokens on the DEX, collect exclusive NFTs, and access premium content. Your music collection is truly yours.',
    gradient: 'from-purple-500 to-pink-500'
  }
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const hasToken = localStorage.getItem('token');
    
    // Show onboarding if first visit and not authenticated
    if (!hasSeenOnboarding && !hasToken) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = () => {
    handleClose();
    setShowAuthModal(true);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden bg-black border border-gray-800 rounded-2xl text-left align-middle shadow-xl transition-all">
                  {/* Close button */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={handleClose}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  {/* Mobile: Swipeable cards */}
                  <div className="relative">
                    <div className="p-8 md:p-12 min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center text-center">
                      {/* Icon with gradient */}
                      <div className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${slide.gradient} rounded-full flex items-center justify-center mb-8`}>
                        <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                      </div>

                      {/* Title */}
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {slide.title}
                      </h2>

                      {/* Description */}
                      <p className="text-lg text-gray-300 mb-8 max-w-xl">
                        {slide.description}
                      </p>

                      {/* Slide indicators */}
                      <div className="flex gap-2 mb-8">
                        {slides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${
                              index === currentSlide
                                ? 'w-8 bg-white'
                                : 'w-2 bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between w-full max-w-md gap-4">
                        {currentSlide > 0 ? (
                          <button
                            onClick={handlePrev}
                            className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
                          >
                            <FiChevronLeft size={20} />
                            <span className="font-medium">Back</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleClose}
                            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                          >
                            Skip
                          </button>
                        )}

                        {currentSlide < slides.length - 1 ? (
                          <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-black font-medium rounded-lg transition-colors"
                          >
                            <span>Next</span>
                            <FiChevronRight size={20} />
                          </button>
                        ) : (
                          <button
                            onClick={handleGetStarted}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          >
                            Get Started
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
      />
    </>
  );
}

