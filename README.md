# Frontend Documentation - EncryptedMedia

> **Next.js 16 frontend for the Web3 Social Music Platform**

---

## 📖 Table of Contents

1. [Setup](#setup)
2. [Project Structure](#project-structure)
3. [Key Pages](#key-pages)
4. [Components](#components)
5. [State Management](#state-management)
6. [Wallet Integration](#wallet-integration)
7. [Styling](#styling)
8. [Build & Deploy](#build--deploy)

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_WS_URL=ws://localhost:5000/cable
```

---

## 📁 Project Structure

```
frontend/
├── app/                      # Pages (App Router)
│   ├── artists/              
│   │   └── [id]/
│   │       └── page.tsx      # ⭐ Artist Profile (Showcase)
│   ├── albums/
│   ├── events/
│   ├── livestreams/
│   ├── fan-passes/
│   ├── tokens/
│   ├── shop/
│   ├── feed/                 # Social feed
│   ├── dashboard/            # User dashboard
│   ├── profile/              # User profiles
│   └── ...
├── components/               # Reusable components
│   ├── Navigation.tsx        # Main nav with NotificationBell
│   ├── MusicPlayer.tsx       # Global audio player
│   ├── LivestreamPlayer.tsx  # HLS video player
│   ├── LivestreamChat.tsx    # Real-time chat
│   ├── CommentSection.tsx    # Comments with replies
│   ├── NotificationBell.tsx  # Real-time notifications
│   └── ...
├── lib/
│   ├── api.ts                # API client
│   ├── utils.ts              # Utility functions
│   └── store/                # State management
└── ...
```

---

## 🎨 Key Pages

### 🌟 Artist Profile (The Centerpiece)

**File**: `app/artists/[id]/page.tsx`

**Why it's special:**
- Most beautiful page in the app
- Comprehensive showcase of all artist content
- What artists share on social media
- Central hub for discovery

**Sections:**
1. **Hero**: Banner, avatar, follow button, stats
2. **Tabs**: Music, Events, Livestreams, Merch, Fan Passes
3. **Token Widget**: Live trading interface (if token exists)
4. **Social Proof**: Follower count, likes, engagement

**Features:**
- Responsive design (mobile-first)
- Shareable URL
- Rich OG meta tags
- Real-time follow count
- Smooth tab transitions

### For Fans

#### Home (`/page.tsx`)
- Featured artists
- Trending content
- Personalized recommendations
- Recent activity

#### Music Browse (`/music/page.tsx`)
- All albums from all artists
- Filter by genre, release date
- Search functionality

#### Livestreams (`/livestreams/page.tsx`)
- Live now (with LIVE badge)
- Upcoming streams
- Auto-refresh status

#### Livestream Viewer (`/livestreams/[id]/page.tsx`)
- HLS video player
- Real-time chat
- Viewer count
- Share stream

#### Events (`/events/page.tsx`)
- Upcoming events
- Filter by date, location
- Ticket availability

#### Fan Passes (`/fan-passes/page.tsx`)
- Browse all passes
- Filter by artist
- Minted/supply indicators

#### Shop (`/shop/page.tsx`)
- All merchandise
- Filter by artist, price
- Stock status

#### Dashboard (`/dashboard/page.tsx`)
- My feed
- My collection (NFTs, tokens)
- My activity
- Notifications

#### Profile (`/profile/[wallet]/page.tsx`)
- User identity
- Collections showcase
- Activity history
- Following list

### For Artists

#### Create Album (`/artist/albums/create/page.tsx`)
- Upload music
- Set pricing
- Configure release

#### Manage Tracks (`/artist/albums/[id]/tracks/page.tsx`)
- Toggle access tiers (🌍 👀 🔒)
- Bulk actions
- Quick strategies

#### Create Event (`/artist/events/create/page.tsx`)
- Event details
- Ticket tiers
- Pricing

#### Create Livestream (`/artist/livestreams/create/page.tsx`)
- Stream details
- Get RTMP credentials
- Token-gating options

#### Manage Livestream (`/artist/livestreams/[id]/page.tsx`)
- RTMP setup guide
- Start/stop controls
- Viewer stats
- OBS instructions

#### Create Fan Pass (`/artist/fan-passes/create/page.tsx`)
- NFT configuration
- Dividend percentage
- Perk selection
- Revenue sources

#### Manage Fan Pass (`/artist/fan-passes/[id]/page.tsx`)
- Holder list
- Distribute dividends
- Analytics

---

## 🧩 Components

### Navigation System

**Navigation.tsx**
- Sticky header
- Wallet button
- **Notification bell** (with unread count)
- Mobile hamburger menu
- Navigation items:
  - Home, Music, Events, Livestreams
  - Shop, Fan Passes, Trading
  - Profile, Dashboard

**NotificationBell.tsx**
- Bell icon with badge
- Real-time updates (ActionCable)
- Dropdown with recent notifications
- Mark as read functionality
- Auto-refresh every 30s

### Media Players

**MusicPlayer.tsx**
- Global audio player
- Now playing display
- Play/pause, seek, volume
- Queue management
- Access tier enforcement

**LivestreamPlayer.tsx**
- HLS.js integration
- Auto-detect browser support
- Error recovery
- Live indicator
- Loading states

### Social Components

**CommentSection.tsx**
- Comment list
- Post new comment
- Reply to comments
- Like comments
- Delete own comments
- Nested replies (1 level)

**LivestreamChat.tsx**
- Real-time messaging
- User badges (fan pass, token holder, VIP)
- Emoji reactions
- Viewer list
- Rate limiting UI

### UI Components

**FollowButton.tsx**
- Animated follow/unfollow
- Follower count display
- Loading state
- Optimistic updates

**LikeButton.tsx**
- Heart animation
- Like count
- Optimistic updates
- Works on all content types

---

## 🔄 State Management

### React Query (Server State)

Used for all API data:

```typescript
// Fetch artist profile
const { data, isLoading, refetch } = useQuery({
  queryKey: ['artistProfile', artistId],
  queryFn: () => api.getArtistProfile(artistId),
});

// Follow mutation
const followMutation = useMutation({
  mutationFn: (id: number) => api.followArtist(id),
  onSuccess: () => {
    queryClient.invalidateQueries(['artistProfile']);
  },
});
```

### Zustand (Client State)

Used for UI state:

```typescript
// Player store
interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  play: (track: Track) => void;
  pause: () => void;
}

const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  play: (track) => set({ currentTrack: track, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
}));
```

### Wallet Context

Solana Wallet Adapter provides:
- `publicKey`: User's wallet address
- `signTransaction`: Sign Solana transactions
- `connect()`: Open wallet selector
- `disconnect()`: Disconnect wallet

---

## 🎨 Styling

### TailwindCSS

**Configuration**: `tailwind.config.ts`

**Custom Colors:**
```typescript
colors: {
  purple: { ... },   // Primary brand color
  pink: { ... },     // Secondary
  gray: { ... },     // Backgrounds
}
```

**Common Patterns:**
```css
bg-gray-900          /* Card backgrounds */
border-gray-800      /* Borders */
text-white           /* Primary text */
text-gray-400        /* Secondary text */
hover:border-purple-600  /* Interactive elements */
```

### Responsive Design

Mobile-first approach:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-responsive grid */}
</div>
```

### Animations

**Transitions:**
```css
transition-all       /* Smooth transitions */
hover:scale-105      /* Hover effects */
animate-pulse        /* Live indicators */
animate-spin         /* Loading spinners */
```

---

## 💳 Wallet Integration

### Setup

Wrapped in `providers.tsx`:

```typescript
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  // ...
];
```

### Usage in Components

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

function Component() {
  const { publicKey, signTransaction } = useWallet();
  
  const handlePurchase = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Connect wallet first');
      return;
    }
    
    // Create transaction
    const transaction = new Transaction().add(...);
    
    // Sign and send
    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    // Confirm
    await connection.confirmTransaction(signature);
  };
}
```

---

## 🔌 API Client

**File**: `lib/api.ts`

Axios-based client with authentication:

```typescript
class APIClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Auto-inject JWT token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  // Methods for all endpoints...
}
```

**Usage:**
```typescript
import api from '@/lib/api';

// Fetch data
const profile = await api.getArtistProfile(artistId);

// Mutations
await api.followArtist(artistId);
await api.createComment('albums', albumId, 'Great album!');
await api.likeContent('tracks', trackId);
```

---

## 🌐 Social Features

### Key Social Pages

1. **Artist Profile** (`/artists/[id]`)
   - Comprehensive showcase
   - Follow button
   - All content tabs
   - Social proof

2. **User Profile** (`/profile/[wallet]`)
   - Collections showcase
   - Activity history
   - Following list

3. **Feed** (`/feed/page.tsx`)
   - Activity from followed artists
   - Infinite scroll
   - Filter by type

4. **Leaderboards** (`/leaderboards/page.tsx`)
   - Top collectors
   - Top supporters
   - Top artists

5. **Dashboard** (`/dashboard/page.tsx`)
   - Personal overview
   - My collection
   - My notifications

### Social Components

**FollowButton**
- Animated state changes
- Follower count updates
- Loading states
- Optimistic UI

**NotificationBell**
- Unread badge
- Real-time updates
- Dropdown list
- Mark as read

**CommentSection**
- Post comments
- Reply to comments
- Like comments
- Delete own comments

**LivestreamChat**
- Real-time messaging
- User badges
- Viewer presence
- Rate limiting

---

## 🎵 Media Features

### Music Player

Global player accessible from anywhere:

```typescript
import { usePlayerStore } from '@/stores/playerStore';

const { play, pause, currentTrack, isPlaying } = usePlayerStore();

// Play track
play(track);

// Access info
console.log(currentTrack.title, isPlaying);
```

### HLS Livestream Player

Browser-based video player:

```typescript
<LivestreamPlayer
  hlsUrl="http://localhost:8000/live/abc123/index.m3u8"
  isLive={true}
  poster={artist.avatar_url}
/>
```

**Features:**
- HLS.js for non-Safari browsers
- Native HLS for Safari
- Auto-recovery from errors
- Live indicator
- Loading states

---

## 🏗️ Build & Deploy

### Development

```bash
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Environment Variables in Vercel:**
- Add all `NEXT_PUBLIC_*` variables
- Configure build settings
- Set Node.js version to 18+

---

## 🎯 Performance Optimizations

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src={artist.avatar_url}
  alt={artist.name}
  width={200}
  height={200}
  className="rounded-full"
/>
```

### Code Splitting

- Dynamic imports for heavy components
- Route-based splitting (automatic)
- Lazy load below-the-fold content

### React Query Caching

```typescript
staleTime: 5 * 60 * 1000,  // 5 minutes
cacheTime: 30 * 60 * 1000,  // 30 minutes
refetchOnWindowFocus: false,
```

---

## 🧪 Testing

### Manual Testing

```bash
# Development
npm run dev

# Build test
npm run build
npm start
```

### Key Flows to Test

1. **Artist Profile**:
   - Load profile
   - Follow/unfollow
   - Switch tabs
   - Share link

2. **Social Interactions**:
   - Post comment
   - Like content
   - Check notifications
   - View feed

3. **Purchases**:
   - Connect wallet
   - Buy ticket
   - Purchase fan pass
   - Trade token

4. **Streaming**:
   - Play music
   - Watch livestream
   - Use chat
   - Check viewer count

---

## 📦 Key Dependencies

### Core
- `next@16.0.1` - Framework
- `react@19.2.0` - UI library
- `tailwindcss@4` - Styling

### Solana
- `@solana/wallet-adapter-react@0.15.39` - Wallet integration
- `@solana/web3.js@1.98.4` - Blockchain interactions

### State & Data
- `@tanstack/react-query@5.90.6` - Server state
- `zustand@5.0.8` - Client state
- `axios@1.13.1` - HTTP client

### Media
- `hls.js@1.5.7` - Video streaming
- `wavesurfer.js@7.11.1` - Audio waveforms

### UI
- `react-icons@5.5.0` - Icon library
- `react-hot-toast@2.6.0` - Notifications
- `qrcode.react@4.2.0` - QR codes

---

## 🎨 Component Patterns

### Page Component

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import api from '@/lib/api';

export default function MyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['myData'],
    queryFn: () => api.getMyData(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        {/* Content */}
      </main>
    </>
  );
}
```

### Reusable Component

```typescript
interface Props {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: Props) {
  return (
    <button onClick={onClick} className="...">
      {title}
    </button>
  );
}
```

---

## 🔔 Real-time Features

### ActionCable Setup

```typescript
import { createConsumer } from '@rails/actioncable';

const cable = createConsumer(process.env.NEXT_PUBLIC_WS_URL);

// Subscribe to notifications
const subscription = cable.subscriptions.create(
  { channel: 'NotificationChannel' },
  {
    received: (data) => {
      // Handle real-time notification
      toast.info(data.notification.title);
    },
  }
);
```

### Live Updates

- **Notifications**: 30s polling + ActionCable
- **Livestream status**: 10s polling
- **Viewer counts**: ActionCable
- **Chat messages**: ActionCable
- **Follow counts**: Optimistic UI + refetch

---

## 🎯 Best Practices

### Code Organization

- One component per file
- Colocate related components
- Extract reusable logic to hooks
- Use TypeScript for type safety

### Performance

- Use `useCallback` for event handlers
- Memoize expensive calculations
- Lazy load heavy components
- Optimize images

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

### Error Handling

- Try-catch for async operations
- Fallback UI for errors
- User-friendly error messages
- Retry mechanisms

---

## 🚀 Future Enhancements

### Short-term
- [ ] Progressive Web App (PWA)
- [ ] Push notifications
- [ ] Offline mode
- [ ] Image uploads

### Long-term
- [ ] Mobile apps (React Native)
- [ ] Desktop app (Electron)
- [ ] Browser extensions
- [ ] Widget embed codes

---

## 🔗 Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../backend/README.md) - API documentation
- [Deployment Guide](../DEPLOYMENT_GUIDE.md) - Production setup

---

**Last Updated**: November 5, 2025  
**Version**: 1.0.0  
**Status**: Active Development
