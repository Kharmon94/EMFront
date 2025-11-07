'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { useCart } from '@/lib/useCart';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiTruck, FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: ''
  });
  const [cartOrderId, setCartOrderId] = useState<number | null>(null);
  const [sellersInfo, setSellersInfo] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create cart order and get payment details
      const response = await api.post('/cart/checkout', {
        cart_items: cart.map(item => ({
          merch_item_id: item.merch_item_id,
          variant_id: item.variant_id,
          quantity: item.quantity
        })),
        shipping_address: shippingAddress
      });

      setCartOrderId(response.data.cart_order_id);
      setSellersInfo(response.data.sellers);
      setTotalAmount(response.data.total_amount);
      setStep('payment');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      // Create Solana transaction with multiple recipients
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com');
      const transaction = new Transaction();

      // Add transfer instruction for each seller
      for (const seller of sellersInfo) {
        if (!seller.wallet_address) {
          toast.error(`Seller ${seller.artist_name} has no wallet configured`);
          setLoading(false);
          return;
        }

        const amountLamports = Math.floor(seller.amount * LAMPORTS_PER_SOL);
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(seller.wallet_address),
            lamports: amountLamports,
          })
        );
      }

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      toast.loading('Confirming transaction...');

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      // Confirm payment on backend
      await api.post('/cart/confirm_payment', {
        cart_order_id: cartOrderId,
        transaction_signature: signature
      });

      toast.dismiss();
      toast.success('Payment successful!');
      clearCart();
      router.push(`/orders/${cartOrderId}`);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <PermissionGuard require="auth" redirectTo="/cart">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'shipping' ? 'bg-blue-600' : 'bg-green-600'
                } text-white`}>
                  {step === 'payment' ? <FiCheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="font-medium">Shipping</span>
              </div>
              <div className="w-24 h-0.5 bg-gray-300 dark:bg-gray-700" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'payment' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                } text-white`}>
                  2
                </div>
                <span className="font-medium">Payment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2">
              {step === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FiTruck className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Address Line 1</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address_line1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={shippingAddress.address_line2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">State/Province</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Country</label>
                        <select
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Continue to Payment'}
                    </button>
                  </div>
                </form>
              )}

              {step === 'payment' && (
                <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FiCreditCard className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FiLock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Secure Blockchain Payment</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            Your payment will be split automatically to each seller via Solana blockchain. Connect your wallet to continue.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Payment Distribution</h3>
                      {sellersInfo.map((seller) => (
                        <div key={seller.artist_id} className="flex justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{seller.artist_name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Items + Shipping</p>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">{seller.amount.toFixed(4)} SOL</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                      <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-4">
                        <span>Total Payment</span>
                        <span>{totalAmount.toFixed(4)} SOL</span>
                      </div>

                      <button
                        onClick={handlePayment}
                        disabled={loading || !publicKey}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Processing Payment...' : publicKey ? 'Pay with Solana' : 'Connect Wallet First'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={`${item.merch_item_id}-${item.variant_id || 0}`} className="flex gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency((item.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}

