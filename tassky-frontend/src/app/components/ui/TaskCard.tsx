'use client';

import { TaskType } from '@/app/board/page';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface TaskCardProps {
  task: TaskType;
  onStatusChange?: () => void;
  onViewDetails: (task: TaskType) => void;
  isMobile?: boolean;
  onMobileTaskMove?: (task: TaskType, newStatus: TaskType['status']) => void;
}

const priorityColors = {
  LOW: 'bg-blue-100',
  MEDIUM: 'bg-green-100',
  HIGH: 'bg-orange-100',
  URGENT: 'bg-red-100',
};

// Define status flow for mobile navigation
const statusFlow: TaskType['status'][] = [
  'UNASSIGNED',
  'IN_PROGRESS',
  'TESTING',
  'COMPLETED',
];
const alternativeStatuses: TaskType['status'][] = ['CANCELLED'];

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onViewDetails,
  isMobile = false,
  onMobileTaskMove,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: {
      task,
      status: task.status,
    },
    disabled: isMobile, // Disable dragging on mobile
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleClick = () => {
    onViewDetails(task);
  };

  // Mobile navigation functions
  const getNextStatus = (): TaskType['status'] | null => {
    const currentIndex = statusFlow.indexOf(task.status);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getPrevStatus = (): TaskType['status'] | null => {
    const currentIndex = statusFlow.indexOf(task.status);
    if (currentIndex > 0) {
      return statusFlow[currentIndex - 1];
    }
    return null;
  };

  const canMoveToCompleted = () => task.status === 'TESTING';
  const canMoveToCancelled = () => task.status !== 'CANCELLED';

  const handleMobileMove = (newStatus: TaskType['status']) => {
    if (onMobileTaskMove) {
      onMobileTaskMove(task, newStatus);
    }
  };

  const MobileControls = () => {
    if (!isMobile) return null;

    const nextStatus = getNextStatus();
    const prevStatus = getPrevStatus();

    return (
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center space-x-1">
          {prevStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobileMove(prevStatus);
              }}
              className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              title={`Move back to ${prevStatus
                .replace('_', ' ')
                .toLowerCase()}`}
            >
              <ChevronUp className="h-4 w-4 text-gray-600" />
            </button>
          )}

          {nextStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobileMove(nextStatus);
              }}
              className="p-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
              title={`Move to ${nextStatus.replace('_', ' ').toLowerCase()}`}
            >
              <ChevronDown className="h-4 w-4 text-blue-600" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {canMoveToCompleted() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobileMove('COMPLETED');
              }}
              className="p-1 rounded bg-green-100 hover:bg-green-200 transition-colors"
              title="Mark as completed"
            >
              <Check className="h-4 w-4 text-green-600" />
            </button>
          )}

          {canMoveToCancelled() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMobileMove('CANCELLED');
              }}
              className="p-1 rounded bg-red-100 hover:bg-red-200 transition-colors"
              title="Cancel task"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={isMobile ? undefined : setNodeRef}
      style={isMobile ? undefined : style}
      {...(isMobile ? {} : attributes)}
      className="p-3 bg-white rounded-xl shadow border cursor-pointer hover:shadow-md transition-shadow z-50"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <h3 className="font-medium">{task.title}</h3>
        </div>

        <div className="flex flex-col items-end ml-2">
          {!isMobile && (
            <div
              className="cursor-grab p-1"
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-gray-400 hover:text-gray-600">🟰</span>
            </div>
          )}

          <span
            className={`text-[10px] px-2 py-[2px] rounded-full whitespace-nowrap ${
              priorityColors[task.priority]
            } ${!isMobile ? 'mt-1' : ''}`}
          >
            {task.priority}
          </span>
        </div>
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

      <MobileControls />
    </div>
  );
};

export default TaskCard;
