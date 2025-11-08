'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { 
  FiUser, FiLock, FiBell, FiStar, FiShield, FiAlertTriangle,
  FiSave, FiCamera, FiMail, FiKey, FiTwitter, FiInstagram, FiGlobe,
  FiCheck, FiX, FiTrash2, FiMessageCircle
} from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'messaging' | 'artist' | 'privacy' | 'danger';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    email: '',
    name: '',
    bio: '',
    location: '',
    avatar_url: '',
    banner_url: '',
  });

  // Account state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_enabled: true,
    purchases: true,
    followers: true,
    comments: true,
    likes: true,
    livestreams: true,
  });

  // Messaging preferences
  const [messagingPrefs, setMessagingPrefs] = useState({
    accept_messages: 'everyone',
    blocked_users: []
  });

  // Artist settings
  const [artistData, setArtistData] = useState({
    twitter: '',
    instagram: '',
    website: '',
    genres: [] as string[],
    verification_requested: false,
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);

      // Set profile data
      setProfileData({
        email: userData.email || '',
        name: userData.artist?.name || '',
        bio: userData.artist?.bio || '',
        location: userData.artist?.location || '',
        avatar_url: userData.artist?.avatar_url || '',
        banner_url: userData.artist?.banner_url || '',
      });

      // Set artist data if artist
      if (userData.artist) {
        setArtistData({
          twitter: userData.social_links?.twitter || '',
          instagram: userData.social_links?.instagram || '',
          website: userData.social_links?.website || '',
          genres: userData.artist.genres || [],
          verification_requested: userData.artist.verification_requested || false,
        });
      }

      // Fetch notification preferences
      try {
        const notifsResponse = await api.get('/users/notification_preferences');
        setNotificationPrefs(notifsResponse.data.preferences);
      } catch (error) {
        // Use defaults if not found
      }

      setLoading(false);
    } catch (error) {
      toast.error('Please sign in to access settings');
      router.push('/');
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: FiUser },
    { id: 'account' as SettingsTab, label: 'Account', icon: FiLock },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: FiBell },
    { id: 'messaging' as SettingsTab, label: 'Messaging', icon: FiMessageCircle },
    ...(user?.role === 'artist' ? [{ id: 'artist' as SettingsTab, label: 'Artist Settings', icon: FiStar }] : []),
    { id: 'privacy' as SettingsTab, label: 'Privacy & Security', icon: FiShield },
    { id: 'danger' as SettingsTab, label: 'Danger Zone', icon: FiAlertTriangle },
  ];

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white dark:bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-200 dark:border-gray-800 rounded-xl p-2 sticky top-20">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Navigation - Mobile */}
            <div className="md:hidden overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-200 dark:border-gray-800 rounded-xl p-6">
                {/* Render active tab content */}
                {activeTab === 'profile' && <ProfileSection />}
                {activeTab === 'account' && <AccountSection />}
                {activeTab === 'notifications' && <NotificationsSection />}
                {activeTab === 'messaging' && <MessagingSection />}
                {activeTab === 'artist' && user?.role === 'artist' && <ArtistSection />}
                {activeTab === 'privacy' && <PrivacySection />}
                {activeTab === 'danger' && <DangerZoneSection />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Section Components
  function ProfileSection() {
    const handleProfileSave = async () => {
      setSaving(true);
      try {
        await api.patch('/profile', {
          artist: user?.role === 'artist' ? {
            name: profileData.name,
            bio: profileData.bio,
            location: profileData.location,
            avatar_url: profileData.avatar_url,
            banner_url: profileData.banner_url,
          } : undefined
        });
        toast.success('Profile updated successfully');
        fetchUserData();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      } finally {
        setSaving(false);
      }
    };

    const handleImageUpload = (field: 'avatar_url' | 'banner_url') => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          // Convert to base64 for now (in production, upload to cloudinary/s3)
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfileData({ ...profileData, [field]: reader.result as string });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Update your public profile information</p>
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-700">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-900 dark:text-white text-3xl font-bold">
                  {profileData.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <button
                onClick={() => handleImageUpload('avatar_url')}
                className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <FiCamera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div>
              <button
                onClick={() => handleImageUpload('avatar_url')}
                className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                Change Picture
              </button>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>
        </div>

        {/* Banner Upload (Artists only) */}
        {user?.role === 'artist' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Banner Image
            </label>
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-700">
              {profileData.banner_url ? (
                <img src={profileData.banner_url} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No banner image
                </div>
              )}
              <button
                onClick={() => handleImageUpload('banner_url')}
                className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <FiCamera className="w-6 h-6 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recommended: 1920x480px. Max size 10MB.</p>
          </div>
        )}

        {/* Name Field (Artists only) */}
        {user?.role === 'artist' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">
              Artist Name
            </label>
            <input
              id="name"
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Your artist name"
            />
          </div>
        )}

        {/* Bio Field (Artists only) */}
        {user?.role === 'artist' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/500 characters</p>
          </div>
        )}

        {/* Location Field (Artists only) */}
        {user?.role === 'artist' && (
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="City, Country"
            />
          </div>
        )}

        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={profileData.email}
            disabled
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Manage in Account settings.</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            onClick={handleProfileSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  function AccountSection() {
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const handlePasswordChange = async () => {
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }

      if (passwordData.new_password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      setSaving(true);
      try {
        await api.post('/auth/change_password', {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        });
        toast.success('Password changed successfully');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setShowPasswordForm(false);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to change password');
      } finally {
        setSaving(false);
      }
    };

    const getPasswordStrength = (password: string) => {
      if (!password) return { strength: 0, label: '', color: '' };
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z0-9]/.test(password)) strength++;

      if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
      if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
      if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-500' };
      return { strength, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(passwordData.new_password);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h2>
          <p className="text-gray-400">Manage your authentication methods and security</p>
        </div>

        {/* Connected Methods */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connected Methods</h3>
          <div className="space-y-3">
            {/* Email Status */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user?.has_email_auth ? 'bg-green-900/30' : 'bg-gray-700'
                }`}>
                  <FiMail className={`w-5 h-5 ${user?.has_email_auth ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Email & Password</p>
                  <p className="text-sm text-gray-400">
                    {user?.has_email_auth ? user.email : 'Not connected'}
                  </p>
                </div>
              </div>
              {user?.has_email_auth ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <FiCheck className="w-4 h-4" />
                  Connected
                </div>
              ) : (
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
                  Link Email
                </button>
              )}
            </div>

            {/* Wallet Status */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user?.has_wallet_auth ? 'bg-blue-900/30' : 'bg-gray-700'
                }`}>
                  <FiKey className={`w-5 h-5 ${user?.has_wallet_auth ? 'text-blue-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">Solana Wallet</p>
                  <p className="text-sm text-gray-400">
                    {user?.has_wallet_auth 
                      ? `${user.wallet_address.slice(0, 4)}...${user.wallet_address.slice(-4)}`
                      : 'Not connected'
                    }
                  </p>
                </div>
              </div>
              {user?.has_wallet_auth ? (
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <FiCheck className="w-4 h-4" />
                  Connected
                </div>
              ) : (
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
                  Link Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Password Change (Email users only) */}
        {user?.has_email_auth && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Current Password */}
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                  {/* Password Strength Indicator */}
                  {passwordData.new_password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength.strength ? passwordStrength.color : 'bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordData.current_password || !passwordData.new_password || passwordData.new_password !== passwordData.confirm_password}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function NotificationsSection() {
    const handleNotificationToggle = async (key: keyof typeof notificationPrefs) => {
      const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
      setNotificationPrefs(newPrefs);

      try {
        await api.patch('/users/notification_preferences', {
          preferences: newPrefs
        });
        toast.success('Notification preferences updated');
      } catch (error) {
        // Revert on error
        setNotificationPrefs(notificationPrefs);
        toast.error('Failed to update preferences');
      }
    };

    const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notification Preferences</h2>
          <p className="text-gray-400">Control what notifications you want to receive</p>
        </div>

        {/* Email Notifications Master Toggle */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-400">Receive notifications via email</p>
            </div>
            <ToggleSwitch
              enabled={notificationPrefs.email_enabled}
              onChange={() => handleNotificationToggle('email_enabled')}
            />
          </div>
        </div>

        {/* Individual Notification Categories */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Notification Categories</h3>

          {/* Purchases */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">Purchases</p>
              <p className="text-sm text-gray-400">When someone purchases your content</p>
            </div>
            <ToggleSwitch
              enabled={notificationPrefs.purchases}
              onChange={() => handleNotificationToggle('purchases')}
            />
          </div>

          {/* New Followers */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">New Followers</p>
              <p className="text-sm text-gray-400">When someone follows you</p>
            </div>
            <ToggleSwitch
              enabled={notificationPrefs.followers}
              onChange={() => handleNotificationToggle('followers')}
            />
          </div>

          {/* Comments */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">Comments</p>
              <p className="text-sm text-gray-400">When someone comments on your content</p>
            </div>
            <ToggleSwitch
              enabled={notificationPrefs.comments}
              onChange={() => handleNotificationToggle('comments')}
            />
          </div>

          {/* Likes */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">Likes</p>
              <p className="text-sm text-gray-400">When someone likes your content</p>
            </div>
            <ToggleSwitch
              enabled={notificationPrefs.likes}
              onChange={() => handleNotificationToggle('likes')}
            />
          </div>

          {/* Livestreams */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">Livestreams</p>
              <p className="text-sm text-gray-400">When artists you follow go live</p>
            </div>
            <ToggleSwitch
              enabled={notificationPrefs.livestreams}
              onChange={() => handleNotificationToggle('livestreams')}
            />
          </div>
        </div>
      </div>
    );
  }

  function MessagingSection() {
    const handleMessagingUpdate = async (field: string, value: any) => {
      const newPrefs = { ...messagingPrefs, [field]: value };
      setMessagingPrefs(newPrefs);

      try {
        await api.patch('/users/me', {
          [field]: value
        });
        toast.success('Messaging preferences updated');
      } catch (error) {
        setMessagingPrefs(messagingPrefs);
        toast.error('Failed to update preferences');
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-900 dark:text-white mb-2">Messaging Preferences</h2>
          <p className="text-gray-600 dark:text-gray-400">Control who can send you direct messages</p>
        </div>

        {/* Who can message you */}
        <div className="bg-gray-100 dark:bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-gray-900 dark:text-gray-900 dark:text-white font-semibold mb-4">Who can send you messages</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="accept_messages"
                value="everyone"
                checked={messagingPrefs.accept_messages === 'everyone'}
                onChange={() => handleMessagingUpdate('accept_messages', 'everyone')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-gray-900 dark:text-gray-900 dark:text-white font-medium">Everyone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Anyone can send you messages</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="accept_messages"
                value="following_only"
                checked={messagingPrefs.accept_messages === 'following_only'}
                onChange={() => handleMessagingUpdate('accept_messages', 'following_only')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-gray-900 dark:text-gray-900 dark:text-white font-medium">People You Follow</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Only people you follow can message you</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="accept_messages"
                value="no_one"
                checked={messagingPrefs.accept_messages === 'no_one'}
                onChange={() => handleMessagingUpdate('accept_messages', 'no_one')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-gray-900 dark:text-gray-900 dark:text-white font-medium">No One</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Turn off direct messages completely</p>
              </div>
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800/30 rounded-lg p-4">
          <div className="flex gap-3">
            <FiMessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Note:</strong> Artists and sellers can always message you about orders and purchases.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ArtistSection() {
    const handleArtistSave = async () => {
      setSaving(true);
      try {
        await api.patch('/profile', {
          social_links: {
            twitter: artistData.twitter,
            instagram: artistData.instagram,
            website: artistData.website,
          },
          artist: {
            genres: artistData.genres,
          }
        });
        toast.success('Artist settings updated');
        fetchUserData();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to update settings');
      } finally {
        setSaving(false);
      }
    };

    const handleRequestVerification = async () => {
      try {
        await api.post('/artists/request_verification');
        setArtistData({ ...artistData, verification_requested: true });
        toast.success('Verification request submitted');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to submit request');
      }
    };

    const availableGenres = [
      'Hip Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Blues', 
      'Country', 'Classical', 'Reggae', 'Metal', 'Folk', 'Soul', 'Funk', 
      'Indie', 'Alternative', 'Dance', 'Latin', 'Gospel', 'Other'
    ];

    const toggleGenre = (genre: string) => {
      const newGenres = artistData.genres.includes(genre)
        ? artistData.genres.filter(g => g !== genre)
        : [...artistData.genres, genre];
      setArtistData({ ...artistData, genres: newGenres });
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Artist Settings</h2>
          <p className="text-gray-400">Manage your artist profile and verification</p>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
          <div className="space-y-4">
            {/* Twitter */}
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <FiTwitter className="w-4 h-4 text-blue-400" />
                  Twitter Username
                </div>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400">
                  @
                </span>
                <input
                  id="twitter"
                  type="text"
                  value={artistData.twitter}
                  onChange={(e) => setArtistData({ ...artistData, twitter: e.target.value })}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="yourusername"
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <FiInstagram className="w-4 h-4 text-pink-400" />
                  Instagram Username
                </div>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400">
                  @
                </span>
                <input
                  id="instagram"
                  type="text"
                  value={artistData.instagram}
                  onChange={(e) => setArtistData({ ...artistData, instagram: e.target.value })}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="yourusername"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <FiGlobe className="w-4 h-4 text-green-400" />
                  Website
                </div>
              </label>
              <input
                id="website"
                type="url"
                value={artistData.website}
                onChange={(e) => setArtistData({ ...artistData, website: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Genres */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Genres</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select up to 5 genres that describe your music</p>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => artistData.genres.length < 5 || artistData.genres.includes(genre) ? toggleGenre(genre) : null}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  artistData.genres.includes(genre)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700'
                } ${artistData.genres.length >= 5 && !artistData.genres.includes(genre) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {genre}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{artistData.genres.length}/5 genres selected</p>
        </div>

        {/* Verification */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <FiStar className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white font-medium mb-1">Artist Verification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Verified artists get a blue checkmark, increased visibility, and access to exclusive features.
              </p>
              {artistData.verification_requested ? (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  Verification pending review
                </div>
              ) : (
                <button
                  onClick={handleRequestVerification}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white text-sm rounded-lg transition-colors"
                >
                  Request Verification
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            onClick={handleArtistSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  function PrivacySection() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Privacy & Security</h2>
          <p className="text-gray-400">Manage your privacy and data</p>
        </div>

        {/* Account Visibility */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-gray-900 dark:text-white font-medium mb-2">Profile Visibility</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Your profile is currently public and visible to everyone.
          </p>
          <p className="text-xs text-gray-500">
            Private profiles are not supported at this time for artists.
          </p>
        </div>

        {/* Data Export */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-gray-900 dark:text-white font-medium mb-2">Export Your Data</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Download a copy of your account data, including profile info, content, and activity.
          </p>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
            Request Data Export
          </button>
        </div>

        {/* Two-Factor Authentication (Future) */}
        <div className="p-4 bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-gray-600 dark:text-gray-400 font-medium mb-2">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mb-3">
            Coming soon: Add an extra layer of security to your account.
          </p>
          <button disabled className="px-4 py-2 bg-gray-700/50 text-gray-500 text-sm rounded-lg cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>
    );
  }

  function DangerZoneSection() {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
            <p className="text-gray-400">Irreversible and destructive actions</p>
          </div>

          {/* Delete Account */}
          <div className="border-2 border-red-500/50 rounded-lg p-6 bg-red-900/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <FiTrash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Delete Account</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone and will result in the permanent loss of:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4 ml-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    All uploaded content (albums, tracks, videos, minis)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Artist token (if you have one) - permanently destroyed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    All purchases, tickets, and NFTs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Revenue history and earnings data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Followers, follows, comments, and likes
                  </li>
                </ul>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <FiAlertTriangle className="w-4 h-4" />
                  Delete My Account
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 font-medium mb-2">⚠️ Need Help?</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              If you're experiencing issues or have concerns, please contact our support team before deleting your account. We're here to help.
            </p>
          </div>
        </div>

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          user={user}
        />
      </>
    );
  }
}

