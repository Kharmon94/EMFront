# Music Artist Platform - Frontend

Next.js 16 PWA frontend for the Solana-based music artist launchpad and trading platform.

## Features

- 🔐 **Solana Wallet Integration** (Phantom, Solflare, Torus, Ledger)
- 🎵 **Music Player** with queue, offline playback, and PWA support
- 🪙 **Token Trading** bonding curve charts and real-time updates
- 💱 **DEX Interface** swap tokens and manage liquidity
- 🎟️ **Event Ticketing** browse events and purchase NFT tickets
- 📡 **Livestreaming** watch live performances with chat and tipping
- 🛍️ **Artist Shops** browse and purchase merchandise
- 📱 **Progressive Web App** install on mobile/desktop
- 🔔 **Real-time Updates** WebSocket for live trading and chat

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **React 19** 
- **TailwindCSS** for styling
- **Solana Wallet Adapter** for wallet connections
- **@solana/web3.js** for blockchain interactions
- **@tanstack/react-query** for data fetching
- **Zustand** for state management
- **Socket.io** for WebSocket connections
- **Recharts** for trading charts
- **WaveSurfer.js** for audio visualization

## Getting Started

### Prerequisites

- Node.js 20+ (via nvm)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── providers.tsx      # React Query provider
│   ├── artists/           # Artist profile pages
│   ├── tokens/            # Token trading pages
│   ├── music/             # Music browsing pages
│   ├── events/            # Event listing pages
│   ├── livestream/        # Livestream pages
│   └── dex/               # DEX interface pages
├── components/            # React components
│   ├── WalletButton.tsx  # Wallet connection button
│   ├── MusicPlayer.tsx   # Audio player component
│   ├── BondingCurveChart.tsx  # Trading chart
│   └── ...
├── lib/                   # Utilities and services
│   ├── solana.tsx        # Wallet provider setup
│   ├── api.ts            # API client for Rails backend
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── public/                # Static assets
│   ├── manifest.json     # PWA manifest
│   └── icons/            # App icons
└── tailwind.config.ts    # Tailwind configuration
```

## Key Components

### Wallet Integration

```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function MyComponent() {
  const { publicKey, connected } = useWallet();
  
  return (
    <div>
      {connected ? (
        <p>Wallet: {publicKey?.toString()}</p>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
}
```

### API Calls

```tsx
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function TokenList() {
  const { data, isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => api.getTokens(),
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data.tokens.map(token => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
```

### WebSocket Real-time Updates

```tsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function TradeUpdates({ tokenId }: { tokenId: number }) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!);
    
    socket.emit('subscribe', { channel: 'TradesChannel', token_id: tokenId });
    
    socket.on('trade', (data) => {
      console.log('New trade:', data);
      // Update UI with new trade
    });
    
    return () => {
      socket.disconnect();
    };
  }, [tokenId]);
  
  return <div>Live Trades</div>;
}
```

## Pages

### Landing Page (`/`)
- Hero section with wallet connect
- Featured artists and trending tokens
- Recent albums and events

### Artist Profile (`/artists/[id]`)
- Artist information and token
- Discography
- Upcoming events
- Merchandise

### Token Trading (`/tokens/[id]`)
- Bonding curve chart
- Buy/sell interface
- Recent trades
- Token holders

### Music Player (`/music`)
- Browse albums and tracks
- Search functionality
- Playlists
- Persistent player bar

### Events (`/events`)
- Upcoming events list
- Event details and ticket purchase
- QR code display for owned tickets

### Livestream (`/livestream/[id]`)
- Live video player
- Chat with tipping
- Token-gated access

### DEX (`/dex`)
- Token swap interface
- Liquidity pools
- Add/remove liquidity

## PWA Features

The app is configured as a Progressive Web App with:
- Offline support for purchased music
- Install prompts on mobile and desktop
- Background sync for pending actions
- Service worker caching
- App-like experience

### Installing PWA

**Desktop (Chrome/Edge)**:
1. Click install icon in address bar
2. Or: Menu → Install Music Platform

**Mobile (iOS Safari)**:
1. Tap Share button
2. Tap "Add to Home Screen"

**Mobile (Android Chrome)**:
1. Tap menu
2. Tap "Install app" or "Add to Home Screen"

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

See `env.example` for all available environment variables.

Key variables:
- `NEXT_PUBLIC_API_URL` - Rails backend API URL
- `NEXT_PUBLIC_SOLANA_RPC_URL` - Solana RPC endpoint
- `NEXT_PUBLIC_SOLANA_NETWORK` - Solana network (mainnet-beta/devnet)

## Deployment

### Railway

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

### Vercel

```bash
npm install -g vercel
vercel
```

## Development Tips

- Use React DevTools for debugging
- Enable Solana Wallet Adapter debug mode
- Check browser console for Solana transaction errors
- Use Railway logs for backend API debugging

## License

Proprietary - All Rights Reserved
