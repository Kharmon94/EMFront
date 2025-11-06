'use client';

import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiInfo } from 'react-icons/fi';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

interface ConnectWalletPromptProps {
  isOpen: boolean;
  onClose: () => void;
  actionName: string;
  onConnected?: () => void;
}

export function ConnectWalletPrompt({ 
  isOpen, 
  onClose, 
  actionName,
  onConnected 
}: ConnectWalletPromptProps) {
  const { publicKey } = useWallet();

  // Auto-close and trigger callback when wallet connects
  useEffect(() => {
    if (publicKey && onConnected) {
      onConnected();
      onClose();
    }
  }, [publicKey, onConnected, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 text-left align-middle shadow-xl transition-all md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-xl md:text-2xl font-bold text-white">
                    Connect Wallet Required
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center md:min-w-0 md:min-h-0"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 text-base md:text-lg mb-4">
                    Connect your Solana wallet to <span className="text-white font-medium">{actionName}</span>
                  </p>

                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <FiInfo className="text-blue-400" size={20} />
                      </div>
                      <div className="text-sm text-gray-400">
                        <p className="font-medium text-white mb-1">Why do I need a wallet?</p>
                        <p>
                          Blockchain transactions require a Solana wallet. This ensures you truly own your purchases, tokens, and NFTs. No one can take them away!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <WalletMultiButton className="!w-full !min-h-[48px] !bg-blue-600 hover:!bg-blue-700 !rounded-lg !font-medium !text-base" />
                    
                    <button
                      onClick={onClose}
                      className="w-full min-h-[48px] py-3 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      Maybe later
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

