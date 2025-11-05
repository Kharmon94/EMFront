'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiVideo, FiCalendar, FiLock } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Navigation from '@/components/Navigation';

export default function CreateLivestreamPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    token_gate_amount: 0,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    setCreating(true);
    try {
      const response = await api.createLivestream(formData);
      
      toast.success('Livestream created successfully!');
      router.push(`/artist/livestreams/${response.livestream.id}`);
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.error || 'Failed to create livestream');
    }
    setCreating(false);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FiVideo className="w-8 h-8 text-purple-500" />
              Create Livestream
            </h1>
            <p className="text-gray-400">
              Set up your livestream and get RTMP credentials for OBS
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Basic Info */}
            <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Stream Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stream Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Live Studio Session, Q&A with Fans"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell your fans what to expect..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    Scheduled Start Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to start streaming immediately
                  </p>
                </div>
              </div>
            </section>

            {/* Access Control */}
            <section className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <FiLock className="w-5 h-5" />
                Access Control
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Token-gate your stream (optional)
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Required Token Amount (0 = Free for all)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  value={formData.token_gate_amount}
                  onChange={(e) => setFormData({ ...formData, token_gate_amount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Viewers must hold this many of your artist tokens to watch
                </p>
              </div>
            </section>

            {/* Info Box */}
            <div className="p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">📡 What happens next?</h3>
              <ul className="text-sm text-blue-200 space-y-1 list-disc list-inside">
                <li>You'll receive RTMP credentials (URL + Stream Key)</li>
                <li>Configure OBS with these credentials</li>
                <li>Start streaming - fans can watch in real-time</li>
                <li>Stream latency: ~10-15 seconds (standard HLS)</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={creating || !formData.title}
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FiVideo className="w-5 h-5" />
                  Create Livestream & Get RTMP Credentials
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

