'use client';

import { useState, useEffect, Fragment } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FiX, FiShoppingCart, FiCheck, FiAlertCircle, FiCalendar, FiMapPin, FiDownload } from 'react-icons/fi';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import api from '@/lib/api';
import { AuthModal } from './AuthModal';
import { ConnectWalletPrompt } from './ConnectWalletPrompt';

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: number;
    title: string;
    venue: string;
    location: string;
    start_time: string;
    artist: {
      name: string;
      avatar_url?: string;
      wallet_address?: string;
    };
  };
  tier: {
    id: number;
    name: string;
    price_sol: number;
    price_usd?: number;
    description?: string;
  };
  onSuccess?: () => void;
}

export function TicketPurchaseModal({ isOpen, onClose, event, tier, onSuccess }: TicketPurchaseModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketData, setTicketData] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check if wallet is connected for blockchain transaction
    if (!publicKey || !signTransaction) {
      setShowWalletPrompt(true);
      return;
    }

    setStep('processing');
    
    try {
      const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(RPC_URL);

      // STEP 1: Create and sign transaction
      const recipientPubkey = event.artist.wallet_address 
        ? new PublicKey(event.artist.wallet_address)
        : new PublicKey('11111111111111111111111111111111'); // Fallback for demo

      const lamports = tier.price_sol * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: Math.floor(lamports),
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // STEP 2: Request wallet signature
      const signedTransaction = await signTransaction(transaction);

      // STEP 3: Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // STEP 4: Confirm transaction
      toast.loading('Confirming transaction...', { id: 'tx-confirm' });
      await connection.confirmTransaction(signature, 'confirmed');
      toast.dismiss('tx-confirm');

      // STEP 5: ONLY NOW call backend to create ticket
      const response = await api.purchaseTicket(event.id, {
        tier_id: tier.id,
        quantity: quantity,
        transaction_signature: signature,
      });

      // STEP 6: Backend returns real ticket with QR code
      if (response.tickets && response.tickets.length > 0) {
        setTicketData(response.tickets[0]); // Use first ticket
        setStep('success');
        toast.success('Ticket purchased successfully!');
        
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      } else {
        throw new Error('No ticket data received from server');
      }
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      let message = 'Purchase failed';
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
    setStep('confirm');
    setErrorMessage('');
    setTicketData(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  const handleDownloadTicket = () => {
    // SECURITY: Only allow download if ticket has real data from backend
    if (!ticketData || !ticketData.qr_code) {
      toast.error('Invalid ticket data');
      return;
    }

    // Get the QR code canvas
    const canvas = document.querySelector('#ticket-qr-code') as HTMLCanvasElement;
    const qrDataUrl = canvas ? canvas.toDataURL() : '';

    // Create a downloadable HTML ticket with verification info
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${event.title} - Ticket #${ticketData.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #f5f5f5; }
          .ticket { border: 2px solid #8B5CF6; padding: 30px; border-radius: 10px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .qr-code { text-align: center; margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          h1 { color: #8B5CF6; margin-bottom: 10px; }
          .details { margin: 20px 0; }
          .details p { margin: 8px 0; color: #333; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .verified { color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h1>🎫 ${event.title}</h1>
          <p class="verified">✓ VERIFIED NFT TICKET</p>
          
          <div class="details">
            <p><strong>Ticket ID:</strong> #${ticketData.id}</p>
            <p><strong>Tier:</strong> ${tier.name}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Date:</strong> ${formatDateTime(event.start_time)}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            ${ticketData.nft_mint ? `<p><strong>NFT Mint:</strong> ${ticketData.nft_mint}</p>` : ''}
          </div>
          
          <div class="qr-code">
            <h3 style="margin-bottom: 15px;">Scan at venue entrance:</h3>
            <img src="${qrDataUrl}" alt="Ticket QR Code" style="max-width: 300px;" />
            <p style="font-size: 12px; color: #666; margin-top: 10px;">QR Code: ${ticketData.qr_code}</p>
          </div>

          <div class="footer">
            <p>This ticket is secured on the Solana blockchain as an NFT.</p>
            <p>Ticket purchased by: ${publicKey?.toString().slice(0, 8)}...${publicKey?.toString().slice(-8)}</p>
            <p>⚠️ Do not share this QR code. It can only be used once.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([ticketHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticketData.id}-${event.title.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Ticket downloaded!');
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiShoppingCart className="w-5 h-5" />
            {step === 'success' ? 'Your Ticket' : 'Purchase Ticket'}
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
          {/* Event Info */}
          <div className="mb-6 pb-6 border-b border-gray-800">
            <div className="flex items-start gap-3 mb-4">
              {event.artist.avatar_url && (
                <img 
                  src={event.artist.avatar_url} 
                  alt={event.artist.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg truncate">{event.title}</h3>
                <p className="text-gray-400 text-sm">{event.artist.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <FiCalendar className="w-4 h-4 text-gray-400" />
                {formatDateTime(event.start_time)}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                {event.venue}, {event.location}
              </div>
            </div>
          </div>

          {/* Ticket Tier Info */}
          {step === 'confirm' && (
            <div className="mb-6">
              {/* Wallet Warning */}
              {!publicKey && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-200 text-sm">
                    Please connect your wallet to purchase tickets
                  </p>
                </div>
              )}

              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-semibold">{tier.name}</h4>
                    {tier.description && (
                      <p className="text-gray-400 text-sm mt-1">{tier.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold text-xl">
                      {formatCurrency(tier.price_sol * quantity)} SOL
                    </p>
                    {tier.price_usd && (
                      <p className="text-gray-500 text-sm">${(tier.price_usd * quantity).toFixed(2)} USD</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="text-white font-semibold text-lg w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-gray-300 text-sm mb-3">What you'll get:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">NFT ticket minted on Solana</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">QR code for event entry</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Transferable & resellable</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Collectible memorabilia</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          {step === 'confirm' && (
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

          {step === 'success' && ticketData && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-white font-semibold text-lg mb-2">Ticket Purchased!</p>
                <p className="text-gray-400 text-sm">
                  Your NFT ticket has been minted and sent to your wallet
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                {ticketData && (
                  <QRCodeCanvas
                    id="ticket-qr-code"
                    value={ticketData.qr_code}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>

              {/* Ticket Details */}
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ticket ID:</span>
                  <span className="text-white font-mono">#{ticketData.id}</span>
                </div>
                {ticketData.nft_mint && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">NFT Mint:</span>
                    <span className="text-white font-mono text-xs truncate max-w-[200px]" title={ticketData.nft_mint}>
                      {ticketData.nft_mint}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid:</span>
                  <span className="text-white font-semibold">{formatCurrency(tier.price_sol * quantity)} SOL</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-green-300">
                    <p className="font-semibold mb-1">Payment Verified</p>
                    <p className="text-green-400/80">Your ticket is secured on the Solana blockchain and cannot be counterfeited.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadTicket}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiDownload className="w-5 h-5" />
                  Download Ticket
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Done
                </button>
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
              Secure payment powered by Solana • NFT minted with Metaplex
            </p>
          </div>
        )}
      </div>
    </div>
    
    {/* Auth & Wallet Prompts */}
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      defaultMode="signup"
      onSuccess={async () => {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }}
    />
    
    <ConnectWalletPrompt
      isOpen={showWalletPrompt}
      onClose={() => setShowWalletPrompt(false)}
      actionName="purchase this ticket"
      onConnected={() => {
        setShowWalletPrompt(false);
        // Wallet is now connected, user can retry purchase
        toast.success('Wallet connected! You can now purchase tickets.');
      }}
    />
    </>
  );
}

