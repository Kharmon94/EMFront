'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FiDollarSign, FiUsers, FiTrendingUp, FiCheckCircle, FiLock, FiGift, FiCalendar } from 'react-icons/fi';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FanPassDetailPage() {
  const params = useParams();
  const fanPassId = parseInt(params.id as string);
  const { publicKey, signTransaction } = useWallet();
  const [purchasing, setPurchasing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fanPass', fanPassId],
    queryFn: () => api.getFanPass(fanPassId),
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500">Fan pass not found</div>
        </div>
      </>
    );
  }

  const fanPass = data.fan_pass;
  const ownership = data.ownership || {};
  const perks = fanPass.perks || {};

  const handlePurchase = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    if (fanPass.price === 0) {
      toast.error('This is an airdrop-only fan pass');
      return;
    }

    setPurchasing(true);
    try {
      const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(RPC_URL);

      // Create payment transaction
      const artistWallet = fanPass.artist.wallet_address 
        ? new PublicKey(fanPass.artist.wallet_address)
        : new PublicKey('11111111111111111111111111111111');

      const lamports = fanPass.price * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: artistWallet,
          lamports: Math.floor(lamports),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      toast.loading('Confirming transaction...', { id: 'tx-confirm' });
      await connection.confirmTransaction(signature, 'confirmed');
      toast.dismiss('tx-confirm');

      // Mint NFT
      const response = await api.purchaseFanPass(fanPassId, {
        transaction_signature: signature,
      });

      toast.success(`Fan Pass NFT #${response.edition_number} minted!`);
      refetch();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.error || 'Purchase failed');
    }
    setPurchasing(false);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6 mb-6">
              {fanPass.image_url && (
                <img
                  src={fanPass.image_url}
                  alt={fanPass.name}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-purple-600"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{fanPass.name}</h1>
                <p className="text-xl text-gray-400 mb-4">{fanPass.artist.name}</p>
                <p className="text-gray-300">{fanPass.description}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-white mb-1">
                  {fanPass.minted_count}/{fanPass.max_supply}
                </div>
                <div className="text-sm text-gray-400">Minted</div>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {formatCurrency(fanPass.price)}
                </div>
                <div className="text-sm text-gray-400">Price</div>
              </div>
              {fanPass.dividend_percentage > 0 && (
                <div className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {fanPass.dividend_percentage}%
                  </div>
                  <div className="text-sm text-purple-300">Dividend</div>
                </div>
              )}
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-white mb-1">{fanPass.total_perks}</div>
                <div className="text-sm text-gray-400">Perks</div>
              </div>
            </div>
          </div>

          {/* Ownership Status */}
          {ownership.owned ? (
            <div className="mb-6 p-6 bg-green-600/20 border-2 border-green-600 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">You own this fan pass!</h3>
                  <p className="text-green-300 text-sm">
                    Edition #{ownership.nft.edition_number} • All perks unlocked
                  </p>
                </div>
              </div>
              {ownership.dividend_info && (
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Your Dividends</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Earned:</span>
                      <span className="ml-2 text-white font-semibold">
                        {formatCurrency(ownership.dividend_info.total_earned)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Pending:</span>
                      <span className="ml-2 text-purple-400 font-semibold">
                        {formatCurrency(ownership.dividend_info.pending)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Get this Fan Pass</h3>
                  <p className="text-gray-400 text-sm">
                    {fanPass.available_supply} / {fanPass.max_supply} available
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">{formatCurrency(fanPass.price)}</div>
                  {fanPass.price > 0 && (
                    <div className="text-sm text-gray-500">${(fanPass.price * 150).toFixed(2)} USD</div>
                  )}
                </div>
              </div>
              <button
                onClick={handlePurchase}
                disabled={purchasing || !publicKey || fanPass.sold_out}
                className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                {!publicKey ? 'Connect Wallet First' :
                 fanPass.sold_out ? 'Sold Out' :
                 purchasing ? 'Purchasing...' :
                 `Purchase for ${formatCurrency(fanPass.price)}`}
              </button>
            </div>
          )}

          {/* Dividend Info */}
          {fanPass.dividend_percentage > 0 && (
            <section className="mb-6 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5" />
                Dividend Payments
              </h2>
              <p className="text-gray-300 mb-4">
                As a holder, you earn <span className="text-purple-400 font-bold">{fanPass.dividend_percentage}%</span> of the artist's revenue from:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {fanPass.revenue_sources.map((source: string) => (
                  <span key={source} className="px-3 py-1 bg-purple-600/30 border border-purple-600 text-purple-300 rounded-full text-sm capitalize">
                    {source}
                  </span>
                ))}
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg text-sm text-gray-400">
                <p>💡 Dividends are distributed monthly based on actual artist revenue.</p>
                <p className="mt-2">📊 The more successful the artist, the more you earn!</p>
              </div>
            </section>
          )}

          {/* Perks Breakdown */}
          <section className="mb-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-6">Included Perks</h2>
            
            {Object.entries(perks).map(([category, perkList]: [string, any]) => {
              if (!Array.isArray(perkList) || perkList.length === 0) return null;
              
              return (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 capitalize">
                    {category === 'access' && '🔓'}
                    {category === 'discounts' && '💸'}
                    {category === 'content' && '🎬'}
                    {category === 'events' && '🎟️'}
                    {category === 'governance' && '🗳️'}
                    {category} ({perkList.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {perkList.map((perk: string) => (
                      <div key={perk} className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                        <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Holders (if any) */}
          {fanPass.holders_count > 0 && (
            <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                Holders ({fanPass.holders_count})
              </h2>
              <div className="text-gray-400 text-sm">
                {fanPass.holders_count} fans own this exclusive pass
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

