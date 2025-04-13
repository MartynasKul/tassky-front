// DEPRECATED NEED DELETE

/* 'use client';

// import { KanbanTask } from './page';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { tasksApi } from '@/utils/api';
import { format } from 'date-fns';
import { Calendar, Loader2, MessageSquare, Send, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TaskModalProps {
  // task: KanbanTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (updatedTask: KanbanTask) => void;
  teamMembers: any[];
  onTaskDelete?: (taskId: string) => void;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export const TaskModal: React.FC<TaskModalProps> = ({
  // task,
  open,
  onOpenChange,
  onTaskUpdate,
  teamMembers,
  onTaskDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [editedTask, setEditedTask] = useState<KanbanTask | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });

      // Load comments when task changes
      if (open) {
        loadComments();
      }
    }
  }, [task, open]);

  const loadComments = async () => {
    if (!task) return;

    try {
      setIsLoadingComments(true);
      const commentsData = await tasksApi.getTaskComments(task.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSaveTask = async () => {
    if (!editedTask) return;

    try {
      setIsSaving(true);

      // Handle task update
      const updatedTask = await tasksApi.updateTask(editedTask.id, {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        assignedToId: editedTask.assignedToId,
        deadline: editedTask.deadline,
      });

      onTaskUpdate(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      setIsDeleting(true);
      await tasksApi.deleteTask(task.id);
      if (onTaskDelete) {
        onTaskDelete(task.id);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendComment = async () => {
    if (!task || !newComment.trim()) return;

    try {
      setIsSendingComment(true);
      await tasksApi.addTaskComment(task.id, newComment);
      setNewComment('');
      loadComments(); // Reload comments after adding a new one
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!task) return;

    try {
      setIsSaving(true);
      const updatedTask = await tasksApi.updateTaskStatus(task.id, status);
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500 hover:bg-red-600';
      case 'HIGH':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'MEDIUM':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'LOW':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'UNASSIGNED':
        return 'bg-purple-400 hover:bg-purple-500';
      case 'IN_PROGRESS':
        return 'bg-amber-400 hover:bg-amber-500';
      case 'TESTING':
        return 'bg-violet-500 hover:bg-violet-600';
      case 'COMPLETED':
        return 'bg-lime-500 hover:bg-lime-600';
      case 'CANCELLED':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  if (!task || !editedTask) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{isEditing ? 'Edit Task' : 'Task Details'}</span>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority || 'MEDIUM'}
              </Badge>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {task.status || 'UNASSIGNED'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {isEditing ? (
              // Edit mode
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedTask.title}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedTask.description || ''}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={editedTask.priority}
                      onValueChange={(value) =>
                        setEditedTask({
                          ...editedTask,
                          priority: value as
                            | 'LOW'
                            | 'MEDIUM'
                            | 'HIGH'
                            | 'URGENT',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assigned To</Label>
                    <Select
                      value={editedTask.assignedToId || ''}
                      onValueChange={(value) =>
                        setEditedTask({
                          ...editedTask,
                          assignedToId: value || undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem
                            key={member.user.id}
                            value={member.user.id}
                          >
                            {member.user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              </div>
            ) : (
              // View mode
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-gray-600 mt-2 whitespace-pre-line">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Assigned to:</span>
                    <span className="font-medium">
                      {task.assignedTo
                        ? task.assignedTo.username
                        : 'Unassigned'}
                    </span>
                  </div>

                  {task.deadline && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Deadline:</span>
                      <span className="font-medium">
                        {format(new Date(task.deadline), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={task.status}
                    onValueChange={handleStatusChange}
                    disabled={isSaving}
                  >
                    <SelectTrigger className={getStatusColor(task.status)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="TESTING">Testing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {isLoadingComments ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatarUrl} />
                      <AvatarFallback>
                        {comment.user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg p-3 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">
                          {comment.user.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No comments yet
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                disabled={isSendingComment}
              />
              <Button
                size="icon"
                onClick={handleSendComment}
                disabled={!newComment.trim() || isSendingComment}
              >
                {isSendingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {onTaskDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                  className="mr-auto"
                >
                  {isDeleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit Task</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
 */
