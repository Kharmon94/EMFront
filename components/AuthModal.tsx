'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { FiX, FiMail, FiKey, FiUser } from 'react-icons/fi';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'wallet'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artistName, setArtistName] = useState('');
  const [role, setRole] = useState<'fan' | 'artist'>('fan');
  const [loading, setLoading] = useState(false);
  const { publicKey, signMessage } = useWallet();
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signin' ? '/auth/sign_in' : '/auth/sign_up';
      const payload: any = { email, password };
      
      if (mode === 'signup') {
        payload.role = role;
        if (role === 'artist' && artistName) {
          payload.artist_name = artistName;
        }
      }

      const response = await api.post(endpoint, payload);
      
      // Store token using ApiClient's setToken method to update both localStorage AND the instance
      if (response.data.token) {
        api.setToken(response.data.token);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('auth-change'));
      }
      
      toast.success(mode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
      onSuccess?.();
      onClose();
      
      // Redirect based on user role
      const user = response.data.user;
      if (user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.role === 'artist') {
        router.push('/artist/dashboard');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${mode === 'signin' ? 'sign in' : 'sign up'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAuth = async () => {
    if (!publicKey || !signMessage) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Create message to sign
      const message = `Sign this message to ${mode === 'signin' ? 'sign in' : 'sign up'} to EncryptedMedia\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      const endpoint = mode === 'signin' ? '/auth/sign_in' : '/auth/sign_up';
      const payload: any = {
        wallet_address: publicKey.toString(),
        signature: Buffer.from(signature).toString('hex'),
        message
      };
      
      if (mode === 'signup') {
        payload.role = role;
        if (role === 'artist' && artistName) {
          payload.artist_name = artistName;
        }
      }

      const response = await api.post(endpoint, payload);
      
      // Store token using ApiClient's setToken method to update both localStorage AND the instance
      if (response.data.token) {
        api.setToken(response.data.token);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('auth-change'));
      }
      
      toast.success(mode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
      onSuccess?.();
      onClose();
      
      // Redirect based on user role
      const user = response.data.user;
      if (user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.role === 'artist') {
        router.push('/artist/dashboard');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${mode === 'signin' ? 'sign in' : 'sign up'}`);
    } finally {
      setLoading(false);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setMode('signin')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      mode === 'signin'
                        ? 'bg-white text-black'
                        : 'bg-gray-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      mode === 'signup'
                        ? 'bg-white text-black'
                        : 'bg-gray-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Auth Method Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      authMethod === 'email'
                        ? 'bg-gray-900 text-white border border-gray-700'
                        : 'bg-transparent text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    <FiMail size={18} />
                    Email
                  </button>
                  <button
                    onClick={() => setAuthMethod('wallet')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      authMethod === 'wallet'
                        ? 'bg-gray-900 text-white border border-gray-700'
                        : 'bg-transparent text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    <FiKey size={18} />
                    Wallet
                  </button>
                </div>

                {/* Email Form */}
                {authMethod === 'email' && (
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'signup' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            I am a...
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setRole('fan')}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                role === 'fan'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-900 text-gray-400 hover:text-white'
                              }`}
                            >
                              Fan
                            </button>
                            <button
                              type="button"
                              onClick={() => setRole('artist')}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                role === 'artist'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-900 text-gray-400 hover:text-white'
                              }`}
                            >
                              Artist
                            </button>
                          </div>
                        </div>

                        {role === 'artist' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Artist Name
                            </label>
                            <input
                              type="text"
                              value={artistName}
                              onChange={(e) => setArtistName(e.target.value)}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-600"
                              placeholder="Your artist name"
                            />
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-600"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-600"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  </form>
                )}

                {/* Wallet Auth */}
                {authMethod === 'wallet' && (
                  <div className="space-y-4">
                    {mode === 'signup' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            I am a...
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setRole('fan')}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                role === 'fan'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-900 text-gray-400 hover:text-white'
                              }`}
                            >
                              Fan
                            </button>
                            <button
                              type="button"
                              onClick={() => setRole('artist')}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                role === 'artist'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-900 text-gray-400 hover:text-white'
                              }`}
                            >
                              Artist
                            </button>
                          </div>
                        </div>

                        {role === 'artist' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Artist Name
                            </label>
                            <input
                              type="text"
                              value={artistName}
                              onChange={(e) => setArtistName(e.target.value)}
                              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-600"
                              placeholder="Your artist name"
                            />
                          </div>
                        )}
                      </>
                    )}

                    <div className="text-center">
                      {!publicKey ? (
                        <div>
                          <p className="text-gray-400 text-sm mb-4">
                            Connect your Solana wallet to continue
                          </p>
                          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg" />
                        </div>
                      ) : (
                        <button
                          onClick={handleWalletAuth}
                          disabled={loading}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Loading...' : mode === 'signin' ? 'Sign In with Wallet' : 'Create Account with Wallet'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Guest Option */}
                <div className="mt-6 text-center">
                  <button
                    onClick={onClose}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Continue as guest
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

