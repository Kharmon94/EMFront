'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiBellOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface PreSaveButtonProps {
  contentType: 'Album' | 'Track';
  contentId: number;
  title: string;
  releaseDate: string;
  compact?: boolean;
}

export function PreSaveButton({ contentType, contentId, title, releaseDate, compact = false }: PreSaveButtonProps) {
  const { user } = useAuth();
  const [preSaved, setPreSaved] = useState(false);
  const [preSaveId, setPreSaveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (user) {
      checkPreSaveStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [user, contentId, contentType]);

  const checkPreSaveStatus = async () => {
    try {
      const response = await api.get('/pre_saves');
      const existingPreSave = response.data.pre_saves.find(
        (ps: any) => ps.pre_saveable_type === contentType && ps.pre_saveable_id === contentId
      );
      
      if (existingPreSave) {
        setPreSaved(true);
        setPreSaveId(existingPreSave.id);
      }
    } catch (error) {
      console.error('Failed to check pre-save status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePreSave = async () => {
    if (!user) {
      toast.error('Please sign in to pre-save');
      return;
    }

    setLoading(true);
    try {
      if (preSaved && preSaveId) {
        // Remove pre-save
        await api.delete(`/pre_saves/${preSaveId}`);
        setPreSaved(false);
        setPreSaveId(null);
        toast.success('Pre-save removed');
      } else {
        // Create pre-save
        const response = await api.post('/pre_saves', {
          pre_save: {
            pre_saveable_type: contentType,
            pre_saveable_id: contentId,
            release_date: releaseDate
          }
        });
        
        setPreSaved(true);
        setPreSaveId(response.data.pre_save.id);
        toast.success(`You'll be notified when "${title}" is released!`);
      }
    } catch (error: any) {
      console.error('Pre-save action failed:', error);
      toast.error(error.response?.data?.errors?.[0] || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <button
        disabled
        className={`${
          compact
            ? 'px-3 py-1.5 text-sm'
            : 'px-6 py-3'
        } bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 rounded-lg font-semibold flex items-center gap-2 transition-colors`}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        {!compact && 'Checking...'}
      </button>
    );
  }

  return (
    <button
      onClick={handlePreSave}
      disabled={loading}
      className={`${
        compact
          ? 'px-3 py-1.5 text-sm'
          : 'px-6 py-3'
      } ${
        preSaved
          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
          : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800'
      } disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {!compact && 'Processing...'}
        </>
      ) : preSaved ? (
        <>
          <FiBellOff className="w-4 h-4" />
          {!compact && 'Pre-Saved'}
        </>
      ) : (
        <>
          <FiBell className="w-4 h-4" />
          {!compact && 'Pre-Save'}
        </>
      )}
    </button>
  );
}

