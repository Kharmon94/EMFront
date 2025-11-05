'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FiX, FiShoppingCart, FiCheck, FiAlertCircle, FiTruck } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onSuccess?: () => void;
}

export function CheckoutModal({ isOpen, onClose, items, onSuccess }: CheckoutModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const [step, setStep] = useState<'shipping' | 'review' | 'processing' | 'success' | 'error'>('shipping');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const shipping = 10; // Flat shipping fee
  const total = subtotal + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!shippingAddress.fullName || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    // CRITICAL: Validate wallet connection
    if (!publicKey || !signTransaction) {
      setErrorMessage('Please connect your wallet to complete purchase');
      setStep('error');
      return;
    }

    setStep('processing');
    
    try {
      const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(RPC_URL);

      // STEP 1: Create transaction (pay platform wallet for now)
      const platformWallet = new PublicKey('11111111111111111111111111111111'); // Platform wallet address
      const lamports = total * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: platformWallet,
          lamports: Math.floor(lamports),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // STEP 2: Sign and send
      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // STEP 3: Confirm
      toast.loading('Confirming transaction...', { id: 'tx-confirm' });
      await connection.confirmTransaction(signature, 'confirmed');
      toast.dismiss('tx-confirm');

      // STEP 4: Create order in backend
      const orderResponse = await api.createOrder({
        items: items.map(item => ({
          orderable_type: item.type || 'MerchItem',
          orderable_id: item.id,
          quantity: item.quantity || 1,
        })),
        transaction_signature: signature,
        shipping_address: {
          full_name: shippingAddress.fullName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip_code: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
      });

      setOrderData(orderResponse.order);
      setStep('success');
      toast.success('Order placed successfully!');
      
      // Call success callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Order error:', error);
      
      let message = 'Order failed';
      if (error.message?.includes('User rejected')) {
        message = 'Transaction cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        message = 'Insufficient SOL balance';
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }
      
      setErrorMessage(message);
      setStep('error');
      toast.error(message);
    }
  };

  const resetModal = () => {
    setStep('shipping');
    setErrorMessage('');
    setOrderData(null);
    setShippingAddress({
      fullName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiShoppingCart className="w-5 h-5" />
            {step === 'success' ? 'Order Confirmed' : 'Checkout'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            disabled={step === 'processing'}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Shipping Step */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FiTruck className="w-5 h-5" />
                  Shipping Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.address1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Continue to Review
                </button>
              </div>
            </form>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Wallet Warning */}
              {!publicKey && (
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">
                    Please connect your wallet to complete your order
                  </p>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.title || item.name}</div>
                        <div className="text-gray-400 text-sm">Qty: {item.quantity || 1}</div>
                      </div>
                      <div className="text-white font-semibold">{formatCurrency(item.price || 0)}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg border-t border-gray-800 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Shipping To:</h3>
                <div className="p-4 bg-gray-800/50 rounded-lg text-gray-300 space-y-1">
                  <p className="font-medium text-white">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.address1}</p>
                  {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                  <p>
                    {shippingAddress.city}
                    {shippingAddress.state && `, ${shippingAddress.state}`} {shippingAddress.zipCode}
                  </p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                  {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                  <button
                    onClick={() => setStep('shipping')}
                    className="text-purple-400 hover:text-purple-300 text-sm mt-2"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('shipping')}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={!publicKey}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {publicKey ? 'Place Order' : 'Connect Wallet First'}
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white font-medium mb-2">Processing your order...</p>
              <p className="text-gray-400 text-sm">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && orderData && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-white font-semibold text-xl mb-2">Order Confirmed!</p>
                <p className="text-gray-400 mb-4">
                  Order #{orderData.id}
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  You'll receive a confirmation email shortly with tracking information.
                </p>

                {/* Order Details */}
                <div className="bg-gray-800/50 rounded-lg p-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Number:</span>
                    <span className="text-white font-mono">#{orderData.id}</span>
                  </div>
                  {orderData.transaction_signature && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400">Transaction:</span>
                      <a
                        href={`https://solscan.io/tx/${orderData.transaction_signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 font-mono text-xs truncate max-w-[180px]"
                        title={orderData.transaction_signature}
                      >
                        {orderData.transaction_signature?.slice(0, 8)}...{orderData.transaction_signature?.slice(-8)}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Paid:</span>
                    <span className="text-white font-semibold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-white font-semibold text-lg mb-2">Order Failed</p>
                <p className="text-gray-400 text-sm mb-4">
                  {errorMessage || 'An error occurred during the transaction'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setStep('review');
                    setErrorMessage('');
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'shipping' || step === 'review') && (
          <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-800 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Solana Pay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

