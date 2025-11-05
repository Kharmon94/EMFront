'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { formatWalletAddress } from '@/lib/utils';

export function WalletButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Only render wallet button after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder during SSR to match client structure
    return (
      <div className="relative">
        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm font-medium rounded-lg">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {connected && publicKey ? (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-gray-300">
            {formatWalletAddress(publicKey.toString())}
          </span>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !text-sm !font-medium !rounded-lg !px-4 !py-2 !transition-colors" />
      )}
    </div>
  );
}

