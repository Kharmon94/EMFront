/**
 * Complete ownership mapping reference
 * This documents all ownership patterns from backend ability.rb
 * Use this as a reference when checking resource ownership
 */

export const OWNERSHIP_PATTERNS = {
  // DIRECT OWNERSHIP (user_id === user.id)
  direct: [
    'comment',
    'like', 
    'playlist',
    'follow',
    'report',
    'notification',
    'purchase',
    'trade',
    'ticket',
    'order',
    'stream',
    'video_view',
    'mini_view',
    'stream_message',
    'fan_pass_nft',
    'airdrop_claim'
  ],

  // ARTIST DIRECT OWNERSHIP (artist_id === user.artist_id)
  artistDirect: [
    'artist_token',  // artist.user_id
    'album',         // artist.user_id
    'video',         // artist.user_id
    'mini',          // artist.user_id
    'event',         // artist.user_id
    'livestream',    // artist.user_id
    'merch_item',    // artist.user_id
    'fan_pass',      // artist.user_id
    'airdrop'        // artist.user_id
  ],

  // NESTED 1 LEVEL (resource.artist.user_id === user.id)
  nestedOneLevel: {
    'album': 'artist.user_id',
    'video': 'artist.user_id',
    'mini': 'artist.user_id',
    'event': 'artist.user_id',
    'livestream': 'artist.user_id',
    'merch_item': 'artist.user_id',
    'fan_pass': 'artist.user_id',
    'airdrop': 'artist.user_id'
  },

  // NESTED 2 LEVELS (resource.parent.artist.user_id === user.id)
  nestedTwoLevels: {
    'track': 'album.artist.user_id',
    'ticket_tier': 'event.artist.user_id'
  },

  // NESTED 3 LEVELS (resource.parent.parent.artist.user_id === user.id)
  nestedThreeLevels: {
    'ticket': 'ticket_tier.event.artist.user_id'
  }
} as const;

/**
 * Resource to ownership pattern mapping
 * Quick lookup for how to check ownership of any resource
 */
export const RESOURCE_OWNERSHIP_PATH: Record<string, string[]> = {
  // Direct user ownership
  'comment': ['user_id'],
  'like': ['user_id'],
  'playlist': ['user_id'],
  'follow': ['user_id'],
  'report': ['user_id'],
  'notification': ['user_id'],
  'purchase': ['user_id'],
  'trade': ['user_id'],
  'order': ['user_id'],
  'stream': ['user_id'],
  'video_view': ['user_id'],
  'mini_view': ['user_id'],
  'stream_message': ['user_id'],
  'fan_pass_nft': ['user_id'],
  'airdrop_claim': ['user_id'],

  // Artist ownership (direct)
  'artist': ['id'], // Special: check against user.artist_id
  'artist_token': ['artist_id', 'artist.user_id'],
  
  // Artist content (1 level nested)
  'album': ['artist_id', 'artist.user_id'],
  'video': ['artist_id', 'artist.user_id'],
  'mini': ['artist_id', 'artist.user_id'],
  'event': ['artist_id', 'artist.user_id'],
  'livestream': ['artist_id', 'artist.user_id'],
  'merch_item': ['artist_id', 'artist.user_id'],
  'fan_pass': ['artist_id', 'artist.user_id'],
  'airdrop': ['artist_id', 'artist.user_id'],

  // Nested through album (2 levels)
  'track': ['album.artist_id', 'album.artist.user_id'],

  // Nested through event (2 levels)
  'ticket_tier': ['event.artist_id', 'event.artist.user_id'],

  // Nested through ticket_tier and event (3 levels)
  'ticket': ['user_id', 'ticket_tier.event.artist_id', 'ticket_tier.event.artist.user_id']
};

/**
 * Helper to get ownership check paths for a resource
 */
export function getOwnershipPaths(resource: string): string[] {
  return RESOURCE_OWNERSHIP_PATH[resource] || ['user_id'];
}

/**
 * Validate that ownership checking covers all backend ability.rb patterns
 * Use in development to ensure frontend matches backend
 */
export function validateOwnershipCoverage() {
  const allResources = Object.keys(RESOURCE_OWNERSHIP_PATH);
  const backendResources = [
    // Admin can manage all
    // Artist resources
    'artist', 'artist_token', 'album', 'track', 'video', 'mini',
    'event', 'ticket_tier', 'livestream', 'merch_item', 'fan_pass', 'airdrop',
    // Fan resources
    'playlist', 'follow', 'report', 'comment', 'like',
    'purchase', 'trade', 'fan_pass_nft', 'stream', 'video_view', 'mini_view',
    'stream_message', 'notification', 'ticket', 'order'
  ];

  const missing = backendResources.filter(r => !allResources.includes(r));
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing ownership patterns for:', missing);
    return false;
  }

  console.log('✅ All backend resources have ownership patterns defined');
  return true;
}

