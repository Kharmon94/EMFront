/**
 * Permission utility functions that mirror backend ability.rb
 * Use these for inline permission checks without hooks
 */

import { User, PermissionAction } from './usePermissions';

/**
 * Check if a user owns a resource
 * Mirrors the ownership logic from ability.rb
 */
export function userOwnsResource(user: User | null, resource: string, data: any): boolean {
  if (!user || !data) return false;

  // Direct ownership check
  if (data.user_id === user.id) return true;

  // Artist ownership check
  if (resource === 'artist' && data.id === user.artist_id) return true;
  if (data.artist_id === user.artist_id) return true;

  // Nested artist ownership
  if (data.artist?.user_id === user.id) return true;
  if (data.album?.artist?.user_id === user.id) return true;
  if (data.event?.artist?.user_id === user.id) return true;

  return false;
}

/**
 * Check if user can perform action on resource
 * Server-side validation is still required - this is for UX only
 */
export function userCanPerformAction(
  user: User | null,
  action: PermissionAction,
  resource: string,
  data?: any
): boolean {
  // Admins can do everything
  if (user?.role === 'admin') return true;

  // Not authenticated - only read public content
  if (!user) {
    return action === 'read' && [
      'artist', 'album', 'track', 'video', 'mini',
      'event', 'ticket_tier', 'merch_item', 'platform_token', 'platform_metric'
    ].includes(resource);
  }

  // Artist permissions
  if (user.role === 'artist') {
    if (['manage', 'update', 'destroy'].includes(action) && data) {
      const artistResources = [
        'artist', 'artist_token', 'album', 'track', 'video', 'mini',
        'event', 'ticket_tier', 'livestream', 'merch_item', 'fan_pass', 'airdrop'
      ];
      if (artistResources.includes(resource)) {
        return userOwnsResource(user, resource, data);
      }
    }

    if (action === 'create') {
      const creatableResources = [
        'album', 'track', 'video', 'mini', 'event',
        'ticket_tier', 'livestream', 'merch_item', 'fan_pass', 'airdrop'
      ];
      return creatableResources.includes(resource);
    }

    if (action === 'read') return true;
  }

  // Fan permissions
  if (user.role === 'fan' || user.role === 'artist') {
    if (['manage', 'update', 'destroy'].includes(action) && data) {
      const ownableResources = ['playlist', 'follow', 'report', 'comment', 'notification'];
      if (ownableResources.includes(resource)) {
        return userOwnsResource(user, resource, data);
      }
    }

    if (action === 'create') {
      const creatableResources = [
        'playlist', 'follow', 'report', 'purchase', 'trade',
        'fan_pass_nft', 'stream', 'video_view', 'mini_view',
        'stream_message', 'comment', 'like'
      ];
      return creatableResources.includes(resource);
    }

    if (action === 'read') return true;
  }

  return false;
}

/**
 * Get permission error message
 */
export function getPermissionErrorMessage(
  action: PermissionAction,
  resource: string
): string {
  const messages: Record<string, string> = {
    'read': `You don't have permission to view this ${resource}`,
    'create': `You don't have permission to create ${resource}s`,
    'update': `You don't have permission to edit this ${resource}`,
    'destroy': `You don't have permission to delete this ${resource}`,
    'manage': `You don't have permission to manage this ${resource}`
  };

  return messages[action] || 'Access denied';
}

/**
 * Check if action requires authentication
 */
export function actionRequiresAuth(action: string): boolean {
  const authRequiredActions = [
    'create', 'update', 'destroy', 'manage',
    'like', 'comment', 'follow', 'purchase'
  ];
  return authRequiredActions.includes(action);
}

/**
 * Check if action requires wallet
 */
export function actionRequiresWallet(action: string): boolean {
  const walletRequiredActions = [
    'purchase', 'trade', 'mint', 'claim', 'swap'
  ];
  return walletRequiredActions.includes(action);
}

