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

export type PermissionAction = 'read' | 'create' | 'update' | 'destroy' | 'manage';

export interface ResourcePermissionCheck {
  resource: string;
  action: PermissionAction;
  data?: any;
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
  can: (action: PermissionAction, resource: string, data?: any) => boolean;
  canManageResource: (resource: string, data: any) => boolean;
  owns: (resource: string, data: any) => boolean;
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

  // Check if user owns a resource (mirrors ability.rb ownership patterns)
  const owns = (resource: string, data: any): boolean => {
    if (!user || !data) return false;
    
    // Direct ownership check (for fan resources and some artist resources)
    if (data.user_id === user.id) return true;
    
    // Artist ownership checks
    if (user.artist_id) {
      // Direct artist resource (Artist model itself)
      if (resource === 'artist' && data.id === user.artist_id) return true;
      
      // Resources with direct artist_id
      // Covers: ArtistToken, Album, Video, Mini, Event, Livestream, MerchItem, FanPass, Airdrop
      if (data.artist_id === user.artist_id) return true;
      
      // Resources nested under artist (one level deep)
      // Covers: Album.artist.user_id, Video.artist.user_id, etc.
      if (data.artist?.user_id === user.id) return true;
      if (data.artist?.id === user.artist_id) return true;
      
      // Resources nested under album (two levels deep)
      // Covers: Track.album.artist.user_id
      if (data.album?.artist?.user_id === user.id) return true;
      if (data.album?.artist?.id === user.artist_id) return true;
      if (data.album?.artist_id === user.artist_id) return true;
      
      // Resources nested under event (two levels deep)
      // Covers: TicketTier.event.artist.user_id, Ticket.ticket_tier.event.artist.user_id
      if (data.event?.artist?.user_id === user.id) return true;
      if (data.event?.artist?.id === user.artist_id) return true;
      if (data.event?.artist_id === user.artist_id) return true;
      
      // Ticket ownership through ticket_tier.event.artist
      if (data.ticket_tier?.event?.artist?.user_id === user.id) return true;
      if (data.ticket_tier?.event?.artist?.id === user.artist_id) return true;
      if (data.ticket_tier?.event?.artist_id === user.artist_id) return true;
    }
    
    return false;
  };

  // Check if user can perform an action on a resource (mirrors ability.rb)
  const can = (action: PermissionAction, resource: string, data?: any): boolean => {
    if (!user && !isAuthenticated) {
      // Guest permissions - can only read public content
      return action === 'read' && [
        'artist', 'album', 'track', 'video', 'mini', 
        'event', 'ticket_tier', 'merch_item', 'platform_token', 'platform_metric'
      ].includes(resource);
    }

    // Admins can do everything
    if (isAdmin) return true;

    // Artist permissions
    if (isArtist) {
      // Artists can manage their own content
      if (action === 'manage' || action === 'update' || action === 'destroy') {
        if (!data) return false; // Need data to check ownership
        
        const artistResources = [
          'artist', 'artist_token', 'album', 'track', 'video', 'mini',
          'event', 'ticket_tier', 'livestream', 'merch_item', 'fan_pass', 'airdrop'
        ];
        
        if (artistResources.includes(resource)) {
          return owns(resource, data);
        }
      }
      
      // Artists can create their own content (no data needed for creation)
      if (action === 'create') {
        const creatableResources = [
          'album', 'track', 'video', 'mini', 'event', 
          'ticket_tier', 'livestream', 'merch_item', 'fan_pass', 'airdrop'
        ];
        return creatableResources.includes(resource);
      }
      
      // Artists have all read permissions
      if (action === 'read') return true;
    }

    // Fan permissions
    if (isFan || isAuthenticated) {
      // Fans can manage their own content
      if ((action === 'manage' || action === 'update' || action === 'destroy') && data) {
        const ownableResources = ['playlist', 'follow', 'report', 'comment', 'notification'];
        if (ownableResources.includes(resource)) {
          return owns(resource, data);
        }
      }
      
      // Fans can create certain content
      if (action === 'create') {
        const creatableResources = [
          'playlist', 'follow', 'report', 'purchase', 'trade', 
          'fan_pass_nft', 'stream', 'video_view', 'mini_view',
          'stream_message', 'comment', 'like'
        ];
        return creatableResources.includes(resource);
      }
      
      // Fans can read their own purchases/orders/tickets
      if (action === 'read' && data) {
        const readableOwnResources = [
          'purchase', 'trade', 'ticket', 'order', 'fan_pass_nft',
          'stream', 'video_view', 'mini_view', 'notification'
        ];
        if (readableOwnResources.includes(resource)) {
          return owns(resource, data);
        }
      }
      
      // Fans can destroy their own likes
      if (action === 'destroy' && resource === 'like' && data) {
        return owns('like', data);
      }
      
      // Fans can read all public content
      if (action === 'read') return true;
    }

    return false;
  };

  // Simplified check for managing a resource (combines update, destroy, manage)
  const canManageResource = (resource: string, data: any): boolean => {
    return can('manage', resource, data) || 
           (can('update', resource, data) && can('destroy', resource, data));
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
    hasPermission,
    can,
    canManageResource,
    owns
  };
}

