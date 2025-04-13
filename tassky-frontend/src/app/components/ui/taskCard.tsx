import { TaskType } from '@/app/board/page';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import React from 'react';

interface TaskCardProps {
  task: TaskType;
  onStatusChange?: () => void;
}

const priorityColors = {
  LOW: 'bg-blue-100',
  MEDIUM: 'bg-green-100',
  HIGH: 'bg-orange-100',
  URGENT: 'bg-red-100',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: {
      task,
      status: task.status,
    },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-white rounded shadow border cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{task.title}</h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        {task.deadline && (
          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
        )}

        {task.assignedTo ? (
          <div className="flex items-center">
            {task.assignedTo.avatarUrl ? (
              <Image
                src={task.assignedTo.avatarUrl}
                alt={task.assignedTo.username}
                className="w-5 h-5 rounded-full mr-1"
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
    </div>
  );
};

export default TaskCard;
