'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function DeleteAccountModal({ isOpen, onClose, user }: DeleteAccountModalProps) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canDelete, setCanDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const expectedText = 'DELETE MY ACCOUNT';

  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanDelete(true);
    }
  }, [step, countdown]);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setStep(1);
      setConfirmText('');
      setPassword('');
      setUnderstood(false);
      setCountdown(5);
      setCanDelete(false);
    }
  }, [isOpen]);

  const handleNextStep = () => {
    if (step === 1 && confirmText === expectedText && understood) {
      setStep(2);
    }
  };

  const handleDeleteAccount = async () => {
    if (!canDelete) return;

    setDeleting(true);
    try {
      await api.delete('/users/account', {
        data: {
          password: user.has_email_auth ? password : undefined,
        }
      });

      toast.success('Account deleted successfully. You will be redirected...');
      
      // Clear auth and redirect
      api.clearToken();
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

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
          <div className="fixed inset-0 bg-black/90" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 border-2 border-red-500/50 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
                      <FiAlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-red-500">
                        {step === 1 ? 'Delete Account' : 'Final Confirmation'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-400">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {step === 1 ? (
                  /* Step 1: Warning and Consequences */
                  <div className="space-y-6">
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 font-bold text-lg mb-2">
                        ⚠️ WARNING: PERMANENT DELETION
                      </p>
                      <p className="text-gray-300 text-sm">
                        You are about to permanently delete your account. This is irreversible and will result in the permanent loss of all your data.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-white font-bold text-lg mb-3">What will be deleted:</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <FiTrash2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">All Uploaded Content</p>
                            <p className="text-sm text-gray-400">Albums, tracks, videos, mini's, livestreams - permanently deleted</p>
                          </div>
                        </div>

                        {user?.role === 'artist' && user?.artist?.has_token && (
                          <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-400 font-bold">Artist Token Destroyed</p>
                              <p className="text-sm text-red-300">
                                Your ${user.artist?.token_symbol} token will be permanently destroyed. 
                                You CANNOT recreate it with the same name/wallet. Token holders will lose value.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <FiTrash2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">All Purchases & Tickets</p>
                            <p className="text-sm text-gray-400">Your purchase history, event tickets, NFTs - all lost</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <FiTrash2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">Revenue History Lost</p>
                            <p className="text-sm text-gray-400">All earnings data, transaction history - permanently erased</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <FiTrash2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">Followers & Fans Lose Access</p>
                            <p className="text-sm text-gray-400">Your followers will no longer be able to access your content or profile</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <FiTrash2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">Username & Wallet Cannot Be Recovered</p>
                            <p className="text-sm text-gray-400">You won't be able to re-register with this email or wallet address</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <FiTrash2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">All Social Interactions</p>
                            <p className="text-sm text-gray-400">Comments, likes, follows - all permanently removed</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-400 font-bold mb-2">
                        💡 Need a break instead?
                      </p>
                      <p className="text-gray-300 text-sm">
                        Consider just signing out or taking a break. Deletion is permanent and cannot be undone. 
                        There is no recovery period.
                      </p>
                    </div>

                    {/* Confirmation Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type <span className="font-bold text-red-400">{expectedText}</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                        placeholder="Type here..."
                      />
                      {confirmText && confirmText !== expectedText && (
                        <p className="text-xs text-red-400 mt-1">Text does not match. Please type exactly: {expectedText}</p>
                      )}
                    </div>

                    {/* Understanding Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={understood}
                        onChange={(e) => setUnderstood(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded bg-gray-800 border-gray-700 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-300">
                        I understand this is permanent and cannot be undone. All my data, content, and earnings will be permanently deleted. This action is irreversible.
                      </span>
                    </label>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={confirmText !== expectedText || !understood}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                      >
                        Continue to Final Step
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Password Confirmation and Final Delete */
                  <div className="space-y-6">
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 font-bold text-lg mb-2">
                        🔒 FINAL CONFIRMATION REQUIRED
                      </p>
                      <p className="text-gray-300 text-sm">
                        This is your last chance to cancel. Once you click delete, your account will be permanently removed.
                      </p>
                    </div>

                    {user?.has_email_auth && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Enter your password to confirm
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                          placeholder="Your password"
                        />
                      </div>
                    )}

                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      {countdown > 0 ? (
                        <>
                          <p className="text-gray-400 text-sm mb-2">Please wait before you can delete your account</p>
                          <p className="text-4xl font-bold text-white">{countdown}</p>
                        </>
                      ) : (
                        <p className="text-green-400 font-medium">You can now delete your account</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel - Keep My Account
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={!canDelete || (user?.has_email_auth && !password) || deleting}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        {deleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FiTrash2 className="w-4 h-4" />
                            DELETE MY ACCOUNT
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

