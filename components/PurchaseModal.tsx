'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FiX, FiShoppingCart, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    type: 'album' | 'track';
    id: number;
    title: string;
    artist: string;
    artistWalletAddress?: string;
    price: number;
    cover_url?: string;
  };
  onSuccess?: () => void;
}

export function PurchaseModal({ isOpen, onClose, item, onSuccess }: PurchaseModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState('');
  const [purchaseData, setPurchaseData] = useState<any>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    // CRITICAL: Validate wallet connection
    if (!publicKey || !signTransaction) {
      setErrorMessage('Please connect your wallet to make a purchase');
      setStep('error');
      return;
    }

    setStep('processing');
    
    try {
      const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(RPC_URL);

      // STEP 1: Create transaction
      const recipientPubkey = item.artistWalletAddress 
        ? new PublicKey(item.artistWalletAddress)
        : new PublicKey('11111111111111111111111111111111'); // Fallback for demo

      const lamports = item.price * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: Math.floor(lamports),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // STEP 2: Sign transaction
      const signedTransaction = await signTransaction(transaction);

      // STEP 3: Send and confirm
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      toast.loading('Confirming transaction...', { id: 'tx-confirm' });
      await connection.confirmTransaction(signature, 'confirmed');
      toast.dismiss('tx-confirm');

      // STEP 4: ONLY NOW call backend to record purchase
      // TODO: Implement backend API call when purchase endpoints are ready
      // const response = await api.purchaseTrack/Album(item.id, { transaction_signature: signature });

      setPurchaseData({ signature, timestamp: new Date() });
      setStep('success');
      toast.success(`${item.type === 'album' ? 'Album' : 'Track'} purchased successfully!`);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        resetModal();
      }, 2000);
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      let message = 'Purchase failed';
      if (error.message?.includes('User rejected')) {
        message = 'Transaction cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        message = 'Insufficient SOL balance';
      }
      
      setErrorMessage(message);
      setStep('error');
      toast.error(message);
    }
  };

  const resetModal = () => {
    setStep('confirm');
    setErrorMessage('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300); // Reset after animation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiShoppingCart className="w-5 h-5" />
            Purchase {item.type === 'album' ? 'Album' : 'Track'}
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
          {/* Item Info */}
          <div className="flex gap-4 mb-6">
            {item.cover_url && (
              <div className="w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={item.cover_url} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{item.title}</h3>
              <p className="text-gray-400 text-sm truncate">{item.artist}</p>
              <p className="text-purple-400 font-bold text-lg mt-1">
                {formatCurrency(item.price)}
              </p>
            </div>
          </div>

          {/* Step Content */}
          {step === 'confirm' && (
            <div>
              {/* Wallet Warning */}
              {!publicKey && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">
                    Please connect your wallet to make a purchase
                  </p>
                </div>
              )}

              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm mb-3">
                  You are about to purchase this {item.type} using Solana Pay.
                </p>
                <ul className="text-gray-400 text-xs space-y-2">
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Instant delivery to your library</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>NFT receipt for proof of ownership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Direct support to the artist</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!publicKey}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {publicKey ? 'Confirm Purchase' : 'Connect Wallet First'}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white font-medium mb-2">Processing Payment...</p>
              <p className="text-gray-400 text-sm">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {step === 'success' && purchaseData && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-white font-semibold text-lg mb-2">Purchase Complete!</p>
                <p className="text-gray-400 text-sm mb-4">
                  Your {item.type} has been added to your library
                </p>
                
                {/* Transaction Details */}
                <div className="bg-gray-800/50 rounded-lg p-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-400">Transaction:</span>
                    <a
                      href={`https://solscan.io/tx/${purchaseData.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 font-mono text-xs truncate max-w-[180px]"
                      title={purchaseData.signature}
                    >
                      {purchaseData.signature?.slice(0, 8)}...{purchaseData.signature?.slice(-8)}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid:</span>
                    <span className="text-white font-semibold">{formatCurrency(item.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-white font-semibold text-lg mb-2">Purchase Failed</p>
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
                    setStep('confirm');
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
        {step === 'confirm' && (
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

