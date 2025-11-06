'use client';

import { useEffect, useState, Fragment } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Menu, Transition } from '@headlessui/react';
import { FiUser, FiMail, FiKey, FiSettings, FiLogOut, FiChevronDown, FiLink } from 'react-icons/fi';
import { formatWalletAddress } from '@/lib/utils';
import { AuthModal } from './AuthModal';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface User {
  id: number;
  email?: string;
  wallet_address?: string;
  role: string;
  auth_methods: string[];
  has_email_auth: boolean;
  has_wallet_auth: boolean;
  artist?: any;
}

export function AccountButton() {
  const { publicKey, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/v1/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.delete('/api/v1/auth/sign_out');
      localStorage.removeItem('token');
      setUser(null);
      if (publicKey) {
        await disconnect();
      }
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="relative">
        <div className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 text-sm font-medium rounded-lg min-w-[100px] text-center">
          Loading...
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-4 py-2 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded-lg transition-colors"
        >
          Sign In
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={fetchCurrentUser}
        />
      </>
    );
  }

  // Authenticated - show account menu
  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white text-sm font-medium rounded-lg transition-colors min-h-[48px] md:min-h-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.email ? user.email[0].toUpperCase() : user.wallet_address?.[0].toUpperCase()}
          </div>
          <span className="hidden md:inline max-w-[120px] truncate">
            {user.email || (user.wallet_address && formatWalletAddress(user.wallet_address))}
          </span>
          <FiChevronDown className="hidden md:block" size={16} />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-gray-800 rounded-lg bg-black border border-gray-800 shadow-lg focus:outline-none z-50">
            {/* User Info Section */}
            <div className="px-4 py-3">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="text-sm font-medium text-white truncate">
                {user.email || formatWalletAddress(user.wallet_address || '')}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded">
                {user.role}
              </span>
            </div>

            {/* Auth Methods Section */}
            <div className="px-1 py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                Connected Methods
              </div>
              
              {/* Email Auth Status */}
              <div className="px-3 py-2 flex items-center gap-2 text-sm">
                <FiMail className={user.has_email_auth ? 'text-green-400' : 'text-gray-600'} />
                <span className={user.has_email_auth ? 'text-gray-300' : 'text-gray-600'}>
                  Email {user.has_email_auth ? `(${user.email})` : '(Not connected)'}
                </span>
              </div>
              
              {/* Wallet Auth Status */}
              <div className="px-3 py-2 flex items-center gap-2 text-sm">
                <FiKey className={user.has_wallet_auth ? 'text-green-400' : 'text-gray-600'} />
                <span className={user.has_wallet_auth ? 'text-gray-300' : 'text-gray-600'}>
                  Wallet {user.has_wallet_auth ? `(${formatWalletAddress(user.wallet_address || '')})` : '(Not connected)'}
                </span>
              </div>

              {/* Link Missing Auth Method */}
              {!user.has_wallet_auth && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/settings/account')}
                      className={`${
                        active ? 'bg-gray-900' : ''
                      } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-400 hover:text-blue-300`}
                    >
                      <FiLink size={16} />
                      Link Wallet
                    </button>
                  )}
                </Menu.Item>
              )}
              
              {!user.has_email_auth && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/settings/account')}
                      className={`${
                        active ? 'bg-gray-900' : ''
                      } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-400 hover:text-blue-300`}
                    >
                      <FiLink size={16} />
                      Link Email
                    </button>
                  )}
                </Menu.Item>
              )}
            </div>

            {/* Navigation Items */}
            <div className="px-1 py-1">
              {user.role === 'artist' && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/artist/dashboard')}
                      className={`${
                        active ? 'bg-gray-900 text-white' : 'text-gray-300'
                      } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm min-h-[48px] md:min-h-0`}
                    >
                      <FiUser size={16} />
                      Artist Dashboard
                    </button>
                  )}
                </Menu.Item>
              )}
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push('/settings')}
                    className={`${
                      active ? 'bg-gray-900 text-white' : 'text-gray-300'
                    } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm min-h-[48px] md:min-h-0`}
                  >
                    <FiSettings size={16} />
                    Settings
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Sign Out */}
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={`${
                      active ? 'bg-red-900/20 text-red-400' : 'text-red-500'
                    } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm min-h-[48px] md:min-h-0`}
                  >
                    <FiLogOut size={16} />
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}

