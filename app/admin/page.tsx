'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navigation } from '@/components/Navigation';
import { FiCheckCircle, FiAlertTriangle, FiUsers, FiFlag, FiShield } from 'react-icons/fi';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'verification' | 'reports' | 'fraud'>('verification');

  // Check if user is admin (in production, verify on backend)
  // const isAdmin = useQuery(['user', 'role'], ...).data?.role === 'admin';

  const { data: reportsData } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/reports?status=pending`);
      return response.json();
    },
  });

  const { data: verificationsData } = useQuery({
    queryKey: ['admin', 'verifications'],
    queryFn: async () => {
      // Mock data - in production, fetch from API
      return {
        verification_requests: [
          {
            id: 1,
            artist: { id: 1, name: 'Rising Artist', followers: 150, streams: 2500 },
            score: 85,
            status: 'pending',
            submitted_at: new Date().toISOString(),
          },
        ],
      };
    },
  });

  const approveVerification = async (artistId: number) => {
    try {
      toast.loading('Approving verification...');
      // TODO: Call API to approve
      toast.dismiss();
      toast.success('Artist verified!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to verify artist');
    }
  };

  const rejectVerification = async (artistId: number) => {
    try {
      toast.loading('Rejecting verification...');
      // TODO: Call API to reject
      toast.dismiss();
      toast.success('Verification rejected');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to reject');
    }
  };

  const resolveReport = async (reportId: number, action: string) => {
    try {
      toast.loading('Resolving report...');
      // TODO: Call API to resolve report with action
      toast.dismiss();
      toast.success('Report resolved');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to resolve report');
    }
  };

  if (!publicKey) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <FiShield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Please connect your wallet to access admin panel</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FiShield className="w-10 h-10" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Manage verifications, reports, and fraud detection</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('verification')}
              className={`pb-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'verification'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FiCheckCircle className="inline w-5 h-5 mr-2" />
              Verifications
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FiFlag className="inline w-5 h-5 mr-2" />
              Reports ({reportsData?.reports?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('fraud')}
              className={`pb-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'fraud'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FiAlertTriangle className="inline w-5 h-5 mr-2" />
              Fraud Detection
            </button>
          </div>

          {/* Verification Requests */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              {(verificationsData?.verification_requests?.length ?? 0) > 0 ? (
                verificationsData.verification_requests.map((request: any) => (
                  <div key={request.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{request.artist.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Followers</div>
                            <div className="text-white font-semibold">{request.artist.followers}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Streams</div>
                            <div className="text-white font-semibold">{request.artist.streams}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Score</div>
                            <div className={`font-semibold ${
                              request.score >= 80 ? 'text-green-500' : 
                              request.score >= 60 ? 'text-yellow-500' : 
                              'text-red-500'
                            }`}>
                              {request.score}/100
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Submitted</div>
                            <div className="text-white font-semibold">
                              {formatRelativeTime(request.submitted_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => rejectVerification(request.artist.id)}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approveVerification(request.artist.id)}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <FiCheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No pending verification requests</p>
                </div>
              )}
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reportsData?.reports?.length > 0 ? (
                reportsData.reports.map((report: any) => (
                  <div key={report.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs font-semibold rounded">
                            {report.reportable_type}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatRelativeTime(report.created_at)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Report #{report.id}
                        </h3>
                        <p className="text-gray-300 mb-3">{report.reason}</p>
                        <div className="text-sm text-gray-400">
                          Reported by: {report.reporter.wallet_address.slice(0, 8)}...
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => resolveReport(report.id, 'no_action')}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => resolveReport(report.id, 'warn_user')}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          Warn
                        </button>
                        <button
                          onClick={() => resolveReport(report.id, 'remove_content')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <FiFlag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No pending reports</p>
                </div>
              )}
            </div>
          )}

          {/* Fraud Detection */}
          {activeTab === 'fraud' && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Fraud Detection System</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="text-green-500 font-bold text-2xl mb-1">Active</div>
                    <div className="text-sm text-gray-400">System Status</div>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="text-yellow-500 font-bold text-2xl mb-1">12</div>
                    <div className="text-sm text-gray-400">Flagged Users (24h)</div>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="text-red-500 font-bold text-2xl mb-1">3</div>
                    <div className="text-sm text-gray-400">Blocked Accounts</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-semibold">Detection Rules:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Stream fraud: Rapid repeats, bot patterns, suspicious durations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Trade fraud: Wash trading, unusual sizes, coordinated activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Ticket fraud: Bulk buying (scalping), multiple failed attempts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Content spam: Excessive uploads, duplicate detection</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

