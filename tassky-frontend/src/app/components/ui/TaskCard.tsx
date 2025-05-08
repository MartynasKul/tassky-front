'use client';

import { TaskType } from '@/app/board/page';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import React from 'react';

interface TaskCardProps {
  task: TaskType;
  onStatusChange?: () => void;
  onViewDetails: (task: TaskType) => void;
}

const priorityColors = {
  LOW: 'bg-blue-100',
  MEDIUM: 'bg-green-100',
  HIGH: 'bg-orange-100',
  URGENT: 'bg-red-100',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
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

  const handleClick = () => {
    onViewDetails(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-3 bg-white rounded-xl shadow border cursor-pointer hover:shadow-md transition-shadow z-50"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-medium">{task.title}</h3>
        </div>{' '}
        <div
          className="cursor-grab p-1 flex flex-col items-end "
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-gray-400 hover:text-gray-600">🟰</span>

          <span
            className={`text-[10px] px-2 py-[2px] rounded-full whitespace-nowrap space-y-1 ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </div>{' '}
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
    </div>
  );
};

export default TaskCard;
