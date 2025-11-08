'use client';

import { ReactNode, useState } from 'react';
import { FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  component: ReactNode;
  validation?: () => boolean | Promise<boolean>;
}

interface CreationWizardProps {
  steps: WizardStep[];
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
  title: string;
  subtitle?: string;
}

export function CreationWizard({ 
  steps, 
  onComplete, 
  onCancel,
  title,
  subtitle 
}: CreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const handleNext = async () => {
    const step = steps[currentStep];
    
    // Run validation if provided
    if (step.validation) {
      setIsValidating(true);
      try {
        const isValid = await step.validation();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      } catch (error) {
        console.error('Validation error:', error);
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    // Mark step as completed
    setCompletedSteps(prev => new Set(prev).add(currentStep));

    // Move to next step or complete
    if (currentStep === steps.length - 1) {
      await onComplete();
    } else {
      setDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('back');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStep || completedSteps.has(index - 1)) {
      setDirection(index > currentStep ? 'forward' : 'back');
      setCurrentStep(index);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const isAccessible = index < currentStep || completedSteps.has(index - 1) || index === 0;

              return (
                <motion.button
                  key={step.id}
                  onClick={() => isAccessible && handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`relative flex flex-col items-center gap-2 ${
                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  whileHover={isAccessible ? { scale: 1.05 } : undefined}
                  whileTap={isAccessible ? { scale: 0.95 } : undefined}
                >
                  {/* Step Circle */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                        : isCurrent
                        ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/50 ring-4 ring-purple-600/20'
                        : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-2 border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <FiCheck className="w-8 h-8" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="text-center max-w-[120px]">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-8 left-[calc(50%+2rem)] w-[calc(100%+4rem)] h-0.5 bg-gray-300 dark:bg-gray-700 -z-10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                        initial={{ width: 0 }}
                        animate={{
                          width: isCompleted ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-blue-100">
              {currentStepData.description}
            </p>
          </div>

          {/* Animated Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{
                  opacity: 0,
                  x: direction === 'forward' ? 50 : -50,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: direction === 'forward' ? -50 : 50,
                }}
                transition={{ duration: 0.3 }}
              >
                {currentStepData.component}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700'
              }`}
            >
              <FiChevronLeft />
              Back
            </button>

            <div className="flex items-center gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 rounded-lg font-medium transition-all bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={isValidating}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Validating...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    <FiCheck />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <FiChevronRight />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

