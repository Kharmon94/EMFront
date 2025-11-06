'use client';

import { useState, useEffect } from 'react';
import api from './api';

export interface User {
  id: number;
  email?: string;
  wallet_address?: string;
  role: 'fan' | 'artist' | 'admin';
  has_email_auth: boolean;
  has_wallet_auth: boolean;
  artist_id?: number;
}

export interface Permissions {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isArtist: boolean;
  isFan: boolean;
  canAccessAdmin: boolean;
  canAccessArtistDashboard: boolean;
  canCreateContent: boolean;
  canModerateContent: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  requiresAuth: (action: string) => boolean;
  requiresWallet: (action: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export function usePermissions(): Permissions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const handleAuthChange = () => fetchUser();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isArtist = user?.role === 'artist';
  const isFan = user?.role === 'fan';

  // Permission helpers
  const canAccessAdmin = isAdmin;
  const canAccessArtistDashboard = isArtist || isAdmin;
  const canCreateContent = isArtist || isAdmin;
  const canModerateContent = isAdmin;
  const canManageUsers = isAdmin;
  const canViewAnalytics = isArtist || isAdmin;

  const requiresAuth = (action: string): boolean => {
    const authRequiredActions = [
      'like',
      'comment',
      'follow',
      'create_playlist',
      'purchase',
      'upload',
      'create_event',
      'create_token',
      'view_notifications'
    ];
    return authRequiredActions.includes(action) && !isAuthenticated;
  };

  const requiresWallet = (action: string): boolean => {
    const walletRequiredActions = [
      'purchase',
      'trade_token',
      'mint_nft',
      'buy_ticket',
      'claim_dividend'
    ];
    return walletRequiredActions.includes(action) && !user?.has_wallet_auth;
  };

  const hasPermission = (permission: string): boolean => {
    const permissionMap: Record<string, boolean> = {
      'admin.access': canAccessAdmin,
      'admin.moderate': canModerateContent,
      'admin.manage_users': canManageUsers,
      'artist.access': canAccessArtistDashboard,
      'artist.create': canCreateContent,
      'artist.analytics': canViewAnalytics,
      'user.authenticated': isAuthenticated,
      'user.wallet': user?.has_wallet_auth || false,
      'user.email': user?.has_email_auth || false
    };

    return permissionMap[permission] || false;
  };

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isArtist,
    isFan,
    canAccessAdmin,
    canAccessArtistDashboard,
    canCreateContent,
    canModerateContent,
    canManageUsers,
    canViewAnalytics,
    requiresAuth,
    requiresWallet,
    hasPermission
  };
}

