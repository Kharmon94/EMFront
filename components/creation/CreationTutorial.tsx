'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

export interface TutorialStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface CreationTutorialProps {
  steps: TutorialStep[];
  tutorialKey: string; // Unique key for localStorage
  onComplete?: () => void;
  onSkip?: () => void;
}

export function CreationTutorial({
  steps,
  tutorialKey,
  onComplete,
  onSkip,
}: CreationTutorialProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Check if tutorial has been completed
    const completed = localStorage.getItem(`tutorial_${tutorialKey}`);
    if (!completed) {
      // Wait for DOM to be ready
      setTimeout(() => setIsActive(true), 500);
    }
  }, [tutorialKey]);

  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;

    if (element) {
      setTargetElement(element);

      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      switch (step.position || 'bottom') {
        case 'top':
          top = rect.top + scrollY - 180;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 20;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 380;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 20;
          break;
      }

      setTooltipPosition({ top, left });

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add highlight class
      element.classList.add('tutorial-highlight');
    }

    return () => {
      if (element) {
        element.classList.remove('tutorial-highlight');
      }
    };
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    const step = steps[currentStep];
    if (step.action) {
      step.action.onClick();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tutorial_${tutorialKey}`, 'true');
    setIsActive(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(`tutorial_${tutorialKey}`, 'true');
    setIsActive(false);
    onSkip?.();
  };

  if (!isActive) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={handleSkip}
      />

      {/* Spotlight */}
      <AnimatePresence>
        {targetElement && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: targetElement.getBoundingClientRect().top + window.scrollY - 8,
              left: targetElement.getBoundingClientRect().left + window.scrollX - 8,
              width: targetElement.offsetWidth + 16,
              height: targetElement.offsetHeight + 16,
              boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
            }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[10000] w-96"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-purple-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                {currentStep + 1}
              </div>
              <h3 className="text-lg font-bold text-white">
                {step.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {step.content}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-purple-600 w-8'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`p-2 rounded-lg transition-all ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg transition-all"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Got it!
                  </>
                ) : (
                  <>
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full px-6 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Pointer Arrow */}
        <div
          className={`absolute w-0 h-0 ${
            step.position === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent border-b-purple-600'
              : step.position === 'left'
              ? 'right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-transparent border-r-purple-600'
              : step.position === 'right'
              ? 'left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-transparent border-l-purple-600'
              : 'top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-transparent border-t-purple-600'
          }`}
        />
      </motion.div>

      {/* Global Styles for Highlight */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999 !important;
          animation: tutorial-pulse 2s infinite;
        }

        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
          }
        }
      `}</style>
    </>
  );
}

