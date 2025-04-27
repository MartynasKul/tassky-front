'use client';

import { TaskType } from '@/app/board/page';
import { tasksApi, teamsApi } from '@/utils/api';
import React from 'react';

interface TeamMember {
  id: string;
  user: {
    id: string;
    username: string;
  };
}

interface EditTaskModalProps {
  task: TaskType;
  onClose: () => void;
  onUpdate: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  onClose,
  onUpdate,
}) => {
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description || '');
  const [priority, setPriority] = React.useState<TaskType['priority']>(
    task.priority
  );
  const [status, setStatus] = React.useState<TaskType['status']>(task.status);
  const [assignedToId, setAssignedToId] = React.useState<string | undefined>(
    task.assignedToId
  );
  const [deadline, setDeadline] = React.useState<string>(
    task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
  );
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const team = await teamsApi.getTeamWithMembers(task.teamId);
        setTeamMembers(team.members);
      } catch (err) {
        console.error('Failed to fetch team members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [task.teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      if (!assignedToId && status !== task.status) {
        const userData = localStorage.getItem('user');
        if (userData) {
          const currentUser = JSON.parse(userData);
          setAssignedToId(currentUser.id);
        }
      }

      await tasksApi.updateTask(task.id, {
        title,
        description: description || undefined,
        priority,
        status,
        assignedToId: assignedToId,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50 -z-50"
        onClick={onClose}
      ></div>
      <div className="bg-white bg-gradient-to-b from-white to-violet-300 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border-b-4 rounded-xl bg-white trasition duration-300 hover:scale-102"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskType['status'])}
              className="w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102"
            >
              <option value="UNASSIGNED">Unassigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="TESTING">Testing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as TaskType['priority'])
              }
              className="w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <select
              value={assignedToId || ''}
              onChange={(e) => setAssignedToId(e.target.value || undefined)}
              className="w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.username}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2 border-b-4 rounded-xl bg-white transition duration-300 hover:scale-102"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2 bg-red-300 hover:bg-red-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-6 py-2 bg-violet-400 hover:bg-violet-500 text-white font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              disabled={!title.trim() || isLoading}
            >
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
