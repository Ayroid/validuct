'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/lib/api/comments';
import { Button } from './ui/button';
import Image from 'next/image';
import { CommentItemProps } from '@/types';

export default function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = session?.user?.id === comment.userId;
  const maxDepth = 3; // Limit nesting depth

  const handleEdit = () => {
    if (editedContent.trim() && editedContent !== comment.content) {
      onEdit?.(comment.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'} border-l-2 border-gray-200 pl-4`}>
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="shrink-0">
          {comment.user.profilePicture ? (
            <Image
              src={comment.user.profilePicture}
              alt={comment.user.username}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
              {comment.user.username[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* User Info and Timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {comment.user.username}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {/* Comment Text or Edit Form */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleEdit} size="sm">
                  Save
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
              {comment.content}
            </p>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2">
              {session && depth < maxDepth && (
                <button
                  onClick={() => onReply?.(comment.id)}
                  className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this comment?')) {
                        onDelete?.(comment.id);
                      }
                    }}
                    className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 mb-2"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length}{' '}
                  {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
              {showReplies &&
                comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    depth={depth + 1}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
