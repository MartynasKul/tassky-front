'use client';

import { TaskType } from '@/app/board/page';
import { Comment } from '@/app/types/types';
import { tasksApi } from '@/utils/api';
import Image from 'next/image';
import React from 'react';

interface TaskDetailsModalProps {
  task: TaskType;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onEdit: (task: TaskType) => void;
}
const priorityColors = {
  LOW: 'bg-blue-100',
  MEDIUM: 'bg-green-100',
  HIGH: 'bg-orange-100',
  URGENT: 'bg-red-100',
};

const statusLabels = {
  UNASSIGNED: 'Unassigned',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  // onUpdate,
  onDelete,
  onEdit,
}) => {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/comments?taskId=${task.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          taskId: task.id,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksApi.deleteTask(task.id);
        onDelete();
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50 -z-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteTask}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium text-gray-700">Status</h3>
            <p>{statusLabels[task.status]}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Priority</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Created By</h3>
            <p>{task.createdBy?.username}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Assigned To</h3>
            {task.assignedTo ? (
              <div className="flex items-center">
                {task.assignedTo.avatarUrl ? (
                  <Image
                    src={task?.assignedTo.avatarUrl}
                    alt={task?.assignedTo.username}
                    width={20}
                    height={20}
                    className="rounded-full mr-1"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-300 mr-1" />
                )}
                <span>{task.assignedTo.username}</span>
              </div>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Created At</h3>
            <p>{new Date(task.createdAt).toLocaleString()}</p>
          </div>
          {task.deadline && (
            <div>
              <h3 className="font-medium text-gray-700">Deadline</h3>
              <p>{new Date(task.deadline).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {task.description && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-700 mb-2">Comments</h3>

          {isLoading ? (
            <p className="text-gray-500">Loading comments...</p>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
              {comments.length === 0 ? (
                <p className="text-gray-500">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-300 mr-2" />
                        <span className="font-medium">
                          {comment.user?.username || 'User'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                        {comment.userId ===
                          JSON.parse(localStorage.getItem('user') || '{}')
                            .id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-gray-600">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          <form
            onSubmit={handleAddComment}
            className="flex items-start space-x-2"
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow p-2 border rounded resize-none"
              rows={2}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
