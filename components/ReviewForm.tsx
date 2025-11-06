'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiStar } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  merchItemId: number;
  orderId?: number;
  onSuccess?: () => void;
}

export function ReviewForm({ merchItemId, orderId, onSuccess }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.post('/reviews', { review: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['merch'] });
      toast.success('Review submitted successfully');
      setRating(0);
      setTitle('');
      setContent('');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    submitMutation.mutate({
      merch_item_id: merchItemId,
      order_id: orderId,
      rating,
      title,
      content
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Write a Review</h3>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Your Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <FiStar
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Review Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Your Review *
        </label>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell us what you think about this product"
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={submitMutation.isPending || rating === 0}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

