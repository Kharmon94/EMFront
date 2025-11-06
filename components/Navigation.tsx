'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, Fragment, useEffect } from 'react';
import { AccountButton } from './AccountButton';
import { NotificationBell } from './NotificationBell';
import { AuthModal } from './AuthModal';
import { Menu, Transition, Dialog } from '@headlessui/react';
import api from '@/lib/api';
import { 
  FiHome, 
  FiCompass,
  FiTrendingUp,
  FiCalendar, 
  FiRadio, 
  FiShoppingBag,
  FiMenu,
  FiX,
  FiVideo,
  FiFilm,
  FiMusic,
  FiSearch,
  FiChevronDown,
  FiList,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMail,
  FiKey,
  FiShield
} from 'react-icons/fi';

const mainNavItems = [
  { href: '/', label: 'Home', icon: FiHome, mobile: true },
  {
    label: 'Discover',
    icon: FiCompass,
    mobile: true,
    dropdown: [
      { href: '/music', label: 'Music', icon: FiMusic },
      { href: '/videos', label: 'Videos', icon: FiVideo },
      { href: '/minis', label: "Mini's", icon: FiFilm },
      { href: '/events', label: 'Events', icon: FiCalendar },
    ]
  },
  { href: '/tokens', label: 'Tokens', icon: FiTrendingUp, mobile: true },
];

const moreNavItems = [
  { href: '/livestreams', label: 'Live', icon: FiRadio },
  { href: '/shop', label: 'Shop', icon: FiShoppingBag },
  { href: '/playlists', label: 'Playlists', icon: FiList },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [discoverMenuOpen, setDiscoverMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchUser();
      } else {
        setUser(null);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isDropdownActive = (items: any[]) => {
    return items.some(item => isActive(item.href));
  };

  return (
    <>
      {/* Desktop Navigation - Horizontal Top Bar */}
      <nav className="hidden md:block sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <FiMusic className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                EncryptedMedia
              </span>
            </Link>

            {/* Centered Navigation */}
            <div className="flex items-center space-x-1">
              {mainNavItems.map((item, index) => {
                if (item.dropdown) {
                  // Dropdown menu
                  return (
                    <Menu as="div" key={index} className="relative">
                      <Menu.Button 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          isDropdownActive(item.dropdown)
                            ? 'bg-white text-black'
                            : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        <FiChevronDown className="w-3 h-3" />
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
                        <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-lg bg-black border border-gray-800 shadow-xl focus:outline-none">
                          <div className="py-1">
                            {item.dropdown.map((subItem) => (
                              <Menu.Item key={subItem.href}>
                                {({ active }) => (
                                  <Link
                                    href={subItem.href}
                                    className={`${
                                      active || isActive(subItem.href)
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300'
                                    } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                                  >
                                    <subItem.icon className="w-4 h-4" />
                                    {subItem.label}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  );
                } else if (item.href) {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive(item.href)
                          ? 'bg-white text-black'
                          : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }
              })}
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-300 hover:bg-gray-900 hover:text-white rounded-lg transition-colors"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <NotificationBell />
              <AccountButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
          <div className="flex items-center justify-between h-14 px-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                EM
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-300"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 pb-safe">
          <div className="flex items-center justify-around h-16">
            {mainNavItems.filter(item => item.mobile).map((item, index) => {
              if (item.dropdown) {
                const active = isDropdownActive(item.dropdown);
                return (
                  <button
                    key={index}
                    onClick={() => setDiscoverMenuOpen(true)}
                    className={`flex flex-col items-center justify-center flex-1 min-h-[48px] ${
                      active ? 'text-blue-400' : 'text-gray-400'
                    }`}
                  >
                    <item.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              } else if (item.href) {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center flex-1 min-h-[48px] ${
                      active ? 'text-blue-400' : 'text-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              }
            })}
            
            {/* Profile button */}
            <button
              onClick={() => setProfileMenuOpen(true)}
              className="flex flex-col items-center justify-center flex-1 min-h-[48px] text-gray-400"
            >
              <FiUser className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>

        {/* Mobile Discover Drawer */}
        <Transition appear show={discoverMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setDiscoverMenuOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/80" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-300"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                      <div className="flex h-full flex-col overflow-y-auto bg-black border-l border-gray-800">
                        <div className="p-4 border-b border-gray-800">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-bold text-white">
                              Discover
                            </Dialog.Title>
                            <button
                              onClick={() => setDiscoverMenuOpen(false)}
                              className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400"
                            >
                              <FiX className="w-6 h-6" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                          {/* Discover submenu items */}
                          {mainNavItems
                            .find(item => item.dropdown)
                            ?.dropdown?.map((subItem) => {
                              const Icon = subItem.icon;
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setDiscoverMenuOpen(false)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-lg min-h-[48px] ${
                                    isActive(subItem.href)
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-300 hover:bg-gray-900'
                                  }`}
                                >
                                  <Icon className="w-5 h-5" />
                                  <span className="font-medium">{subItem.label}</span>
                                </Link>
                              );
                            })}

                          {/* Additional discover items */}
                          {moreNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setDiscoverMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg min-h-[48px] ${
                                  isActive(item.href)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-900'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Mobile Profile Drawer */}
        <Transition appear show={profileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setProfileMenuOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/80" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-300"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                      <div className="flex h-full flex-col overflow-y-auto bg-black border-l border-gray-800">
                        <div className="p-4 border-b border-gray-800">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-bold text-white">
                              {user ? 'Account' : 'Sign In'}
                            </Dialog.Title>
                            <button
                              onClick={() => setProfileMenuOpen(false)}
                              className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400"
                            >
                              <FiX className="w-6 h-6" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                          {/* User Info Section */}
                          {user ? (
                            <>
                              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {user.email ? user.email[0].toUpperCase() : user.wallet_address?.[0].toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">
                                      {user.email || (user.wallet_address ? `${user.wallet_address.slice(0, 4)}...${user.wallet_address.slice(-4)}` : 'User')}
                                    </p>
                                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Artist Dashboard Link (if artist) */}
                              {user.role === 'artist' && (
                                <Link
                                  href="/artist/dashboard"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-lg min-h-[48px] ${
                                    isActive('/artist/dashboard')
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-300 hover:bg-gray-900'
                                  }`}
                                >
                                  <FiUser className="w-5 h-5" />
                                  <span className="font-medium">Artist Dashboard</span>
                                </Link>
                              )}

                              {/* Admin Dashboard Link (if admin) */}
                              {user.role === 'admin' && (
                                <Link
                                  href="/admin"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-lg min-h-[48px] ${
                                    isActive('/admin')
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-300 hover:bg-gray-900'
                                  }`}
                                >
                                  <FiShield className="w-5 h-5" />
                                  <span className="font-medium">Admin Dashboard</span>
                                </Link>
                              )}

                              {/* Settings Link */}
                              <Link
                                href="/settings"
                                onClick={() => setProfileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg min-h-[48px] ${
                                  isActive('/settings')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-900'
                                }`}
                              >
                                <FiSettings className="w-5 h-5" />
                                <span className="font-medium">Settings</span>
                              </Link>

                              <div className="h-px bg-gray-800 my-4" />

                              {/* Connected Methods Section */}
                              <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                                  Connected Methods
                                </p>
                                
                                {/* Email Auth Status */}
                                <div className="px-4 py-3 flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    user.has_email_auth ? 'bg-green-900/30' : 'bg-gray-900'
                                  }`}>
                                    <FiMail className={`w-5 h-5 ${user.has_email_auth ? 'text-green-400' : 'text-gray-600'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${user.has_email_auth ? 'text-white' : 'text-gray-500'}`}>
                                      Email
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {user.has_email_auth ? user.email : 'Not connected'}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Wallet Auth Status */}
                                <div className="px-4 py-3 flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    user.has_wallet_auth ? 'bg-blue-900/30' : 'bg-gray-900'
                                  }`}>
                                    <FiKey className={`w-5 h-5 ${user.has_wallet_auth ? 'text-blue-400' : 'text-gray-600'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${user.has_wallet_auth ? 'text-white' : 'text-gray-500'}`}>
                                      Wallet
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {user.has_wallet_auth 
                                        ? `${user.wallet_address.slice(0, 4)}...${user.wallet_address.slice(-4)}`
                                        : 'Not connected'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="h-px bg-gray-800 my-4" />
                            </>
                          ) : (
                            <>
                              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-4 text-center">
                                <p className="text-gray-400 mb-4">Sign in to access all features</p>
                                <button
                                  onClick={() => {
                                    setProfileMenuOpen(false);
                                    setShowAuthModal(true);
                                  }}
                                  className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-black font-medium rounded-lg transition-colors"
                                >
                                  Sign In
                                </button>
                              </div>
                              <div className="h-px bg-gray-800 my-4" />
                            </>
                          )}

                          {/* Sign Out (if authenticated) */}
                          {user && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    await api.delete('/auth/sign_out');
                                    api.clearToken();
                                    window.dispatchEvent(new Event('auth-change'));
                                    setProfileMenuOpen(false);
                                    router.push('/');
                                  } catch (error) {
                                    console.error('Sign out error:', error);
                                  }
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg min-h-[48px] text-red-400 hover:bg-red-900/20 w-full"
                              >
                                <FiLogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>

      {/* Search Modal (Placeholder for now) */}
      <Transition appear show={searchOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSearchOpen(false)}>
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

          <div className="fixed inset-0 overflow-y-auto pt-20 md:pt-32">
            <div className="flex min-h-full items-start justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden bg-black border border-gray-800 rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for artists, tracks, albums..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                      autoFocus
                    />
                  </div>
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    Start typing to search...
                  </p>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={async () => {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          window.dispatchEvent(new Event('auth-change'));
        }}
      />

      {/* Mobile Spacer */}
      <div className="md:hidden h-14" />
      <div className="md:hidden h-16" />
    </>
  );
}
