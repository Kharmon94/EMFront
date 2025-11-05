'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { CheckoutModal } from '@/components/CheckoutModal';
import { FiShoppingCart, FiCheckCircle, FiStar } from 'react-icons/fi';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ArtistShopPage() {
  const params = useParams();
  const artistId = params.artistId as string;
  const { publicKey } = useWallet();

  const [cart, setCart] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'merch' | 'passes'>('merch');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const { data: artistData } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => api.getArtist(parseInt(artistId)),
  });

  const { data: merchData } = useQuery({
    queryKey: ['merch', artistId],
    queryFn: () => api.getMerchItems({ artist_id: artistId }),
  });

  const { data: passesData } = useQuery({
    queryKey: ['fan-passes', artistId],
    queryFn: () => api.getFanPasses({ artist_id: artistId }),
  });

  const artist = artistData?.artist;
  const merchItems = merchData?.merch_items || [];
  const fanPasses = passesData?.fan_passes || [];

  const addToCart = (item: any) => {
    setCart([...cart, item]);
    toast.success('Added to cart');
  };

  const checkout = () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = () => {
    setCart([]);
    setShowCheckoutModal(false);
  };

  if (!artist) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading shop...</div>
        </div>
      </>
    );
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Shop Header */}
          <div className="flex items-center gap-4 mb-8">
            {artist.avatar_url && (
              <img
                src={artist.avatar_url}
                alt={artist.name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
                {artist.name}'s Shop
                {artist.verified && (
                  <FiCheckCircle className="w-6 h-6 text-blue-500" />
                )}
              </h1>
              <p className="text-gray-400">Official merchandise and fan passes</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('merch')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'merch'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Merchandise ({merchItems.length})
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'passes'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Fan Passes ({fanPasses.length})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-3">
              {activeTab === 'merch' ? (
                merchItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchItems.map((item: any) => (
                      <MerchCard key={item.id} item={item} onAddToCart={addToCart} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FiShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No merchandise available</p>
                  </div>
                )
              ) : (
                fanPasses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {fanPasses.map((pass: any) => (
                      <FanPassCard key={pass.id} pass={pass} onAddToCart={addToCart} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FiStar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No fan passes available</p>
                  </div>
                )
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 sticky top-20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FiShoppingCart className="w-5 h-5" />
                  Cart ({cart.length})
                </h3>

                {cart.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">{item.title || item.name}</div>
                            <div className="text-gray-400 text-xs">{formatCurrency(item.price)}</div>
                          </div>
                          <button
                            onClick={() => setCart(cart.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-400 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-700 pt-4 mb-4">
                      <div className="flex justify-between text-white font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                    </div>

                    <button
                      onClick={checkout}
                      disabled={!publicKey}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors"
                    >
                      {publicKey ? 'Checkout with Solana Pay' : 'Connect Wallet'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Your cart is empty
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        items={cart}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
}

function MerchCard({ item, onAddToCart }: { item: any; onAddToCart: (item: any) => void }) {
  const image = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-colors">
      {/* Product Image */}
      <div className="aspect-square bg-gray-800 relative">
        {image ? (
          <img src={image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiShoppingCart className="w-16 h-16 text-gray-600" />
          </div>
        )}
        
        {!item.in_stock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 truncate">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-white">
            {formatCurrency(item.price)}
          </div>
          <button
            onClick={() => onAddToCart(item)}
            disabled={!item.in_stock}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function FanPassCard({ pass, onAddToCart }: { pass: any; onAddToCart: (pass: any) => void }) {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{pass.name}</h3>
          <p className="text-gray-300 text-sm">{pass.description}</p>
        </div>
        <FiStar className="w-6 h-6 text-yellow-500 flex-shrink-0" />
      </div>

      {/* Perks */}
      {pass.perks && pass.perks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white mb-2">Included:</h4>
          <ul className="space-y-1">
            {pass.perks.map((perk: string, index: number) => (
              <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-500" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Token Gate Info */}
      {pass.token_gate_amount && pass.token_gate_amount > 0 && (
        <div className="mb-4 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-purple-300">
            🔒 Requires holding {pass.token_gate_amount} artist tokens
          </p>
        </div>
      )}

      {/* Price & CTA */}
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-white">
          {pass.price > 0 ? formatCurrency(pass.price) : 'FREE'}
        </div>
        <button
          onClick={() => onAddToCart({ ...pass, type: 'FanPass' })}
          disabled={!pass.active}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          Get Pass
        </button>
      </div>
    </div>
  );
}

