'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMessageCircle, FiHeart, FiSend, FiTrash2 } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  contentType: string;
  contentId: number;
}

export default function CommentSection({ contentType, contentId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', contentType, contentId],
    queryFn: () => api.getComments(contentType, contentId),
  });

  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: number }) =>
      api.createComment(contentType, contentId, data.content, data.parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', contentType, contentId] });
      setNewComment('');
      setReplyTo(null);
      setReplyContent('');
      toast.success('Comment posted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to post comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => api.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', contentType, contentId] });
      toast.success('Comment deleted');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate({ content: newComment });
  };

  const handleReply = (commentId: number) => {
    if (!replyContent.trim()) return;
    createCommentMutation.mutate({ content: replyContent, parentId: commentId });
  };

  const comments = data?.comments || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white">
        <FiMessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || createCommentMutation.isPending}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg flex items-center gap-2"
        >
          <FiSend className="w-5 h-5" />
          Post
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-gray-400">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(id) => setReplyTo(id)}
              onDelete={(id) => deleteCommentMutation.mutate(id)}
              replyTo={replyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReply={handleReply}
              isReplying={replyTo === comment.id}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiMessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply, onDelete, replyTo, replyContent, setReplyContent, handleReply, isReplying }: any) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {comment.user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{comment.user.username}</span>
              <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-300">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-sm">
            <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
              <FiHeart className="w-4 h-4" />
              <span>{comment.likes_count || 0}</span>
            </button>
            <button
              onClick={() => onReply(comment.id)}
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Reply
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleReply(comment.id)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold"
              >
                Reply
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-700">
              {comment.replies.map((reply: any) => (
                <div key={reply.id} className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {reply.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-900 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{reply.user.username}</span>
                        <span className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-300">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

