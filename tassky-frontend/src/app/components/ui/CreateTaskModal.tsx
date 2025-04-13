// import { TaskType } from '@/app/board/page';
import { teamsApi } from '@/utils/api';
import React, { useState, useEffect } from 'react';

// Adjust path as needed

export type TaskType = {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  // status: 'UNASSIGNED' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdBy: {
    id: string;
    username: string;
  };
  teamId: string;
};

interface TeamMember {
  id: string;
  user: {
    id: string;
    username: string;
  };
}

interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (
    task: Omit<TaskType, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => void;
  teamId: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  onClose,
  onSubmit,
  teamId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskType['priority']>('LOW');
  const [assignedToId, setAssignedToId] = useState<string | undefined>(
    undefined
  );
  const [deadline, setDeadline] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const team = await teamsApi.getTeamWithMembers(teamId);
        setTeamMembers(team.members);
      } catch (err) {
        console.error('Failed to fetch team members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, [teamId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title,
      description: description || undefined,
      priority,
      assignedToId: assignedToId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      teamId,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50 -z-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as TaskType['priority'])
              }
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!title.trim() || isLoading}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
